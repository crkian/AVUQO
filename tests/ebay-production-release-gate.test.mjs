import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {test} from "node:test";

const sql=readFileSync("scripts/ebay-production-release-gate-readonly.sql","utf8");
const gates=[
 "foundation_history_recorded","nine_migration_history","ebay_paused",
 "all_thirteen_offer_fks","evidence_queue_installed",
 "independent_cascade_guard","private_erasure_functions",
 "storage_log_backup_account_scope","lawful_retention_and_processor_evidence",
 "provider_signed_notification_acceptance","provider_activation_authorised"
];

test("eBay production release audit has exactly the named eleven gates",()=>{
 for(const g of gates)assert.ok(sql.includes("'"+g+"'"),"Missing "+g);
 assert.equal((sql.match(/union all select /g)||[]).length,10);
});
test("read-only release audit is not an installer and cannot activate eBay",()=>{
 const stripped=sql.replace(/--[^\n]*/g,"");
 assert.doesNotMatch(stripped,/\b(?:insert|update|delete|truncate|alter|create|drop|grant|revoke|execute|call)\b\s/i);
 for(const g of [
 "storage_log_backup_account_scope","lawful_retention_and_processor_evidence",
 "provider_signed_notification_acceptance","provider_activation_authorised"
 ]){
  assert.match(sql,new RegExp("'"+g+"'\\s*,\\s*false"));
 }
});
test("migration record, seven-cascade and private-RPC contracts fail closed",()=>{
 assert.match(sql,/matched_foundations=4/);
 assert.match(sql,/applied_later=9/);
 assert.match(sql,/total_fks=13 and audited_cascades=7/);
 assert.match(sql,/existing_baseline_functions=2 and not exposed/);
 assert.match(sql,/has_function_privilege\('anon'/);
 assert.match(sql,/has_function_privilege\('authenticated'/);
 assert.match(sql,/has_function_privilege\('service_role'/);
});
