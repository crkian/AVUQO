import {createHash} from "node:crypto";
import {gunzipSync} from "node:zlib";
import {NextRequest,NextResponse} from "next/server";
import {createAdminClient} from "../../../../lib/supabase/admin";
import {joinedInSource,joinedName} from "../../../../lib/awin/joined-catalogue";
import {csvRowsFromChunks} from "../../../../lib/feed-imports/stream-csv";
import {identifyFormat,prepareGeneralBatch} from "../../../../lib/feed-imports/general-awin-large";
import {approvedAwinDownloadUrl} from "../../../../lib/awin/approved-feed-url";
import {normalizePilotAwinFeed} from "../../../../lib/awin/pilot-feed-normalizer";


/** Explicit physical-product pilot only. Never auto-fetch plan, parking, insurance,
 * contract, tyre fitting, or certification feeds until category-specific adapters exist. */
const approvedFeedPairs=new Map([
 ["77952:103580","Petlibro UK products"],
 ["31539:74135","Mozillion SIM-free phones"],
]);
const MAX_LIST_BYTES=2_500_000,MAX_COMPRESSED=3_000_000,MAX_DECOMPRESSED=12_000_000,MAX_ROWS=5000;
const reply=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store"}});
const sourceDigest=(bytes:Uint8Array)=>createHash("sha256").update(bytes).digest("hex");

async function boundedResponse(response:Response,max:number){
 if(!response.ok)throw Error("upstream_http_"+response.status);
 if(!response.body)throw Error("empty_upstream_body");
 const reader=response.body.getReader();const chunks:Uint8Array[]=[];let size=0;
 try{
  while(true){
   const next=await reader.read();if(next.done)break;
   size+=next.value.length;
   if(size>max)throw Error("source_size_limit");
   chunks.push(next.value);
  }
 }finally{await reader.cancel().catch(()=>{});}
 const bytes=new Uint8Array(size);let offset=0;
 for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
 return bytes;
}

async function* parseRows(text:string,delimiter=",",maxColumns=120){
 yield* csvRowsFromChunks((async function*(){yield text;})(),delimiter,maxColumns);
}
async function getInventory(key:string,publisher:string){
 const urls=[
  `https://ui.awin.com/productdata-darwin-download/publisher/${publisher}/${encodeURIComponent(key)}/1/feedList`,
  `https://productdata.awin.com/datafeed/list/apikey/${encodeURIComponent(key)}`,
 ];
 let failure="network_or_invalid_inventory";
 for(const url of urls){
  try{
   const response=await fetch(url,{cache:"no-store",redirect:"error",signal:AbortSignal.timeout(12000)});
   const bytes=await boundedResponse(response,MAX_LIST_BYTES);
   const text=new TextDecoder("utf-8",{fatal:true}).decode(bytes);
   const rows:string[][]=[];for await(const row of parseRows(text))rows.push(row);
   if(rows.length<2||rows.length>5001)throw Error("invalid_inventory");
   const header=rows[0].map(x=>x.trim());
   for(const name of ["Advertiser ID","Membership Status","Feed ID","Datafeed Format","URL"]){
    if(!header.includes(name))throw Error("invalid_inventory");
   }
   return {header,rows:rows.slice(1)};
  }catch(e){failure=e instanceof Error&&/^upstream_http_\d+$/.test(e.message)?e.message:"network_or_invalid_inventory";}
 }
 throw Error(failure);
}

export async function POST(request:NextRequest){
 const secret=process.env.CRON_SECRET;
 if(!secret||secret.length<16||request.headers.get("authorization")!==`Bearer ${secret}`)
  return reply({error:"Unauthorized"},401);
 const url=new URL(request.url);
 const preflight=request.method==="POST"&&url.searchParams.get("mode")==="preflight";
 if(!preflight&&process.env.AWIN_AUTO_IMPORT_ENABLED!=="true")
  return reply({status:"disabled",private_only:true,required_setting:"AWIN_AUTO_IMPORT_ENABLED"});
 const key=process.env.AWIN_DATAFEED_API_KEY??"";
 const publisher=process.env.AWIN_PUBLISHER_ID??"";
 if(!/^[A-Za-z0-9_-]{16,200}$/.test(key)||!/^[0-9]{3,15}$/.test(publisher))
  return reply({error:"Awin feed credentials not configured"},503);
 const scheduled=request.method==="GET";
 const pilotKeys=["77952:103580","31539:74135"];
 const scheduledPair=pilotKeys[Math.floor(Date.now()/86400000)%pilotKeys.length];
 const advertiser=scheduled?scheduledPair.split(":")[0]:(url.searchParams.get("advertiser_id")??"");
 const feed=scheduled?scheduledPair.split(":")[1]:(url.searchParams.get("feed_id")??"");
 if(!approvedFeedPairs.has(advertiser+":"+feed))
  return reply({error:"Feed not approved for physical-product auto import"},403);
 const db=createAdminClient();
 const {data:source,error:sourceError}=await db.from("sources")
  .select("metadata,status,sync_enabled").eq("connector_key","awin").maybeSingle();
 if(sourceError||!source||!joinedInSource(source.metadata,advertiser))
  return reply({error:"Joined advertiser verification failed"},403);
 // This worker can stage while the general Awin source is paused. It NEVER
 // changes source controls, publication permissions, offers or products.
 const {data:owner,error:ownerError}=await db.from("user_roles")
  .select("user_id").eq("role","owner").limit(2);
 if(ownerError||!owner||owner.length!==1)return reply({error:"Unique owner attribution unavailable"},503);
 let list:Awaited<ReturnType<typeof getInventory>>;
 try{list=await getInventory(key,publisher);}
 catch(e){return reply({error:"Feed inventory fetch failed",failure_kind:e instanceof Error?e.message:"unknown"},502);}
 const idx=(name:string)=>list.header.indexOf(name);
 const matches=list.rows.filter(row=>row.length===list.header.length&&
  row[idx("Advertiser ID")]?.trim()===advertiser&&row[idx("Feed ID")]?.trim()===feed&&
  row[idx("Membership Status")]?.trim().toLowerCase()==="active");
 if(matches.length!==1)return reply({error:"Selected active feed missing or ambiguous"},409);
 const feedRow=matches[0];
 if(!/^(awin|standard)$/i.test(feedRow[idx("Datafeed Format")]?.trim()??""))
  return reply({error:"Feed format not supported by pilot"},422);
 let downloaded:Uint8Array,filename:string;
 try{
  const downloadUrl=approvedAwinDownloadUrl(feedRow[idx("URL")]??"",key,feed);
  const fetched=await fetch(downloadUrl,{cache:"no-store",redirect:"error",signal:AbortSignal.timeout(20000)});
  downloaded=await boundedResponse(fetched,MAX_COMPRESSED);
  filename="";
 }catch(e){return reply({error:"Awin product download failed",failure_kind:e instanceof Error&&/^upstream_http_\d+$/.test(e.message)?e.message:"fetch_or_validation"},502);}
 let digest:string;
 let csv:string;
 try{
  const isGzip=downloaded[0]===0x1f&&downloaded[1]===0x8b;
  const plain=isGzip?gunzipSync(downloaded,{maxOutputLength:MAX_DECOMPRESSED}):downloaded;
  if(plain.length>MAX_DECOMPRESSED)throw Error("too_large");
  csv=new TextDecoder("utf-8",{fatal:true}).decode(plain);
  digest=sourceDigest(plain);
  filename="AUTO__"+digest.slice(0,32)+".csv.gz";
 }catch{return reply({error:"Unsupported or oversized compressed feed"},422);}
 let header:string[]|null=null;let rows:string[][]=[];
 let rawColumnCount=0;
 let currencySource:"feed_column"|"petlibro_uk_programme_gbp"="feed_column";
 let parseStage:"header"|"rows"|"normalize"|"validate"="header";
 let detectedDelimiter:"comma"|"tab"="comma";
 try{
  const delimiter=csv.slice(0,1000).split("\n",1)[0].includes("\t")?"\t":",";
  detectedDelimiter=delimiter==="\t"?"tab":"comma";
  // Only the approved Mozillion SIM-free feed may be parsed with up to 256
  // raw columns. All rows are projected to <=120 validated fields before staging.
  const rawColumnBound=advertiser==="31539"&&feed==="74135"?256:120;
  for await(const row of parseRows(csv,delimiter,rawColumnBound)){
   if(!header){header=row.map(v=>v.trim());rawColumnCount=header.length;parseStage="rows";}
   else{
    if(row.length!==header.length)throw Error("invalid_fields");
    rows.push(row);if(rows.length>MAX_ROWS)throw Error("too_many_rows");
   }
  }
  if(!header||!rows.length)throw Error("empty_feed");
  parseStage="normalize";
  const normalized=normalizePilotAwinFeed(advertiser,feed,header,rows);
  header=normalized.header;rows=normalized.rows;currencySource=normalized.currencySource;
  parseStage="validate";
  // Validate *all* rows before a single write; unsupported feeds remain untouched.
  for(let i=0;i<rows.length;i+=250)prepareGeneralBatch(advertiser,feed,header,rows.slice(i,i+250));
  const ids=new Set<string>();
  const idPosition=header.indexOf(header.includes("merchant_product_id")?"merchant_product_id":"id");
  for(const row of rows){
   const identity=row[idPosition];
   if(ids.has(identity))throw Error("duplicate_identity_across_batches");
   ids.add(identity);
  }
 }catch(e){
  // Authenticated preflight may reveal safe COLUMN NAMES, never sample values,
  // signed URLs, product data or free-form parser errors.
  const safeHeaderNames=preflight&&header?header.slice(0,120).map(name=>
   /^[A-Za-z][A-Za-z0-9_ -]{0,63}$/.test(name)?name:"[redacted]"
  ):undefined;
  const message=e instanceof Error?e.message:"";
  const code=message.startsWith("Unsupported feed format")?"unsupported_columns":
   message==="Incomplete quoted CSV field"?"unterminated_csv_quote":
   message==="Unexpected character after closing quote"?"invalid_csv_quote":
   (message==="CSV column count exceeds 120"||message==="CSV column count exceeds 256")?"csv_column_limit":
   message==="CSV field or row exceeds size limit"?"csv_field_or_column_limit":
   message==="CSV field exceeds 10,000 characters"?"csv_field_size_limit":
   message==="empty_feed"?"empty_feed":
   message==="invalid_fields"?"inconsistent_row_columns":
   message==="too_many_rows"?"row_limit":
   "validation_failed";
  return reply({error:"Feed preflight failed; nothing imported",
   reason:code,
   ...(preflight?{columns:header?.length??0,column_names:safeHeaderNames,
      diagnostic_stage:parseStage,detected_delimiter:detectedDelimiter,
      parsed_rows:rows.length,
      no_database_writes:true,no_publication:true}: {})},422);
 }
 const name=joinedName(advertiser);
 if(!name)return reply({error:"Unrecognised advertiser"},403);
 if(preflight)return reply({status:"preflight_passed",advertiser_id:advertiser,feed_id:feed,
  source_format:identifyFormat(header!),columns:header!.length,source_columns:rawColumnCount,rows:rows.length,
  currency_source:currencySource,source_currency_explicit:currencySource==="feed_column",
  sample_headers:header!.filter(x=>/^(merchant_id|merchant_product_id|product_name|search_price|currency|stock_status|aw_deep_link|ean|gtin|mpn|advertiser_id|id|title|price|availability)$/i.test(x)).slice(0,20),
  private_only:true,no_database_writes:true,no_publication:true});
 const runFilename=`GENAWIN__${feed}__${filename}`;
 const {data:prior,error:priorError}=await db.from("feed_import_runs")
  .select("id,status,created_by").eq("merchant_id",advertiser).eq("filename",runFilename)
  .order("created_at",{ascending:false}).limit(1);
 if(priorError)return reply({error:"Could not check existing import"},503);
 if(prior?.[0]?.status==="private_review")
  return reply({status:"already_staged",advertiser_id:advertiser,feed_id:feed,records:rows.length,private_only:true});
 let runId=prior?.[0]?.id as string|undefined;
 if(prior?.[0]&&prior[0].created_by!==owner[0].user_id)return reply({error:"Prior import owner mismatch"},409);
 if(!runId){
  const {data:run,error:insertError}=await db.from("feed_import_runs").insert({
   created_by:owner[0].user_id,merchant_id:advertiser,merchant_name:name,
   filename:runFilename,status:"importing",permission_status:"unverified",
   total_count:0,review_count:0,excluded_count:0
  }).select("id").single();
  if(insertError||!run)return reply({error:"Could not create private auto-import"},503);
  runId=run.id;
  const {error:sessionError}=await db.from("large_feed_import_sessions")
   .insert({import_id:runId,source_digest:digest});
  if(sessionError)return reply({error:"Private import session setup failed"},503);
 }
 const {data:session,error:sessionError}=await db.from("large_feed_import_sessions")
  .select("next_sequence,committed_count,source_digest,completed_at").eq("import_id",runId).single();
 if(sessionError||!session||session.source_digest!==digest||session.completed_at)
  return reply({error:"Resume fingerprint mismatch or completed session"},409);
 let committed=session.committed_count;
 for(let i=session.next_sequence;i<Math.ceil(rows.length/250);i++){
  const batch=rows.slice(i*250,(i+1)*250);
  const records=prepareGeneralBatch(advertiser,feed,header!,batch);
  // Explicit machine provenance, with human publication rights STILL unverified.
  const staged=records.map(record=>({...record,metadata:{...record.metadata,
   import_actor:"awin_auto_import_worker",currency_source:currencySource,
   source_currency_explicit:currencySource==="feed_column"}}));
  const chunkDigest=createHash("sha256").update(JSON.stringify({headers:header,rows:batch,feedId:feed})).digest("hex");
  const {data:done,error}=await db.rpc("append_general_awin_feed_chunk",{
   p_import_id:runId,p_sequence:i,p_digest:chunkDigest,p_rows:staged
  });
  if(error)return reply({error:"Private batch rejected",saved_records:committed,run_id:runId,private_only:true},503);
  committed=Number(done?.committed??0);
 }
 const {data:finish,error:finishError}=await db.rpc("finish_general_awin_feed_import",{p_import_id:runId,p_total:rows.length});
 if(finishError)return reply({error:"Private import finish failed",run_id:runId},503);
 return reply({status:"private_review",advertiser_id:advertiser,feed_id:feed,
  run_id:runId,records:rows.length,review:finish?.review,excluded:finish?.excluded,
  private_only:true,no_publication:true,source_remains_paused:true});
}
 
/** Vercel Cron invokes GET; the selected allowlisted feed rotates by UTC day. */
export async function GET(request:NextRequest){return POST(request);}
