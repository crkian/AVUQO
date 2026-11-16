-- CANDIDATE ONLY: do not apply to production without privacy approval.
-- DBA-only bounded evidence disposition for analytics_attribution work.
-- This never erases customer data or represents full erasure/retention approval.
create function public.ebay_assess_leased_secondary_history(
 p_receipt_id bigint,p_attempt integer
) returns table(
 mapped_offers bigint,
 analytics_records bigint,
 attribution_records bigint,
 feedback_records bigint,
 watch_records bigint,
 work_state text
)
language plpgsql volatile security definer set search_path = ''
as $$
declare
 v_work public.ebay_erasure_work_items%rowtype;
 v_receipt public.ebay_deletion_receipts%rowtype;
 v_counts record;
 v_state text;
begin
 if p_receipt_id is null or p_receipt_id<=0
 or p_attempt is null or p_attempt<=0 then
  raise exception 'Invalid secondary assessment request';
 end if;
 select * into v_work from public.ebay_erasure_work_items w
 where w.receipt_id=p_receipt_id and w.surface='analytics_attribution'
 for update;
 if not found
  or v_work.state<>'leased'
  or v_work.attempts<>p_attempt
  or v_work.lease_until<=clock_timestamp() then
  raise exception 'No current secondary assessment lease';
 end if;
 select * into v_receipt from public.ebay_deletion_receipts r
 where r.id=p_receipt_id for update;
 if not found or v_receipt.state not in ('pending_privacy_review','processing') then
  raise exception 'Secondary assessment receipt is not active';
 end if;
 if not exists(select 1 from public.sources s where s.connector_key='ebay'
  and s.status='paused' and s.sync_enabled=false) then
  raise exception 'eBay must remain paused for privacy assessment';
 end if;
 -- Original exact-digest/specific source read-only private counter. No row
 -- samples, raw payloads or account identifiers leave this function.
 select * into strict v_counts from
  public.ebay_secondary_account_reference_counts(p_receipt_id);
 v_state:=case when v_counts.has_unresolved_secondary_records
    then 'blocked' else 'awaiting_evidence' end;
 -- Unresolved linked shopper data cannot be silently detached or deleted.
 -- Zero counts do not assert empty logs, backups or unlinked historical rows:
 -- awaiting_evidence still needs independent human/provider review.
 update public.ebay_erasure_work_items w
 set state=v_state,lease_until=null,
  last_failure_code=case when v_state='blocked'
    then 'SECONDARY_REVIEW_REQUIRED' else null end,
  updated_at=clock_timestamp()
 where w.receipt_id=p_receipt_id and w.surface='analytics_attribution'
   and w.state='leased' and w.attempts=p_attempt
   and w.lease_until>clock_timestamp();
 if not found then
  raise exception 'Secondary assessment lease lost';
 end if;
 return query select v_counts.mapped_offers,v_counts.analytics_records,
  v_counts.attribution_records,v_counts.feedback_records,
  v_counts.watch_records,v_state;
end;
$$;
revoke all on function public.ebay_assess_leased_secondary_history(bigint,integer)
 from public,anon,authenticated,service_role;
comment on function public.ebay_assess_leased_secondary_history(bigint,integer)
 is 'DBA-only analytics-attribution lease review: block linked shopper history, or await evidence; does NOT erase data, finish account deletion or acknowledge eBay.';
