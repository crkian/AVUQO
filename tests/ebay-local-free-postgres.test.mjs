import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const ps=read("scripts/run-ebay-local-postgres-tests.ps1");
const sh=read("scripts/ebay-local-container-tests.sh");
const fixture=read("tests/fixtures/ebay-local-schema.sql");
const acceptance=read("tests/fixtures/ebay-local-erasure-acceptance.sql");
const receipt=read("scripts/test-ebay-tombstone-race.sh");
const reverse=read("scripts/test-ebay-reverse-lock-witness.sh");

test("free local Docker runner is isolated, ephemeral and does not connect to cloud",()=>{
 assert.match(ps,/--network none/);
 assert.match(ps,/--tmpfs/);
 assert.match(ps,/docker rm -f/);
 assert.match(ps,/finally \{/);
 assert.match(ps,/Get-Command docker/);
 assert.doesNotMatch(ps,/docker (push|login|build)|--publish|\s-p\s+\d|supabase\s+db|vercel\s+deploy|https?:\/\//i);
});
test("only real versioned trigger and work journal migrations are used",()=>{
 for(const path of [
 "20261116153000_ebay_deletion_receipt_integrity_lock.sql",
 "20261116165000_ebay_atomic_tombstone_admission.sql",
 "20261116181000_ebay_erasure_work_journal.sql"
 ]) assert.ok(ps.includes(path),path);
 assert.match(sh,/test-ebay-tombstone-race\.sh/);
 assert.match(sh,/test-ebay-reverse-lock-witness\.sh/);
 assert.match(sh,/ON_ERROR_STOP=1/g);
 assert.match(sh,/LOCAL_POSTGRES_CHECKS_PASS/);
});
test("fixtures are synthetic and prove seven seeded queue tasks and rollback",()=>{
 assert.match(fixture,/fixture-other/);
 assert.match(fixture,/create table public\.ebay_deletion_receipts/);
 assert.match(fixture,/create table public\.ebay_account_item_links/);
 assert.match(acceptance,/n<>7/);
 assert.match(acceptance,/ebay_claim_erasure_work/);
 assert.match(acceptance,/ebay_record_erasure_work_outcome/);
 assert.match(acceptance,/Stale attempt incorrectly accepted/);
 assert.match(acceptance,/rollback;/i);
 assert.doesNotMatch(fixture,/\b(copy|dblink|postgres_fdw)\b|https?:\/\//i);
});
test("both concurrent witnesses poll the real transaction advisory key",()=>{
 for(const script of [receipt,reverse]){
  assert.match(script,/pg_try_advisory_xact_lock/);
  assert.match(script,/avuqo-ebay-account:user_id_digest/);
  assert.match(script,/holder_pid=\$!/);
  assert.match(script,/55P03/);
 }
 assert.match(reverse, /\\set VERBOSITY verbose/);
 assert.doesNotMatch(reverse,/\\\\set VERBOSITY verbose/);
});
