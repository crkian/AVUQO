-- Awin update discovery, no signed links, products, prices or publication rights.
create table if not exists public.awin_feed_update_observations (
 advertiser_id text not null check (advertiser_id ~ '^[0-9]{1,9}$'),
 feed_id text not null check (feed_id ~ '^[A-Za-z]?[0-9]{1,12}$'),
 advertiser_name text not null,
 feed_name text not null,
 feed_format text not null,
 listed_products integer not null check(listed_products>=0),
 last_imported_source text not null,
 last_checked_source text not null,
 observed_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 change_count integer not null default 0 check(change_count>=0),
 needs_private_refresh boolean not null default false,
 primary key (advertiser_id,feed_id)
);
create table if not exists public.awin_feed_discovery_runs (
 id bigint generated always as identity primary key,
 checked_at timestamptz not null default now(),
 active_feeds integer not null check(active_feeds>=0),
 joined_feeds integer not null check(joined_feeds>=0),
 changed_feeds integer not null check(changed_feeds>=0),
 note text not null default 'Metadata only; no downloads or publishing'
);
alter table public.awin_feed_update_observations enable row level security;
alter table public.awin_feed_discovery_runs enable row level security;
revoke all on public.awin_feed_update_observations from public,anon,authenticated;
revoke all on public.awin_feed_discovery_runs from public,anon,authenticated;
grant select,insert,update,delete on public.awin_feed_update_observations to service_role;
grant select,insert on public.awin_feed_discovery_runs to service_role;
grant usage,select on sequence public.awin_feed_discovery_runs_id_seq to service_role;

-- Atomic upsert and changed marker; never store incoming signed URLs.
create or replace function public.record_awin_feed_discovery(p_feeds jsonb,p_active integer)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare
 f jsonb;v_changed integer:=0;v_total integer:=0;v_existing public.awin_feed_update_observations%rowtype;
begin
 if jsonb_typeof(p_feeds)<>'array' or jsonb_array_length(p_feeds)>5000 then
  raise exception 'Invalid feed metadata batch';
 end if;
 for f in select value from jsonb_array_elements(p_feeds) loop
  if f->>'advertiserId' !~ '^[0-9]{1,9}$' or
     f->>'feedId' !~ '^[A-Za-z]?[0-9]{1,12}$' or
     length(coalesce(f->>'advertiserName',''))>120 or
     length(coalesce(f->>'feedName',''))>120 then
    raise exception 'Invalid source identifier or name';
  end if;
  v_total:=v_total+1;
  select * into v_existing from public.awin_feed_update_observations
   where advertiser_id=f->>'advertiserId' and feed_id=f->>'feedId' for update;
  if found then
   if v_existing.last_imported_source is distinct from coalesce(f->>'lastImported','') then v_changed:=v_changed+1;end if;
   update public.awin_feed_update_observations set
    advertiser_name=f->>'advertiserName',feed_name=f->>'feedName',
    feed_format=coalesce(f->>'format',''),
    listed_products=greatest(0,coalesce((f->>'products')::integer,0)),
    last_imported_source=coalesce(f->>'lastImported',''),
    last_checked_source=coalesce(f->>'lastChecked',''),
    observed_at=now(),updated_at=now(),
    change_count=change_count+case when v_existing.last_imported_source is distinct from coalesce(f->>'lastImported','') then 1 else 0 end,
    needs_private_refresh=needs_private_refresh or v_existing.last_imported_source is distinct from coalesce(f->>'lastImported','')
   where advertiser_id=f->>'advertiserId' and feed_id=f->>'feedId';
  else
   insert into public.awin_feed_update_observations (
    advertiser_id,feed_id,advertiser_name,feed_name,feed_format,listed_products,
    last_imported_source,last_checked_source,needs_private_refresh)
    values(f->>'advertiserId',f->>'feedId',f->>'advertiserName',f->>'feedName',
    coalesce(f->>'format',''),greatest(0,coalesce((f->>'products')::integer,0)),
    coalesce(f->>'lastImported',''),coalesce(f->>'lastChecked',''),false);
  end if;
 end loop;
 insert into public.awin_feed_discovery_runs(active_feeds,joined_feeds,changed_feeds)
 values(p_active,v_total,v_changed);
 return jsonb_build_object('joined_feeds',v_total,'changed_feeds',v_changed,'metadata_only',true);
end $$;
revoke all on function public.record_awin_feed_discovery(jsonb,integer) from public,anon,authenticated;
grant execute on function public.record_awin_feed_discovery(jsonb,integer) to service_role;
