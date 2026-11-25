import "server-only";
import {createAdminClient} from "../supabase/admin";
import {exactRetailContent,type RetailContent} from "./retail-content";
import type {ShoppingRelease} from "./shopping-release-reader";
const record=(v:unknown):Record<string,unknown>=>v&&typeof v==="object"&&!Array.isArray(v)?v as Record<string,unknown>:{};
const empty:RetailContent={description:null,specifications:[]};
/** Detail-only lookup after independent public shopping admission. Never return
 * raw feed metadata; bind to the exact current offer, SKU, digest and observation.
 */
export async function readExactRetailContent(item:ShoppingRelease):Promise<RetailContent>{
 try{
  const db=createAdminClient();
  const {data:o,error}=await db.from("offers").select("id,merchant_id,product_id,source_offer_id,title,price,currency,raw_data,affiliate_url").eq("id",item.offerId).eq("status","active").maybeSingle();
  if(error||!o||o.product_id!==item.productId||o.merchant_id!==item.merchantId||Number(o.price)!==item.price||o.currency!=="GBP"||o.title!==item.title||o.affiliate_url!==item.affiliateUrl)return empty;
  const raw=record(o.raw_data),digest=raw.live_feed_digest,importId=raw.import_id,feed=raw.feed_id;
  if(typeof digest!=="string"||!(/^[a-f0-9]{64}$/).test(digest)||typeof importId!=="string"||!(/^[0-9a-f-]{36}$/i).test(importId)||typeof feed!=="string"||raw.live_feed_verified_at!==item.observedAt||raw.merchant_product_id!==item.sku)return empty;
  const advertiser=String(o.source_offer_id??"").split(":")[0];
  if(!/^\d{2,12}$/.test(advertiser)||o.source_offer_id!==advertiser+":"+item.sku)return empty;
  const [programme,source]=await Promise.all([
   db.from("affiliate_programs").select("metadata").eq("provider","awin").eq("region","GB").eq("external_account_id",advertiser).maybeSingle(),
   db.from("feed_import_records").select("metadata").eq("import_id",importId).eq("merchant_id",advertiser).eq("merchant_product_id",item.sku).eq("status","review").eq("title",item.title).eq("price",item.price).eq("currency","GBP").eq("metadata->>feed_id",feed).eq("metadata->>live_feed_digest",digest).eq("metadata->>live_feed_verified_at",item.observedAt).eq("metadata->>verified_awin_deep_link",item.affiliateUrl).limit(2)
  ]);
  if(programme.error||!programme.data||source.error||source.data?.length!==1)return empty;
  return exactRetailContent(source.data[0].metadata,digest,programme.data.metadata);
 }catch{return empty;}
}
