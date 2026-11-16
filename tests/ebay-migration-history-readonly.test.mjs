import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const sql=read("scripts/ebay-migration-history-readonly-preflight.sql");
const manifest=read("tests/fixtures/ebay-migration-replay-manifest.txt");
const runner=read("scripts/test-ebay-ordered-migration-replay.sh");
const proof=read("scripts/test-ebay-migration-history-readonly-preflight.sh");
const historyFixture=read("tests/fixtures/ebay-local-migration-history.sql");
test("read-only migration history covers every candidate and catches four remapped version collisions",()=>{
 const files=manifest.split("\n").filter(line=>line.startsWith("supabase/migrations/"));
 assert.equal(files.length,13);
 for(const file of files)
  assert.ok(sql.includes(file.split("/").at(-1).slice(0,14)),file);
 for(const expected of [
  "ebay_account_scoped_erasure_foundation_20261116",
  "ebay_deletion_receipt_integrity_lock_20261116",
  "ebay_audited_partial_erasure_20261116",
  "ebay_atomic_tombstone_admission_20261116"
 ])assert.ok(sql.includes(expected),expected);
 for(const ver of ["20261116131949","20261116140013","20261116141927","20261116160011"])
  assert.ok(historyFixture.includes(ver),ver);
 assert.match(sql,/EXISTING_EQUIVALENT_REVIEW/);
 assert.match(sql,/EXPECTED_EQUIVALENT_MISSING_BLOCK/);
 assert.match(sql,/NEW_CANDIDATE_UNAPPLIED/);
 assert.match(sql,/VERSION_COLLISION_REVIEW/);
 assert.doesNotMatch(sql.replace(/^--.*$/gm,""),/\b(delete|update|insert|create|alter|drop|truncate|grant|revoke)\b/i);
});
test("ordered local replay verifies collision report but never auto-marks applied or applies live",()=>{
 assert.match(runner,/bash scripts\/test-ebay-migration-history-readonly-preflight\.sh/);
 assert.match(proof,/avuqo_ebay_ordered_replay_ci_synthetic/);
 assert.match(proof,/PGHOSTADDR/);
 assert.match(proof,/EXISTING_EQUIVALENT_REVIEW/);
 assert.match(proof,/NEW_CANDIDATE_UNAPPLIED/);
 assert.match(proof,/\-eq 4/);
 assert.match(proof,/\-eq 9/);
 assert.match(proof,/EBAY_MIGRATION_HISTORY_RECONCILIATION_PASS/);
 assert.doesNotMatch(proof,/dropdb|supabase\.co|\bapply_migration\b/);
});
