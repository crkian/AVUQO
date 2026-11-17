import type {RawSourceOffer} from "../../types/pipeline";
import {ownAffiliateLink} from "./approved-offer-renewal";

/** A PRIVATE row is eligible for held canonical processing only if the
 * CURRENT Awin feed supplied a verified own-publisher deep link and price.
 * Owner accepted membership and source rights are checked by the caller.
 * Never use historical feed rows to assert a current retail price.
 */
export type PrivateAwinRecord={
 merchant_id:string;merchant_product_id:string;title:string;
 price:number|string|null;currency:string|null;status:string;
 brand:string|null;category:string|null;created_at:string;
 metadata:unknown;
};
const obj=(v:unknown):Record<string,unknown>=>
 v&&typeof v==="object"&&!Array.isArray(v)?v as Record<string,unknown>:{};
const field=(v:unknown):string=>typeof v==="string"?v.trim():"";
const STOCK=new Map([["in_stock","in_stock"],["in stock","in_stock"],
 ["instock","in_stock"],["available","in_stock"],["low_stock","low_stock"],
 ["low stock","low_stock"],["limited","low_stock"]]);

export function fromFreshPrivateAwinRecord(row:PrivateAwinRecord,
 merchantName:string,advertiserId:string,feedId:string,now=Date.now()
):RawSourceOffer|null{
 const m=obj(row.metadata);
 const link=field(m.verified_awin_deep_link);
 const observed=Date.parse(row.created_at);
 const sourceStamp=field(m.source_updated_at);
 if(!/^\d{2,12}$/.test(advertiserId)||row.merchant_id!==advertiserId||
    m.feed_id!==feedId||row.status!=="review"||row.currency!=="GBP"||
    m.tracking_link_verified!==true||m.listing_kind!=="physical_product"||
    m.permission_status!=="unverified"||
    !link||!ownAffiliateLink(link,advertiserId)||
    !Number.isFinite(observed)||observed>now+300000||now-observed>6*3600_000)return null;
 if(sourceStamp){
  const updated=Date.parse(sourceStamp);
  if(!Number.isFinite(updated)||updated>now+300000||now-updated>48*3600_000)return null;
 }
 const price=Number(row.price),productId=field(row.merchant_product_id);
 const stock=STOCK.get(field(m.availability).toLowerCase());
 if(!Number.isFinite(price)||price<=0||price>10000000||
    !productId||productId.length>250||!field(row.title)||!stock)return null;
 const brand=field(row.brand),category=field(row.category);
 return {
  sourceRecordId:advertiserId+":"+productId,
  merchantExternalId:advertiserId,merchantName,
  title:field(row.title).slice(0,500),
  category:category||null,brand:brand||null,model:field(m.model)||null,
  gtin:field(m.gtin)||null,ean:field(m.ean)||null,mpn:field(m.mpn)||null,
  price,currency:"GBP",affiliateUrl:link,stockStatus:stock,
  // No inferred free delivery or image rights are invented.
  deliveryCost:null,imageUrl:null,
  raw:{source:"fresh_private_awin_validated",advertiser_id:advertiserId,
   feed_id:feedId,merchant_product_id:productId,
   observed_at:row.created_at,source_updated_at:sourceStamp||null,
   delivery_included:"unverified",image_rights:"not_claimed"}
 };
}
