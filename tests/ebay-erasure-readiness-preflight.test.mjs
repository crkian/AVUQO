import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const sql=readFileSync(new URL("../scripts/ebay-erasure-readiness-preflight.sql",import.meta.url),"utf8");

test("readiness query stays aggregate-only and read-only",()=>{
 assert.match(sql,/with source_status as/i);
 assert.match(sql,/count\(\*\)/i);
 assert.match(sql,/connector_key\s*=\s*'ebay'/i);
 assert.doesNotMatch(sql,/\b(insert|update|delete|truncate|alter|create|drop|grant|revoke|copy)\s+(into|from|table|function|role|on|public\.)/i);
 assert.doesNotMatch(sql,/select\s+\*\s+from\s+public\.ebay_deletion_receipts/i);
});
test("report checks paused source, DB lock guards and private erasure RPCs",()=>{
 for(const name of ["ebay_deletion_receipt_account_lock","ebay_account_item_00_tombstone_gate","ebay_run_audited_partial_erasure","ebay_purge_mapped_account_rows"])assert.ok(sql.includes(name),name);
 for(const role of ["anon","authenticated","service_role"])assert.ok(sql.includes(role),role);
});
test("does not treat database cleanliness as compliant deletion or provider approval",()=>{
 for(const gate of ["two_session_race_proven_by_this_query","cross_store_erasure_proven_by_this_query","backup_retention_proven_by_this_query","signed_provider_event_proven_by_this_query","ebay_activation_authorised_by_this_query"])assert.match(sql,new RegExp("false as "+gate));
 assert.match(sql,/NEVER certifies complete erasure/);
});
