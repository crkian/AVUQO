/** Narrow, user-controlled filters for eligible retailer shopping.
 * This module is pure so security and pagination rules can be unit tested.
 * Public price evidence remains in the existing verifiedOffers pipeline. */
export type ShopSort="recent"|"price-low"|"price-high";
export type ShopFilters={q:string;merchant:string;category:string;sort:ShopSort;page:number};
export type ShopQuery=Partial<Record<"q"|"merchant"|"category"|"sort"|"page",string|string[]|undefined>>;
export type ShopFacet={value:string;label:string;count:number};
export const SHOP_PAGE_SIZE=36;
export const SHOP_MAX_PAGE=100;
const text=(value:unknown)=>typeof value==="string"?value:Array.isArray(value)&&typeof value[0]==="string"?value[0]:"";
export function cleanShopSearch(input:unknown):string{
 return text(input).normalize("NFKC").replace(/[%,();\\]/g," ").replace(/[^\p{L}\p{N} .'+&/\-]/gu," ").replace(/\s+/g," ").trim().slice(0,80).trim();
}
export function shopFilters(raw:ShopQuery,merchants:readonly ShopFacet[],categories:readonly ShopFacet[]):ShopFilters{
 const page=Number(text(raw.page)||1);
 const sort=text(raw.sort);
 return {
  q:cleanShopSearch(raw.q),
  merchant:merchants.some(m=>m.value===text(raw.merchant))?text(raw.merchant):"",
  category:categories.some(c=>c.value===text(raw.category))?text(raw.category):"",
  sort:sort==="price-low"||sort==="price-high"?sort:"recent",
  page:Number.isSafeInteger(page)&&page>=1&&page<=SHOP_MAX_PAGE?page:1,
 };
}
export function shopHref(f:ShopFilters,patch:Partial<ShopFilters>={}):string{
 const merged={...f,...patch};
 const params=new URLSearchParams();
 for(const name of ["q","merchant","category"] as const)if(merged[name])params.set(name,merged[name]);
 if(merged.sort!=="recent")params.set("sort",merged.sort);
 if(merged.page>1)params.set("page",String(merged.page));
 return "/shop"+(params.size?"?"+params.toString():"");
}
export const SHOP_SORTS=[
 {value:"recent",label:"Recently updated"},
 {value:"price-low",label:"Item price: low to high"},
 {value:"price-high",label:"Item price: high to low"}
] as const;
