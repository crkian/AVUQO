CREATE OR REPLACE FUNCTION public.shopping_catalogue_department_page_ids(p_department text, p_query text DEFAULT ''::text, p_advertiser text DEFAULT ''::text, p_sort text DEFAULT 'recent'::text, p_offset integer DEFAULT 0, p_limit integer DEFAULT 37)
 RETURNS TABLE(offer_id uuid)
 LANGUAGE sql
 STABLE
 SET search_path TO ''
AS $function$
 select o.id from public.awin_shopping_release_reviews r
 join public.offers o on o.id=r.offer_id
 join public.products p on p.id=o.product_id
 join public.merchants m on m.id=o.merchant_id
 join public.sources s on s.id=o.source_id
 join public.affiliate_programs ap on ap.provider='awin' and ap.region='GB' and ap.external_account_id=m.metadata->>'external_id'
 where p_department ~ '^[a-z0-9-]{2,60}$' and (o.raw_data->'catalogue_classification'->>'status')='classified' and (o.raw_data->'catalogue_classification'->>'department')=p_department
 and p_offset between 0 and 36000 and p_limit between 1 and 60 and p_sort in ('recent','price-low','price-high')
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
 limit case when p_limit between 1 and 60 then p_limit else 0 end offset case when p_offset between 0 and 36000 then p_offset else 0 end;
$function$;


REVOKE ALL ON FUNCTION public.shopping_catalogue_department_page_ids(text,text,text,text,integer,integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.shopping_catalogue_department_page_ids(text,text,text,text,integer,integer) TO service_role;
