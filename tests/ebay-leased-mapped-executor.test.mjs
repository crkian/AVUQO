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

test("native PostgreSQL applies original purge, audited wrapper and leased executor",()=>{
 const runner=readFileSync(new URL("../scripts/ebay-native-postgres-tests.sh",import.meta.url),"utf8");
 const acceptance=readFileSync(new URL("../tests/fixtures/ebay-local-mapped-executor-acceptance.sql",import.meta.url),"utf8");
 const original=readFileSync(new URL("../supabase/migrations/20261116132000_ebay_account_scoped_erasure_foundation.sql",import.meta.url),"utf8");
 const audited=readFileSync(new URL("../supabase/migrations/20261116155500_ebay_audited_partial_erasure.sql",import.meta.url),"utf8");
 for(const file of ["20261116132000_ebay_account_scoped_erasure_foundation.sql","20261116155500_ebay_audited_partial_erasure.sql","20261116192000_ebay_leased_mapped_catalogue_executor.sql","ebay-local-mapped-executor-acceptance.sql"])assert.ok(runner.includes(file),file);
 assert.doesNotMatch(runner,/ebay-local-mapped-purge-dependency/);
 assert.match(original,/create function public\.ebay_purge_mapped_account_rows/);
 assert.match(original,/delete from public\.price_history/);
 assert.match(original,/delete from public\.product_matches/);
 assert.match(original,/delete from public\.offers/);
 assert.match(original,/delete from public\.source_ingestion_items/);
 assert.match(audited,/create function public\.ebay_run_audited_partial_erasure/);
 for(const message of ["Unleased purge unexpectedly accepted","Stale attempt accepted","Mapped link remained","Non-eBay or unrelated eBay rows were incorrectly deleted","Receipt falsely marked complete","Duplicate purge accepted","Real purge acceptance fixture residue after rollback"]) assert.ok(acceptance.includes(message));
 assert.match(acceptance,/offers_erased<>1 or v_result\.ingestion_items_erased<>1/);
 assert.match(acceptance,/price_records_erased<>1 or v_result\.matches_erased<>1/);
 assert.match(acceptance,/rollback;/);
});
