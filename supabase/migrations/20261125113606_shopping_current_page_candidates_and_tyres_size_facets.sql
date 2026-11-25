create or replace function public.shopping_catalogue_page_ids(p_query text default '',p_advertiser text default '',p_sort text default 'recent',p_offset integer default 0,p_limit integer default 37)
returns table(offer_id uuid)
language sql stable security invoker set search_path='' as $$
 select o.id from public.awin_shopping_release_reviews r
 join public.offers o on o.id=r.offer_id
 join public.products p on p.id=o.product_id
 join public.merchants m on m.id=o.merchant_id
 join public.sources s on s.id=o.source_id
 join public.affiliate_programs ap on ap.provider='awin' and ap.region='GB' and ap.external_account_id=m.metadata->>'external_id'
 where p_offset between 0 and 3600 and p_limit between 1 and 60 and p_sort in ('recent','price-low','price-high')
 and length(p_query)<=80 and p_query !~ '[%_]'
 and (p_advertiser='' or (p_advertiser ~ '^[0-9]{2,12}$' and m.metadata->>'external_id'=p_advertiser))
 and (p_query='' or o.title ilike '%'||replace(p_query,' ','%')||'%' or m.name ilike '%'||replace(p_query,' ','%')||'%' or p.brand ilike '%'||replace(p_query,' ','%')||'%' or p.model ilike '%'||replace(p_query,' ','%')||'%' or o.raw_data->>'merchant_product_id'=p_query)
 and r.status='approved' and r.approved_at<=now()+interval '5 minutes'
 and r.source_id=o.source_id and r.source_offer_id=o.source_offer_id and r.advertiser_id=m.metadata->>'external_id'
 and r.reviewed_currency='GBP' and r.reviewed_price=o.price and r.reviewed_feed_digest=o.raw_data->>'live_feed_digest'
 and r.reviewed_offer_at=case when pg_input_is_valid(o.raw_data->>'live_feed_verified_at','timestamp with time zone') then (o.raw_data->>'live_feed_verified_at')::timestamptz end
 and r.reviewed_offer_at between now()-interval '48 hours' and now()+interval '5 minutes'
 and r.reviewed_offer_at<=r.approved_at+interval '5 minutes' and o.last_seen_at>=r.reviewed_offer_at and o.last_seen_at<=now()+interval '5 minutes'
 and o.status='active' and p.status='active' and m.status='active' and p.slug ~ '^[a-z0-9][a-z0-9-]{2,159}$'
 and o.currency='GBP' and o.price>0 and o.stock_status in ('in_stock','low_stock')
 and o.source_offer_id=(m.metadata->>'external_id')||':'||(o.raw_data->>'merchant_product_id')
 and (o.match_confidence between 0.85 and 1 or o.match_confidence between 85 and 100)
 and (o.valid_from is null or o.valid_from<=now()) and (o.valid_until is null or o.valid_until>now())
 and s.connector_key='awin' and s.status='active' and s.sync_enabled and s.credential_status='ready'
 and s.metadata->>'publication_permission'='verified' and s.metadata->>'price_evidence_status'='verified'
 and ap.metadata->>'publication_approved'='true' and ap.metadata->'owner_joined_accepted_attestation'->>'membership_status'='accepted'
 and exists(select 1 from public.system_controls where control_key='source_ingestion' and enabled)
 and exists(select 1 from public.system_controls where control_key='shopping_publishing' and enabled)
 and exists(select 1 from public.system_controls where control_key='global_emergency_stop' and not enabled)
 order by case when p_sort='recent' then o.last_seen_at end desc,case when p_sort='price-low' then o.price end asc,case when p_sort='price-high' then o.price end desc,o.id
 limit case when p_limit between 1 and 60 then p_limit else 0 end offset case when p_offset between 0 and 3600 then p_offset else 0 end;
$$;
revoke all on function public.shopping_catalogue_page_ids(text,text,text,integer,integer) from public,anon,authenticated,service_role;
grant execute on function public.shopping_catalogue_page_ids(text,text,text,integer,integer) to service_role;
create or replace function public.get_verified_tyres_uk_size_facets()
returns table(width integer,profile integer,rim integer,listing_count bigint)
language sql stable security invoker set search_path='' as $$
 with current_feed as(
  select snapshot_sha256,observed_at
  from public.awin_tyre_live_observations
  where advertiser_id='12715' and feed_id='93988'
   and observed_at>=now()-interval '2 hours'
   and observed_at<=now()+interval '2 minutes'
  order by observed_at desc limit 1
 ), eligible as (
 select f.merchant_product_id sku,
 case when pg_input_is_valid(f.metadata->'tyre_size_candidate'->>'width_mm','integer') then (f.metadata->'tyre_size_candidate'->>'width_mm')::integer end width,
 case when pg_input_is_valid(f.metadata->'tyre_size_candidate'->>'aspect_ratio','integer') then (f.metadata->'tyre_size_candidate'->>'aspect_ratio')::integer end profile,
 case when pg_input_is_valid(f.metadata->'tyre_size_candidate'->>'rim_inches','integer') then (f.metadata->'tyre_size_candidate'->>'rim_inches')::integer end rim
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
 and coalesce(f.metadata->>'tyre_size_conflict','false')<>'true'
 and f.image_url ~ '^https://(static[.]tyres[.]net|images2[.]productserve[.]com)/'

 )
 select e.width,e.profile,e.rim,count(distinct e.sku) from eligible e
 where e.width between 125 and 385 and e.profile between 20 and 95 and e.rim between 10 and 26
 group by e.width,e.profile,e.rim order by e.width,e.profile,e.rim;
$$;
revoke all on function public.get_verified_tyres_uk_size_facets() from public,anon,authenticated,service_role;
grant execute on function public.get_verified_tyres_uk_size_facets() to service_role;
;
