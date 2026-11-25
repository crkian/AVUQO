-- Full catalogue scale: preserve all existing admission predicates and ACLs.
-- Deploy database functions before enabling the optional application limits.
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
 where p_slot between 0 and 5 and p_limit between 1 and 50
 and exists(select 1 from public.system_controls where control_key='source_ingestion' and enabled=true)
 and exists(select 1 from public.system_controls where control_key='global_emergency_stop' and enabled=false)
 and s.metadata->>'publication_permission'='verified' and s.metadata->>'price_evidence_status'='verified'
 and ap.metadata->'owner_joined_accepted_attestation'->>'membership_status'='accepted'
 and ap.metadata->>'publication_approved'='true'
 and f.status='review' and f.currency='GBP' and f.price>0 and length(f.merchant_product_id) between 1 and 250
 and length(trim(f.title))>0 and f.image_url like 'https://%'
 and f.metadata->>'live_feed_verification'='exact_authenticated_feed_digest_rechecked'
 and f.metadata->>'live_feed_verified_at'>=to_char((now()-interval '15 minutes') at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS')
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
 order by d.missing_offer desc,d.observed desc,d.merchant_product_id limit case when p_limit between 1 and 50 then p_limit else 0 end
 )
 select b.import_id,b.advertiser,b.feed,b.digest,array_agg(b.merchant_product_id order by b.missing_offer desc,b.observed desc,b.merchant_product_id)
 from bounded b group by b.import_id,b.advertiser,b.feed,b.digest;
$function$;

CREATE OR REPLACE FUNCTION public.shopping_catalogue_page_ids(p_query text DEFAULT ''::text, p_advertiser text DEFAULT ''::text, p_sort text DEFAULT 'recent'::text, p_offset integer DEFAULT 0, p_limit integer DEFAULT 37)
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
 where p_offset between 0 and 36000 and p_limit between 1 and 60 and p_sort in ('recent','price-low','price-high')
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

CREATE OR REPLACE FUNCTION shopping_private.auto_review_active_shopping(p_limit integer DEFAULT 20)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare owner_id uuid; v_source_id uuid; o record; checked integer:=0; approved integer:=0; failed integer:=0; renewed integer:=0; phase integer; batch_limit integer; expected_mode text;
begin
 if p_limit is null or p_limit<1 or p_limit>60 then raise exception 'Invalid batch limit'; end if;
 if not exists(select 1 from public.system_controls where control_key='source_ingestion' and enabled=true)
 or not exists(select 1 from public.system_controls where control_key='global_emergency_stop' and enabled=false)
 or not exists(select 1 from public.system_controls where control_key='shopping_publishing' and enabled=true)
 then return jsonb_build_object('status','paused','checked',0,'approved',0,'failed',0); end if;
 select user_id into owner_id from public.user_roles where role='owner' and
 (select count(*) from public.user_roles where role='owner')=1;
 if owner_id is null then return jsonb_build_object('status','owner_unavailable','checked',0,'approved',0,'failed',0); end if;
 select s.id into v_source_id from public.sources s where s.connector_key='awin' and s.status='active' and s.sync_enabled
 and s.credential_status='ready' and s.metadata->>'publication_permission'='verified'
 and s.metadata->>'price_evidence_status'='verified' and s.metadata->>'owner_attested_release_enabled'='true'
 and s.metadata->'owner_publication_authorization'->>'status'='granted'
 and s.metadata->'owner_publication_authorization'->>'automation_requested'='true'
 and s.metadata->'owner_publication_authorization'->>'scope'='all eligible Awin feeds and offers'
 and s.metadata->'owner_permission_attestation_2026_11_17'->>'evidence_kind'='explicit_owner_chat_attestation'
 and s.metadata->'owner_permission_attestation_2026_11_17'->>'scope_as_stated'='all accepted Awin programmes, public product listings and publisher-supplied product images'
 and s.metadata->'owner_permission_attestation_2026_11_17'->>'not_a_merchant_terms_expiry_claim'='true'
 and (s.metadata->'owner_permission_attestation_2026_11_17'->>'recorded_date')::timestamptz between now()-interval '30 days' and now()+interval '5 minutes';
 if v_source_id is null then return jsonb_build_object('status','grant_unavailable','checked',0,'approved',0,'failed',0); end if;
 for phase in 1..3 loop
  expected_mode:=case when phase=2 then 'first' else 'renew' end;
  batch_limit:=case when phase=1 and p_limit>1 then greatest(1,(p_limit*2)/3) else p_limit-checked end;
  if batch_limit=0 then continue; end if;
  for o in
  select x.id,x.price,x.raw_data->>'live_feed_digest' digest,x.source_id,x.source_offer_id,m.metadata->>'external_id' advertiser,
   case when pg_input_is_valid(x.raw_data->>'live_feed_verified_at','timestamp with time zone') then (x.raw_data->>'live_feed_verified_at')::timestamptz end observed
  from public.offers x join public.products p on p.id=x.product_id
  join public.merchants m on m.id=x.merchant_id join public.sources s on s.id=x.source_id
  where x.source_id=v_source_id and x.status='active' and p.status='active' and m.status='active'
   and p.primary_image_url like 'https://%' and x.currency='GBP' and x.price>0
   and x.stock_status in ('in_stock','low_stock')
   and x.last_seen_at between now()-interval '48 hours' and now()+interval '5 minutes'
   and x.raw_data->>'live_feed_digest' ~ '^[a-f0-9]{64}$'
   and x.source_offer_id=(m.metadata->>'external_id')||':'||(x.raw_data->>'merchant_product_id')
   and (x.match_confidence between 0.85 and 1 or x.match_confidence between 85 and 100)
   and (x.valid_from is null or x.valid_from<=now()) and (x.valid_until is null or x.valid_until>now())
   and (x.raw_data->>'source_currency_explicit'='true' or
    (x.raw_data->>'source_currency_explicit'='false' and (
    (m.metadata->>'external_id'='496' and x.raw_data->>'feed_id'='89987' and x.raw_data->>'currency_source'='tooled_up_uk_GBP_storefront_and_exact_staged_price_match') or
    (m.metadata->>'external_id'='77952' and x.raw_data->>'feed_id' in ('103580','109051','109652','119210') and x.raw_data->>'currency_source'='petlibro_uk_programme_gbp') or
    (m.metadata->>'external_id'='736' and x.raw_data->>'feed_id'='48599' and x.raw_data->>'currency_source'='cadbury_uk_programme_gbp'))))
   and exists(select 1 from jsonb_array_elements(case when jsonb_typeof(s.metadata->'awin_advertisers')='array' then s.metadata->'awin_advertisers' else '[]'::jsonb end) a where a->>'advertiser_id'=m.metadata->>'external_id')
   and exists(select 1 from public.affiliate_programs a where a.provider='awin' and a.region='GB' and a.external_account_id=m.metadata->>'external_id'
   and a.metadata->>'publication_approved'='true' and a.metadata->'owner_joined_accepted_attestation'->>'membership_status'='accepted')
   and shopping_private.automatic_shopping_review_mode(x.id,x.source_id,m.metadata->>'external_id',x.source_offer_id,
    case when pg_input_is_valid(x.raw_data->>'live_feed_verified_at','timestamp with time zone') then (x.raw_data->>'live_feed_verified_at')::timestamptz end,owner_id)=expected_mode
   and exists(select 1 from lateral (select 1 from public.feed_import_records f
    where f.import_id=case when pg_input_is_valid(x.raw_data->>'import_id','uuid') then (x.raw_data->>'import_id')::uuid end and f.merchant_id=m.metadata->>'external_id'
    and f.merchant_product_id=x.raw_data->>'merchant_product_id' and f.title=x.title and f.price=x.price and f.currency='GBP'
    and f.status='review' and f.metadata->>'feed_id'=x.raw_data->>'feed_id'
    and f.metadata->>'live_feed_digest'=x.raw_data->>'live_feed_digest'
    and f.metadata->>'live_feed_verified_at'=x.raw_data->>'live_feed_verified_at'
    and f.metadata->>'live_feed_verification'='exact_authenticated_feed_digest_rechecked'
    and f.metadata->>'tracking_link_verified'='true' and f.metadata->>'verified_awin_deep_link'=x.affiliate_url
    and f.metadata->>'source_image_rights_confirmed'='true'
    and replace(lower(f.metadata->>'availability'),' ','_') in ('in_stock','instock','available','low_stock','limited') limit 1) exact_private)
   and x.affiliate_url ~ '^https://(www[.])?awin1[.]com/(pclick|cread)[.]php[?][^#[:space:]]+$'
   and ((x.affiliate_url ~ '/pclick[.]php[?]' and x.affiliate_url ~ ('[?&]m='||(m.metadata->>'external_id')||'(&|$)')
       and x.affiliate_url ~ '[?&]a=3135746(&|$)' and x.affiliate_url ~ '[?&]p=[^&]+'
       and regexp_count(x.affiliate_url,'[?&]m=')=1 and regexp_count(x.affiliate_url,'[?&]a=')=1)
    or (x.affiliate_url ~ '/cread[.]php[?]' and x.affiliate_url ~ ('[?&]awinmid='||(m.metadata->>'external_id')||'(&|$)')
       and x.affiliate_url ~ '[?&]awinaffid=3135746(&|$)' and regexp_count(x.affiliate_url,'[?&]awinmid=')=1 and regexp_count(x.affiliate_url,'[?&]awinaffid=')=1))
  order by case when m.metadata->>'external_id'='496' then 1 else 0 end,case when phase<>2 then x.last_seen_at end asc,case when phase=2 then x.last_seen_at end desc,x.id limit batch_limit for update of x skip locked
 loop
  checked:=checked+1;
  begin
   -- Owner review/withdrawal takes the same offer lock. Recheck after locking.
   if shopping_private.automatic_shopping_review_mode(o.id,o.source_id,o.advertiser,o.source_offer_id,o.observed,owner_id)=expected_mode
     and exists(select 1 from public.system_controls where control_key='shopping_publishing' and enabled=true)
     and exists(select 1 from public.system_controls where control_key='source_ingestion' and enabled=true)
     and exists(select 1 from public.system_controls where control_key='global_emergency_stop' and enabled=false) then
    perform public.record_awin_shopping_owner_review(o.id,owner_id,'approved',o.price,o.digest,
     case when phase<>2 then 'Automatic shopping evidence renewal under recorded owner grant' else 'Automatic first shopping review under recorded owner grant' end);
    if phase<>2 then renewed:=renewed+1; else approved:=approved+1; end if;
   end if;
  exception when others then failed:=failed+1;
  end;
 end loop;
 end loop;
 return jsonb_build_object('status',case when failed>0 then 'partial_failure' else 'checked' end,'checked',checked,'approved',approved,'renewed',renewed,'failed',failed);
end;
$function$;

