export type HomeCampaign = {
 id:string;title:string;summary:string;ctaLabel:string;href:string;sponsored:boolean
};
export type HomeFactEvidence = {
 id:string;brand_slug:string;status:string;expires_at:string|null
};
/** Approved, unexpired AVUQO-only evidence. Missing or malformed expiry fails closed. */
export function currentAvuqoHomeFact(fact:HomeFactEvidence|null|undefined,now:Date):boolean {
 if(!fact||fact.brand_slug!=="avuqo"||fact.status!=="approved")return false;
 if(fact.expires_at===null)return true;
 const expires=Date.parse(fact.expires_at);
 return Number.isFinite(expires)&&expires>now.getTime();
}

export const DEFAULT_CAMPAIGN:HomeCampaign={
 id:"evergreen",title:"Find what's worth it, every day.",
 summary:"Explore buying guides, supermarket baskets, travel and everyday comparisons with AVUQO.",
 ctaLabel:"Start exploring",href:"/discover",sponsored:false
};
const localPath=(value:unknown):value is string=>
 typeof value==="string" && /^\/[a-z0-9][a-z0-9/-]*$/.test(value);
export function validPublicCampaign(value:Record<string,unknown>):HomeCampaign|null {
 if(!localPath(value.href)||typeof value.title!=="string"||typeof value.summary!=="string"||
  typeof value.cta_label!=="string"||typeof value.sponsored!=="boolean") return null;
 if(value.title.length<8||value.title.length>100||value.summary.length<15||
   value.summary.length>260||value.cta_label.length<4||value.cta_label.length>40) return null;
 return {id:String(value.id),title:value.title,summary:value.summary,
  ctaLabel:value.cta_label,href:value.href,sponsored:value.sponsored};
}
/**
 * Match public-only placement fields against private placement-to-fact links.
 * Never return facts, private ids, or an unapproved/expired claim to a visitor.
 */
export function homeCampaignsWithCurrentFacts(
 publicRows:Record<string,unknown>[],
 privateLinks:{id:string;fact_id:string}[],
 privateFacts:HomeFactEvidence[],
 now:Date
):HomeCampaign[] {
 const factById=new Map(privateFacts.map(f=>[f.id,f]));
 const linkedFactByPlacement=new Map(privateLinks.map(link=>[link.id,link.fact_id]));
 return publicRows.flatMap(row=>{
  if(typeof row.id!=="string")return [];
  const factId=linkedFactByPlacement.get(row.id);
  if(!factId||!currentAvuqoHomeFact(factById.get(factId),now))return [];
  const campaign=validPublicCampaign(row);
  return campaign?[campaign]:[];
 });
}

export const EDITORIAL_ROTATION:HomeCampaign[]=[
 DEFAULT_CAMPAIGN,
 {id:"groceries",title:"Make the weekly shop clearer.",
  summary:"Bring your shopping list together and see which supermarket prices have been verified.",
  ctaLabel:"Explore groceries",href:"/groceries",sponsored:false},
 {id:"total-cost",title:"Look beyond the monthly price.",
  summary:"Explore the true costs of broadband, mobile and other everyday contracts using your figures.",
  ctaLabel:"Compare contracts",href:"/compare",sponsored:false}
];

export function homePlacementState(status:string, startsAt:string, endsAt:string, now:Date):string {
 if(status!=="approved")return status;
 const starts=Date.parse(startsAt),ends=Date.parse(endsAt);
 if(!Number.isFinite(starts)||!Number.isFinite(ends)||ends<=starts)return "invalid dates";
 if(now.getTime()>=ends)return "ended";
 return now.getTime()<starts ? "scheduled" : "live";
}
