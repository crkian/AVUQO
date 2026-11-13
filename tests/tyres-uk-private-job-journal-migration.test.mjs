import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync} from "node:fs";

const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const sql=read("supabase/migrations/20261113210500_tyres_uk_private_job_journal_only.sql");

test("snapshot job migration is additive, empty, default blocked and never trusts old 93988 feed",()=>{
 assert.match(sql,/create table public\.awin_tyres_spec_enrichment_jobs \(/);
 assert.match(sql,/references public\.feed_import_runs\(id\) on delete restrict/);
 assert.match(sql,/feed_id text not null check/);
 assert.doesNotMatch(sql,/default ['"]93988['"]/);
 assert.match(sql,/state text not null default 'blocked'/);
 assert.match(sql,/unique\(target_import_id,source_digest\)/);
 assert.match(sql,/snapshot_object_key =/);
 assert.match(sql,/source_digest.*\[a-f0-9\]/);
 assert.match(sql,/next_row<=source_row_count/);
 assert.doesNotMatch(sql,/\binsert into\b|\bupdate public\.|\bdelete from\b/i);
});
test("job journal not exposed to browser roles or executable write RPCs",()=>{
 assert.match(sql,/enable row level security/);
 assert.match(sql,/revoke all on table public\.awin_tyres_spec_enrichment_jobs\s+from PUBLIC, anon, authenticated/);
 assert.match(sql,/grant select,insert,update on table public\.awin_tyres_spec_enrichment_jobs\s+to service_role/);
 assert.doesNotMatch(sql,/create policy|grant .+ authenticated|security definer|create or replace function/i);
});
test("migration has no effect on legacy private recovery, public offers or scheduler",()=>{
 const schedule=read("vercel.json");
 assert.doesNotMatch(schedule,/awin-tyre-auto-enrich/);
 const route=read("app/api/control-centre/tyre-spec-enrichment/route.ts");
 assert.match(route,/ready_to_enable:false/);
 assert.match(route,/no_database_writes:true/);
 assert.match(route,/action==="automation_preflight"/);
 for(const banned of [/create trigger/i,/create extension/i,/alter table public\.sources/i,/alter table public\.feed_import_records/i,/drop table/i,/create or replace function/i,/storage\.objects/i]){
  assert.doesNotMatch(sql,banned);
 }
});
