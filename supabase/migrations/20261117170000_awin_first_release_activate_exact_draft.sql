-- AVUQO: first live Awin owner release activates only the exact approved draft
-- product in the SAME transaction as offer publication and audit.
-- Reuses existing service-role RPC; no extra public endpoint or grant.
create or replace function public.record_awin_owner_release(
 p_offer_id uuid,p_source_id uuid,p_advertiser_id text,p_status text,
 p_actor_id uuid,p_review_note text,p_reviewed_price numeric,
 p_reviewed_offer_at timestamptz,p_reviewed_score_at timestamptz
) returns void language plpgsql set search_path to '' as $function$
declare changed integer;
begin
 if p_status not in ('approved','paused') or p_actor_id is null or
    p_advertiser_id !~ '^[0-9]{2,12}$' or length(coalesce(p_review_note,''))>300 then
   raise exception 'Invalid owner release request';
 end if;
 if not exists(select 1 from public.user_roles ur
    where ur.user_id=p_actor_id and ur.role='owner') then
   raise exception 'Owner role required for release';
 end if;
 if not exists(select 1 from public.offers o join public.sources s on s.id=o.source_id
    where o.id=p_offer_id and o.source_id=p_source_id
      and s.connector_key='awin') then
   raise exception 'Awin offer and source mismatch';
 end if;
 if p_status='approved' then
   if not exists(select 1 from public.offers o
       join public.sources s on s.id=o.source_id
       join public.merchants m on m.id=o.merchant_id
       join public.products p on p.id=o.product_id
       where o.id=p_offer_id and o.source_id=p_source_id
         and s.status='active' and s.sync_enabled and s.credential_status='ready'
         and o.status='active' and o.currency='GBP' and o.price>0
         and o.stock_status in ('in_stock','low_stock')
         and o.last_seen_at=p_reviewed_offer_at and o.price=p_reviewed_price
         and o.last_seen_at>=now()-interval '48 hours'
         and o.last_seen_at<=now()+interval '5 minutes'
         and p.status in ('draft','active')
         and m.metadata->>'external_id'=p_advertiser_id
         and s.metadata->>'publication_permission'='verified'
         and s.metadata->>'price_evidence_status'='verified'
         and exists(select 1 from public.affiliate_programs ap
           where ap.provider='awin' and ap.region='GB'
             and ap.external_account_id=p_advertiser_id
             and ap.metadata->'owner_joined_accepted_attestation'->>'membership_status'='accepted')
     ) then raise exception 'Awin source, merchant, product or price evidence changed'; end if;
   if not exists(select 1 from public.deal_scores ds
       where ds.offer_id=p_offer_id and ds.score>=60 and ds.confidence>=55
         and ds.calculated_at=p_reviewed_score_at
         and ds.calculated_at>=now()-interval '48 hours'
         and ds.calculated_at<=now()+interval '5 minutes') then
     raise exception 'Deal Score has changed or expired'; end if;
   if not exists(select 1 from public.published_deals d
       join public.offers o on o.id=d.offer_id
       where d.offer_id=p_offer_id and d.status='held'
         and d.product_id=o.product_id and d.current_price=p_reviewed_price)
   then raise exception 'Offer has not been staged for manual publication'; end if;
   if exists(select 1 from public.system_controls c
     where (c.control_key='global_emergency_stop' and c.enabled=true) or
           (c.control_key in ('source_ingestion','deal_publishing') and c.enabled=false))
     or (select count(*) from public.system_controls c
       where c.control_key in ('source_ingestion','deal_publishing') and c.enabled=true)<>2
     or (select count(*) from public.system_controls c
       where c.control_key='global_emergency_stop' and c.enabled=false)<>1 then
     raise exception 'Publication controls are not enabled';
   end if;

   insert into public.awin_offer_release_reviews
     (offer_id,source_id,advertiser_id,status,reviewed_price,reviewed_offer_at,
      reviewed_score_at,approved_by,approved_at,updated_at,review_note)
   values(p_offer_id,p_source_id,p_advertiser_id,'approved',p_reviewed_price,
      p_reviewed_offer_at,p_reviewed_score_at,p_actor_id,now(),now(),
      coalesce(p_review_note,''))
   on conflict(offer_id) do update
    set status='approved',advertiser_id=excluded.advertiser_id,
      reviewed_price=excluded.reviewed_price,
      reviewed_offer_at=excluded.reviewed_offer_at,
      reviewed_score_at=excluded.reviewed_score_at,
      approved_by=excluded.approved_by,approved_at=now(),updated_at=now(),
      review_note=excluded.review_note;

   -- Existing canonical matches are private drafts. Flip only this exact
   -- product and only within the approved atomic offer-release transaction.
   update public.products set status='active',updated_at=now()
    where id=(select product_id from public.offers where id=p_offer_id)
      and status='draft';

   update public.published_deals set status='published',published_at=now(),
      updated_at=now() where offer_id=p_offer_id and status='held';
   get diagnostics changed = row_count;
   if changed<>1 then raise exception 'Publication row changed concurrently'; end if;
 else
   update public.awin_offer_release_reviews
      set status='paused',updated_at=now(),review_note=coalesce(p_review_note,'')
      where offer_id=p_offer_id;
   update public.published_deals set status='held',published_at=null,updated_at=now()
      where offer_id=p_offer_id;
 end if;
 insert into public.awin_release_audit
    (offer_id,source_id,advertiser_id,event_type,actor_id,review_note,
     approved_price,offer_checked_at)
 values(p_offer_id,p_source_id,p_advertiser_id,
   case when p_status='approved' then 'published' else 'paused' end,
   p_actor_id,coalesce(p_review_note,''),p_reviewed_price,p_reviewed_offer_at);
end; $function$;