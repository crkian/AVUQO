import {NextRequest,NextResponse} from "next/server";
import {createAdminClient} from "../../../../lib/supabase/admin";
import {joinedInSource} from "../../../../lib/awin/joined-catalogue";
import {approvedAwinDownloadUrl} from "../../../../lib/awin/approved-feed-url";
import {csvRowsFromChunks} from "../../../../lib/feed-imports/stream-csv";
import {inspectAwinHeaderOnly} from "../../../../lib/awin/read-only-header-probe";
import {inspectTooledUpBoundedSample} from "../../../../lib/awin/tooled-up-sample-probe";

const reply=(body:unknown,status=200)=>NextResponse.json(body,{
 status,headers:{"Cache-Control":"private, no-store"}
});
const ADVERTISER="496",FEED="89987",MAX_LIST=2_500_000;
async function inventory(key:string,publisher:string){
 const sources=[
  `https://ui.awin.com/productdata-darwin-download/publisher/${publisher}/${encodeURIComponent(key)}/1/feedList`,
  `https://productdata.awin.com/datafeed/list/apikey/${encodeURIComponent(key)}`
 ];
 for(const url of sources){
  try{
   const res=await fetch(url,{cache:"no-store",redirect:"error",signal:AbortSignal.timeout(12000)});
   if(!res.ok||!res.body)continue;
   const reader=res.body.getReader();let size=0;const parts:Uint8Array[]=[];
   try{
    for(;;){
     const {done,value}=await reader.read();
     if(done)break;size+=value.byteLength;if(size>MAX_LIST)throw Error("inventory_oversize");
     parts.push(value);
    }
   }finally{await reader.cancel().catch(()=>{});}
   const bytes=new Uint8Array(size);let offset=0;
   for(const part of parts){bytes.set(part,offset);offset+=part.length;}
   const parsed:string[][]=[];
   for await(const row of csvRowsFromChunks(
    (async function*(){yield new TextDecoder("utf-8",{fatal:true}).decode(bytes);})()
   )){parsed.push(row);if(parsed.length>5001)throw Error("inventory_rows");}
   const header=parsed.shift()?.map(x=>x.trim());
   if(!header||new Set(header).size!==header.length)continue;
   const required=["Advertiser ID","Feed ID","Membership Status","Datafeed Format","URL"];
   if(!required.every(x=>header.includes(x)))continue;
   return {header,parsed};
  }catch{continue;}
 }
 throw Error("inventory_unavailable");
}
export async function POST(request:NextRequest){
 const secret=process.env.CRON_SECRET;
 if(!secret||secret.length<16||request.headers.get("authorization")!==`Bearer ${secret}`)
  return reply({error:"Unauthorized"},401);
 const db=createAdminClient();
 const {data:source,error}=await db.from("sources").select("metadata,status,sync_enabled")
  .eq("connector_key","awin").maybeSingle();
 if(error||!source||source.status!=="paused"||source.sync_enabled!==false||
  !joinedInSource(source.metadata,ADVERTISER))
  return reply({error:"Tooled Up not joined or source not paused"},403);
 const key=process.env.AWIN_DATAFEED_API_KEY??"";
 const publisher=process.env.AWIN_PUBLISHER_ID??"";
 if(!/^[A-Za-z0-9_-]{16,200}$/.test(key)||!/^[0-9]{3,15}$/.test(publisher))
  return reply({error:"Awin feed credentials unavailable"},503);
 try{
  const {header,parsed}=await inventory(key,publisher);
  const at=(name:string)=>header.indexOf(name);
  const rows=parsed.filter(row=>row.length===header.length&&
   row[at("Advertiser ID")]?.trim()===ADVERTISER&&
   row[at("Feed ID")]?.trim()===FEED&&
   row[at("Membership Status")]?.trim().toLowerCase()==="active"&&
   /^(awin|standard)$/i.test(row[at("Datafeed Format")]?.trim()??""));
  if(rows.length!==1)return reply({error:"Unique active Tooled Up master feed not found"},409);
  const download=approvedAwinDownloadUrl(rows[0][at("URL")]??"",key,FEED);
  const res=await fetch(download,{cache:"no-store",redirect:"error",signal:AbortSignal.timeout(20000)});
  const sample=new URL(request.url).searchParams.get("mode")==="sample";
  if(sample)return reply(await inspectTooledUpBoundedSample(res));
  const inspected=await inspectAwinHeaderOnly(res);
  return reply({
   status:"header_inspection_only",advertiser_id:ADVERTISER,feed_id:FEED,
   ...inspected,private_only:true,no_product_rows_returned:true,
   no_snapshot_upload:true,no_database_writes:true,no_publication:true
  });
 }catch{
  return reply({error:"Read-only header inspection failed",private_only:true,
   no_database_writes:true,no_publication:true},422);
 }
}
