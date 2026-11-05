import test from "node:test";
import assert from "node:assert/strict";
import {gzipSync} from "node:zlib";
import {inspectTyreBoundedSample} from "../lib/awin/tyre-sample-probe.ts";
const header=["data_feed_id","merchant_id","merchant_name","aw_product_id",
 "aw_deep_link","aw_image_url","aw_thumb_url","category_id","category_name",
 "brand_id","brand_name","merchant_product_id","merchant_category","ean",
 "product_name","description","merchant_deep_link","merchant_image_url",
 "delivery_time","search_price","delivery_cost","in_stock","last_updated",
 "custom_1","custom_2","custom_3","custom_4","custom_5",
 "merchant_product_category_path","custom_7","custom_8","custom_9"];
const data=(id,values={})=>header.map(h=>({
 merchant_id:"15236",merchant_product_id:id,product_name:"Synthetic 225/45 R17 tyre",
 search_price:"59.99",custom_1:"SYNTHETIC",...values
})[h]??"").join(",");
test("gzip sample reports counts without releasing row or custom values",async()=>{
 const bytes=gzipSync([header.join(","),data("one"),data("two")].join("\n")+"\n");
 const r=await inspectTyreBoundedSample(new Response(bytes).body?new Response(bytes):new Response(""),"15236","26513");
 assert.equal(r.sampled_rows,2);
 assert.equal(r.source_columns,32);
 assert.equal(r.title_size_candidate_rows,2);
 assert.equal(r.rows_with_nonempty_custom_fields,2);
 assert.equal(r.rows_with_explicit_currency,0);
 assert.equal(r.tyre_size_verified,false);
 assert.equal(r.ready_to_import,false);
 assert.equal(JSON.stringify(r).includes("SYNTHETIC"),false);
});
test("bad merchant and duplicate IDs are counted without staging",async()=>{
 const bytes=gzipSync([header.join(","),data("x"),data("x",{merchant_id:"12715"})].join("\n")+"\n");
 const r=await inspectTyreBoundedSample(new Response(bytes),"15236","26513");
 assert.equal(r.invalid_merchant_rows,1);
 assert.equal(r.duplicate_ids_in_sample,1);
 assert.equal(r.no_database_writes,true);
});
