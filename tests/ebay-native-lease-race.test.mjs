import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const runner=read("scripts/ebay-native-postgres-tests.sh");
const lease=read("scripts/test-ebay-native-queue-lease-race.sh");
const perm=read("tests/fixtures/ebay-local-permissions-integrity.sql");
const workflow=read(".github/workflows/quality.yml");

test("runs actual two-connection queue work race on native runner",()=>{
 assert.match(runner,/test-ebay-native-queue-lease-race\.sh/);
 assert.match(workflow,/Native PostgreSQL eBay concurrency \(synthetic, no Docker\)/);
 assert.match(lease,/pg_try_advisory_xact_lock/);
 assert.match(lease,/public\.ebay_claim_erasure_work\(90\)/g);
 assert.match(lease,/contender.*== 0/);
 assert.match(lease,/rollback;/);
 assert.match(lease,/rolled-back worker work not replayable/);
 assert.match(lease,/pending_privacy_review/);
 assert.match(lease,/Unix-socket synthetic DB/);
 assert.doesNotMatch(lease,/docker|https?:\/\/|supabase\.co|production/i);
});

test("database assertions reject non-DBA queue grants and false deletion completion",()=>{
 assert.match(runner,/ebay-local-permissions-integrity\.sql/);
 for(const role of ["anon","authenticated","service_role"])assert.ok(perm.includes("'"+role+"'"));
 assert.match(perm,/has_table_privilege/);
 assert.match(perm,/has_function_privilege/);
 assert.match(perm,/public\.ebay_record_erasure_work_outcome/);
 assert.match(perm,/set state='completed',completed_at=clock_timestamp\(\)/);
 assert.match(perm,/False completed receipt accepted/);
 assert.match(perm,/rollback;/);
 assert.doesNotMatch(perm,/grant execute|delete from public\.ebay_deletion_receipts/i);
});
