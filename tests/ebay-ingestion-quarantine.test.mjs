import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const sql=readFileSync(new URL("../supabase/migrations/20261116141000_ebay_ingestion_quarantine.sql",import.meta.url),"utf8");
const route=readFileSync(new URL("../app/api/ebay/account-deletion/route.ts",import.meta.url),"utf8");

test("database hard-stop protects all four eBay product write tables",()=>{
 for(const name of ["offers","source_ingestion_items","product_matches","price_history"]){
  assert.match(sql,new RegExp("before insert or update on public\\."+name+" for each row"));
 }
 assert.match(sql,/v_old_ebay or v_new_ebay/);
 assert.match(sql,/old\.source_id/);
 assert.match(sql,/new\.source_id/);
 assert.match(sql,/connector_key='ebay'/);
 assert.match(sql,/raise exception 'eBay ingestion quarantined/);
 assert.doesNotMatch(sql,/grant execute on function public\.ebay_reject_unapproved_source_writes/);
});

test("activation guard blocks enabling, connector relabel and unauthorized new eBay sources",()=>{
 assert.match(sql,/before insert or update on public\.sources for each row/);
 assert.match(sql,/old\.connector_key='ebay'/);
 assert.match(sql,/new\.connector_key is distinct from 'ebay'/);
 assert.match(sql,/new\.status is distinct from 'paused'/);
 assert.match(sql,/new\.sync_enabled is distinct from false/);
 assert.match(sql,/raise exception 'eBay source cannot be activated/);
});

test("quarantine is not a deletion acknowledgement or source activation",()=>{
 assert.match(route,/status:503/);
 assert.match(sql,/Does NOT complete account deletion/);
 assert.doesNotMatch(sql,/\bupdate public\.sources\b|\bupdate public\.ebay_deletion_receipts\b/i);
 assert.doesNotMatch(sql,/disable trigger|drop trigger|alter table public\.offers disable/i);
});
