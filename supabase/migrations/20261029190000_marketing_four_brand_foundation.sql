-- AVUQO Marketing: private four-brand editorial workspace. REVIEW BEFORE APPLYING.
-- There is NO external source connector, social publisher, scheduler, ad-spend path or live posting trigger.
create schema if not exists private;

create table public.marketing_brands (
  slug text primary key check (slug in ('avuqo','fantasy-lockr','capshur','cluedoku')),
  name text not null,
  tone text not null default '',
  audience text not null default '',
  website_url text,
  weekly_post_cap int not null default 3 check (weekly_post_cap between 0 and 7),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
insert into public.marketing_brands (slug,name) values
  ('avuqo','AVUQO'),('fantasy-lockr','Fantasy Lockr'),
  ('capshur','Capshur'),('cluedoku','Cluedoku');

create table public.marketing_facts (
  id uuid primary key default gen_random_uuid(),
  brand_slug text not null references public.marketing_brands(slug) on delete restrict,
  claim text not null check (length(trim(claim)) between 12 and 500),
  source_note text not null check (length(trim(source_note)) between 5 and 300),
  status text not null default 'draft' check (status in ('draft','approved')),
  expires_at timestamptz,
  created_by uuid not null default auth.uid() references auth.users(id),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  constraint fact_approval_consistent check (
    (status='draft' and approved_by is null and approved_at is null) or
    (status='approved' and approved_by is not null and approved_at is not null)
  )
);
create index marketing_facts_brand_idx on public.marketing_facts(brand_slug,status);

create table public.marketing_channels (
  id uuid primary key default gen_random_uuid(),
  brand_slug text not null references public.marketing_brands(slug) on delete restrict,
  platform text not null check (platform in ('facebook','instagram')),
  handle text not null check (length(trim(handle)) between 2 and 120),
  connection_state text not null default 'unconnected' check (connection_state='unconnected'),
  created_at timestamptz not null default now(),
  unique(brand_slug,platform,handle)
);
-- No OAuth tokens, credentials or live-channel capability in this phase.

create table public.marketing_posts (
  id uuid primary key default gen_random_uuid(),
  brand_slug text not null references public.marketing_brands(slug) on delete restrict,
  kind text not null check (kind in ('social','website_article')),
  platform text not null check (platform in ('facebook','instagram','website')),
  caption text not null check (length(trim(caption)) between 12 and 2500),
  source_fact_id uuid references public.marketing_facts(id) on delete restrict,
  planned_date date,
  status text not null default 'draft' check (status in ('draft','approved')),
  created_by uuid not null default auth.uid() references auth.users(id),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint post_target_consistent check (
    (kind='website_article' and platform='website') or
    (kind='social' and platform in ('facebook','instagram'))
  ),
  constraint post_approval_consistent check (
    (status='draft' and approved_by is null and approved_at is null) or
    (status='approved' and approved_by is not null and approved_at is not null)
  )
);
create index marketing_posts_brand_idx on public.marketing_posts(brand_slug,created_at desc);
create index marketing_posts_calendar_idx on public.marketing_posts(planned_date) where planned_date is not null;

-- Enforce fact ownership at the database boundary, including direct Data API writes.
create function private.check_marketing_post_fact() returns trigger language plpgsql
set search_path = '' as $$
declare f public.marketing_facts%rowtype;
begin
  if new.source_fact_id is not null then
    select * into f from public.marketing_facts where id = new.source_fact_id;
    if not found or f.brand_slug <> new.brand_slug then
      raise exception 'Marketing fact belongs to a different brand or is missing';
    end if;
  end if;
  if new.status = 'approved' then
    if new.source_fact_id is null or f.status <> 'approved' or
       (f.expires_at is not null and f.expires_at <= now()) then
      raise exception 'Marketing approval requires an unexpired approved same-brand fact';
    end if;
    if new.brand_slug = 'fantasy-lockr' and new.caption ~* 
      '(gameweek|fixture|score|result|kick-off|kickoff|deadline|rival)' then
      raise exception 'Fantasy Lockr live-event and Rival content is prohibited';
    end if;
  end if;
  return new;
end; $$;
revoke all on function private.check_marketing_post_fact() from public, anon, authenticated;
create trigger marketing_post_fact_guard before insert or update on public.marketing_posts
for each row execute function private.check_marketing_post_fact();

create table public.marketing_audit (
  id bigint generated always as identity primary key,
  brand_slug text,
  entity text not null,
  entity_id text not null,
  operation text not null check (operation in ('INSERT','UPDATE')),
  actor_id uuid,
  happened_at timestamptz not null default now(),
  prior jsonb,
  current jsonb
);
create index marketing_audit_recent_idx on public.marketing_audit(happened_at desc);

create function private.record_marketing_change() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.marketing_audit(brand_slug,entity,entity_id,operation,actor_id,prior,current)
  values (
    case when tg_table_name='marketing_brands' then new.slug else new.brand_slug end,
    tg_table_name,
    case when tg_table_name='marketing_brands' then new.slug else new.id::text end,
    tg_op, auth.uid(),
    case when tg_op='UPDATE' then to_jsonb(old) else null end,
    to_jsonb(new)
  );
  return new;
end; $$;
revoke all on function private.record_marketing_change() from public, anon, authenticated;
create trigger marketing_brand_audit after update on public.marketing_brands
for each row execute function private.record_marketing_change();
create trigger marketing_fact_audit after insert or update on public.marketing_facts
for each row execute function private.record_marketing_change();
create trigger marketing_channel_audit after insert or update on public.marketing_channels
for each row execute function private.record_marketing_change();
create trigger marketing_post_audit after insert or update on public.marketing_posts
for each row execute function private.record_marketing_change();

alter table public.marketing_brands enable row level security;
alter table public.marketing_facts enable row level security;
alter table public.marketing_channels enable row level security;
alter table public.marketing_posts enable row level security;
alter table public.marketing_audit enable row level security;
revoke all on public.marketing_brands,public.marketing_facts,public.marketing_channels,
  public.marketing_posts,public.marketing_audit from public,anon,authenticated;
grant select,update on public.marketing_brands to authenticated;
grant select,insert,update on public.marketing_facts, public.marketing_posts to authenticated;
grant select,insert on public.marketing_channels to authenticated;
grant select on public.marketing_audit to authenticated;

create policy marketing_brand_read on public.marketing_brands for select to authenticated
using (exists (select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role in ('owner','admin')));
create policy marketing_brand_edit on public.marketing_brands for update to authenticated
using (exists (select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role in ('owner','admin'))) with check (exists (select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role in ('owner','admin')));

create policy marketing_fact_read on public.marketing_facts for select to authenticated
using (exists (select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role in ('owner','admin')));
create policy marketing_fact_insert on public.marketing_facts for insert to authenticated
with check (exists (select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role in ('owner','admin')) and created_by=(select auth.uid())
and status='draft' and approved_by is null);
create policy marketing_fact_edit on public.marketing_facts for update to authenticated
using (exists (select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role in ('owner','admin')))
with check (exists (select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role in ('owner','admin')) and (
  status='draft' or exists (
    select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role='owner'
  )
));

create policy marketing_channel_read on public.marketing_channels for select to authenticated
using (exists (select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role in ('owner','admin')));
create policy marketing_channel_insert on public.marketing_channels for insert to authenticated
with check (exists (select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role in ('owner','admin')) and connection_state='unconnected');

create policy marketing_post_read on public.marketing_posts for select to authenticated
using (exists (select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role in ('owner','admin')));
create policy marketing_post_insert on public.marketing_posts for insert to authenticated
with check (exists (select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role in ('owner','admin')) and created_by=(select auth.uid())
and status='draft' and approved_by is null);
create policy marketing_post_edit on public.marketing_posts for update to authenticated
using (exists (select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role in ('owner','admin')))
with check (exists (select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role in ('owner','admin')) and (
  status='draft' or exists (
    select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role='owner'
  )
));
create policy marketing_audit_read on public.marketing_audit for select to authenticated
using (exists (select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role in ('owner','admin')));
-- No public access, no DELETE policies, no audit UPDATE/INSERT grants, no publishing permissions.
