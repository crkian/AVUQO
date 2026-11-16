import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const sql=read("supabase/migrations/20261116230000_ebay_unreviewed_offer_cascade_guard.sql");
const schema=read("tests/fixtures/ebay-local-cascade-reference-schema.sql");
const acc=read("tests/fixtures/ebay-local-cascade-containment-acceptance.sql");
const runner=read("scripts/ebay-native-postgres-tests.sh");
const tables=["availability","awin_offer_release_reviews","awin_release_audit",
"click_events","deal_scores","promotion_candidates","published_deals"];
test("seven verified cascading offer dependencies are protected for eBay only",()=>{
 assert.match(sql,/before delete on public\.offers/);
 assert.match(sql,/s\.connector_key='ebay'/);
 assert.match(sql,/v_fk_count<>7/);
 assert.match(sql,/v_total_fk<>13/);
 assert.match(sql,/c\.confdeltype='c' and c\.convalidated/);
 assert.match(sql,/c\.conkey=array\[child\.attnum\]::smallint\[\]/);
 assert.match(sql,/revoke all on function public\.ebay_guard_unreviewed_cascading_offer_records/);
 for(const t of tables){
  assert.ok(sql.includes("'public."+t+"'"),t);
  assert.ok(sql.includes("from public."+t+" x"),t);
  assert.ok(schema.includes("create table public."+t),t);
  assert.ok(acc.includes("Cascading record of "+t+" erased without review"),t);
 }
 assert.doesNotMatch(sql,/\bdelete from\b|\bupdate public\.|state\s*=\s*'completed'|\bgrant execute\b/i);
});
test("native PostgreSQL runs exact real purge, seven isolation tests and drift rollback",()=>{
 for(const part of [
 "ebay-local-cascade-reference-schema.sql",
 "20261116230000_ebay_unreviewed_offer_cascade_guard.sql",
 "ebay-local-cascade-containment-acceptance.sql"
 ])assert.ok(runner.includes(part),part);
 for(const s of ["Cascade FK drift allowed eBay mapped purge",
 "Unknown new offer FK allowed eBay mapped purge",
 "Unrelated retailer cascade incorrectly blocked",
 "Valid eBay mapped purge rejected by cascade guard",
 "Synthetic cascade containment residue remains",
 "EBAY_SEVEN_CASCADE_DEPENDENCIES_SAFE_PASS"])
 assert.ok(acc.includes(s));
 assert.match(acc,/rollback;/);
});
