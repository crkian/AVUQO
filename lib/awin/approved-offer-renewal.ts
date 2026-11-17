/**
 * Renew an already-public, owner-approved Awin offer only when a fresh
 * source observation independently confirms the SAME price and identity.
 * This is not first-time publication or advertiser approval.
 */
export type AwinRenewalInput={
 sourceId:string;offerId:string;productId:string;advertiserId:string;
 merchantId:string;priorMerchantId:string;priorAffiliateUrl:string|null;
 price:number;currency:string;stockStatus:string;
 affiliateUrl:string|null;matchConfidence:number;
 score:number;scoreConfidence:number;
 publishingEnabled:boolean;rightsVerified:boolean;
 priorPublished:{status:string;product_id:string;current_price:number}|null;
 approval:{status:string;source_id:string;advertiser_id:string;reviewed_price:number;
  reviewed_offer_at:string;reviewed_score_at:string}|null;
};
export function ownAffiliateLink(value:string|null,advertiser:string):boolean{
 if(!value)return false;
 try{
  const u=new URL(value);
  if(u.protocol!=="https:"||u.port||u.username||u.password||
     !["awin1.com","www.awin1.com"].includes(u.hostname))return false;
  if(u.pathname==="/pclick.php")return u.searchParams.get("m")===advertiser&&
   u.searchParams.get("a")==="3135746"&&Boolean(u.searchParams.get("p"));
  return u.pathname==="/cread.php"&&u.searchParams.get("awinmid")===advertiser&&
   u.searchParams.get("awinaffid")==="3135746";
 }catch{return false;}
}
export function canRenewApprovedAwinOffer(x:AwinRenewalInput):boolean{
 const p=x.priorPublished,r=x.approval;
 if(!x.publishingEnabled||!x.rightsVerified||!p||!r||r.status!=="approved"||
    p.status!=="published"||p.product_id!==x.productId||r.source_id!==x.sourceId||
    r.advertiser_id!==x.advertiserId||x.merchantId!==x.priorMerchantId||
    x.affiliateUrl!==x.priorAffiliateUrl||!/^\d{2,12}$/.test(x.advertiserId))return false;
 if(x.currency!=="GBP"||!Number.isFinite(x.price)||x.price<=0||
    Number(p.current_price)!==x.price||Number(r.reviewed_price)!==x.price)return false;
 if(!["in_stock","low_stock"].includes(x.stockStatus)||
    !ownAffiliateLink(x.affiliateUrl,x.advertiserId))return false;
 const match=x.matchConfidence>1?x.matchConfidence/100:x.matchConfidence;
 if(!Number.isFinite(match)||match<0.85||x.score<60||x.scoreConfidence<55)return false;
 const a=Date.parse(r.reviewed_offer_at),s=Date.parse(r.reviewed_score_at);
 return Number.isFinite(a)&&Number.isFinite(s)&&a<=Date.now()+300000&&s<=Date.now()+300000;
}
