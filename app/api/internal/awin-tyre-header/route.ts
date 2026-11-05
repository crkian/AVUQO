import {NextRequest,NextResponse} from "next/server";
import {createAdminClient} from "../../../../lib/supabase/admin";
import {joinedInSource} from "../../../../lib/awin/joined-catalogue";
import {approvedAwinDownloadUrl} from "../../../../lib/awin/approved-feed-url";
import {csvRowsFromChunks} from "../../../../lib/feed-imports/stream-csv";
import {inspectAwinHeaderOnly} from "../../../../lib/awin/read-only-header-probe";
import {exactTyreFeed,inspectTyreHeader} from "../../../../lib/awin/tyre-feed-contract";

const send=(body:unknown,status=200)=>NextResponse.json(body,{status,
 headers:{"Cache-Control":"private, no-store"}});
const MAX_INVENTORY_BYTES=2_500_000;
async function inventory(key:string,publisher:string){
 const urls=[
  `https://ui.awin.com/productdata-darwin-download/publisher/${publisher}/${encodeURIComponent(key)}/1/feedList`,
  `https://productdata.awin.com/datafeed/list/apikey/${encodeURIComponent(key)}`
 ];
 for(const url of urls){
  try{
   const res=await fetch(url,{cache:"no-store",redirect:"error",
    signal:AbortSignal.timeout(12000)});
   if(!res.ok||!res.body)continue;
   const reader=res.body.getReader();let size=0;const chunks:Uint8Array[]=[];
   try{
    for(;;){
     const {value,done}=await reader.read();
     if(done)break;
     size+=value.byteLength;
     if(size>MAX_INVENTORY_BYTES)throw Error("inventory_too_large");
     chunks.push(value);
    }
   }finally{await reader.cancel().catch(()=>{});}
   const bytes=new Uint8Array(size);let at=0;
   for(const chunk of chunks){bytes.set(chunk,at);at+=chunk.byteLength;}
   const parsed:string[][]=[];
   for await(const row of csvRowsFromChunks(
    (async function*(){yield new TextDecoder("utf-8",{fatal:true}).decode(bytes);})()
   )){
    parsed.push(row);if(parsed.length>5001)throw Error("inventory_row_limit");
   }
   const header=parsed.shift()?.map(x=>x.trim())??[];
   const required=["Advertiser ID","Feed ID","Membership Status","Datafeed Format","URL"];
   if(new Set(header).size!==header.length||
      !required.every(name=>header.includes(name)))continue;
   return {header,rows:parsed};
  }catch{continue;}
 }
 throw Error("inventory_unavailable");
}
/** One read-only authenticated inspection, absolutely no product import. */
export async function POST(request:NextRequest){
 const secret=process.env.CRON_SECRET;
 if(!secret||secret.length<16||request.headers.get("authorization")!==`Bearer ${secret}`)
  return send({error:"Unauthorized"},401);
 const args=new URL(request.url).searchParams;
 if([...args.keys()].some(x=>!["advertiser_id","feed_id"].includes(x)))
  return send({error:"Unexpected parameter"},400);
 const advertiser=args.get("advertiser_id")??"";
 const feed=args.get("feed_id")??"";
 const configured=exactTyreFeed(advertiser,feed);
 if(!configured)return send({error:"Unsupported tyre feed"},400);
 const db=createAdminClient();
 const {data:source,error}=await db.from("sources")
  .select("metadata,status,sync_enabled").eq("connector_key","awin").maybeSingle();
 if(error||!source||source.status!=="paused"||source.sync_enabled!==false||
    !joinedInSource(source.metadata,advertiser))
  return send({error:"Awin source must remain paused and retailer joined"},403);
 const key=process.env.AWIN_DATAFEED_API_KEY??"";
 const publisher=process.env.AWIN_PUBLISHER_ID??"";
 if(!/^[A-Za-z0-9_-]{16,200}$/.test(key)||!/^[0-9]{3,15}$/.test(publisher))
  return send({error:"Awin feed credentials unavailable"},503);
 try{
  const {header,rows}=await inventory(key,publisher);
  const at=(name:string)=>header.indexOf(name);
  const selected=rows.filter(row=>row.length===header.length&&
   row[at("Advertiser ID")]?.trim()===advertiser&&
   row[at("Feed ID")]?.trim()===feed&&
   row[at("Membership Status")]?.trim().toLowerCase()==="active"&&
   /^(awin|standard)$/i.test(row[at("Datafeed Format")]?.trim()??""));
  if(selected.length!==1)return send({error:"Tyre feed not uniquely active"},409);
  const url=approvedAwinDownloadUrl(selected[0][at("URL")]??"",key,feed);
  const res=await fetch(url,{cache:"no-store",redirect:"error",
   signal:AbortSignal.timeout(20000)});
  const inspected=await inspectAwinHeaderOnly(res);
  const classification=inspectTyreHeader(inspected.safe_header_names,advertiser,feed);
  return send({...classification,
   detected_delimiter:inspected.detected_delimiter,
   compressed:inspected.compressed,
   inventory_estimate:configured.listed_rows,
   inventory_estimate_not_current:true});
 }catch{
  return send({error:"Read-only tyre feed header inspection failed",
   private_only:true,no_database_writes:true,no_publication:true},422);
 }
}
