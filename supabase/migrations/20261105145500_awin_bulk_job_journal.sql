-- Inert, private-only journal for future durable Awin bulk imports.
-- No worker, cron or enqueue endpoint is enabled by this migration.
-- Never store signed feed URLs, API keys or row payloads here.
create table if not exists public.awin_bulk_import_jobs (
  id uuid primary key default gen_random_uuid(),
  advertiser_id text not null check (advertiser_id ~ '^[0-9]{1,9}$'),
  feed_id text not null check (feed_id ~ '^[0-9]{1,30}$'),
  state text not null default 'planned' check (
    state in ('planned','blocked','snapshot_ready','running','retryable','completed','failed','cancelled')
  ),
  snapshot_sha256 text check (snapshot_sha256 is null or snapshot_sha256 ~ '^[a-f0-9]{64}$'),
  -- Stable object identifier ONLY, never signed download URL or credentials.
  snapshot_object_key text check (
    snapshot_object_key is null or
    (length(snapshot_object_key) between 1 and 255
     and snapshot_object_key ~ '^[A-Za-z0-9_./-]+$')
  ),
  observed_rows integer check (observed_rows is null or observed_rows between 1 and 500000),
  validated_total integer check (validated_total is null or validated_total between 1 and 500000),
  chunk_size integer not null default 250 check (chunk_size = 250),
  next_sequence integer not null default 0 check (next_sequence between 0 and 2000),
  committed_rows integer not null default 0 check (committed_rows between 0 and 500000),
  attempt_count integer not null default 0 check (attempt_count between 0 and 100),
  lease_expires_at timestamptz,
  last_failure_code text check (
    last_failure_code is null or
    (length(last_failure_code) <= 80 and last_failure_code ~ '^[a-z0-9_]+$')
  ),
  private_import_id uuid references public.feed_import_runs(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint awin_bulk_jobs_snapshot_pair check (
    (snapshot_sha256 is null and snapshot_object_key is null)
    or (snapshot_sha256 is not null and snapshot_object_key is not null)
  ),
  constraint awin_bulk_jobs_checkpoint_bound check (
    committed_rows <= next_sequence * chunk_size
    and (validated_total is null or committed_rows <= validated_total)
  ),
  constraint awin_bulk_jobs_running_snapshot check (
    state not in ('snapshot_ready','running','retryable','completed')
    or (snapshot_sha256 is not null and snapshot_object_key is not null
        and validated_total is not null and private_import_id is not null)
  ),
  constraint awin_bulk_jobs_completed_count check (
    state <> 'completed' or
    (completed_at is not null and committed_rows = validated_total)
  )
);
create unique index if not exists awin_bulk_jobs_snapshot_identity
  on public.awin_bulk_import_jobs(advertiser_id,feed_id,snapshot_sha256)
  where snapshot_sha256 is not null;
create index if not exists awin_bulk_jobs_state_created
  on public.awin_bulk_import_jobs(state,created_at);
alter table public.awin_bulk_import_jobs enable row level security;
revoke all on public.awin_bulk_import_jobs from public, anon, authenticated;
grant select,insert,update on public.awin_bulk_import_jobs to service_role;
comment on table public.awin_bulk_import_jobs is
 'Private inert bulk-job journal only. No automatic execution, publishing, or source URLs.';
