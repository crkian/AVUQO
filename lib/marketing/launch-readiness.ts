import {BRAND_SLUGS,type BrandSlug} from "./policy.ts";
/** Read-only operational preflight. Never grants permission to publish. */
export type MarketingSource={
 system:{publishing_enabled:boolean;emergency_stop:boolean;ai_enabled:boolean}|null;
 env:{live:boolean;worker:boolean;draftWorker:boolean;aiConfigured:boolean};
 brands:{slug:string;name:string;publishing_enabled:boolean;ai_enabled:boolean}[];
 facts:{brand_slug:string;status:string;expires_at:string|null}[];
 posts:{brand_slug:string;status:string;kind:string;platform:string;source_fact_id?:string|null}[];
 channels:{brand_slug:string;platform:string;connection_state:string;publishing_enabled:boolean;buffer_channel_id:string|null}[];
 rules:{brand_slug:string;enabled:boolean;platform:string;last_error:string|null}[];
 jobs:{brand_slug:string;state:string}[];
 assets:{brand_slug:string;status:string;rights_note:string|null}[];
 placements:{status:string;brand_slug?:string|null}[];
};
export type BrandMarketingStatus={slug:BrandSlug;name:string;approvedFacts:number;
 approvedPosts:number;verifiedChannels:number;enabledDraftRules:number;approvedAssets:number;
 queuedJobs:number;needsReconciliation:number;deliveryReady:boolean;draftReady:boolean;
 reasons:string[]};
export type MarketingHealth={state:"stopped"|"attention"|"ready";globalReasons:string[];
 brands:BrandMarketingStatus[];approvedHomePlacements:number;manualPinterestSupported:boolean};
export function assessMarketingReadiness(input:MarketingSource,now=new Date()):MarketingHealth{
 const globalReasons:string[]=[];
 if(!input.system)globalReasons.push("Missing global marketing policy");
 if(input.system?.emergency_stop!==false)globalReasons.push("Global emergency stop is active");
 if(!input.system?.publishing_enabled)globalReasons.push("Database publishing permission is off");
 if(!input.env.live)globalReasons.push("Live publishing environment gate is off");
 if(!input.env.worker)globalReasons.push("Delivery worker environment gate is off");
 const brands=BRAND_SLUGS.map(slug=>{
  const b=input.brands.find(x=>x.slug===slug);
  const facts=input.facts.filter(x=>x.brand_slug===slug&&x.status==="approved"&&
   (!x.expires_at||(Number.isFinite(Date.parse(x.expires_at))&&Date.parse(x.expires_at)>now.getTime())));
  const posts=input.posts.filter(x=>x.brand_slug===slug&&x.status==="approved"&&x.kind==="social"&&
   (x.platform==="facebook"||x.platform==="instagram"));
  const channels=input.channels.filter(x=>x.brand_slug===slug&&
   x.connection_state==="verified"&&x.publishing_enabled===true&&!!x.buffer_channel_id);
  const rules=input.rules.filter(x=>x.brand_slug===slug&&x.enabled);
  const assets=input.assets.filter(x=>x.brand_slug===slug&&x.status==="approved"&&
   typeof x.rights_note==="string"&&x.rights_note.trim().length>=8);
  const jobs=input.jobs.filter(x=>x.brand_slug===slug);
  const readyPost=posts.some(p=>channels.some(c=>c.platform===p.platform&&
    (p.platform!=="instagram"||assets.length>0)));
  const reasons:string[]=[];
  if(!b)reasons.push("Brand record missing");
  if(!b?.publishing_enabled)reasons.push("Brand publishing off");
  if(!facts.length)reasons.push("No current owner-approved facts");
  if(!posts.length)reasons.push("No approved social content");
  if(!channels.length)reasons.push("No verified enabled delivery channel");
  if(!readyPost)reasons.push("No deliverable post/channel/media combination");
  if(jobs.some(x=>x.state==="needs_reconciliation"))reasons.push("Provider reconciliation needed");
  const draftReady=!!b&&!!facts.length&&!!rules.length&&input.env.draftWorker;
  const deliveryReady=!!b?.publishing_enabled&&readyPost&&globalReasons.length===0&&
   !jobs.some(x=>x.state==="needs_reconciliation");
  return {slug,name:b?.name??slug,approvedFacts:facts.length,approvedPosts:posts.length,
   verifiedChannels:channels.length,enabledDraftRules:rules.length,approvedAssets:assets.length,
   queuedJobs:jobs.filter(x=>x.state==="queued"||x.state==="scheduled").length,
   needsReconciliation:jobs.filter(x=>x.state==="needs_reconciliation").length,
   deliveryReady,draftReady,reasons};
 });
 const anyReconciliation=brands.some(x=>x.needsReconciliation>0);
 const anyReady=brands.some(x=>x.deliveryReady);
 return {state:anyReconciliation?"attention":anyReady?"ready":"stopped",
  globalReasons,brands,approvedHomePlacements:input.placements.filter(x=>x.status==="approved"&&
    (!x.brand_slug||x.brand_slug==="avuqo")).length,
  // Pinterest is not in the verified Facebook/Instagram/website connector registry.
  manualPinterestSupported:false};
}
export const MARKETING_CHANNEL_ROADMAP=[
 {name:"Pinterest",state:"creative brief only",purpose:"Create compliant 2:3 discovery graphics from approved facts, then connect an authorised account before scheduling"},
 {name:"Instagram",state:"existing gated Buffer connector",purpose:"Requires approved image, verified channel and permissioned worker"},
 {name:"Facebook",state:"existing gated Buffer connector",purpose:"Approved factual captions and explicit brand/channel owner authorisation"},
 {name:"Website",state:"owner-reviewed editorial placement",purpose:"Approved AVUQO facts only; sponsored and independent editorial remain separate"},
 {name:"Email",state:"not connected for bulk sending",purpose:"Requires subscriber consent, unsubscribe, suppression and delivery controls"},
 {name:"TikTok & X",state:"not connected",purpose:"No autonomous distribution without platform permissions"}
] as const;
