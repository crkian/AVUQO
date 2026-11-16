import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const sh=read("scripts/ebay-native-postgres-tests.sh");
const race=read("scripts/test-ebay-committed-link-first-race.sh");
const fixture=read("tests/fixtures/ebay-local-schema.sql");
const workflow=read(".github/workflows/quality.yml");

test("native Ubuntu runner and Unix-socket connection only, no containers",()=>{
 assert.match(workflow,/runs-on: ubuntu-24\.04/);
 assert.match(workflow,/systemctl start postgresql\.service/);
 assert.match(workflow,/sudo -u postgres/);
 assert.match(sh,/PGHOST.*\/var\/run\/postgresql/);
 assert.match(sh,/avuqo_ebay_ci_synthetic/);
 assert.match(sh,/DATABASE_URL/);
 assert.match(sh,/NATIVE_POSTGRES_CONCURRENCY_AND_QUEUE_LEASE_PASS/);
 for(const x of [sh,workflow]) assert.doesNotMatch(x,/docker (run|build|pull)|services:\s*\n\s*postgres:/i);
});
test("actual migrations and rollback-based acceptance are executed",()=>{
 for(const path of ["20261116153000_ebay_deletion_receipt_integrity_lock.sql",
 "20261116165000_ebay_atomic_tombstone_admission.sql",
 "20261116181000_ebay_erasure_work_journal.sql",
 "tests/fixtures/ebay-local-erasure-acceptance.sql",
 "scripts/test-ebay-tombstone-race.sh",
 "scripts/test-ebay-reverse-lock-witness.sh",
 "scripts/test-ebay-committed-link-first-race.sh"])assert.ok(sh.includes(path),path);
});
test("actual link-first INSERT holds transactional advisory key",()=>{
 assert.match(race,/insert into public\.ebay_account_item_links/);
 assert.match(race,/insert into public\.ebay_deletion_receipts/);
 assert.match(race,/pg_try_advisory_xact_lock/);
 assert.match(race,/55P03/);
 assert.match(race,/rollback;/g);
 assert.match(race,/\$before" == "\$after/);
 assert.match(race,/refusing non-local test database/);
 assert.match(fixture,/fixture-other/);
 assert.match(fixture,/connector_key,status,sync_enabled/);
});
test("legacy Docker entry points are removed from the repository",()=>{
 for(const path of ["scripts/run-ebay-local-postgres-tests.ps1","scripts/ebay-local-container-tests.sh"])assert.equal(existsSync(new URL("../"+path,import.meta.url)),false);
});
