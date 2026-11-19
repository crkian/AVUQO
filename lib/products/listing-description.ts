/** Shared, truthful customer-card copy for every eligible product, regardless of advertiser. */
export function cardDescription(value:string|null|undefined,max=200):string{
 const cleaned=value?.replace(/\s+/g," ").trim();
 if(!cleaned)return "Detailed product description not provided. Open the product page to check the exact variant, specifications and retailer terms.";
 return cleaned.length>max?cleaned.slice(0,max).trimEnd()+"…":cleaned;
}
export function hasObservedReduction(row:{current_price:number;typical_price:number|null;saving_amount:number|null;avuqo_score:number;confidence:number}):boolean{
 const now=Number(row.current_price),before=Number(row.typical_price),saving=Number(row.saving_amount);
 return Number.isFinite(now)&&Number.isFinite(before)&&Number.isFinite(saving)&&
  now>0&&before>now&&saving>0&&Number(row.avuqo_score)>=60&&Number(row.confidence)>=55;
}
