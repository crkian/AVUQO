import test from "node:test";
import assert from "node:assert/strict";
import {gzipSync} from "node:zlib";
import {TOOLED_UP_SOURCE_FIELDS} from "../lib/awin/tooled-up-master-adapter.ts";
import {inspectTooledUpBoundedSample} from "../lib/awin/tooled-up-sample-probe.ts";
const header=[...TOOLED_UP_SOURCE_FIELDS];
const item=(id="TOOL1",merchant="496",price="12.99",link="https://www.awin1.com/pclick.php?p=101&m=496&a=3135746")=>
 header.map(h=>({
  data_feed_id:"89987",merchant_id:merchant,merchant_product_id:id,
  product_name:"Test tool",search_price:price,aw_deep_link:link
 }[h]??"")).join(",");
const csv=(rows)=>[header.join(","),...rows].join("\n")+"\n";
test("plain CSV sample returns aggregate checks but never product values",async()=>{
 const r=await inspectTooledUpBoundedSample(new Response(Buffer.from(csv([item()]))));
 assert.equal(r.sampled_rows,1);assert.equal(r.invalid_merchant_rows,0);
 assert.equal(r.currency_verified,false);assert.equal(r.no_database_writes,true);
 assert.equal(JSON.stringify(r).includes("TOOL1"),false);
});
test("gzip sample catches malformed identity, price, tracking and duplicates",async()=>{
 const input=csv([item("TOOL1"),item("TOOL1","31539","oops","https://invalid.example/path")]);
 const r=await inspectTooledUpBoundedSample(new Response(gzipSync(input)));
 assert.equal(r.compressed,true);
 assert.equal(r.sampled_rows,2);
 assert.equal(r.invalid_merchant_rows,1);
 assert.equal(r.invalid_price_format_rows,1);
 assert.equal(r.duplicate_ids_in_sample,1);
 assert.equal(r.unverified_affiliate_links,1);
});
test("rejects unreviewed headers",async()=>{
 await assert.rejects(()=>inspectTooledUpBoundedSample(
  new Response(Buffer.from("foo,bar,one,two,three\n1,2,3,4,5\n"))
 ),/schema_mismatch/);
});
