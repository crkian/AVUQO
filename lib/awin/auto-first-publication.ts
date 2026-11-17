import type {createAdminClient} from "../supabase/admin";
import {evaluateSourceControls,sourceEvidenceFailures} from "../pipeline/source-readiness";
import {ownAffiliateLink} from "./approved-offer-renewal";

type Db=ReturnType<typeof createAdminClient>;
const meta=(raw:unknown):Record<string,unknown>=>raw&&typeof raw==="object"&&!Array.isArray(raw)?raw as Record<string,unknown>:{};
const recent=(value:string|null,now:number)=>!!value&&Number.isFinite(Date.parse(value))&&
 Date.parse(value)<=now+300000&&Date.parse(value)>=now-48*3600_000;
const exactConfidence=(value:unknown)=>{
 const n=Number(value);
 return Number.isFinite(n)&&(n>1?n>=85:n>=0.85);
};

/**
 * Owner has authorised automatic release of eligible Awin products across
 * accepted programmes. This is a BOUNDED execution of that standing grant,
 * NOT a substitute for network rights or live product evidence.
 *
 * Reuse the existing transactional owner-release RPC, including its audit.
 * Any missing evidence leaves an offer held. Never stamp an observation,
 * enable a source, infer image rights, or insert synthetic approval records.
 */
export async function autoReleaseEligibleAwinOffers(db:Db,limit=15){
 const outcome={status:"blocked",checked:0,approved:0,skipped:0,failed:0};
 const {data:source,error:sourceError}=await db.from("sources")
  .select("id,status,sync_enabled,credential_status,connector_key,source_type,metadata")
  .eq("connector_key","awin").maybeSingle();
 if(sourceError||!source)return {...outcome,status:"source_unavailable"};
 const grant=meta(meta(source.metadata).owner_publication_authorization);
 if(grant.status!=="granted"||grant.automation_requested!==true)
  return {...outcome,status:"standing_owner_grant_absent"};
 const sourceMeta=meta(source.metadata);
 if(source.status!=="active"||source.sync_enabled!==true||
    source.credential_status!=="ready"||
    sourceMeta.publication_permission!=="verified"||
    sourceMeta.price_evidence_status!=="verified")
  return {...outcome,status:"source_not_release_ready"};
 const configured=Boolean(process.env.AWIN_ACCESS_TOKEN&&
  process.env.AWIN_PUBLISHER_ID==="3135746");
 if(!configured)return {...outcome,status:"server_credential_evidence_missing"};
 const [{data:controls,error:controlError},{data:owners,error:ownerError}]=await Promise.all([
  db.from("system_controls").select("control_key,enabled")
   .in("control_key",["global_emergency_stop","source_ingestion","deal_publishing"]),
  db.from("user_roles").select("user_id").eq("role","owner").limit(2),
 ]);
 const flags=evaluateSourceControls(controls,!!controlError);
 if(!flags.ingestion||!flags.publishing)return {...outcome,status:"publishing_paused"};
 if(ownerError||owners?.length!==1)return {...outcome,status:"unique_owner_unavailable"};

 const {data:offers,error:offersError}=await db.from("offers")
  .select("id,source_id,product_id,merchant_id,status,title,price,currency,last_seen_at,stock_status,affiliate_url,match_confidence,raw_data")
  .eq("source_id",source.id).eq("status","active").eq("currency","GBP")
  .order("last_seen_at",{ascending:false}).limit(Math.min(Math.max(limit*4,20),100));
 if(offersError)return {...outcome,status:"offers_unavailable"};
 if(!offers?.length)return {...outcome,status:"no_held_offers"};
 const ids=offers.map(o=>o.id);
 const merchantIds=[...new Set(offers.map(o=>o.merchant_id))];
 const [{data:deals,error:dealsError},{data:scores,error:scoresError},
  {data:merchants,error:merchantsError},{data:programmes,error:programmesError},
  {data:reviews,error:reviewsError},{data:products,error:productsError}]=await Promise.all([
  db.from("published_deals").select("offer_id,product_id,status,current_price").in("offer_id",ids),
  db.from("deal_scores").select("offer_id,score,confidence,calculated_at").in("offer_id",ids),
  db.from("merchants").select("id,metadata").in("id",merchantIds),
  db.from("affiliate_programs").select("external_account_id,region,metadata")
   .eq("provider","awin").eq("region","GB"),
  db.from("awin_offer_release_reviews").select("offer_id,status").in("offer_id",ids),
  db.from("products").select("id,status,primary_image_url").in("id",[...new Set(offers.map(o=>o.product_id))]),
 ]);
 if(dealsError||scoresError||merchantsError||programmesError||reviewsError||productsError)
  return {...outcome,status:"release_evidence_unavailable"};
 const d=new Map((deals??[]).map(x=>[x.offer_id,x]));
 const s=new Map((scores??[]).map(x=>[x.offer_id,x]));
 const m=new Map((merchants??[]).map(x=>[x.id,x]));
 const p=new Map((products??[]).map(x=>[x.id,x]));
 const approved=new Set((programmes??[]).filter(p=>
  meta(meta(p.metadata).owner_joined_accepted_attestation).membership_status==="accepted" && meta(p.metadata).publication_approved===true
  &&typeof p.external_account_id==="string").map(p=>p.external_account_id));
 // First publication is ONE-TIME per offer. A manual pause is a safety
 // withdrawal and must never be silently auto-overridden by the worker.
 // An explicit signed-in owner release is required to reconsider any paused row.
 const reviewed=new Set((reviews??[]).map(x=>x.offer_id));
 const now=Date.now();
 let checked=0,skipped=0,failed=0,released=0;
 for(const offer of offers){
  if(checked>=Math.min(Math.max(limit,1),15))break;
  // Previously approved offers are renewed by the normal price pipeline.
  // They must not consume the bounded first-release capacity.
  if(reviewed.has(offer.id))continue;
  const advertiser=meta(m.get(offer.merchant_id)?.metadata).external_id;
  const deal=d.get(offer.id),score=s.get(offer.id),product=p.get(offer.product_id);
  if(typeof advertiser!=="string"||!/^[0-9]{2,12}$/.test(advertiser)||
     !approved.has(advertiser)||reviewed.has(offer.id)||
     !deal||deal.status!=="held"||deal.product_id!==offer.product_id||
     !product||product.status!=="draft"||!product.primary_image_url||
     Number(deal.current_price)!==Number(offer.price)||
     !(Number(offer.price)>0)||!recent(offer.last_seen_at,now)||
     !["in_stock","low_stock"].includes(offer.stock_status)||
     !exactConfidence(offer.match_confidence)||
     !ownAffiliateLink(offer.affiliate_url,advertiser)||
     !score||Number(score.score)<60||Number(score.confidence)<55||
     !recent(score.calculated_at,now)||
     sourceEvidenceFailures(source,{advertiserId:advertiser,connectorConfigured:configured}).length){
   skipped++;continue;
  }
  // First releases require a current authenticated feed row, matching this
  // exact advertiser, SKU, title, GBP price, own tracked link and its approved
  // supplier photo. A score and an active source alone are never sufficient.
  const raw=meta(offer.raw_data),sku=raw.merchant_product_id,feed=raw.feed_id;
  if(typeof sku!=="string"||!sku||typeof feed!=="string"||!feed){
   skipped++;continue;
  }
  const {data:sourceRows,error:rowsError}=await db.from("feed_import_records")
   .select("id,metadata,image_url,price,currency,title")
   .eq("merchant_id",advertiser).eq("merchant_product_id",sku)
   .eq("title",offer.title).eq("currency","GBP").eq("price",offer.price)
   .filter("metadata->>feed_id","eq",feed).limit(5);
  if(rowsError||!sourceRows?.some(row=>{
   const evidence=meta(row.metadata),checkedAt=Date.parse(String(evidence.live_feed_verified_at??""));
   return evidence.live_feed_verification==="exact_authenticated_feed_digest_rechecked"&&
    evidence.source_image_rights_confirmed===true&&
    evidence.tracking_link_verified===true&&
    evidence.verified_awin_deep_link===offer.affiliate_url&&
    typeof row.image_url==="string"&&row.image_url.startsWith("https://")&&
    Number.isFinite(checkedAt)&&checkedAt<=now+300000&&now-checkedAt<2*3600_000;
  })){skipped++;continue;}
  checked++;
  // The SQL function rechecks source, offer, price, score, global controls,
  // exact advertiser and held row atomically, then persists the release audit.
  const {error}=await db.rpc("record_awin_owner_release",{
   p_offer_id:offer.id,p_source_id:source.id,p_advertiser_id:advertiser,
   p_status:"approved",p_actor_id:owners[0].user_id,
   p_review_note:"Automatic first publication under recorded AVUQO owner grant",
   p_reviewed_price:offer.price,p_reviewed_offer_at:offer.last_seen_at,
   p_reviewed_score_at:score.calculated_at
  });
  if(error)failed++;else released++;
 }
 return {status:failed?"partial_failure":"checked",checked,approved:released,skipped,failed};
}
