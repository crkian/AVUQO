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
});
test("recognition does not alter source controls or publish prices",()=>{
 const src=readFileSync("lib/awin/feed-recognition.ts","utf8");
 assert.doesNotMatch(src,/createAdminClient|\.update\(|\.rpc\(|fetch\(|published_deals|permission_status\s*=/);
 assert.match(src,/NEVER commercial permissions/);
});
