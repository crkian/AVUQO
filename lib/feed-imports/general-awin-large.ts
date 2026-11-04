/** Strict private Awin feed dialect detection; never guess an unsupported schema. */
export type RawRow=Record<string,string>;
export type Format="awin-csv"|"google-retail";
const ownPublisher="3135746";
const get=(r:RawRow,...keys:string[])=>keys.map(k=>(r[k]??"").trim()).find(Boolean)??"";
const safeHttps=(value:string)=>{try{const u=new URL(value);return u.protocol==="https:"&&!u.username&&!u.password&&u.href.length<=2048?u.href:null;}catch{return null;}};
function ownTracking(value:string,merchant:string){
 const text=safeHttps(value);if(!text)return false;
 const u=new URL(text);
 if(!["awin1.com","www.awin1.com"].includes(u.hostname))return false;
 return u.pathname==="/pclick.php"&&u.searchParams.get("m")===merchant&&u.searchParams.get("a")===ownPublisher&&Boolean(u.searchParams.get("p"))
  ||u.pathname==="/cread.php"&&u.searchParams.get("awinmid")===merchant&&u.searchParams.get("awinaffid")===ownPublisher;
}
export function identifyFormat(header:string[]):Format{
 if(header.length>120||header.length<5||new Set(header).size!==header.length)throw Error("Duplicate or invalid column names");
 const h=new Set(header);
 if(["merchant_id","merchant_product_id","product_name","search_price","currency"].every(k=>h.has(k)))return "awin-csv";
 if(["advertiser_id","id","title","price","availability","aw_deep_link"].every(k=>h.has(k)))return "google-retail";
 throw Error("Unsupported feed format: expected an Awin CSV or Awin Google-retail CSV with an explicit advertiser ID. No columns were guessed.");
}
function parsePrice(s:string,format:Format,currencyField:string){
 const match=format==="google-retail"?s.match(/^([0-9]+(?:\.[0-9]{1,2})?)\s+([A-Za-z]{3})$/):s.match(/^([0-9]+(?:\.[0-9]{1,2})?)$/);
 const currency=format==="google-retail"?(match?.[2].toUpperCase()??""):currencyField.toUpperCase();
 const amount=match?Number(match[1]):NaN;
 return {currency,price:Number.isFinite(amount)&&amount>0&&amount<10000000?amount.toFixed(2):null};
}
export function prepareGeneralBatch(merchant:string,feedId:string,header:string[],rows:string[][]){
 if(!/^\d{1,9}$/.test(merchant)||!/^[A-Za-z0-9_-]{1,30}$/.test(feedId))throw Error("Invalid advertiser/feed ID");
 if(rows.length<1||rows.length>250)throw Error("Batch must contain 1–250 rows");
 const format=identifyFormat(header);
 const seen=new Set<string>();
 return rows.map(values=>{
  if(values.length!==header.length||values.some(x=>x.length>10000))throw Error("Malformed column count/field size");
  const r=Object.fromEntries(header.map((h,i)=>[h,values[i]])) as RawRow;
  const rowMerchant=get(r,format==="google-retail"?"advertiser_id":"merchant_id");
  if(rowMerchant!==merchant)throw Error("Cross-advertiser row detected; import refused");
  const productId=get(r,format==="google-retail"?"id":"merchant_product_id");
  if(!productId||productId.length>250)throw Error("Missing or invalid product identity within batch");
  if(seen.has(productId))throw Error("Duplicate merchant product ID within batch");
  seen.add(productId);
  const title=get(r,format==="google-retail"?"title":"product_name").slice(0,500);
  const {currency,price}=parsePrice(get(r,format==="google-retail"?"price":"search_price"),format,get(r,"currency"));
  const tracking=get(r,"aw_deep_link"),verified=ownTracking(tracking,merchant);
  const availability=get(r,format==="google-retail"?"availability":"stock_status","in_stock");
  const reasons:string[]=[];
  if(!title)reasons.push("missing_title");
  if(!price)reasons.push("invalid_or_zero_price");
  if(currency!=="GBP")reasons.push("unexpected_currency");
  if(!verified)reasons.push("tracking_link_unverified");
  if(["out of stock","unavailable","out_of_stock","0","no","false"].includes(availability.toLowerCase()))reasons.push("out_of_stock");
  if(title.toLowerCase().includes("shipping protection"))reasons.push("non_product_shipping_protection");
  const brand=get(r,format==="google-retail"?"brand":"brand_name");
  const category=get(r,format==="google-retail"?"product_type":"category_name","google_product_category");
  const image=safeHttps(get(r,format==="google-retail"?"image_link":"merchant_image_url","aw_image_url"));
  const ean=get(r,"ean","gtin"),mpn=get(r,"mpn"),model=get(r,"model_number","product_model");
  return {
   merchant_id:merchant,merchant_product_id:productId,
   awin_product_id:get(r,"aw_product_id").slice(0,250),
   title,price,currency,brand:brand.slice(0,250),category:category.slice(0,500),
   status:reasons.length?"excluded":"review",reasons,image_url:image,
   metadata:{
    source_format:format,feed_id:feedId,
    manufacturer_brand:brand.slice(0,250)||null,manufacturer_brand_source:"retailer_supplied_unverified",
    merchant_category_path:get(r,"merchant_product_category_path","product_type")||null,
    availability:availability||null,model:model||null,ean:ean||null,mpn:mpn||null,
    gtin:get(r,"product_GTIN","gtin")||null,
    source_updated_at:get(r,"last_updated")||null,
    tracking_link_verified:verified,tracking_link_present:Boolean(tracking),
    image_present:Boolean(image),source_image_rights_confirmed:false,
    canonical_category_approved:false,category_classification_status:"needs_review",
    permission_status:"unverified",price_observation_kind:"private_import",
    product_type_hint:format==="google-retail"?"google-retail":"awin-general"
   }
  };
 });
}
