import type {createAdminClient} from "../supabase/admin";
import {ownAffiliateLink} from "./approved-offer-renewal.ts";
import {publicAwinDescription} from "./product-description-evidence.ts";
import {sourceIngestionFailures} from "../pipeline/source-readiness.ts";
import {classifyTooledUpCategory} from "./tooled-up-taxonomy.mjs";

import type {RawSourceOffer,PipelineRunSummary} from "../../types/pipeline";

/** Strict live Awin feed bridge. Only previously authenticated, exact-digest
 * rechecked physical products from a private import may become HELD canonical
 * offers. This module never authorises or creates a first public release.
 */
const PHYSICAL=new Map([
 ["77952","home"],["31539","tech"],["736","gifts"],["45747","home"],["101445","gifts"],["496","tools"]
]);
const stock=(v:unknown)=>{
 const x=String(v??"").trim().toLowerCase().replace(/[\s-]+/g,"_");
 return ["in_stock","instock","available"].includes(x)?"in_stock":
  ["low_stock","limited"].includes(x)?"low_stock":null;
};
type Row={
 id:string;import_id:string;merchant_product_id:string;title:string;
 price:number|string;currency:string;brand:string|null;category:string|null;
 image_url:string|null;
 status:string;metadata:unknown;
};
const rec=(v:unknown):Record<string,unknown>=>
 v&&typeof v==="object"&&!Array.isArray(v)?v as Record<string,unknown>:{};
export function toFreshVerifiedAwinRaw(
 row:Row,advertiser:string,feed:string,digest:string,now=Date.now()
):RawSourceOffer|null{
 const category=advertiser==="496"?classifyTooledUpCategory(row.category):PHYSICAL.get(advertiser);
 const m=rec(row.metadata),verified=String(m.live_feed_verified_at??"");
 const checked=Date.parse(verified);
 const amount=Number(row.price);
 const link=typeof m.verified_awin_deep_link==="string"?m.verified_awin_deep_link:null;
 const rightsVerified=m.source_image_rights_confirmed===true;
 const gallery=Array.isArray(m.supplied_image_gallery)?m.supplied_image_gallery:[];
 if(!category||row.status!=="review"||m.feed_id!==feed||
    m.live_feed_digest!==digest||!/^[a-f0-9]{64}$/.test(digest)||
    m.live_feed_verification!=="exact_authenticated_feed_digest_rechecked"||
    !Number.isFinite(checked)||checked>now+300000||now-checked>15*60_000||
    m.tracking_link_verified!==true||!ownAffiliateLink(link,advertiser)||
    row.currency!=="GBP"||!Number.isFinite(amount)||amount<=0||
    !stock(m.availability)||!row.title?.trim()||
    !row.merchant_product_id?.trim()||row.merchant_product_id.length>250||
    m.listing_kind!=="physical_product")return null;
 const brand=typeof row.brand==="string"&&row.brand.trim()?row.brand.trim():
  typeof m.manufacturer_brand==="string"?m.manufacturer_brand:null;
 const id=(key:string)=>typeof m[key]==="string"&&String(m[key]).trim()
  ?String(m[key]).trim():null;
 // New live price evidence is the timestamp of the actual authenticated feed
 // download. Historical stored import creation timestamps are NEVER renewed.
 return {
  sourceRecordId:advertiser+":"+row.merchant_product_id,
  merchantName:advertiser==="77952"?"Petlibro UK Affiliate Program":
   advertiser==="31539"?"Mozillion":advertiser==="736"?"Cadbury Gifts Direct":
   advertiser==="101445"?"PlayPress Toys UK":advertiser==="496"?"Tooled Up":"Craft Buddy Shop",
  merchantExternalId:advertiser,title:row.title,
  description:publicAwinDescription(m,digest),
  category,brand,model:id("model"),gtin:id("gtin"),ean:id("ean"),mpn:id("mpn"),
  price:amount,currency:"GBP",deliveryCost:null,
  // Only explicitly verified image rights permit downstream display.
  affiliateUrl:link,sourceUrl:null,imageUrl:rightsVerified?row.image_url:null,
  stockStatus:stock(m.availability),
  raw:{import_id:row.import_id,feed_id:feed,merchant_product_id:row.merchant_product_id,
   live_feed_digest:digest,live_feed_verified_at:verified,
   source_currency_explicit:m.source_currency_explicit===true,
   currency_source:typeof m.currency_source==="string"?m.currency_source:"feed_column",
   supplier_image_count:gallery.length,
   source_image_rights_confirmed:rightsVerified,
   merchant_category:advertiser==="496"?row.category:null,
   // Gallery remains private pending rights. Never copy unapproved URLs into public products.
   permitted_image_gallery:rightsVerified?gallery:[]}
 };
}
export async function stageLiveAwinCanonicalCandidates(
 db:ReturnType<typeof createAdminClient>,input:{
  importId:string;advertiser:string;feed:string;digest:string;limit?:number;
  merchantProductIds?:string[]
 }):Promise<{status:string;eligible:number;canonicalAccepted:number;canonicalRejected:number}>{
 if(!PHYSICAL.has(input.advertiser)||!/^[0-9]{2,12}$/.test(input.advertiser)||
    !/^[a-zA-Z0-9_-]{1,30}$/.test(input.feed)||
    !/^[a-f0-9]{64}$/.test(input.digest))
  return {status:"unsupported_private_feed",eligible:0,canonicalAccepted:0,canonicalRejected:0};
 const limit=Math.max(1,Math.min(input.limit??20,20));
 if(input.merchantProductIds&&
   (!Array.isArray(input.merchantProductIds)||
    input.merchantProductIds.length<1||input.merchantProductIds.length>100||
    input.merchantProductIds.some(sku=>typeof sku!=="string"||
      !sku.trim()||sku.length>250)))
  return {status:"invalid_exact_sku_cohort",eligible:0,canonicalAccepted:0,canonicalRejected:0};
 const {data:source,error:sourceError}=await db.from("sources")
  .select("status,sync_enabled,credential_status,connector_key,source_type,metadata")
  .eq("connector_key","awin").maybeSingle();
 if(sourceError||!source)
  return {status:"source_unavailable",eligible:0,canonicalAccepted:0,canonicalRejected:0};
 const privateMode=source.status==="paused"&&source.sync_enabled===false;
 const activeMode=source.status==="active"&&source.sync_enabled===true&&
  sourceIngestionFailures(source,{advertiserId:input.advertiser,
   connectorConfigured:Boolean(process.env.AWIN_PUBLISHER_ID&&process.env.AWIN_DATAFEED_API_KEY)}).length===0;
 if(!privateMode&&!activeMode)
  return {status:"source_not_ready",eligible:0,canonicalAccepted:0,canonicalRejected:0};
 const {data:run,error:runError}=await db.from("feed_import_runs")
  .select("id,merchant_id,status,permission_status").eq("id",input.importId).maybeSingle();
 if(runError||!run||run.merchant_id!==input.advertiser||
    run.permission_status!=="unverified"||run.status==="importing")
  return {status:"import_not_completed",eligible:0,canonicalAccepted:0,canonicalRejected:0};
 let query=db.from("feed_import_records")
  .select("id,import_id,merchant_product_id,title,price,currency,brand,category,status,metadata,image_url")
  .eq("import_id",input.importId).eq("merchant_id",input.advertiser)
  .eq("status","review")
  .contains("metadata",{live_feed_digest:input.digest});
 // When a rotating cohort submits exact newly verified SKUs, do NOT let
 // an earlier digest-matched cohort monopolise the first 100 rows.
 if(input.merchantProductIds)query=query.in("merchant_product_id",input.merchantProductIds);
 const {data:rows,error}=await query.order("created_at",{ascending:false}).limit(100);
 if(error)return {status:"private_review_unavailable",eligible:0,canonicalAccepted:0,canonicalRejected:0};
 const checked=Date.now();
 const ready=(rows??[]).map(r=>toFreshVerifiedAwinRaw(r,input.advertiser,input.feed,input.digest,checked))
  .filter((r):r is RawSourceOffer=>r!==null).slice(0,limit);
 if(!ready.length)return {status:"no_fresh_exact_feed_rows",eligible:0,canonicalAccepted:0,canonicalRejected:0};
 const {runDealIntelligencePipeline}=await import("../pipeline/run");
 const result:PipelineRunSummary=await runDealIntelligencePipeline(db,{
  sourceKey:"awin",limit:ready.length,awinAdvertiserId:input.advertiser,
  awinVerifiedRows:ready,awinPrivateStaging:privateMode
 });
 if(result.status!=="completed")
  return {status:"canonical_pipeline_failed",eligible:ready.length,
   canonicalAccepted:result.accepted,canonicalRejected:result.rejected};
 return {status:"canonical_held",eligible:ready.length,
  canonicalAccepted:result.accepted,canonicalRejected:result.rejected};
}
