/** eBay Partner Network configuration and strict Browse API read-only validation.
 * EPN campaign is not itself an eBay Developer application or Feed API grant.
 */
export const AVUQO_EPN_DEFAULT_CAMPAIGN="5339240499";
export const EBAY_GB_MARKETPLACE="EBAY_GB";
export const EBAY_BROWSE_SCOPE="https://api.ebay.com/oauth/api_scope";
export function verifiedEpnCampaign(value:string){
 if(!/^\d{10}$/.test(value)||value!==AVUQO_EPN_DEFAULT_CAMPAIGN)
  throw Error("unrecognised_epn_campaign");
 return value;
}
export function ebayBrowseAffiliateHeader(campaign:string){
 return `affiliateCampaignId=${verifiedEpnCampaign(campaign)}`;
}
export type PrivateEbayItem={
 source_item_id:string;title:string;price_gbp:number;
 item_affiliate_url:string;item_web_url:string;
 image_url:string|null;condition:string|null;
 item_location_country:string|null;availability:"available";
 publication_approved:false;
};
export function privateEbayBrowseItem(item:unknown,campaign:string):PrivateEbayItem|null{
 verifiedEpnCampaign(campaign);
 if(!item||typeof item!=="object"||Array.isArray(item))return null;
 const r=item as Record<string,unknown>;
 if(typeof r.itemId!=="string"||r.itemId.length>180||!r.itemId)return null;
 if(typeof r.title!=="string"||!r.title.trim()||r.title.length>500)return null;
 const price=r.price as Record<string,unknown>|undefined;
 if(!price||price.currency!=="GBP"||typeof price.value!=="string"||
   !/^\d+(?:\.\d{1,2})?$/.test(price.value))return null;
 const numeric=Number(price.value);
 if(!Number.isFinite(numeric)||numeric<=0||numeric>1_000_000)return null;
 if(typeof r.itemAffiliateWebUrl!=="string"||typeof r.itemWebUrl!=="string")
  return null;
 try{
  const affiliate=new URL(r.itemAffiliateWebUrl);
  const direct=new URL(r.itemWebUrl);
  const hosts=["ebay.co.uk","www.ebay.co.uk","ebay.com","www.ebay.com"];
  if(affiliate.protocol!=="https:"||direct.protocol!=="https:"||
     !hosts.includes(affiliate.hostname)||!hosts.includes(direct.hostname)||
     affiliate.username||affiliate.password||direct.username||direct.password||
     affiliate.searchParams.get("campid")!==campaign)
    return null;
  const image=r.image as Record<string,unknown>|undefined;
  const url=image&&typeof image.imageUrl==="string"?image.imageUrl:null;
  const imageUrl=url&&/^https:\/\//.test(url)?url:null;
  const location=r.itemLocation as Record<string,unknown>|undefined;
  return {source_item_id:r.itemId,title:r.title.trim(),price_gbp:numeric,
   item_affiliate_url:affiliate.toString(),item_web_url:direct.toString(),
   image_url:imageUrl,condition:typeof r.condition==="string"?r.condition:null,
   item_location_country:location&&typeof location.country==="string"?location.country:null,
   availability:"available",publication_approved:false};
 }catch{return null;}
}
