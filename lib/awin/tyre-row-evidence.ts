import {candidateTyreSize} from "./tyre-feed-contract";

export type PrivateTyreRowEvidence={
 size_candidate:{width_mm:number;aspect_ratio:number;rim_inches:number;verified:false}|null;
 size_conflict:boolean;
 blocked_non_tyre:boolean;
 gbp_explicit:boolean;
 price_format_valid:boolean;
 ready_for_automatic_matching:false;
 ready_for_publication:false;
};

/** Classification is evidence for owner review, not an authoritative tyre match.
 * A matching text pattern in a description cannot establish load/speed rating,
 * run-flat status, fitting basis, product rights or current price.
 */
export function inspectPrivateTyreRowEvidence(row:{
 title:string;description:string;category:string;currency:string;price:string;
}):PrivateTyreRowEvidence{
 const candidates=[row.title,row.description,row.category]
   .map(text=>candidateTyreSize(text)).filter((v):v is NonNullable<typeof v>=>v!==null);
 const signatures=new Set(candidates.map(x=>`${x.width_mm}/${x.aspect_ratio}R${x.rim_inches}`));
 const blocked_non_tyre=/\b(?:inner tube|tube only|wheel only|alloy wheel|rim only|tyre fitting|tire fitting|valve caps?|valve stems?|puncture repair|tyre sealant|wheel nuts?|tyre pressure gauge)\b/i
   .test([row.title,row.category].join(" "));
 const valid=/^\d+(?:\.\d{1,2})?$/.test(row.price)&&Number(row.price)>0&&Number.isFinite(Number(row.price));
 return {
  size_candidate:signatures.size===1?candidates[0]:null,
  size_conflict:signatures.size>1,
  blocked_non_tyre,
  gbp_explicit:row.currency.trim().toUpperCase()==="GBP",
  price_format_valid:valid,
  ready_for_automatic_matching:false,
  ready_for_publication:false
 };
}
