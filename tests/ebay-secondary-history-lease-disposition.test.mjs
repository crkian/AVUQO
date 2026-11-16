import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const sql=read("supabase/migrations/20261116214000_ebay_secondary_history_lease_disposition.sql");
const sh=read("scripts/ebay-native-postgres-tests.sh");
const acceptance=read("tests/fixtures/ebay-local-secondary-disposition-acceptance.sql");
test("leased secondary assessment blocks unresolved shopper history, never deletes or completes",()=>{
 for(const text of ["w.surface='analytics_attribution'","for update;","v_work.attempts<>p_attempt",
 "v_work.lease_until<=clock_timestamp()","ebay_secondary_account_reference_counts(p_receipt_id)",
 "'SECONDARY_REVIEW_REQUIRED'","then 'blocked' else 'awaiting_evidence'",
 "v_receipt.state not in ('pending_privacy_review','processing')"])
 assert.ok(sql.includes(text),text);
 assert.match(sql,/revoke all on function public\.ebay_assess_leased_secondary_history\(bigint,integer\)/);
 assert.doesNotMatch(sql,/delete from|truncate table|update public\.ebay_deletion_receipts|grant execute|state='completed'|\bhttp_post\b/i);
});
test("actual native PostgreSQL checks blocked, zero-link evidence and stale/duplicate rejection",()=>{
 for(const part of ["20261116214000_ebay_secondary_history_lease_disposition.sql",
  "ebay-local-secondary-disposition-acceptance.sql"])
 assert.ok(sh.includes(part),part);
 for(const part of ["Linked shopper history not blocked","No unlinked account may be called verified",
 "Stale assessment was accepted","Duplicate assessment was accepted",
 "Assessment altered shopper history","Synthetic secondary disposition residue remains"])
 assert.ok(acceptance.includes(part),part);
 assert.match(acceptance,/rollback;/);
});
