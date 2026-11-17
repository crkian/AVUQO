import {gunzipSync} from "node:zlib";
import {NextRequest,NextResponse} from "next/server";
import {createAdminClient} from "../../../../lib/supabase/admin";
import {csvRowsFromChunks} from "../../../../lib/feed-imports/stream-csv";
import {approvedAwinDownloadUrl} from "../../../../lib/awin/approved-feed-url";
import {recognizeAwinFeed} from "../../../../lib/awin/feed-recognition";
import {profileAwinHeader} from "../../../../lib/awin/feed-schema-profile.mjs";

export const maxDuration=60;
const MAX_LIST=2_500_000,MAX_DOWNLOAD=3_000_000,MAX_UNPACKED=12_000_000;
const json=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store"}});
async function limited(response:Response,max:number){
 if(!response.ok)throw Error("upstream_http_"+response.status);
 if(!response.body)throw Error("missing_body");
 const chunks:Uint8Array[]=[];let size=0;const reader=response.body.getReader();
 try{while(true){const item=await reader.read();if(item.done)break;
  size+=item.value.length;if(size>max)throw Error("bounded_probe_size_limit");
  chunks.push(item.value);
 }}finally{await reader.cancel().catch(()=>{});}
 const joined=new Uint8Array(size);let at=0;
 for(const chunk of chunks){joined.set(chunk,at);at+=chunk.length;}
 return joined;
}
async function* oneChunk(text:string){yield text;}
async function inventory(key:string,publisher:string){
 const urls=[
  `https://ui.awin.com/productdata-darwin-download/publisher/${publisher}/${encodeURIComponent(key)}/1/feedList`,
  `https://productdata.awin.com/datafeed/list/apikey/${encodeURIComponent(key)}`
 ];
 for(const address of urls){
  try{
   const response=await fetch(address,{cache:"no-store",redirect:"error",signal:AbortSignal.timeout(12000)});
   const text=new TextDecoder("utf-8",{fatal:true}).decode(await limited(response,MAX_LIST));
   const rows:string[][]=[];
   for await(const row of csvRowsFromChunks(oneChunk(text),",",120)){
    rows.push(row);if(rows.length>5001)throw Error("inventory_limit");
   }
   const header=rows.shift()?.map(x=>x.trim())??[];
   if(!["Advertiser ID","Feed ID","Membership Status","Datafeed Format","URL"].every(x=>header.includes(x)))
    throw Error("inventory_header_mismatch");
   return {header,rows};
  }catch{ /* Try next official inventory URL; never return signed data. */ }
 }
 throw Error("inventory_unavailable");
}
function safeCode(error:unknown){
 const message=error instanceof Error?error.message:"";
 if(message==="bounded_probe_size_limit")return "oversized_for_bounded_probe";
 if(message==="inventory_unavailable")return "inventory_unavailable";
 if(["unsafe_feed_url","feed_binding_mismatch","invalid_feed_binding"].includes(message))return "feed_binding_rejected";
 if(/^upstream_http_\d{3}$/.test(message))return message;
 return "probe_unavailable";
}
/** One server-selected accepted feed per invocation; absolutely no product-row writes. */
export async function GET(request:NextRequest){
 const secret=process.env.CRON_SECRET;
 if(!secret||secret.length<16||request.headers.get("authorization")!==`Bearer ${secret}`)
  return json({error:"Unauthorized"},401);
 const stepRaw=new URL(request.url).searchParams.get("offset")??"0";
 if(!/^\d{1,3}$/.test(stepRaw)||Number(stepRaw)>199)
  return json({error:"Invalid bounded probe offset"},400);
 const key=process.env.AWIN_DATAFEED_API_KEY??"";
 const publisher=process.env.AWIN_PUBLISHER_ID??"";
 if(!/^[A-Za-z0-9_-]{16,200}$/.test(key)||!/^[0-9]{3,15}$/.test(publisher))
  return json({status:"credentials_unavailable",private_only:true,no_publication:true},503);
 const db=createAdminClient();
 const [observed,programmes]=await Promise.all([
  db.from("awin_feed_update_observations").select("advertiser_id,feed_id,feed_name,advertiser_name,listed_products").order("advertiser_id").order("feed_id").limit(200),
  db.from("affiliate_programs").select("external_account_id,metadata").eq("provider","awin").eq("region","GB").limit(100)
 ]);
 if(observed.error||programmes.error)return json({status:"registry_unavailable",private_only:true},503);
 const accepted=new Set((programmes.data??[]).filter(p=>{
  const meta=p.metadata&&typeof p.metadata==="object"&&!Array.isArray(p.metadata)?p.metadata as Record<string,unknown>:{};
  const owner=meta.owner_joined_accepted_attestation;
  return owner&&typeof owner==="object"&&!Array.isArray(owner)&&
   (owner as Record<string,unknown>).membership_status==="accepted";
 }).map(p=>p.external_account_id).filter(Boolean));
 const feeds=(observed.data??[]).filter(f=>accepted.has(f.advertiser_id));
 if(feeds.length===0)return json({status:"no_accepted_feed_observations",private_only:true});
 const selected=feeds[Number(stepRaw)%feeds.length];
 const base={private_only:true,no_database_writes:true,no_publication:true,
  advertiser_id:selected.advertiser_id,feed_id:selected.feed_id,accepted_feed_count:feeds.length};
 let list:Awaited<ReturnType<typeof inventory>>;
 try{list=await inventory(key,publisher);}
 catch(e){return json({...base,status:"inventory_unavailable",reason:safeCode(e)},502);}
 const idx=(name:string)=>list.header.indexOf(name);
 const matching=list.rows.filter(row=>row.length===list.header.length&&
  row[idx("Advertiser ID")]?.trim()===selected.advertiser_id&&
  row[idx("Feed ID")]?.trim()===selected.feed_id&&
  row[idx("Membership Status")]?.trim().toLowerCase()==="active");
 if(matching.length!==1)return json({...base,status:"feed_not_uniquely_active"},409);
 const row=matching[0],format=row[idx("Datafeed Format")]?.trim()??"";
 const route=recognizeAwinFeed({advertiserId:selected.advertiser_id,
  feedId:selected.feed_id,feedFormat:format,feedName:selected.feed_name??"",
  listedProducts:selected.listed_products??0});
 if(["specialist_tyres","contract_or_service","large_retail"].includes(route.kind))
  return json({...base,status:"recognised_specialist_route",recognition_kind:route.kind,
   schema_status:"specialist_adapter",next_action:route.next});
 try{
  const safeUrl=approvedAwinDownloadUrl(row[idx("URL")]??"",key,selected.feed_id,publisher);
  const response=await fetch(safeUrl,{cache:"no-store",redirect:"error",signal:AbortSignal.timeout(20000)});
  const bytes=await limited(response,MAX_DOWNLOAD);
  const zipped=bytes[0]===0x1f&&bytes[1]===0x8b;
  const plain=zipped?gunzipSync(bytes,{maxOutputLength:MAX_UNPACKED}):bytes;
  if(plain.length>MAX_UNPACKED)throw Error("bounded_probe_size_limit");
  const sample=new TextDecoder("utf-8",{fatal:true}).decode(plain.slice(0,Math.min(plain.length,262144)));
  const profile=profileAwinHeader(sample,format);
  return json({...base,status:"schema_profiled",recognition_kind:route.kind,
   schema_status:profile.status,schema_reason:profile.reason,
   schema_delimiter:profile.delimiter,schema_fields:profile.fields,
   columns:profile.columnCount,column_names:profile.columns});
 }catch(e){return json({...base,status:"schema_probe_quarantined",recognition_kind:route.kind,
  reason:safeCode(e),schema_status:"needs_schema_probe"});}
}
