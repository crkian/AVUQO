/**
 * First-party measurement contract v1. Classification and future collection
 * gates are defined here; no browser tracking or event intake is activated.
 */
export const ANALYTICS_EVENT_VERSION=1;
export const ANALYTICS_EVENTS=[
 "page_viewed","navigation_selected","search_submitted","search_results_returned",
 "search_result_selected","product_viewed","deal_opened","merchant_link_clicked",
 "watch_created","grocery_comparison_requested","grocery_comparison_completed",
 "grocery_complete_basket_available","grocery_missing_prices_shown"
] as const;
export type AnalyticsEventName=typeof ANALYTICS_EVENTS[number];
export const EVENT_DEFINITIONS:Readonly<Record<AnalyticsEventName,string>>={
 page_viewed:"Consented page view event (not a unique visitor or session)",
 navigation_selected:"Consented selection of a real AVUQO navigation route",
 search_submitted:"Consented search action, without storing the raw search text",
 search_results_returned:"Completed eligible search and the measured result count",
 search_result_selected:"Selected result from a measured search response",
 product_viewed:"Eligible, actual product detail view",
 deal_opened:"Opened an eligible deal, not proof of a purchase",
 merchant_link_clicked:"Redirect to a merchant, not a conversion",
 watch_created:"Watch persisted successfully, not evidence of alert delivery",
 grocery_comparison_requested:"Customer requested a basket comparison",
 grocery_comparison_completed:"Comparison executed successfully, whether complete or partial",
 grocery_complete_basket_available:"At least one store has all required eligible verified prices",
 grocery_missing_prices_shown:"Comparison explicitly displayed missing or excluded prices"
};
const ALLOWED_PROPERTIES=new Set([
 "result_count","route","category_id","product_id","offer_id","store_id",
 "basket_complete","missing_price_count","source_channel","placement_id"
]);
const UNSAFE_TEXT=/@|(?:https?:\/\/)|(?:\+?\d[\d ()-]{7,}\d)|\b(?:password|token|secret|email|phone|address|card)\b/i;
const SAFE_ROUTE=/^\/[a-z0-9/_-]{0,120}$/i;
export function isAnalyticsName(v:unknown):v is AnalyticsEventName{
 return typeof v==="string"&&(ANALYTICS_EVENTS as readonly string[]).includes(v);
}
export function sanitizeAnalyticsProperties(input:unknown):Record<string,string|number|boolean>|null{
 if(!input||typeof input!=="object"||Array.isArray(input))return null;
 const obj=input as Record<string,unknown>;
 if(Object.keys(obj).length>10)return null;
 const out:Record<string,string|number|boolean>={};
 for(const [key,value] of Object.entries(obj)){
  if(!ALLOWED_PROPERTIES.has(key))return null;
  if(typeof value==="number"){
   if(!Number.isFinite(value)||Math.abs(value)>1e9)return null;
   out[key]=value;
  }else if(typeof value==="boolean"){out[key]=value;}
  else if(typeof value==="string"){
   if(value.length>120||UNSAFE_TEXT.test(value)||!(/^[\w/-]+$/.test(value)))return null;
   if(key==="route"&&!SAFE_ROUTE.test(value))return null;
   out[key]=value;
  }else return null;
 }
 return out;
}
export const MEASUREMENT_GATES=Object.freeze({
 clientCollectionEnabled:false,
 browserIdentityEnabled:false,
 advertisingMeasurementEnabled:false,
 revenueFromClicks:false,
 requiresConsentReview:true
});
