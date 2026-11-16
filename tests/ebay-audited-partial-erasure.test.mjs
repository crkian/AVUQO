import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=(p)=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const sql=read("supabase/migrations/20261116155500_ebay_audited_partial_erasure.sql");
const route=read("app/api/ebay/account-deletion/route.ts");
test("partial erasure audit stores counts and receipt IDs, not customer data",()=>{
 assert.match(sql,/create table public\.ebay_partial_erasure_audit/);
 assert.match(sql,/receipt_id bigint not null references public\.ebay_deletion_receipts/);
 for(const col of ["offers_erased","ingestion_items_erased","price_records_erased","matches_erased"]){
  assert.match(sql,new RegExp(col+" bigint not null check"));
 }
 assert.doesNotMatch(sql,/raw_payload|raw_user_id|username text|eias_token text/i);
 assert.match(sql,/result='partial_rows_purged'/);
});
test("only DBA may run scoped deletion and audit insert is transactional",()=>{
 assert.match(sql,/create function public\.ebay_run_audited_partial_erasure\(p_notification_digest text\)/);
 assert.match(sql,/for update;/);
 assert.match(sql,/public\.ebay_purge_mapped_account_rows\(p_notification_digest\)/);
 assert.match(sql,/Partial eBay erasure left mapped data behind/);
 assert.match(sql,/insert into public\.ebay_partial_erasure_audit/);
 assert.match(sql,/revoke all on function public\.ebay_run_audited_partial_erasure\(text\)/);
 assert.match(sql,/from public,anon,authenticated,service_role/);
 assert.doesNotMatch(sql,/grant execute on function/);
 assert.doesNotMatch(sql,/update public\.ebay_deletion_receipts/);
});
test("receipt cannot be marked complete and webhook is still not allowed to acknowledge",()=>{
 assert.match(route,/status:503/);
 assert.doesNotMatch(route,/ebay_run_audited_partial_erasure/);
 assert.doesNotMatch(sql,/state\s*=\s*'completed'/);
});
