-- AVUQO homepage campaign rotation and four-brand draft-only automation.
-- Additive, with all automatic creation disabled by default; no social publishing.
create table public.marketing_home_placements (
 id uuid primary key default gen_random_uuid(),
 brand_slug text not null default 'avuqo' references public.marketing_brands(slug),
 title text not null check (length(trim(title)) between 8 and 100),
 summary text not null check (length(trim(summary)) between 15 and 260),
 cta_label text not null check (length(trim(cta_label)) between 4 and 40),
 href text not null check (href ~ '^/[a-z0-9][a-z0-9/-]*$'),
 fact_id uuid not null references public.marketing_facts(id) on delete restrict,
 sponsored boolean not null default false,
 status text not null default 'draft' check(status in ('draft','approved','paused')),
 starts_at timestamptz not null,
 ends_at timestamptz not null,
 priority smallint not null default 50 check(priority between 0 and 100),
 created_by uuid not null references auth.users(id),
 approved_by uuid references auth.users(id),
 approved_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint homepage_brand_only check (brand_slug='avuqo'),
 constraint homepage_dates check(ends_at > starts_at),
 constraint homepage_approval check (
  (status='draft' and approved_by is null and approved_at is null) or
  (status in ('approved','paused') and approved_by is not null and approved_at is not null)
 )
);
create index marketing_home_active_idx on public.marketing_home_placements(status,starts_at,ends_at,priority);
create function private.marketing_home_verify() returns trigger language plpgsql
set search_path='' as $$
declare f record;
begin
 select id,status,expires_at,brand_slug into f from public.marketing_facts where id=new.fact_id;
 if f.id is null or f.brand_slug<>'avuqo' then
  raise exception 'Homepage requires a matching AVUQO fact';
 end if;
 if new.status in ('approved','paused') and (f.status<>'approved' or
    (f.expires_at is not null and (f.expires_at<=now() or new.ends_at>f.expires_at))) then
  raise exception 'Cannot publish placement without approved current fact';
 end if;
 if tg_op='UPDATE' and old.status in ('approved','paused') and (
  new.title is distinct from old.title or
  new.summary is distinct from old.summary or
  new.href is distinct from old.href or
  new.cta_label is distinct from old.cta_label or
  new.fact_id is distinct from old.fact_id or
  new.sponsored is distinct from old.sponsored or
  new.starts_at is distinct from old.starts_at or
  new.ends_at is distinct from old.ends_at or
  new.priority is distinct from old.priority
 ) then raise exception 'Approved homepage placement is immutable; create a new draft'; end if;
 return new;
end $$;
revoke all on function private.marketing_home_verify() from public,anon,authenticated;
create trigger marketing_home_guard before insert or update on public.marketing_home_placements
 for each row execute function private.marketing_home_verify();
alter table public.marketing_home_placements enable row level security;
revoke all on public.marketing_home_placements from public,anon,authenticated;
grant select on public.marketing_home_placements to anon,authenticated;
grant insert,update on public.marketing_home_placements to authenticated;
create policy home_public_current on public.marketing_home_placements for select to anon,authenticated
 using (status='approved' and starts_at<=now() and ends_at>now() and brand_slug='avuqo');
create policy home_owner_read on public.marketing_home_placements for select to authenticated
 using (exists(select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role in ('owner','admin')));
create policy home_owner_insert on public.marketing_home_placements for insert to authenticated
 with check (status='draft' and created_by=(select auth.uid()) and
 exists(select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role='owner'));
create policy home_owner_update on public.marketing_home_placements for update to authenticated
 using (exists(select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role='owner'))
 with check (exists(select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role='owner'));
create trigger marketing_home_audit after insert or update on public.marketing_home_placements
 for each row execute function private.record_marketing_change();

-- Editorial automation creates drafts only, one rule per brand and social channel.
create table public.marketing_automation_rules (
 id uuid primary key default gen_random_uuid(),
 brand_slug text not null references public.marketing_brands(slug),
 platform text not null check(platform in ('facebook','instagram')),
 enabled boolean not null default false,
 cadence_days integer not null default 3 check(cadence_days between 2 and 14),
 next_run_at timestamptz not null default (now() + interval '1 day'),
 last_run_at timestamptz,
 last_error text,
 created_by uuid references auth.users(id),
 updated_at timestamptz not null default now(),
 unique(brand_slug,platform)
);
create index marketing_rules_due_idx on public.marketing_automation_rules(enabled,next_run_at);
alter table public.marketing_automation_rules enable row level security;
revoke all on public.marketing_automation_rules from public,anon,authenticated;
grant select,insert,update on public.marketing_automation_rules to authenticated;
create policy rules_owner_read on public.marketing_automation_rules for select to authenticated
 using(exists(select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role in ('owner','admin')));
create policy rules_owner_insert on public.marketing_automation_rules for insert to authenticated
 with check(created_by=(select auth.uid()) and
 exists(select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role='owner'));
create policy rules_owner_update on public.marketing_automation_rules for update to authenticated
 using(exists(select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role='owner'))
 with check(exists(select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role='owner'));
create trigger marketing_rules_audit after insert or update on public.marketing_automation_rules
 for each row execute function private.record_marketing_change();
-- No job dispatch, no homepage paid ranking, no external site content sources.
