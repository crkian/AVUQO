-- UK-only GBP pricing policy confirmed by owner 2026-11-24.
-- Keep provenance distinct; never infer currency from arbitrary GB-region feeds.
create or replace function public.record_awin_shopping_owner_review(
 p_offer_id uuid,p_actor_id uuid,p_status text,p_expected_price numeric,
 p_expected_digest text,p_note text
) returns void language plpgsql security invoker set search_path='' as $$
declare o record; existing record; observed timestamptz; advertiser text;
begin
 if p_status is null or p_status not in ('approved','withdrawn') or
    p_actor_id is null or length(coalesce(p_note,''))>300 then
   raise exception 'Invalid review request';
 end if;
 if not exists(select 1 from public.user_roles where user_id=p_actor_id and role='owner') then
   raise exception 'Owner role required';
 end if;
 -- Serialize concurrent changes to the same offer and its review.
 select * into o from public.offers where id=p_offer_id for update;
 if not found then raise exception 'Offer missing'; end if;
 if p_status='withdrawn' then
   update public.awin_shopping_release_reviews set status='withdrawn',updated_at=now()
     where offer_id=p_offer_id returning * into existing;
   if not found then raise exception 'No shopping review to withdraw'; end if;
   insert into public.awin_shopping_release_audit(offer_id,actor_id,event_type,reviewed_price,feed_digest,note)
     values(p_offer_id,p_actor_id,p_status,existing.reviewed_price,existing.reviewed_feed_digest,coalesce(p_note,''));
   return;
 end if;
 observed:=(o.raw_data->>'live_feed_verified_at')::timestamptz;
 select m.metadata->>'external_id' into advertiser from public.merchants m
 where m.id=o.merchant_id and m.status='active';
 if advertiser is null or advertiser !~ '^[0-9]{2,12}$' or
    o.source_offer_id is distinct from advertiser||':'||coalesce(o.raw_data->>'merchant_product_id','') or
    coalesce(o.raw_data->>'merchant_product_id','')='' or
    o.status is distinct from 'active' or o.currency is distinct from 'GBP' or
    o.price is null or o.price<=0 or o.price is distinct from p_expected_price or
    coalesce(o.stock_status,'') not in ('in_stock','low_stock') or
    not coalesce(
     o.raw_data->>'source_currency_explicit'='true' or
     (o.raw_data->>'source_currency_explicit'='false' and (
       (advertiser='496' and o.raw_data->>'feed_id'='89987' and o.raw_data->>'currency_source'='tooled_up_uk_GBP_storefront_and_exact_staged_price_match') or
       (advertiser='77952' and o.raw_data->>'feed_id' in ('103580','109051','109652','119210') and o.raw_data->>'currency_source'='petlibro_uk_programme_gbp') or
       (advertiser='736' and o.raw_data->>'feed_id'='48599' and o.raw_data->>'currency_source'='cadbury_uk_programme_gbp')
     )),false) or
    p_expected_digest is null or p_expected_digest !~ '^[a-f0-9]{64}$' or
    o.raw_data->>'live_feed_digest' is distinct from p_expected_digest or
    observed is null or observed<now()-interval '48 hours' or observed>now()+interval '5 minutes' or
    o.last_seen_at is null or o.last_seen_at<observed or o.last_seen_at>now()+interval '5 minutes' or
    (o.valid_from is not null and o.valid_from>now()) or
    (o.valid_until is not null and o.valid_until<=now()) or
    o.match_confidence is null or not (o.match_confidence between 0.85 and 1 or o.match_confidence between 85 and 100)
 then raise exception 'Shopping offer evidence is incomplete or changed'; end if;
 if not exists(select 1 from public.sources s where s.id=o.source_id and s.connector_key='awin'
   and s.status='active' and s.sync_enabled and s.credential_status='ready'
   and s.metadata->>'publication_permission'='verified' and s.metadata->>'price_evidence_status'='verified')
 or not exists(select 1 from public.affiliate_programs a where a.provider='awin' and a.region='GB'
   and a.external_account_id=advertiser and a.metadata->>'publication_approved'='true'
   and a.metadata->'owner_joined_accepted_attestation'->>'membership_status'='accepted')
 or not exists(select 1 from public.products p where p.id=o.product_id and p.status in ('draft','active'))
 or not exists(select 1 from public.system_controls where control_key='global_emergency_stop' and enabled=false)
 or not exists(select 1 from public.system_controls where control_key='source_ingestion' and enabled=true)
 then raise exception 'Shopping source or controls unavailable'; end if;
 -- This is a review record, not public admission. The reader additionally
 -- verifies rights scope, publisher link, connector configuration and switch.
 insert into public.awin_shopping_release_reviews(offer_id,source_id,advertiser_id,source_offer_id,
 reviewed_price,reviewed_currency,reviewed_feed_digest,reviewed_offer_at,status,approved_by,approved_at,updated_at)
 values(o.id,o.source_id,advertiser,o.source_offer_id,o.price,'GBP',p_expected_digest,observed,'approved',p_actor_id,now(),now())
 on conflict(offer_id) do update set source_id=excluded.source_id,advertiser_id=excluded.advertiser_id,
 source_offer_id=excluded.source_offer_id,reviewed_price=excluded.reviewed_price,
 reviewed_currency=excluded.reviewed_currency,reviewed_feed_digest=excluded.reviewed_feed_digest,
 reviewed_offer_at=excluded.reviewed_offer_at,status='approved',approved_by=excluded.approved_by,
 approved_at=now(),updated_at=now();
 -- Do not activate canonical products or enable publication here.
 insert into public.awin_shopping_release_audit(offer_id,actor_id,event_type,reviewed_price,feed_digest,note)
 values(o.id,p_actor_id,p_status,o.price,p_expected_digest,coalesce(p_note,''));
end;
$$;
revoke all on function public.record_awin_shopping_owner_review(uuid,uuid,text,numeric,text,text) from public,anon,authenticated,service_role;
