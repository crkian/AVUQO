import {createHash} from "node:crypto";
import {gunzipSync} from "node:zlib";
import {NextRequest,NextResponse} from "next/server";
import {createAdminClient} from "../../../../lib/supabase/admin";
import {approvedAwinDownloadUrl} from "../../../../lib/awin/approved-feed-url";
import {joinedInSource} from "../../../../lib/awin/joined-catalogue";
import {csvRowsFromChunks} from "../../../../lib/feed-imports/stream-csv";
import {checkedTyreHeader,currentTyreCandidate,rowDictionary,
 TYRES_UK_ADVERTISER,TYRES_UK_FEED,TYRES_UK_IMPORT_ID
} from "../../../../lib/awin/tyres-uk-server-candidates";

/** Cron-only, disabled by default. No browser credentials, products or public offers. */
export const runtime="nodejs";
export const maxDuration=60;
const BUCKET="awin-bulk-private-snapshots";
const MAX_LIST=2_500_000,MAX_GZIP=25*1024*1024,MAX_PLAIN=180*1024*1024;
const BATCH=250,DEADLINE_MS=44_000;
const reply=(payload:unknown,status=200)=>NextResponse.json(payload,{status,
 headers:{"Cache-Control":"private, no-store"}});

async function limitedBytes(response:Response,max:number){
 if(!response.ok)throw Error("upstream_http_error");
 if(!response.body)throw Error("upstream_missing_body");
 const reader=response.body.getReader();const pieces:Uint8Array[]=[];let size=0;
 try{
  for(;;){
   const part=await reader.read();if(part.done)break;
   size+=part.value.byteLength;
   if(size>max)throw Error("upstream_size_limit");
   pieces.push(part.value);
  }
 }finally{await reader.cancel().catch(()=>{});}
 const bytes=new Uint8Array(size);let at=0;
 for(const part of pieces){bytes.set(part,at);at+=part.byteLength;}
 return bytes;
}
async function* csv(text:string,maxColumns=120,maxField=20000){
 yield* csvRowsFromChunks((async function*(){yield text;})(),",",maxColumns,maxField);
}
async function activeTyresUkDownloadUrl(key:string,publisher:string){
 const lists=[
  "https://productdata.awin.com/datafeed/list/apikey/"+encodeURIComponent(key),
  "https://ui.awin.com/productdata-darwin-download/publisher/"+publisher+"/"+encodeURIComponent(key)+"/1/feedList"
 ];
 let found:string|null=null;
 for(const listUrl of lists){
  try{
   const response=await fetch(listUrl,{cache:"no-store",redirect:"error",signal:AbortSignal.timeout(12000)});
   const bytes=await limitedBytes(response,MAX_LIST);
   const text=new TextDecoder("utf-8",{fatal:true}).decode(bytes);
   const rows:string[][]=[];
   for await(const row of csv(text,120,10000)){
    rows.push(row);if(rows.length>5001)throw Error("feed_list_limit");
   }
   const header=rows.shift()?.map(value=>value.trim())??[];
   const keys=["Advertiser ID","Membership Status","Feed ID","Datafeed Format","URL"];
   if(!keys.every(field=>header.includes(field)))throw Error("feed_list_schema");
   const idx=(field:string)=>header.indexOf(field);
   const matches=rows.filter(row=>row.length===header.length&&
    row[idx("Advertiser ID")]?.trim()===TYRES_UK_ADVERTISER&&
    row[idx("Feed ID")]?.trim()===TYRES_UK_FEED&&
    row[idx("Membership Status")]?.trim().toLowerCase()==="active");
   if(matches.length!==1)throw Error("feed_missing_or_ambiguous");
   const row=matches[0];
   if(!/^(awin|standard)$/i.test(row[idx("Datafeed Format")]?.trim()??""))
    throw Error("feed_format_not_supported");
   found=approvedAwinDownloadUrl(row[idx("URL")]??"",key,TYRES_UK_FEED);
   break;
  }catch{ /* Try the other official Awin inventory endpoint. */ }
 }
 if(!found)throw Error("tyres_uk_active_feed_unavailable");
 return found;
}
function expandedSnapshot(compressed:Uint8Array){
 if(compressed.length<2||compressed.length>MAX_GZIP||
   compressed[0]!==0x1f||compressed[1]!==0x8b)throw Error("snapshot_invalid_gzip");
 const plain=gunzipSync(compressed,{maxOutputLength:MAX_PLAIN});
 if(plain.length>MAX_PLAIN)throw Error("snapshot_too_large");
 const contentDigest=createHash("sha256").update(plain).digest("hex");
 const content=new TextDecoder("utf-8",{fatal:true}).decode(plain);
 return {content,contentDigest};
}
async function scanSnapshot(content:string){
 let header:string[]|null=null,rowCount=0;
 const ids=new Set<string>();
 for await(const cells of csv(content)){
  if(!header){header=checkedTyreHeader(cells);continue;}
  const row=rowDictionary(header,cells);
  if(row.merchant_id!==TYRES_UK_ADVERTISER)throw Error("cross_advertiser_snapshot");
  if(!/^[A-Za-z0-9_-]{1,120}$/.test(row.merchant_product_id??"")||
    ids.has(row.merchant_product_id))throw Error("invalid_or_duplicate_source_identity");
  ids.add(row.merchant_product_id);rowCount++;
  if(rowCount>100000)throw Error("snapshot_row_limit");
 }
 if(!header||rowCount<1)throw Error("snapshot_empty");
 return rowCount;
}
type Job={id:string;state:string;source_digest:string;snapshot_object_key:string;
 source_row_count:number;next_row:number;lease_token?:string};
export async function GET(request:NextRequest){
 const started=Date.now();
 const secret=process.env.CRON_SECRET;
 if(!secret||secret.length<16||request.headers.get("authorization")!=="Bearer "+secret)
  return reply({error:"Unauthorized"},401);
 if(process.env.AWIN_TYRE_AUTO_ENRICH_ENABLED!=="true")
  return reply({status:"disabled",required_setting:"AWIN_TYRE_AUTO_ENRICH_ENABLED",
   private_only:true,no_publication:true});
 try{
  const db=createAdminClient();
  const {data:source,error:sourceError}=await db.from("sources")
   .select("metadata,status,sync_enabled").eq("connector_key","awin").maybeSingle();
  if(sourceError||!source||source.status!=="paused"||source.sync_enabled!==false||
   !joinedInSource(source.metadata,TYRES_UK_ADVERTISER))
   return reply({error:"Paused joined Awin source required"},409);
  const {data:run}=await db.from("feed_import_runs")
   .select("id,status,merchant_id,permission_status,total_count")
   .eq("id",TYRES_UK_IMPORT_ID).maybeSingle();
  const {data:session}=await db.from("large_feed_import_sessions")
   .select("completed_at,committed_count").eq("import_id",TYRES_UK_IMPORT_ID).maybeSingle();
  if(!run||!session||run.status!=="private_review"||run.merchant_id!==TYRES_UK_ADVERTISER||
   run.permission_status!=="unverified"||!session.completed_at||
   session.committed_count!==run.total_count)
   return reply({error:"Completed private Tyres UK import required"},409);

  const {data:waiting,error:waitingError}=await db.from("awin_tyres_spec_enrichment_jobs")
   .select("id,state,source_digest,snapshot_object_key,source_row_count,next_row")
   .eq("target_import_id",TYRES_UK_IMPORT_ID)
   .in("state",["queued","running"]).order("created_at",{ascending:true}).limit(1);
  if(waitingError)return reply({error:"Enrichment migration not ready"},503);
  let job:Job|undefined=waiting?.[0] as Job|undefined;
  if(!job){
   const key=process.env.AWIN_DATAFEED_API_KEY??"";
   const publisher=process.env.AWIN_PUBLISHER_ID??"";
   if(!/^[A-Za-z0-9_-]{16,200}$/.test(key)||!/^[0-9]{3,15}$/.test(publisher))
    return reply({error:"Awin server credentials unavailable"},503);
   const url=await activeTyresUkDownloadUrl(key,publisher);
   const response=await fetch(url,{cache:"no-store",redirect:"error",signal:AbortSignal.timeout(25000)});
   const compressed=await limitedBytes(response,MAX_GZIP);
   const {content,contentDigest}=expandedSnapshot(compressed);
   const {data:prior,error:priorError}=await db.from("awin_tyres_spec_enrichment_jobs")
    .select("id,state,source_digest,snapshot_object_key,source_row_count,next_row")
    .eq("target_import_id",TYRES_UK_IMPORT_ID).eq("source_digest",contentDigest).maybeSingle();
   if(priorError)return reply({error:"Snapshot job lookup failed"},503);
   if(prior?.state==="completed")
    return reply({status:"already_processed",private_only:true,no_publication:true});
   if(prior?.state==="failed")
    return reply({status:"requires_owner_review",private_only:true,no_publication:true});
   if(prior)job=prior as Job;
   else{
    const rows=await scanSnapshot(content);
    const path="tyre-spec/12715/93988/"+contentDigest+".csv.gz";
    const {error:uploadError}=await db.storage.from(BUCKET).upload(path,Buffer.from(compressed),
     {contentType:"application/gzip",cacheControl:"private",upsert:false});
    if(uploadError)return reply({error:"Private snapshot could not be stored"},503);
    const {data:created,error:insertError}=await db.from("awin_tyres_spec_enrichment_jobs")
     .insert({target_import_id:TYRES_UK_IMPORT_ID,source_digest:contentDigest,
      snapshot_object_key:path,source_row_count:rows})
     .select("id,state,source_digest,snapshot_object_key,source_row_count,next_row").single();
    if(insertError||!created)return reply({error:"Private snapshot job could not be created"},503);
    job=created as Job;
   }
  }
  if(!job)return reply({error:"No private snapshot job"},503);
  const {data:claimed,error:claimError}=await db.rpc("claim_private_tyres_uk_snapshot_job",
   {p_job_id:job.id});
  if(claimError)return reply({error:"Private snapshot claim failed"},503);
  if(!claimed)return reply({status:"already_running",private_only:true,no_publication:true});
  const lease=claimed as Job;
  const {data:download,error:downloadError}=await db.storage.from(BUCKET)
   .download(lease.snapshot_object_key);
  if(downloadError||!download)return reply({error:"Private snapshot unavailable"},503);
  const compressed=new Uint8Array(await download.arrayBuffer());
  const {content,contentDigest}=expandedSnapshot(compressed);
  if(contentDigest!==lease.source_digest)
   return reply({error:"Immutable snapshot fingerprint mismatch"},409);
  let header:string[]|null=null,rowNumber=0,batchStart=lease.next_row;
  let batch:Record<string,unknown>[]=[],updated=0,eligible=0,scanned=0;
  async function flush(){
   if(rowNumber===batchStart)return;
   const {data,error}=await db.rpc("apply_private_tyres_uk_snapshot_batch",{
    p_job_id:lease.id,p_lease_token:lease.lease_token,
    p_start:batchStart,p_end:rowNumber,p_rows:batch
   });
   if(error)throw Error("private_enrichment_batch_rejected");
   updated+=Number(data?.updated??0);eligible+=Number(data?.eligible??0);
   scanned+=rowNumber-batchStart;batch=[];batchStart=rowNumber;
  }
  for await(const cells of csv(content)){
   if(!header){header=checkedTyreHeader(cells);continue;}
   if(rowNumber<lease.next_row){rowNumber++;continue;}
   const row=rowDictionary(header,cells);
   const candidate=currentTyreCandidate(row);
   if(candidate)batch.push(candidate);
   rowNumber++;
   if(rowNumber-batchStart>=BATCH){
    await flush();
    if(Date.now()-started>DEADLINE_MS)break;
   }
  }
  if(batch.length||rowNumber>batchStart)await flush();
  return reply({status:rowNumber===lease.source_row_count?"completed":"resumable",
   scanned,eligible,updated,source_row_count:lease.source_row_count,
   next_row:rowNumber,private_only:true,no_publication:true,
   historical_prices_unchanged:true});
 }catch{
  // Do not expose feed URLs, credentials, supplier rows or internal SQL details.
  return reply({error:"Private automatic tyre enrichment failed; retry remains safe",
   no_publication:true},503);
 }
}
