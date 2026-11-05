import test from "node:test";
import assert from "node:assert/strict";
import {normalizePilotAwinFeed} from "../lib/awin/pilot-feed-normalizer.ts";

const header=["data_feed_id","merchant_id","merchant_name","aw_product_id","aw_deep_link",
"aw_image_url","aw_thumb_url","category_id","category_name","brand_id","brand_name",
"merchant_product_id","product_name","description","merchant_deep_link","merchant_image_url",
"search_price","condition","stock_status","product_GTIN"];
const row=header.map(h=>({
 merchant_id:"77952",merchant_product_id:"sku-1",product_name:"Test product",
 search_price:"19.99",aw_deep_link:"https://www.awin1.com/pclick.php?m=77952&a=3135746&p=x"
})[h]??"");
test("scoped UK feed gets explicit GBP provenance",()=>{
 const result=normalizePilotAwinFeed("77952","103580",header,[row]);
 assert.equal(result.currencySource,"petlibro_uk_programme_gbp");
 assert.equal(result.header.at(-1),"currency");
 assert.equal(result.rows[0].at(-1),"GBP");
 assert.equal(result.rows[0][result.header.indexOf("merchant_id")],"77952");
});
test("other advertisers never inherit Petlibro GBP",()=>{
 assert.throws(()=>normalizePilotAwinFeed("31539","74135",header,[row]),/Unsupported feed format/);
});
test("wrong row advertiser is rejected",()=>{
 const bad=[...row];bad[header.indexOf("merchant_id")]="31539";
 assert.throws(()=>normalizePilotAwinFeed("77952","103580",header,[bad]),/petlibro_advertiser_mismatch/);
});
test("unexpected schema is not coerced",()=>{
 assert.throws(()=>normalizePilotAwinFeed("77952","103580",header.filter(x=>x!=="aw_product_id"),[row.slice(1)]),/Unsupported feed format/);
});
test("duplicate columns fail closed",()=>{
 assert.throws(()=>normalizePilotAwinFeed("77952","103580",[...header,header[0]],[row]),/invalid_petlibro_header/);
});
