/**
 * Only known, categorical server responses are persisted. Never persist
 * arbitrary provider error text, URLs, signed object keys, rows or credentials.
 */
const SUCCESS_CODES=new Set([
 "private_review","already_staged","disabled",
 "private_snapshot_stored_verified","snapshot_already_present_verified",
 "private_validation_recorded","already_validated","no_recent_private_snapshot",
 "tooled_up_exact_cohort_checked","no_exact_current_matches",
 "no_stocked_candidates_in_cohort","fresh_authenticated_feed_observation_required",
 "full_stream_validation_failed","snapshot_read_unavailable",
 "snapshot_stream_or_schema_unavailable","private_batch_recheck_failed"
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
/** All recorded details must come from a literal allowlist, never upstream text.
 * The 80-character DB constraint permits these stable, namespaced codes. */
const SAFE_COHORT_FAILURES=new Set([
 "validation_not_available","full_stream_validation_failed",
 "fresh_authenticated_feed_observation_required",
 "snapshot_read_unavailable","storage_origin_invalid",
 "snapshot_stream_or_schema_unavailable","private_batch_recheck_failed",
 "existing_import_unavailable","cohort_recheck_write_failed",
 "tooled_up_source_or_control_blocked","no_exact_current_matches"
]);
const FEED_REASONS=new Set([
 "unsupported_columns","unterminated_csv_quote","invalid_csv_quote",
 "csv_column_limit","csv_field_or_column_limit","csv_field_size_limit",
 "empty_feed","inconsistent_row_columns","row_limit","validation_failed",
 "cadbury_uk_schema_mismatch","cadbury_uk_feed_identity_mismatch"
]);
const DOWNLOAD_REASONS=new Set([
 "feed_binding_mismatch","unsafe_feed_url","invalid_feed_binding",
 "source_size_limit","fetch_or_validation"
]);
function diagnostic(base:string,data:Record<string,unknown>|null):string{
 if(base==="feed_validation"){
  const reason=data?.reason;
  return typeof reason==="string"&&FEED_REASONS.has(reason)
   ?base+"_"+reason:base;
 }
 if(base==="product_download"){
  const kind=data?.failure_kind;
  if(typeof kind==="string"&&DOWNLOAD_REASONS.has(kind))
   return base+"_"+kind;
  // Provider HTTP status is categorised as upstream failure, not logged text.
  if(typeof kind==="string"&&/^upstream_http_(?:4\d\d|5\d\d)$/.test(kind))
   return base+"_upstream_http";
 }
 return base;
}
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
  const reported=typeof data?.status==="string"?data.status:"";
  if(SAFE_COHORT_FAILURES.has(reported))
   return {state:"rejected",code:reported};
  const error=typeof data?.error==="string"?data.error:"";
  const base=FAILURES[error]??"http_"+String(Number.isInteger(httpStatus)&&httpStatus>=100&&httpStatus<=599?httpStatus:500);
  return {state:"rejected",code:diagnostic(base,data)};
 }
 const status=typeof data?.status==="string"?data.status:"";
 if(status==="disabled")return {state:"disabled",code:"disabled"};
 return {state:"completed",code:SUCCESS_CODES.has(status)?status:"ok"};
}
