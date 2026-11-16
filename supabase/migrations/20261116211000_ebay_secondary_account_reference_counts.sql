-- CANDIDATE ONLY. DBA-only per-receipt secondary-store ownership evidence.
-- Does not delete, detach, anonymise, complete receipts or acknowledge eBay.
-- Exact HMAC identity aliases and eBay-source ownership links only.
create function public.ebay_secondary_account_reference_counts(p_receipt_id bigint)
returns table(
 mapped_offers bigint,
 analytics_records bigint,
 attribution_records bigint,
 feedback_records bigint,
 watch_records bigint,
 has_unresolved_secondary_records boolean
)
language plpgsql volatile security definer set search_path = ''
as $$
declare
 v_receipt public.ebay_deletion_receipts%rowtype;
 v_offer_ids uuid[];
 v_source uuid;
 v_mapped bigint;
 v_analytics bigint;
 v_attribution bigint;
 v_feedback bigint;
 v_watch bigint;
begin
 if p_receipt_id is null or p_receipt_id <= 0 then
  raise exception 'Invalid eBay privacy evidence request';
 end if;
 select * into v_receipt
 from public.ebay_deletion_receipts r where r.id=p_receipt_id;
 if not found or v_receipt.state='completed' then
  raise exception 'Unknown or completed eBay deletion receipt';
 end if;
 select s.id into strict v_source from public.sources s
 where s.connector_key='ebay';
 -- Take only exact eBay-source offers already linked to one of the three
 -- account HMAC digests. Do not infer identity from titles, URLs or text.
 select coalesce(array_agg(distinct o.id),array[]::uuid[]) into v_offer_ids
 from public.ebay_account_item_links l
 join public.offers o on o.id=l.offer_id and o.source_id=v_source
 where
  (l.identity_kind='user_id_digest' and l.identity_digest=v_receipt.user_id_digest)
  or (l.identity_kind='username_digest' and l.identity_digest=v_receipt.username_digest)
  or (l.identity_kind='eias_token_digest' and l.identity_digest=v_receipt.eias_token_digest);
 v_mapped:=coalesce(array_length(v_offer_ids,1),0);
 select count(*) into v_analytics from public.analytics_events e
 where e.offer_id=any(v_offer_ids);
 select count(*) into v_attribution from public.attribution_events e
 where e.offer_id=any(v_offer_ids);
 select count(*) into v_feedback from public.user_feedback e
 where e.offer_id=any(v_offer_ids);
 select count(*) into v_watch from public.watch_events e
 where e.offer_id=any(v_offer_ids);
 -- A zero count is NOT evidence of complete account erasure.
 return query select v_mapped,v_analytics,v_attribution,v_feedback,v_watch,
  (v_analytics+v_attribution+v_feedback+v_watch)>0;
end;
$$;
revoke all on function public.ebay_secondary_account_reference_counts(bigint)
 from public,anon,authenticated,service_role;
comment on function public.ebay_secondary_account_reference_counts(bigint)
 is 'DBA-only exact linked eBay-offer secondary event counts; no personal payload; zero is NOT full erasure evidence.';
