import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const route=readFileSync("app/api/control-centre/awin-first-release/route.ts","utf8");
const page=readFileSync("app/control-centre/awin-feed-updates/page.tsx","utf8");
const ui=readFileSync("app/control-centre/awin-feed-updates/OwnerAwinFirstRelease.tsx","utf8");
test("existing release endpoint now exposes owner-only current held offers without a second endpoint",()=>{
 assert.match(route,/export async function GET\(/);
 assert.match(route,/export async function POST\(/);
 assert.match(route,/role\?\.role!=="owner"/);
 assert.match(route,/source\.status!=="active"/);
 assert.match(route,/source\.sync_enabled!==true/);
 assert.match(route,/credential_status!=="ready"/);
 assert.match(route,/meta\.price_evidence_status!=="verified"/);
 assert.match(route,/\.from\("offers"\)/);
 assert.match(route,/\.from\("deal_scores"\)/);
 assert.match(route,/\.from\("published_deals"\)/);
 assert.match(route,/\.from\("awin_offer_release_reviews"\)/);
 assert.match(route,/ownAffiliateLink/);
 assert.match(route,/fresh\(o\.last_seen_at,now\)/);
 assert.match(route,/48\*3600_000/);
 assert.match(route,/status:"source_not_launch_ready"/);
 assert.doesNotMatch(route,/export async function GET\([\s\S]*?export async function POST\(/);
});
test("owner approval preserves authenticated exact-offer binding and atomic SQL verification",()=>{
 assert.match(route,/request\.headers\.get\("origin"\)/);
 assert.match(route,/owner-\$\{action\}-\$\{offerId\}/);
 assert.match(route,/sourceEvidenceFailures\(source/);
 assert.match(route,/record_awin_owner_release/);
 assert.match(route,/p_actor_id:user\.id/);
 assert.match(route,/p_reviewed_price:offer\.price/);
 assert.match(route,/p_reviewed_offer_at:offer\.last_seen_at/);
 assert.match(route,/p_reviewed_score_at:score\.calculated_at/);
 assert.doesNotMatch(route,/\.from\("offers"\)\.upsert/);
});
test("owner UI never auto-approves or silently activates sources",()=>{
 assert.match(page,/role==="owner"&&<OwnerAwinFirstRelease\/>/);
 assert.match(ui,/Approve exact offer for public release/);
 assert.match(ui,/owner-approve-/);
 assert.match(ui,/confirmId!==c\.offerId/);
 assert.match(ui,/I approve this exact currently displayed GBP offer/);
 assert.doesNotMatch(ui,/useEffect\(\(\)=>.*act\(/);
 assert.doesNotMatch(ui,/\.update\(|\.upsert\(|\.insert\(/);
});

test("owner readiness shows granted standing authorization without bypassing source evidence",()=>{
 assert.match(route,/ownerAuthorization:obj\(meta\.owner_publication_authorization\)\.status==="granted"/);
 assert.match(route,/credentialRegistry:source\.credential_status/);
 assert.match(route,/priceEvidence:meta\.price_evidence_status/);
 assert.match(ui,/Publication authorisation:/);
 assert.match(ui,/not yet fully automated/);
 assert.match(ui,/not a request for another owner approval/);
});

test("owner-first-release readiness inventories all accepted Awin programmes without publishing from feed metadata",()=>{
 assert.match(route,/async function readPortfolio\(/);
 assert.match(route,/awin_feed_update_observations/);
 assert.match(route,/owner_joined_accepted_attestation/);
 assert.match(route,/feed_or_category_adapter_pending/);
 assert.match(route,/advertiser_id_missing/);
 assert.match(route,/large_feed_streaming/);
 assert.match(route,/tyre_specific/);
 assert.match(route,/portfolio,acceptance:/);
 assert.match(ui,/Accepted Awin portfolio and feed automation coverage/);
 assert.match(ui,/queue\.portfolio\.programmes\.map/);
 assert.match(ui,/A feed listing is not a current public offer/);
});
