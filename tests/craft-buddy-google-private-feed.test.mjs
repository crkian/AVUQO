import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {prepareGeneralBatch} from "../lib/feed-imports/general-awin-large.ts";
const normalizer=readFileSync("lib/awin/pilot-feed-normalizer.ts","utf8");
const worker=readFileSync("app/api/internal/awin-auto-import/route.ts","utf8");
const schedule=readFileSync("app/api/internal/awin-pilot-schedule/[pilot]/route.ts","utf8");
const config=JSON.parse(readFileSync("vercel.json","utf8"));
const required=["advertiser_id","id","title","price","availability","aw_deep_link"];
const extras=Array.from({length:125},(_,i)=>"extra_"+i);
const header=[...required,"brand","image_link",...extras];
const link="https://www.awin1.com/pclick.php?m=45747&a=3135746&p=100";
const row=["45747","CB123","Crystal Art Craft Kit","7.99 GBP","in stock",link,"Craft Buddy","https://assets.example.com/a.png",...extras.map(()=>"")];
test("bounded Google schema requires exact columns and uses explicit GBP",()=>{
 for(const marker of [
  'advertiser==="45747"&&feedId==="F1356"',
  'header.length>256',
  'new Set(header).size!==header.length',
  '"advertiser_id","id","title","price","availability","aw_deep_link"',
  'row[merchantCol]?.trim()!=="45747"',
  'currencySource:"feed_column"',
  'identifyFormat(projected)'
 ])assert.ok(normalizer.includes(marker),marker);
 const x=prepareGeneralBatch("45747","F1356",required,[
  ["45747","CB123","Crystal Art Craft Kit","7.99 GBP","in stock",link]
 ])[0];
 assert.equal(x.status,"review");assert.equal(x.currency,"GBP");
 assert.equal(x.metadata.tracking_link_verified,true);
 assert.equal(x.metadata.source_image_rights_confirmed,false);
 assert.equal(x.metadata.permission_status,"unverified");
});
test("rejects cross advertiser rows and non-GBP prices without rights inference",()=>{
 const wrong=prepareGeneralBatch("45747","F1356",required,[
  ["45747","CB123","Crystal Art Craft Kit","7.99 USD","in stock",link]
  ])[0];
 assert.equal(wrong.status,"excluded");
 assert.throws(()=>prepareGeneralBatch("45747","F1356",required,[
  ["45748","CB123","Crystal Art Craft Kit","7.99 GBP","in stock",link]
 ]));
 assert.ok(normalizer.includes("invalid_craft_buddy_google_required_columns"));
 assert.ok(normalizer.includes("craft_buddy_google_advertiser_mismatch"));
});
test("only exact private Google feed scheduled with global stop and no offer writes",()=>{
 assert.match(worker,/"45747:F1356"/);
 assert.match(worker,/privateStagingAllowed/);
 assert.match(worker,/source\.status!=="paused"/);
 assert.match(worker,/duplicate_identity_across_batches/);
 assert.match(schedule,/craftbuddy:\["45747","F1356"\]/);
 assert.deepEqual(config.crons.filter(c=>c.path==="/api/internal/awin-pilot-schedule/craftbuddy"),[{path:"/api/internal/awin-pilot-schedule/craftbuddy",schedule:"17 7 * * *"}]);
 assert.doesNotMatch(schedule,/\.upsert\(|\.insert\(|\.update\(/);
});