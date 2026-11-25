import {identifyFormat} from "../feed-imports/general-awin-large.ts";

/**
 * Petlibro UK's Awin standard CSV omits the optional "currency" column.
 * This is restricted to the reviewed UK feed 77952:103580. Programme
 * correspondence specifies GBP pricing, but currency is inferred from the
 * programme, NOT present in the product file. It must remain private review.
 */
export function normalizePilotAwinFeed(advertiser:string,feedId:string,header:string[],rows:string[][]){
 // This exact UK standard feed has no stock or currency field. It may be
 // archived for catalogue enrichment; it must never supply live price/stock.
 if(advertiser==="101445"&&feedId==="96428"&&!header.includes("currency")){
  const expected=["data_feed_id","merchant_id","merchant_name","aw_product_id","aw_deep_link","aw_image_url","aw_thumb_url","category_id","category_name","brand_id","brand_name","merchant_product_id","merchant_category","ean","mpn","product_name","description","merchant_deep_link","merchant_image_url","delivery_time","search_price","delivery_cost","product_type"];
  if(header.length!==expected.length||new Set(header).size!==header.length||!expected.every(k=>header.includes(k)))throw Error("playpress_standard_schema_mismatch");
  const merchant=header.indexOf("merchant_id"),feed=header.indexOf("data_feed_id");
  if(rows.some(r=>r.length!==header.length||r[merchant]?.trim()!==advertiser||r[feed]?.trim()!==feedId))throw Error("playpress_standard_identity_mismatch");
  const normalizedHeader=[...header,"currency"];
  identifyFormat(normalizedHeader);
  return {header:normalizedHeader,rows:rows.map(r=>[...r,"GBP"]),currencySource:"playpress_uk_programme_gbp_private_only" as const};
 }
 if(advertiser==="31539"&&feedId==="74135"){
  // Awin's SIM-free feed has 123 columns, including optional/custom fields.
  // Keep only explicitly reviewed retail columns. The selected source keys
  // must each occur EXACTLY once, even if unneeded custom columns are unusual.
  const selected=[
   "merchant_id","merchant_product_id","product_name","search_price","currency",
   "aw_deep_link","aw_product_id","merchant_image_url","aw_image_url",
   "merchant_thumb_url","aw_thumb_url","large_image","alternate_image",
   "alternate_image_two","alternate_image_three","alternate_image_four",
   "category_name","brand_name","stock_status","in_stock",
   "merchant_product_category_path","product_type","ean","mpn",
   "product_model","model_number","product_GTIN","last_updated",
   "description","product_short_description","colour","size","material","condition","rrp_price",
   "store_price","sale_price","saving","savings_percent","delivery_cost","delivery_time",
   "stock_quantity","valid_from","valid_to","upc","merchant_category"
  ];
  if(header.length<121||header.length>256)throw Error("invalid_mozillion_column_count");
  const required=["merchant_id","merchant_product_id","product_name","search_price","currency","aw_deep_link"];
  if(required.some(name=>header.filter(h=>h===name).length!==1))
   throw Error("invalid_mozillion_required_columns");
  const projected=selected.filter(name=>header.includes(name));
  if(projected.length>120||projected.some(name=>header.filter(h=>h===name).length!==1))
   throw Error("ambiguous_mozillion_column");
  const positions=projected.map(name=>header.indexOf(name));
  const projectedRows=rows.map(row=>{
   if(row.length!==header.length)throw Error("inconsistent_mozillion_row");
   if(row[header.indexOf("merchant_id")]?.trim()!=="31539")
    throw Error("mozillion_advertiser_mismatch");
   return positions.map(i=>row[i]);
  });
  identifyFormat(projected);
  return {header:projected,rows:projectedRows,currencySource:"feed_column" as const};
 }
 if((advertiser==="45747"&&feedId==="F1356")||
    (advertiser==="101445"&&feedId==="F5142")){
  if(header.length<6||header.length>256||new Set(header).size!==header.length)
   throw Error("invalid_google_retail_columns");
  const required=["advertiser_id","id","title","price","availability","aw_deep_link"];
  if(required.some(name=>header.filter(h=>h===name).length!==1))
   throw Error("invalid_google_retail_required_columns");
  const selected=[...required,"brand","product_type","google_product_category",
   "image_link","additional_image_link","lifestyle_image_link","gtin","ean","mpn","condition","last_updated",
   "description","structured_description","color","size","material","pattern","gender","age_group",
   "item_group_id","sale_price","sale_price_effective_date","shipping","unit_pricing_measure",
   "unit_pricing_base_measure","product_detail","product_highlight"];
  const projected=selected.filter(name=>header.includes(name));
  const positions=projected.map(name=>header.indexOf(name));
  const merchantCol=header.indexOf("advertiser_id");
  const projectedRows=rows.map(row=>{
   if(row.length!==header.length||row[merchantCol]?.trim()!==advertiser)
    throw Error("google_retail_advertiser_mismatch");
   return positions.map(i=>row[i]);
  });
  identifyFormat(projected);
  return {header:projected,rows:projectedRows,currencySource:"feed_column" as const};
 }
 // UK-only Cadbury standard feed may omit the optional currency column.
 // The owner's UK/GBP convention permits PRIVATE review only, never public
 // price verification or a merchant image/affiliate permission grant.
 // Bind every row to the exact joined advertiser and feed before inferring GBP.
 if(advertiser==="736"&&feedId==="48599"&&!header.includes("currency")){
  const required=["data_feed_id","merchant_id","merchant_product_id",
   "product_name","search_price","aw_deep_link"];
  if(header.length<required.length||header.length>120||
     new Set(header).size!==header.length||
     required.some(name=>header.filter(h=>h===name).length!==1))
   throw Error("cadbury_uk_schema_mismatch");
  const merchant=header.indexOf("merchant_id"),sourceFeed=header.indexOf("data_feed_id");
  if(rows.some(row=>row.length!==header.length||
     row[merchant]?.trim()!=="736"||row[sourceFeed]?.trim()!=="48599"))
   throw Error("cadbury_uk_feed_identity_mismatch");
  const normalizedHeader=[...header,"currency"];
  const normalizedRows=rows.map(row=>[...row,"GBP"]);
  identifyFormat(normalizedHeader);
  return {header:normalizedHeader,rows:normalizedRows,
   currencySource:"cadbury_uk_programme_gbp" as const};
 }
 // Additional accepted Petlibro feeds may share the established UK
 // standard schema. Inference is private-only, for a bound canonical schema
 // and exact retailer/feed IDs. Explicit currency values are never overwritten.
 if(advertiser!=="77952"||
    !["103580","109051","109652","119210"].includes(feedId)){
  identifyFormat(header);
  return {header,rows,currencySource:"feed_column" as const};
 }
 if(new Set(header).size!==header.length||header.length>120||header.length<5)
  throw Error("invalid_petlibro_header");
 // Require exact canonical field names and row binding; optional columns may vary.
 // Never guess aliases or replace explicitly supplied currency.
 if(!header.includes("currency")&&["data_feed_id","merchant_id","merchant_product_id","product_name","search_price","aw_deep_link"].every(field=>header.includes(field))){
  const merchantIndex=header.indexOf("merchant_id");
  const feedIndex=header.indexOf("data_feed_id");
  if(rows.some(row=>row.length!==header.length||
    row[merchantIndex]?.trim()!=="77952"||row[feedIndex]?.trim()!==feedId))
   throw Error("petlibro_feed_identity_mismatch");
  const normalizedHeader=[...header,"currency"];
  const normalizedRows=rows.map(row=>[...row,"GBP"]);
  identifyFormat(normalizedHeader);
  return {header:normalizedHeader,rows:normalizedRows,currencySource:"petlibro_uk_programme_gbp" as const};
 }
 if(header.includes("data_feed_id")&&header.includes("merchant_id")){
  const fi=header.indexOf("data_feed_id"),mi=header.indexOf("merchant_id");
  if(rows.some(r=>r.length!==header.length||r[fi]?.trim()!==feedId||r[mi]?.trim()!==advertiser))throw Error("petlibro_feed_identity_mismatch");
 }
 identifyFormat(header);
 return {header,rows,currencySource:"feed_column" as const};
}
