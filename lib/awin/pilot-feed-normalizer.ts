import {identifyFormat} from "../feed-imports/general-awin-large";

/**
 * Petlibro UK's Awin standard CSV omits the optional "currency" column.
 * This is restricted to the reviewed UK feed 77952:103580. Programme
 * correspondence specifies GBP pricing, but currency is inferred from the
 * programme, NOT present in the product file. It must remain private review.
 */
export function normalizePilotAwinFeed(advertiser:string,feedId:string,header:string[],rows:string[][]){
 if(advertiser==="31539"&&feedId==="74135"){
  // Awin's SIM-free feed has 123 columns, including optional/custom fields.
  // Keep only explicitly reviewed retail columns. The selected source keys
  // must each occur EXACTLY once, even if unneeded custom columns are unusual.
  const selected=[
   "merchant_id","merchant_product_id","product_name","search_price","currency",
   "aw_deep_link","aw_product_id","merchant_image_url","aw_image_url",
   "category_name","brand_name","stock_status","in_stock",
   "merchant_product_category_path","product_type","ean","mpn",
   "product_model","model_number","product_GTIN","last_updated"
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
 if(advertiser!=="77952"||feedId!=="103580"){
  identifyFormat(header);
  return {header,rows,currencySource:"feed_column" as const};
 }
 if(new Set(header).size!==header.length||header.length>120||header.length<5)
  throw Error("invalid_petlibro_header");
 const required=[
  "data_feed_id","merchant_id","merchant_name","aw_product_id",
  "aw_deep_link","aw_image_url","aw_thumb_url","category_id",
  "category_name","brand_id","brand_name","merchant_product_id",
  "product_name","description","merchant_deep_link","merchant_image_url",
  "search_price","condition","stock_status","product_GTIN"
 ];
 // Require the exact observed 20-column UK schema, never guess alternative
 // field mappings or change a currency explicitly supplied by the source.
 if(header.length===required.length&&required.every(field=>header.includes(field))){
  const merchantIndex=header.indexOf("merchant_id");
  if(rows.some(row=>row.length!==header.length||row[merchantIndex]?.trim()!=="77952"))
   throw Error("petlibro_advertiser_mismatch");
  const normalizedHeader=[...header,"currency"];
  const normalizedRows=rows.map(row=>[...row,"GBP"]);
  identifyFormat(normalizedHeader);
  return {header:normalizedHeader,rows:normalizedRows,currencySource:"petlibro_uk_programme_gbp" as const};
 }
 identifyFormat(header);
 return {header,rows,currencySource:"feed_column" as const};
}
