import "server-only";
import {createAdminClient} from "../supabase/admin";

/** Public offer admission. Deny by default: imported, demo and stale rows are not commercial evidence. */
export type PublicOffer={
 published:{offer_id:string;product_id:string;title:string;category:string;merchant:string;current_price:number;typical_price:number|null;saving_amount:number|null;avuqo_score:number;confidence:number;label:string;decision:string;image_url:string|null;stock_status:string|null;reason:string|null;updated_at:string|null};
 offer:{id:string;product_id:string;source_id:string;price:number;total_price:number|null;currency:string;status:string;source_url:string|null;affiliate_url:string|null;last_seen_at:string|null;valid_until:string|null;stock_status:string|null;match_confidence:number|null};
 source:{id:string;name:string;imageAllowed:boolean};
};
export type PublicProduct={
 id:string;slug:string;canonical_title:string;brand:string|null;model:string|null;description:string|null;primary_image_url:string|null;specifications:unknown;status:string;product_type:string|null;
};
function metadata(raw:unknown):Record<string,unknown>{return raw&&typeof raw==="object"&&!Array.isArray(raw)?raw as Record<string,unknown>:{};}
function isHttps(value:string|null){if(!value)return false;try{const u=new URL(value);return u.protocol==="https:"&&!u.username&&!u.password&&u.hostname.length>3;}catch{return false;}}
function sourceReady(source:Record<string,unknown>|undefined):boolean{
 if(!source||source.status!=="active"||source.sync_enabled!==true||source.credential_status!=="ready"||!source.connector_key||source.connector_key==="demo"||source.source_type==="internal_test")return false;
 const rights=metadata(source.metadata);
 return rights.usage_rights_confirmed===true&&typeof rights.rights_evidence_ref==="string"&&rights.rights_evidence_ref.trim().length>=5;
}
function offerFresh(row:Record<string,unknown>,now:number):boolean{
 if(row.status!=="active"||row.currency!=="GBP"||!(Number(row.price)>0)||!isHttps((row.affiliate_url||row.source_url) as string|null))return false;
 const checked=Date.parse(String(row.last_seen_at??""));if(!Number.isFinite(checked)||now-checked>7*24*3600_000||checked>now+3600_000)return false;
 if(row.valid_until&&Date.parse(String(row.valid_until))<now)return false;
 // Refuse ambiguous matching confidence. Accepted scale is [0,1] or [0,100].
 const match=row.match_confidence===null?NaN:Number(row.match_confidence);
 if(!Number.isFinite(match)||match<(match>1?85:0.85))return false;
 return true;
}
const SELECT_DEAL="offer_id,product_id,title,category,merchant,current_price,typical_price,saving_amount,avuqo_score,confidence,label,decision,image_url,stock_status,reason,updated_at";
const SELECT_OFFER="id,product_id,source_id,price,total_price,currency,status,source_url,affiliate_url,last_seen_at,valid_until,stock_status,match_confidence";
export async function verifiedOffers(options:{productId?:string;offerId?:string;limit?:number}={}):Promise<PublicOffer[]>{
 try{
  const db=createAdminClient();
  const limit=Math.max(1,Math.min(options.limit??24,60));
  let q=db.from("published_deals").select(SELECT_DEAL).eq("status","published").order("updated_at",{ascending:false}).limit(Math.min(limit*10,500));
  if(options.productId)q=q.eq("product_id",options.productId);
  if(options.offerId)q=q.eq("offer_id",options.offerId);
  const {data:published,error}=await q;if(error||!published?.length)return [];
  const ids=published.map(d=>d.offer_id).filter(Boolean);
  const {data:offers,error:offersError}=await db.from("offers").select(SELECT_OFFER).in("id",ids).eq("status","active");
  if(offersError||!offers?.length)return [];
  const sourceIds=[...new Set(offers.map(o=>o.source_id).filter(Boolean))];
  if(!sourceIds.length)return [];
  const {data:sources,error:sourceError}=await db.from("sources").select("id,name,status,sync_enabled,credential_status,connector_key,source_type,metadata").in("id",sourceIds);
  if(sourceError||!sources?.length)return [];
  const sourceMap=new Map(sources.map(s=>[s.id,s]));
  const offerMap=new Map(offers.map(o=>[o.id,o]));
  const now=Date.now();
  return published.flatMap(d=>{
   const offer=offerMap.get(d.offer_id);if(!offer)return [];
   const source=sourceMap.get(offer.source_id);if(!source||!sourceReady(source as Record<string,unknown>)||!offerFresh(offer as Record<string,unknown>,now))return [];
   if(offer.product_id!==d.product_id||!(Number(d.current_price)>0)||!Number.isFinite(Number(d.avuqo_score)))return [];
   const rights=metadata(source.metadata);
   const imageAllowed=rights.image_rights_confirmed===true;
   return [{published:{...d,image_url:imageAllowed&&isHttps(d.image_url)?d.image_url:null},offer,source:{id:source.id,name:source.name,imageAllowed}} as PublicOffer];
  }).slice(0,limit);
 }catch{return [];}
}
export async function verifiedProduct(slug:string):Promise<{product:PublicProduct;offers:PublicOffer[]}|null>{
 if(!/^[a-z0-9][a-z0-9-]{2,159}$/.test(slug))return null;
 try{
  const db=createAdminClient();
  const {data,error}=await db.from("products").select("id,slug,canonical_title,brand,model,description,primary_image_url,specifications,status,product_type").eq("slug",slug).eq("status","active").maybeSingle();
  if(error||!data)return null;
  const offers=await verifiedOffers({productId:data.id,limit:35});
  if(!offers.length)return null;
  return {product:data as PublicProduct,offers};
 }catch{return null;}
}
export async function verifiedProductIndex(limit=60):Promise<{product:PublicProduct;offers:PublicOffer[]}[]>{
 try{
  const offers=await verifiedOffers({limit:Math.max(limit*4,80)});
  const ids=[...new Set(offers.map(o=>o.published.product_id))].slice(0,limit);
  if(!ids.length)return [];
  const db=createAdminClient();
  const {data,error}=await db.from("products").select("id,slug,canonical_title,brand,model,description,primary_image_url,specifications,status,product_type").in("id",ids).eq("status","active");
  if(error||!data)return [];
  return (data as PublicProduct[]).filter(p=>/^[a-z0-9][a-z0-9-]{2,159}$/.test(p.slug)).map(product=>({product,offers:offers.filter(o=>o.published.product_id===product.id)})).filter(x=>x.offers.length).slice(0,limit);
 }catch{return [];}
}
