-- AVUQO v0.8: private Awin staging, never connected to public offers.
create table if not exists public.feed_import_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id),
  merchant_id text not null, merchant_name text not null, filename text not null,
  total_count integer not null, review_count integer not null, excluded_count integer not null,
  status text not null default 'private_review' check(status = 'private_review'),
  permission_status text not null default 'unverified' check(permission_status = 'unverified')
);
create table if not exists public.feed_import_records (
  id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(),
  import_id uuid not null references public.feed_import_runs(id) on delete cascade,
  merchant_id text not null, merchant_product_id text not null, awin_product_id text not null,
  title text not null, price numeric(14,2), currency text not null,
  brand text not null default '', category text not null default '',
  status text not null check(status in ('review','excluded')),
  reasons text[] not null default '{}', metadata jsonb not null default '{}'::jsonb
);
create index if not exists feed_import_records_import_id_idx on public.feed_import_records(import_id);
alter table public.feed_import_runs enable row level security;
alter table public.feed_import_records enable row level security;
-- Roles are read from the existing AVUQO user_roles table. No public access.
create policy "admin read import runs" on public.feed_import_runs for select to authenticated using (
  exists(select 1 from public.user_roles r where r.user_id = (select auth.uid()) and r.role in ('owner','admin'))
);
create policy "admin insert import runs" on public.feed_import_runs for insert to authenticated with check (
  created_by = (select auth.uid()) and exists(select 1 from public.user_roles r where r.user_id = (select auth.uid()) and r.role in ('owner','admin'))
);
create policy "admin delete import runs" on public.feed_import_runs for delete to authenticated using (
  created_by = (select auth.uid()) and exists(select 1 from public.user_roles r where r.user_id = (select auth.uid()) and r.role in ('owner','admin'))
);
create policy "admin read import rows" on public.feed_import_records for select to authenticated using (
  exists(select 1 from public.feed_import_runs run where run.id = import_id and exists (
    select 1 from public.user_roles r where r.user_id = (select auth.uid()) and r.role in ('owner','admin')))
);
create policy "admin insert import rows" on public.feed_import_records for insert to authenticated with check (
  exists(select 1 from public.feed_import_runs run where run.id = import_id and run.created_by = (select auth.uid()))
);
create policy "admin delete import rows" on public.feed_import_records for delete to authenticated using (
  exists(select 1 from public.feed_import_runs run where run.id = import_id and run.created_by = (select auth.uid()))
);
