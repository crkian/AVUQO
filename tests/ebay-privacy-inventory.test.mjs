import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const sql=readFileSync(new URL("../supabase/migrations/20261116162000_ebay_privacy_inventory_counts.sql",import.meta.url),"utf8");
test("privacy inventory counts source-aligned eBay rows and explicitly labels heuristics",()=>{
 for(const table of ["offers","source_ingestion_items","product_matches","price_history"]){
  assert.match(sql,new RegExp("from public\\."+table+"\\b"));
 }
 for(const table of ["analytics_events","click_events","attribution_events","affiliate_conversions","audit_logs","products","creative_assets","marketing_assets","feed_import_records","pipeline_events"]){
  assert.match(sql,new RegExp("from public\\."+table+"\\b"));
 }
 assert.match(sql,/from storage\.objects/);
 assert.match(sql,/from storage\.buckets/);
 assert.match(sql,/connector_key='ebay'/);
 assert.match(sql,/text marker heuristic/);
 assert.match(sql,/zero eBay markers does NOT prove/i);
});
test("inventory function is DBA-only, read-only and never returns account identifiers",()=>{
 assert.match(sql,/security definer set search_path = ''/);
 assert.match(sql,/revoke all on function public\.ebay_privacy_inventory_counts\(\)/);
 assert.match(sql,/from public,anon,authenticated,service_role/);
 assert.doesNotMatch(sql,/grant execute/);
 assert.doesNotMatch(sql,/\b(delete|update|insert into|truncate)\s+public\./i);
 assert.doesNotMatch(sql,/returns table\([^)]*(user_id|email|username|eias)/i);
});
