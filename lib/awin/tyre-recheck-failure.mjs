/** Diagnostic-only stage labels. Never serialize upstream errors, URLs or credential values. */
const stages=new Set(["source_controls","inventory","download","decode","parse","receipt","batch"]);
const publicReasons=new Set(["accepted_tyre_feed_not_found","feed_too_large","empty_feed",
 "authenticated_feed_unavailable","invalid_feed_schema","invalid_feed_row",
 "bad_feed_row_count","private_batch_unavailable","source_control_blocked"]);
const parseReasons=new Map([
 ["CSV field exceeds 10,000 characters","tyre_csv_field_limit"],
 ["Incomplete quoted CSV field","tyre_csv_unterminated_quote"],
 ["Unexpected character after closing quote","tyre_csv_quoted_field_format"]
]);
export function redactedTyreRecheckFailure(error,stage){
 const at=stages.has(stage)?stage:"unexpected";
 const message=error instanceof Error?error.message:"";
 return {status:publicReasons.has(message)?message:
  at==="parse"?(parseReasons.get(message)??(message.startsWith("CSV column count exceeds ")?"tyre_csv_column_limit":"tyre_parse_failed")):
  "tyre_"+at+"_failed",
  diagnostic_stage:at,no_publication:true,private_only:true};
}
