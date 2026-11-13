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
  let verifiedLink=false;
  if(hasCampaign&&typeof item.itemAffiliateWebUrl==="string"){
   try{
    const link=new URL(item.itemAffiliateWebUrl);
    verifiedLink=link.protocol==="https:"&&!link.username&&!link.password&&
      /(^|\\.)ebay\\.(co\\.uk|com)$/.test(link.hostname)&&/^\\d{10}$/.test(link.searchParams.get("campid")??"");
   }catch{verifiedLink=false;}
  }
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
/**
 * Sandbox and Production OAuth keys are completely separate.
 * A production keyset does not itself authorize eBay Browse's limited-release APIs.
 * Neither environment ever admits public inventory or writes to the database here.
 */
export type EbayPilotEnvironment="sandbox"|"production";
export function ebayPilotReadiness(){
 const environment:EbayPilotEnvironment=process.env.EBAY_BROWSE_ENVIRONMENT==="production"?"production":"sandbox";
 const sandboxCredentials=Boolean(process.env.EBAY_SANDBOX_CLIENT_ID&&process.env.EBAY_SANDBOX_CLIENT_SECRET);
 const productionCredentials=Boolean(process.env.EBAY_CLIENT_ID&&process.env.EBAY_CLIENT_SECRET);
 const productionApproved=process.env.EBAY_BROWSE_PRODUCTION_APPROVED==="true";
 const campaignConfigured=/^\\d{10}$/.test(process.env.EBAY_EPN_CAMPAIGN_ID??"");
 return {environment,credentialsConfigured:environment==="sandbox"?sandboxCredentials:productionCredentials,
  productionApproved,campaignConfigured,
  ready:environment==="sandbox"?sandboxCredentials:productionCredentials&&productionApproved};
}
const EBAY_API_ORIGINS:{sandbox:string;production:string}={
 sandbox:"https://api.sandbox.ebay.com",
 production:"https://api.ebay.com"
};
export async function ebayUkPrivateSearch(query:string):Promise<EbayPilotItem[]>{
 const config=ebayPilotReadiness();
 const client=config.environment==="sandbox"?(process.env.EBAY_SANDBOX_CLIENT_ID??""):(process.env.EBAY_CLIENT_ID??"");
 const secret=config.environment==="sandbox"?(process.env.EBAY_SANDBOX_CLIENT_SECRET??""):(process.env.EBAY_CLIENT_SECRET??"");
 const campaign=process.env.EBAY_EPN_CAMPAIGN_ID??"";
 if(!client||!secret)throw Error(config.environment==="sandbox"?
  "eBay Sandbox App ID and Cert ID have not been configured":"eBay Production App ID and Cert ID have not been configured");
 if(config.environment==="production"&&!config.productionApproved)
  throw Error("eBay Browse production approval has not been recorded");
 if(query.length<2||query.length>80)throw Error("Search must be 2–80 characters");
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),12000);
 try{
  const basic=Buffer.from(client+":"+secret).toString("base64");
  const tokenResponse=await fetch(EBAY_API_ORIGINS[config.environment]+"/identity/v1/oauth2/token",{
   method:"POST",headers:{"Authorization":"Basic "+basic,"Content-Type":"application/x-www-form-urlencoded"},
   body:"grant_type=client_credentials&scope="+encodeURIComponent("https://api.ebay.com/oauth/api_scope"),
   cache:"no-store",redirect:"error",signal:controller.signal
  });
  if(!tokenResponse.ok)throw Error("eBay application authentication was not accepted");
  const tokenBody=await tokenResponse.json() as {access_token?:unknown};
  if(typeof tokenBody.access_token!=="string"||!tokenBody.access_token)throw Error("eBay access token unavailable");
  const url=new URL(EBAY_API_ORIGINS[config.environment]+"/buy/browse/v1/item_summary/search");
  url.searchParams.set("q",query);url.searchParams.set("limit","24");
  url.searchParams.set("filter","itemLocationCountry:GB");
  const headers:Record<string,string>={
   Authorization:"Bearer "+tokenBody.access_token,
   "X-EBAY-C-MARKETPLACE-ID":"EBAY_GB",
   "Accept-Language":"en-GB",Accept:"application/json"
  };
  if(config.environment==="production"&&/^\d{10}$/.test(campaign))headers["X-EBAY-C-ENDUSERCTX"]="affiliateCampaignId="+campaign;
  const response=await fetch(url.toString(),{headers,cache:"no-store",redirect:"error",signal:controller.signal});
  if(!response.ok)throw Error("eBay UK search is unavailable for this application");
  const payload=await response.json() as unknown;
  return normalizeEbayUkResults(payload,config.environment==="production"&&/^\d{10}$/.test(campaign));
 }catch(error){
  if(error instanceof Error&&["eBay Sandbox App ID and Cert ID have not been configured","eBay Production App ID and Cert ID have not been configured","eBay Browse production approval has not been recorded","eBay application authentication was not accepted","eBay access token unavailable","eBay UK search is unavailable for this application","Search must be 2–80 characters"].includes(error.message))throw error;
  throw Error("eBay UK search could not be completed");
 }finally{clearTimeout(timeout);}
}
