import {shoppingAdmissionFailures} from "./shopping-admission.ts";
import {sourceIngestionFailures,type ExternalSource} from "../pipeline/source-readiness.ts";

type Row=Record<string,unknown>;
const record=(v:unknown):Row=>v&&typeof v==="object"&&!Array.isArray(v)?v as Row:{};
const str=(v:unknown)=>typeof v==="string"?v:"";
export function shoppingReleaseFailures(input:{
 offer:Row;review:Row;source:ExternalSource & {id:string};merchant:Row;
 programme:Row;product:Row;controls:ReadonlyArray<{control_key:string;enabled:boolean}>;
 connectorConfigured:boolean;
},now=Date.now()):string[]{
 const {offer:o,review:r,source:s,merchant:m,programme:p,product,controls}=input;
 const raw=record(o.raw_data),meta=record(s.metadata),pm=record(p.metadata);
 const advertiser=str(record(m.metadata).external_id);
 const flags=new Map(controls.map(x=>[x.control_key,x.enabled]));
 const verified=str(raw.live_feed_verified_at),digest=str(raw.live_feed_digest);
 const reviewed=Date.parse(str(r.reviewed_offer_at)),approved=Date.parse(str(r.approved_at));
 const exact=r.offer_id===o.id&&r.source_id===o.source_id&&s.id===o.source_id&&
  r.advertiser_id===advertiser&&r.source_offer_id===o.source_offer_id&&
  m.id===o.merchant_id&&product.id===o.product_id;
 const failures=shoppingAdmissionFailures({
  advertiserId:advertiser,sourceOfferId:str(o.source_offer_id),sku:str(raw.merchant_product_id),
  currency:str(o.currency),price:Number(o.price),stock:str(o.stock_status),
  lastSeenAt:str(o.last_seen_at),affiliateUrl:str(o.affiliate_url)||null,
  matchConfidence:Number(o.match_confidence),feedDigest:digest,verifiedAt:verified,
  sourceCurrencyExplicit:raw.source_currency_explicit===true,
  feedId:str(raw.feed_id),currencyBasis:raw.source_currency_explicit===false?str(raw.currency_source):"",
  exactSourceMatch:exact,
  sourceRights:s.connector_key==="awin"&&meta.publication_permission==="verified"&&
   meta.price_evidence_status==="verified"&&sourceIngestionFailures(s,{
    advertiserId:advertiser,connectorConfigured:input.connectorConfigured,now}).length===0,
  programmeApproved:p.provider==="awin"&&p.region==="GB"&&p.external_account_id===advertiser&&
   record(pm.owner_joined_accepted_attestation).membership_status==="accepted"&&
   pm.publication_approved===true&&m.status==="active",
  ownerGrant:r.status==="approved"&&!!str(r.approved_by)&&Number.isFinite(approved)&&
   approved<=now+300000&&Number.isFinite(reviewed)&&reviewed<=approved+300000&&
   r.reviewed_currency==="GBP"&&Number(r.reviewed_price)===Number(o.price)&&
   r.reviewed_feed_digest===digest&&reviewed===Date.parse(verified)&&
   Date.parse(str(o.last_seen_at))>=reviewed,
  controlsEnabled:flags.get("global_emergency_stop")===false&&
   flags.get("source_ingestion")===true&&flags.get("shopping_publishing")===true,
  reviewStatus:str(r.status)
 },now);
 if(o.status!=="active"||product.status!=="active")failures.push("inactive_inventory");
 for(const [key,direction] of [["valid_from","start"],["valid_until","end"]] as const){
  if(o[key]!==null&&o[key]!==undefined){
   const t=Date.parse(str(o[key]));
   if(!Number.isFinite(t)||(direction==="start"?t>now:t<=now))failures.push("outside_validity_window");
  }
 }
 return failures;
}
