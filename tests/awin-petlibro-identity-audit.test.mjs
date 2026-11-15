import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {auditPetlibroStagedIdentities} from "../lib/awin/petlibro-identity-audit.ts";

const row=(id,overrides={})=>({
 merchant_product_id:id,title:"Petlibro Polar Wet Food Feeder",
 brand:"Petlibro",price:"139.99",currency:"GBP",
 status:"review",review_decision:"pending",image_url:"https://merchant.example/image.jpg",
 metadata:{gtin:"0880000001234",model:null,availability:"in_stock",
  tracking_link_verified:true,source_image_rights_confirmed:false,
  source_updated_at:null},
 ...overrides,
});
const pair=(sku)=>[row(sku+"_feed"),row(sku+"_health")];
const code=(p)=>readFileSync(p,"utf8");

test("Petlibro feed and health suffixes are one private product identity, not two products",()=>{
 const data=[...pair("PL-AF109-21B"),...pair("PL-AF203-24B")];
 const report=auditPetlibroStagedIdentities(data);
 assert.equal(report.sourceRows,4);
 assert.equal(report.distinctIdentityGroups,2);
 assert.equal(report.matchingPairs,2);
 assert.equal(report.groupsNeedingAttention,0);
 assert.equal(report.candidates.every(x=>x.rows===2&&x.issues.length===0),true);
 assert.equal(report.candidates.every(x=>x.needsReview),true);
 assert.equal(report.priceTimestampEvidenceRows,0);
 assert.equal(report.imageRightsConfirmedRows,0);
});
test("different price, title, GTIN and currency make a pair ineligible for automatic identity acceptance",()=>{
 const [a,b]=pair("PL-AF109-21B");
 const altered={...b,price:"149.99",title:"Different model",currency:"USD",
  metadata:{...b.metadata,gtin:"0880000005555"}};
 const result=auditPetlibroStagedIdentities([a,altered]);
 assert.equal(result.matchingPairs,0);
 assert.equal(result.groupsNeedingAttention,1);
 assert.ok(result.candidates[0].issues.includes("missing_or_conflicting_price"));
 assert.ok(result.candidates[0].issues.includes("conflicting_title"));
 assert.ok(result.candidates[0].issues.includes("missing_or_conflicting_gtin"));
 assert.ok(result.candidates[0].issues.includes("currency_not_gbp"));
});
test("missing companion or repeated suffix never becomes a matched pair",()=>{
 const report=auditPetlibroStagedIdentities([
  row("PL-ABC_feed"),row("PL-ABC_feed"),
  row("PL-XYZ_feed"),row("PL-QRS"),
 ]);
 assert.equal(report.matchingPairs,0);
 assert.equal(report.groupsNeedingAttention,3);
 assert.ok(report.candidates.every(x=>x.issues.includes("unverified_pairing")));
});
test("requires tracked, privately reviewable GBP rows, while a missing optional model field remains reviewable",()=>{
 const [a,b]=pair("PL-ABC");
 let report=auditPetlibroStagedIdentities([a,b]);
 assert.equal(report.matchingPairs,1);
 report=auditPetlibroStagedIdentities([a,{...b,status:"excluded",metadata:{...b.metadata,tracking_link_verified:false}}]);
 assert.equal(report.matchingPairs,0);
 assert.ok(report.candidates[0].issues.includes("tracking_link_not_verified"));
 assert.ok(report.candidates[0].issues.includes("row_not_eligible_for_private_review"));
});
test("truncation is reported, never silently represented as complete readiness",()=>{
 const result=auditPetlibroStagedIdentities(pair("PL-AF109-21B"),true);
 assert.equal(result.incomplete,true);
});
test("owner-only pilot reads just the latest exact Petlibro snapshot after access verification and does not publish",()=>{
 const page=code("app/control-centre/awin-pilot/page.tsx");
 assert.ok(page.indexOf("await requireControlCentreAccess()")<page.indexOf('db.from("feed_import_records")'));
 assert.match(page,/\.eq\("import_id",run\.id\)/);
 assert.match(page,/\.eq\("merchant_id","77952"\)/);
 assert.match(page,/\.like\("filename","GENAWIN__103580__AUTO__%"\)/);
 assert.match(page,/\.limit\(501\)/);
 assert.match(page,/auditPetlibroStagedIdentities/);
 assert.match(page,/not live offers/);
 const helper=code("lib/awin/petlibro-identity-audit.ts");
 assert.doesNotMatch(helper,/createAdminClient|from\("offers"\)|\.upsert\(|\.insert\(|\.update\(/);
});
