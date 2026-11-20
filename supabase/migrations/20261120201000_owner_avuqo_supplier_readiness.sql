-- Private, read-only operational totals. No prices, feed URLs, advertiser
-- correspondence or product prose are exposed to ordinary API clients.
-- All publication rights and existing first-offer gates remain unchanged.
create or replace function public.owner_avuqo_supplier_readiness_v1()
returns jsonb
language sql stable security invoker
set search_path = public, pg_temp
as $$
 with accepted as (
  select programme_name,external_account_id as advertiser_id,
         status as registry_status,metadata
  from public.affiliate_programs
  where provider='awin' and region='GB'
    and metadata->'owner_joined_accepted_attestation'->>'membership_status'='accepted'
 ),
 feed as (
  select advertiser_id,count(distinct feed_id) as observed_feeds,
         coalesce(sum(greatest(coalesce(listed_products,0),0)),0) as supplier_reported_items,
         count(*) filter (where needs_private_refresh) as refresh_flags,
         max(observed_at) as last_observation
  from public.awin_feed_update_observations group by advertiser_id
 ),
 profile as (
  select advertiser_id,
         count(distinct feed_id) filter (where exists (
          select 1 from unnest(coalesce(safe_column_names,ARRAY[]::text[])) as description_column(name)
          where lower(description_column.name) in ('description','structured_description','product_short_description','short_description','long_description')
         )) as feeds_with_description_column
  from public.awin_feed_schema_profiles group by advertiser_id
 ),
 staged as (
  -- The existing private readiness view already owns the historical row
  -- totals. A second COUNT(DISTINCT) across repeated private snapshots
  -- exceeded the live statement timeout. Sample at most 100 rows from
  -- the most recent import; never portray this as exhaustive coverage.
  select s.advertiser_id,s.private_rows,
         s.latest_private_import_at as last_private_import,
         coalesce(sample.sampled_rows,0) as private_sample_rows,
         coalesce(sample.described_rows,0) as private_sample_descriptions,
         coalesce(sample.rights_rows,0) as private_sample_rights_marked
  from public.awin_private_product_readiness s
  left join lateral (
   select fr.id from public.feed_import_runs fr
   where fr.merchant_id=s.advertiser_id
   order by fr.created_at desc limit 1
  ) latest on true
  left join lateral (
   select count(*) as sampled_rows,
          count(*) filter (where length(btrim(coalesce(x.metadata->>'source_description','')))>=32) as described_rows,
          count(*) filter (where x.metadata->>'source_description_rights_confirmed'='true') as rights_rows
   from (
    select fr.metadata from public.feed_import_records fr
    where fr.import_id=latest.id limit 100
   ) x
  ) sample on true
 ),
 canonical as (
  select m.metadata->>'external_id' as advertiser_id,
         count(distinct p.id) filter (where o.status='active' and p.status='active') as active_products,
         count(distinct p.id) filter (where o.status='active' and p.status='active'
          and length(btrim(coalesce(p.description,'')))>=32) as active_described_products
  from public.offers o join public.products p on p.id=o.product_id
  join public.merchants m on m.id=o.merchant_id
  group by m.metadata->>'external_id'
 ),
 released as (
  select m.metadata->>'external_id' as advertiser_id,
         count(*) filter (where d.status='published') as published_candidates,
         count(*) filter (where d.status='held') as held_candidates
  from public.published_deals d join public.offers o on o.id=d.offer_id
  join public.merchants m on m.id=o.merchant_id
  group by m.metadata->>'external_id'
 )
 select jsonb_build_object(
  'as_of',now(),
  'explanation','Counts include repeated private snapshots and published candidates that may fail live offer verification; no publication rights are implied',
  'programmes',coalesce(jsonb_agg(jsonb_build_object(
    'programme',p.programme_name,
    'advertiser_id',p.advertiser_id,
    'registry_status',p.registry_status,
    'observed_feeds',coalesce(f.observed_feeds,0),
    'supplier_reported_items',coalesce(f.supplier_reported_items,0),
    'refresh_flags',coalesce(f.refresh_flags,0),
    'last_observation',f.last_observation,
    'feeds_with_description_column',coalesce(pr.feeds_with_description_column,0),
    'private_rows',coalesce(s.private_rows,0),
    'private_sample_rows',coalesce(s.private_sample_rows,0),
    'private_sample_descriptions',coalesce(s.private_sample_descriptions,0),
    'private_sample_rights_marked',coalesce(s.private_sample_rights_marked,0),
    'last_private_import',s.last_private_import,
    'active_products',coalesce(c.active_products,0),
    'active_described_products',coalesce(c.active_described_products,0),
    'published_candidates',coalesce(r.published_candidates,0),
    'held_candidates',coalesce(r.held_candidates,0),
    'product_description_rights_verified',p.metadata->>'product_description_rights_verified'='true'
  ) order by p.programme_name),'[]'::jsonb)
 ) from accepted p
 left join feed f on f.advertiser_id=p.advertiser_id
 left join profile pr on pr.advertiser_id=p.advertiser_id
 left join staged s on s.advertiser_id=p.advertiser_id
 left join canonical c on c.advertiser_id=p.advertiser_id
 left join released r on r.advertiser_id=p.advertiser_id;
$$;
revoke all on function public.owner_avuqo_supplier_readiness_v1() from public, anon, authenticated;
grant execute on function public.owner_avuqo_supplier_readiness_v1() to service_role;
comment on function public.owner_avuqo_supplier_readiness_v1()
is 'Private administrative aggregate for accepted Awin suppliers; not product publication, licence or verified consumer availability';
