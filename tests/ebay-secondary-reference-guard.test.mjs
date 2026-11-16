import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const sql=read("supabase/migrations/20261116203000_ebay_prevent_secondary_reference_orphaning.sql");
const runner=read("scripts/ebay-native-postgres-tests.sh");
const fixture=read("tests/fixtures/ebay-local-secondary-reference-schema.sql");
const proof=read("tests/fixtures/ebay-local-secondary-orphan-guard-acceptance.sql");
test("eBay-only guard blocks destructive SET NULL ownership orphans",()=>{
 assert.match(sql,/before delete on public\.offers/);
 assert.match(sql,/s\.connector_key='ebay'/);
 for(const t of ["analytics_events","attribution_events","user_feedback","watch_events"]){
  assert.ok(sql.includes("public."+t),t);
  assert.match(fixture,new RegExp("create table public\\."+t));
 }
 assert.match(sql,/raise exception 'eBay mapped purge blocked: dependent personal\/event records require privacy review'/);
 assert.match(sql,/revoke all on function public\.ebay_guard_unreviewed_offer_references/);
 assert.doesNotMatch(sql,/update public\.ebay_deletion_receipts|state='completed'|\bgrant execute\b/i);
});
test("native integration with original mapped erasure proves rollback and scoped continuation",()=>{
 for(const path of ["ebay-local-secondary-reference-schema.sql","20261116203000_ebay_prevent_secondary_reference_orphaning.sql","ebay-local-secondary-orphan-guard-acceptance.sql"])
  assert.ok(runner.includes(path),path);
 for(const message of ["Unreviewed event references were not blocked","Dependent event offer references were orphaned","Blocked purge changed queue attempt","Mapped eBay offer remained after dependencies cleared","Synthetic reference-guard fixture residue remains"])
  assert.ok(proof.includes(message),message);
 assert.match(proof,/rollback;/);
});
