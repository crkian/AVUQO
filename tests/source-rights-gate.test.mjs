import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  sourceEvidenceFailures, sourceIngestionFailures, evaluateSourceControls
} from "../lib/pipeline/source-readiness.ts";

const good = {
  status:"active",sync_enabled:true, credential_status:"ready",
  source_type:"affiliate_network", connector_key:"awin",
  metadata:{
    usage_rights_confirmed:true,rights_evidence_ref:"owner-approved-rights.pdf",
    feed_permission_confirmed:true,feed_evidence_ref:"merchant-feed-approval-123",
    allowed_territories:["GB"],rights_valid_until:"2027-06-01T00:00:00Z",
    awin_advertisers:[{advertiser_id:"69178",feed_permission_confirmed:true,
      approval_evidence_ref:"awin-confirmation-69178",allowed_territory:"GB",
      valid_until:"2027-06-01T00:00:00Z"}],
  },
};
const context = { advertiserId:"69178",connectorConfigured:true,now:Date.parse("2026-11-02T12:00:00Z") };

test("external feed rights require current evidence and matching Awin advertiser",()=>{
 assert.deepEqual(sourceIngestionFailures(good,context),[]);
 assert.ok(sourceIngestionFailures({...good,status:"paused"},context).length);
 assert.ok(sourceIngestionFailures({...good,sync_enabled:false},context).length);
 assert.ok(sourceIngestionFailures({...good,credential_status:"not_configured"},context).length);
 assert.ok(sourceEvidenceFailures({...good,metadata:{}},context).length>=4);
 assert.ok(sourceEvidenceFailures(good,{...context,advertiserId:"77952"}).some(x=>x.includes("advertiser-specific")));
 assert.ok(sourceEvidenceFailures(good,{...context,connectorConfigured:false}).length);
 assert.ok(sourceEvidenceFailures(good,{...context,now:Date.parse("2028-01-01T00:00:00Z")}).length);
});

test("Awin top-level network rights alone never approve a merchant",()=>{
 const copy=JSON.parse(JSON.stringify(good));
 copy.metadata.awin_advertisers=[];
 assert.ok(sourceEvidenceFailures(copy,context).some(x=>x.includes("advertiser-specific")));
 const expired=JSON.parse(JSON.stringify(good));
 expired.metadata.awin_advertisers[0].valid_until="2025-01-01T00:00:00Z";
 assert.ok(sourceEvidenceFailures(expired,context).some(x=>x.includes("advertiser-specific")));
});

test("missing, error or incomplete kill switch read always fails closed",()=>{
 assert.deepEqual(evaluateSourceControls(null,true),{ingestion:false,publishing:false,emergencyStop:true});
 assert.equal(evaluateSourceControls([]).ingestion,false);
 const rows=[
 {control_key:"source_ingestion",enabled:true},
 {control_key:"deal_publishing",enabled:true},
 {control_key:"global_emergency_stop",enabled:false},
 ];
 assert.deepEqual(evaluateSourceControls(rows),{ingestion:true,publishing:true,emergencyStop:false});
 assert.equal(evaluateSourceControls([...rows.slice(0,2),{control_key:"global_emergency_stop",enabled:true}]).publishing,false);
 assert.equal(evaluateSourceControls(rows.filter(x=>x.control_key!=="deal_publishing")).publishing,false);
});

test("no external offer may be fetched before source evidence gate",()=>{
 const code=readFileSync("lib/pipeline/run.ts","utf8");
 assert.match(code,/sourceIngestionFailures\(/);
 assert.match(code,/await connector\.fetchOffers\(/);
 assert.ok(code.indexOf("sourceIngestionFailures(source") < code.indexOf("await connector.fetchOffers("));
 assert.match(code,/evaluateSourceControls\(/);
});
