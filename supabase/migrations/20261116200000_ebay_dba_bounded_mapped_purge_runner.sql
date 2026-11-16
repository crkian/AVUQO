-- CANDIDATE ONLY. NOT applied to AVUQO production.
-- DBA-controlled single-item processor for exact eBay mapped catalogue rows.
-- No cron, webhook 2xx, full deletion completion, legal-retention assertion,
-- remote processor action, or application-role execution.
--
-- The claim, real audited purge and review disposition share ONE transaction.
-- A SQL error rolls ALL of them back, leaving pending work eligible for retry.
create function public.ebay_run_next_mapped_catalogue_erasure()
returns table (
 receipt_id bigint,
 audit_id bigint,
 offers_erased bigint,
 ingestion_items_erased bigint,
 price_records_erased bigint,
 matches_erased bigint
)
language plpgsql volatile security definer set search_path = ''
as $$
declare
 v_receipt_id bigint;
 v_attempt integer;
 v_purge record;
begin
 -- The stored procedure has intentionally no arguments, so operators cannot
 -- choose an arbitrary receipt or abuse client-supplied identifiers.
 select w.receipt_id into v_receipt_id
 from public.ebay_erasure_work_items w
 join public.ebay_deletion_receipts r on r.id=w.receipt_id
 where w.surface='mapped_catalogue'
   and r.state in ('pending_privacy_review','processing')
   and (
     (w.state='pending' and w.available_at<=clock_timestamp())
     or (w.state='leased' and w.lease_until<clock_timestamp())
   )
 order by w.available_at,w.receipt_id
 for update of w skip locked
 limit 1;

 if not found then
   return;
 end if;

 -- Claim exactly the work row selected above; no other work surface changes.
 update public.ebay_erasure_work_items w
 set state='leased',
     attempts=w.attempts+1,
     lease_until=clock_timestamp()+pg_catalog.make_interval(secs=>90),
     updated_at=clock_timestamp()
 where w.receipt_id=v_receipt_id and w.surface='mapped_catalogue'
 returning w.attempts into v_attempt;
 if not found then
   raise exception 'eBay mapped work claim lost';
 end if;

 -- Existing source-scoped partial executor locks receipt and queue row,
 -- requires the source to remain paused, runs original audited purge, and
 -- transitions ONLY the mapped work row to awaiting_evidence.
 select * into strict v_purge
 from public.ebay_execute_leased_mapped_catalogue_erasure(
   v_receipt_id,v_attempt
 );

 return query select v_receipt_id,v_purge.audit_id,
   v_purge.offers_erased,v_purge.ingestion_items_erased,
   v_purge.price_records_erased,v_purge.matches_erased;
end;
$$;
revoke all on function public.ebay_run_next_mapped_catalogue_erasure()
 from public,anon,authenticated,service_role;
comment on function public.ebay_run_next_mapped_catalogue_erasure()
 is 'DBA-only one-item atomic mapped catalogue partial purge; no scheduling, no completed receipt, no eBay acknowledgment or full erasure certification.';
