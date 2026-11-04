import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {identifyFormat,prepareGeneralBatch} from "../lib/feed-imports/general-awin-large.ts";
import {csvRowsFromChunks} from "../lib/feed-imports/stream-csv.ts";
const standard=["merchant_id","merchant_product_id","aw_product_id","product_name","search_price","currency","brand_name","aw_deep_link","stock_status"];
const google=["advertiser_id","id","title","price","availability","aw_deep_link","brand","image_link"];
test("detect only explicit, supported Awin and Google-retail source formats",()=>{
 assert.equal(identifyFormat(standard),"awin-csv");
 assert.equal(identifyFormat(google),"google-retail");
 assert.throws(()=>identifyFormat(["id","title","price","link","brand"]),/Unsupported/);
 assert.throws(()=>identifyFormat([...standard,"merchant_id"]),/Duplicate/);
});
test("generalised large importer preserves real IDs, source brand and private permission gates",()=>{
 const row=["12715","TYRE-101","AW123","Tyre 205/55 R16","75.25","GBP","Brand X",
 "https://www.awin1.com/pclick.php?p=AW123&a=3135746&m=12715","In Stock"];
 const records=prepareGeneralBatch("12715","93988",standard,[row]);
 assert.equal(records[0].merchant_id,"12715");
 assert.equal(records[0].price,"75.25");
 assert.equal(records[0].status,"review");
 assert.equal(records[0].metadata.feed_id,"93988");
 assert.equal(records[0].metadata.manufacturer_brand,"Brand X");
 assert.equal(records[0].metadata.source_image_rights_confirmed,false);
 assert.equal(records[0].metadata.permission_status,"unverified");
 assert.throws(()=>prepareGeneralBatch("15236","26513",standard,[row]),/Cross-advertiser/);
 assert.throws(()=>prepareGeneralBatch("12715","93988",standard,[row,row]),/Duplicate/);
});
test("Google retail mobile/service format parses GBP, excludes stale tracking and bad availability",()=>{
 const row=["31539","PHONE-77","Phone 256 GB","599.00 GBP","in_stock",
 "https://www.awin1.com/cread.php?awinmid=31539&awinaffid=3135746","Phone Brand",
 "https://example.com/phone.jpg"];
 const records=prepareGeneralBatch("31539","74135",google,[row]);
 assert.equal(records[0].price,"599.00");
 assert.equal(records[0].status,"review");
 assert.equal(records[0].metadata.source_format,"google-retail");
 const bad=prepareGeneralBatch("31539","74135",google,[[...row.slice(0,4),"out_of_stock",
 "https://www.awin1.com/cread.php?awinmid=31539&awinaffid=2222222",...row.slice(6)]]);
 assert.equal(bad[0].status,"excluded");
 assert.ok(bad[0].reasons.includes("tracking_link_unverified"));
 assert.ok(bad[0].reasons.includes("out_of_stock"));
});
test("CSV/TSV parser preserves quoted delimiters and multiline fields",async()=>{
 async function* src(){yield 'id\tname\n1\t"part\t';yield 'one"\n2\t"two\nlines"\n';}
 const rows=[];for await(const r of csvRowsFromChunks(src(),"\t"))rows.push(r);
 assert.deepEqual(rows,[["id","name"],["1","part\tone"],["2","two\nlines"]]);
});
test("generalised Awin import rejects cross-run access and unsupported schema",()=>{
 const route=readFileSync("app/api/control-centre/general-feed-import/route.ts","utf8");
 const sql=readFileSync("supabase/migrations/20261104195000_general_awin_resumable_import.sql","utf8");
 const view=readFileSync("app/control-centre/general-feed-import/page.tsx","utf8");
 assert.ok(route.indexOf("db.auth.getUser()")<route.indexOf("createAdminClient()"));
 assert.match(route,/joinedInSource\(source\.metadata,merchant\)/);
 assert.match(route,/GENAWIN__/);
 assert.match(route,/feed_id:feedId/);
 assert.match(route,/source_digest/);
 assert.match(sql,/for update/);
 assert.match(sql,/GENAWIN__/);
 assert.match(sql,/p_sequence/);
 assert.match(sql,/Duplicate merchant product IDs across batches/);
 assert.match(sql,/revoke all on function public\.append_general_awin_feed_chunk/);
 assert.match(sql,/grant execute on function public\.append_general_awin_feed_chunk.*to service_role/);
 assert.match(view,/requireControlCentreAccess\(\)/);
 assert.match(view,/robots:\{index:false,follow:false\}/);
});
