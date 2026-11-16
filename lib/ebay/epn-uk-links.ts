/** Fixed EPN links to eBay UK category searches. No item prices or Browse API use.
 * https://developer.ebay.com/api-docs/buy/static/ref-epn-link.html
 */
export const AVUQO_EBAY_UK_EPN_CAMPAIGN="5339240499" as const;
export const EBAY_UK_ROTATION_ID="710-53481-19255-0" as const;
export const EBAY_UK_SEARCHES=[
 {id:"phones",label:"Phones & refurbished tech",query:"refurbished unlocked phones"},
 {id:"laptops",label:"Laptops & computers",query:"refurbished laptops"},
 {id:"home",label:"Home & DIY",query:"home diy tools"},
 {id:"pets",label:"Pet supplies",query:"pet supplies"},
 {id:"gaming",label:"Gaming & consoles",query:"gaming consoles"},
 {id:"collectibles",label:"Collectibles",query:"collectibles"}
] as const;
const IDS=new Set<string>(EBAY_UK_SEARCHES.map(x=>x.id));
export function ebayUkEpnHref(id:string):string{
 if(id!=="all"&&!IDS.has(id))throw new Error("unknown_ebay_uk_collection");
 const url=new URL(id==="all"?"https://www.ebay.co.uk/":"https://www.ebay.co.uk/sch/i.html");
 if(id!=="all"){
  const category=EBAY_UK_SEARCHES.find(x=>x.id===id);
  if(!category)throw new Error("unknown_ebay_uk_collection");
  url.searchParams.set("_nkw",category.query);
 }
 url.searchParams.set("mkevt","1");
 url.searchParams.set("mkcid","1");
 url.searchParams.set("mkrid",EBAY_UK_ROTATION_ID);
 url.searchParams.set("campid",AVUQO_EBAY_UK_EPN_CAMPAIGN);
 url.searchParams.set("toolid","10001");
 return url.toString();
}
