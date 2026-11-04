import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {csvRowsFromChunks} from "../lib/feed-imports/stream-csv.ts";
import {prepareTooledUpBatch,prepareTooledUpRow} from "../lib/feed-imports/tooled-up-large.ts";
const header=["merchant_id","merchant_product_id","aw_product_id","product_name","search_price","currency","brand_name","brand_id","model_number","ean","product_GTIN","mpn","stock_status","merchant_category","merchant_product_category_path","aw_deep_link","merchant_image_url"];
const product=(id="234")=>[
 "496",id,"36655657825","Arrow HT50P Hammer Staple Tacker Gun","64.95","GBP","Arrow","123","HT50P","5012044012001","","HT50P","In Stock","Hammer Tackers","DIY > Hand Tools > Staplers","https://www.awin1.com/pclick.php?p=36655657825&a=3135746&m=496","https://images.example.com/hammer.jpg"
];
test("large CSV parses streamed quoted commas, multiline fields and escaped quotes at chunk boundaries",async()=>{
 const chunks=['merchant_id,product_name,brand_name\r\n','496,"Hammer, ","Arrow"\r\n','496,"Another\nLine","Br','and ""A""', '"\r\n'];
 const rows=[];
 for await(const row of csvRowsFromChunks((async function*(){for(const c of chunks)yield c;})()))rows.push(row);
 assert.deepEqual(rows,[
 ["merchant_id","product_name","brand_name"],
 ["496","Hammer, ","Arrow"],
 ["496","Another\nLine",'Brand "A"']
 ]);
});
test("manufacturer brand and identifiers retained without legal-manufacturer inference",()=>{
 const row=Object.fromEntries(header.map((key,i)=>[key,product()[i]]));
 const prepared=prepareTooledUpRow(row);
 assert.equal(prepared.status,"review");
 assert.equal(prepared.brand,"Arrow");
 assert.equal(prepared.metadata.manufacturer_brand_source,"retailer_brand_name_unverified");
 assert.equal(prepared.metadata.model,"HT50P");
 assert.equal(prepared.metadata.ean,"5012044012001");
 assert.equal(prepared.metadata.mpn,"HT50P");
 assert.equal(prepared.metadata.availability,"In Stock");
 assert.equal(prepared.metadata.merchant_category_path,"DIY > Hand Tools > Staplers");
 assert.equal(prepared.price,"64.95");
 assert.equal(prepared.metadata.tracking_link_verified,true);
 assert.equal(prepared.metadata.canonical_category_approved,false);
});
test("cross-merchant and bad tracking cannot enter private review as eligible",()=>{
 const other=Object.fromEntries(header.map((key,i)=>[key,product()[i]]));
 other.merchant_id="736";
 assert.throws(()=>prepareTooledUpRow(other),/another advertiser/);
 const wrong=Object.fromEntries(header.map((key,i)=>[key,product()[i]]));
 wrong.aw_deep_link="https://www.awin1.com/pclick.php?p=36655657825&a=3135746&m=736";
 const result=prepareTooledUpRow(wrong);
 assert.equal(result.status,"excluded");
 assert.ok(result.reasons.includes("tracking_link_unverified"));
});
test("all merchant IDs must match and duplicates within a chunk are rejected",()=>{
 assert.equal(prepareTooledUpBatch(header,[product("234"),product("235")]).length,2);
 assert.throws(()=>prepareTooledUpBatch(header,[product("234"),product("234")]),/Duplicate/);
 assert.throws(()=>prepareTooledUpBatch(header,[product(),product().map((x,i)=>i===0?"736":x)]),/another advertiser/);
 assert.throws(()=>prepareTooledUpBatch(header,[]),/Batch size/);
});
test("private large importer requires owner, has source fingerprint and atomic chunk SQL",()=>{
 const route=readFileSync("app/api/control-centre/large-feed-import/route.ts","utf8");
 const sql=readFileSync("supabase/migrations/20261104171000_large_feed_private_import.sql","utf8");
 const ui=readFileSync("app/control-centre/large-feed-import/TooledUpLargeImport.tsx","utf8");
 assert.ok(route.indexOf("auth.getUser()")<route.indexOf('action==="start"'));
 assert.match(route,/joinedInSource\(source.metadata,"496"\)/);
 assert.match(route,/source_digest/);
 assert.match(route,/prepareTooledUpBatch/);
 assert.match(route,/append_tooled_up_large_feed_chunk/);
 assert.match(sql,/for update/);
 assert.match(sql,/p_digest/);
 assert.match(sql,/revoke all on function/);
 assert.match(sql,/status='private_review'/);
 assert.match(sql,/private_review/);
 assert.match(ui,/gzipCsvRows\(file\)/);
 assert.match(ui,/SHA-256/);
 assert.match(ui,/exact same compressed download/);
});
