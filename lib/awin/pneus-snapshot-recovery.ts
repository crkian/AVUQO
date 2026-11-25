import {NextResponse} from "next/server";
import {createAdminClient} from "../supabase/admin";
import {sourceIngestionFailures,evaluateSourceControls} from "../pipeline/source-readiness";
import {pneusPrivateSourceGate,pneusPrivateObjectKey,PNEUS_MAX_DOWNLOADED,PNEUS_PRIVATE_BUCKET} from "../awin/pneus-online-private";
import {replayPneusSnapshot,restorePneusRow,compareLegacyPneusRow} from "../awin/pneus-compact-shadow.mjs";

export const recoveryResponse=(data:Record<string,unknown>,status=200)=>NextResponse.json(
 {...data,private_only:true,no_publication:true,no_database_writes:true},
 {status,headers:{"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
type Admin=ReturnType<typeof createAdminClient>;
const obj=(x:unknown):Record<string,unknown>=>x&&typeof x==="object"&&!Array.isArray(x)?x as Record<string,unknown>:{};
async function permitted(db:Admin){
 const [source,program,controls]=await Promise.all([
  db.from("sources").select("metadata,status,sync_enabled,credential_status,connector_key,source_type").eq("connector_key","awin").maybeSingle(),
  db.from("affiliate_programs").select("metadata,status").eq("provider","awin").eq("region","GB").eq("external_account_id","15236").maybeSingle(),
  db.from("system_controls").select("control_key,enabled").in("control_key",["source_ingestion","global_emergency_stop"])
 ]);
 if(source.error||program.error||controls.error||!source.data||!program.data)return false;
 const s=source.data,p=obj(program.data.metadata);
 const accepted=obj(p.owner_joined_accepted_attestation);
 return evaluateSourceControls(controls.data).ingestion&&p.publication_approved===true&&
  accepted.membership_status==="accepted"&&obj(s.metadata).owner_attested_release_enabled===true&&
  sourceIngestionFailures(s,{advertiserId:"15236"}).length===0&&pneusPrivateSourceGate(s,undefined,true)==="ready";
}

/** Shared fixed-feed read-only archive audit. Caller authenticates first. */
export async function recoverPneusSnapshot(slot:"latest"|"previous"){
 let stage="authorization";
 const began=Date.now();
 try{
  const db=createAdminClient();
  stage="rights";
  if(!await permitted(db))return recoveryResponse({status:"source_rights_or_controls_blocked"},403);
  stage="journal";
  const {data:jobs,error}=await db.from("awin_bulk_import_jobs")
   .select("id,created_at,state,private_import_id,snapshot_sha256,snapshot_object_key,validated_total,committed_rows")
   .eq("advertiser_id","15236").eq("feed_id","26513").eq("state","completed")
   .order("created_at",{ascending:false}).order("id",{ascending:false}).limit(2);
  const job=jobs?.[slot==="latest"?0:1];
  if(error||!job||job.state!=="completed"||!Number.isSafeInteger(job.validated_total)||
   job.validated_total<1||job.validated_total>25000||job.committed_rows!==job.validated_total||
   !/^[a-f0-9]{64}$/.test(job.snapshot_sha256)||job.snapshot_object_key!==pneusPrivateObjectKey(job.snapshot_sha256))
   return recoveryResponse({status:"completed_snapshot_unavailable"},409);
  const [{data:run,error:runError},{data:journal,error:journalError}]=await Promise.all([
   db.from("feed_import_runs").select("id,merchant_id,status,total_count,permission_status")
    .eq("id",job.private_import_id).maybeSingle(),
   db.from("large_feed_import_sessions").select("source_digest,completed_at,committed_count")
    .eq("import_id",job.private_import_id).maybeSingle()
  ]);
  if(runError||journalError||!run||!journal||run.merchant_id!=="15236"||
   run.status!=="private_review"||run.permission_status!=="unverified"||run.total_count!==job.validated_total||
   !journal.completed_at||journal.committed_count!==job.validated_total||journal.source_digest!==job.snapshot_sha256)
   return recoveryResponse({status:"journal_binding_mismatch"},409);
  stage="archive";
  if(!await permitted(db))return recoveryResponse({status:"source_rights_or_controls_blocked"},403);
  const {data:blob,error:storageError}=await db.storage.from(PNEUS_PRIVATE_BUCKET).download(job.snapshot_object_key);
  if(storageError||!blob||blob.size<2||blob.size>PNEUS_MAX_DOWNLOADED)
   return recoveryResponse({status:"archive_unavailable_or_size_limit"},409);
  stage="replay";
  const snapshot=await replayPneusSnapshot({compressed:new Uint8Array(await blob.arrayBuffer()),
   sha256:job.snapshot_sha256,expectedRows:job.validated_total,observedAt:job.created_at});
  stage="legacy_parity";
  const start=Date.now(),seen=new Set<string>();
  let checked=0,matched=0,mismatched=0,missing=0,duplicates=0;
  const pageSize=250;
  for(let offset=0;offset<job.validated_total;offset+=pageSize){
   if(Date.now()-start>150000||Date.now()-began>220000)return recoveryResponse({status:"parity_time_limit",checked},503);
   if(offset%2000===0&&!await permitted(db))return recoveryResponse({status:"source_rights_or_controls_blocked"},403);
   const {data:rows,error:rowsError}=await db.from("feed_import_records")
    .select("merchant_id,merchant_product_id,awin_product_id,title,price,currency,brand,category,status,reasons,image_url,metadata")
    .eq("import_id",job.private_import_id).order("id",{ascending:true})
    .range(offset,offset+pageSize-1);
   if(rowsError||!rows||rows.length!==Math.min(pageSize,job.validated_total-offset))
    return recoveryResponse({status:"legacy_page_incomplete",checked},409);
   for(const row of rows){
    checked++;
    const sku=row.merchant_product_id;
    if(typeof sku!=="string"||seen.has(sku)){duplicates++;continue;}
    seen.add(sku);
    if(!snapshot.members.has(sku)){missing++;continue;}
    if(compareLegacyPneusRow(restorePneusRow(snapshot,sku),row))matched++;else mismatched++;
   }
  }
  const {count,error:countError}=await db.from("feed_import_records").select("id",{count:"exact",head:true}).eq("import_id",job.private_import_id);
  if(countError||count!==job.validated_total)return recoveryResponse({status:"legacy_count_changed",checked},409);
  if(!await permitted(db))return recoveryResponse({status:"source_rights_or_controls_blocked"},403);
  const absent=Array.from(snapshot.members.keys()).filter(sku=>!seen.has(sku)).length;
  const parity=matched===job.validated_total&&!mismatched&&!missing&&!duplicates&&!absent;
  return recoveryResponse({status:parity?"exact_normalized_parity":"normalized_parity_mismatch",
   slot,observed_at:job.created_at,archive_digest_verified:true,archive_rows:snapshot.expectedRows,
   compressed_bytes:blob.size,excluded:snapshot.excluded,unique_content_payloads:snapshot.contents.size,
   unique_observation_payloads:snapshot.observations.size,checked,matched,mismatched,
   legacy_only:missing,duplicate_legacy:duplicates,archive_only:absent,
   retention_authorized:false},parity?200:409);
 }catch{return recoveryResponse({status:"recovery_unavailable",stage},503);}
}
