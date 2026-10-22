-- AVUQO DEVELOPMENT RESET + CLEAN SETUP
-- WARNING: this deletes AVUQO public-schema data created during development.
-- It does NOT delete Supabase Auth users or Supabase system schemas.
-- Use this now while AVUQO is still in development. Do not use on live production data.

begin;

-- Remove auth trigger first so its function can be replaced cleanly.
drop trigger if exists on_auth_user_created on auth.users;

-- Drop AVUQO tables. CASCADE removes their policies, indexes and dependent triggers.
drop table if exists public.audit_logs cascade;
drop table if exists public.automation_jobs cascade;
drop table if exists public.exceptions cascade;
drop table if exists public.analytics_events cascade;
drop table if exists public.click_events cascade;
drop table if exists public.user_feedback cascade;
drop table if exists public.shared_list_items cascade;
drop table if exists public.shared_list_members cascade;
drop table if exists public.shared_lists cascade;
drop table if exists public.saved_items cascade;
drop table if exists public.watch_events cascade;
drop table if exists public.watches cascade;
drop table if exists public.profiles cascade;
drop table if exists public.score_components cascade;
drop table if exists public.deal_scores cascade;
drop table if exists public.price_history cascade;
drop table if exists public.offers cascade;
drop table if exists public.product_identifiers cascade;
drop table if exists public.products cascade;
drop table if exists public.sources cascade;
drop table if exists public.merchants cascade;
drop table if exists public.categories cascade;

drop function if exists public.handle_new_user() cascade;
drop function if exists public.set_updated_at() cascade;

commit;

-- =========================================================
-- CLEAN AVUQO SCHEMA
-- =========================================================

-- AVUQO initial Supabase schema
-- Run in Supabase SQL Editor OR save as a migration.
-- Designed for hosted Supabase with RLS enabled.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete set null,
  slug text not null unique,
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.merchants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  website_url text,
  logo_url text,
  country_code text,
  trust_score numeric(5,2) not null default 70 check (trust_score between 0 and 100),
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  source_type text not null,
  country_code text,
  status text not null default 'active',
  reliability_score numeric(5,2) not null default 80 check (reliability_score between 0 and 100),
  last_sync_at timestamptz,
  last_successful_sync_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(name, country_code)
);

create table if not exists public.products (
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

create table if not exists public.product_identifiers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  identifier_type text not null,
  identifier_value text not null,
  created_at timestamptz not null default now(),
  unique(product_id, identifier_type, identifier_value)
);
create index if not exists product_identifiers_lookup_idx on public.product_identifiers(identifier_type, identifier_value);

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete set null,
  merchant_id uuid not null references public.merchants(id) on delete restrict,
  source_id uuid not null references public.sources(id) on delete restrict,
  source_offer_id text not null,
  title text not null,
  price numeric(12,2) not null check (price >= 0),
  currency text not null default 'GBP',
  previous_price numeric(12,2),
  rrp numeric(12,2),
  delivery_cost numeric(12,2) not null default 0,
  total_price numeric(12,2),
  affiliate_url text,
  source_url text,
  stock_status text not null default 'unknown',
  stock_quantity integer,
  condition text not null default 'new',
  valid_from timestamptz,
  valid_until timestamptz,
  match_confidence numeric(5,2) not null default 0 check (match_confidence between 0 and 100),
  status text not null default 'active',
  last_seen_at timestamptz not null default now(),
  raw_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(source_id, source_offer_id)
);
create index if not exists offers_product_idx on public.offers(product_id);
create index if not exists offers_merchant_idx on public.offers(merchant_id);
create index if not exists offers_status_idx on public.offers(status);
create index if not exists offers_price_idx on public.offers(price);

create table if not exists public.price_history (
  id bigint generated always as identity primary key,
  product_id uuid references public.products(id) on delete cascade,
  offer_id uuid not null references public.offers(id) on delete cascade,
  merchant_id uuid not null references public.merchants(id) on delete restrict,
  source_id uuid not null references public.sources(id) on delete restrict,
  price numeric(12,2) not null,
  delivery_cost numeric(12,2) not null default 0,
  total_price numeric(12,2),
  is_valid boolean not null default true,
  observed_at timestamptz not null default now()
);
create index if not exists price_history_product_time_idx on public.price_history(product_id, observed_at desc);
create index if not exists price_history_offer_time_idx on public.price_history(offer_id, observed_at desc);

create table if not exists public.deal_scores (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  offer_id uuid not null unique references public.offers(id) on delete cascade,
  score integer not null check (score between 0 and 100),
  label text not null,
  confidence numeric(5,2) not null check (confidence between 0 and 100),
  decision text,
  explanation jsonb not null default '{}'::jsonb,
  calculated_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists deal_scores_score_idx on public.deal_scores(score desc);

create table if not exists public.score_components (
  id uuid primary key default gen_random_uuid(),
  deal_score_id uuid not null references public.deal_scores(id) on delete cascade,
  component_name text not null,
  component_score numeric(8,3) not null,
  weight numeric(8,5) not null,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(deal_score_id, component_name)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  home_country text,
  home_region text,
  preferences jsonb not null default '{}'::jsonb,
  notification_preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.watches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  watch_type text not null,
  criteria jsonb not null default '{}'::jsonb,
  product_id uuid references public.products(id) on delete cascade,
  target_price numeric(12,2),
  minimum_score integer check (minimum_score is null or minimum_score between 0 and 100),
  notification_preferences jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  last_evaluated_at timestamptz,
  last_triggered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists watches_user_idx on public.watches(user_id);
create index if not exists watches_product_idx on public.watches(product_id);

create table if not exists public.watch_events (
  id uuid primary key default gen_random_uuid(),
  watch_id uuid not null references public.watches(id) on delete cascade,
  offer_id uuid references public.offers(id) on delete set null,
  event_type text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists watch_events_watch_time_idx on public.watch_events(watch_id, created_at desc);

create table if not exists public.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  product_id uuid not null references public.products(id) on delete cascade,
  price_when_saved numeric(12,2),
  score_when_saved integer,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);

create table if not exists public.shared_lists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  description text,
  list_type text not null default 'standard',
  visibility text not null default 'private',
  budget numeric(12,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shared_list_members (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.shared_lists(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  unique(list_id, user_id)
);

create table if not exists public.shared_list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.shared_lists(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  added_by uuid references auth.users(id) on delete set null default auth.uid(),
  title_override text,
  url text,
  priority text not null default 'normal',
  purchased boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null default auth.uid(),
  product_id uuid references public.products(id) on delete set null,
  offer_id uuid references public.offers(id) on delete set null,
  feedback_type text not null,
  details jsonb not null default '{}'::jsonb,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists public.click_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  session_id text,
  offer_id uuid not null references public.offers(id) on delete cascade,
  page_path text,
  traffic_source text,
  campaign text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  session_id text,
  event_name text not null,
  page_path text,
  product_id uuid references public.products(id) on delete set null,
  offer_id uuid references public.offers(id) on delete set null,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.exceptions (
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

create table if not exists public.automation_jobs (
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

create table if not exists public.audit_logs (
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

-- updated_at triggers
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['categories','merchants','sources','products','offers','deal_scores','profiles','watches','shared_lists','shared_list_items']
  LOOP
    EXECUTE format('drop trigger if exists %I_set_updated_at on public.%I', t, t);
    EXECUTE format('create trigger %I_set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  END LOOP;
END $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'))
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- RLS
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
alter table public.saved_items enable row level security;
alter table public.shared_lists enable row level security;
alter table public.shared_list_members enable row level security;
alter table public.shared_list_items enable row level security;
alter table public.user_feedback enable row level security;
alter table public.click_events enable row level security;
alter table public.analytics_events enable row level security;
alter table public.exceptions enable row level security;
alter table public.automation_jobs enable row level security;
alter table public.audit_logs enable row level security;

-- grants: catalogue read only for browser roles
revoke all on table public.categories, public.merchants, public.sources, public.products, public.product_identifiers, public.offers, public.price_history, public.deal_scores, public.score_components from anon, authenticated;
grant select on table public.categories, public.merchants, public.products, public.product_identifiers, public.offers, public.price_history, public.deal_scores, public.score_components to anon, authenticated;
revoke all on table public.profiles, public.watches, public.watch_events, public.saved_items, public.shared_lists, public.shared_list_members, public.shared_list_items, public.user_feedback, public.click_events, public.analytics_events from anon, authenticated;
grant select, insert, update, delete on table public.profiles, public.watches, public.saved_items, public.shared_lists, public.shared_list_members, public.shared_list_items to authenticated;
grant select on table public.watch_events to authenticated;
grant insert, select on table public.user_feedback to authenticated;
grant insert on table public.click_events, public.analytics_events to anon, authenticated;

-- public catalogue policies
create policy "categories public read" on public.categories for select to anon, authenticated using (is_active = true);
create policy "merchants public read" on public.merchants for select to anon, authenticated using (status = 'active');
create policy "products public read" on public.products for select to anon, authenticated using (status = 'active');
create policy "product identifiers public read" on public.product_identifiers for select to anon, authenticated using (true);
create policy "offers public read" on public.offers for select to anon, authenticated using (status = 'active' and product_id is not null);
create policy "price history public read" on public.price_history for select to anon, authenticated using (is_valid = true);
create policy "scores public read" on public.deal_scores for select to anon, authenticated using (true);
create policy "score components public read" on public.score_components for select to anon, authenticated using (true);

-- profiles
create policy "profiles select own" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profiles insert own" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "profiles update own" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "profiles delete own" on public.profiles for delete to authenticated using ((select auth.uid()) = id);

-- watches
create policy "watches select own" on public.watches for select to authenticated using ((select auth.uid()) = user_id);
create policy "watches insert own" on public.watches for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "watches update own" on public.watches for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "watches delete own" on public.watches for delete to authenticated using ((select auth.uid()) = user_id);
create policy "watch events select own" on public.watch_events for select to authenticated using (exists (select 1 from public.watches w where w.id = watch_id and w.user_id = (select auth.uid())));

-- saved
create policy "saved select own" on public.saved_items for select to authenticated using ((select auth.uid()) = user_id);
create policy "saved insert own" on public.saved_items for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "saved delete own" on public.saved_items for delete to authenticated using ((select auth.uid()) = user_id);

-- shared lists
create policy "lists select owner or member" on public.shared_lists for select to authenticated using (owner_id = (select auth.uid()) or exists (select 1 from public.shared_list_members m where m.list_id = id and m.user_id = (select auth.uid())));
create policy "lists insert own" on public.shared_lists for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "lists update owner" on public.shared_lists for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "lists delete owner" on public.shared_lists for delete to authenticated using (owner_id = (select auth.uid()));
create policy "members select list access" on public.shared_list_members for select to authenticated using (user_id = (select auth.uid()) or exists (select 1 from public.shared_lists l where l.id = list_id and l.owner_id = (select auth.uid())));
create policy "members owner manages" on public.shared_list_members for insert to authenticated with check (exists (select 1 from public.shared_lists l where l.id = list_id and l.owner_id = (select auth.uid())));
create policy "members owner updates" on public.shared_list_members for update to authenticated using (exists (select 1 from public.shared_lists l where l.id = list_id and l.owner_id = (select auth.uid())));
create policy "members owner deletes" on public.shared_list_members for delete to authenticated using (user_id = (select auth.uid()) or exists (select 1 from public.shared_lists l where l.id = list_id and l.owner_id = (select auth.uid())));
create policy "list items select access" on public.shared_list_items for select to authenticated using (exists (select 1 from public.shared_lists l where l.id = list_id and (l.owner_id = (select auth.uid()) or exists (select 1 from public.shared_list_members m where m.list_id = l.id and m.user_id = (select auth.uid())))));
create policy "list items insert access" on public.shared_list_items for insert to authenticated with check (exists (select 1 from public.shared_lists l where l.id = list_id and (l.owner_id = (select auth.uid()) or exists (select 1 from public.shared_list_members m where m.list_id = l.id and m.user_id = (select auth.uid())))));
create policy "list items update access" on public.shared_list_items for update to authenticated using (exists (select 1 from public.shared_lists l where l.id = list_id and (l.owner_id = (select auth.uid()) or exists (select 1 from public.shared_list_members m where m.list_id = l.id and m.user_id = (select auth.uid())))));
create policy "list items delete access" on public.shared_list_items for delete to authenticated using (exists (select 1 from public.shared_lists l where l.id = list_id and (l.owner_id = (select auth.uid()) or exists (select 1 from public.shared_list_members m where m.list_id = l.id and m.user_id = (select auth.uid())))));

-- feedback + analytics writes
create policy "feedback insert own" on public.user_feedback for insert to authenticated with check (user_id is null or user_id = (select auth.uid()));
create policy "feedback select own" on public.user_feedback for select to authenticated using (user_id = (select auth.uid()));
create policy "click event insert" on public.click_events for insert to anon, authenticated with check (user_id is null or user_id = (select auth.uid()));
create policy "analytics event insert" on public.analytics_events for insert to anon, authenticated with check (user_id is null or user_id = (select auth.uid()));

insert into public.categories (slug, name) values
 ('tech','Tech'),('travel','Travel'),('home','Home'),('fashion','Fashion'),('beauty','Beauty'),('motoring','Motoring'),('experiences','Experiences'),('gifts','Gifts')
on conflict (slug) do nothing;
