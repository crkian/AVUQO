import {candidateTyresUkTechnicalSpecs} from "./tyres-uk-technical-evidence.ts";

export const TYRES_UK_IMPORT_ID="8ea807f1-7050-4dfb-af51-e08dc7c7bbd5";
export const TYRES_UK_ADVERTISER="12715";
export const TYRES_UK_FEED="93988";
export const TYRES_UK_REQUIRED_COLUMNS=[
 "merchant_id","merchant_product_id","product_name","description",
 "search_price","currency","custom_1","custom_2","custom_3","custom_4","custom_5"
] as const;

export function checkedTyreHeader(cells:string[]):string[]{
 const header=cells.map(value=>value.trim());
 if(header.length<11||header.length>120||new Set(header).size!==header.length||
  !TYRES_UK_REQUIRED_COLUMNS.every(name=>header.includes(name)))
  throw Error("tyres_uk_invalid_header");
 return header;
}

/** Treat a *current* Awin feed as its own immutable evidence snapshot.
 * Never pretend it is the exact older source bound to the original import. */
export function currentTyreCandidate(row:Record<string,string>){
 if(row.merchant_id!==TYRES_UK_ADVERTISER)throw Error("tyres_uk_cross_advertiser_row");
 const evidence=candidateTyresUkTechnicalSpecs(row);
 if(!evidence.cross_checked_against_description)return null;
 if(!/^[A-Za-z0-9_-]{1,120}$/.test(row.merchant_product_id??""))return null;
 if(!/^\d{1,7}(?:\.\d{1,2})?$/.test(row.search_price??"")||
    Number(row.search_price)<=0||row.currency?.trim().toUpperCase()!=="GBP")return null;
 const title=row.product_name??"";
 if(title.length<1||title.length>500)return null;
 return {
  merchant_product_id:row.merchant_product_id,
  title,
  price:row.search_price,
  width_mm:evidence.width_mm,aspect_ratio:evidence.aspect_ratio,
  rim_inches:evidence.rim_inches,load_index:evidence.load_index_candidate,
  speed_rating:evidence.speed_rating_candidate,corroborated:true
 };
}

export function rowDictionary(header:string[],cells:string[]):Record<string,string>{
 if(header.length!==cells.length)throw Error("tyres_uk_invalid_row_columns");
 return Object.fromEntries(header.map((name,index)=>[name,cells[index]]));
}
