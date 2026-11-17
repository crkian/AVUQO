-- Verified-product discovery is distinct from scored published DEALS.
-- Only truly rechecked Tooled Up 496 / Awin 89987 rows are eligible.
-- An unchanged authenticated gzip digest proves that previously inspected
-- source rows still have identical price and stock at the latest observation.
-- This is READ ONLY, never promotes an unverified imported product to a deal.
create or replace function public.get_verified_tooled_up_catalogue(
 p_limit integer default 60,
 p_offset integer default 0
)
returns table(
 sku text,title text,price numeric,category_name text,
 image_url text,affiliate_url text,images jsonb,feed_observed_at timestamptz
)
language sql stable security definer
set search_path=''
as $function$
 with fresh_observation as (
  select snapshot_sha256,observed_at
  from public.awin_tooled_up_snapshot_observations
  where advertiser_id='496' and feed_id='89987'
   and evidence_kind='authenticated_awin_download_and_storage_readback'
   and observed_at>=now()-interval '2 hours'
   and observed_at<=now()+interval '2 minutes'
  order by observed_at desc limit 1
 ), validated as (
  select snapshot_sha256 from public.awin_private_snapshot_validations
  where advertiser_id='496' and feed_id='89987'
   and critical_issues=0 and duplicate_product_ids=0
   and invalid_price_rows=0 and unverified_affiliate_links=0
 )
 select f.merchant_product_id,f.title,f.price,f.category,
  f.image_url,f.metadata->>'verified_awin_deep_link',
  coalesce(f.metadata->'supplied_image_gallery','[]'::jsonb),
  observation.observed_at
 from public.feed_import_records f
 join fresh_observation observation
   on observation.snapshot_sha256=f.metadata->>'live_feed_digest'
 join validated v on v.snapshot_sha256=observation.snapshot_sha256
 where f.merchant_id='496'
   and f.status='review' and f.reviewed_at is null
   and f.currency='GBP' and f.price>0 and f.price<=1000000
   and f.merchant_product_id is not null and length(f.merchant_product_id)>0
   and length(f.title)>0
   and f.metadata->>'feed_id'='89987'
   and f.metadata->>'live_feed_verification'='exact_authenticated_feed_digest_rechecked'
   and f.metadata->>'tracking_link_verified'='true'
   and f.metadata->>'source_image_rights_confirmed'='true'
   and f.metadata->>'listing_kind'='physical_product'
   and f.metadata->>'availability' in ('in_stock','low_stock','available')
   and f.image_url ~ '^https://(www[.]tooled-up[.]com|images2[.]productserve[.]com)/'
   and f.metadata->>'verified_awin_deep_link' ~ '^https://www[.]awin1[.]com/pclick[.]php[?]'
   and f.metadata->>'verified_awin_deep_link' ~ '([?]|&)m=496(&|$)'
   and f.metadata->>'verified_awin_deep_link' ~ '([?]|&)a=3135746(&|$)'
   and f.metadata->>'verified_awin_deep_link' ~ '([?]|&)p=[^&]+'
   and exists(select 1 from public.sources s
    where s.connector_key='awin' and s.status='active'
     and s.sync_enabled and s.credential_status='ready'
     and s.metadata->>'owner_attested_release_enabled'='true'
     and s.metadata->>'image_rights_confirmed'='true')
   and exists(select 1 from public.affiliate_programs a
    where a.provider='awin' and a.region='GB'
     and a.external_account_id='496'
     and a.metadata->>'publication_approved'='true'
     and a.metadata->'owner_joined_accepted_attestation'->>'membership_status'='accepted')
   and (select count(*) from public.system_controls c where
     (c.control_key='source_ingestion' and c.enabled=true)
     or (c.control_key='global_emergency_stop' and c.enabled=false)
   )=2
 order by f.title asc,f.merchant_product_id asc
 limit least(greatest(coalesce(p_limit,60),1),100)
 offset least(greatest(coalesce(p_offset,0),0),100000);
$function$;
revoke all on function public.get_verified_tooled_up_catalogue(integer,integer)
 from public,anon,authenticated;
grant execute on function public.get_verified_tooled_up_catalogue(integer,integer)
 to service_role;
comment on function public.get_verified_tooled_up_catalogue(integer,integer) is
 'Public-facing product discovery data, read only via service-role server: accepts only currently authenticated Tooled Up feed-backed listings with owner-accepted image/link rights, never indicates deal approval or free delivery.';
