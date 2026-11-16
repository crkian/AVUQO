import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=(path)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const sql=read("supabase/migrations/20261116153000_ebay_deletion_receipt_integrity_lock.sql");
const route=read("app/api/ebay/account-deletion/route.ts");
test("deletion receipts are protected from false completion and tombstone destruction",()=>{
 assert.match(sql,/new.state='completed' or new.completed_at is not null/);
 assert.match(sql,/new.state <> 'pending_privacy_review'/);
 assert.match(sql,/old.notification_digest is distinct from new.notification_digest/);
 for(const field of ["user_id_digest","username_digest","eias_token_digest"]){
  assert.ok(sql.includes("old."+field+" is distinct from new."+field));
 }
 assert.match(sql,/old.first_received_at is distinct from new.first_received_at/);
 assert.match(sql,/tg_op = 'DELETE'/);
 assert.match(sql,/tg_op = 'TRUNCATE'/);
 assert.match(sql,/before insert on public.ebay_deletion_receipts/);
 assert.match(sql,/before update on public.ebay_deletion_receipts/);
 assert.match(sql,/before delete on public.ebay_deletion_receipts/);
 assert.match(sql,/before truncate on public.ebay_deletion_receipts/);
});
test("service-role and browser do not get direct trigger-function execution",()=>{
 assert.match(sql,/revoke all on function public.ebay_protect_pending_deletion_receipt\(\)/);
 assert.match(sql,/from public, anon, authenticated, service_role/);
 assert.doesNotMatch(sql,/grant execute/);
 assert.doesNotMatch(sql,/alter table.*disable trigger/);
});
test("privacy receiver still rejects incomplete verified deletion processing",()=>{
 assert.match(route,/status:503/);
 assert.match(route,/Deletion processing not enabled/);
 assert.doesNotMatch(sql,/update public.ebay_deletion_receipts set state='completed'/);
});
