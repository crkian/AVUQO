import test from "node:test";
import assert from "node:assert/strict";
import {normalizePilotAwinFeed} from "../lib/awin/pilot-feed-normalizer.ts";

const header=["data_feed_id","merchant_id","merchant_name","aw_product_id",
 "aw_deep_link","aw_image_url","aw_thumb_url","category_id",
 "category_name","brand_id","brand_name","merchant_product_id",
 "product_name","description","merchant_deep_link","merchant_image_url",
 "search_price","condition","stock_status","product_GTIN"];
const row=feed=>[feed,"77952","Petlibro UK","P100",
 "https://www.awin1.com/pclick.php?m=77952&a=3135746&p=P100",
 "","","","Pet", "","Petlibro","P100","Synthetic Cat Feeder",
 "","", "", "39.95","new","in stock",""];
test("strict observed Petlibro GBP-omitting schema extends to accepted sale, hero, standard feeds private-only",()=>{
 for(const feed of ["103580","109051","109652","119210"]){
  const normalized=normalizePilotAwinFeed("77952",feed,header,[row(feed)]);
  assert.equal(normalized.currencySource,"petlibro_uk_programme_gbp");
  assert.equal(normalized.header.at(-1),"currency");
  assert.equal(normalized.rows[0].at(-1),"GBP");
 }
});
test("an accepted Petlibro feed cannot borrow another feed's rows or merchant",()=>{
 for(const feed of ["103580","109051","109652","119210"]){
  assert.throws(()=>normalizePilotAwinFeed("77952",feed,header,[row("999999")]),
   /petlibro_feed_identity_mismatch/);
  const other=[...row(feed)];other[1]="496";
  assert.throws(()=>normalizePilotAwinFeed("77952",feed,header,[other]),
   /petlibro_feed_identity_mismatch/);
 }
});
test("unapproved Petlibro feed does not inherit programme currency from old pilot",()=>{
 assert.throws(()=>normalizePilotAwinFeed("77952","999999",header,[row("999999")]));
});
