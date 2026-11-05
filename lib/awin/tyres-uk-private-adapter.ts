import {prepareGeneralBatch} from "../feed-imports/general-awin-large";
import {inspectPrivateTyreRowEvidence} from "./tyre-row-evidence";
import {candidateTyresUkTechnicalSpecs} from "./tyres-uk-technical-evidence";

/**
 * Tyres UK (Awin 12715, feed 93988), PRIVATE owner-review staging only.
 * The published public offer pipeline is intentionally not used.
 *
 * Only explicit GBP fields are accepted. Tyre dimensions extracted from
 * descriptions are unverified candidates, never verified vehicle fitment.
 */
export function prepareTyresUkPrivateBatch(
 advertiser:string,feedId:string,headers:string[],rows:string[][]
){
 if(advertiser!=="12715"||feedId!=="93988")
  throw Error("tyres_uk_feed_binding_mismatch");
 for(const field of ["merchant_id","merchant_product_id","product_name",
  "description","search_price","currency","aw_deep_link"]){
  if(!headers.includes(field))throw Error("tyres_uk_required_field_missing");
 }
 const oversizedIndex=headers.indexOf("custom_6");
 const sanitized=rows.map(row=>{
  if(oversizedIndex<0||row[oversizedIndex].length<=10000)return row;
  if(row[oversizedIndex].length>20000)throw Error("tyres_uk_custom_6_oversize");
  const copy=[...row];copy[oversizedIndex]=copy[oversizedIndex].slice(0,10000);
  return copy;
 });
 const base=prepareGeneralBatch(advertiser,feedId,headers,sanitized);
 const descriptionAt=headers.indexOf("description");
 const categoryAt=headers.indexOf("merchant_category");
 const deliveryAt=headers.indexOf("delivery_cost");
 const seenAt=headers.indexOf("last_updated");
 return base.map((record,index)=>{
  const description=rows[index][descriptionAt]??"";
  const rawCategory=categoryAt>=0?rows[index][categoryAt]??"":"";
  const technical=candidateTyresUkTechnicalSpecs(Object.fromEntries(headers.map((key,col)=>[key,rows[index][col]??""])));
  const evidence=inspectPrivateTyreRowEvidence({
   title:record.title,description,category:rawCategory,
   currency:record.currency,price:record.price??""
  });
  const reasons=[...record.reasons];
  if(!evidence.gbp_explicit)reasons.push("tyre_gbp_not_explicit");
  if(!evidence.price_format_valid)reasons.push("tyre_price_unusable");
  if(evidence.blocked_non_tyre)reasons.push("tyre_accessory_or_service");
  if(evidence.size_conflict)reasons.push("tyre_size_conflict");
  if(!evidence.size_candidate)reasons.push("tyre_size_candidate_missing");
  const rawDelivery=deliveryAt>=0?(rows[index][deliveryAt]??"").trim():"";
  const deliveryNumeric=/^\d+(?:\.\d{1,2})?$/.test(rawDelivery)
   ?Number(rawDelivery):null;
  return {
   ...record,
   status:reasons.length?"excluded" as const:"review" as const,
   reasons,
   // This field is not a canonical category. Canonical assignment is a
   // separate owner approval step in the public products pipeline.
   category:"Motoring > Tyres",
   metadata:{
    ...record.metadata,
    tyre_adapter:"tyres_uk_private_v1",
    oversized_custom_6_redacted:oversizedIndex>=0&&rows[index][oversizedIndex].length>10000,
    feed_advertiser_id:"12715",
    feed_id:"93988",
    retailer_category_raw:rawCategory.slice(0,500),
    source_updated_at:seenAt>=0?(rows[index][seenAt]??"").trim().slice(0,100):null,
    tyre_size_candidate:evidence.size_candidate,
    tyre_size_source:evidence.size_candidate?"retailer_text_unverified":null,
    tyre_size_verified:false,
    tyre_size_conflict:evidence.size_conflict,
    tyre_technical_spec_candidate:technical,
    load_index_candidate:technical.load_index_candidate,
    speed_rating_candidate:technical.speed_rating_candidate,
    load_index_verified:false,
    speed_rating_verified:false,
    season_verified:false,
    price_currency_explicit:evidence.gbp_explicit,
    source_delivery_cost_numeric:deliveryNumeric,
    delivery_cost_verified:false,
    fitted_price_verified:false,
    price_basis_verified:false,
    product_rights_verified:false,
    category_classification_status:"needs_review",
    canonical_category_approved:false,
    auto_match_approved:false,
    release_approved:false,
    price_observation_kind:"private_import",
   }
  };
 });
}
