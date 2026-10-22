-- AVUQO Phase 4
-- Secure Control Centre role model + RLS enforcement.
--
-- Safe design:
-- - normal users can read only their own role
-- - users cannot grant themselves admin/owner
-- - Control Centre tables are usable only when is_avuqo_admin() is true
-- - no service/secret key is exposed to the browser

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'customer'
    check (role in ('customer', 'admin', 'owner')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;

revoke all on table public.user_roles from anon, authenticated;
grant select on table public.user_roles to authenticated;

drop policy if exists "users can read own role" on public.user_roles;
create policy "users can read own role"
on public.user_roles
for select
to authenticated
using ((select auth.uid()) = user_id);

-- Automatically create a customer role for future sign-ups.
create or replace function public.handle_new_avuqo_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'customer')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_avuqo_role on auth.users;

create trigger on_auth_user_created_avuqo_role
after insert on auth.users
for each row
execute function public.handle_new_avuqo_role();

-- Backfill existing Supabase users as customers without overwriting any
-- role that has already been deliberately assigned.
insert into public.user_roles (user_id, role)
select id, 'customer'
from auth.users
on conflict (user_id) do nothing;

-- Central authorization function used by RLS.
create or replace function public.is_avuqo_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = (select auth.uid())
      and role in ('admin', 'owner')
  );
$$;

revoke all on function public.is_avuqo_admin() from public;
grant execute on function public.is_avuqo_admin() to authenticated;

-- Apply one admin policy to each Control Centre / operational table that
-- currently exists. Missing future tables are simply skipped.
do $$
declare
  t text;
begin
  foreach t in array array[
    'affiliate_programs',
    'channel_connections',
    'publishing_rules',
    'promotion_candidates',
    'promotion_score_components',
    'compliance_checks',
    'campaigns',
    'campaign_items',
    'creative_assets',
    'scheduled_publications',
    'attribution_events',
    'affiliate_conversions',
    'revenue_reconciliations',
    'promotion_experiments',
    'exceptions',
    'automation_jobs',
    'audit_logs'
  ]
  loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I enable row level security', t);

      execute format(
        'revoke all on table public.%I from anon, authenticated',
        t
      );

      execute format(
        'grant select, insert, update, delete on table public.%I to authenticated',
        t
      );

      execute format(
        'drop policy if exists "avuqo admin control" on public.%I',
        t
      );

      execute format(
        'create policy "avuqo admin control"
         on public.%I
         for all
         to authenticated
         using ((select public.is_avuqo_admin()))
         with check ((select public.is_avuqo_admin()))',
        t
      );
    end if;
  end loop;
end $$;

-- Identity-backed tables can require sequence privileges for inserts.
grant usage, select on all sequences in schema public to authenticated;

-- Keep this role table server-controlled.
-- There are intentionally NO INSERT/UPDATE/DELETE grants for authenticated.
