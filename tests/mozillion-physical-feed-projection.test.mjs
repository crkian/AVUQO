import test from "node:test";
import assert from "node:assert/strict";
import {normalizePilotAwinFeed} from "../lib/awin/pilot-feed-normalizer.ts";
import {prepareGeneralBatch} from "../lib/feed-imports/general-awin-large.ts";
const required=["merchant_id","merchant_product_id","product_name","search_price","currency","aw_deep_link"];
const other=["aw_product_id","merchant_image_url","aw_image_url","category_name","brand_name","stock_status","in_stock","merchant_product_category_path","product_type","ean","mpn","product_model","model_number","product_GTIN","last_updated"];
const headers=[...required,...other,...Array.from({length:123-required.length-other.length},(_,i)=>"custom_field_"+i)];
function row(id="sku-1",merchant="31539"){
 return headers.map(h=>({
 merchant_id:merchant,merchant_product_id:id,product_name:"SIM-free handset",
 search_price:"250.00",currency:"GBP",aw_deep_link:"https://www.awin1.com/pclick.php?m=31539&a=3135746&p=1",
 stock_status:"in stock"
 })[h]??"");
}
test("projects 123-column Mozillion rows and preserves explicit GBP",()=>{
 const p=normalizePilotAwinFeed("31539","74135",headers,[row()]);
 assert.equal(p.header.length,other.length+required.length);
 assert.equal(p.rows[0].length,p.header.length);
 assert.equal(p.currencySource,"feed_column");
 assert.equal(p.rows[0][p.header.indexOf("merchant_product_id")],"sku-1");
 const records=prepareGeneralBatch("31539","74135",p.header,p.rows);
 assert.equal(records[0].status,"review");
 assert.equal(records[0].price,"250.00");
});
test("rejects a cross-advertiser row",()=>{
 assert.throws(()=>normalizePilotAwinFeed("31539","74135",headers,[row("sku-1","77952")]),/mozillion_advertiser_mismatch/);
});
test("rejects duplicate critical column names",()=>{
 const h=[...headers];h[h.indexOf("custom_field_0")]="merchant_id";
 assert.throws(()=>normalizePilotAwinFeed("31539","74135",h,[row()]),/invalid_mozillion_required_columns/);
});
test("does not extend wide schema rules to other feeds",()=>{
 assert.throws(()=>normalizePilotAwinFeed("77952","103580",headers,[row()]));
});
test("rejects missing required currency",()=>{
 const h=[...headers];h[h.indexOf("currency")]="custom_currency";
 assert.throws(()=>normalizePilotAwinFeed("31539","74135",h,[row()]),/invalid_mozillion_required_columns/);
});
