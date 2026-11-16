import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const sql=read("supabase/migrations/20261116221000_ebay_readonly_mapped_erasure_preview.sql");
const runner=read("scripts/ebay-native-postgres-tests.sh");
const acc=read("tests/fixtures/ebay-local-readonly-erasure-preview-acceptance.sql");
test("DBA-only one-candidate read-only preview never approves deletion",()=>{
 for(const s of [
  "create function public.ebay_preview_next_mapped_erasure()",
  "stable security definer",
  "s.status='paused' and s.sync_enabled=false",
  "w.surface='mapped_catalogue'",
  "w.state='pending'",
  "v_counts.has_unresolved_secondary_records",
  "'REVIEW_REQUIRED'",
  "'CANDIDATE_ONLY_NOT_AUTHORISED'",
  "'SOURCE_NOT_QUARANTINED'",
  "'NO_ELIGIBLE_PENDING_WORK'",
  "revoke all on function public.ebay_preview_next_mapped_erasure()"
 ])assert.ok(sql.includes(s),s);
 assert.doesNotMatch(sql,/\b(insert into|update public\.|delete from|truncate|grant execute|pg_notify|http_post)\b/i);
 assert.doesNotMatch(sql,/return query select v_receipt_id|notification_digest|identity_digest/);
});
test("full native PostgreSQL suite tests count-only preview without changing work",()=>{
 for(const file of ["20261116221000_ebay_readonly_mapped_erasure_preview.sql",
  "ebay-local-readonly-erasure-preview-acceptance.sql"])assert.ok(runner.includes(file));
 for(const marker of [
  "Read-only preview changed work-item attempt",
  "Related shopper history must require review",
  "Never auto-authorise deletion",
  "Preview exposed wrong source when enabled",
  "Synthetic preview test residue remains"
 ])assert.ok(acc.includes(marker));
 assert.match(acc,/rollback;/);
});
