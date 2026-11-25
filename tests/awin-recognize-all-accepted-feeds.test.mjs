import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {recognizeAwinFeed} from "../lib/awin/feed-recognition.ts";
const api=readFileSync("app/api/control-centre/awin-first-release/route.ts","utf8");
const ui=readFileSync("app/control-centre/awin-feed-updates/OwnerAwinFirstRelease.tsx","utf8");
const input=(advertiserId,feedId,feedFormat="Awin",feedName="Default")=>
 ({advertiserId,feedId,feedFormat,feedName,listedProducts:10});
test("every accepted feed is inventoried even without a known product schema",()=>{
 const unknown=recognizeAwinFeed(input("101445","999998"));
 assert.equal(unknown.kind,"format_review");
 assert.equal(unknown.schemaStatus,"needs_schema_probe");
 assert.match(api,/const acceptedIds=new Set/);
 assert.match(api,/recognizedFeeds=\(feeds\?\?\[\]\)\.filter/);
 assert.match(api,/feeds:recognizedFeeds/);
 assert.match(ui,/Feed-by-feed recognition/);
 assert.match(ui,/queue\.portfolio\.feeds\.map/);
 assert.match(ui,/Unknown formats remain recognised and private/);
});
test("advanced tyres, service contracts, Tooled Up and known product adapters remain separate",()=>{
 assert.equal(recognizeAwinFeed(input("12715","93988")).kind,"specialist_tyres");
 assert.equal(recognizeAwinFeed(input("15236","26513")).kind,"specialist_tyres");
 assert.equal(recognizeAwinFeed(input("31539","97090","Awin","Pay Monthly Contract Phones")).kind,"contract_or_service");
 assert.equal(recognizeAwinFeed(input("31539","74135","Awin","SIM Free Phones")).kind,"retail_physical");
 assert.equal(recognizeAwinFeed(input("118401","109311")).kind,"contract_or_service");
 assert.equal(recognizeAwinFeed(input("496","89987")).kind,"large_retail");
 assert.equal(recognizeAwinFeed(input("77952","109051")).kind,"retail_physical");
 assert.equal(recognizeAwinFeed(input("77952","109051")).schemaStatus,"needs_schema_probe");
});
test("recognition does not alter source controls or publish prices",()=>{
 const src=readFileSync("lib/awin/feed-recognition.ts","utf8");
 assert.doesNotMatch(src,/createAdminClient|\.update\(|\.rpc\(|fetch\(|published_deals|permission_status\s*=/);
 assert.match(src,/NEVER commercial permissions/);
});

test("specialist contract feeds are inspected without generic retail staging",()=>{
 const probe=readFileSync("app/api/internal/awin-feed-schema-probe/route.ts","utf8");
 assert.match(probe,/\["specialist_tyres","large_retail"\]\.includes\(route.kind\)/);
 assert.match(probe,/route.kind==="contract_or_service"\?"specialist_adapter":profile.status/);
 assert.match(probe,/7\*86400000/);
 assert.doesNotMatch(probe,/\.from\("offers"\)|\.from\("feed_import_records"\)/);
 assert.equal(recognizeAwinFeed(input("45747","109997")).kind,"retail_physical");
});

import {specialistEvidence} from "../lib/awin/specialist-evidence.mjs";
test("specialist rows are exact-bound, aggregate only and never declared quote ready",()=>{
 const h=["merchant_id","data_feed_id","merchant_product_id","product_name","search_price","currency","aw_deep_link","terms_of_contract"];
 const r=["37738","81201","SIM-1","Synthetic plan","10.00","GBP","https://www.awin1.com/pclick.php?m=37738&a=3135746&p=123","12 months"];
 assert.deepEqual(specialistEvidence("37738","81201",h,[r]),{rows:1,explicit_gbp:1,source_price:1,contract_terms_present:1,own_publisher_links:1,public_quote_ready:0});
 assert.throws(()=>specialistEvidence("37738","81201",h,[r,r]),/identity_mismatch/);
 assert.throws(()=>specialistEvidence("37738","81201",h,[[...r.slice(0,1),"99999",...r.slice(2)]]),/identity_mismatch/);
});

import {specialistAccumulator} from "../lib/awin/specialist-evidence.mjs";
test("large specialist inspection accumulates rows without retaining raw records and rejects overflow",()=>{
 const h=["merchant_id","merchant_product_id","product_name","search_price","aw_deep_link"];
 const s=specialistAccumulator("31539","97090",h,2);
 s.add(["31539","A","Synthetic contract","10",""]);s.add(["31539","B","Synthetic contract","20",""]);
 assert.equal(s.result().rows,2);assert.equal(s.result().public_quote_ready,0);
 assert.throws(()=>s.add(["31539","C","Synthetic contract","30",""]),/bounded_probe_size_limit/);
 const worker=readFileSync("app/api/internal/awin-feed-schema-probe/route.ts","utf8");
 assert.match(worker,/selected.advertiser_id==="31539"&&selected.feed_id==="97090"/);
 assert.match(worker,/total>96_000_000/);assert.match(worker,/reader.cancel/);
});

test("department catalogue filters before paging and rechecks admitted classification",()=>{
 const reader=readFileSync("lib/products/shopping-catalogue.ts","utf8");
 const shelf=readFileSync("app/shop/retail/page.tsx","utf8");
 const migration=readFileSync("docs/sql/2026-11-25-department-catalogue.sql","utf8");
 assert.match(reader,/shopping_catalogue_department_page_ids/);assert.match(reader,/item.department===department/);
 assert.match(shelf,/department:data.department/);assert.match(shelf,/name="department"/);
 assert.ok(migration.indexOf("=p_department")<migration.indexOf("order by case"));
 assert.match(migration,/FROM PUBLIC, anon, authenticated/);
});

test("Tooled Up immediate canonical conversion stays bound to each exact import",()=>{
 const s=readFileSync("app/api/internal/awin-tooled-up-live-cohort/route.ts","utf8");
 assert.match(s,/importGroups.get\(old.import_id\)/);
 assert.match(s,/for\(const \[importId,merchantProductIds\] of importGroups\)/);
 assert.match(s,/limit:merchantProductIds.length,merchantProductIds/);
 assert.match(s,/if\(updated>=20\)break/);
 assert.doesNotMatch(s,/importId=old.import_id/);
});

test("owner portfolio deduplicates observed feeds and shows bounded specialist evidence without quotes",()=>{
 assert.match(api,/order\("observed_at",\{ascending:false\}\).limit\(1000\)/);
 assert.match(api,/seen.has\(key\)/);assert.match(api,/readSpecialistSummary/);
 assert.match(api,/quoteReady:0/);assert.match(ui,/Private source evidence \(not live quotes\)/);
});
