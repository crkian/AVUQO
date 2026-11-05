import {createHash} from "node:crypto";
import {NextRequest,NextResponse} from "next/server";
import {createAdminClient} from "../../../../lib/supabase/admin";
import {joinedInSource} from "../../../../lib/awin/joined-catalogue";
import {approvedAwinDownloadUrl} from "../../../../lib/awin/approved-feed-url";
import {csvRowsFromChunks} from "../../../../lib/feed-imports/stream-csv";
import {AWIN_PRIVATE_SNAPSHOT_BUCKET,privateAwinSnapshotKey} from "../../../../lib/awin/private-snapshot";

export const maxDuration=300;
const ADVERTISER="496",FEED="89987";
const MAX_INVENTORY=2_500_000;
// Deliberate initial Vercel RAM ceiling; larger feeds require resumable upload worker.
const MAX_SNAPSHOT=48*1024*1024;
const reply=(body:unknown,status=200)=>NextResponse.json(body,{
 status,headers:{"Cache-Control":"private, no-store"}
});
const digest=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");

async function boundedBytes(response:Response,limit:number){
 if(!response.ok||!response.body)throw Error("upstream_not_available");
 const advertised=Number(response.headers.get("content-length")||0);
 if(advertised>limit)throw Error("download_exceeds_manual_limit");
 const reader=response.body.getReader();
 const chunks:Uint8Array[]=[];
 let total=0;
 try{
  for(;;){
   const {done,value}=await reader.read();
   if(done)break;
   total+=value.byteLength;
   if(total>limit)throw Error("download_exceeds_manual_limit");
   chunks.push(value);
  }
 }finally{await reader.cancel().catch(()=>{});}
 if(total===0)throw Error("empty_download");
 const combined=new Uint8Array(total);
 let at=0;
 for(const part of chunks){combined.set(part,at);at+=part.byteLength;}
 return combined;
}
async function exactActiveFeedUrl(key:string,publisher:string){
 const inventories=[
  `https://ui.awin.com/productdata-darwin-download/publisher/${publisher}/${encodeURIComponent(key)}/1/feedList`,
  `https://productdata.awin.com/datafeed/list/apikey/${encodeURIComponent(key)}`
 ];
 let inventory:{header:string[];rows:string[][]}|null=null;
 for(const url of inventories){
  try{
   const fetched=await fetch(url,{cache:"no-store",redirect:"error",signal:AbortSignal.timeout(12000)});
   const bytes=await boundedBytes(fetched,MAX_INVENTORY);
   const parsed:string[][]=[];
   const decoded=new TextDecoder("utf-8",{fatal:true}).decode(bytes);
   for await(const row of csvRowsFromChunks((async function*(){yield decoded;})())){
    parsed.push(row);
    if(parsed.length>5001)throw Error("inventory_row_limit");
   }
   const header=parsed.shift()?.map(x=>x.trim())??[];
   const required=["Advertiser ID","Feed ID","Membership Status","Datafeed Format","URL"];
   if(new Set(header).size!==header.length||!required.every(x=>header.includes(x)))
    throw Error("invalid_feed_inventory");
   inventory={header,rows:parsed};break;
  }catch{continue;}
 }
 if(!inventory)throw Error("feed_inventory_unavailable");
 const at=(x:string)=>inventory!.header.indexOf(x);
 const matches=inventory.rows.filter(row=>
  row.length===inventory!.header.length&&
  row[at("Advertiser ID")]?.trim()===ADVERTISER&&
  row[at("Feed ID")]?.trim()===FEED&&
  row[at("Membership Status")]?.trim().toLowerCase()==="active"&&
  /^(awin|standard)$/i.test(row[at("Datafeed Format")]?.trim()??""));
 if(matches.length!==1)throw Error("feed_not_uniquely_active");
 return approvedAwinDownloadUrl(matches[0][at("URL")]??"",key,FEED);
}
async function pausedJoined(db:ReturnType<typeof createAdminClient>){
 const {data,error}=await db.from("sources")
  .select("metadata,status,sync_enabled").eq("connector_key","awin").maybeSingle();
 return !error&&!!data&&data.status==="paused"&&data.sync_enabled===false&&
  joinedInSource(data.metadata,ADVERTISER);
}
async function readBackDigest(db:ReturnType<typeof createAdminClient>,objectKey:string){
 const {data,error}=await db.storage.from(AWIN_PRIVATE_SNAPSHOT_BUCKET)
  .createSignedUrl(objectKey,120);
 if(error||!data?.signedUrl)throw Error("snapshot_read_unavailable");
 const origin=new URL(process.env.NEXT_PUBLIC_SUPABASE_URL??"");
 if(origin.protocol!=="https:"||origin.username||origin.password)
  throw Error("unsafe_storage_origin");
 const url=new URL(data.signedUrl,origin);
 if(url.origin!==origin.origin||
    !url.pathname.startsWith("/storage/v1/object/sign/"+AWIN_PRIVATE_SNAPSHOT_BUCKET+"/"))
  throw Error("unsafe_storage_read_url");
 const result=await fetch(url,{cache:"no-store",redirect:"error",
  signal:AbortSignal.timeout(90000)});
 const bytes=await boundedBytes(result,MAX_SNAPSHOT);
 return {sha256:digest(bytes),size:bytes.byteLength};
}

/** Explicit manual-only upload. No scheduler or product-import side effects. */
export async function POST(request:NextRequest){
 const secret=process.env.CRON_SECRET;
 if(!secret||secret.length<16||request.headers.get("authorization")!==`Bearer ${secret}`)
  return reply({error:"Unauthorized"},401);
 if(Number(request.headers.get("content-length")||0)>0)
  return reply({error:"This snapshot action accepts no request body"},400);
 if(new URL(request.url).search)return reply({error:"No feed overrides are supported"},400);
 const key=process.env.AWIN_DATAFEED_API_KEY??"";
 const publisher=process.env.AWIN_PUBLISHER_ID??"";
 if(!/^[A-Za-z0-9_-]{16,200}$/.test(key)||!/^[0-9]{3,15}$/.test(publisher))
  return reply({error:"Awin credentials unavailable"},503);
 const db=createAdminClient();
 if(!await pausedJoined(db))return reply({error:"Joined advertiser must remain paused"},403);
 let objectKey="",sha256="",bytes:Uint8Array;
 try{
  const source=await exactActiveFeedUrl(key,publisher);
  const fetched=await fetch(source,{cache:"no-store",redirect:"error",
   signal:AbortSignal.timeout(150000)});
  bytes=await boundedBytes(fetched,MAX_SNAPSHOT);
  if(bytes[0]!==0x1f||bytes[1]!==0x8b)
   throw Error("expected_gzip_source");
  sha256=digest(bytes);
  objectKey=privateAwinSnapshotKey(ADVERTISER,FEED,sha256,"csv.gz");
 }catch{
  return reply({error:"Bounded Awin snapshot download failed; no upload attempted",
   manual_snapshot_limit_bytes:MAX_SNAPSHOT,private_only:true,no_import:true},422);
 }
 // Recheck immediately before the only persistent operation.
 if(!await pausedJoined(db))
  return reply({error:"Awin source controls changed; upload refused"},409);
 // Never overwrite a content-addressed file. A duplicate upload may race;
 // in either case an independent private Storage read verifies actual bytes.
 const {error:uploadError}=await db.storage.from(AWIN_PRIVATE_SNAPSHOT_BUCKET)
  .upload(objectKey,bytes!,{contentType:"application/gzip",cacheControl:"0",upsert:false});
 try{
  const verified=await readBackDigest(db,objectKey);
  if(verified.sha256!==sha256||verified.size!==bytes!.byteLength)
   throw Error("snapshot_integrity_mismatch");
  if(!await pausedJoined(db))
   return reply({error:"Snapshot saved, but source state changed; no validation triggered",
    private_only:true,no_import:true},409);
  return reply({
   status:uploadError?"snapshot_already_present_verified":"private_snapshot_stored_verified",
   advertiser_id:ADVERTISER,feed_id:FEED,
   snapshot_sha256:sha256,compressed_bytes:verified.size,
   private_only:true,no_product_import:true,no_validation_run:true,
   no_bulk_jobs:true,no_publication:true
  });
 }catch{
  return reply({error:"Private upload/read-back not verified; no import or validation started",
   private_only:true,no_import:true,no_publication:true},503);
 }
}
