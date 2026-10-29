-- AVUQO Marketing phase 2 / installation candidate. Do not execute before review.
-- All live switches default false; no secret values, cross-project sources or external integrations.
alter table public.marketing_brands
  add column publishing_enabled boolean not null default false,
  add column ai_enabled boolean not null default false,
  add column monthly_ai_call_cap integer not null default 15 check (monthly_ai_call_cap between 0 and 300);

alter table public.marketing_channels
  add column buffer_channel_id text,
  add column publishing_enabled boolean not null default false,
  add column last_verified_at timestamptz;
alter table public.marketing_channels drop constraint if exists marketing_channels_connection_state_check;
alter table public.marketing_channels add constraint marketing_channels_connection_state_check
  check (connection_state in ('unconnected','verified','disabled'));
create unique index marketing_buffer_channel_unique on public.marketing_channels(buffer_channel_id)
  where buffer_channel_id is not null;
alter table public.marketing_channels add constraint marketing_channel_verified_mapping check (
  (connection_state='verified' and buffer_channel_id is not null and last_verified_at is not null)
  or (connection_state<>'verified' and publishing_enabled=false)
);
-- Ensure an unverified channel cannot be accidentally enabled.
alter table public.marketing_channels add constraint marketing_channel_enabled_guard check (
  not publishing_enabled or connection_state='verified'
);

create table public.marketing_system (
  singleton boolean primary key default true check(singleton=true),
  publishing_enabled boolean not null default false,
  ai_enabled boolean not null default false,
  emergency_stop boolean not null default true,
  updated_at timestamptz not null default now()
);
insert into public.marketing_system(singleton) values(true);

create table public.marketing_assets (
  id uuid primary key default gen_random_uuid(),
  brand_slug text not null references public.marketing_brands(slug),
  storage_path text not null unique check (length(storage_path)>4),
  media_type text not null default 'image/png' check (media_type in ('image/png','image/jpeg')),
  alt_text text not null check (length(trim(alt_text)) between 5 and 320),
  description text not null default '',
  source_type text not null default 'ai_generated' check (source_type in ('ai_generated','owner_approved')),
  rights_note text not null default '',
  status text not null default 'draft' check (status in ('draft','approved','rejected')),
  public_url text,
  created_by uuid not null references auth.users(id),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  constraint marketing_asset_approval_check check (
    (status='approved' and approved_by is not null and approved_at is not null and length(trim(rights_note))>=8)
    or (status<>'approved' and approved_by is null and approved_at is null)
  )
);
create index marketing_assets_brand_idx on public.marketing_assets(brand_slug,created_at desc);
alter table public.marketing_posts
  add column ai_assisted boolean not null default false,
  add column asset_id uuid references public.marketing_assets(id) on delete restrict;

create table public.marketing_ai_runs (
  id uuid primary key default gen_random_uuid(),
  brand_slug text not null references public.marketing_brands(slug),
  kind text not null check(kind in ('caption','image')),
  model text not null,
  input_tokens integer,
  output_tokens integer,
  estimated_cost_pence integer, -- NULL until trustworthy price accounting is configured
  status text not null check(status in ('succeeded','failed')),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
create index marketing_ai_runs_brand_time on public.marketing_ai_runs(brand_slug,created_at desc);

create table public.marketing_publication_jobs (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null unique references public.marketing_posts(id) on delete restrict,
  channel_id uuid not null references public.marketing_channels(id) on delete restrict,
  brand_slug text not null references public.marketing_brands(slug),
  due_at timestamptz not null,
  state text not null default 'queued' check(state in
   ('queued','dispatching','scheduled','published','failed','needs_reconciliation','blocked')),
  provider_post_id text unique,
  dispatch_started_at timestamptz,
  last_checked_at timestamptz,
  published_at timestamptz,
  provider_metrics jsonb,
  metrics_updated_at timestamptz,
  last_error text,
  attempt_count integer not null default 0 check (attempt_count between 0 and 3),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index marketing_job_dispatch_idx on public.marketing_publication_jobs(state,due_at);

-- Only approved content with approved current same-brand facts can enter the job table.
create function private.marketing_job_guard() returns trigger
language plpgsql set search_path='' as $$
declare p record; c record; f record; a record;
begin
 select * into p from public.marketing_posts where id=new.post_id;
 select * into c from public.marketing_channels where id=new.channel_id;
 if not found or p.id is null or c.id is null or p.brand_slug<>new.brand_slug or
   c.brand_slug<>new.brand_slug or p.platform<>c.platform or
   p.kind<>'social' or p.status<>'approved' or c.connection_state<>'verified' then
   raise exception 'Publishing job failed ownership, platform or approval check';
 end if;
 select * into f from public.marketing_facts where id=p.source_fact_id;
 if f.id is null or f.status<>'approved' or f.brand_slug<>new.brand_slug or
    (f.expires_at is not null and f.expires_at<=now()) then
   raise exception 'Job requires current approved brand evidence';
 end if;
 if p.platform='instagram' then
   select * into a from public.marketing_assets where id=p.asset_id;
   if a.id is null or a.status<>'approved' or a.brand_slug<>new.brand_slug or a.public_url is null then
     raise exception 'Instagram requires an approved, publicly hosted image of the same brand';
   end if;
 end if;
 return new;
end $$;
revoke all on function private.marketing_job_guard() from public,anon,authenticated;
create trigger marketing_job_guard_insert before insert on public.marketing_publication_jobs
for each row execute function private.marketing_job_guard();

-- Existing post guard also checks image ownership; a changed asset cannot cross brand.
create function private.marketing_post_asset_guard() returns trigger
language plpgsql set search_path='' as $$
begin
 if new.asset_id is not null and not exists(
   select 1 from public.marketing_assets a where a.id=new.asset_id and a.brand_slug=new.brand_slug
 ) then raise exception 'Marketing media belongs to another brand'; end if;
 return new;
end $$;
revoke all on function private.marketing_post_asset_guard() from public,anon,authenticated;
create trigger marketing_post_asset_guard before insert or update on public.marketing_posts
for each row execute function private.marketing_post_asset_guard();

-- Prevent ordinary admin users from enabling publishing, editing approved media,
-- or modifying dispatch state through the data API.
alter table public.marketing_system enable row level security;
alter table public.marketing_assets enable row level security;
alter table public.marketing_ai_runs enable row level security;
alter table public.marketing_publication_jobs enable row level security;
revoke all on public.marketing_system,public.marketing_assets,public.marketing_ai_runs,
 public.marketing_publication_jobs from public,anon,authenticated;
grant select,update on public.marketing_system to authenticated;
grant select,insert,update on public.marketing_assets to authenticated;
grant select on public.marketing_ai_runs to authenticated;
grant select,insert on public.marketing_publication_jobs to authenticated;
grant update on public.marketing_channels to authenticated;

-- NOTE: user_roles is a protected table; users can only read their own role.
create policy marketing_system_read on public.marketing_system for select to authenticated
using (exists(select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role in ('owner','admin')));
create policy marketing_system_owner on public.marketing_system for update to authenticated
using (exists(select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role='owner'))
with check (exists(select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role='owner'));
create policy marketing_assets_read on public.marketing_assets for select to authenticated
using (exists(select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role in ('owner','admin')));
create policy marketing_assets_add on public.marketing_assets for insert to authenticated
with check (created_by=(select auth.uid()) and status='draft' and
 exists(select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role in ('owner','admin')));
create policy marketing_assets_owner_edit on public.marketing_assets for update to authenticated
using (exists(select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role='owner'))
with check (exists(select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role='owner'));
create policy marketing_ai_runs_read on public.marketing_ai_runs for select to authenticated
using (exists(select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role in ('owner','admin')));
create policy marketing_jobs_read on public.marketing_publication_jobs for select to authenticated
using (exists(select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role in ('owner','admin')));
create policy marketing_jobs_enqueue on public.marketing_publication_jobs for insert to authenticated
with check (state='queued' and provider_post_id is null and attempt_count=0
and created_by=(select auth.uid()) and
exists(select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role='owner'));
create policy marketing_channel_owner_update on public.marketing_channels for update to authenticated
using (exists(select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role='owner'))
with check (exists(select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role='owner'));

-- Audit: marketing_system has no brand_slug/id; give it a separate auditable trigger.
create function private.marketing_system_audit() returns trigger language plpgsql
security definer set search_path='' as $$
begin
 insert into public.marketing_audit(brand_slug,entity,entity_id,operation,actor_id,prior,current)
 values(null,'marketing_system','global','UPDATE',auth.uid(),to_jsonb(old),to_jsonb(new));
 return new;
end $$;
revoke all on function private.marketing_system_audit() from public,anon,authenticated;
create trigger marketing_system_changes after update on public.marketing_system
for each row execute function private.marketing_system_audit();
create trigger marketing_asset_changes after insert or update on public.marketing_assets
for each row execute function private.record_marketing_change();
create trigger marketing_ai_changes after insert or update on public.marketing_ai_runs
for each row execute function private.record_marketing_change();
create trigger marketing_job_changes after insert or update on public.marketing_publication_jobs
for each row execute function private.record_marketing_change();

-- A private storage bucket for owner-reviewed assets. Never publish its objects by default.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('marketing-media','marketing-media',false,10485760,array['image/png','image/jpeg'])
on conflict (id) do nothing;
-- Storage access is via the existing server-only Supabase admin client, not client credentials.
