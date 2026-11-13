import {candidateTyresUkTechnicalSpecs} from "./tyres-uk-technical-evidence.ts";

/**
 * Pure parser and safety validation from historical PR #117.
 * No network, database, activation, storage or scheduling.
 * A candidate can only supplement PRIVATE tyre technical review.
 */
export const TYRES_UK_ADVERTISER="12715";
export const TYRES_UK_REQUIRED_COLUMNS=[
 "merchant_id","merchant_product_id","product_name","description",
 "search_price","currency","custom_1","custom_2","custom_3","custom_4","custom_5"
] as const;
export function checkedTyreHeader(cells:string[]):string[]{
 const header=cells.map(value=>value.trim());
 if(header.length<11||header.length>120||new Set(header).size!==header.length||
    !TYRES_UK_REQUIRED_COLUMNS.every(name=>header.includes(name)))
  throw new Error("tyres_uk_invalid_header");
 return header;
}
export function rowDictionary(header:string[],cells:string[]):Record<string,string>{
 if(header.length!==cells.length)throw new Error("tyres_uk_invalid_row_columns");
 return Object.fromEntries(header.map((name,index)=>[name,cells[index]]));
}
export function currentTyreCandidate(row:Record<string,string>){
 if(row.merchant_id!==TYRES_UK_ADVERTISER)throw new Error("tyres_uk_cross_advertiser_row");
 const evidence=candidateTyresUkTechnicalSpecs(row);
 if(!evidence.cross_checked_against_description)return null;
 if(!/^[A-Za-z0-9_-]{1,120}$/.test(row.merchant_product_id??""))return null;
 // Price is checked only as source-row evidence. It is intentionally not returned,
 // stored, compared or used to refresh the historical private import.
 if(!/^\d{1,7}(?:\.\d{1,2})?$/.test(row.search_price??"")||
    Number(row.search_price)<=0||row.currency?.trim().toUpperCase()!=="GBP")return null;
 const title=row.product_name??"";
 if(title.length<1||title.length>500)return null;
 return {
  merchant_product_id:row.merchant_product_id,
  title,
  width_mm:evidence.width_mm,aspect_ratio:evidence.aspect_ratio,
  rim_inches:evidence.rim_inches,load_index_candidate:evidence.load_index_candidate,
  speed_rating_candidate:evidence.speed_rating_candidate,
  corroborated:true as const,
  load_index_verified:false as const,
  speed_rating_verified:false as const,
  fitment_verified:false as const,
  public_offer_approved:false as const
 };
}
