/**
 * Only known, categorical server responses are persisted. Never persist
 * arbitrary provider error text, URLs, signed object keys, rows or credentials.
 */
const SUCCESS_CODES=new Set([
 "private_review","already_staged","disabled",
 "private_snapshot_stored_verified","snapshot_already_present_verified",
 "private_validation_recorded","already_validated","no_recent_private_snapshot"
]);
const FAILURES:Record<string,string>={
 "Awin feed credentials not configured":"credentials",
 "Awin credentials unavailable":"credentials",
 "Feed inventory fetch failed":"inventory_fetch",
 "Selected active feed missing or ambiguous":"feed_selection",
 "Feed format not supported by pilot":"feed_format",
 "Awin product download failed":"product_download",
 "Feed preflight failed; nothing imported":"feed_validation",
 "Unsupported or oversized compressed feed":"compressed_size",
 "Joined advertiser verification failed":"membership",
 "All Awin private imports require the publication source to remain paused":"source_gate",
 "Private import stopped by global ingestion controls":"stop_gate",
 "Private import stopped before database writes":"stop_gate",
 "Private import paused by global controls":"stop_gate",
 "Private import stopped before completion":"stop_gate",
 "Unique owner attribution unavailable":"owner_attribution",
 "Private batch rejected":"batch_rejected",
 "Private import finish failed":"finish_failed",
 "Bounded Awin snapshot download failed; no upload attempted":"snapshot_download",
 "Joined advertiser must remain paused":"source_gate",
 "Awin source controls changed; upload refused":"stop_gate",
 "Private upload/read-back not verified; no import or validation started":"snapshot_verify",
 "Private snapshot controls prohibit validation":"stop_gate",
 "Private snapshot inventory unavailable":"snapshot_list",
 "Private validation blocked by source/stop controls":"stop_gate",
 "Private validation register unavailable":"validation_register",
 "Snapshot failed private integrity/format validation; nothing recorded":"validation_failed"
};
function record(value:unknown):Record<string,unknown>|null{
 return value!==null&&typeof value==="object"&&!Array.isArray(value)
  ?value as Record<string,unknown>:null;
}
export function safePrivateCronOutcome(httpStatus:number,responseBody:unknown):{
 state:"completed"|"disabled"|"rejected";
 code:string;
}{
 const data=record(responseBody);
 if(httpStatus<200||httpStatus>=400){
  const error=typeof data?.error==="string"?data.error:"";
  return {state:"rejected",code:FAILURES[error]??"http_"+String(Number.isInteger(httpStatus)&&httpStatus>=100&&httpStatus<=599?httpStatus:500)};
 }
 const status=typeof data?.status==="string"?data.status:"";
 if(status==="disabled")return {state:"disabled",code:"disabled"};
 return {state:"completed",code:SUCCESS_CODES.has(status)?status:"ok"};
}
