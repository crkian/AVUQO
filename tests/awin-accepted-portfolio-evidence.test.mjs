import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {acceptedAwinPortfolio} from "../lib/awin/portfolio-evidence.ts";

const mk=(name,id)=>({
 programme_name:name,external_account_id:id,status:"pending",
 metadata:{joined_programme_observed:true,membership_evidence:"owner_authenticated_awin_screenshot",
  owner_joined_accepted_attestation:{membership_status:"accepted",attested_on:"2026-11-17"}}
});
const source={status:"paused",sync_enabled:false,
 metadata:{awin_advertisers:[{advertiser_id:"12715",joined_programme_observed:true}]}};
test("all accepted portfolio members remain accepted even when operational release is pending",()=>{
 const rows=acceptedAwinPortfolio([mk("Tyres UK","12715"),mk("Co-op",null)],[
  {advertiser_id:"12715",feed_id:"93988",listed_products:31020,
   observed_at:"2026-11-17T06:17:46Z",needs_private_refresh:true}
 ],source);
 assert.equal(rows.length,2);
 assert.equal(rows[1].programme,"Tyres UK");
 for(const row of rows){assert.equal(row.membership,"accepted");assert.equal(row.publicationReady,false);}
 assert.equal(rows[1].sourceRegistryLinked,true);
 assert.equal(rows[0].sourceRegistryLinked,false);
 assert.equal(rows[0].next,"Map exact advertiser ID");
 assert.equal(rows[1].listedProducts,31020);
 assert.equal(rows[1].releaseStatus,"pending");
});
test("membership evidence is not silently fabricated for old registry entries",()=>{
 const p=mk("Unconfirmed","99999");
 p.metadata.owner_joined_accepted_attestation={membership_status:"requested",attested_on:"2026-11-17"};
 assert.equal(acceptedAwinPortfolio([p],[],source)[0].membership,"requires_attestation");
});
test("existing owner-only screen reads canonical programme registry without a duplicate endpoint",()=>{
 const page=readFileSync("app/control-centre/awin-feed-updates/page.tsx","utf8");
 assert.ok(page.indexOf("requireControlCentreAccess()")<page.indexOf('admin.from("affiliate_programs")'));
 assert.match(page,/acceptedAwinPortfolio/);
 assert.match(page,/role==="owner"/);
 const sourceGate=readFileSync("lib/pipeline/source-readiness.ts","utf8");
 assert.match(sourceGate,/source\.status !== "active"/);
 assert.match(sourceGate,/rights_evidence_ref/);
 const publicGate=readFileSync("lib/products/public-catalog.ts","utf8");
 assert.match(publicGate,/awin_offer_release_reviews/);
 assert.match(publicGate,/offerFresh/);
 assert.doesNotMatch(page,/feed_permission_confirmed\s*=\s*true/);
});
