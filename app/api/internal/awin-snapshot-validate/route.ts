import {NextRequest,NextResponse} from "next/server";
import {createAdminClient} from "../../../../lib/supabase/admin";
import {joinedInSource} from "../../../../lib/awin/joined-catalogue";
import {AWIN_PRIVATE_SNAPSHOT_BUCKET,privateAwinSnapshotKey} from "../../../../lib/awin/private-snapshot";
import {validateTooledUpGzipStream} from "../../../../lib/awin/tooled-up-full-stream-validator";
import {privateTooledUpValidationRow} from "../../../../lib/awin/private-validation-report";

export const runtime="nodejs";
export const maxDuration=300;
const send=(v:unknown,status=200)=>NextResponse.json(v,{status,headers:{"Cache-Control":"private, no-store"}});
const SHA=/^[a-f0-9]{64}$/;
const safeReport=(v:{actual_rows:number;compressed_bytes:number;expanded_bytes:number;critical_issues:number;duplicate_product_ids:number;invalid_price_rows:number;unverified_affiliate_links:number;snapshot_sha256:string})=>({
 snapshot_sha256:v.snapshot_sha256,actual_rows:v.actual_rows,
 compressed_bytes:v.compressed_bytes,expanded_bytes:v.expanded_bytes,
 estimated_chunks:Math.ceil(v.actual_rows/250),critical_issues:v.critical_issues,
 duplicate_product_ids:v.duplicate_product_ids,
 invalid_price_rows:v.invalid_price_rows,
 unverified_affiliate_links:v.unverified_affiliate_links,
 currency_verified:false,rights_verified:false,ready_to_stage:false,
 private_only:true,no_product_import:true,no_publication:true
});
/**
 * Explicit owner-secret action ONLY. Reads a *previously uploaded* immutable
 * Tooled Up snapshot. Downloads the object privately and validates every byte
 * against its content-addressed key before writing aggregate diagnostics.
 * Does not fetch Awin, upload objects, create jobs, stage or publish products.
 */
export async function POST(request:NextRequest){
 const secret=process.env.CRON_SECRET;
 if(!secret||secret.length<16||request.headers.get("authorization")!==`Bearer ${secret}`)
  return send({error:"Unauthorized"},401);
 let digest="";
 try{
  if(Number(request.headers.get("content-length")??0)>2048)
   return send({error:"Invalid request"},400);
  const body=await request.json() as Record<string,unknown>;
  if(Object.keys(body).length!==1||typeof body.snapshot_sha256!=="string"||
      !SHA.test(body.snapshot_sha256))
   return send({error:"Invalid snapshot digest"},400);
  digest=body.snapshot_sha256;
 }catch{return send({error:"Invalid request"},400);}
 const db=createAdminClient();
 const {data:source,error:sourceError}=await db.from("sources")
  .select("metadata,status,sync_enabled").eq("connector_key","awin").maybeSingle();
 if(sourceError||!source||source.status!=="paused"||source.sync_enabled!==false||
    !joinedInSource(source.metadata,"496"))
  return send({error:"Joined advertiser or paused-source check failed"},403);
 const key=privateAwinSnapshotKey("496","89987",digest,"csv.gz");
 const {data:prior,error:priorError}=await db.from("awin_private_snapshot_validations")
  .select("snapshot_sha256,actual_rows,compressed_bytes,expanded_bytes,critical_issues,duplicate_product_ids,invalid_price_rows,unverified_affiliate_links")
  .eq("advertiser_id","496").eq("feed_id","89987").eq("snapshot_sha256",digest).maybeSingle();
 if(priorError)return send({error:"Private validation register unavailable"},503);
 if(prior)return send({status:"already_validated",...safeReport(prior)});
 // Generate a short-lived, private signed read URL only inside the server.
 // Never return, log, persist or redirect to this signed URL.
 const {data:signed,error:signedError}=await db.storage
  .from(AWIN_PRIVATE_SNAPSHOT_BUCKET).createSignedUrl(key,60);
 if(signedError||!signed?.signedUrl)return send({error:"Private snapshot unavailable"},404);
 const base=process.env.NEXT_PUBLIC_SUPABASE_URL??"";
 let readUrl:URL;
 try{
  const origin=new URL(base);
  if(origin.protocol!=="https:"||origin.username||origin.password)throw Error("unsafe_base");
  readUrl=new URL(signed.signedUrl,origin);
  if(readUrl.origin!==origin.origin||
    !readUrl.pathname.startsWith("/storage/v1/object/sign/"+AWIN_PRIVATE_SNAPSHOT_BUCKET+"/"))
   throw Error("unsafe_signed_storage_url");
 }catch{return send({error:"Private storage configuration invalid"},503);}
 try{
  const response=await fetch(readUrl,{cache:"no-store",redirect:"error",signal:AbortSignal.timeout(240000)});
  if(!response.ok||!response.body)return send({error:"Private snapshot read failed"},502);
  if(Number(response.headers.get("content-length")??0)>250*1024*1024)
   return send({error:"Private snapshot exceeds permitted size"},413);
  const result=await validateTooledUpGzipStream(response.body);
  const row=privateTooledUpValidationRow(result,key);
  if(row.snapshot_sha256!==digest)throw Error("snapshot_fingerprint_mismatch");
  // Recheck membership and pause state after potentially lengthy validation.
  const {data:current,error:currentError}=await db.from("sources")
   .select("metadata,status,sync_enabled").eq("connector_key","awin").maybeSingle();
  if(currentError||!current||current.status!=="paused"||current.sync_enabled!==false||
     !joinedInSource(current.metadata,"496"))
   return send({error:"Source safety status changed; no audit saved"},409);
  const {error:insertError}=await db.from("awin_private_snapshot_validations").insert(row);
  if(insertError){
   if(insertError.code==="23505")return send({status:"already_validated",...safeReport(result)});
   return send({error:"Private validation audit insert failed"},503);
  }
  return send({status:"private_validation_recorded",...safeReport(result),
   inventory_count_matches:result.inventory_count_matches,
   out_of_stock_rows:result.out_of_stock_rows,
   no_snapshot_upload:true,no_database_product_writes:true});
 }catch{
  return send({error:"Snapshot failed private integrity/format validation; nothing recorded",
   private_only:true,no_product_import:true,no_publication:true},422);
 }
}
