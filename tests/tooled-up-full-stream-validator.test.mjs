import test from "node:test";
import assert from "node:assert/strict";
import {gzipSync} from "node:zlib";
import {createHash} from "node:crypto";
import {TOOLED_UP_SOURCE_FIELDS} from "../lib/awin/tooled-up-master-adapter.ts";
import {validateTooledUpGzipStream} from "../lib/awin/tooled-up-full-stream-validator.ts";

const header=[...TOOLED_UP_SOURCE_FIELDS];
function row(id,overrides={}){
 const v={
  merchant_id:"496",data_feed_id:"89987",merchant_product_id:id,
  product_name:"Synthetic drill",search_price:"39.99",
  aw_deep_link:"https://www.awin1.com/pclick.php?m=496&a=3135746&p=123",
  stock_status:"in stock",...overrides
 };
 return header.map(h=>v[h]??"").join(",");
}
function input(rows){
 const bytes=gzipSync([header.join(","),...rows].join("\n")+"\n");
 return {bytes,stream:new Response(bytes).body};
}
test("complete synthetic gzip feed produces aggregate-only digest with staging blocked",async()=>{
 const {bytes,stream}=input([row("A"),row("B")]);
 const r=await validateTooledUpGzipStream(stream);
 assert.equal(r.actual_rows,2);
 assert.equal(r.estimated_chunks,1);
 assert.equal(r.critical_issues,0);
 assert.equal(r.snapshot_sha256,createHash("sha256").update(bytes).digest("hex"));
 assert.equal(r.currency_verified,false);
 assert.equal(r.ready_to_stage,false);
 assert.equal(r.no_database_writes,true);
 assert.equal(JSON.stringify(r).includes("Synthetic drill"),false);
});
test("detects duplicate IDs and malformed rows without returning values",async()=>{
 const {stream}=input([row("A"),row("A",{merchant_id:"31539",search_price:"oops",
  aw_deep_link:"https://wrong.test/",data_feed_id:"89988"})]);
 const r=await validateTooledUpGzipStream(stream);
 assert.equal(r.duplicate_product_ids,1);
 assert.equal(r.wrong_merchant_rows,1);
 assert.equal(r.wrong_feed_rows,1);
 assert.equal(r.invalid_price_rows,1);
 assert.equal(r.unverified_affiliate_links,1);
 assert.equal(r.critical_issues,5);
});
test("bad source header and broken gzip fail closed",async()=>{
 const bad=gzipSync("a,b,c,d,e\n1,2,3,4,5\n");
 await assert.rejects(()=>validateTooledUpGzipStream(new Response(bad).body),/schema_mismatch/);
 await assert.rejects(()=>validateTooledUpGzipStream(
  new Response(Buffer.from("not gzip")).body
 ));
});
