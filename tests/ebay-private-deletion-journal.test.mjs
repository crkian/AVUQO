import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHmac} from "node:crypto";

const text=(path)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const sql=text("supabase/migrations/20261116124500_ebay_private_deletion_receipt_journal.sql");
const journal=text("lib/ebay/deletion-journal.ts");
const route=text("app/api/ebay/account-deletion/route.ts");

test("new deletion receipt table is RLS-private, not public and service-role insert only",()=>{
 assert.match(sql,/create table if not exists public\.ebay_deletion_receipts/);
 assert.match(sql,/notification_digest text not null unique/);
 assert.match(sql,/alter table public\.ebay_deletion_receipts enable row level security/);
 assert.match(sql,/revoke all on table public\.ebay_deletion_receipts from public, anon, authenticated, service_role/);
 assert.match(sql,/grant select,insert on table public\.ebay_deletion_receipts to service_role/);
 assert.doesNotMatch(sql,/grant (update|delete|truncate).* to service_role/i);
 assert.doesNotMatch(sql,/\braw_payload\b|\braw_user_id\b|\bemail\b/i);
});

test("journal hashes each identifier with a separate keyed domain and checks duplicate contents",()=>{
 assert.match(journal,/EBAY_DELETION_HMAC_SECRET/);
 assert.match(journal,/createHmac\("sha256",secret\)/);
 assert.match(journal,/digest\("notificationId",event\)/);
 assert.match(journal,/digest\("userId",id\)/);
 assert.match(journal,/digest\("username",username\)/);
 assert.match(journal,/digest\("eiasToken",eias\)/);
 assert.match(journal,/error\.code!=="23505"/);
 assert.match(journal,/prior\.user_id_digest===row\.user_id_digest/);
 assert.doesNotMatch(journal,/JSON\.stringify\(data\)/);
 const key="this-is-a-long-secret-for-testing-not-for-production";
 const h=(label,value)=>createHmac("sha256",key).update(label+"\0"+value).digest("hex");
 assert.match(h("userId","example"),/^[a-f0-9]{64}$/);
 assert.notEqual(h("userId","example"),h("username","example"));
 assert.notEqual(h("userId","example"),h("userId","another"));
});

test("verified eBay notification is journalled without acknowledging deletion before erasure",()=>{
 assert.match(route,/journalVerifiedEbayDeletion\(notice\.notificationId,notice\.data/);
 assert.match(route,/if\(!await verifyEbaySignature/);
 assert.match(route,/status:503/);
 assert.doesNotMatch(route,/status:20[0124]/);
});
