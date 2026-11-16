import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const manifest=read("tests/fixtures/ebay-migration-replay-manifest.txt");
const script=read("scripts/test-ebay-ordered-migration-replay.sh");
const runner=read("scripts/ebay-native-postgres-tests.sh");
const migrations=manifest.split("\n").filter(x=>x.startsWith("supabase/migrations/"));
test("eBay privacy replay manifest has all thirteen canonical chronological migration paths",()=>{
 assert.equal(migrations.length,13);
 assert.deepEqual(migrations,[...migrations].sort());
 assert.equal(new Set(migrations).size,migrations.length);
 for(const p of migrations){
  assert.match(p,/^supabase\/migrations\/\d{14}_ebay_[a-z0-9_]+\.sql$/);
  assert.ok(existsSync(new URL("../"+p,import.meta.url)),p);
 }
 for(const stamp of [
  "20261116132000","20261116153000","20261116155500","20261116165000",
  "20261116181000","20261116192000","20261116200000","20261116203000",
  "20261116211000","20261116214000","20261116221000","20261116224000","20261116230000"
 ]) assert.ok(migrations.some(p=>p.includes(stamp)),stamp);
});
test("replay never connects to production nor drops a database it did not create",()=>{
 for(const token of [
  '[[ "$(id -un)" == postgres ]]',
  'avuqo_ebay_ci_synthetic',
  '/var/run/postgresql',
  'PGHOSTADDR','DATABASE_URL','SUPABASE_DB_URL',
  'created=false','createdb -h /var/run/postgresql',
  'created=true','if [[ "$created" == true ]]',
  'dropdb -h /var/run/postgresql',
  'psql -X -v ON_ERROR_STOP=1 -1',
  'scripts/ebay-full-schema-readonly-preflight.sql',
  'tests/fixtures/ebay-ordered-replay-invariants.sql',
  'provider_release_authorised',
  'EBAY_ORDERED_MIGRATION_REPLAY_PASS'
 ]) assert.ok(script.includes(token),token);
 assert.match(runner,/bash scripts\/test-ebay-ordered-migration-replay\.sh/);
 assert.doesNotMatch(script,/supabase\.co|psql .*DATABASE_URL|--force|PGPASSWORD|docker|curl /i);
});
test("preflight enforces 11 technical passes and release denial with zero sensitive records",()=>{
 const invariant=read("tests/fixtures/ebay-ordered-replay-invariants.sql");
 for(const table of ["ebay_deletion_receipts","ebay_account_item_links",
  "ebay_erasure_work_items","ebay_partial_erasure_audit"])
  assert.ok(invariant.includes("public."+table),table);
 assert.match(script,/\$2=="PASS"/);
 assert.match(script,/provider-release gate must always remain BLOCK/);
 assert.match(invariant,/status='paused' and sync_enabled=false/);
});
