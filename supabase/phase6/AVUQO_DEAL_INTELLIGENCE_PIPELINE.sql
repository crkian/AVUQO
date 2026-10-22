-- AVUQO v0.6 Deal Intelligence Pipeline
-- Additive migration. Run AFTER the v0.5 major build migration.
-- No existing consumer data is intentionally deleted.

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- CANONICAL PRODUCT / SCORE VERSIONING
-- -----------------------------------------------------------------------------
alter table if exists public.products
  add column if not exists canonical_key text;

create unique index if not exists products_canonical_key_uidx
  on public.products(canonical_key)
  where canonical_key is not null;

alter table if exists public.deal_scores
  add column if not exists score_version text not null default 'legacy';

create unique index if not exists product_matches_source_offer_uidx
  on public.product_matches(source_id, source_offer_id);

create unique index if not exists promotion_candidates_offer_channel_uidx
  on public.promotion_candidates(offer_id, target_channel);

-- -----------------------------------------------------------------------------
-- RAW / NORMALISED INGESTION EVIDENCE
-- -----------------------------------------------------------------------------
create table if not exists public.source_ingestion_items (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.source_sync_runs(id) on delete cascade,
  source_id uuid not null references public.sources(id) on delete cascade,
  source_record_id text not null,
  raw_data jsonb not null default '{}'::jsonb,
  normalized_data jsonb not null default '{}'::jsonb,
  status text not null default 'received',
  error_message text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique(run_id, source_record_id)
);

create index if not exists source_ingestion_items_source_status_idx
  on public.source_ingestion_items(source_id, status, received_at desc);

create table if not exists public.pipeline_events (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.source_sync_runs(id) on delete cascade,
  event_type text not null,
  level text not null default 'info',
  entity_type text,
  entity_id text,
  message text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists pipeline_events_run_time_idx
  on public.pipeline_events(run_id, created_at desc);

create index if not exists pipeline_events_level_time_idx
  on public.pipeline_events(level, created_at desc);

-- -----------------------------------------------------------------------------
-- PUBLICATION LAYER
-- Keeps raw offers / affiliate destinations separate from public deal cards.
-- -----------------------------------------------------------------------------
create table if not exists public.published_deals (
  offer_id uuid primary key references public.offers(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  title text not null,
  category text not null,
  merchant text not null,
  current_price numeric(12,2) not null,
  typical_price numeric(12,2),
  saving_amount numeric(12,2) not null default 0,
  avuqo_score integer not null check (avuqo_score between 0 and 100),
  confidence numeric(5,2) not null check (confidence between 0 and 100),
  label text not null,
  decision text,
  image_url text,
  stock_status text not null default 'unknown',
  reason text,
  status text not null default 'held' check (status in ('published','held','expired')),
  published_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists published_deals_score_idx
  on public.published_deals(status, avuqo_score desc, updated_at desc);

-- -----------------------------------------------------------------------------
-- ATTRIBUTION ENRICHMENT
-- -----------------------------------------------------------------------------
alter table if exists public.click_events
  add column if not exists attribution_key uuid not null default gen_random_uuid();

create unique index if not exists click_events_attribution_key_uidx
  on public.click_events(attribution_key);

-- -----------------------------------------------------------------------------
-- RLS: PRIVATE PIPELINE EVIDENCE
-- -----------------------------------------------------------------------------
alter table public.source_ingestion_items enable row level security;
alter table public.pipeline_events enable row level security;

revoke all on table public.source_ingestion_items, public.pipeline_events from anon, authenticated;
grant select, insert, update, delete on table public.source_ingestion_items, public.pipeline_events to authenticated;

drop policy if exists "avuqo admin pipeline items" on public.source_ingestion_items;
create policy "avuqo admin pipeline items"
on public.source_ingestion_items
for all
to authenticated
using (private.is_avuqo_admin())
with check (private.is_avuqo_admin());

drop policy if exists "avuqo admin pipeline events" on public.pipeline_events;
create policy "avuqo admin pipeline events"
on public.pipeline_events
for all
to authenticated
using (private.is_avuqo_admin())
with check (private.is_avuqo_admin());

-- -----------------------------------------------------------------------------
-- RLS: PUBLIC DEAL OUTPUT + ADMIN MANAGEMENT
-- -----------------------------------------------------------------------------
alter table public.published_deals enable row level security;
revoke all on table public.published_deals from anon, authenticated;
grant select on table public.published_deals to anon, authenticated;
grant insert, update, delete on table public.published_deals to authenticated;

drop policy if exists "published deals public read" on public.published_deals;
create policy "published deals public read"
on public.published_deals
for select
to anon, authenticated
using (status = 'published');

drop policy if exists "published deals admin manage" on public.published_deals;
create policy "published deals admin manage"
on public.published_deals
for all
to authenticated
using (private.is_avuqo_admin())
with check (private.is_avuqo_admin());

-- -----------------------------------------------------------------------------
-- CONNECTOR REGISTRY / HEALTH
-- -----------------------------------------------------------------------------
insert into public.sources(
  name, source_type, country_code, status, reliability_score,
  connector_key, sync_enabled, credential_status, health_status, metadata
)
values (
  'AVUQO Demo Feed', 'internal_test', 'GB', 'active', 88,
  'demo', true, 'ready', 'healthy',
  '{"stage":"pipeline-test","synthetic":true}'::jsonb
)
on conflict do nothing;

update public.sources
set metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
      'feed_mode', 'enhanced-google-jsonl',
      'pipeline_version', 'v0.6',
      'credential_storage', 'server-environment'
    ),
    updated_at = now()
where connector_key = 'awin';

insert into public.system_health(component,status,message,metrics)
values (
  'deal-intelligence-pipeline',
  'ready',
  'v0.6 pipeline schema installed. Run the demo feed before enabling a live connector.',
  '{"pipeline_version":"v0.6"}'::jsonb
)
on conflict(component) do update
set status = excluded.status,
    message = excluded.message,
    metrics = excluded.metrics,
    last_checked_at = now();

insert into public.feature_flags(flag_key,enabled,description)
values (
  'live_pipeline_deals',
  true,
  'Expose only published_deals output from the verified Deal Intelligence Pipeline.'
)
on conflict(flag_key) do update
set enabled = excluded.enabled,
    description = excluded.description,
    updated_at = now();
