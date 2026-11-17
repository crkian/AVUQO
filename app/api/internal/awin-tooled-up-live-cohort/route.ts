import {NextRequest,NextResponse} from "next/server";
import {createAdminClient} from "../../../../lib/supabase/admin";
import {tooledUpPrivateAutomationAllowed} from "../../../../lib/awin/tooled-up-private-automation";
import {AWIN_PRIVATE_SNAPSHOT_BUCKET,privateAwinSnapshotKey} from "../../../../lib/awin/private-snapshot";
import {latestTooledUpObservedDigest} from "../../../../lib/awin/tooled-up-observation";
import {TOOLED_UP_SOURCE_FIELDS} from "../../../../lib/awin/tooled-up-source-fields";
import {csvRowsFromChunks} from "../../../../lib/feed-imports/stream-csv";
import {ownAffiliateLink} from "../../../../lib/awin/approved-offer-renewal";
import {collectAwinImages,selectAwinPrimaryImage} from "../../../../lib/awin/collect-images.mjs";
import {normalizeAwinAvailability} from "../../../../lib/awin/stock-availability.mjs";
import {stageLiveAwinCanonicalCandidates} from "../../../../lib/awin/private-live-canonical-stage";

export const maxDuration=300;
const reply=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{"Cache-Control":"private, no-store"}});
const ID="496",FEED="89987",MAX_SCANNED=1500,MAX_CANDIDATES=60;
type Row={id:string;import_id:string;merchant_product_id:string;title:string;price:number|string;
 currency:string;status:string;reviewed_at:string|null;metadata:unknown;image_url:string|null};
const meta=(x:unknown):Record<string,unknown>=>x&&typeof x==="object"&&!Array.isArray(x)?x as Record<string,unknown>:{};

/**
 * Signed, immutable, FULLY VALIDATED Tooled Up master snapshot -> exact live
 * price/stock recheck of a small existing private SKU cohort -> HELD canonical.
 * This never publishes a first offer and never treats an old private import
 * timestamp as current price evidence.
 * 
 * The Awin 29-column master lacks a currency column. Its currency basis is
 * explicitly reconciled to an existing GBP-staged row and the UK merchant
 * storefront, never described as an explicit feed currency field.
 */
export async function GET(request:NextRequest){
 const secret=process.env.CRON_SECRET;
 if(!secret||secret.length<16||request.headers.get("authorization")!==`Bearer ${secret}`)
  return reply({error:"Unauthorized"},401);
 if(new URL(request.url).search)
  return reply({error:"No snapshot, SKU, feed or offset override supported"},400);
 const db=createAdminClient();
 if(!(await tooledUpPrivateAutomationAllowed(db)))
  return reply({status:"tooled_up_source_or_control_blocked",no_publication:true},423);
 const {data:validation,error:validationError}=await db.from("awin_private_snapshot_validations")
  .select("snapshot_sha256,actual_rows,critical_issues,duplicate_product_ids,invalid_price_rows,unverified_affiliate_links,validated_at")
  .eq("advertiser_id",ID).eq("feed_id",FEED)
  .order("validated_at",{ascending:false}).limit(1).maybeSingle();
 if(validationError||!validation)return reply({status:"validation_not_available",no_publication:true},503);
 // Full-stream integrity validation applies to immutable content. Live
 // price/stock freshness comes from a NEW authenticated Awin download that
 // was independently checked against the stored SHA-256, not validated_at
 // or storage.created_at. Reusing validation cannot refresh price evidence.
 const now=Date.now();
 if(validation.critical_issues!==0||validation.duplicate_product_ids!==0||
   validation.invalid_price_rows!==0||validation.unverified_affiliate_links!==0||
   !Number.isSafeInteger(validation.actual_rows)||validation.actual_rows<100)
  return reply({status:"full_stream_validation_failed",no_publication:true});
 const recent=await latestTooledUpObservedDigest(db);
 if(!recent||recent.snapshot_sha256!==validation.snapshot_sha256)
  return reply({status:"fresh_authenticated_feed_observation_required",no_publication:true});
 const key=privateAwinSnapshotKey(ID,FEED,validation.snapshot_sha256,"csv.gz");
 const {data:signed,error:signError}=await db.storage.from(AWIN_PRIVATE_SNAPSHOT_BUCKET)
  .createSignedUrl(key,60);
 if(signError||!signed?.signedUrl)return reply({status:"snapshot_read_unavailable",no_publication:true},503);
 let url:URL;
 try{
  const origin=new URL(process.env.NEXT_PUBLIC_SUPABASE_URL??"");
  url=new URL(signed.signedUrl,origin);
  if(origin.protocol!=="https:"||url.origin!==origin.origin||
    !url.pathname.startsWith("/storage/v1/object/sign/"+AWIN_PRIVATE_SNAPSHOT_BUCKET+"/"))
   throw Error("unsafe");
 }catch{return reply({status:"storage_origin_invalid",no_publication:true},503);}
 type Candidate={sku:string;title:string;price:number;link:string;image:string;images:unknown[];stock:string};
 const candidates:Candidate[]=[];
 let rowNumber=0,visited=0;
 const windows=Math.max(1,Math.ceil(validation.actual_rows/MAX_SCANNED));
 const cohortStart=(Math.floor(now/(4*3600_000))%windows)*MAX_SCANNED;
 try{
  const response=await fetch(url,{cache:"no-store",redirect:"error",signal:AbortSignal.timeout(155000)});
  if(!response.ok||!response.body)throw Error("snapshot_unavailable");
  const decoder=new TextDecoder("utf-8",{fatal:true});
  const expanded=response.body.pipeThrough(new DecompressionStream("gzip") as unknown as ReadableWritablePair<Uint8Array,Uint8Array>)
   .pipeThrough(new TransformStream<Uint8Array,string>({
    transform(bytes,controller){const part=decoder.decode(bytes,{stream:true});if(part)controller.enqueue(part);},
    flush(controller){const tail=decoder.decode();if(tail)controller.enqueue(tail);}
   }));
  const reader=expanded.getReader();
  const chunks=(async function*(){
   try{for(;;){const {value,done}=await reader.read();if(done)break;yield value;}}
   finally{await reader.cancel().catch(()=>{});reader.releaseLock();}
  })();
  let header:string[]|null=null;
  for await(const row of csvRowsFromChunks(chunks,",",120)){
   if(!header){
    header=row.map(x=>x.trim());
    if(header.length!==TOOLED_UP_SOURCE_FIELDS.length||new Set(header).size!==header.length||
      !TOOLED_UP_SOURCE_FIELDS.every(x=>header!.includes(x)))throw Error("schema_mismatch");
    continue;
   }
   rowNumber++;
   if(rowNumber<=cohortStart)continue;
   if(rowNumber>cohortStart+MAX_SCANNED)break;
   visited++;
   if(row.length!==header.length)throw Error("row_columns");
   const value=(field:string)=>row[header!.indexOf(field)]?.trim()??"";
   if(value("merchant_id")!==ID||value("data_feed_id")!==FEED)throw Error("identity_mismatch");
   const sku=value("merchant_product_id"),title=value("product_name"),
    priceValue=value("search_price"),link=value("aw_deep_link");
   const price=Number(priceValue);
   if(!sku||sku.length>250||!title||!/^\d+(?:\.\d{1,2})?$/.test(priceValue)||
      !Number.isFinite(price)||price<=0||!ownAffiliateLink(link,ID))continue;
   const fields=Object.fromEntries(header.map((name,i)=>[name,row[i]]));
   const stock=normalizeAwinAvailability(fields,"awin-csv").value.toLowerCase().replace(/[\s-]+/g,"_");
   if(!["in_stock","instock","available","low_stock","limited"].includes(stock))continue;
   const images=collectAwinImages(fields,FEED);
   const image=selectAwinPrimaryImage(images)?.url;
   if(!image)continue;
   candidates.push({sku,title,price,link,image,images,stock});
   if(candidates.length>=MAX_CANDIDATES)break;
  }
 }catch{return reply({status:"snapshot_stream_or_schema_unavailable",no_publication:true},422);}
 if(!candidates.length)return reply({status:"no_stocked_candidates_in_cohort",scanned:visited,
  no_publication:true});
 const ids=candidates.map(c=>c.sku);
 const {data:previous,error:previousError}=await db.from("feed_import_records")
  .select("id,import_id,merchant_product_id,title,price,currency,status,reviewed_at,metadata,image_url")
  .eq("merchant_id",ID).eq("status","review").is("reviewed_at",null)
  .in("merchant_product_id",ids).limit(MAX_CANDIDATES);
 if(previousError)return reply({status:"existing_import_unavailable",no_publication:true},503);
 const bySku=new Map((previous??[] as Row[]).map(row=>[row.merchant_product_id,row]));
 let matched=0,updated=0;
 let importId:string|null=null;
 for(const current of candidates){
  const old=bySku.get(current.sku);
  if(!old||old.title!==current.title||Number(old.price)!==current.price||
   old.currency!=="GBP"||old.status!=="review"||meta(old.metadata).feed_id!==FEED)continue;
  matched++;
  const sourceMetadata=meta(old.metadata);
  // Do not overwrite customer-facing price or fabricate a feed currency field.
  const metadata={...sourceMetadata,live_feed_verified_at:recent.observed_at,
   live_feed_digest:validation.snapshot_sha256,
   live_feed_verification:"exact_authenticated_feed_digest_rechecked",
   live_digest_kind:"gzip_storage_snapshot_sha256",
   verified_awin_deep_link:current.link,tracking_link_verified:true,
   availability:current.stock,listing_kind:"physical_product",
   source_currency_explicit:false,
   currency_source:"tooled_up_uk_GBP_storefront_and_exact_staged_price_match",
   source_image_rights_confirmed:true,
   image_permission_basis:"owner_attested_all_accepted_programmes_2026_11_17",
   supplied_image_gallery:current.images};
  const {data:changed,error:writeError}=await db.from("feed_import_records")
   .update({metadata,image_url:current.image}).eq("id",old.id)
   .eq("price",current.price).eq("currency","GBP").eq("status","review")
   .is("reviewed_at",null).select("id").maybeSingle();
  if(writeError)return reply({status:"cohort_recheck_write_failed",matched,updated,no_publication:true},503);
  if(changed?.id){updated++;importId=old.import_id;}
  if(updated>=20)break;
 }
 if(!updated||!importId)return reply({status:"no_exact_current_matches",scanned:visited,
  candidate_rows:candidates.length,matched,no_publication:true});
 // The exact existing canonical stage independently checks every record
 // again and always creates HELD, never public first-release offers.
 const stage=await stageLiveAwinCanonicalCandidates(db,{
  importId,advertiser:ID,feed:FEED,digest:validation.snapshot_sha256,limit:20
 });
 return reply({status:"tooled_up_exact_cohort_checked",
  scanned:visited,candidate_rows:candidates.length,matched,live_rechecked:updated,
  canonical_status:stage.status,canonical_held:stage.canonicalAccepted,
  canonical_rejected:stage.canonicalRejected,
  currency_basis:"merchant_uk_gbp_storefront_and_exact_staged_price_match",
  no_first_publication:true,private_only:true});
}
