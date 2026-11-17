-- An exact tyre SKU page must independently pass every live listing gate.
create or replace function public.get_verified_tyres_uk_product(
 p_sku text)
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
 where f.merchant_id='12715' and f.merchant_product_id=p_sku
  and length(p_sku) between 1 and 250 and f.status='review' and f.reviewed_at is null
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
 order by f.title,f.merchant_product_id
 limit 1;
$function$;
revoke all on function public.get_verified_tyres_uk_product(text) from public,anon,authenticated;
grant execute on function public.get_verified_tyres_uk_product(text) to service_role;
