import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync} from "node:fs";
const read = path => readFileSync(new URL("../"+path,import.meta.url),"utf8");
const sql = read("supabase/migrations/20261113215000_tyres_uk_private_lease_primitives_only.sql")
 .split("\n").filter(line=>!line.trim().startsWith("--")).join("\n");
test("lease primitives never queue blocked jobs or create automated work",()=>{
 assert.match(sql,/j\.state = 'queued'/);
 assert.match(sql,/j\.state = 'running'/);
 assert.match(sql,/j\.lease_until < v_now/);
 assert.match(sql,/j\.lease_until > v_now/);
 assert.match(sql,/j\.lease_token = p_lease_token/);
 assert.match(sql,/gen_random_uuid\(\)/);
 assert.match(sql,/120 seconds/);
 assert.match(sql,/s\.status = 'paused'/);
 assert.match(sql,/s\.sync_enabled = false/);
 for(const bad of [/insert into/i,/state\s*=\s*'queued'\s*,/i,/create trigger/i,/create extension/i,/create policy/i,/update public\.feed_import_records/i,/update public\.sources/i,/create table/i,/security definer/i,/\b93988\b/,/\bcron\s*\(/i]){
  assert.doesNotMatch(sql,bad);
 }
});
test("SQL functions remain invoker and service-role only",()=>{
 assert.equal((sql.match(/security invoker/g)||[]).length,2);
 assert.match(sql,/set search_path = ''/);
 assert.match(sql,/revoke all on function public\.claim_private_tyres_uk_snapshot_job\(uuid\)\s+from PUBLIC, anon, authenticated/);
 assert.match(sql,/revoke all on function public\.renew_private_tyres_uk_snapshot_lease\(uuid,uuid\)\s+from PUBLIC, anon, authenticated/);
 assert.match(sql,/grant execute on function public\.claim_private_tyres_uk_snapshot_job\(uuid\)\s+to service_role/);
 assert.match(sql,/grant execute on function public\.renew_private_tyres_uk_snapshot_lease\(uuid,uuid\)\s+to service_role/);
});
test("existing job journal remains blocked by default and Pneus cron is preserved",()=>{
 const journal=read("supabase/migrations/20261113210500_tyres_uk_private_job_journal_only.sql");
 const cron=JSON.parse(read("vercel.json"));
 assert.match(journal,/state text not null default 'blocked'/);
 assert.equal(cron.crons.some(c=>c.path==="/api/internal/awin-pneus-private-import"),true);
 assert.equal(cron.crons.some(c=>c.path==="/api/internal/awin-tyre-auto-enrich"),false);
});
