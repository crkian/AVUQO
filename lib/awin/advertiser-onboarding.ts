import {sourceEvidenceFailures, type ExternalSource} from "../pipeline/source-readiness";

export const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const advertiserIdValid=(value:unknown):value is string=>typeof value==="string"&&/^\d{2,12}$/.test(value);
export const nameValid=(value:unknown):value is string=>typeof value==="string"&&value.trim().length>=3&&value.trim().length<=120&&!/[\r\n\x00-\x1f]/.test(value);
export function evidenceRef(value:unknown):value is string{
 if(typeof value!=="string"||value.trim().length<8||value.length>400||/[\r\n\x00-\x1f]/.test(value))return false;
 if(/(api[_ -]?key|bearer\s+|access[_ -]?token|password\s*[:=])/i.test(value))return false;
 if(/^https?:\/\//i.test(value)){
  try {const url=new URL(value);return url.protocol==="https:"&&!url.username&&!url.password&&!url.search&&!url.hash;}catch{return false;}
 }
 return /^[A-Za-z0-9 _.:/()-]{8,400}$/.test(value);
}
export const validFuture=(value:unknown,now=Date.now()):value is string=>
 typeof value==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&
 Number.isFinite(Date.parse(value+"T23:59:59Z"))&&Date.parse(value+"T23:59:59Z")>now;

export type AwinAdvertiser={
 advertiser_id:string;advertiser_name:string;
 feed_permission_confirmed?:boolean;
 approval_evidence_ref?:string;
 allowed_territory?:string;
 valid_until?:string;
 approved_by?:string;
 approved_at?:string;
};
export function advertisersFromMetadata(metadata:unknown):AwinAdvertiser[]{
 const m=metadata&&typeof metadata==="object"&&!Array.isArray(metadata)?metadata as Record<string,unknown>:{};
 return Array.isArray(m.awin_advertisers)?m.awin_advertisers.filter((x):x is AwinAdvertiser=>
  Boolean(x&&typeof x==="object"&&!Array.isArray(x)&&advertiserIdValid(x.advertiser_id))
 ):[];
}
export function onboardingIssues(source:ExternalSource,advertiserId:string|undefined,envConfigured:boolean):string[]{
 return sourceEvidenceFailures(source,{
  advertiserId,
  connectorConfigured:envConfigured,
 });
}
export type ReleaseCheck={
 source:ExternalSource & {id:string};
 advertiserId:string|undefined;
 envConfigured:boolean;
 controls:{ingestion:boolean;publishing:boolean;emergencyStop:boolean};
 offer:{source_id:string;status:string;price:number;currency:string;affiliate_url:string|null;source_url:string|null;stock_status:string;last_seen_at:string;product_id:string|null;match_confidence:number;merchantExternalId?:string|null};
 product:{id:string;slug:string|null;status:string};
 score:{score:number;confidence:number;calculated_at:string};
 now?:number;
};
export function releaseIssues(input:ReleaseCheck):string[]{
 const result=onboardingIssues(input.source,input.advertiserId,input.envConfigured);
 const meta=(input.source.metadata&&typeof input.source.metadata==="object"&&!Array.isArray(input.source.metadata))?input.source.metadata as Record<string,unknown>:{};
 if(input.source.status!=="active"||input.source.sync_enabled!==true)result.push("Awin source is paused");
 if(input.controls.emergencyStop||!input.controls.ingestion||!input.controls.publishing)result.push("Global ingestion or publishing control is off");
 if(meta.publication_permission!=="verified"||meta.price_evidence_status!=="verified")result.push("Source publication and pricing evidence not approved");
 if(input.source.id!==input.offer.source_id||input.offer.status!=="active")result.push("Offer is not active from this source");
 if(input.offer.product_id!==input.product.id||input.product.status!=="active"||!input.product.slug||!/^([a-z0-9][a-z0-9-]{2,159})$/.test(input.product.slug))result.push("Canonical public product is not eligible");
 if(!input.advertiserId||input.offer.merchantExternalId!==input.advertiserId)result.push("Offer merchant does not match the approved advertiser");
 if(input.offer.currency!=="GBP"||!(Number(input.offer.price)>0))result.push("Positive GBP price required");
 const confidence=Number(input.offer.match_confidence);
 if(!Number.isFinite(confidence)||confidence<(confidence>1?85:0.85))result.push("Product identity confidence too low");
 if(!["in_stock","low_stock"].includes(input.offer.stock_status))result.push("Stock is not affirmatively available");
 const url=input.offer.affiliate_url||input.offer.source_url;
 try{const u=new URL(url??"");if(u.protocol!=="https:"||u.username||u.password||u.hostname.length<4)result.push("No safe merchant destination");}catch{result.push("No valid merchant destination");}
 const now=input.now??Date.now(),checked=Date.parse(input.offer.last_seen_at),scored=Date.parse(input.score.calculated_at);
 if(!Number.isFinite(checked)||checked>now+300000||now-checked>48*3600000)result.push("Offer evidence stale or invalid");
 if(!Number.isFinite(scored)||scored>now+300000||now-scored>48*3600000)result.push("AVUQO Score stale or invalid");
 if(input.score.score<60||input.score.confidence<55)result.push("Independent AVUQO Score below release threshold");
 return result;
}
