import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const sql=read("supabase/migrations/20261116224000_ebay_secondary_schema_drift_interlock.sql");
const runner=read("scripts/ebay-native-postgres-tests.sh");
const fixture=read("tests/fixtures/ebay-local-schema-drift-erasure-acceptance.sql");
test("eBay-only deletion interlock validates four real FK structures and enabled guard",()=>{
 for(const token of [
  "trigger language plpgsql security invoker",
  "s.connector_key='ebay'",
  "c.confdeltype='n'",
  "c.convalidated",
  "c.conkey=ARRAY[a.attnum]::smallint[]",
  "c.confkey=ARRAY[parent.attnum]::smallint[]",
  "v_count<>4",
  "ebay_offer_00_unreviewed_reference_gate",
  "t.tgenabled='O'",
  "ebay_guard_unreviewed_offer_references()",
  "before delete on public.offers",
  "revoke all on function"
 ])assert.ok(sql.includes(token),token);
 for(const table of ["analytics_events","attribution_events","user_feedback","watch_events"])
  assert.ok(sql.includes("'public."+table+"'"),table);
 assert.doesNotMatch(sql,/update public\.|delete from|truncate|grant execute|state='completed'|http_post/i);
});
test("native PostgreSQL covers dropped FK, wrong FK action, disabled guard and rollback",()=>{
 assert.ok(runner.includes("20261116224000_ebay_secondary_schema_drift_interlock.sql"));
 assert.ok(runner.includes("ebay-local-schema-drift-erasure-acceptance.sql"));
 for(const expected of [
  "Missing FK drift allowed mapped purge",
  "CASCADE drift allowed mapped purge",
  "Disabled orphan guard allowed mapped purge",
  "Schema drift affected unrelated source",
  "Integrity interlock blocked valid eBay purge",
  "Synthetic schema drift evidence remains"
 ])assert.ok(fixture.includes(expected),expected);
 assert.match(fixture,/rollback;/);
});
