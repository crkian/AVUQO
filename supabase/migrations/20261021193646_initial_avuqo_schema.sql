create extension if not exists pgcrypto;

-- =========================================================
-- AVUQO
-- Initial production schema
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- =========================================================
-- CATEGORIES
-- =========================================================

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete set null,

  slug text not null unique,
  name text not null,
  description text,

  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- =========================================================
-- MERCHANTS
-- =========================================================

create table public.merchants (
  id uuid primary key default gen_random_uuid(),

  slug text not null unique,
  name text not null,

  website_url text,
  logo_url text,

  country_code text,

  trust_score numeric(5,2) not null default 70,
  status text not null default 'active',

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- =========================================================
-- SOURCES
-- Affiliate networks, APIs and feeds
-- Never store API secrets here
-- =========================================================

create table public.sources (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  source_type text not null,

  country_code text,
  status text not null default 'active',

  reliability_score numeric(5,2) not null default 80,

  last_sync_at timestamptz,
  last_successful_sync_at timestamptz,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(name, country_code)
);


-- =========================================================
-- PRODUCTS
-- Canonical AVUQO product
-- =========================================================

create table public.products (
  id uuid primary key default gen_random_uuid(),

  category_id uuid references public.categories(id) on delete set null,

  slug text unique,

  canonical_title text not null,

  brand text,
  model text,

  description text,
  primary_image_url text,

  specifications jsonb not null default '{}'::jsonb,

  status text not null default 'active',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- =========================================================
-- PRODUCT IDENTIFIERS
-- =========================================================

create table public.product_identifiers (
  id uuid primary key default gen_random_uuid(),

  product_id uuid not null
    references public.products(id)
    on delete cascade,

  identifier_type text not null,
  identifier_value text not null,

  created_at timestamptz not null default now(),

  unique(product_id, identifier_type, identifier_value)
);

create index product_identifiers_lookup_idx
on public.product_identifiers(identifier_type, identifier_value);


-- =========================================================
-- OFFERS
-- One merchant/source selling one thing
-- product_id may initially be null until AVUQO matches it
-- =========================================================

create table public.offers (
  id uuid primary key default gen_random_uuid(),

  product_id uuid
    references public.products(id)
    on delete set null,

  merchant_id uuid not null
    references public.merchants(id)
    on delete restrict,

  source_id uuid not null
    references public.sources(id)
    on delete restrict,

  source_offer_id text not null,

  title text not null,

  price numeric(12,2) not null,
  currency text not null default 'GBP',

  previous_price numeric(12,2),
  rrp numeric(12,2),

  delivery_cost numeric(12,2) default 0,
  total_price numeric(12,2),

  affiliate_url text,
  source_url text,

  stock_status text not null default 'unknown',
  stock_quantity integer,

  condition text not null default 'new',

  valid_from timestamptz,
  valid_until timestamptz,

  match_confidence numeric(5,2) not null default 0,

  status text not null default 'active',

  last_seen_at timestamptz not null default now(),

  raw_data jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(source_id, source_offer_id)
);

create index offers_product_idx on public.offers(product_id);
create index offers_merchant_idx on public.offers(merchant_id);
create index offers_status_idx on public.offers(status);
create index offers_price_idx on public.offers(price);


-- =========================================================
-- PRICE HISTORY
-- Append-only pricing intelligence
-- =========================================================

create table public.price_history (
  id bigint generated always as identity primary key,

  product_id uuid
    references public.products(id)
    on delete cascade,

  offer_id uuid not null
    references public.offers(id)
    on delete cascade,

  merchant_id uuid not null
    references public.merchants(id)
    on delete restrict,

  source_id uuid not null
    references public.sources(id)
    on delete restrict,

  price numeric(12,2) not null,
  delivery_cost numeric(12,2) default 0,
  total_price numeric(12,2),

  is_valid boolean not null default true,

  observed_at timestamptz not null default now()
);

create index price_history_product_time_idx
on public.price_history(product_id, observed_at desc);

create index price_history_offer_time_idx
on public.price_history(offer_id, observed_at desc);


-- =========================================================
-- CURRENT DEAL SCORE
-- =========================================================

create table public.deal_scores (
  id uuid primary key default gen_random_uuid(),

  product_id uuid
    references public.products(id)
    on delete cascade,

  offer_id uuid not null unique
    references public.offers(id)
    on delete cascade,

  score integer not null
    check (score between 0 and 100),

  label text not null,

  confidence numeric(5,2) not null
    check (confidence between 0 and 100),

  decision text,

  explanation jsonb not null default '{}'::jsonb,

  calculated_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index deal_scores_score_idx
on public.deal_scores(score desc);


-- =========================================================
-- SCORE COMPONENTS
-- Allows every AVUQO Score to be explained
-- =========================================================

create table public.score_components (
  id uuid primary key default gen_random_uuid(),

  deal_score_id uuid not null
    references public.deal_scores(id)
    on delete cascade,

  component_name text not null,

  component_score numeric(8,3) not null,
  weight numeric(8,5) not null,

  evidence jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),

  unique(deal_score_id, component_name)
);


-- =========================================================
-- USER PROFILE
-- =========================================================

create table public.profiles (
  id uuid primary key
    references auth.users(id)
    on delete cascade,

  display_name text,

  home_country text,
  home_region text,

  preferences jsonb not null default '{}'::jsonb,
  notification_preferences jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- =========================================================
-- WATCHES
-- =========================================================

create table public.watches (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  name text not null,

  watch_type text not null,

  criteria jsonb not null default '{}'::jsonb,

  target_price numeric(12,2),
  minimum_score integer
    check (
      minimum_score is null
      or minimum_score between 0 and 100
    ),

  notification_preferences jsonb not null default '{}'::jsonb,

  status text not null default 'active',

  last_evaluated_at timestamptz,
  last_triggered_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index watches_user_idx on public.watches(user_id);
create index watches_status_idx on public.watches(status);


-- =========================================================
-- WATCH EVENTS
-- =========================================================

create table public.watch_events (
  id uuid primary key default gen_random_uuid(),

  watch_id uuid not null
    references public.watches(id)
    on delete cascade,

  offer_id uuid
    references public.offers(id)
    on delete set null,

  event_type text not null,

  details jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

create index watch_events_watch_time_idx
on public.watch_events(watch_id, created_at desc);


-- =========================================================
-- CLICK EVENTS
-- Affiliate attribution
-- =========================================================

create table public.click_events (
  id uuid primary key default gen_random_uuid(),

  user_id uuid
    references auth.users(id)
    on delete set null,

  session_id text,

  offer_id uuid not null
    references public.offers(id)
    on delete cascade,

  page_path text,

  traffic_source text,
  campaign text,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

create index click_events_offer_idx on public.click_events(offer_id);
create index click_events_created_idx on public.click_events(created_at desc);


-- =========================================================
-- EXCEPTION QUEUE
-- =========================================================

create table public.exceptions (
  id uuid primary key default gen_random_uuid(),

  exception_type text not null,
  severity text not null default 'medium',

  entity_type text,
  entity_id text,

  status text not null default 'open',

  reason text not null,

  data jsonb not null default '{}'::jsonb,
  resolution jsonb,

  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index exceptions_status_idx
on public.exceptions(status, severity);


-- =========================================================
-- AUTOMATION JOBS
-- =========================================================

create table public.automation_jobs (
  id uuid primary key default gen_random_uuid(),

  job_type text not null,

  status text not null default 'queued',

  attempts integer not null default 0,

  payload jsonb not null default '{}'::jsonb,

  error_message text,

  started_at timestamptz,
  finished_at timestamptz,

  created_at timestamptz not null default now()
);

create index automation_jobs_status_idx
on public.automation_jobs(status, created_at);


-- =========================================================
-- AUDIT LOG
-- =========================================================

create table public.audit_logs (
  id bigint generated always as identity primary key,

  actor_type text not null,
  actor_id text,

  action text not null,

  entity_type text,
  entity_id text,

  reason text,

  before_data jsonb,
  after_data jsonb,

  created_at timestamptz not null default now()
);

create index audit_logs_entity_idx
on public.audit_logs(entity_type, entity_id);

create index audit_logs_created_idx
on public.audit_logs(created_at desc);


-- =========================================================
-- UPDATED_AT TRIGGERS
-- =========================================================

create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create trigger merchants_set_updated_at
before update on public.merchants
for each row execute function public.set_updated_at();

create trigger sources_set_updated_at
before update on public.sources
for each row execute function public.set_updated_at();

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger offers_set_updated_at
before update on public.offers
for each row execute function public.set_updated_at();

create trigger deal_scores_set_updated_at
before update on public.deal_scores
for each row execute function public.set_updated_at();

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger watches_set_updated_at
before update on public.watches
for each row execute function public.set_updated_at();


-- =========================================================
-- AUTOMATIC USER PROFILE
-- =========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();


-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================

alter table public.categories enable row level security;
alter table public.merchants enable row level security;
alter table public.sources enable row level security;
alter table public.products enable row level security;
alter table public.product_identifiers enable row level security;
alter table public.offers enable row level security;
alter table public.price_history enable row level security;
alter table public.deal_scores enable row level security;
alter table public.score_components enable row level security;
alter table public.profiles enable row level security;
alter table public.watches enable row level security;
alter table public.watch_events enable row level security;
alter table public.click_events enable row level security;
alter table public.exceptions enable row level security;
alter table public.automation_jobs enable row level security;
alter table public.audit_logs enable row level security;


-- Public catalogue reads

create policy "public read active categories"
on public.categories
for select
using (is_active = true);

create policy "public read active merchants"
on public.merchants
for select
using (status = 'active');

create policy "public read active products"
on public.products
for select
using (status = 'active');

create policy "public read product identifiers"
on public.product_identifiers
for select
using (true);

create policy "public read active matched offers"
on public.offers
for select
using (
  status = 'active'
  and product_id is not null
);

create policy "public read valid price history"
on public.price_history
for select
using (is_valid = true);

create policy "public read scores"
on public.deal_scores
for select
using (
  exists (
    select 1
    from public.offers o
    where o.id = deal_scores.offer_id
      and o.status = 'active'
  )
);

create policy "public read score components"
on public.score_components
for select
using (true);


-- Profiles

create policy "users read own profile"
on public.profiles
for select
using (auth.uid() = id);

create policy "users update own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);


-- Watches

create policy "users read own watches"
on public.watches
for select
using (auth.uid() = user_id);

create policy "users create own watches"
on public.watches
for insert
with check (auth.uid() = user_id);

create policy "users update own watches"
on public.watches
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users delete own watches"
on public.watches
for delete
using (auth.uid() = user_id);


-- Watch events

create policy "users read own watch events"
on public.watch_events
for select
using (
  exists (
    select 1
    from public.watches w
    where w.id = watch_events.watch_id
      and w.user_id = auth.uid()
  )
);


-- =========================================================
-- CORE CATEGORIES
-- Configuration, not fake deal data
-- =========================================================

insert into public.categories (slug, name)
values
  ('tech', 'Tech'),
  ('travel', 'Travel'),
  ('home', 'Home'),
  ('fashion', 'Fashion'),
  ('cars', 'Cars'),
  ('experiences', 'Experiences'),
  ('beauty', 'Beauty')
on conflict (slug) do nothing;

