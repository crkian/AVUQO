CREATE OR REPLACE FUNCTION public.next_awin_catalogue_conversion(p_slot integer, p_limit integer DEFAULT 20)
 RETURNS TABLE(import_id uuid, advertiser text, feed text, digest text, merchant_product_ids text[])
 LANGUAGE sql
 STABLE
 SET search_path TO ''
AS $function$
 with allowed(advertiser,feed,ordinal) as (values
 ('496','89987',0),('736','48599',1),('77952','103580',2),('77952','109051',2),('77952','109652',2),('77952','119210',2),
 ('31539','74135',3),('45747','F1356',4),('101445','F5142',5),('101445','96428',5)),
 eligible as materialized (
 select f.import_id,f.merchant_id advertiser,a.feed,f.metadata->>'live_feed_digest' digest,f.merchant_product_id,a.ordinal,
 case when pg_input_is_valid(f.metadata->>'live_feed_verified_at','timestamp with time zone') then (f.metadata->>'live_feed_verified_at')::timestamptz end observed,
 o.id is null as missing_offer,
 case when pg_input_is_valid(o.raw_data->>'live_feed_verified_at','timestamp with time zone') then (o.raw_data->>'live_feed_verified_at')::timestamptz end canonical_observed
 from public.feed_import_records f join allowed a on a.advertiser=f.merchant_id and a.feed=f.metadata->>'feed_id'
 join public.feed_import_runs r on r.id=f.import_id and r.merchant_id=f.merchant_id and r.status='private_review' and r.permission_status='unverified'
 join public.sources s on s.connector_key='awin' and s.status='active' and s.sync_enabled and s.credential_status='ready'
 join public.affiliate_programs ap on ap.provider='awin' and ap.region='GB' and ap.external_account_id=f.merchant_id
 left join public.offers o on o.source_id=s.id and o.source_offer_id=f.merchant_id||':'||f.merchant_product_id
 where p_slot between 0 and 5 and p_limit between 1 and 20
 and exists(select 1 from public.system_controls where control_key='source_ingestion' and enabled=true)
 and exists(select 1 from public.system_controls where control_key='global_emergency_stop' and enabled=false)
 and s.metadata->>'publication_permission'='verified' and s.metadata->>'price_evidence_status'='verified'
 and ap.metadata->'owner_joined_accepted_attestation'->>'membership_status'='accepted'
 and ap.metadata->>'publication_approved'='true'
 and f.status='review' and f.currency='GBP' and f.price>0 and length(f.merchant_product_id) between 1 and 250
 and length(trim(f.title))>0 and f.image_url like 'https://%'
 and f.metadata->>'live_feed_verification'='exact_authenticated_feed_digest_rechecked'
 and f.metadata->>'live_feed_digest' ~ '^[a-f0-9]{64}$'
 and f.metadata->>'tracking_link_verified'='true'
 and f.metadata->>'verified_awin_deep_link' ~ '^https://(www[.])?awin1[.]com/(pclick|cread)[.]php[?]'
 and f.metadata->>'source_image_rights_confirmed'='true'
 and f.metadata->>'listing_kind'='physical_product'
 and replace(lower(f.metadata->>'availability'),' ','_') in ('in_stock','instock','available','low_stock','limited')
 and (f.metadata->>'source_currency_explicit'='true' or
 (f.metadata->>'source_currency_explicit'='false' and (
 (f.merchant_id='496' and a.feed='89987' and f.metadata->>'currency_source'='tooled_up_uk_GBP_storefront_and_exact_staged_price_match')
 or (f.merchant_id='77952' and a.feed in ('103580','109051','109652','119210') and f.metadata->>'currency_source'='petlibro_uk_programme_gbp')
 or (f.merchant_id='736' and a.feed='48599' and f.metadata->>'currency_source'='cadbury_uk_programme_gbp'))))
 and (f.merchant_id<>'45747' or f.title !~* '(harry potter|disney|marvel|star wars)')
 ), dedup as (
 select distinct on(e.advertiser,e.merchant_product_id) e.* from eligible e
 where e.observed between now()-interval '14 minutes' and now()+interval '5 minutes'
 and (e.missing_offer or e.canonical_observed is null or e.canonical_observed<e.observed)
 order by e.advertiser,e.merchant_product_id,e.observed desc,e.import_id
 ), chosen as (
 select d.import_id,d.advertiser,d.feed,d.digest from dedup d
 group by d.import_id,d.advertiser,d.feed,d.digest,d.ordinal
 order by mod(d.ordinal-p_slot+6,6),count(*) filter(where d.missing_offer) desc,max(d.observed) desc,d.import_id,d.feed,d.digest limit 1
 ), bounded as (
 select d.* from dedup d join chosen c using(import_id,advertiser,feed,digest)
 order by d.missing_offer desc,d.observed desc,d.merchant_product_id limit case when p_limit between 1 and 20 then p_limit else 0 end
 )
 select b.import_id,b.advertiser,b.feed,b.digest,array_agg(b.merchant_product_id order by b.missing_offer desc,b.observed desc,b.merchant_product_id)
 from bounded b group by b.import_id,b.advertiser,b.feed,b.digest;
$function$
;
revoke all on function public.next_awin_catalogue_conversion(integer,integer) from public,anon,authenticated,service_role;
grant execute on function public.next_awin_catalogue_conversion(integer,integer) to service_role;
