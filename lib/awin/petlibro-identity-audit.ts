/**
 * Private-only Petlibro 77952:103580 identity review.
 *
 * Historical feed items from this specific importer use paired suffixes
 * "_feed" and "_health" for the same catalogue item. Never treat these as
 * independent canonical products without a checked identity review.
 *
 * This helper neither assigns canonical product IDs nor grants publication.
 */
export type PetlibroStagedRow={
 merchant_product_id:string;
 title:string;
 brand:string;
 price:number|string|null;
 currency:string;
 status:string;
 review_decision:string;
 metadata:unknown;
 image_url:string|null;
};

export type PetlibroIdentityCandidate={
 sku:string;
 title:string;
 price:string|null;
 currency:string;
 rows:number;
 issues:string[];
 needsReview:boolean;
};

type PetlibroAudit={
 sourceRows:number;
 distinctIdentityGroups:number;
 matchingPairs:number;
 groupsNeedingAttention:number;
 candidates:PetlibroIdentityCandidate[];
 incomplete:boolean;
 priceTimestampEvidenceRows:number;
 imageRightsConfirmedRows:number;
};

function meta(value:unknown):Record<string,unknown>{
 return value&&typeof value==="object"&&!Array.isArray(value)
  ?value as Record<string,unknown>:{};
}
function checkedPrice(value:number|string|null):string|null{
 if(value===null||typeof value==="boolean")return null;
 const n=Number(value);
 return Number.isFinite(n)&&n>0&&n<=10_000_000?n.toFixed(2):null;
}
const normalized=(value:unknown)=>typeof value==="string"?value.trim():"";
const suffix=/^(.{1,240})_(feed|health)$/;

export function auditPetlibroStagedIdentities(
 rows:PetlibroStagedRow[],incomplete=false
):PetlibroAudit{
 const groups=new Map<string,{row:PetlibroStagedRow;kind:string|null}[]>();
 for(const row of rows){
  const sku=normalized(row.merchant_product_id);
  const parsed=suffix.exec(sku);
  const base=parsed?.[1]??sku;
  const group=groups.get(base)??[];
  group.push({row,kind:parsed?.[2]??null});
  groups.set(base,group);
 }
 let matchingPairs=0,groupsNeedingAttention=0;
 const candidates:PetlibroIdentityCandidate[]=[];
 let priceTimestampEvidenceRows=0,imageRightsConfirmedRows=0;
 for(const row of rows){
  const evidence=meta(row.metadata);
  if(normalized(evidence.source_updated_at))priceTimestampEvidenceRows++;
  if(evidence.source_image_rights_confirmed===true)imageRightsConfirmedRows++;
 }
 for(const [sku,entries] of groups){
  const first=entries[0].row;
  const issues:string[]=[];
  const suffixes=entries.map(x=>x.kind).sort();
  if(entries.length!==2||suffixes[0]!=="feed"||suffixes[1]!=="health")
   issues.push("unverified_pairing");
  const comparisonKeys=["title","brand","currency"] as const;
  for(const key of comparisonKeys){
   if(new Set(entries.map(x=>normalized(x.row[key]))).size!==1)
    issues.push("conflicting_"+key);
  }
  const prices=entries.map(x=>checkedPrice(x.row.price));
  if(prices.some(x=>x===null)||new Set(prices).size!==1)
   issues.push("missing_or_conflicting_price");
  for(const key of ["gtin","model"] as const){
   const values=entries.map(x=>normalized(meta(x.row.metadata)[key]));
   if(new Set(values).size!==1||values.every(x=>!x))
    issues.push("missing_or_conflicting_"+key);
  }
  if(entries.some(x=>x.row.status!=="review"||x.row.review_decision==="needs_attention"))
   issues.push("row_not_eligible_for_private_review");
  if(entries.some(x=>x.row.currency!=="GBP"))
   issues.push("currency_not_gbp");
  if(entries.some(x=>meta(x.row.metadata).tracking_link_verified!==true))
   issues.push("tracking_link_not_verified");
  if(issues.length===0)matchingPairs++;
  else groupsNeedingAttention++;
  candidates.push({
   sku,title:first.title,price:prices[0],currency:first.currency,
   rows:entries.length,issues,needsReview:entries.some(x=>x.row.review_decision!=="checked")
  });
 }
 return {
  sourceRows:rows.length,
  distinctIdentityGroups:groups.size,
  matchingPairs,
  groupsNeedingAttention,
  candidates,
  incomplete,priceTimestampEvidenceRows,imageRightsConfirmedRows
 };
}
