import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {normalizePilotAwinFeed} from "../lib/awin/pilot-feed-normalizer.ts";
import {prepareGeneralBatch} from "../lib/feed-imports/general-awin-large.ts";
const worker=readFileSync("app/api/internal/awin-auto-import/route.ts","utf8");
const schedule=readFileSync("app/api/internal/awin-pilot-schedule/[pilot]/route.ts","utf8");
const config=JSON.parse(readFileSync("vercel.json","utf8"));
const required=["advertiser_id","id","title","price","availability","aw_deep_link"];
const extras=Array.from({length:125},(_,i)=>"extra_"+i);
const header=[...required,"brand","image_link",...extras];
const link="https://www.awin1.com/pclick.php?m=45747&a=3135746&p=100";
const row=["45747","CB123","Crystal Art Craft Kit","7.99 GBP","in stock",link,"Craft Buddy","https://assets.example.com/a.png",...extras.map(()=>"")];
test("bounded Google raw header preserves tracked merchant identity and explicit GBP",()=>{
 const n=normalizePilotAwinFeed("45747","F1356",header,[row]);
 assert.deepEqual(n.header.slice(0,6),required);
 assert.equal(n.currencySource,"feed_column");
 const x=prepareGeneralBatch("45747","F1356",n.header,n.rows)[0];
 assert.equal(x.status,"review");assert.equal(x.currency,"GBP");
 assert.equal(x.metadata.tracking_link_verified,true);
 assert.equal(x.metadata.source_image_rights_confirmed,false);
 assert.equal(x.metadata.permission_status,"unverified");
});
test("rejects unknown merchant, duplicate headers and unsupported feed",()=>{
 assert.throws(()=>normalizePilotAwinFeed("45747","F1356",header,[[...row.slice(0,1),"123",...row.slice(2)].map((x,i)=>i===0?"45748":x)]));
 assert.throws(()=>normalizePilotAwinFeed("45747","F1356",[...header,"title"],[[...row,"X"]]));
 assert.throws(()=>normalizePilotAwinFeed("45747","109997",header,[row]));
 const n=normalizePilotAwinFeed("45747","F1356",header,[[...row.slice(0,3),"7.99 USD",...row.slice(4)]]);
 assert.equal(prepareGeneralBatch("45747","F1356",n.header,n.rows)[0].status,"excluded");
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