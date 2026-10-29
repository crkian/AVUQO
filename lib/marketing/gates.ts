/** Pure gates, so tests can exercise decisions without API secrets or a live database. */
export type Gate = {ok:boolean;reasons:string[]};
export type PublishState = {
  globalEnabled:boolean;brandEnabled:boolean;channelEnabled:boolean;channelVerified:boolean;
  approved:boolean;factApproved:boolean;factCurrent:boolean;brandMatches:boolean;
  channelMatches:boolean;platform:string;hasApprovedImage:boolean;withinCap:boolean;
  duplicate:boolean;dueAt:string;
};
export function publishingGate(input:PublishState, liveFlag:string|undefined, now=new Date()): Gate {
  const reasons:string[]=[];
  if(liveFlag!=="YES") reasons.push("Environment live publishing is disabled");
  if(!input.globalEnabled) reasons.push("Global emergency stop is active");
  if(!input.brandEnabled) reasons.push("Brand publishing is disabled");
  if(!input.channelEnabled || !input.channelVerified) reasons.push("Channel is not authorised and enabled");
  if(!input.approved || !input.factApproved || !input.factCurrent) reasons.push("Approved content and current fact are required");
  if(!input.brandMatches || !input.channelMatches) reasons.push("Content/channel ownership mismatch");
  if(!input.withinCap) reasons.push("Brand posting cap reached");
  if(input.duplicate) reasons.push("Duplicate post");
  if(input.platform==="instagram"&&!input.hasApprovedImage) reasons.push("Instagram requires approved media");
  const ms=Date.parse(input.dueAt);
  if(!Number.isFinite(ms) || ms<=now.getTime()) reasons.push("Scheduled time must be in the future");
  return {ok:!reasons.length,reasons};
}
export function stateAfterBuffer(status:string):"published"|"scheduled"|"failed"|"needs_reconciliation" {
  if(status==="sent") return "published";
  if(status==="scheduled"||status==="sending"||status==="needs_approval"||status==="draft") return "scheduled";
  if(status==="error") return "failed";
  return "needs_reconciliation";
}
