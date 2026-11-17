import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const route=readFileSync("app/api/internal/awin-approved-refresh/route.ts","utf8");
const config=JSON.parse(readFileSync("vercel.json","utf8"));
test("one daily fixed live Awin refresh uses the existing pipeline",()=>{
 assert.deepEqual(config.crons.filter(x=>x.path==="/api/internal/awin-approved-refresh"),
  [{path:"/api/internal/awin-approved-refresh",schedule:"16 9 * * *"}]);
 assert.match(route,/runDealIntelligencePipeline\(admin,\{sourceKey:"awin",limit:25\}\)/);
 assert.match(route,/request\.headers\.get\("authorization"\)/);
 assert.match(route,/sourceIngestionFailures\(source/);
 assert.match(route,/evaluateSourceControls\(controls/);
 assert.match(route,/source\.status!=="active"\|\|source\.sync_enabled!==true/);
 assert.match(route,/no_import:true,no_publication:true/);
});
test("live Awin refresh cannot activate sources, approve rights or bypass first owner release",()=>{
 assert.doesNotMatch(route,/\.insert\(|\.upsert\(|\.update\(|\.delete\(|\.rpc\(/);
 assert.doesNotMatch(route,/published_deals|record_awin_owner_release|feed_import_records|fetch\(/);
 assert.match(route,/first_time_publication_requires_existing_owner_release:true/);
 const pipeline=readFileSync("lib/pipeline/run.ts","utf8");
 assert.match(pipeline,/sourceIngestionFailures\(source, rightsContext\)/);
 assert.match(pipeline,/Source was paused or permissions changed/);
 assert.match(pipeline,/canRenewApprovedAwinOffer/);
});
