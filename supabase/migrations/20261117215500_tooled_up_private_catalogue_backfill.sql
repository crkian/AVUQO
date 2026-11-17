-- Durable cursor for safe backfill of the existing 84k Tooled Up import
-- into non-public canonical product drafts. A draft is NOT an offer.
create table if not exists public.awin_private_catalogue_backfill_progress(
 job_key text primary key check(job_key='tooled_up_496_89987'),
 last_record_id uuid,
 scanned bigint not null default 0 check(scanned>=0),
 attempted_drafts bigint not null default 0 check(attempted_drafts>=0),
 completed boolean not null default false,
 updated_at timestamptz not null default now()
);
alter table public.awin_private_catalogue_backfill_progress enable row level security;
revoke all on public.awin_private_catalogue_backfill_progress from public,anon,authenticated;
grant select,insert,update on public.awin_private_catalogue_backfill_progress to service_role;
comment on table public.awin_private_catalogue_backfill_progress is
 'Service-role private cursor across Tooled Up historical imported inventory; draft identities only, never public pricing or release.';
