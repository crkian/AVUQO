import test from "node:test";
import assert from "node:assert/strict";
import {prepareGeneralBatch} from "../lib/feed-imports/general-awin-large.ts";
const header=["merchant_id","merchant_product_id","product_name","search_price","currency","aw_deep_link","stock_status"];
const good="https://www.awin1.com/pclick.php?m=736&a=3135746&p=100";
const row=(link)=>["736","item-100","Synthetic Chocolate Box","12.95","GBP",link,"in stock"];
test("private Awin row retains ONLY own-publisher and exact-advertiser verified product deep link",()=>{
 const [result]=prepareGeneralBatch("736","48599",header,[row(good)]);
 assert.equal(result.status,"review");
 assert.equal(result.metadata.tracking_link_verified,true);
 assert.equal(result.metadata.verified_awin_deep_link,good);
 assert.equal(result.metadata.permission_status,"unverified");
 assert.equal(result.metadata.source_image_rights_confirmed,false);
});
test("other-publisher, cross-advertiser and unsafe links are never persisted",()=>{
 const badLinks=[
  good.replace("a=3135746","a=1234"),
  good.replace("m=736","m=496"),
  good.replace("www.awin1.com","evil.example"),
  good.replace("https:","http:"),
  "https://ui.awin.com/productdata-darwin-download/publisher/3135746/secret/feedList"
 ];
 for(const link of badLinks){
  const [r]=prepareGeneralBatch("736","48599",header,[row(link)]);
  assert.equal(r.status,"excluded");
  assert.equal(r.metadata.tracking_link_verified,false);
  assert.equal(r.metadata.verified_awin_deep_link,null);
 }
});
test("no field ever stores credential-bearing feed-list URL",()=>{
 const [result]=prepareGeneralBatch("736","48599",header,[row(good)]);
 const value=JSON.stringify(result.metadata);
 assert.doesNotMatch(value,/datafeed\/list|productdata-darwin-download|api_key/i);
});
