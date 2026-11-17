import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const sql=readFileSync(new URL("../supabase/migrations/20261116181000_ebay_erasure_work_journal.sql",import.meta.url),"utf8");
const route=readFileSync(new URL("../app/api/ebay/account-deletion/route.ts",import.meta.url),"utf8");

test("durable work journal is aggregate, private, and no compliance completion",()=>{
 assert.match(sql,/create table public\.ebay_erasure_work_items/);
 for(const s of ["mapped_catalogue","indirect_identifiers","analytics_attribution","storage_media","application_cdn_logs","backups_restoration","external_processors"])assert.ok(sql.includes("'"+s+"'"));
 assert.match(sql,/primary key \(receipt_id,surface\)/);
 assert.match(sql,/enable row level security/);
 assert.match(sql,/revoke all on public\.ebay_erasure_work_items\s+from public,anon,authenticated,service_role/);
 assert.doesNotMatch(sql,/\b(raw_payload|raw_username|raw_user_id|eias_token\s+text|identity_digest\s+text)\b/i);
 assert.doesNotMatch(sql,/state\s*=\s*'completed'|update public\.ebay_deletion_receipts/i);
});
test("receipt inserts seed all work steps idempotently",()=>{
 assert.match(sql,/after insert on public\.ebay_deletion_receipts/);
 assert.match(sql,/on conflict\(receipt_id,surface\) do nothing/);
 assert.match(sql,/where r\.state <> 'completed'/);
});
test("safe claims and retry outcomes do not acknowledge provider",()=>{
 assert.match(sql,/for update of w skip locked/);
 assert.match(sql,/lease_until<clock_timestamp\(\)/);
 assert.match(sql,/attempts=w\.attempts\+1/);
 assert.match(sql,/p_lease_seconds not between 30 and 300/);
 assert.match(sql,/Stale, expired or nonexistent eBay erasure work lease/);
 assert.match(sql,/p_outcome not in \('retry','awaiting_evidence','blocked'\)/);
 assert.match(sql,/revoke all on function public\.ebay_claim_erasure_work\(integer\)/);
 assert.match(sql,/revoke all on function public\.ebay_record_erasure_work_outcome\(bigint,text,integer,text,text\)/);
 assert.match(route,/status:503/);
 assert.match(sql,/grant execute on function public\.ebay_receipt_queue_ready\(text\) to service_role/);
 assert.doesNotMatch(sql,/grant execute on function public\.ebay_claim_erasure_work/i);
 assert.doesNotMatch(sql,/\bhttp_post\b|\bpg_net\b/i);
});

test("boolean-only queue witness requires seven distinct exact surfaces and cannot complete erasure",()=>{
 assert.match(sql,/create function public\.ebay_receipt_queue_ready\(p_notification_digest text\)/);
 assert.match(sql,/security definer set search_path = ''/);
 assert.match(sql,/where r\.notification_digest=p_notification_digest/);
 assert.match(sql,/count\(\*\) from public\.ebay_erasure_work_items/);
 assert.match(sql,/\)=7/);
 assert.match(sql,/where w\.receipt_id=r\.id and w\.surface=required\.surface/);
 assert.match(sql,/revoke all on function public\.ebay_receipt_queue_ready\(text\)/);
 assert.match(sql,/grant execute on function public\.ebay_receipt_queue_ready\(text\) to service_role/);
 assert.doesNotMatch(sql,/grant execute on function public\.ebay_receipt_queue_ready\(text\) to (anon|authenticated|public)/i);
});
