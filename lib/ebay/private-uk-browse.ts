/** UK eBay Browse read-only owner pilot. No persistence, public offers or affiliate release. */
export type EbayPilotItem={
 itemId:string;title:string;priceGBP:number|null;condition:string|null;
 seller:string|null;imageUrl:string|null;brand:string|null;mpn:string|null;
 categoryPath:string|null;shippingGBP:number|null;hasAffiliateTracking:boolean;
};
type EbaySummary={
 itemId?:unknown;title?:unknown;price?:{value?:unknown;currency?:unknown};
 condition?:unknown;seller?:{username?:unknown};image?:{imageUrl?:unknown};
 categories?:Array<{categoryName?:unknown}>;itemLocation?:{country?:unknown};
 shippingOptions?:Array<{shippingCost?:{value?:unknown;currency?:unknown}}>;
 itemAffiliateWebUrl?:unknown;localizedAspects?:Array<{name?:unknown;value?:unknown}>;
};
const safeText=(v:unknown,max=200)=>typeof v==="string"?v.slice(0,max).trim():"";
const gbp=(p:{value?:unknown;currency?:unknown}|undefined)=>{
 if(p?.currency!=="GBP")return null;
 const n=Number(p.value);
 return p.value!==undefined&&p.value!==""&&Number.isFinite(n)&&n>=0&&n<10000000?n:null;
};
function safeImage(v:unknown){
 if(typeof v!=="string")return null;
 try{const u=new URL(v);return u.protocol==="https:"&&!u.username&&!u.password&&
   /(^|\.)ebayimg\.com$/i.test(u.hostname)?u.href:null;}catch{return null;}
}
export function normalizeEbayUkResults(data:unknown,hasCampaign:boolean):EbayPilotItem[]{
 if(!data||typeof data!=="object"||!Array.isArray((data as {itemSummaries?:unknown}).itemSummaries))return [];
 const rows=(data as {itemSummaries:EbaySummary[]}).itemSummaries;
 return rows.slice(0,24).flatMap((item)=>{
  const id=safeText(item.itemId,150),title=safeText(item.title,400);
  if(!id||!title)return [];
  const aspects=Array.isArray(item.localizedAspects)?item.localizedAspects:[];
  const aspect=(name:string)=>safeText(aspects.find(a=>safeText(a.name).toLowerCase()===name)?.value,160);
  const verifiedLink=hasCampaign&&typeof item.itemAffiliateWebUrl==="string"&&
   item.itemAffiliateWebUrl.startsWith("https://")&&item.itemAffiliateWebUrl.includes("campid=");
  return [{
   itemId:id,title,priceGBP:gbp(item.price),condition:safeText(item.condition,70)||null,
   seller:safeText(item.seller?.username,80)||null,imageUrl:safeImage(item.image?.imageUrl),
   brand:aspect("brand")||null,mpn:aspect("mpn")||null,
   categoryPath:Array.isArray(item.categories)?item.categories.map(x=>safeText(x.categoryName,100)).filter(Boolean).join(" > ")||null:null,
   shippingGBP:gbp(item.shippingOptions?.[0]?.shippingCost),
   hasAffiliateTracking:Boolean(verifiedLink)
  }];
 });
}
const TOKEN_URL="https://api.ebay.com/identity/v1/oauth2/token";
const SEARCH_URL="https://api.ebay.com/buy/browse/v1/item_summary/search";
export async function ebayUkPrivateSearch(query:string):Promise<EbayPilotItem[]>{
 const client=process.env.EBAY_CLIENT_ID??"",secret=process.env.EBAY_CLIENT_SECRET??"";
 const campaign=process.env.EBAY_EPN_CAMPAIGN_ID??"";
 if(!client||!secret)throw Error("eBay developer credentials have not been configured");
 if(query.length<2||query.length>80)throw Error("Search must be 2–80 characters");
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),12000);
 try{
  const basic=Buffer.from(client+":"+secret).toString("base64");
  const tokenResponse=await fetch(TOKEN_URL,{
   method:"POST",headers:{"Authorization":"Basic "+basic,"Content-Type":"application/x-www-form-urlencoded"},
   body:"grant_type=client_credentials&scope="+encodeURIComponent("https://api.ebay.com/oauth/api_scope"),
   cache:"no-store",redirect:"error",signal:controller.signal
  });
  if(!tokenResponse.ok)throw Error("eBay application authentication was not accepted");
  const tokenBody=await tokenResponse.json() as {access_token?:unknown};
  if(typeof tokenBody.access_token!=="string"||!tokenBody.access_token)throw Error("eBay access token unavailable");
  const url=new URL(SEARCH_URL);
  url.searchParams.set("q",query);url.searchParams.set("limit","24");
  url.searchParams.set("filter","itemLocationCountry:GB");
  const headers:Record<string,string>={
   Authorization:"Bearer "+tokenBody.access_token,
   "X-EBAY-C-MARKETPLACE-ID":"EBAY_GB",
   "Accept-Language":"en-GB",Accept:"application/json"
  };
  if(/^\d{10}$/.test(campaign))headers["X-EBAY-C-ENDUSERCTX"]="affiliateCampaignId="+campaign;
  const response=await fetch(url.toString(),{headers,cache:"no-store",redirect:"error",signal:controller.signal});
  if(!response.ok)throw Error("eBay UK search is unavailable for this application");
  const payload=await response.json() as unknown;
  return normalizeEbayUkResults(payload,/^\d{10}$/.test(campaign));
 }catch(error){
  if(error instanceof Error&&["eBay developer credentials have not been configured","eBay application authentication was not accepted","eBay access token unavailable","eBay UK search is unavailable for this application","Search must be 2–80 characters"].includes(error.message))throw error;
  throw Error("eBay UK search could not be completed");
 }finally{clearTimeout(timeout);}
}
