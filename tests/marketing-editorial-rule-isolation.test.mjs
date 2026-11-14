import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {editorialRulePreflight} from "../lib/marketing/editorial-rule-preflight.ts";

const now=new Date("2026-11-14T09:00:00.000Z");
const rule={brand_slug:"avuqo",platform:"facebook",cadence_days:3,
 next_run_at:"2026-11-14T08:59:59.000Z",created_by:"owner-id"};

test("a due approved-channel rule has a bounded, deterministic next run",()=>{
 assert.equal(editorialRulePreflight(rule,now),"2026-11-17T09:00:00.000Z");
 assert.equal(editorialRulePreflight({...rule,brand_slug:"cluedoku",platform:"instagram",cadence_days:14},now),
  "2026-11-28T09:00:00.000Z");
});
test("malformed rules fail before claim and cannot block another healthy rule",()=>{
 const bad=[
  {...rule,cadence_days:1},{...rule,cadence_days:15},
  {...rule,cadence_days:NaN},{...rule,brand_slug:"unknown"},
  {...rule,platform:"website"},{...rule,platform:"tiktok"},
  {...rule,created_by:null},{...rule,next_run_at:"invalid"},
  {...rule,next_run_at:"2026-11-14T09:00:01.000Z"}
 ];
 for(const row of bad)assert.throws(()=>editorialRulePreflight(row,now));
 assert.equal(editorialRulePreflight(rule,now),"2026-11-17T09:00:00.000Z");
});
test("worker validates each rule inside individual try, never schedules or publishes content",()=>{
 const src=readFileSync(new URL("../lib/marketing/editorial-automation.ts",import.meta.url),"utf8");
 const start=src.indexOf("for(const rule of rules??[])");
 const preflight=src.indexOf("editorialRulePreflight(rule,now)",start);
 const tryAt=src.indexOf("try {",start);
 assert.ok(start>=0&&tryAt>start&&preflight>tryAt);
 assert.match(src,/claimedNext\?\?rule\.next_run_at/);
 assert.match(src,/\.eq\("next_run_at",rule\.next_run_at\)\.select\("id"\)/);
 assert.match(src,/status:"draft"/);
 assert.doesNotMatch(src,/scheduleBufferPost|runMarketingWorker|status:"approved"|status:"published"/);
});
