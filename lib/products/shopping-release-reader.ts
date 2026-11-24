import "server-only";
import {createAdminClient} from "../supabase/admin";
import {shoppingReleaseFailures} from "./shopping-release-evidence";
import {retailText,retailGallery,retailDepartment} from "./shopping-presentation";
import type {ExternalSource} from "../pipeline/source-readiness";

type Row=Record<string,unknown>;
const rec=(v:unknown):Row=>v&&typeof v==="object"&&!Array.isArray(v)?v as Row:{};
const str=(v:unknown)=>typeof v==="string"?v:"";
const uuid=(v:string)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
const ids=(rows:Row[],key:string)=>[...new Set(rows.map(r=>str(r[key])).filter(uuid))];
const index=(rows:Row[],key="id")=>new Map(rows.map(r=>[str(r[key]),r]));

/** Private server-only admission reader. No score, private feed data or raw
 * credentials leave this boundary. Callers must not treat this as a deal. */
export type ShoppingRelease={
 offerId:string;productId:string;merchantId:string;merchantName:string;
 title:string;price:number;currency:"GBP";stock:string;lastSeenAt:string;
 affiliateUrl:string;slug:string;brand:string|null;model:string|null;productType:string|null;
 sku:string;department:string;gallery:string[];observedAt:string;
};
export async function readShoppingReleases(offerIds:readonly string[]):Promise<ShoppingRelease[]>{
 const requested=[...new Set(offerIds.filter(uuid))].slice(0,60);
 if(!requested.length)return [];
 try{
  const db=createAdminClient();
  const flags=await db.from("system_controls").select("control_key,enabled")
   .in("control_key",["global_emergency_stop","source_ingestion","shopping_publishing"]);
  if(flags.error||!flags.data)return [];
  const controls=flags.data as {control_key:string;enabled:boolean}[];
  const switches=new Map(controls.map(x=>[x.control_key,x.enabled]));
  if(switches.get("global_emergency_stop")!==false||switches.get("source_ingestion")!==true||
     switches.get("shopping_publishing")!==true)return [];
  const [offers,reviews]=await Promise.all([
   db.from("offers").select("id,product_id,merchant_id,source_id,source_offer_id,title,price,currency,affiliate_url,stock_status,status,last_seen_at,valid_from,valid_until,match_confidence,raw_data").in("id",requested).eq("status","active"),
   db.from("awin_shopping_release_reviews").select("offer_id,source_id,advertiser_id,source_offer_id,reviewed_price,reviewed_currency,reviewed_feed_digest,reviewed_offer_at,status,approved_by,approved_at").in("offer_id",requested).eq("status","approved")
  ]);
  if(offers.error||reviews.error||!offers.data?.length||!reviews.data?.length)return [];
  const rows=offers.data as Row[],reviewIndex=index(reviews.data as Row[],"offer_id");
  const sourceIds=ids(rows,"source_id"),merchantIds=ids(rows,"merchant_id"),productIds=ids(rows,"product_id");
  if(!sourceIds.length||!merchantIds.length||!productIds.length)return [];
  const [sources,merchants,products,programmes]=await Promise.all([
   db.from("sources").select("id,status,sync_enabled,credential_status,connector_key,source_type,metadata").in("id",sourceIds),
   db.from("merchants").select("id,name,status,metadata").in("id",merchantIds),
   db.from("products").select("id,status,slug,brand,model,product_type").in("id",productIds),
   db.from("affiliate_programs").select("provider,region,external_account_id,metadata").eq("provider","awin").eq("region","GB")
  ]);
  if(sources.error||merchants.error||products.error||programmes.error)return [];
  const sm=index((sources.data??[]) as Row[]),mm=index((merchants.data??[]) as Row[]),
   pm=index((products.data??[]) as Row[]),pr=index((programmes.data??[]) as Row[],"external_account_id");
  const now=Date.now(),result:ShoppingRelease[]=[];
  for(const offer of rows){
   const review=reviewIndex.get(str(offer.id)),source=sm.get(str(offer.source_id)),
    merchant=mm.get(str(offer.merchant_id)),product=pm.get(str(offer.product_id));
   if(!review||!source||!merchant||!product)continue;
   const programme=pr.get(str(rec(merchant.metadata).external_id));
   if(!programme)continue;
   const failures=shoppingReleaseFailures({offer,review,source:source as unknown as ExternalSource & {id:string},
    merchant,programme,product,controls,connectorConfigured:Boolean(process.env.AWIN_PUBLISHER_ID&&process.env.AWIN_ACCESS_TOKEN)},now);
   if(failures.length)continue;
   const title=str(offer.title).trim(),merchantName=str(merchant.name).trim();
   if(!title||!merchantName)continue;
   const raw=rec(offer.raw_data);
   const slug=str(product.slug);
   if(!/^[a-z0-9][a-z0-9-]{2,159}$/.test(slug))continue;
   result.push({offerId:str(offer.id),productId:str(offer.product_id),merchantId:str(merchant.id),
    merchantName,title,price:Number(offer.price),currency:"GBP",stock:str(offer.stock_status),
    lastSeenAt:str(offer.last_seen_at),affiliateUrl:str(offer.affiliate_url),
    slug,brand:retailText(product.brand),model:retailText(product.model),productType:retailText(product.product_type),
    sku:str(raw.merchant_product_id),department:retailDepartment(raw),gallery:retailGallery(raw,source.metadata),observedAt:str(raw.live_feed_verified_at)});
  }
  return result;
 }catch{return [];}
}

/** Exact product URL fallback for ordinary shopping only. Never admit a draft or
 * manufacture a deal score. Multiple unproven seller identities are not compared.
 */
export async function ordinaryProductBySlug(slug:string):Promise<ShoppingRelease|null>{
 if(!/^[a-z0-9][a-z0-9-]{2,159}$/.test(slug))return null;
 try{
  const db=createAdminClient();
  const {data:p,error}=await db.from("products").select("id").eq("slug",slug).eq("status","active").maybeSingle();
  if(error||!p)return null;
  const {data:rows,error:rowsError}=await db.from("offers").select("id,awin_shopping_release_reviews!inner(status)").eq("product_id",p.id).eq("status","active").eq("awin_shopping_release_reviews.status","approved").order("id").limit(60);
  if(rowsError||!rows?.length)return null;
  const admitted=await readShoppingReleases(rows.map(r=>r.id));
  return admitted.find(r=>r.productId===p.id&&r.slug===slug)??null;
 }catch{return null;}
}
