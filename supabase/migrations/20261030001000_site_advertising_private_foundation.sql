-- First-party AVUQO third-party advertiser workspace. PRIVATE; NO public rendering,
-- sale, payment, traffic delivery, or connection to brand social marketing.
create table public.site_advertisers (
 id uuid primary key default gen_random_uuid(),
 company_name text not null check(length(trim(company_name)) between 2 and 120),
 contact_name text not null check(length(trim(contact_name)) between 2 and 120),
 contact_email text not null check(length(trim(contact_email)) between 5 and 200),
 website text not null check(website ~ '^https://[a-zA-Z0-9.-]+([/][^[:space:]]*)?$'),
 status text not null default 'prospect' check(status in ('prospect','verified','declined')),
 verification_note text not null default '',
 verified_by uuid references auth.users(id),
 verified_at timestamptz,
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint site_advertiser_verified check(
  (status='verified' and verified_by is not null and verified_at is not null and length(trim(verification_note))>=8)
  or (status<>'verified' and verified_by is null and verified_at is null)
 )
);
create index site_advertisers_status_idx on public.site_advertisers(status,created_at desc);
create table public.site_ad_campaigns (
 id uuid primary key default gen_random_uuid(),
 advertiser_id uuid not null references public.site_advertisers(id) on delete restrict,
 title text not null check(length(trim(title)) between 6 and 110),
 headline text not null check(length(trim(headline)) between 8 and 120),
 body text not null check(length(trim(body)) between 15 and 350),
 cta_label text not null check(length(trim(cta_label)) between 3 and 35),
 target_url text not null check(target_url ~ '^https://[a-zA-Z0-9.-]+([/][^[:space:]]*)?$'),
 zone text not null check(zone in ('homepage_feature','category_sponsor','article_sponsor')),
 starts_at timestamptz not null,
 ends_at timestamptz not null,
 status text not null default 'draft' check(status in ('draft','in_review','ready','paused','declined')),
 rights_note text not null default '',
 disclosure_text text not null default 'Advertisement' check(disclosure_text in ('Advertisement','Sponsored')),
 approved_by uuid references auth.users(id),
 approved_at timestamptz,
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint site_ad_dates check(ends_at>starts_at),
 constraint site_ad_approval_check check(
  (status in ('ready','paused') and approved_by is not null and approved_at is not null and length(trim(rights_note))>=8)
  or (status not in ('ready','paused') and approved_by is null and approved_at is null)
 )
);
create index site_ad_campaigns_status_idx on public.site_ad_campaigns(status,starts_at,ends_at);
create index site_ad_campaigns_advertiser_idx on public.site_ad_campaigns(advertiser_id,created_at desc);
create table public.site_ad_audit(
 id bigint generated always as identity primary key,
 entity text not null,
 entity_id uuid not null,
 operation text not null check(operation in ('INSERT','UPDATE')),
 actor_id uuid,
 before_record jsonb,
 after_record jsonb,
 recorded_at timestamptz not null default now()
);
create function private.site_advertising_guard() returns trigger
language plpgsql set search_path='' as $$
begin
 if tg_table_name='site_ad_campaigns' then
  if new.status in ('ready','paused') and not exists (
   select 1 from public.site_advertisers a
    where a.id=new.advertiser_id and a.status='verified'
  ) then raise exception 'Only verified advertisers may have ready campaigns'; end if;
  if tg_op='UPDATE' and old.status in ('ready','paused') and (
   new.advertiser_id is distinct from old.advertiser_id or
   new.title is distinct from old.title or
   new.headline is distinct from old.headline or
   new.body is distinct from old.body or
   new.target_url is distinct from old.target_url or
   new.zone is distinct from old.zone or
   new.starts_at is distinct from old.starts_at or
   new.ends_at is distinct from old.ends_at or
   new.rights_note is distinct from old.rights_note or
   new.disclosure_text is distinct from old.disclosure_text
  ) then raise exception 'Reviewed ad creative is immutable; create a new draft'; end if;
 end if;
 if tg_table_name='site_advertisers' and tg_op='UPDATE' and old.status='verified' and (
  new.company_name is distinct from old.company_name or
  new.contact_email is distinct from old.contact_email or
  new.website is distinct from old.website
 ) then raise exception 'Verified advertiser identity is locked; create a new review'; end if;
 return new;
end $$;
revoke all on function private.site_advertising_guard() from public,anon,authenticated;
create trigger site_advertiser_guard before insert or update on public.site_advertisers
 for each row execute function private.site_advertising_guard();
create trigger site_ad_campaign_guard before insert or update on public.site_ad_campaigns
 for each row execute function private.site_advertising_guard();

create function private.record_site_ad_change() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 insert into public.site_ad_audit(entity,entity_id,operation,actor_id,before_record,after_record)
 values(tg_table_name,new.id,tg_op,auth.uid(),
  case when tg_op='UPDATE' then to_jsonb(old) else null end,
  to_jsonb(new));
 return new;
end $$;
revoke all on function private.record_site_ad_change() from public,anon,authenticated;
create trigger site_advertiser_audit after insert or update on public.site_advertisers
 for each row execute function private.record_site_ad_change();
create trigger site_ad_campaign_audit after insert or update on public.site_ad_campaigns
 for each row execute function private.record_site_ad_change();

alter table public.site_advertisers enable row level security;
alter table public.site_ad_campaigns enable row level security;
alter table public.site_ad_audit enable row level security;
revoke all on public.site_advertisers,public.site_ad_campaigns,public.site_ad_audit
 from public,anon,authenticated;
grant select,insert,update on public.site_advertisers,public.site_ad_campaigns to authenticated;
grant select on public.site_ad_audit to authenticated;
create policy site_advertiser_staff_read on public.site_advertisers for select to authenticated
 using(exists(select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role in ('owner','admin')));
create policy site_advertiser_owner_insert on public.site_advertisers for insert to authenticated
 with check(status='prospect' and created_by=(select auth.uid()) and
 exists(select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role='owner'));
create policy site_advertiser_owner_update on public.site_advertisers for update to authenticated
 using(exists(select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role='owner'))
 with check(exists(select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role='owner'));
create policy site_ad_campaign_staff_read on public.site_ad_campaigns for select to authenticated
 using(exists(select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role in ('owner','admin')));
create policy site_ad_campaign_owner_insert on public.site_ad_campaigns for insert to authenticated
 with check(status='draft' and created_by=(select auth.uid()) and
 exists(select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role='owner'));
create policy site_ad_campaign_owner_update on public.site_ad_campaigns for update to authenticated
 using(exists(select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role='owner'))
 with check(exists(select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role='owner'));
create policy site_ad_audit_staff_read on public.site_ad_audit for select to authenticated
 using(exists(select 1 from public.user_roles r where r.user_id=(select auth.uid()) and r.role in ('owner','admin')));
-- NO select or write permission for anonymous users, NO public ad-serving policy.
