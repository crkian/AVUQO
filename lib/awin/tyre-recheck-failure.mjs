/** Diagnostic-only stage labels. Never serialize upstream errors, URLs or credential values. */
const stages=new Set(["source_controls","inventory","download","decode","parse","receipt","batch"]);
const publicReasons=new Set(["accepted_tyre_feed_not_found","feed_too_large","empty_feed",
 "authenticated_feed_unavailable","invalid_feed_schema","invalid_feed_row",
 "bad_feed_row_count","private_batch_unavailable","source_control_blocked"]);
export function redactedTyreRecheckFailure(error,stage){
 const at=stages.has(stage)?stage:"unexpected";
 const message=error instanceof Error?error.message:"";
 return {status:publicReasons.has(message)?message:"tyre_"+at+"_failed",
  diagnostic_stage:at,no_publication:true,private_only:true};
}
