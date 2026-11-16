import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const sql=readFileSync(new URL("../supabase/migrations/20261116165000_ebay_atomic_tombstone_admission.sql",import.meta.url),"utf8");
const route=readFileSync(new URL("../app/api/ebay/account-deletion/route.ts",import.meta.url),"utf8");
test("receipt and ownership link share exact transaction-scoped advisory key",()=>{
 assert.match(sql,/pg_catalog\.hashtextextended\(/);
 assert.match(sql,/pg_catalog\.pg_advisory_xact_lock\(v_key\)/);
 assert.match(sql,/pg_catalog\.pg_advisory_xact_lock\(\s*pg_catalog\.hashtextextended/);
 assert.match(sql,/avuqo-ebay-account:/);
 assert.match(sql,/order by lock_key/);
 assert.match(sql,/ebay_deletion_receipt_account_lock/);
 assert.match(sql,/ebay_account_item_00_tombstone_gate/);
 assert.match(sql,/as \$\$/);
 assert.doesNotMatch(sql,/as \$(?:\n|$)/);
});
test("suppression checks use indexed exact fingerprints and volatile post-lock snapshot",()=>{
 assert.match(sql,/ebay_deletion_receipts_user_digest_idx/);
 assert.match(sql,/ebay_deletion_receipts_username_digest_idx/);
 assert.match(sql,/ebay_deletion_receipts_eias_digest_idx/);
 assert.match(sql,/returns boolean language plpgsql volatile security invoker/);
 for(const kind of ["user_id_digest","username_digest","eias_token_digest"])assert.match(sql,new RegExp("where "+kind+"=p_digest"));
 assert.match(sql,/Deleted eBay account cannot be relinked/);
 assert.match(sql,/before insert or update on public\.ebay_account_item_links/);
});
test("private functions do not grant browser or service-role direct RPC, eBay stays disabled",()=>{
 assert.match(sql,/revoke all on function public\.ebay_is_account_digest_suppressed\(text,text\)/);
 assert.match(sql,/revoke all on function public\.ebay_reject_tombstoned_account_item_link\(\)/);
 assert.doesNotMatch(sql,/grant execute on function/);
 assert.doesNotMatch(sql,/\bupdate public\.sources\b|\bdelete from public\.ebay_deletion_receipts\b/);
 assert.match(route,/status:503/);
});
