import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const topology=read("scripts/ebay-live-offer-fk-topology-readonly.sql");
const replay=read("scripts/test-ebay-nine-only-production-schema-dump.sh");
const nullSet=["analytics_events","attribution_events","user_feedback","watch_events"];
const cascading=["availability","awin_offer_release_reviews","awin_release_audit",
 "click_events","deal_scores","ebay_account_item_links","price_history",
 "promotion_candidates","published_deals"];

test("Read-only live contract pins all thirteen exact named FK relationships",()=>{
 for(const [tables,code] of [[nullSet,"n"],[cascading,"c"]]){
  for(const table of tables){
   assert.ok(topology.includes("('"+table+"'::text,'"+table+"_offer_id_fkey'::text,'"+code+"'::\"char\")"),table);
  }
 }
 assert.equal(nullSet.length,4);
 assert.equal(cascading.length,9);
 assert.equal((topology.match(/_offer_id_fkey'::text/g)||[]).length,13);
 for(const invariant of ["count(*)=13","c.convalidated","not a.condeferrable",
 "not a.condeferred","a.child_column='offer_id'","a.parent_column='id'",
 "a.conkey=array[a.child_attnum]","a.confkey=array[a.parent_attnum]"]){
  assert.ok(topology.includes(invariant),invariant);
 }
 assert.match(topology,/'production_install_authorised',\s*false/);
});
test("Production schema-only runner fails closed before touching a database",()=>{
 for(const term of [
 'id -un','PGHOST','PGDATABASE','PGHOSTADDR','DATABASE_URL',
 'SUPABASE_DB_URL','PGPASSWORD','PGSERVICE','PGSERVICEFILE',
 'AVUQO_EBAY_SCHEMA_ONLY_DUMP','! -L "$dump"','pg_restore --list',
 'TABLE DATA','MATERIALIZED VIEW DATA','created=false',
 'createdb -h /var/run/postgresql','dropdb -h /var/run/postgresql',
 'pg_restore --schema-only --exit-on-error --single-transaction',
 '--no-owner --no-privileges',
 'scripts/ebay-seven-foundation-body-hash-readonly.sql',
 'scripts/ebay-nine-only-migration-manifest.txt',
 'scripts/ebay-nine-only-migration-manifest.txt',
 '13|9|4|t','ON_ERROR_STOP=1 -1','ebay_receipt_queue_ready',
 'ebay_offer_02_unreviewed_cascade_gate',
 'EBAY_PRODUCTION_SCHEMA_ONLY_NINE_REPLAY_PASS'
 ]) assert.ok(replay.includes(term),term);
 assert.doesNotMatch(replay,/https?:\/\/|docker|curl|supabase\s+db\s+push/i);
 assert.doesNotMatch(replay,/--clean|--create|--disable-triggers/);
});
test("No production mutations or customer-row scans exist in topology check",()=>{
 const sql=topology.replace(/--[^\n]*/g,"");
 assert.doesNotMatch(sql,/\b(?:insert\s+into|update\s+public\.|delete\s+from|alter\s+table|truncate\s+|grant\s+|revoke\s+|drop\s+table)/i);
 assert.doesNotMatch(sql,/from\s+public\.(?:ebay_deletion_receipts|ebay_account_item_links)/i);
});
