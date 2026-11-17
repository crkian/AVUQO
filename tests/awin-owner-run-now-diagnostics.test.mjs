import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const route=readFileSync("app/api/control-centre/awin-run-now/route.ts","utf8");
const ui=readFileSync("app/control-centre/awin-feed-updates/OwnerAwinRunNow.tsx","utf8");
test("owner only gets fixed canonical and live recheck counts from private staging",()=>{
 assert.match(route,/db\.auth\.getUser\(\)/);
 assert.match(route,/role\?\.role!=="owner"/);
 assert.match(route,/new URL\(origin\)\.origin!==new URL\(request\.url\)\.origin/);
 assert.match(route,/live_verified_rows/);
 assert.match(route,/const canonical=src\.canonical/);
 assert.match(route,/safeCanonicalStatus/);
 assert.match(route,/canonical_accepted/);
 assert.match(route,/canonical_rejected/);
 assert.match(route,/Number\.isSafeInteger\(value\)/);
 assert.doesNotMatch(route,/safe\.verified_awin_deep_link|safe\.feed_url|safe\.access_token/);
});
test("owner panel shows fresh rows and canonical acceptance rather than only total imported records",()=>{
 assert.match(ui,/fresh verified/);
 assert.match(ui,/held candidates/);
 assert.match(ui,/canonical_status/);
 assert.match(ui,/canonical_rejected/);
 assert.match(ui,/credentials:"same-origin"/);
});
