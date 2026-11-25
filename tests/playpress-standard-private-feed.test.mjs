import test from "node:test";
import assert from "node:assert/strict";
import {normalizePilotAwinFeed} from "../lib/awin/pilot-feed-normalizer.ts";
import {prepareGeneralBatch} from "../lib/feed-imports/general-awin-large.ts";
import {currentCurrencyEvidence} from "../lib/awin/private-import-provenance.ts";
const header=["data_feed_id","merchant_id","merchant_name","aw_product_id","aw_deep_link","aw_image_url","aw_thumb_url","category_id","category_name","brand_id","brand_name","merchant_product_id","merchant_category","ean","mpn","product_name","description","merchant_deep_link","merchant_image_url","delivery_time","search_price","delivery_cost","product_type"];
const fields={data_feed_id:"96428",merchant_id:"101445",merchant_product_id:"sku-1",product_name:"Toy example",search_price:"12.00",aw_deep_link:"https://www.awin1.com/pclick.php?m=101445&a=3135746&p=123"};
const row=header.map(k=>fields[k]??"");
test("PlayPress standard feed is private-only and does not infer stock",()=>{
 const n=normalizePilotAwinFeed("101445","96428",header,[row]);
 assert.equal(n.currencySource,"playpress_uk_programme_gbp_private_only");
 assert.equal(currentCurrencyEvidence(n.currencySource,"GBP").source_currency_explicit,false);
 const r=prepareGeneralBatch("101445","96428",n.header,n.rows)[0];
 assert.ok(!["in_stock","instock","available","low_stock","limited"].includes(String(r.metadata.availability)));
 assert.throws(()=>normalizePilotAwinFeed("101445","96428",header,[row.map((v,i)=>i===1?"999":v)]));
 assert.throws(()=>normalizePilotAwinFeed("101445","96428",header.slice(1),[row.slice(1)]));
});
