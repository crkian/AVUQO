import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=(path)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const sql=read("supabase/migrations/20261116200000_ebay_dba_bounded_mapped_purge_runner.sql");
const script=read("scripts/ebay-native-postgres-tests.sh");
const fixture=read("tests/fixtures/ebay-local-dba-processor-acceptance.sql");
test("single-item real mapped purge is argument-free and always scoped",()=>{
 assert.match(sql,/create function public\.ebay_run_next_mapped_catalogue_erasure\(\)/);
 assert.match(sql,/w\.surface='mapped_catalogue'/g);
 assert.match(sql,/for update of w skip locked/);
 assert.match(sql,/limit 1/);
 assert.match(sql,/pg_catalog\.make_interval\(secs=>90\)/);
 assert.match(sql,/public\.ebay_execute_leased_mapped_catalogue_erasure/);
 assert.match(sql,/v_attempt/);
 assert.doesNotMatch(sql,/update public\.ebay_deletion_receipts|state='completed'|\bGRANT EXECUTE\b/i);
});
test("DBA-only privacy restriction and non-completion preserved",()=>{
 assert.match(sql,/revoke all on function public\.ebay_run_next_mapped_catalogue_erasure\(\)/);
 assert.match(sql,/public,anon,authenticated,service_role/);
 assert.match(sql,/awaiting_evidence/);
 assert.doesNotMatch(sql,/https?:\/\/|\bfetch\(|\bhttp_post\b/);
});
test("real original purge, audit, worker and synthetic rollback are integrated",()=>{
 for(const part of [
 "20261116132000_ebay_account_scoped_erasure_foundation.sql",
 "20261116155500_ebay_audited_partial_erasure.sql",
 "20261116192000_ebay_leased_mapped_catalogue_executor.sql",
 "20261116200000_ebay_dba_bounded_mapped_purge_runner.sql",
 "ebay-local-dba-processor-acceptance.sql"
 ])assert.ok(script.includes(part),part);
 for(const clause of [
 "Unrelated eBay offer deleted",
 "Unexpected audited mapped work count",
 "Second claim must be empty",
 "Active eBay source incorrectly permitted",
 "Failed purge changed work state",
 "Synthetic processor residue remains"
 ]) assert.ok(fixture.includes(clause),clause);
 assert.match(fixture,/rollback;/);
});
