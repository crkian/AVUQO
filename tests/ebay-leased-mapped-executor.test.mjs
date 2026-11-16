import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const src=readFileSync(new URL("../supabase/migrations/20261116192000_ebay_leased_mapped_catalogue_executor.sql",import.meta.url),"utf8");
test("only mapped catalogue leased work invokes existing audited purge",()=>{
 assert.match(src,/where w\.receipt_id=p_receipt_id and w\.surface='mapped_catalogue'/);
 assert.match(src,/for update;/g);
 assert.match(src,/v_work\.attempts <> p_attempt/);
 assert.match(src,/v_work\.lease_until <= clock_timestamp\(\)/);
 assert.match(src,/public\.ebay_run_audited_partial_erasure\(v_receipt\.notification_digest\)/);
 assert.match(src,/v_source\.status <> 'paused'/);
});
test("attempt ends in review with no false completion and DBA-only grants",()=>{
 assert.match(src,/state='awaiting_evidence'/);
 assert.match(src,/revoke all on function public\.ebay_execute_leased_mapped_catalogue_erasure/);
 assert.match(src,/public,anon,authenticated,service_role/);
 assert.doesNotMatch(src,/update public\.ebay_deletion_receipts|state\s*=\s*'completed'|\bgrant execute\b/i);
});
