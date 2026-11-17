import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const src=readFileSync("lib/awin/auto-first-publication.ts","utf8");
const refresh=readFileSync("app/api/internal/awin-approved-refresh/route.ts","utf8");
const bridge=readFileSync("app/api/internal/awin-fresh-private-canonical-bridge/route.ts","utf8");
const release=readFileSync("app/api/control-centre/awin-first-release/route.ts","utf8");

test("standing owner authorization, programme and live source rights are mandatory for automation",()=>{
 assert.match(src,/owner_publication_authorization/);
 assert.match(src,/grant\.status!=="granted"/);
 assert.match(src,/grant\.automation_requested!==true/);
 assert.match(src,/source\.status!=="active"/);
 assert.match(src,/source\.sync_enabled!==true/);
 assert.match(src,/source\.credential_status!=="ready"/);
 assert.match(src,/sourceMeta\.publication_permission!=="verified"/);
 assert.match(src,/sourceMeta\.price_evidence_status!=="verified"/);
 assert.match(src,/sourceEvidenceFailures\(source/);
 assert.match(src,/owner_joined_accepted_attestation/);
 assert.match(src,/membership_status==="accepted"/);
 assert.match(src,/unique_owner_unavailable/);
});

test("first public release requires current own-publisher GBP offer, exact held price and scored canonical match",()=>{
 for(const pattern of [/\.eq\("currency","GBP"\)/,
 /recent\(offer\.last_seen_at,now\)/,
 /recent\(score\.calculated_at,now\)/,
 /ownAffiliateLink\(offer\.affiliate_url,advertiser\)/,
 /exactConfidence\(offer\.match_confidence\)/,
 /deal\.status!=="held"/,
 /deal\.product_id!==offer\.product_id/,
 /Number\(deal\.current_price\)!==Number\(offer\.price\)/,
 /Number\(score\.score\)<60/,
 /Number\(score\.confidence\)<55/,
 /evaluateSourceControls\(controls,!!controlError\)/])
  assert.match(src,pattern);
});

test("scheduled multi-merchant and approved refresh routes reuse only atomic owner-release RPC",()=>{
 assert.match(src,/db\.rpc\("record_awin_owner_release"/);
 assert.match(src,/p_review_note:"Automatic first publication under recorded AVUQO owner grant"/);
 assert.match(src,/p_reviewed_price:offer\.price/);
 assert.match(src,/p_reviewed_offer_at:offer\.last_seen_at/);
 assert.match(src,/p_reviewed_score_at:score\.calculated_at/);
 assert.match(refresh,/autoReleaseEligibleAwinOffers\(admin,15\)/);
 assert.match(bridge,/autoReleaseEligibleAwinOffers\(db,15\)/);
 assert.match(release,/record_awin_owner_release/);
 assert.doesNotMatch(src,/\.from\("published_deals"\)\.update\(/);
 assert.doesNotMatch(src,/\.from\("sources"\)\.update\(/);
 assert.doesNotMatch(src,/\.from\("affiliate_programs"\)\.update\(/);
});

test("batch is bounded and approved offers never starve pending first releases",()=>{
 assert.match(src,/Math\.min\(Math\.max\(limit,1\),15\)/);
 assert.match(src,/if\(reviewed\.has\(offer\.id\)\)continue/);
 assert.match(src,/if\(error\)failed\+\+;else released\+\+/);
});
