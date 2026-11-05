import test from "node:test";
import assert from "node:assert/strict";
import {inspectPrivateTyreRowEvidence} from "../lib/awin/tyre-row-evidence.ts";
import {gzipSync} from "node:zlib";
import {inspectTyreBoundedSample} from "../lib/awin/tyre-sample-probe.ts";

test("description-only size remains an unverified candidate, even in GBP",()=>{
 const r=inspectPrivateTyreRowEvidence({
  title:"Synthetic road tyre",description:"Size 225/45 R17",
  category:"Car tyres",currency:"GBP",price:"75.99"
 });
 assert.deepEqual(r.size_candidate,{width_mm:225,aspect_ratio:45,rim_inches:17,verified:false});
 assert.equal(r.gbp_explicit,true);
 assert.equal(r.ready_for_automatic_matching,false);
 assert.equal(r.ready_for_publication,false);
});
test("conflicting size descriptions, accessories and wrong currencies fail closed",()=>{
 const conflict=inspectPrivateTyreRowEvidence({
  title:"205/55 R16 tyre",description:"225/45 R17",
  category:"Car tyres",currency:"EUR",price:"80.00"
 });
 assert.equal(conflict.size_conflict,true);
 assert.equal(conflict.size_candidate,null);
 assert.equal(conflict.gbp_explicit,false);
 const accessory=inspectPrivateTyreRowEvidence({
  title:"Tyre fitting service",description:"225/45 R17",
  category:"Vehicle Services",currency:"GBP",price:"20.00"
 });
 assert.equal(accessory.blocked_non_tyre,true);
 assert.equal(accessory.ready_for_automatic_matching,false);
});
test("37-column Tyres UK synthetic gzip sample counts GBP without exposing values",async()=>{
 const header=["data_feed_id","merchant_id","merchant_name","aw_product_id",
  "aw_deep_link","aw_image_url","aw_thumb_url","category_id",
  "category_name","brand_id","brand_name","merchant_product_id",
  "merchant_category","ean","product_name","description",
  "merchant_deep_link","merchant_image_url","search_price",
  "delivery_cost","in_stock","currency","last_updated",
  "custom_1","custom_2","custom_3","custom_4","custom_5","custom_6",
  "merchant_product_category_path","custom_7","custom_8",
  "custom_9","custom_10","custom_11","custom_12","custom_13"];
 const make=(id,currency,desc)=>header.map(key=>( {
  merchant_id:"12715",merchant_product_id:id,product_name:"Synthetic tyre",
  description:desc,currency,search_price:"58.00",custom_1:"test"
 })[key]??"").join(",");
 const csv=[header.join(","),make("a","GBP","225/45 R17"),
  make("b","EUR","205/55 R16")].join("\n")+"\n";
 const result=await inspectTyreBoundedSample(new Response(gzipSync(csv)),"12715","93988");
 assert.equal(result.sampled_rows,2);
 assert.equal(result.rows_with_explicit_gbp,1);
 assert.equal(result.rows_with_other_explicit_currency,1);
 assert.equal(result.description_or_category_only_size_candidates,2);
 assert.equal(result.ready_to_import,false);
 assert.equal(JSON.stringify(result).includes("205/55"),false);
});
