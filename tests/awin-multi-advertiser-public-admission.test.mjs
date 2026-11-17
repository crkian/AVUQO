import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {ownAffiliateLink} from "../lib/awin/approved-offer-renewal.ts";
const publicPage=readFileSync("lib/products/public-catalog.ts","utf8");

test("Awin customer-facing admission binds each offer to its own merchant and accepted programme",()=>{
 assert.match(publicPage,/SELECT_OFFER=.*merchant_id/);
 assert.match(publicPage,/\.from\("merchants"\)\.select\("id,metadata"\)/);
 assert.match(publicPage,/\.from\("affiliate_programs"\)\.select\("external_account_id,region,metadata"\)/);
 assert.match(publicPage,/owner_joined_accepted_attestation/);
 assert.match(publicPage,/acceptedAdvertisers\.has\(advertiserId\)/);
 assert.match(publicPage,/merchantAdvertisers\.get\(offer\.merchant_id\)/);
 assert.match(publicPage,/sourceReady\(source as Record<string,unknown>,advertiserId\?\?undefined\)/);
 assert.match(publicPage,/approval\.advertiser_id!==advertiserId/);
 assert.doesNotMatch(publicPage,/approval\.advertiser_id!==process\.env\.AWIN_ADVERTISER_ID/);
});
test("merchant-bound Awin click URL does not accept wrong advertisers or publisher",()=>{
 const ok="https://www.awin1.com/pclick.php?m=12715&a=3135746&p=some-product";
 assert.equal(ownAffiliateLink(ok,"12715"),true);
 assert.equal(ownAffiliateLink(ok,"496"),false);
 assert.equal(ownAffiliateLink(ok.replace("a=3135746","a=1234"),"12715"),false);
 assert.equal(ownAffiliateLink(ok.replace("www.awin1.com","unsafe.example"),"12715"),false);
 assert.equal(ownAffiliateLink("https://www.awin1.com/cread.php?awinmid=12715&awinaffid=3135746","12715"),true);
});
test("accepted membership never replaces explicit source rights, score, price freshness or first release",()=>{
 assert.match(publicPage,/sourceEvidenceFailures/);
 assert.match(publicPage,/publication_permission!=="verified"/);
 assert.match(publicPage,/price_evidence_status!=="verified"/);
 assert.match(publicPage,/awin_offer_release_reviews/);
 assert.match(publicPage,/approval\.status!=="approved"/);
 assert.match(publicPage,/Number\(approval\.reviewed_price\)!==Number\(offer\.price\)/);
 assert.match(publicPage,/48\*3600_000/);
 assert.match(publicPage,/ownAffiliateLink\(offer\.affiliate_url,advertiserId!\)/);
});
