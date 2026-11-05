/**
 * Advertiser-scoped, conservative programme terms recorded from owner-supplied
 * Awin PDFs (5 Nov 2026) and linked Holiday Extras offer/welcome packs.
 *
 * These are operational restrictions, NOT verified contractual grants to copy
 * all feed contents, show merchant photos or publicly release offers.
 * Absence of a programme here must fail closed.
 */
export const AWIN_PROGRAMME_POLICY = {
 "12715": {
  name:"Tyres UK", category:"motoring/tyres", kind:"tyre_marketplace",
  terms_updated:"2020-12-07", feed_ids:["93988"],
  paid_search:"restricted_no_full_commission", css_separate_account:false,
  insurance_iar_required:false, feed_publication_verified:false,
  images_publication_verified:false, pricing_model:"delivered_or_fitted_unverified"
 },
 "15236": {
  name:"Tyres Pneus Online UK", category:"motoring/tyres", kind:"tyre_retailer",
  terms_updated:"2018-08-06", feed_ids:["26513"],
  paid_search:"google_bing_prohibited", css_separate_account:false,
  insurance_iar_required:false, feed_publication_verified:false,
  images_publication_verified:false, pricing_model:"delivered_or_fitted_unverified"
 },
 "3496": {
  name:"Holiday Extras", category:"travel/airport-extras", kind:"travel_booking",
  terms_updated:"2026-06-05", feed_ids:[],
  paid_search:"brand_bidding_prohibited_and_generic_keywords_restricted",
  css_separate_account:false, insurance_iar_required:true,
  feed_publication_verified:false, images_publication_verified:false,
  pricing_model:"date_dependent_ex_vat_sell_price"
 },
 "128157": {
  name:"Lyca Mobile UK", category:"tech/sim-only", kind:"mobile_plan",
  terms_updated:"2026-07-07", feed_ids:[],
  paid_search:"restricted_no_full_commission",css_separate_account:false,
  insurance_iar_required:false,feed_publication_verified:false,
  images_publication_verified:false,pricing_model:"recurring_plan"
 },
 "37738": {
  name:"1pMobile", category:"tech/sim-only", kind:"mobile_plan",
  terms_updated:"2022-11-09",feed_ids:[],
  paid_search:"conditional_programme_rules",css_separate_account:false,
  insurance_iar_required:false,feed_publication_verified:false,
  images_publication_verified:false,pricing_model:"payg_or_recurring_plan"
 },
 "45747": {
  name:"Craft Buddy Shop", category:"shopping/arts-crafts", kind:"physical_products",
  terms_updated:"2023-03-02",feed_ids:[],
  paid_search:"restricted_no_full_commission",css_separate_account:false,
  insurance_iar_required:false,feed_publication_verified:false,
  images_publication_verified:false,pricing_model:"unit_price"
 },
 "118401": {
  name:"Compare Parking Prices UK", category:"travel/airport-parking", kind:"travel_booking",
  terms_updated:"2025-07-31",feed_ids:[],
  paid_search:"conditional_programme_rules",css_separate_account:true,
  insurance_iar_required:false,feed_publication_verified:false,
  images_publication_verified:false,pricing_model:"dated_booking_total"
 }
} as const;

export type ProgrammeId=keyof typeof AWIN_PROGRAMME_POLICY;
export function programmePolicy(advertiserId:string){
 return Object.prototype.hasOwnProperty.call(AWIN_PROGRAMME_POLICY,advertiserId)
  ?AWIN_PROGRAMME_POLICY[advertiserId as ProgrammeId]:null;
}
export function programmeAllowsAutomaticPublication(advertiserId:string):false{
 // Explicit merchant-specific authorisation, per-row validation and an owner
 // release gate are necessary beyond an Awin programme description.
 void advertiserId;
 return false;
}
export function programmeAllowsInsuranceAffiliateLink(advertiserId:string,iarContractVerified:boolean){
 const programme=programmePolicy(advertiserId);
 if(!programme)return false;
 if(programme.insurance_iar_required)return iarContractVerified===true;
 return false; // Other advertisers not approved for insurance in this registry.
}
export function programmeAllowsPaidSearch(advertiserId:string){
 const programme=programmePolicy(advertiserId);
 return programme?.paid_search==="conditional_programme_rules"
  ?{permitted_in_principle:true,needs_keyword_and_campaign_review:true}
  :{permitted_in_principle:false,needs_keyword_and_campaign_review:true};
}
