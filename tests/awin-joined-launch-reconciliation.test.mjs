import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {reconcileJoinedAwin} from "../lib/awin/joined-launch-reconciliation.ts";
import {joinedAwinAdvertisers} from "../lib/awin/joined-catalogue.ts";
const source=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const joined=joinedAwinAdvertisers.map(([advertiser_id,advertiser_name])=>({
 advertiser_id,advertiser_name,joined_programme_observed:true,
 feed_permission_confirmed:false,approval_evidence_ref:"",valid_until:""
}));
const programmes=joined.map(x=>({external_account_id:x.advertiser_id,
 programme_name:x.advertiser_name,status:"pending",terms_checked_at:null}));
test("historic 16 joined Awin accounts stay visible but NOT misrepresented as approved for publication",()=>{
 const rows=reconcileJoinedAwin({awin_advertisers:joined},programmes,[],Date.parse("2026-11-17T12:00:00Z"));
 assert.equal(rows.length,16);
 assert.equal(rows.filter(x=>x.joinedObserved).length,16);
 assert.equal(rows.filter(x=>x.needsEvidence.length===0).length,0);
 assert.ok(rows.every(x=>x.internalStatus==="pending"));
 assert.ok(rows.every(x=>x.needsEvidence.includes("Feed/price-data use permission not yet recorded")));
 assert.ok(rows.every(x=>x.needsEvidence.includes("Internal affiliate programme release is not approved")));
});
test("source rights and programme approval are distinct and do not guess from a joined status",()=>{
 const rows=reconcileJoinedAwin({awin_advertisers:[
  {...joined[0],feed_permission_confirmed:true,
   approval_evidence_ref:"approved-document-2026",valid_until:"2027-12-31"}
 ]},[{...programmes[0],status:"approved",terms_checked_at:"2026-11-15"}],
 [{merchant_id:"736",merchant_name:"Cadbury Gifts Direct",status:"private_review",
   permission_status:"unverified",total_count:2738}],Date.parse("2026-11-17T12:00:00Z"));
 assert.equal(rows[0].joinedObserved,true);
 assert.equal(rows[0].internalStatus,"approved");
 assert.equal(rows[0].feedRightsRecorded,true);
 assert.equal(rows[0].historicalImportRows,2738);
 assert.equal(rows[0].privateImportRuns,1);
 assert.ok(rows[0].needsEvidence.includes("Private import permissions remain unverified"));
 assert.equal(rows[0].needsEvidence.length,1);
 assert.equal(rows[1].joinedObserved,false);
 assert.ok(rows[1].needsEvidence.length>0);
});
test("the existing owner-only Control Centre surfaces exact blockers without activating anything",()=>{
 const page=source("app/control-centre/awin-programmes/page.tsx");
 assert.match(page,/await requireControlCentreAccess\(\)/);
 assert.match(page,/reconcileJoinedAwin/);
 assert.match(page,/affiliate_programs/);
 assert.match(page,/Record existing approvals and release offers/);
 assert.match(page,/publisher ID and access token/);
 assert.match(page,/merchant\.needsEvidence\.join/);
 assert.doesNotMatch(page,/\.update\(|\.insert\(|\.upsert\(/);
 const helper=source("lib/awin/joined-launch-reconciliation.ts");
 assert.doesNotMatch(helper,/createAdminClient|fetch\(|\.update\(|\.insert\(/);
});
