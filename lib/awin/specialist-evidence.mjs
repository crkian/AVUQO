/** Private specialist evidence assessment: a generic search_price is never a tariff or quote.
 * No raw values, links or personal information are returned. */
export function specialistAccumulator(advertiser,feed,header,maxRows=12000){
 const required=["merchant_id","merchant_product_id","product_name","search_price","aw_deep_link"];
 if(header.length>256||new Set(header).size!==header.length||!required.every(k=>header.includes(k)))throw Error("specialist_schema_unbound");
 const at=k=>header.indexOf(k);
 const val=(r,k)=>String(r[at(k)]??"").trim();
 const ids=new Set();
 let explicitGbp=0,sourcePrice=0,termText=0,validLinks=0;
 let count=0;
 function add(r){
  if(++count>maxRows)throw Error("bounded_probe_size_limit");
  if(r.length!==header.length||val(r,"merchant_id")!==advertiser||(at("data_feed_id")>=0&&val(r,"data_feed_id")!==feed))throw Error("specialist_identity_mismatch");
  const id=val(r,"merchant_product_id");
  if(!id||id.length>250||ids.has(id)||!val(r,"product_name"))throw Error("specialist_identity_mismatch");
  ids.add(id);
  if(val(r,"currency")==="GBP")explicitGbp++;
  if(/^\d+(?:\.\d{1,2})?$/.test(val(r,"search_price"))&&Number(val(r,"search_price"))>0)sourcePrice++;
  if(val(r,"terms_of_contract"))termText++;
  try{const u=new URL(val(r,"aw_deep_link"));if(u.protocol==="https:"&&!u.username&&!u.password&&!u.port&&["awin1.com","www.awin1.com"].includes(u.hostname)&&((u.pathname==="/pclick.php"&&u.searchParams.get("m")===advertiser&&u.searchParams.get("a")==="3135746"&&u.searchParams.get("p"))||(u.pathname==="/cread.php"&&u.searchParams.get("awinmid")===advertiser&&u.searchParams.get("awinaffid")==="3135746")))validLinks++;}catch{}
 }
 return {add,result:()=>({rows:count,explicit_gbp:explicitGbp,source_price:sourcePrice,contract_terms_present:termText,own_publisher_links:validLinks,public_quote_ready:0})};
}
export function specialistEvidence(advertiser,feed,header,rows){
 const accumulator=specialistAccumulator(advertiser,feed,header);
 for(const row of rows)accumulator.add(row);
 return accumulator.result();
}
