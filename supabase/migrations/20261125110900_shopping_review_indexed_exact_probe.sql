CREATE OR REPLACE FUNCTION shopping_private.auto_review_active_shopping(p_limit integer DEFAULT 20)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare owner_id uuid; v_source_id uuid; o record; checked integer:=0; approved integer:=0; failed integer:=0; renewed integer:=0; phase integer; batch_limit integer; expected_mode text;
begin
 if p_limit is null or p_limit<1 or p_limit>30 then raise exception 'Invalid batch limit'; end if;
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
 for phase in 1..2 loop
  expected_mode:=case when phase=1 then 'renew' else 'first' end;
  batch_limit:=p_limit-checked;
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
  order by case when phase=1 then x.last_seen_at end asc,case when phase=2 then x.last_seen_at end desc,x.id limit batch_limit for update of x skip locked
 loop
  checked:=checked+1;
  begin
   -- Owner review/withdrawal takes the same offer lock. Recheck after locking.
   if shopping_private.automatic_shopping_review_mode(o.id,o.source_id,o.advertiser,o.source_offer_id,o.observed,owner_id)=expected_mode
     and exists(select 1 from public.system_controls where control_key='shopping_publishing' and enabled=true)
     and exists(select 1 from public.system_controls where control_key='source_ingestion' and enabled=true)
     and exists(select 1 from public.system_controls where control_key='global_emergency_stop' and enabled=false) then
    perform public.record_awin_shopping_owner_review(o.id,owner_id,'approved',o.price,o.digest,
     case when phase=1 then 'Automatic shopping evidence renewal under recorded owner grant' else 'Automatic first shopping review under recorded owner grant' end);
    if phase=1 then renewed:=renewed+1; else approved:=approved+1; end if;
   end if;
  exception when others then failed:=failed+1;
  end;
 end loop;
 end loop;
 return jsonb_build_object('status',case when failed>0 then 'partial_failure' else 'checked' end,'checked',checked,'approved',approved,'renewed',renewed,'failed',failed);
end;
$function$
;
;
