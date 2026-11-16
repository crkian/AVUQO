-- CANDIDATE ONLY: DBA-only, strictly read-only execution preview.
-- This does not claim work, delete data, anonymise, change sources or
-- acknowledge eBay. A preview never authorises a subsequent write.
create function public.ebay_preview_next_mapped_erasure()
returns table(
 preview_state text,
 linked_ebay_offers bigint,
 analytics_records bigint,
 attribution_records bigint,
 feedback_records bigint,
 watch_records bigint,
 outstanding_secondary_review boolean
)
language plpgsql stable security definer set search_path = ''
as $$
declare
 v_receipt_id bigint;
 v_counts record;
begin
 -- Refuse to suggest an action while source quarantine is unconfirmed.
 if not exists(select 1 from public.sources s where s.connector_key='ebay'
  and s.status='paused' and s.sync_enabled=false) then
  return query select 'SOURCE_NOT_QUARANTINED'::text,
   null::bigint,null::bigint,null::bigint,null::bigint,
   null::bigint,null::boolean;
  return;
 end if;

 -- This is an observational snapshot only. No lock/lease is acquired.
 -- Exact receipt ID NEVER leaves the database. Only first candidate is
 -- inspected, and all still require subsequent independent approval.
 select w.receipt_id into v_receipt_id
 from public.ebay_erasure_work_items w
 join public.ebay_deletion_receipts r on r.id=w.receipt_id
 where w.surface='mapped_catalogue'
 and r.state in ('pending_privacy_review','processing')
 and w.state='pending' and w.available_at<=clock_timestamp()
 order by w.available_at,w.receipt_id
 limit 1;
 if not found then
  return query select 'NO_ELIGIBLE_PENDING_WORK'::text,
   null::bigint,null::bigint,null::bigint,null::bigint,
   null::bigint,null::boolean;
  return;
 end if;

 select * into strict v_counts
 from public.ebay_secondary_account_reference_counts(v_receipt_id);

 return query select
  (case when v_counts.has_unresolved_secondary_records
    then 'REVIEW_REQUIRED'
    else 'CANDIDATE_ONLY_NOT_AUTHORISED'
   end)::text,
  v_counts.mapped_offers,v_counts.analytics_records,
  v_counts.attribution_records,v_counts.feedback_records,
  v_counts.watch_records,v_counts.has_unresolved_secondary_records;
end;
$$;
revoke all on function public.ebay_preview_next_mapped_erasure()
 from public,anon,authenticated,service_role;
comment on function public.ebay_preview_next_mapped_erasure()
 is 'DBA-only count-only read-only one-candidate mapped erasure preview. NEVER authorises execution or receipt completion, no account identifiers returned.';
