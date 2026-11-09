import {createHash} from "node:crypto";
import {gzipSync,gunzipSync} from "node:zlib";
import {NextRequest,NextResponse} from "next/server";
import {createAdminClient} from "../../../../lib/supabase/admin";
import {approvedAwinDownloadUrl} from "../../../../lib/awin/approved-feed-url";
import {identifyFormat,prepareGeneralBatch} from "../../../../lib/feed-imports/general-awin-large";
import {csvRowsFromChunks} from "../../../../lib/feed-imports/stream-csv";
import {PNEUS_ADVERTISER_ID,PNEUS_FEED_ID,PNEUS_NAME,PNEUS_PRIVATE_BUCKET,
 PNEUS_MAX_DOWNLOADED,PNEUS_MAX_EXPANDED,PNEUS_MAX_ROWS,PNEUS_BATCH_SIZE,
 pneusPrivateSourceGate,locatePneusFeed,validatePneusIdentity,pneusPrivateObjectKey
} from "../../../../lib/awin/pneus-online-private";

/**
 * Disabled-by-default, private-only Awin feed worker.
 * Uses a snapshot and the existing leased 250-row bulk journal.
 * Never publishes, updates a historical price, activates a source or returns feed rows.
 */
export const maxDuration=60;
const MAX_LIST_BYTES=2_500_000,DEADLINE_MS=42_000,MAX_INVENTORY_ROWS=5000;
const response=(body:unknown,status=200)=>NextResponse.json(body,{status,
 headers:{"Cache-Control":"private,no-store"}});
const sha=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
async function readBounded(res:Response,limit:number){
 if(!res.ok)throw Error("upstream_http");
 if(!res.body)throw Error("upstream_empty");
 const reader=res.body.getReader(),chunks:Uint8Array[]=[];
 let count=0;
 try{
  for(;;){
   const next=await reader.read();if(next.done)break;
   count+=next.value.byteLength;
   if(count>limit)throw Error("upstream_too_large");
   chunks.push(next.value);
  }
 }finally{await reader.cancel().catch(()=>{});}
 const combined=new Uint8Array(count);let offset=0;
 for(const chunk of chunks){combined.set(chunk,offset);offset+=chunk.length;}
 return combined;
}
async function* parse(text:string,delimiter=",",columns=120){
 yield* csvRowsFromChunks((async function*(){yield text;})(),delimiter,columns,10000);
}
async function inventory(key:string,publisher:string){
 const urls=[
  "https://ui.awin.com/productdata-darwin-download/publisher/"+publisher+"/"+encodeURIComponent(key)+"/1/feedList",
  "https://productdata.awin.com/datafeed/list/apikey/"+encodeURIComponent(key)
 ];
 for(const url of urls){
  try{
   const res=await fetch(url,{cache:"no-store",redirect:"error",
    signal:AbortSignal.timeout(12000)});
   const bytes=await readBounded(res,MAX_LIST_BYTES);
   const content=new TextDecoder("utf-8",{fatal:true}).decode(bytes);
   const parsed:string[][]=[];
   for await(const row of parse(content)){
    parsed.push(row);
    if(parsed.length>MAX_INVENTORY_ROWS+1)throw Error("inventory_limit");
   }
   const header=parsed.shift()?.map(v=>v.trim())??[];
   const rawUrl=locatePneusFeed(header,parsed);
   return approvedAwinDownloadUrl(rawUrl,key,PNEUS_FEED_ID);
  }catch{/* only fixed, approved Awin endpoints; fail closed after both */ }
 }
 throw Error("active_feed_not_verified");
}
function expand(bytes:Uint8Array){
 if(bytes.length<2||bytes.length>PNEUS_MAX_DOWNLOADED)throw Error("feed_size_limit");
 const compressed=bytes[0]===0x1f&&bytes[1]===0x8b;
 const plain=compressed?gunzipSync(bytes,{maxOutputLength:PNEUS_MAX_EXPANDED}):bytes;
 if(plain.length>PNEUS_MAX_EXPANDED)throw Error("feed_expanded_limit");
 return {plain,compressed:compressed?bytes:gzipSync(plain),digest:sha(plain)};
}
function csvText(bytes:Uint8Array){
 return new TextDecoder("utf-8",{fatal:true}).decode(bytes);
}
function delimiterOf(text:string){
 const line=text.slice(0,15000).split("\n",1)[0]??"";
 return line.includes("\t")?"\t":",";
}
async function inspect(text:string){
 const delimiter=delimiterOf(text),seen=new Set<string>();
 let header:string[]|null=null,count=0,review=0,excluded=0;
 let batch:string[][]=[];
 async function validate(){
  if(!header||!batch.length)return;
  const mapped=prepareGeneralBatch(PNEUS_ADVERTISER_ID,PNEUS_FEED_ID,header,batch);
  review+=mapped.filter(x=>x.status==="review").length;
  excluded+=mapped.length-mapped.filter(x=>x.status==="review").length;
  batch=[];
 }
 for await(const cells of parse(text,delimiter)){
  if(!header){
   header=cells.map(x=>x.trim());
   if(identifyFormat(header)!=="awin-csv")throw Error("format_not_supported");
   continue;
  }
  validatePneusIdentity(header,cells,seen);
  batch.push(cells);count++;
  if(count>PNEUS_MAX_ROWS)throw Error("feed_row_limit");
  if(batch.length===PNEUS_BATCH_SIZE)await validate();
 }
 await validate();
 if(!header||count<1||review<1)throw Error("no_eligible_private_rows");
 return {count,review,excluded};
}
type Job={id:string;state:string;private_import_id:string;validated_total:number;
 snapshot_sha256:string;snapshot_object_key:string;next_sequence:number;committed_rows:number;
 lease_expires_at:string|null};
type Admin=ReturnType<typeof createAdminClient>;
async function readySource(db:Admin){
 const {data,error}=await db.from("sources").select("metadata,status,sync_enabled")
  .eq("connector_key","awin").maybeSingle();
 if(error)throw Error("source_registry_error");
 return pneusPrivateSourceGate(data);
}
async function stageSnapshot(db:Admin,key:string,publisher:string){
 // Source rights are checked immediately before any remote product download.
 if(await readySource(db)!=="ready")throw Error("permission_not_ready");
 const downloadUrl=await inventory(key,publisher);
 const upstream=await fetch(downloadUrl,{cache:"no-store",redirect:"error",
  signal:AbortSignal.timeout(25000)});
 const downloaded=await readBounded(upstream,PNEUS_MAX_DOWNLOADED);
 const {plain,compressed,digest}=expand(downloaded);
 const text=csvText(plain);
 const stats=await inspect(text);

 const {data:prior,error:priorError}=await db.from("awin_bulk_import_jobs")
  .select("id,state").eq("advertiser_id",PNEUS_ADVERTISER_ID)
  .eq("feed_id",PNEUS_FEED_ID).eq("snapshot_sha256",digest).maybeSingle();
 if(priorError)throw Error("job_lookup_failed");
 if(prior)return {status:prior.state==="completed"?"already_staged":"existing_snapshot",
  job_id:prior.id,records:stats.count};

 const path=pneusPrivateObjectKey(digest);
 const {error:storageError}=await db.storage.from(PNEUS_PRIVATE_BUCKET)
  .upload(path,Buffer.from(compressed),{upsert:false,contentType:"application/gzip"});
 if(storageError){
  if(String(storageError.statusCode)!=="409")throw Error("private_snapshot_store_failed");
  const {data:existing,error}=await db.storage.from(PNEUS_PRIVATE_BUCKET).download(path);
  if(error||!existing)throw Error("private_snapshot_collision_unavailable");
  const existingBytes=new Uint8Array(await existing.arrayBuffer());
  if(expand(existingBytes).digest!==digest)throw Error("private_snapshot_collision_mismatch");
 }

 if(await readySource(db)!=="ready")throw Error("permission_changed_before_import");
 const {data:owners,error:ownerError}=await db.from("user_roles")
  .select("user_id").eq("role","owner").limit(2);
 if(ownerError||!owners||owners.length!==1)throw Error("owner_attribution_unavailable");

 const {data:run,error:runError}=await db.from("feed_import_runs")
  .insert({created_by:owners[0].user_id,merchant_id:PNEUS_ADVERTISER_ID,
   merchant_name:PNEUS_NAME,filename:"GENAWIN__26513__PNEUS_AUTO_"+digest.slice(0,32)+".csv.gz",
   status:"importing",permission_status:"unverified",total_count:0,review_count:0,excluded_count:0})
  .select("id").single();
 if(runError||!run)throw Error("private_run_creation_failed");
 const {error:sessionError}=await db.from("large_feed_import_sessions")
  .insert({import_id:run.id,source_digest:digest});
 if(sessionError){
  await db.from("feed_import_runs").delete().eq("id",run.id);
  throw Error("private_import_session_failed");
 }
 const {data:job,error:jobError}=await db.from("awin_bulk_import_jobs").insert({
  advertiser_id:PNEUS_ADVERTISER_ID,feed_id:PNEUS_FEED_ID,
  state:"snapshot_ready",snapshot_sha256:digest,snapshot_object_key:path,
  observed_rows:stats.count,validated_total:stats.count,
  chunk_size:PNEUS_BATCH_SIZE,private_import_id:run.id
 }).select("id").single();
 if(jobError||!job){
  // Do not leave an orphaned import if competing cron invocations raced.
  await db.from("large_feed_import_sessions").delete().eq("import_id",run.id);
  await db.from("feed_import_runs").delete().eq("id",run.id);
  throw Error("private_bulk_job_creation_failed");
 }
 return {status:"snapshot_ready",job_id:job.id,records:stats.count,review:stats.review,excluded:stats.excluded};
}
async function processSnapshot(db:Admin,job:Job,started:number){
 const {data:lease,error:claimError}=await db.rpc("claim_private_awin_bulk_job",
  {p_job_id:job.id,p_lease_seconds:110});
 if(claimError||!lease)return {status:"already_claimed_or_not_ready",job_id:job.id};
 const token=String(lease.lease_token??"");
 let progress=Number(lease.committed_rows??0);
 let released=false;
 try{
  const {data:blob,error:storageError}=await db.storage.from(PNEUS_PRIVATE_BUCKET)
   .download(job.snapshot_object_key);
  if(storageError||!blob)throw Error("snapshot_unavailable");
  if(blob.size>PNEUS_MAX_DOWNLOADED)throw Error("snapshot_size_limit");
  const bytes=new Uint8Array(await blob.arrayBuffer());
  const {plain,digest}=expand(bytes);
  if(digest!==job.snapshot_sha256)throw Error("snapshot_digest_mismatch");
  const text=csvText(plain),delimiter=delimiterOf(text);
  let header:string[]|null=null,batch:string[][]=[],scanned=0;
  let sequence=Number(lease.next_sequence??0);
  const skip=sequence*PNEUS_BATCH_SIZE;
  async function flush(){
   if(!header||!batch.length)return;
   if(await readySource(db)!=="ready")throw Error("permission_revoked");
   const mapped=prepareGeneralBatch(PNEUS_ADVERTISER_ID,PNEUS_FEED_ID,header,batch);
   const batchDigest=createHash("sha256").update(JSON.stringify({
    headers:header,rows:batch,feedId:PNEUS_FEED_ID})).digest("hex");
   const {data,error}=await db.rpc("append_general_awin_feed_chunk",{
    p_import_id:job.private_import_id,p_sequence:sequence,p_digest:batchDigest,p_rows:mapped
   });
   if(error)throw Error("append_private_batch_failed");
   progress=Number(data?.committed??progress);
   sequence=Number(data?.next_sequence??sequence+1);
   batch=[];
  }
  for await(const cells of parse(text,delimiter)){
   if(!header){header=cells.map(c=>c.trim());if(identifyFormat(header)!=="awin-csv")
     throw Error("snapshot_format_changed");continue;}
   if(cells.length!==header.length)throw Error("snapshot_invalid_columns");
   scanned++;
   if(scanned<=skip)continue;
   batch.push(cells);
   if(batch.length===PNEUS_BATCH_SIZE){
    await flush();
    if(Date.now()-started>DEADLINE_MS)break;
   }
  }
  if(batch.length)await flush();
  if(scanned===job.validated_total){
   if(progress!==job.validated_total)throw Error("snapshot_checkpoint_not_complete");
   const {error}=await db.rpc("finish_general_awin_feed_import",{
    p_import_id:job.private_import_id,p_total:job.validated_total});
   if(error)throw Error("private_import_finish_rejected");
  }
  const {data:checkpoint,error:checkpointError}=await db.rpc("reconcile_private_awin_bulk_job",
   {p_job_id:job.id,p_lease_token:token,p_release:true});
  if(checkpointError)throw Error("checkpoint_reconcile_failed");
  released=true;
  return {status:checkpoint?.state,job_id:job.id,committed:progress,
   total:job.validated_total,private_only:true,no_publication:true};
 }finally{
  if(!released){try{
   await db.rpc("reconcile_private_awin_bulk_job",
    {p_job_id:job.id,p_lease_token:token,p_release:true});
  }catch{/* keep failure non-public, next invocation retries lease safely */}}
 }
}
export async function GET(request:NextRequest){
 const secret=process.env.CRON_SECRET;
 if(!secret||secret.length<16||request.headers.get("authorization")!=="Bearer "+secret)
  return response({error:"Unauthorized"},401);
 if(process.env.AWIN_PNEUS_PRIVATE_IMPORT_ENABLED!=="true")
  return response({status:"disabled",private_only:true,required_setting:"AWIN_PNEUS_PRIVATE_IMPORT_ENABLED"});
 const started=Date.now();
 try{
  const db=createAdminClient();
  const gate=await readySource(db);
  if(gate!=="ready")return response({status:"blocked",reason:gate,
    private_only:true,no_database_writes:true,no_product_downloads:true});
  const {data:pending,error}=await db.from("awin_bulk_import_jobs")
   .select("id,state,private_import_id,validated_total,snapshot_sha256,snapshot_object_key,next_sequence,committed_rows,lease_expires_at")
   .eq("advertiser_id",PNEUS_ADVERTISER_ID).eq("feed_id",PNEUS_FEED_ID)
   .in("state",["snapshot_ready","running","retryable"])
   .order("created_at",{ascending:true}).limit(1);
  if(error)return response({error:"private_job_registry_unavailable"},503);
  if(pending?.[0]){
   const job=pending[0] as Job;
   if(job.state==="running"&&job.lease_expires_at&&new Date(job.lease_expires_at)>new Date())
    return response({status:"already_running",private_only:true});
   const result=await processSnapshot(db,job,started);
   return response(result);
  }
  const key=process.env.AWIN_DATAFEED_API_KEY??"",publisher=process.env.AWIN_PUBLISHER_ID??"";
  if(!/^[A-Za-z0-9_-]{16,200}$/.test(key)||!/^[0-9]{3,15}$/.test(publisher))
   return response({error:"server_feed_credentials_missing"},503);
  const staged=await stageSnapshot(db,key,publisher);
  return response({...staged,private_only:true,no_publication:true});
 }catch{
  return response({error:"private_pneus_import_unavailable",no_publication:true},503);
 }
}
