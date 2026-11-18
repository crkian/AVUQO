import {createHash} from "node:crypto";
import {gunzipSync} from "node:zlib";
import {NextRequest,NextResponse} from "next/server";
import {createAdminClient} from "../../../../lib/supabase/admin";
import {sourceIngestionFailures,evaluateSourceControls} from "../../../../lib/pipeline/source-readiness";
import {approvedAwinDownloadUrl} from "../../../../lib/awin/approved-feed-url";
import {csvRowsFromChunks} from "../../../../lib/feed-imports/stream-csv";
import {verifiedTyresUkRow} from "../../../../lib/awin/tyres-uk-current-row.mjs";
import {recordPrivateCronAttempt} from "../../../../lib/awin/private-cron-recorder";
import {redactedTyreRecheckFailure} from "../../../../lib/awin/tyre-recheck-failure.mjs";

export const maxDuration=300;
const ADVERTISER="12715",FEED="93988",MAX_BYTES=36*1024*1024,
 MAX_EXPANDED=195*1024*1024,MAX_ROWS=100000,COHORT=1200,WINDOW=1200;
const answer=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store"}});
const digest=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");
async function fetchBytes(response:Response,max:number){
 if(!response.ok||!response.body)throw Error("authenticated_feed_unavailable");
 const advertised=Number(response.headers.get("content-length")??0);
 if(advertised>max)throw Error("feed_too_large");
 const chunks:Uint8Array[]=[],reader=response.body.getReader();let size=0;
 try{for(;;){const {value,done}=await reader.read();if(done)break;size+=value.length;
  if(size>max)throw Error("feed_too_large");chunks.push(value);}}
 finally{await reader.cancel().catch(()=>{});}
 if(!size)throw Error("empty_feed");
 const bytes=new Uint8Array(size);let pos=0;
 for(const c of chunks){bytes.set(c,pos);pos+=c.length;}
 return bytes;
}
async function* lines(text:string){yield* csvRowsFromChunks((async function*(){yield text;})(),",",120);}
async function joinedFeed(key:string,publisher:string){
 const sources=[
  `https://ui.awin.com/productdata-darwin-download/publisher/${publisher}/${encodeURIComponent(key)}/1/feedList`,
  `https://productdata.awin.com/datafeed/list/apikey/${encodeURIComponent(key)}`
 ];
 for(const inventoryUrl of sources){
  try{
   const res=await fetch(inventoryUrl,{cache:"no-store",redirect:"error",signal:AbortSignal.timeout(12000)});
   const bytes=await fetchBytes(res,2500000),rows:string[][]=[];
   for await(const cells of lines(new TextDecoder("utf-8",{fatal:true}).decode(bytes))){
    if(rows.length>5000)throw Error("inventory_limit");rows.push(cells);
   }
   const h=rows.shift()?.map(x=>x.trim())??[],fields=["Advertiser ID","Feed ID","Membership Status","Datafeed Format","URL"];
   if(h.length!==new Set(h).size||!fields.every(f=>h.includes(f)))continue;
   const at=(f:string)=>h.indexOf(f);
   const matches=rows.filter(x=>x.length===h.length&&x[at("Advertiser ID")]===ADVERTISER&&
    x[at("Feed ID")]===FEED&&x[at("Membership Status")]?.toLowerCase()==="active"&&
    /^(awin|standard)$/i.test(x[at("Datafeed Format")]??""));
   if(matches.length!==1)continue;
   return approvedAwinDownloadUrl(matches[0][at("URL")],key,FEED,publisher);
  }catch{continue;}
 }
 throw Error("accepted_tyre_feed_not_found");
}
async function sourceReady(db:ReturnType<typeof createAdminClient>){
 const [{data:source,error:sourceError},{data:program,error:programError},
  {data:controls,error:controlsError}]=await Promise.all([
  db.from("sources").select("status,sync_enabled,credential_status,connector_key,source_type,metadata")
   .eq("connector_key","awin").maybeSingle(),
  db.from("affiliate_programs").select("metadata").eq("provider","awin")
   .eq("region","GB").eq("external_account_id",ADVERTISER).maybeSingle(),
  db.from("system_controls").select("control_key,enabled")
   .in("control_key",["source_ingestion","global_emergency_stop"])
 ]);
 if(sourceError||programError||controlsError||!source||!program)return false;
 const controlsReady=evaluateSourceControls(controls??[],false);
 const p=program.metadata&&typeof program.metadata==="object"&&!Array.isArray(program.metadata)
  ?program.metadata as Record<string,unknown>:{};
 const att=p.owner_joined_accepted_attestation;
 if(!controlsReady.ingestion||controlsReady.emergencyStop||p.publication_approved!==true||
  !att||typeof att!=="object"||(att as Record<string,unknown>).membership_status!=="accepted")return false;
 return sourceIngestionFailures(source,{advertiserId:ADVERTISER,
  connectorConfigured:Boolean(process.env.AWIN_PUBLISHER_ID&&process.env.AWIN_DATAFEED_API_KEY)
 }).length===0;
}
export async function GET(request:NextRequest){
 const secret=process.env.CRON_SECRET;
 if(!secret||secret.length<16||request.headers.get("authorization")!==`Bearer ${secret}`)
  return answer({error:"Unauthorized"},401);
 if(new URL(request.url).search)return answer({error:"Query overrides unsupported"},400);
 return recordPrivateCronAttempt("tyres_uk_recheck",()=>recheck());
}
async function recheck(){
 if(process.env.AWIN_AUTO_IMPORT_ENABLED!=="true")return answer({status:"disabled",private_only:true});
 const started=Date.now(),db=createAdminClient();
 let stage="source_controls";
 try{
  if(!await sourceReady(db))return answer({status:"source_control_blocked",no_publication:true},423);
  const key=process.env.AWIN_DATAFEED_API_KEY??"",publisher=process.env.AWIN_PUBLISHER_ID??"";
  if(!/^[A-Za-z0-9_-]{16,200}$/.test(key)||!/^[0-9]{3,15}$/.test(publisher))
   return answer({status:"credentials_unavailable",no_publication:true},503);
  stage="inventory";
  const download=await joinedFeed(key,publisher);
  stage="download";
  const response=await fetch(download,{redirect:"error",cache:"no-store",signal:AbortSignal.timeout(115000)});
  const raw=await fetchBytes(response,MAX_BYTES),sha=digest(raw);
  stage="decode";
  const expanded=raw[0]===0x1f&&raw[1]===0x8b
   ?gunzipSync(raw,{maxOutputLength:MAX_EXPANDED}):raw;
  if(expanded.length>MAX_EXPANDED)throw Error("feed_too_large");
  const text=new TextDecoder("utf-8",{fatal:true}).decode(expanded);
  stage="parse";
  const rows=lines(text),seen=new Set<string>();let header:string[]|null=null;
  let count=0,eligible=0;const sourceRows:Array<ReturnType<typeof verifiedTyresUkRow>>=[];
  // Rotate complete master-feed windows, never select a user-supplied SKU.
  // Awin last-observed inventory for this fixed feed has ~31,227 entries.
  // The count will be adjusted using the last authenticated full-feed receipt.
  const {data:last}=await db.from("awin_tyre_live_observations")
   .select("row_count").eq("advertiser_id",ADVERTISER).eq("feed_id",FEED)
   .order("observed_at",{ascending:false}).limit(1).maybeSingle();
  const expected=Number(last?.row_count??31227);
  const windowCount=Math.max(1,Math.ceil((Number.isSafeInteger(expected)&&expected>0?expected:31227)/WINDOW));
  const windowIndex=Math.floor(Date.now()/(15*60000))%windowCount;
  const start=windowIndex*WINDOW,end=start+WINDOW;
  for await(const values of rows){
   if(!header){
    header=values.map(x=>x.trim());
    const required=["merchant_id","merchant_product_id","product_name","search_price",
      "currency","aw_deep_link"];
    if(!required.every(x=>header!.includes(x))||header.length!==new Set(header).size)
     throw Error("invalid_feed_schema");
    continue;
   }
   if(values.length!==header.length)throw Error("invalid_feed_row");
   const sku=values[header.indexOf("merchant_product_id")]?.trim();
   const advertiser=values[header.indexOf("merchant_id")]?.trim();
   if(advertiser!==ADVERTISER||!sku||seen.has(sku))throw Error("invalid_feed_row");
   seen.add(sku);
   if(count>=start&&count<end&&sourceRows.length<COHORT){
    const product=verifiedTyresUkRow(header,values);
    if(product){sourceRows.push(product);eligible++;}
   }
   count++;
   if(count>MAX_ROWS)throw Error("bad_feed_row_count");
  }
  if(count<1000)throw Error("bad_feed_row_count");
  if(!await sourceReady(db))throw Error("source_control_blocked");
  stage="receipt";
  const observedAt=new Date().toISOString();
  const {error:recordError}=await db.from("awin_tyre_live_observations")
   .upsert({advertiser_id:ADVERTISER,feed_id:FEED,snapshot_sha256:sha,
     row_count:count,observed_at:observedAt,
     provenance:"current_authenticated_awin_full_download"},
    {onConflict:"advertiser_id,feed_id,snapshot_sha256"});
  if(recordError)throw Error("private_batch_unavailable");
  stage="batch";
  let checked=0;
  if(sourceRows.length){
   const {data,error}=await db.rpc("recheck_tyres_uk_exact_private_batch",
    {p_digest:sha,p_products:sourceRows});
   if(error)throw Error("private_batch_unavailable");
   checked=Array.isArray(data)?data.length:0;
  }
  return answer({status:"tyre_live_source_cohort_checked",advertiser_id:ADVERTISER,
   feed_id:FEED,source_rows:count,source_candidates:eligible,
   live_verified:checked,window_index:windowIndex,
   duration_ms:Date.now()-started,private_only:true,
   public_listings_auto_eligible:true,no_scored_deal_publication:true});
 }catch(error){
  return answer(redactedTyreRecheckFailure(error,stage),503);
 }
}
