-- AVUQO: additive, dormant, service-role-only Tyres UK snapshot job journal.
-- This migration creates NO worker functions, triggers, jobs, cron or supplier downloads.
-- Do not treat table existence as permission to activate PR #117.
-- Awin remains paused, with sync off and all merchant rights unverified.
create table if not exists public.awin_tyres_spec_enrichment_jobs (
 id uuid primary key default gen_random_uuid(),
 target_import_id uuid not null references public.feed_import_runs(id) on delete restrict,
 advertiser_id text not null default '12715' check(advertiser_id='12715'),
 -- Deliberately NO default feed ID. Historical 93988 must not become live by assumption.
 feed_id text not null check(feed_id ~ '^[0-9]{1,12}$'),
 source_digest text not null check(source_digest ~ '^[a-f0-9]{64}$'),
 snapshot_object_key text not null,
 source_row_count integer not null check(source_row_count between 1 and 100000),
 next_row integer not null default 0 check(next_row>=0 and next_row<=source_row_count),
 candidate_count integer not null default 0 check(candidate_count>=0),
 updated_count integer not null default 0 check(updated_count>=0),
 skipped_count integer not null default 0 check(skipped_count>=0),
 -- Newly inserted rows cannot be claimed by any worker until a separate
 -- reviewed release explicitly enables a controlled blocked -> queued step.
 state text not null default 'blocked'
  check(state in ('blocked','queued','running','completed','failed')),
 lease_token uuid,
 lease_until timestamptz,
 last_failure_code text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 completed_at timestamptz,
 unique(target_import_id,source_digest),
 check(
  snapshot_object_key =
   ('tyre-spec/'||advertiser_id||'/'||feed_id||'/'||source_digest||'.csv.gz')
 ),
 check(updated_count+skipped_count<=candidate_count),
 check((lease_token is null and lease_until is null) or
       (lease_token is not null and lease_until is not null))
);
create index if not exists awin_tyres_enrichment_state_idx
 on public.awin_tyres_spec_enrichment_jobs(state,created_at);
alter table public.awin_tyres_spec_enrichment_jobs enable row level security;
-- Deliberately no RLS policies, anon/authenticated grants, public views,
-- SECURITY DEFINER functions, or worker claims.
revoke all on table public.awin_tyres_spec_enrichment_jobs
 from PUBLIC, anon, authenticated;
grant select,insert,update on table public.awin_tyres_spec_enrichment_jobs
 to service_role;
