import "server-only";
import {createAdminClient} from "../supabase/admin";
import {sourceEvidenceFailures, evaluateSourceControls} from "../pipeline/source-readiness";
import {ownAffiliateLink} from "../awin/approved-offer-renewal";

/** Public offer admission. Deny by default: imported, demo and stale rows are not commercial evidence. */
export type PublicOffer={
 published:{offer_id:string;product_id:string;title:string;category:string;merchant:string;current_price:number;typical_price:number|null;saving_amount:number|null;avuqo_score:number;confidence:number;label:string;decision:string;image_url:string|null;stock_status:string|null;reason:string|null;updated_at:string|null};
 offer:{id:string;product_id:string;source_id:string;price:number;total_price:number|null;currency:string;status:string;source_url:string|null;affiliate_url:string|null;last_seen_at:string|null;valid_until:string|null;stock_status:string|null;match_confidence:number|null};
 source:{id:string;name:string;imageAllowed:boolean};
 image_gallery?:Array<{url:string;role:string}>;
};
export type PublicProduct={
 id:string;slug:string;canonical_title:string;brand:string|null;model:string|null;description:string|null;primary_image_url:string|null;specifications:unknown;status:string;product_type:string|null;
 image_gallery?:Array<{url:string;role:string}>;
};
function metadata(raw:unknown):Record<string,unknown>{return raw&&typeof raw==="object"&&!Array.isArray(raw)?raw as Record<string,unknown>:{};}
function isHttps(value:string|null){if(!value)return false;try{const u=new URL(value);return u.protocol==="https:"&&!u.username&&!u.password&&u.hostname.length>3;}catch{return false;}}
/** Public supplier gallery: all images require an eligible Awin release,
 * exact source mapping and a previously owner-confirmed image-rights scope.
 * Do not emit private, signed API, local network or executable URLs.
 */
function verifiedSupplierGallery(raw:unknown):Array<{url:string;role:string}>{
 const candidate=metadata(raw).source_supplied_gallery;
 if(!Array.isArray(candidate))return [];
 const seen=new Set<string>(),result:Array<{url:string;role:string}>=[];
 for(const item of candidate.slice(0,24)){
  const record=metadata(item),value=record.url;
  if(typeof value!=="string"||value.length>2048)continue;
  try{
   const u=new URL(value),host=u.hostname.toLowerCase();
   if(u.protocol!=="https:"||u.username||u.password||u.port||
    host==="localhost"||host.endsWith(".local")||host.endsWith(".internal")||
    /^(127\.|10\.|192\.168\.|169\.254\.|0\.|172\.(1[6-9]|2[0-9]|3[01])\.)/.test(host)||
    [...u.searchParams.keys()].some(k=>/^(token|signature|api_key|apikey|access_token|authorization|secret)$/i.test(k)))continue;
   if(seen.has(u.href))continue;seen.add(u.href);
   result.push({url:u.href,role:typeof record.role==="string"&&/^[a-z0-9_-]{1,40}$/.test(record.role)?record.role:"alternate"});
  }catch{}
 }
 return result;
}
function sourceReady(source:Record<string,unknown>|undefined,advertiserId?:string):boolean{
 if(!source || source.status!=="active" || source.sync_enabled!==true ||
   !source.connector_key || source.connector_key==="demo" || source.source_type==="internal_test") return false;
 const rights=metadata(source.metadata);
 if(rights.publication_permission!=="verified" || rights.price_evidence_status!=="verified") return false;
 return sourceEvidenceFailures({
   status:String(source.status),sync_enabled:source.sync_enabled===true,
   credential_status:typeof source.credential_status==="string"?source.credential_status:null,
   connector_key:String(source.connector_key),
   source_type:typeof source.source_type==="string"?source.source_type:null,
   metadata:source.metadata,
 },{
   advertiserId:source.connector_key==="awin"?advertiserId:undefined,
   connectorConfigured:source.connector_key==="awin"
     ?Boolean(process.env.AWIN_PUBLISHER_ID&&process.env.AWIN_ACCESS_TOKEN)
     :false,
 }).length===0;
}

function offerFresh(row:Record<string,unknown>,now:number,isAwin=false):boolean{
 if(row.status!=="active"||row.currency!=="GBP"||!(Number(row.price)>0)||!isHttps((row.affiliate_url||row.source_url) as string|null))return false;
 const checked=Date.parse(String(row.last_seen_at??""));const maxAge=isAwin?48*3600_000:7*24*3600_000;
 if(!Number.isFinite(checked)||now-checked>maxAge||checked>now+3600_000)return false;
 // Awin must automatically disappear from public pages on stock loss or stale price evidence.
 if(isAwin&&!["in_stock","low_stock"].includes(String(row.stock_status??"")))return false;
 if(row.valid_until&&Date.parse(String(row.valid_until))<now)return false;
 // Refuse ambiguous matching confidence. Accepted scale is [0,1] or [0,100].
 const match=row.match_confidence===null?NaN:Number(row.match_confidence);
 if(!Number.isFinite(match)||match<(match>1?85:0.85))return false;
 return true;
}
const SELECT_DEAL="offer_id,product_id,title,category,merchant,current_price,typical_price,saving_amount,avuqo_score,confidence,label,decision,image_url,stock_status,reason,updated_at";
const SELECT_OFFER="id,product_id,source_id,merchant_id,price,total_price,currency,status,source_url,affiliate_url,last_seen_at,valid_until,stock_status,match_confidence,raw_data";
export async function verifiedOffers(options:{productId?:string;offerId?:string;offerIds?:readonly string[];limit?:number}={}):Promise<PublicOffer[]>{
 try{
  const db=createAdminClient();
  // An owner emergency stop or publication pause hides even previously
  // published rows. Missing control rows or query errors fail closed.
  const {data:flags,error:flagsError}=await db.from("system_controls")
    .select("control_key,enabled")
    .in("control_key",["global_emergency_stop","deal_publishing","source_ingestion"]);
  if(!evaluateSourceControls(flags,!!flagsError).publishing)return [];
  const limit=Math.max(1,Math.min(options.limit??24,60));
  let q=db.from("published_deals").select(SELECT_DEAL).eq("status","published").order("updated_at",{ascending:false}).limit(Math.min(limit*10,500));
  if(options.productId)q=q.eq("product_id",options.productId);
  if(options.offerId)q=q.eq("offer_id",options.offerId);
  if(options.offerIds){
   const ids=options.offerIds.filter(id=>/^[0-9a-f-]{36}$/i.test(id)).slice(0,120);
   if(!ids.length)return [];
   q=q.in("offer_id",ids);
  }
  const {data:published,error}=await q;if(error||!published?.length)return [];
  const ids=published.map(d=>d.offer_id).filter(Boolean);
  const {data:offers,error:offersError}=await db.from("offers").select(SELECT_OFFER).in("id",ids).eq("status","active");
  if(offersError||!offers?.length)return [];
  const sourceIds=[...new Set(offers.map(o=>o.source_id).filter(Boolean))];
  if(!sourceIds.length)return [];
  const {data:sources,error:sourceError}=await db.from("sources").select("id,name,status,sync_enabled,credential_status,connector_key,source_type,metadata").in("id",sourceIds);
  if(sourceError||!sources?.length)return [];
  // Resolve each Awin offer to its own canonical merchant/advertiser identity.
  // A single AWIN_ADVERTISER_ID environment variable must not govern every
  // joined merchant's customer-facing offer.
  const awinSourceIdSet=new Set(sources.filter(s=>s.connector_key==="awin").map(s=>s.id));
  const awinOffers=offers.filter(o=>awinSourceIdSet.has(o.source_id));
  const merchantIds=[...new Set(awinOffers.map(o=>o.merchant_id).filter(Boolean))];
  const [{data:merchantRows,error:merchantError},{data:programmeRows,error:programmeError}]=await Promise.all([
   merchantIds.length
    ?db.from("merchants").select("id,metadata").in("id",merchantIds)
    :Promise.resolve({data:[],error:null}),
   awinOffers.length
    ?db.from("affiliate_programs").select("external_account_id,region,metadata")
      .eq("provider","awin")
    :Promise.resolve({data:[],error:null})
  ]);
  if(merchantError||programmeError)return [];
  const merchantAdvertisers=new Map((merchantRows??[]).map(m=>{
   const id=metadata(m.metadata).external_id;
   return [m.id,typeof id==="string"&&/^\d{2,12}$/.test(id)?id:null] as const;
  }));
  const acceptedAdvertisers=new Set((programmeRows??[]).filter(p=>
   p.region==="GB"&&metadata(metadata(p.metadata).owner_joined_accepted_attestation).membership_status==="accepted"&&
   metadata(p.metadata).publication_approved===true&&
   typeof p.external_account_id==="string"&&/^\d{2,12}$/.test(p.external_account_id)
  ).map(p=>p.external_account_id as string));
  // Awin requires a separate, owner-only per-offer release record in addition
  // to a published row. Admins cannot forge this through REST.
  const awinSourceIds=new Set(sources.filter(s=>s.connector_key==="awin").map(s=>s.id));
  const awinOfferIds=offers.filter(o=>awinSourceIds.has(o.source_id)).map(o=>o.id);
  let releaseMap=new Map<string,{
   offer_id:string;source_id:string;advertiser_id:string;status:string;
   reviewed_price:number;reviewed_offer_at:string;reviewed_score_at:string;
  }>();
  let scoreMap=new Map<string,{offer_id:string;score:number;confidence:number;calculated_at:string}>();
  if(awinOfferIds.length){
   const [{data:releases,error:releaseError},{data:scoreRows,error:scoreError}]=await Promise.all([
    db.from("awin_offer_release_reviews")
     .select("offer_id,source_id,advertiser_id,status,reviewed_price,reviewed_offer_at,reviewed_score_at")
     .in("offer_id",awinOfferIds),
    db.from("deal_scores").select("offer_id,score,confidence,calculated_at")
     .in("offer_id",awinOfferIds)
   ]);
   if(releaseError||scoreError)return [];
   releaseMap=new Map((releases??[]).map(r=>[r.offer_id,r]));
   scoreMap=new Map((scoreRows??[]).map(r=>[r.offer_id,r]));
  }
  const sourceMap=new Map(sources.map(s=>[s.id,s]));
  const offerMap=new Map(offers.map(o=>[o.id,o]));
  const now=Date.now();
  return published.flatMap(d=>{
   const offer=offerMap.get(d.offer_id);if(!offer)return [];
   const source=sourceMap.get(offer.source_id);if(!source)return [];
   const advertiserId=source.connector_key==="awin"?merchantAdvertisers.get(offer.merchant_id):undefined;
   if(source.connector_key==="awin"&&(!advertiserId||!acceptedAdvertisers.has(advertiserId)))return [];
   if(!sourceReady(source as Record<string,unknown>,advertiserId??undefined)||
      !offerFresh(offer as Record<string,unknown>,now,source.connector_key==="awin"))return [];
   if(source.connector_key==="awin"){
    const approval=releaseMap.get(offer.id),score=scoreMap.get(offer.id);
    if(!approval||approval.status!=="approved"||approval.source_id!==source.id||
      approval.advertiser_id!==advertiserId||
      !score||score.score<60||score.confidence<55||
      // Exact-price, already-approved offers can renew with a newer source
      // observation and score. Price changes or revoked reviews fail closed.
      !Number.isFinite(Date.parse(approval.reviewed_offer_at))||
      !Number.isFinite(Date.parse(approval.reviewed_score_at))||
      Date.parse(offer.last_seen_at??"")<Date.parse(approval.reviewed_offer_at)||
      Date.parse(score.calculated_at)<Date.parse(approval.reviewed_score_at)||
      Date.now()-Date.parse(score.calculated_at)>48*3600_000||
      Date.parse(score.calculated_at)>Date.now()+300000||
      Number(approval.reviewed_price)!==Number(offer.price)||
      Number(d.current_price)!==Number(offer.price)||
      !ownAffiliateLink(offer.affiliate_url,advertiserId!))return [];
   }
   if(offer.product_id!==d.product_id||!(Number(d.current_price)>0)||!Number.isFinite(Number(d.avuqo_score)))return [];
   const rights=metadata(source.metadata);
   const imageAllowed=rights.image_rights_confirmed===true;
   // Awin feed price is a product price. Do not misrepresent unknown delivery
   // charges as a verified delivered total, even when legacy DB total_price=price.
   // A separate delivery-cost verification is required before showing a total.
   const {raw_data:privateOfferEvidence,...safeOffer}=offer;
   const evidence=metadata(privateOfferEvidence);
   // Gallery rights must belong to this exact admitted offer, not another
   // merchant sharing the canonical product. Never serialize raw feed metadata.
   const gallery=source.connector_key==="awin"&&imageAllowed&&
    evidence.source_image_rights_confirmed===true&&
    typeof evidence.live_feed_digest==="string"&&/^[a-f0-9]{64}$/.test(evidence.live_feed_digest)&&
    typeof evidence.live_feed_verified_at==="string"&&
    Date.parse(evidence.live_feed_verified_at)<=now+300000&&
    now-Date.parse(evidence.live_feed_verified_at)<=48*3600_000
     ?verifiedSupplierGallery({source_supplied_gallery:evidence.permitted_image_gallery}):[];
   const displayedOffer=source.connector_key==="awin"?{...safeOffer,total_price:null}:safeOffer;
   return [{published:{...d,image_url:imageAllowed&&isHttps(d.image_url)?d.image_url:null},
     offer:displayedOffer,source:{id:source.id,name:source.name,imageAllowed},image_gallery:gallery} as PublicOffer];
  }).slice(0,limit);
 }catch{return [];}
}
export async function verifiedProduct(slug:string):Promise<{product:PublicProduct;offers:PublicOffer[]}|null>{
 if(!/^[a-z0-9][a-z0-9-]{2,159}$/.test(slug))return null;
 try{
  const db=createAdminClient();
  const {data,error}=await db.from("products").select("id,slug,canonical_title,brand,model,description,primary_image_url,specifications,status,product_type,metadata").eq("slug",slug).eq("status","active").maybeSingle();
  if(error||!data)return null;
  const offers=await verifiedOffers({productId:data.id,limit:35});
  if(!offers.length)return null;
  const {metadata:privateMetadata,...publicProduct}=data;
  // Retain only galleries attached to admitted offers; legacy product-level
  // galleries lack merchant-specific rights provenance.
  void privateMetadata;
  const gallery=[...new Map(offers.flatMap(o=>o.image_gallery??[]).map(image=>[image.url,image])).values()].slice(0,24);
  return {product:{...publicProduct,image_gallery:gallery} as PublicProduct,offers};
 }catch{return null;}
}
export async function verifiedProductIndex(limit=60):Promise<{product:PublicProduct;offers:PublicOffer[]}[]>{
 try{
  const offers=await verifiedOffers({limit:Math.max(limit*4,80)});
  const ids=[...new Set(offers.map(o=>o.published.product_id))].slice(0,limit);
  if(!ids.length)return [];
  const db=createAdminClient();
  const {data,error}=await db.from("products").select("id,slug,canonical_title,brand,model,description,primary_image_url,specifications,status,product_type").in("id",ids).eq("status","active");
  if(error||!data)return [];
  return (data as PublicProduct[]).filter(p=>/^[a-z0-9][a-z0-9-]{2,159}$/.test(p.slug)).map(product=>({product,offers:offers.filter(o=>o.published.product_id===product.id)})).filter(x=>x.offers.length).slice(0,limit);
 }catch{return [];}
}

/** Merchant-specific storefront shelf. Filter candidate offer IDs BEFORE the
 * existing public rights / approval / match / freshness checks, so a small
 * approved retailer is not hidden by Tooled Up's much larger latest cohort.
 * The exact Awin advertiser binding comes from the merchant registry, not a
 * customer-supplied URL. No private product rows are returned here. */
export async function verifiedOffersForAdvertiser(advertiserId:string,limit=15):Promise<PublicOffer[]>{
 if(!/^[0-9]{2,12}$/.test(advertiserId))return [];
 try{
  const db=createAdminClient();
  const {data:merchants,error:merchantError}=await db.from("merchants")
   .select("id").filter("metadata->>external_id","eq",advertiserId).limit(5);
  if(merchantError||!merchants?.length)return [];
  const {data:offers,error}=await db.from("offers").select("id")
   .in("merchant_id",merchants.map(m=>m.id)).eq("status","active")
   .order("last_seen_at",{ascending:false}).limit(120);
  if(error||!offers?.length)return [];
  return verifiedOffers({offerIds:offers.map(o=>o.id),limit:Math.max(1,Math.min(limit,60))});
 }catch{return [];}
}
