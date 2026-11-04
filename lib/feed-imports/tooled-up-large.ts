/** Verified-shaped Awin All Products records for private, resumable import.
 * Never interpret a source brand as a legally verified manufacturer.
 */
export const TOOLED_UP_ID="496";
export const MAX_CHUNK_ROWS=250;
export const REQUIRED=["merchant_id","merchant_product_id","aw_product_id","product_name","search_price","currency","brand_name"];
export type AwinRawRow=Record<string,string>;
const trimmed=(row:AwinRawRow,key:string)=>(row[key]??"").trim();
function httpsUrl(text:string):string|null{
 try{const url=new URL(text);return url.protocol==="https:"&&url.href.length<=2048?url.href:null;}catch{return null;}
}
function trackingIsOurs(url:string|null){
 if(!url)return false;
 const u=new URL(url);
 return (u.hostname==="www.awin1.com"||u.hostname==="awin1.com")&&(
  (u.pathname==="/pclick.php"&&u.searchParams.get("m")==="496"&&u.searchParams.get("a")==="3135746"&&Boolean(u.searchParams.get("p")))
  ||(u.pathname==="/cread.php"&&u.searchParams.get("awinmid")==="496"&&u.searchParams.get("awinaffid")==="3135746")
 );
}
export function prepareTooledUpRow(row:AwinRawRow){
 const merchant_id=trimmed(row,"merchant_id");
 if(merchant_id!==TOOLED_UP_ID)throw Error("Tooled-Up batch contains another advertiser ID");
 const merchant_product_id=trimmed(row,"merchant_product_id"), awin_product_id=trimmed(row,"aw_product_id");
 const title=trimmed(row,"product_name").slice(0,500), currency=trimmed(row,"currency").toUpperCase();
 const amount=trimmed(row,"search_price");
 const price=amount!==""&&/^\d+(?:\.\d{1,2})?$/.test(amount)?Number(amount):NaN;
 const brand=trimmed(row,"brand_name").slice(0,250),category=trimmed(row,"category_name").slice(0,500);
 const tracking=httpsUrl(trimmed(row,"aw_deep_link"));
 const image=httpsUrl(trimmed(row,"merchant_image_url")||trimmed(row,"aw_image_url"));
 const reasons:string[]=[];
 if(!merchant_product_id||!awin_product_id||!title)reasons.push("missing_identity");
 if(!Number.isFinite(price)||price<=0||price>10000000)reasons.push("invalid_or_zero_price");
 if(currency!=="GBP")reasons.push("unexpected_currency");
 if(!trackingIsOurs(tracking))reasons.push("tracking_link_unverified");
 if(["out of stock","unavailable"].includes(trimmed(row,"stock_status").toLowerCase()))reasons.push("out_of_stock");
 const stock=trimmed(row,"stock_status");
 const model=trimmed(row,"model_number")||trimmed(row,"product_model");
 const gtin=trimmed(row,"product_GTIN"),ean=trimmed(row,"ean"),mpn=trimmed(row,"mpn");
 return {
  merchant_id,merchant_product_id,awin_product_id,title,
  price:Number.isFinite(price)&&price>0?price.toFixed(2):null,currency,brand,category,
  status:reasons.length?"excluded":"review",reasons,image_url:image,
  metadata:{
   source_format:"awin-all-products",feed_id:trimmed(row,"data_feed_id")||"89987",
   manufacturer_brand_source:"retailer_brand_name_unverified",
   manufacturer_brand:brand||null,brand_id:trimmed(row,"brand_id")||null,
   model:model||null,gtin:gtin||null,ean:ean||null,mpn:mpn||null,
   merchant_category:trimmed(row,"merchant_category")||null,
   merchant_category_path:trimmed(row,"merchant_product_category_path")||null,
   availability:stock||null,delivery_cost:trimmed(row,"delivery_cost")||null,
   tracking_link_present:Boolean(tracking),tracking_link_verified:trackingIsOurs(tracking),
   image_present:Boolean(image),source_update_present:Boolean(trimmed(row,"last_updated")),
   source_image_rights_confirmed:false,canonical_category_approved:false,
   category_classification_status:"needs_review",
   permission_status:"unverified",price_observation_kind:"private_import"
  }
 };
}
export function prepareTooledUpBatch(headers:string[],rows:string[][]){
 if(rows.length<1||rows.length>MAX_CHUNK_ROWS)throw Error("Batch size must be between 1 and 250 products");
 if(headers.length<REQUIRED.length||headers.length>120||new Set(headers).size!==headers.length)throw Error("Invalid Awin column header");
 const missing=REQUIRED.filter(k=>!headers.includes(k));
 if(missing.length)throw Error("Missing required feed fields: "+missing.join(", "));
 if(rows.some(c=>c.length!==headers.length))throw Error("Inconsistent feed column count");
 const seen=new Set<string>();
 return rows.map(values=>{
  const record=Object.fromEntries(headers.map((key,i)=>[key,values[i]])) as AwinRawRow;
  const item=prepareTooledUpRow(record);
  const key=item.merchant_product_id||item.awin_product_id;
  if(seen.has(key))throw Error("Duplicate merchant product ID inside chunk");
  seen.add(key);
  return item;
 });
}
