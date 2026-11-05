import test from "node:test";
import assert from "node:assert/strict";
import {gzipSync} from "node:zlib";
import {inspectAwinHeaderOnly} from "../lib/awin/read-only-header-probe.ts";

function response(bytes:Uint8Array,contentType="text/csv"){
 return new Response(new Uint8Array(bytes),{status:200,headers:{"content-type":contentType}});
}
test("reads only Awin header, not a product row",async()=>{
 const csv="merchant_id,merchant_product_id,product_name,search_price,currency,aw_deep_link\n496,secret,private product,1,GBP,https://example.test\n";
 const x=await inspectAwinHeaderOnly(response(Buffer.from(csv)));
 assert.equal(x.source_columns,6);
 assert.equal(x.required_physical_columns_present,true);
 assert.equal(JSON.stringify(x).includes("secret"),false);
 assert.equal(x.compressed,false);
});
test("supports gzip header and rejects duplicate column names",async()=>{
 const data="merchant_id,merchant_product_id,product_name,search_price,currency,aw_deep_link\n";
 const result=await inspectAwinHeaderOnly(response(gzipSync(data),"application/gzip"));
 assert.equal(result.compressed,true);
 await assert.rejects(()=>inspectAwinHeaderOnly(response(Buffer.from(
  "merchant_id,merchant_id,product_name,search_price,currency,aw_deep_link\n"
 ))),/duplicate_header/);
});
test("rejects incomplete header",async()=>{
 await assert.rejects(()=>inspectAwinHeaderOnly(response(Buffer.from("merchant_id,merchant_product_id"))),/header_size_limit/);
});
