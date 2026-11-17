import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const route=readFileSync("app/api/control-centre/awin-first-release/route.ts","utf8");
const queue=readFileSync("app/control-centre/awin-feed-updates/OwnerAwinReleaseQueue.tsx","utf8");
const client=readFileSync("app/control-centre/awin-feed-updates/OwnerAwinReleaseButton.tsx","utf8");
const page=readFileSync("app/control-centre/awin-feed-updates/page.tsx","utf8");

test("owner-only first release binds actor and exact offer with same-origin confirmation",()=>{
 assert.match(route,/session\.auth\.getUser\(\)/);
 assert.match(route,/role\?\.role!=="owner"/);
 assert.match(route,/Same origin required/);
 assert.match(route,/owner-\$\{action\}-\$\{offerId\}/);
 assert.match(route,/p_actor_id:user\.id/);
 assert.match(route,/\.rpc\("record_awin_owner_release"/);
 assert.match(client,/window\.confirm/);
 assert.match(client,/owner-"\+action\+"-"\+offerId/);
});
test("approvals require fresh stock, GBP, score, identity and unchanged source rights",()=>{
 for(const text of [
  'sourceEvidenceFailures(source',{value:'meta.publication_permission!=="verified"'},
  'meta.price_evidence_status!=="verified"','offer.currency==="GBP"',
  'fresh(offer.last_seen_at,now)','fresh(score.calculated_at,now)',
  '"in_stock","low_stock"','ownAffiliateLink(offer.affiliate_url,advertiserId)',
  'accepted','offer.match_confidence','published?.status==="held"',
  'p_reviewed_price:offer.price','p_reviewed_offer_at:offer.last_seen_at',
  'p_reviewed_score_at:score.calculated_at'
 ]){
  const expected=typeof text==="string"?text:text.value;
  assert.ok(route.includes(expected),expected);
 }
 assert.doesNotMatch(route,/\.from\("sources"\)\.update\(/);
 assert.doesNotMatch(route,/\.from\("offers"\)\.insert\(/);
 assert.doesNotMatch(route,/Date\(\)\.toISOString\(\)/);
});
test("the existing owner page shows honest release readiness and cannot approve old private feed rows",()=>{
 assert.match(page,/role==="owner"&&<OwnerAwinReleaseQueue\/>/);
 assert.match(queue,/\.from\("offers"\)/);
 assert.match(queue,/\.from\("deal_scores"\)/);
 assert.match(queue,/\.from\("published_deals"\)/);
 assert.match(queue,/\.from\("affiliate_programs"\)/);
 assert.match(queue,/Historical private feed rows are not public offers/);
 assert.match(queue,/disabled=\{!canAttempt\}/);
 assert.doesNotMatch(queue,/feed_import_records|source_ingestion_items|feed_import_runs/);
});
