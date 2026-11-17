import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const full=read("tests/fixtures/ebay-migration-replay-manifest.txt").split("\n").filter(x=>x.startsWith("supabase/migrations/"));
const nine=read("tests/fixtures/ebay-nine-only-migration-manifest.txt").split("\n").filter(x=>x.startsWith("supabase/migrations/"));
const script=read("scripts/test-ebay-nine-only-migration-replay.sh");
const runner=read("scripts/ebay-native-postgres-tests.sh");
test("Nine-only manifest exactly matches the last nine chronological candidates",()=>{
 assert.equal(full.length,13);assert.equal(nine.length,9);
 assert.deepEqual(nine,full.slice(4));
 assert.deepEqual(nine,[...nine].sort());
 assert.equal(new Set(nine).size,9);
 for(const path of nine){
  assert.match(path,/^supabase\/migrations\/\d{14}_ebay_[a-z0-9_]+\.sql$/);
  assert.ok(existsSync(new URL("../"+path,import.meta.url)),path);
 }
});
test("Local-only replay safely refuses remote DB and never repeats four foundations",()=>{
 for(const needle of [
 'id -un','PGHOST','PGDATABASE','PGHOSTADDR','DATABASE_URL','SUPABASE_DB_URL',
 'PGPASSWORD','created=false','createdb -h /var/run/postgresql',
 'if [[ "$created" == true ]]','dropdb -h /var/run/postgresql',
 'scripts/ebay-migration-history-readonly-preflight.sql',
 'EXISTING_EQUIVALENT_REVIEW','NEW_CANDIDATE_UNAPPLIED',
 'psql -X -v ON_ERROR_STOP=1 -1','scripts/ebay-full-schema-readonly-preflight.sql',
 'provider_release_authorised','tests/fixtures/ebay-ordered-replay-invariants.sql',
 'EBAY_NINE_ONLY_REPLAY_PASS'
 ])assert.ok(script.includes(needle),needle);
 assert.match(script,/for path in "\$\{nine\[@\]\}"; do args\+=\(-f "\$path"\); done/);
 assert.match(runner,/bash scripts\/test-ebay-nine-only-migration-replay\.sh/);
 assert.doesNotMatch(script,/supabase\.co|https?:\/\/|docker|curl|--force|PGPASSWORD=.*[A-Za-z0-9]/i);
});
test("Synthetic history retains four actual legacy timestamps without candidate replay",()=>{
 const history=read("tests/fixtures/ebay-local-migration-history.sql");
 for(const version of ["20261116131949","20261116140013","20261116141927","20261116160011"])
  assert.ok(history.includes(version),version);
 for(const stamp of ["20261116132000","20261116153000","20261116155500","20261116165000"])
  assert.match(script,new RegExp(stamp));
});
