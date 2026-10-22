-- AVUQO Major Build v0.5
-- Additive consolidation migration. Designed to follow the original AVUQO schema,
-- Phase 2 Watches, Phase 3 Promotion Engine and Phase 4 Control Centre security.
-- It does NOT reset consumer data.

create extension if not exists pgcrypto;
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

-- -----------------------------------------------------------------------------
-- CORE CATALOGUE ENRICHMENT
-- -----------------------------------------------------------------------------
alter table if exists public.products add column if not exists product_type text not null default 'product';
alter table if exists public.products add column if not exists canonical_url text;
alter table if exists public.products add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table if exists public.merchants add column if not exists affiliate_eligible boolean not null default false;
alter table if exists public.merchants add column if not exists returns_quality_score numeric(5,2);
alter table if exists public.merchants add column if not exists delivery_quality_score numeric(5,2);

alter table if exists public.sources add column if not exists connector_key text;
alter table if exists public.sources add column if not exists sync_enabled boolean not null default true;
alter table if exists public.sources add column if not exists priority integer not null default 50;
alter table if exists public.sources add column if not exists credential_status text not null default 'not_configured';
alter table if exists public.sources add column if not exists health_status text not null default 'unknown';
alter table if exists public.sources add column if not exists mapping_version integer not null default 1;
create unique index if not exists sources_connector_key_uidx on public.sources(connector_key) where connector_key is not null;

create table if not exists public.availability (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.offers(id) on delete cascade,
  stock_status text not null default 'unknown',
  quantity integer,
  lead_time_days integer,
  delivery_summary text,
  available_from timestamptz,
  available_until timestamptz,
  observed_at timestamptz not null default now(),
  raw_data jsonb not null default '{}'::jsonb
);
create index if not exists availability_offer_time_idx on public.availability(offer_id, observed_at desc);

create table if not exists public.product_matches (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.sources(id) on delete cascade,
  source_offer_id text,
  product_id uuid references public.products(id) on delete cascade,
  match_method text not null,
  confidence numeric(5,2) not null default 0 check (confidence between 0 and 100),
  status text not null default 'candidate',
  evidence jsonb not null default '{}'::jsonb,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists product_matches_candidate_idx on public.product_matches(status, confidence desc);

create table if not exists public.source_sync_runs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources(id) on delete cascade,
  status text not null default 'running',
  records_seen integer not null default 0,
  records_accepted integer not null default 0,
  records_rejected integer not null default 0,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  error_summary text,
  metrics jsonb not null default '{}'::jsonb
);
create index if not exists source_sync_runs_source_time_idx on public.source_sync_runs(source_id, started_at desc);

create table if not exists public.source_mappings (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources(id) on delete cascade,
  entity_type text not null,
  source_field text not null,
  avuqo_field text not null,
  transform_rule jsonb not null default '{}'::jsonb,
  is_required boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(source_id, entity_type, source_field)
);

-- -----------------------------------------------------------------------------
-- PERSONAL AVUQO
-- -----------------------------------------------------------------------------
create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stable_preferences jsonb not null default '{}'::jsonb,
  current_mission jsonb not null default '{}'::jsonb,
  mission_expires_at timestamptz,
  notification_budget jsonb not null default '{}'::jsonb,
  recommendation_controls jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_behaviour (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  session_id text,
  event_type text not null,
  entity_type text,
  entity_key text,
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists user_behaviour_user_time_idx on public.user_behaviour(user_id, created_at desc);

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  unique(household_id, user_id)
);

-- Saved can now persist fixture/external items before a canonical product match exists.
alter table if exists public.saved_items alter column product_id drop not null;
alter table if exists public.saved_items add column if not exists item_key text;
alter table if exists public.saved_items add column if not exists title_snapshot text;
alter table if exists public.saved_items add column if not exists category_snapshot text;
alter table if exists public.saved_items add column if not exists merchant_snapshot text;
alter table if exists public.saved_items add column if not exists snapshot jsonb not null default '{}'::jsonb;
create unique index if not exists saved_items_user_item_key_uidx on public.saved_items(user_id, item_key) where item_key is not null;

alter table if exists public.shared_list_items add column if not exists item_key text;
alter table if exists public.shared_list_items add column if not exists snapshot jsonb not null default '{}'::jsonb;
create unique index if not exists shared_list_items_list_item_key_uidx on public.shared_list_items(list_id, item_key) where item_key is not null;

create table if not exists public.shared_list_votes (
  id uuid primary key default gen_random_uuid(),
  list_item_id uuid not null references public.shared_list_items(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  vote smallint not null check (vote in (-1, 1)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(list_item_id, user_id)
);

create table if not exists public.shared_list_comments (
  id uuid primary key default gen_random_uuid(),
  list_item_id uuid not null references public.shared_list_items(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  notification_type text not null,
  title text not null,
  body text,
  action_url text,
  priority text not null default 'normal',
  status text not null default 'unread',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists notifications_user_status_idx on public.notifications(user_id, status, created_at desc);

create table if not exists public.reality_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  submitted_url text not null,
  detected_domain text,
  merchant_id uuid references public.merchants(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  status text not null default 'queued',
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- -----------------------------------------------------------------------------
-- TRUST, FEEDBACK, SEASONAL AND SYSTEM STATE
-- -----------------------------------------------------------------------------
create table if not exists public.feedback_reputation (
  id uuid primary key default gen_random_uuid(),
  feedback_type text not null,
  outcome text not null,
  count integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique(feedback_type, outcome)
);

create table if not exists public.trust_metric_snapshots (
  id bigint generated always as identity primary key,
  metric_key text not null,
  metric_value numeric(16,4) not null,
  period_start date,
  period_end date,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists trust_metric_key_time_idx on public.trust_metric_snapshots(metric_key, created_at desc);

create table if not exists public.system_controls (
  control_key text primary key,
  enabled boolean not null default true,
  description text,
  settings jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.seasonal_events (
  id uuid primary key default gen_random_uuid(),
  event_key text not null unique,
  name text not null,
  region text not null default 'GB',
  start_date date,
  peak_date date,
  end_date date,
  preparation_lead_days integer not null default 21,
  status text not null default 'planned',
  rules jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.feature_flags (
  flag_key text primary key,
  enabled boolean not null default false,
  description text,
  audience jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.system_health (
  component text primary key,
  status text not null default 'unknown',
  last_checked_at timestamptz not null default now(),
  last_success_at timestamptz,
  message text,
  metrics jsonb not null default '{}'::jsonb
);

-- -----------------------------------------------------------------------------
-- TRAVEL FOUNDATION
-- -----------------------------------------------------------------------------
create table if not exists public.airports (
  id uuid primary key default gen_random_uuid(),
  iata_code text unique,
  name text not null,
  city text,
  country_code text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.destinations (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  name text not null,
  country_code text,
  region text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.hotels (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid references public.destinations(id) on delete set null,
  name text not null,
  star_rating numeric(2,1),
  latitude numeric(10,7),
  longitude numeric(10,7),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.travel_offers (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.sources(id) on delete restrict,
  merchant_id uuid references public.merchants(id) on delete restrict,
  destination_id uuid references public.destinations(id) on delete set null,
  hotel_id uuid references public.hotels(id) on delete set null,
  travel_type text not null,
  title text not null,
  departure_airport_id uuid references public.airports(id) on delete set null,
  departure_date date,
  return_date date,
  nights integer,
  adults integer,
  children integer,
  board_type text,
  room_type text,
  price numeric(12,2) not null,
  currency text not null default 'GBP',
  affiliate_url text,
  source_url text,
  availability_status text not null default 'unknown',
  raw_data jsonb not null default '{}'::jsonb,
  observed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.travel_price_history (
  id bigint generated always as identity primary key,
  travel_offer_id uuid not null references public.travel_offers(id) on delete cascade,
  price numeric(12,2) not null,
  currency text not null default 'GBP',
  observed_at timestamptz not null default now()
);
create index if not exists travel_price_history_offer_time_idx on public.travel_price_history(travel_offer_id, observed_at desc);

-- -----------------------------------------------------------------------------
-- PROMOTION / AFFILIATE COMPATIBILITY
-- -----------------------------------------------------------------------------
create table if not exists public.affiliate_programs (
  id uuid primary key default gen_random_uuid(), provider text not null, programme_name text not null,
  external_account_id text, region text, status text not null default 'pending',
  direct_social_links_permitted boolean, avuqo_landing_pages_permitted boolean,
  image_usage_rule text, disclosure_template text, terms_checked_at timestamptz,
  metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.channel_connections (
  id uuid primary key default gen_random_uuid(), channel text not null, account_label text not null,
  external_account_id text, status text not null default 'disconnected', publishing_enabled boolean not null default false,
  requires_manual_approval boolean not null default true, scopes jsonb not null default '[]'::jsonb,
  last_verified_at timestamptz, metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.publishing_rules (
  id uuid primary key default gen_random_uuid(), scope_key text not null unique,
  minimum_avuqo_score integer not null default 75, minimum_confidence numeric(5,2) not null default 65,
  minimum_promotion_score integer not null default 68, require_approval boolean not null default true,
  daily_post_limit integer not null default 5, monthly_budget numeric(12,2) not null default 0,
  emergency_stop boolean not null default false, merchant_exclusions jsonb not null default '[]'::jsonb,
  category_exclusions jsonb not null default '[]'::jsonb, platform_rules jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.promotion_candidates (
  id uuid primary key default gen_random_uuid(), product_id uuid references public.products(id) on delete cascade,
  offer_id uuid references public.offers(id) on delete cascade, affiliate_program_id uuid references public.affiliate_programs(id) on delete set null,
  target_channel text not null, avuqo_score integer not null check (avuqo_score between 0 and 100),
  avuqo_confidence numeric(5,2) not null check (avuqo_confidence between 0 and 100), promotion_score integer,
  promotion_tier text, destination_type text not null default 'avuqo', affiliate_eligible boolean not null default false,
  compliance_clear boolean not null default false, status text not null default 'candidate', rationale jsonb not null default '{}'::jsonb,
  economics jsonb not null default '{}'::jsonb, evaluated_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table if exists public.promotion_candidates add column if not exists title_snapshot text;
alter table if exists public.promotion_candidates add column if not exists merchant_snapshot text;
alter table if exists public.promotion_candidates add column if not exists category_snapshot text;

create table if not exists public.affiliate_conversions (
  id uuid primary key default gen_random_uuid(), affiliate_program_id uuid references public.affiliate_programs(id) on delete restrict,
  campaign_id uuid, publication_id uuid, external_transaction_id text not null,
  merchant_name text, order_value numeric(12,2), estimated_commission numeric(12,2), confirmed_commission numeric(12,2),
  currency text not null default 'GBP', status text not null default 'estimated', ordered_at timestamptz,
  confirmed_at timestamptz, refunded_at timestamptz, raw_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), unique(affiliate_program_id, external_transaction_id)
);

-- -----------------------------------------------------------------------------
-- ROLE / SECURITY HELPERS
-- -----------------------------------------------------------------------------
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'customer' check (role in ('customer','admin','owner')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create or replace function private.is_avuqo_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.user_roles r
    where r.user_id = auth.uid() and r.role in ('admin','owner')
  );
$$;
revoke all on function private.is_avuqo_admin() from public;
grant execute on function private.is_avuqo_admin() to authenticated;

create or replace function private.user_shared_list_ids()
returns setof uuid language sql stable security definer set search_path = '' as $$
  select l.id from public.shared_lists l where l.owner_id = auth.uid()
  union
  select m.list_id from public.shared_list_members m where m.user_id = auth.uid();
$$;
revoke all on function private.user_shared_list_ids() from public;
grant execute on function private.user_shared_list_ids() to authenticated;

create or replace function private.user_shared_list_item_ids()
returns setof uuid language sql stable security definer set search_path = '' as $$
  select i.id from public.shared_list_items i
  where i.list_id in (select private.user_shared_list_ids());
$$;
revoke all on function private.user_shared_list_item_ids() from public;
grant execute on function private.user_shared_list_item_ids() to authenticated;

-- Keep the old Phase 4 helper safe if it exists / is referenced by an older policy.
create or replace function public.is_avuqo_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select private.is_avuqo_admin();
$$;
revoke all on function public.is_avuqo_admin() from public;
grant execute on function public.is_avuqo_admin() to authenticated;

-- -----------------------------------------------------------------------------
-- RLS: USER DATA
-- -----------------------------------------------------------------------------
alter table public.user_roles enable row level security;
revoke all on public.user_roles from anon, authenticated;
grant select on public.user_roles to authenticated;
drop policy if exists "users can read own role" on public.user_roles;
create policy "users can read own role" on public.user_roles for select to authenticated using (auth.uid() = user_id);

alter table public.user_preferences enable row level security;
grant select,insert,update,delete on public.user_preferences to authenticated;
drop policy if exists "preferences own" on public.user_preferences;
create policy "preferences own" on public.user_preferences for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);

alter table public.user_behaviour enable row level security;
grant select,insert,delete on public.user_behaviour to authenticated;
drop policy if exists "behaviour own" on public.user_behaviour;
create policy "behaviour own" on public.user_behaviour for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);

alter table public.saved_items enable row level security;
grant select,insert,update,delete on public.saved_items to authenticated;
drop policy if exists "saved select own" on public.saved_items;
drop policy if exists "saved insert own" on public.saved_items;
drop policy if exists "saved update own" on public.saved_items;
drop policy if exists "saved delete own" on public.saved_items;
create policy "saved select own" on public.saved_items for select to authenticated using (auth.uid()=user_id);
create policy "saved insert own" on public.saved_items for insert to authenticated with check (auth.uid()=user_id);
create policy "saved update own" on public.saved_items for update to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "saved delete own" on public.saved_items for delete to authenticated using (auth.uid()=user_id);

alter table public.reality_checks enable row level security;
grant select,insert,delete on public.reality_checks to authenticated;
drop policy if exists "reality checks own" on public.reality_checks;
create policy "reality checks own" on public.reality_checks for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);

alter table public.notifications enable row level security;
grant select,update,delete on public.notifications to authenticated;
drop policy if exists "notifications own select" on public.notifications;
drop policy if exists "notifications own update" on public.notifications;
drop policy if exists "notifications own delete" on public.notifications;
create policy "notifications own select" on public.notifications for select to authenticated using (auth.uid()=user_id);
create policy "notifications own update" on public.notifications for update to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "notifications own delete" on public.notifications for delete to authenticated using (auth.uid()=user_id);

-- Households: owner management for now. Richer delegated household permissions can be layered later.
alter table public.households enable row level security;
alter table public.household_members enable row level security;
grant select,insert,update,delete on public.households, public.household_members to authenticated;
drop policy if exists "households owner" on public.households;
create policy "households owner" on public.households for all to authenticated using (auth.uid()=owner_id) with check (auth.uid()=owner_id);
drop policy if exists "household members owner manage" on public.household_members;
create policy "household members owner manage" on public.household_members for all to authenticated
using (exists(select 1 from public.households h where h.id=household_id and h.owner_id=auth.uid()))
with check (exists(select 1 from public.households h where h.id=household_id and h.owner_id=auth.uid()));

-- Shared Lists: replace recursive member/list policies with security-definer access helpers.
alter table public.shared_lists enable row level security;
alter table public.shared_list_members enable row level security;
alter table public.shared_list_items enable row level security;
alter table public.shared_list_votes enable row level security;
alter table public.shared_list_comments enable row level security;
grant select,insert,update,delete on public.shared_lists,public.shared_list_members,public.shared_list_items,public.shared_list_votes,public.shared_list_comments to authenticated;

drop policy if exists "lists select owner or member" on public.shared_lists;
drop policy if exists "lists insert own" on public.shared_lists;
drop policy if exists "lists update owner" on public.shared_lists;
drop policy if exists "lists delete owner" on public.shared_lists;
drop policy if exists "members select list access" on public.shared_list_members;
drop policy if exists "members owner manages" on public.shared_list_members;
drop policy if exists "members owner updates" on public.shared_list_members;
drop policy if exists "members owner deletes" on public.shared_list_members;
drop policy if exists "list items select access" on public.shared_list_items;
drop policy if exists "list items insert access" on public.shared_list_items;
drop policy if exists "list items update access" on public.shared_list_items;
drop policy if exists "list items delete access" on public.shared_list_items;

create policy "lists access read" on public.shared_lists for select to authenticated using (id in (select private.user_shared_list_ids()));
create policy "lists owner insert" on public.shared_lists for insert to authenticated with check (owner_id=auth.uid());
create policy "lists owner update" on public.shared_lists for update to authenticated using (owner_id=auth.uid()) with check (owner_id=auth.uid());
create policy "lists owner delete" on public.shared_lists for delete to authenticated using (owner_id=auth.uid());
create policy "members access read" on public.shared_list_members for select to authenticated using (list_id in (select private.user_shared_list_ids()));
create policy "members owner insert" on public.shared_list_members for insert to authenticated with check (exists(select 1 from public.shared_lists l where l.id=list_id and l.owner_id=auth.uid()));
create policy "members owner update" on public.shared_list_members for update to authenticated using (exists(select 1 from public.shared_lists l where l.id=list_id and l.owner_id=auth.uid()));
create policy "members owner delete" on public.shared_list_members for delete to authenticated using (user_id=auth.uid() or exists(select 1 from public.shared_lists l where l.id=list_id and l.owner_id=auth.uid()));
create policy "items access read" on public.shared_list_items for select to authenticated using (list_id in (select private.user_shared_list_ids()));
create policy "items access insert" on public.shared_list_items for insert to authenticated with check (list_id in (select private.user_shared_list_ids()));
create policy "items access update" on public.shared_list_items for update to authenticated using (list_id in (select private.user_shared_list_ids())) with check (list_id in (select private.user_shared_list_ids()));
create policy "items access delete" on public.shared_list_items for delete to authenticated using (list_id in (select private.user_shared_list_ids()));
drop policy if exists "votes access" on public.shared_list_votes;
drop policy if exists "votes access read" on public.shared_list_votes;
drop policy if exists "votes own insert" on public.shared_list_votes;
drop policy if exists "votes own update" on public.shared_list_votes;
drop policy if exists "votes own delete" on public.shared_list_votes;
create policy "votes access read" on public.shared_list_votes for select to authenticated using (list_item_id in (select private.user_shared_list_item_ids()));
create policy "votes own insert" on public.shared_list_votes for insert to authenticated with check (list_item_id in (select private.user_shared_list_item_ids()) and user_id=auth.uid());
create policy "votes own update" on public.shared_list_votes for update to authenticated using (list_item_id in (select private.user_shared_list_item_ids()) and user_id=auth.uid()) with check (list_item_id in (select private.user_shared_list_item_ids()) and user_id=auth.uid());
create policy "votes own delete" on public.shared_list_votes for delete to authenticated using (list_item_id in (select private.user_shared_list_item_ids()) and user_id=auth.uid());
create policy "comments access read" on public.shared_list_comments for select to authenticated using (list_item_id in (select private.user_shared_list_item_ids()));
create policy "comments access insert" on public.shared_list_comments for insert to authenticated with check (list_item_id in (select private.user_shared_list_item_ids()) and user_id=auth.uid());
create policy "comments own update" on public.shared_list_comments for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "comments own delete" on public.shared_list_comments for delete to authenticated using (user_id=auth.uid());

-- -----------------------------------------------------------------------------
-- RLS: PUBLIC CATALOGUE EXTENSIONS
-- -----------------------------------------------------------------------------
alter table public.availability enable row level security;
alter table public.travel_offers enable row level security;
alter table public.travel_price_history enable row level security;
alter table public.airports enable row level security;
alter table public.destinations enable row level security;
alter table public.hotels enable row level security;
grant select on public.availability,public.travel_offers,public.travel_price_history,public.airports,public.destinations,public.hotels to anon,authenticated;
drop policy if exists "availability public read" on public.availability;
create policy "availability public read" on public.availability for select to anon,authenticated using (true);
drop policy if exists "travel offers public read" on public.travel_offers;
create policy "travel offers public read" on public.travel_offers for select to anon,authenticated using (true);
drop policy if exists "travel history public read" on public.travel_price_history;
create policy "travel history public read" on public.travel_price_history for select to anon,authenticated using (true);
drop policy if exists "airports public read" on public.airports;
create policy "airports public read" on public.airports for select to anon,authenticated using (true);
drop policy if exists "destinations public read" on public.destinations;
create policy "destinations public read" on public.destinations for select to anon,authenticated using (true);
drop policy if exists "hotels public read" on public.hotels;
create policy "hotels public read" on public.hotels for select to anon,authenticated using (true);

-- -----------------------------------------------------------------------------
-- RLS: ADMIN / CONTROL CENTRE TABLES
-- -----------------------------------------------------------------------------
-- Sources are operational metadata. Only admin/owner can access the registry.
revoke all on public.sources from anon, authenticated;
grant select,insert,update,delete on public.sources to authenticated;
drop policy if exists "sources public read" on public.sources;
drop policy if exists "sources admin read" on public.sources;
drop policy if exists "sources admin insert" on public.sources;
drop policy if exists "sources admin update" on public.sources;
drop policy if exists "sources admin delete" on public.sources;
create policy "sources admin read" on public.sources for select to authenticated using (private.is_avuqo_admin());
create policy "sources admin insert" on public.sources for insert to authenticated with check (private.is_avuqo_admin());
create policy "sources admin update" on public.sources for update to authenticated using (private.is_avuqo_admin()) with check (private.is_avuqo_admin());
create policy "sources admin delete" on public.sources for delete to authenticated using (private.is_avuqo_admin());

-- Product matches are operational, not public.
-- The DO block handles only tables that exist, making this migration tolerant of phase ordering.
do $$
declare t text;
begin
  foreach t in array array[
    'product_matches','source_sync_runs','source_mappings','feedback_reputation','trust_metric_snapshots',
    'system_controls','seasonal_events','feature_flags','system_health','affiliate_programs','channel_connections',
    'publishing_rules','promotion_candidates','promotion_score_components','compliance_checks','campaigns','campaign_items',
    'creative_assets','scheduled_publications','attribution_events','affiliate_conversions','revenue_reconciliations',
    'promotion_experiments','exceptions','automation_jobs','audit_logs'
  ] loop
    if to_regclass('public.'||t) is not null then
      execute format('alter table public.%I enable row level security',t);
      execute format('revoke all on table public.%I from anon, authenticated',t);
      execute format('grant select,insert,update,delete on table public.%I to authenticated',t);
      execute format('drop policy if exists "avuqo admin control" on public.%I',t);
      execute format('drop policy if exists "control centre admin select" on public.%I',t);
      execute format('drop policy if exists "control centre admin insert" on public.%I',t);
      execute format('drop policy if exists "control centre admin update" on public.%I',t);
      execute format('drop policy if exists "control centre admin delete" on public.%I',t);
      execute format('create policy "control centre admin select" on public.%I for select to authenticated using (private.is_avuqo_admin())',t);
      execute format('create policy "control centre admin insert" on public.%I for insert to authenticated with check (private.is_avuqo_admin())',t);
      execute format('create policy "control centre admin update" on public.%I for update to authenticated using (private.is_avuqo_admin()) with check (private.is_avuqo_admin())',t);
      execute format('create policy "control centre admin delete" on public.%I for delete to authenticated using (private.is_avuqo_admin())',t);
    end if;
  end loop;
end $$;

grant usage, select on all sequences in schema public to authenticated;

-- -----------------------------------------------------------------------------
-- AUTH BOOTSTRAP
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_avuqo_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id,display_name)
  values(new.id,coalesce(new.raw_user_meta_data->>'full_name',new.raw_user_meta_data->>'name'))
  on conflict(id) do nothing;
  insert into public.user_roles(user_id,role) values(new.id,'customer') on conflict(user_id) do nothing;
  insert into public.user_preferences(user_id) values(new.id) on conflict(user_id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_auth_user_created_avuqo_role on auth.users;
drop trigger if exists on_auth_user_created_avuqo on auth.users;
create trigger on_auth_user_created_avuqo after insert on auth.users for each row execute function public.handle_new_avuqo_user();

insert into public.user_roles(user_id,role) select id,'customer' from auth.users on conflict(user_id) do nothing;
insert into public.user_preferences(user_id) select id from auth.users on conflict(user_id) do nothing;

-- -----------------------------------------------------------------------------
-- DEFAULT CONTROL / SEASONAL STATE
-- -----------------------------------------------------------------------------
insert into public.system_controls(control_key,enabled,description) values
 ('source_ingestion',true,'Allow approved source connectors to ingest and refresh data.'),
 ('deal_publishing',true,'Allow verified deals to appear on consumer surfaces.'),
 ('notifications',true,'Allow watch and account notification workers to send eligible alerts.'),
 ('social_promotion',false,'Allow external social publication. Keep disabled until channel credentials and approval rules are validated.'),
 ('global_emergency_stop',false,'Emergency stop for automated external actions.')
on conflict(control_key) do nothing;

insert into public.feature_flags(flag_key,enabled,description) values
 ('reality_check_remote_verification',false,'Safe remote Reality Check worker is not enabled until allow-listing and SSRF controls are deployed.'),
 ('automatic_social_publishing',false,'Unattended social publishing remains disabled during initial validation.'),
 ('personal_intelligence_learning',false,'Behavioural learning remains opt-in / staged while preference controls are developed.')
on conflict(flag_key) do nothing;

insert into public.seasonal_events(event_key,name,region,preparation_lead_days,status) values
 ('black-friday-gb','Black Friday','GB',35,'planned'),
 ('christmas-gb','Christmas','GB',50,'planned'),
 ('mothers-day-gb','Mother''s Day','GB',28,'planned'),
 ('summer-holidays-gb','Summer holidays','GB',60,'planned'),
 ('back-to-school-gb','Back to school','GB',35,'planned')
on conflict(event_key) do nothing;

insert into public.publishing_rules(scope_key,minimum_avuqo_score,minimum_confidence,minimum_promotion_score,require_approval,daily_post_limit,monthly_budget)
values('global',75,65,68,true,5,0)
on conflict(scope_key) do nothing;

-- Seed connector registry rows only as disabled/not-configured definitions. These are NOT live connections.
insert into public.sources(name,source_type,country_code,status,reliability_score,connector_key,sync_enabled,credential_status,health_status,metadata) values
 ('Awin','affiliate_network','GB','paused',80,'awin',false,'not_configured','unknown','{"stage":"connector-ready"}'::jsonb),
 ('eBay Partner Network','affiliate_network','GB','paused',80,'ebay',false,'not_configured','unknown','{"stage":"connector-ready"}'::jsonb),
 ('CJ Affiliate','affiliate_network','GB','paused',80,'cj',false,'not_configured','unknown','{"stage":"connector-ready"}'::jsonb),
 ('impact.com','affiliate_network','GB','paused',80,'impact',false,'not_configured','unknown','{"stage":"connector-ready"}'::jsonb),
 ('Booking.com','travel','GB','paused',80,'booking',false,'not_configured','unknown','{"stage":"connector-ready"}'::jsonb),
 ('Skyscanner','travel','GB','paused',80,'skyscanner',false,'not_configured','unknown','{"stage":"connector-ready"}'::jsonb),
 ('Direct Merchant Feed','direct_feed','GB','paused',75,'direct-feed',false,'not_configured','unknown','{"stage":"connector-ready"}'::jsonb)
on conflict do nothing;

insert into public.system_health(component,status,message) values
 ('database','healthy','Core AVUQO schema available.'),
 ('source-connectors','setup','Connector registry created; live credentials not configured.'),
 ('promotion-engine','review','Manual approval mode recommended for initial rollout.'),
 ('reality-check','safe-mode','URL intake enabled; arbitrary remote fetching disabled.')
on conflict(component) do update set status=excluded.status,message=excluded.message,last_checked_at=now();
