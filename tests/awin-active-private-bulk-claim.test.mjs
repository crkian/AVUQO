import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const sql=readFileSync("supabase/migrations/20261119153000_active_awin_private_bulk_claim.sql","utf8");
const worker=readFileSync("app/api/internal/awin-pneus-private-import/route.ts","utf8");
test("active owner-authorised source can resume immutable private bulk lease",()=>{
 assert.match(sql,/claim_private_awin_bulk_job/);
 assert.match(sql,/src\.status='active'/);
 assert.match(sql,/src\.sync_enabled=true/);
 assert.match(sql,/src\.credential_status='ready'/);
 assert.match(sql,/owner_attested_release_enabled/);
 assert.match(sql,/owner_joined_accepted_attestation/);
 assert.match(sql,/membership_status'='accepted'/);
 assert.match(sql,/publication_approved'='true'/);
 assert.match(sql,/source_ingestion' and c\.enabled=true/);
 assert.match(sql,/global_emergency_stop' and c\.enabled=true/);
});
test("active claim preserves old immutable private import, lease and privilege gates",()=>{
 for(const fragment of [
 "j.state not in ('snapshot_ready','retryable','running')",
 "j.attempt_count>=20",
 "s.source_digest<>j.snapshot_sha256",
 "s.committed_count>j.validated_total",
 "r.permission_status<>'unverified'",
 "lease_expires_at=now()+make_interval",
 "revoke all on function public.claim_private_awin_bulk_job",
 "grant execute on function public.claim_private_awin_bulk_job(uuid,integer) to service_role"
 ])assert.ok(sql.includes(fragment),fragment);
 assert.doesNotMatch(sql,/update public\.(offers|published_deals)|insert into public\.(offers|published_deals)/i);
 assert.match(worker,/preparePneusPrivateBatch/);
 assert.match(worker,/no_publication:true/);
});
