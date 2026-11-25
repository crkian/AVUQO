-- Owner attestation recorded 25 Nov 2026. No claim of independently inspected merchant terms.
-- Existing accepted/approved roster only; do not change membership, source switches, identities or review status.
update public.affiliate_programs set metadata=coalesce(metadata,'{}'::jsonb)||jsonb_build_object(
 'product_description_rights_verified',true,
 'owner_full_content_attestation_2026_11_25',jsonb_build_object('date','2026-11-25','basis','explicit_owner_chat_attestation','scope','full supplied feeds, product descriptions, specifications, variants, photographs and retailer content for accepted programmes','independent_contract_verification',false))
where provider='awin' and region='GB' and metadata->>'publication_approved'='true' and metadata->'owner_joined_accepted_attestation'->>'membership_status'='accepted';
CREATE OR REPLACE FUNCTION public.recheck_tooled_up_exact_private_cohort(p_sha256 text, p_rows jsonb)
 RETURNS TABLE(merchant_product_id text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_observed timestamptz; v_count int;
begin
 if p_sha256 !~ '^[a-f0-9]{64}$' or jsonb_typeof(p_rows)<>'array' then
  raise exception 'Invalid private cohort';
 end if;
 v_count:=jsonb_array_length(p_rows);
 if v_count<1 or v_count>1500 then raise exception 'Cohort out of bounds'; end if;
 select x.observed_at into v_observed
 from public.awin_tooled_up_snapshot_observations x
 where x.advertiser_id='496' and x.feed_id='89987'
  and x.snapshot_sha256=p_sha256
  and x.evidence_kind='authenticated_awin_download_and_storage_readback'
 order by x.observed_at desc limit 1;
 if v_observed is null or v_observed<now()-interval '15 minutes' or
  v_observed>now()+interval '2 minutes' then
  raise exception 'Recent authenticated Tooled Up receipt required';
 end if;
 if not exists (
  select 1 from public.sources s join public.affiliate_programs a
   on a.provider='awin' and a.region='GB' and a.external_account_id='496'
  where s.connector_key='awin' and s.status='active' and s.sync_enabled=true
   and s.credential_status='ready'
   and s.metadata->>'owner_attested_release_enabled'='true'
   and a.metadata->>'publication_approved'='true'
   and a.metadata->'owner_joined_accepted_attestation'->>'membership_status'='accepted'
 ) then raise exception 'Tooled Up source and approval unavailable'; end if;
 if (select count(*) from public.system_controls c where
    (c.control_key='source_ingestion' and c.enabled=true) or
    (c.control_key='global_emergency_stop' and c.enabled=false))<>2 then
   raise exception 'Tooled Up ingestion controls blocked';
 end if;
 return query
 with parsed as (
  select distinct on (r.sku) r.sku,r.title,r.price,r.link,r.image,r.stock,r.images,r.description,r.attributes
  from jsonb_to_recordset(p_rows) as r(
   sku text,title text,price numeric,link text,image text,stock text,images jsonb,description text,attributes jsonb)
  where length(r.sku) between 1 and 250
   and length(r.title) between 1 and 1200
   and r.price>0 and r.price<=1000000
   and r.stock in ('in_stock','low_stock')
   and r.link ~ '^https://www[.]awin1[.]com/pclick[.]php[?]'
   and r.link ~ '([?]|&)m=496(&|$)'
   and r.link ~ '([?]|&)a=3135746(&|$)'
   and r.link ~ '([?]|&)p=[^&]+'
   and r.image ~ '^https://[^/]+/'
   and length(r.image)<=2048
   and jsonb_typeof(r.images)='array'
  order by r.sku,r.price
 ), updated as (
  update public.feed_import_records f
  set metadata=coalesce(f.metadata,'{}'::jsonb)||jsonb_build_object(
   'live_feed_verified_at',v_observed,
   'live_feed_digest',p_sha256,
   'live_feed_verification','exact_authenticated_feed_digest_rechecked',
   'live_digest_kind','gzip_storage_snapshot_sha256',
   'verified_awin_deep_link',r.link,
   'tracking_link_verified',true,
   'availability',r.stock,
   'listing_kind','physical_product',
   'source_currency_explicit',false,
   'currency_source','tooled_up_uk_GBP_storefront_and_exact_staged_price_match',
   'source_image_rights_confirmed',true,
   'image_permission_basis','owner_attested_all_accepted_programmes_2026_11_17',
   'supplied_image_gallery',r.images,
   'source_description',case when length(r.description) between 32 and 10000 then r.description else null end,
   'source_catalogue_fields',case when jsonb_typeof(r.attributes)='object' and length(r.attributes::text)<=8000 then r.attributes else '{}'::jsonb end,
   'source_description_verified_digest',case when length(r.description) between 32 and 10000 then p_sha256 else null end,
   'source_catalogue_verified_digest',p_sha256,
   'source_description_rights_confirmed',length(coalesce(r.description,'')) between 32 and 10000 and exists(select 1 from public.affiliate_programs a where a.provider='awin' and a.region='GB' and a.external_account_id='496' and a.metadata->>'product_description_rights_verified'='true'),
   'source_catalogue_rights_confirmed',exists(select 1 from public.affiliate_programs a where a.provider='awin' and a.region='GB' and a.external_account_id='496' and a.metadata->>'product_description_rights_verified'='true')
  ),image_url=r.image
  from parsed r
  where f.merchant_id='496' and f.merchant_product_id=r.sku
   and f.title=r.title and f.price=r.price and f.currency='GBP'
   and f.status='review' and f.reviewed_at is null
   and f.metadata->>'feed_id'='89987'
   and f.metadata->>'tracking_link_verified'='true'
   -- Legacy 84k rows have verified tracking flags but no stored deep-link
   -- metadata. Revalidate the fresh Awin link from the authenticated gzip,
   -- retaining equality for the 20 already populated newer rows.
   and (nullif(f.metadata->>'verified_awin_deep_link','') is null
        or f.metadata->>'verified_awin_deep_link'=r.link)
  returning f.merchant_product_id
 )
 select distinct u.merchant_product_id from updated u;
end; $function$
;
revoke all on function public.recheck_tooled_up_exact_private_cohort(text,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.recheck_tooled_up_exact_private_cohort(text,jsonb) to service_role;
;
