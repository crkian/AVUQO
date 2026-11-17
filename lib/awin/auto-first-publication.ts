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
  .select("id,source_id,product_id,merchant_id,status,price,currency,last_seen_at,stock_status,affiliate_url,match_confidence")
  .eq("source_id",source.id).eq("status","active").eq("currency","GBP")
  .order("last_seen_at",{ascending:false}).limit(Math.min(Math.max(limit*4,20),100));
 if(offersError)return {...outcome,status:"offers_unavailable"};
 if(!offers?.length)return {...outcome,status:"no_held_offers"};
 const ids=offers.map(o=>o.id);
 const merchantIds=[...new Set(offers.map(o=>o.merchant_id))];
 const [{data:deals,error:dealsError},{data:scores,error:scoresError},
  {data:merchants,error:merchantsError},{data:programmes,error:programmesError},
  {data:reviews,error:reviewsError}]=await Promise.all([
  db.from("published_deals").select("offer_id,product_id,status,current_price").in("offer_id",ids),
  db.from("deal_scores").select("offer_id,score,confidence,calculated_at").in("offer_id",ids),
  db.from("merchants").select("id,metadata").in("id",merchantIds),
  db.from("affiliate_programs").select("external_account_id,region,metadata")
   .eq("provider","awin").eq("region","GB"),
  db.from("awin_offer_release_reviews").select("offer_id,status").in("offer_id",ids),
 ]);
 if(dealsError||scoresError||merchantsError||programmesError||reviewsError)
  return {...outcome,status:"release_evidence_unavailable"};
 const d=new Map((deals??[]).map(x=>[x.offer_id,x]));
 const s=new Map((scores??[]).map(x=>[x.offer_id,x]));
 const m=new Map((merchants??[]).map(x=>[x.id,x]));
 const approved=new Set((programmes??[]).filter(p=>
  meta(meta(p.metadata).owner_joined_accepted_attestation).membership_status==="accepted"
  &&typeof p.external_account_id==="string").map(p=>p.external_account_id));
 const reviewed=new Set((reviews??[]).filter(x=>x.status==="approved").map(x=>x.offer_id));
 const now=Date.now();
 let checked=0,skipped=0,failed=0,released=0;
 for(const offer of offers){
  if(checked>=Math.min(Math.max(limit,1),15))break;
  checked++;
  const advertiser=meta(m.get(offer.merchant_id)?.metadata).external_id;
  const deal=d.get(offer.id),score=s.get(offer.id);
  if(typeof advertiser!=="string"||!/^[0-9]{2,12}$/.test(advertiser)||
     !approved.has(advertiser)||reviewed.has(offer.id)||
     !deal||deal.status!=="held"||deal.product_id!==offer.product_id||
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
