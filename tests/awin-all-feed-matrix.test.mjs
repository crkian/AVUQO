import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {joinedAwinAdvertisers} from "../lib/awin/joined-catalogue.ts";
import {classifyFeedFormat,buildAwinFeedMatrix,redactedFeedMatrixCsv} from "../lib/awin/feed-matrix.ts";
const feeds=[
 {advertiserId:"496",advertiserName:"Tooled Up",feedId:"89987",feedName:"All Products",format:"Awin CSV",products:84284,lastImported:"2026-11-04"},
 {advertiserId:"496",advertiserName:"Tooled Up",feedId:"55555",feedName:"Power Tools",format:"Google Enhanced",products:900,lastImported:"2026-11-04"},
 {advertiserId:"31539",advertiserName:"Mozillion",feedId:"74135",feedName:"SIM free phones",format:"unknown xml feed",products:224,lastImported:"2026-11-03"}
];
test("all accepted advertiser programmes are represented even without available feeds",()=>{
 const m=buildAwinFeedMatrix(feeds);
 assert.equal(joinedAwinAdvertisers.length,16);
 assert.equal(m.groups.length,16);
 assert.equal(m.programmesWithFeeds,2);
 assert.equal(m.feedsCount,3);
 assert.ok(m.groups.some(g=>g.count===0));
 assert.deepEqual(m.formatCounts,{standard:1,enhanced:1,other:1});
});
test("distinct retailer feeds are never combined into invented unique product counts",()=>{
 const m=buildAwinFeedMatrix(feeds);
 const tooled=m.groups.find(g=>g.id==="496");
 assert.equal(tooled?.count,2);
 assert.equal(tooled?.fullRangeCandidates.length,1);
 assert.deepEqual(tooled?.types,["Google / enhanced","Standard / legacy"]);
 assert.equal(classifyFeedFormat("unknown XML"),"Other / inspect");
});
test("export contains only safe feed fields, without URL or signed key columns",()=>{
 const csv=redactedFeedMatrixCsv([...feeds,{...feeds[0],feedName:'=HYPERLINK("https://evil")',feedId:"123"}]);
 assert.match(csv,/Feed format/);
 assert.match(csv,/AWIN|Awin/);
 assert.doesNotMatch(csv,/download_url|signed_url|datafeed\/list\/apikey|API Key|URL"/i);
 assert.match(csv,/'=HYPERLINK/);
 assert.equal(csv.split("\r\n").length,5);
});
test("live Control Centre uses existing owner-only server route and formats safely",()=>{
 const page=readFileSync("app/control-centre/feed-list-audit/page.tsx","utf8");
 const form=readFileSync("app/control-centre/feed-list-audit/FeedAuditForm.tsx","utf8");
 const route=readFileSync("app/api/control-centre/feed-list-audit/route.ts","utf8");
 assert.match(page,/requireControlCentreAccess\(\)/);
 assert.match(page,/robots:\{index:false,follow:false\}/);
 assert.match(route,/getUser\(\)/);
 assert.match(form,/All 16 accepted programmes/);
 assert.match(form,/Copy filtered redacted feed CSV/);
 assert.match(form,/buildAwinFeedMatrix/);
 assert.match(form,/No active feed in supplied inventory/);
 assert.doesNotMatch(form,/downloadUrl|signedUrl|api_key/);
});
