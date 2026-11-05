import test from "node:test";
import assert from "node:assert/strict";
import {prepareTyresUkPrivateBatch} from "../lib/awin/tyres-uk-private-adapter.ts";
const publisher="3135746";
const header=["merchant_id","merchant_product_id","product_name","description",
 "category_name","merchant_category","search_price","currency","aw_deep_link",
 "delivery_cost","last_updated","brand_name","in_stock"];
const make=(change={})=>{
 const row={merchant_id:"12715",merchant_product_id:"TYRE-001",
  product_name:"Synthetic tyre for testing",description:"Tyre 225/45 R17 summer",
  category_name:"Car tyres",merchant_category:"Tyres",search_price:"65.99",
  currency:"GBP",aw_deep_link:`https://www.awin1.com/pclick.php?m=12715&a=${publisher}&p=1234`,
  delivery_cost:"4.99",last_updated:"2026-11-05",brand_name:"Synthetic",
  in_stock:"1",...change};
 return header.map(name=>row[name]??"");
};
const parse=(values,merchant="12715",feed="93988")=>
 prepareTyresUkPrivateBatch(merchant,feed,header,[values])[0];
test("description-derived tyre candidate is review-only and never approved for public matching",()=>{
 const row=parse(make());
 assert.equal(row.status,"review");
 assert.equal(row.currency,"GBP");
 assert.deepEqual(row.metadata.tyre_size_candidate,
  {width_mm:225,aspect_ratio:45,rim_inches:17,verified:false});
 assert.equal(row.metadata.tyre_size_verified,false);
 assert.equal(row.metadata.fitted_price_verified,false);
 assert.equal(row.metadata.delivery_cost_verified,false);
 assert.equal(row.metadata.canonical_category_approved,false);
 assert.equal(row.metadata.release_approved,false);
 assert.equal(row.metadata.permission_status,"unverified");
 assert.equal(row.category,"Motoring > Tyres");
});
test("bad currency, missing size, accessory and contradictory sizes are excluded",()=>{
 for(const edits of [
  {currency:"EUR"},{description:"no fitment dimensions"},
  {product_name:"Tyre fitting service"},
  {description:"205/55 R16 plus 225/45 R17"}
 ]){
  const row=parse(make(edits));
  assert.equal(row.status,"excluded");
  assert.equal(row.metadata.release_approved,false);
 }
});
test("incorrect feed and cross-advertiser rows cannot enter tyre staging",()=>{
 assert.throws(()=>parse(make(),"12715","26513"),/binding_mismatch/);
 assert.throws(()=>parse(make({merchant_id:"15236"})),/Cross-advertiser/);
});
test("invalid affiliate attribution leaves staged row excluded",()=>{
 const row=parse(make({aw_deep_link:"https://www.awin1.com/pclick.php?m=12715&a=1234567&p=1234"}));
 assert.equal(row.status,"excluded");
 assert.ok(row.reasons.includes("tracking_link_unverified"));
});
