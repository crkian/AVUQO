
-- Ordinary source-verified tyre shopping listings, separate from scored DEALS.
-- Source-verified unit-price listings are NOT vehicle-fitment or fitted quotes.
create table if not exists public.awin_tyre_live_observations(
 advertiser_id text not null check (advertiser_id='12715'),
 feed_id text not null check (feed_id='93988'),
 snapshot_sha256 text not null check(snapshot_sha256 ~ '^[a-f0-9]{64}$'),
 row_count integer not null check(row_count between 1 and 100000),
 observed_at timestamptz not null default now(),
 provenance text not null default 'current_authenticated_awin_full_download'
  check(provenance='current_authenticated_awin_full_download'),
 primary key(advertiser_id,feed_id,snapshot_sha256)
);
create index if not exists awin_tyre_live_observations_latest_idx
 on public.awin_tyre_live_observations(observed_at desc);
alter table public.awin_tyre_live_observations enable row level security;
revoke all on public.awin_tyre_live_observations from public,anon,authenticated;
grant select,insert,update on public.awin_tyre_live_observations to service_role;

create or replace function public.recheck_tyres_uk_exact_private_batch(
 p_digest text,p_products jsonb)
returns table(sku text)
language plpgsql security definer set search_path='' as $function$
declare v_observed timestamptz;
begin
 if p_digest !~ '^[a-f0-9]{64}$' or jsonb_typeof(p_products)<>'array'
  or jsonb_array_length(p_products) not between 1 and 1200 then
  raise exception 'Invalid exact tyre source cohort';
 end if;
 select observed_at into v_observed
 from public.awin_tyre_live_observations where advertiser_id='12715'
 and feed_id='93988' and snapshot_sha256=p_digest
 and provenance='current_authenticated_awin_full_download'
 order by observed_at desc limit 1;
 if v_observed is null or v_observed<now()-interval '15 minutes'
    or v_observed>now()+interval '2 minutes' then
  raise exception 'Fresh authenticated tyre feed receipt required';
 end if;
 if not exists (select 1 from public.sources s join public.affiliate_programs a
   on a.provider='awin' and a.region='GB' and a.external_account_id='12715'
   where s.connector_key='awin' and s.status='active' and s.sync_enabled=true
   and s.credential_status='ready'
   and s.metadata->>'owner_attested_release_enabled'='true'
   and a.metadata->>'publication_approved'='true'
   and a.metadata->'owner_joined_accepted_attestation'->>'membership_status'='accepted')
 then raise exception 'Approved tyre source unavailable'; end if;
 if (select count(*) from public.system_controls c where
    (c.control_key='source_ingestion' and c.enabled=true)
    or (c.control_key='global_emergency_stop' and c.enabled=false))<>2
 then raise exception 'Tyre ingestion stopped'; end if;
 return query
 with fresh as (
  select distinct on (v.sku) v.*
  from jsonb_to_recordset(p_products) as v(
   sku text,title text,price numeric,link text,image text,stock text,images jsonb)
  where length(v.sku) between 1 and 250
   and length(v.title) between 1 and 500
   and v.price>0 and v.price<=100000
   and v.stock in ('in_stock','available','low_stock')
   and v.image ~ '^https://[^/]+/'
   and length(v.image)<=2048
   and jsonb_typeof(v.images)='array'
   and (
    (v.link ~ '^https://(www[.])?awin1[.]com/pclick[.]php[?]'
      and v.link ~ '([?]|&)m=12715(&|$)'
      and v.link ~ '([?]|&)a=3135746(&|$)'
      and v.link ~ '([?]|&)p=[^&]+')
    or
    (v.link ~ '^https://(www[.])?awin1[.]com/cread[.]php[?]'
      and v.link ~ '([?]|&)awinmid=12715(&|$)'
      and v.link ~ '([?]|&)awinaffid=3135746(&|$)')
   )
  order by v.sku,v.price
 ), updated as (
  update public.feed_import_records f set
   image_url=fresh.image,
   metadata=coalesce(f.metadata,'{}'::jsonb)||jsonb_build_object(
    'live_feed_verified_at',v_observed,
    'live_feed_digest',p_digest,
    'live_feed_verification','exact_authenticated_feed_digest_rechecked',
    'verified_awin_deep_link',fresh.link,
    'tracking_link_verified',true,
    'source_image_rights_confirmed',true,
    'source_image_permission_basis','owner_attested_accepted_programmes_2026_11_17',
    'source_currency_explicit',true,
    'availability',fresh.stock,
    'supplied_image_gallery',fresh.images,
    'listing_kind','physical_product',
    'tyre_unit_price_only',true,
    'tyre_vehicle_fitment_verified',false,
    'tyre_installed_price_verified',false)
  from fresh where f.merchant_id='12715'
   and f.status='review' and f.reviewed_at is null
   and f.merchant_product_id=fresh.sku
   and f.title=fresh.title and f.price=fresh.price
   and f.currency='GBP' and f.metadata->>'feed_id'='93988'
   and f.metadata->>'tracking_link_verified'='true'
  returning f.merchant_product_id
 )
 select distinct u.merchant_product_id from updated u;
end;
$function$;
revoke all on function public.recheck_tyres_uk_exact_private_batch(text,jsonb)
 from public,anon,authenticated;
grant execute on function public.recheck_tyres_uk_exact_private_batch(text,jsonb)
 to service_role;

create or replace function public.get_verified_tyres_uk_shop(
 p_width integer default null,p_profile integer default null,
 p_rim integer default null,p_limit integer default 48,p_offset integer default 0)
returns table(
 sku text,title text,brand text,price numeric,
 image_url text,affiliate_url text,images jsonb,
 width integer,profile integer,rim integer,
 supplier_category text,observed_at timestamptz)
language sql stable security definer set search_path='' as $function$
 with current_feed as(
  select snapshot_sha256,observed_at
  from public.awin_tyre_live_observations
  where advertiser_id='12715' and feed_id='93988'
   and observed_at>=now()-interval '2 hours'
   and observed_at<=now()+interval '2 minutes'
  order by observed_at desc limit 1
 )
 select f.merchant_product_id,f.title,f.brand,f.price,f.image_url,
  f.metadata->>'verified_awin_deep_link',
  coalesce(f.metadata->'supplied_image_gallery','[]'::jsonb),
  case when f.metadata->>'tyre_size_conflict'='true' then null
   else (f.metadata->'tyre_size_candidate'->>'width_mm')::integer end,
  case when f.metadata->>'tyre_size_conflict'='true' then null
   else (f.metadata->'tyre_size_candidate'->>'aspect_ratio')::integer end,
  case when f.metadata->>'tyre_size_conflict'='true' then null
   else (f.metadata->'tyre_size_candidate'->>'rim_inches')::integer end,
  f.category,current_feed.observed_at
 from public.feed_import_records f
 join current_feed on current_feed.snapshot_sha256=f.metadata->>'live_feed_digest'
 where f.merchant_id='12715' and f.status='review' and f.reviewed_at is null
  and f.metadata->>'feed_id'='93988' and f.currency='GBP' and f.price>0
  and f.metadata->>'live_feed_verification'='exact_authenticated_feed_digest_rechecked'
  and f.metadata->>'tracking_link_verified'='true'
  and f.metadata->>'source_image_rights_confirmed'='true'
  and f.metadata->>'availability' in ('in_stock','available','low_stock')
  and f.metadata->>'listing_kind'='physical_product'
  and f.image_url ~ '^https://[^/]+/'
  and (
   (f.metadata->>'verified_awin_deep_link' ~ '^https://(www[.])?awin1[.]com/pclick[.]php[?]'
    and f.metadata->>'verified_awin_deep_link' ~ '([?]|&)m=12715(&|$)'
    and f.metadata->>'verified_awin_deep_link' ~ '([?]|&)a=3135746(&|$)')
   or
   (f.metadata->>'verified_awin_deep_link' ~ '^https://(www[.])?awin1[.]com/cread[.]php[?]'
    and f.metadata->>'verified_awin_deep_link' ~ '([?]|&)awinmid=12715(&|$)'
    and f.metadata->>'verified_awin_deep_link' ~ '([?]|&)awinaffid=3135746(&|$)')
  )
  and exists(select 1 from public.sources s where s.connector_key='awin'
   and s.status='active' and s.sync_enabled=true
   and s.credential_status='ready' and s.metadata->>'owner_attested_release_enabled'='true')
  and exists(select 1 from public.affiliate_programs a where a.provider='awin'
   and a.region='GB' and a.external_account_id='12715'
   and a.metadata->>'publication_approved'='true'
   and a.metadata->'owner_joined_accepted_attestation'->>'membership_status'='accepted')
  and (select count(*) from public.system_controls c where
   (c.control_key='source_ingestion' and c.enabled=true)
   or (c.control_key='global_emergency_stop' and c.enabled=false))=2
  and (p_width is null or (f.metadata->'tyre_size_candidate'->>'width_mm')::integer=p_width)
  and (p_profile is null or (f.metadata->'tyre_size_candidate'->>'aspect_ratio')::integer=p_profile)
  and (p_rim is null or (f.metadata->'tyre_size_candidate'->>'rim_inches')::integer=p_rim)
 order by f.title,f.merchant_product_id
 limit least(greatest(coalesce(p_limit,48),1),100)
 offset least(greatest(coalesce(p_offset,0),0),100000);
$function$;
revoke all on function public.get_verified_tyres_uk_shop(integer,integer,integer,integer,integer)
 from public,anon,authenticated;
grant execute on function public.get_verified_tyres_uk_shop(integer,integer,integer,integer,integer)
 to service_role;
