-- Private evidence staging only. Does not write to grocery_prices.
create table if not exists public.grocery_price_evidence (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.grocery_products(id) on delete restrict,
  store_id text not null references public.grocery_stores(id),
  price_pence integer not null check (price_pence > 0 and price_pence <= 100000000),
  currency text not null default 'GBP' check (currency='GBP'),
  source_kind text not null check (source_kind in ('licensed_feed','retailer_api','manual_check','data_provider')),
  source_reference text not null check (length(trim(source_reference)) >= 5),
  evidence_notes text not null check (length(trim(evidence_notes)) >= 10),
  observed_at timestamptz not null,
  usage_rights_status text not null default 'unverified' check (usage_rights_status in ('unverified','documentation_pending','confirmed')),
  review_status text not null default 'pending' check (review_status in ('pending','needs_attention','reviewed','rejected')),
  reviewed_at timestamptz,
  reviewed_by uuid,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint no_future_observation check (observed_at <= created_at + interval '10 minutes')
);
create index if not exists grocery_price_evidence_created_idx on public.grocery_price_evidence(created_at desc);
create index if not exists grocery_price_evidence_product_idx on public.grocery_price_evidence(product_id,store_id);
alter table public.grocery_price_evidence enable row level security;
revoke all on public.grocery_price_evidence from public,anon,authenticated;
grant select,insert,update on public.grocery_price_evidence to authenticated;
grant all on public.grocery_price_evidence to service_role;
drop policy if exists "grocery evidence admin read" on public.grocery_price_evidence;
drop policy if exists "grocery evidence admin insert" on public.grocery_price_evidence;
drop policy if exists "grocery evidence admin update" on public.grocery_price_evidence;
create policy "grocery evidence admin read" on public.grocery_price_evidence for select to authenticated using ((select private.is_avuqo_admin()));
create policy "grocery evidence admin insert" on public.grocery_price_evidence for insert to authenticated with check ((select private.is_avuqo_admin()) and created_by = (select auth.uid()) and review_status='pending' and usage_rights_status='unverified' and reviewed_at is null and reviewed_by is null);
create policy "grocery evidence admin update" on public.grocery_price_evidence for update to authenticated using ((select private.is_avuqo_admin())) with check ((select private.is_avuqo_admin()));
-- No anonymous SELECT, no DELETE policy, no public price publication trigger.
