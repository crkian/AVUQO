import {specialistEvidence} from "../../../../lib/awin/specialist-evidence.mjs";
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
 const stepRaw=new URL(request.url).searchParams.get("offset")??"next";
 if(stepRaw!=="next"&&(!/^\d{1,3}$/.test(stepRaw)||Number(stepRaw)>199))
  return json({error:"Invalid bounded probe offset"},400);
 const key=process.env.AWIN_DATAFEED_API_KEY??"";
 const publisher=process.env.AWIN_PUBLISHER_ID??"";
 if(!/^[A-Za-z0-9_-]{16,200}$/.test(key)||!/^[0-9]{3,15}$/.test(publisher))
  return json({status:"credentials_unavailable",private_only:true,no_publication:true},503);
 const db=createAdminClient();
 const [observed,programmes,profiles]=await Promise.all([
  db.from("awin_feed_update_observations").select("advertiser_id,feed_id,feed_name,advertiser_name,listed_products,observed_at").order("observed_at",{ascending:false}).limit(1000),
  db.from("affiliate_programs").select("external_account_id,metadata").eq("provider","awin").eq("region","GB").limit(100),
  db.from("awin_feed_schema_profiles").select("advertiser_id,feed_id,checked_at,status,schema_reason").limit(1000)
 ]);
 if(observed.error||programmes.error||profiles.error)return json({status:"registry_or_profile_ledger_unavailable",private_only:true},503);
 const accepted=new Set((programmes.data??[]).filter(p=>{
  const meta=p.metadata&&typeof p.metadata==="object"&&!Array.isArray(p.metadata)?p.metadata as Record<string,unknown>:{};
  const owner=meta.owner_joined_accepted_attestation;
  return owner&&typeof owner==="object"&&!Array.isArray(owner)&&
   (owner as Record<string,unknown>).membership_status==="accepted";
 }).map(p=>p.external_account_id).filter(Boolean));
 const seen=new Set<string>();
 const feeds=(observed.data??[]).filter(f=>{
  const key=f.advertiser_id+":"+f.feed_id;
  if(!accepted.has(f.advertiser_id)||seen.has(key))return false;
  seen.add(key);return true;
 });
 if(feeds.length===0)return json({status:"no_accepted_feed_observations",private_only:true});
 const scanned=new Map((profiles.data??[]).filter(p=>(p.status!=="recognised_specialist_route"&&!(p.status==="schema_profiled"&&p.schema_reason==="header_fields_identified"))||!feeds.some(f=>f.advertiser_id===p.advertiser_id&&f.feed_id===p.feed_id&&recognizeAwinFeed({advertiserId:f.advertiser_id,feedId:f.feed_id,feedFormat:"Awin",feedName:f.feed_name??"",listedProducts:f.listed_products??0}).kind==="contract_or_service")).map(p=>[p.advertiser_id+":"+p.feed_id,p.checked_at]));
 // Refresh old or failed profiles on the existing schedule, never treat a historical failure as final.
 const cutoff=Date.now()-7*86400000;
 const due=feeds.filter(f=>Date.parse(scanned.get(f.advertiser_id+":"+f.feed_id)??"")>=cutoff?false:true);
 const next=[...(due.length?due:feeds)].sort((a,b)=>{
  const at=scanned.get(a.advertiser_id+":"+a.feed_id)??"";
  const bt=scanned.get(b.advertiser_id+":"+b.feed_id)??"";
  return at.localeCompare(bt);
 });
 const onlyNew=new URL(request.url).searchParams.get("only_new")==="1";
 if(onlyNew&&stepRaw==="next"&&due.length===0)
  return json({status:"all_accepted_feeds_inspected",accepted_feed_count:feeds.length,
   private_only:true,no_publication:true});
 const selected=stepRaw==="next"?next[0]:feeds[Number(stepRaw)%feeds.length];
 const base={private_only:true,no_product_writes:true,no_publication:true,
  advertiser_id:selected.advertiser_id,feed_id:selected.feed_id,accepted_feed_count:feeds.length};
 async function record(status:string,fields:Record<string,unknown>={}){
  const profile={advertiser_id:selected.advertiser_id,feed_id:selected.feed_id,status,
   recognition_kind:typeof fields.recognition_kind==="string"?fields.recognition_kind:null,
   schema_status:typeof fields.schema_status==="string"?fields.schema_status:null,
   schema_reason:typeof fields.schema_reason==="string"?fields.schema_reason:null,
   schema_delimiter:typeof fields.schema_delimiter==="string"?fields.schema_delimiter:null,
   schema_fields:Array.isArray(fields.schema_fields)?fields.schema_fields:[],
   safe_column_names:Array.isArray(fields.column_names)?fields.column_names:[],
   column_count:typeof fields.columns==="number"?fields.columns:0,
   error_code:typeof fields.reason==="string"?fields.reason:null,checked_at:new Date().toISOString()};
  const {error}=await db.from("awin_feed_schema_profiles").upsert(profile,{onConflict:"advertiser_id,feed_id"});
  if(error)return json({...base,status:"profile_recording_failed",no_publication:true},503);
  return json({...base,status,...fields});
 }
 let list:Awaited<ReturnType<typeof inventory>>;
 try{list=await inventory(key,publisher);}
 catch(e){return record("inventory_unavailable",{reason:safeCode(e)});}
 const idx=(name:string)=>list.header.indexOf(name);
 const matching=list.rows.filter(row=>row.length===list.header.length&&
  row[idx("Advertiser ID")]?.trim()===selected.advertiser_id&&
  row[idx("Feed ID")]?.trim()===selected.feed_id&&
  row[idx("Membership Status")]?.trim().toLowerCase()==="active");
 if(matching.length!==1)return record("feed_not_uniquely_active");
 const row=matching[0],format=row[idx("Datafeed Format")]?.trim()??"";
 const route=recognizeAwinFeed({advertiserId:selected.advertiser_id,
  feedId:selected.feed_id,feedFormat:format,feedName:selected.feed_name??"",
  listedProducts:selected.listed_products??0});
 if(["specialist_tyres","large_retail"].includes(route.kind))
  return record("recognised_specialist_route",{recognition_kind:route.kind,
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
  let specialistReason=profile.reason;
  if(route.kind==="contract_or_service"&&["tab","comma","semicolon","pipe"].includes(profile.delimiter)){
   const delimiter=({tab:"\t",comma:",",semicolon:";",pipe:"|"} as Record<string,string>)[profile.delimiter];
   const rows:string[][]=[];
   for await(const cells of csvRowsFromChunks(oneChunk(new TextDecoder("utf-8",{fatal:true}).decode(plain)),delimiter,256)){
    rows.push(cells);if(rows.length>5001)throw Error("bounded_probe_size_limit");
   }
   const header=rows.shift()?.map(v=>v.trim().replace(/^\uFEFF/,""))??[];
   const evidence=specialistEvidence(selected.advertiser_id,selected.feed_id,header,rows);
   // Aggregate only, encoded in the existing private diagnostic field. Never a public price.
   specialistReason="specialist_rows_"+evidence.rows+"_gbp_"+evidence.explicit_gbp+"_price_"+evidence.source_price+"_terms_"+evidence.contract_terms_present+"_links_"+evidence.own_publisher_links;
  }
  return record("schema_profiled",{recognition_kind:route.kind,
   schema_status:route.kind==="contract_or_service"?"specialist_adapter":profile.status,schema_reason:specialistReason,
   schema_delimiter:profile.delimiter,schema_fields:profile.fields,
   columns:profile.columnCount,column_names:profile.columns});
 }catch(e){return record("schema_probe_quarantined",{recognition_kind:route.kind,
  reason:safeCode(e),schema_status:"needs_schema_probe"});}
}
