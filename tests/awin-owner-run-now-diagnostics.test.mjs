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

test("all accepted Awin feed discovery is owner-only and metadata-only; tyre pipeline remains specialised",()=>{
 assert.match(route,/const isInventory=task==="all_feeds_check"/);
 assert.match(route,/GET as discoverFeeds/);
 assert.match(route,/return sanitized\(discoverFeeds\(/);
 assert.match(route,/metadata_only/);
 assert.match(route,/joined_feeds/);
 assert.match(route,/changed_feeds/);
 assert.match(ui,/Check all accepted feeds now/);
 assert.match(ui,/task!=="all_feeds_check"/);
 assert.match(ui,/control-centre\/tyres/);
 assert.match(ui,/control-centre\/tyre-spec-enrichment/);
 assert.match(ui,/fitment, delivery and fitted pricing/);
});
