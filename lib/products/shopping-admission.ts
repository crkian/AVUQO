/** Ordinary catalogue eligibility is independent of deal scoring.
 * This pure gate does NOT publish, grant permissions, or override owner review.
 * Callers must independently check source controls and programme rights.
 */
import {ownAffiliateLink} from "../awin/approved-offer-renewal.ts";
export type ShoppingEvidence={
 advertiserId:string;sourceOfferId:string;sku:string;currency:string;price:number;
 stock:string;lastSeenAt:string;affiliateUrl:string|null;matchConfidence:number;
 feedDigest:string;verifiedAt:string;sourceCurrencyExplicit:boolean;
 exactSourceMatch:boolean;sourceRights:boolean;programmeApproved:boolean;
 ownerGrant:boolean;controlsEnabled:boolean;reviewStatus:string|null;
};
export function shoppingAdmissionFailures(x:ShoppingEvidence,now=Date.now()):string[]{
 const failures:string[]=[];
 const recent=(v:string)=>{const t=Date.parse(v);return Number.isFinite(t)&&t<=now+300000&&now-t<=48*3600_000;};
 if(!x.controlsEnabled)failures.push("controls_disabled");
 if(!x.ownerGrant||!x.sourceRights||!x.programmeApproved)failures.push("rights_or_owner_grant_missing");
 if(x.reviewStatus!==null&&x.reviewStatus!=="approved")failures.push("review_not_approved");
 if(!/^\d{2,12}$/.test(x.advertiserId)||!x.sku||x.sourceOfferId!==x.advertiserId+":"+x.sku||!x.exactSourceMatch)failures.push("exact_source_identity_missing");
 if(x.currency!=="GBP"||!x.sourceCurrencyExplicit||!Number.isFinite(x.price)||x.price<=0)failures.push("explicit_gbp_price_missing");
 if(!["in_stock","low_stock"].includes(x.stock))failures.push("stock_unverified");
 if(!recent(x.lastSeenAt)||!recent(x.verifiedAt)||!/^[a-f0-9]{64}$/.test(x.feedDigest))failures.push("fresh_authenticated_evidence_missing");
 if(!ownAffiliateLink(x.affiliateUrl,x.advertiserId))failures.push("publisher_link_invalid");
 const confidence=x.matchConfidence>1?x.matchConfidence/100:x.matchConfidence;
 if(!Number.isFinite(confidence)||confidence<0.85||confidence>1)failures.push("identity_confidence_insufficient");
 return failures;
}
