-- CANDIDATE ONLY. This migration is NOT deployed or approved on production.
-- DBA-only *partial mapped catalogue* purge with one atomic work-journal disposition.
-- No webhook, processor, backups, legal retention, or receipt completion.
create function public.ebay_execute_leased_mapped_catalogue_erasure(
 p_receipt_id bigint, p_attempt integer
) returns table (
 audit_id bigint,
 offers_erased bigint,
 ingestion_items_erased bigint,
 price_records_erased bigint,
 matches_erased bigint
) language plpgsql volatile security definer set search_path = ''
as $$
declare
 v_receipt public.ebay_deletion_receipts%rowtype;
 v_work public.ebay_erasure_work_items%rowtype;
 v_audit record;
 v_source record;
begin
 if p_receipt_id is null or p_attempt is null or p_attempt < 1 then
  raise exception 'Invalid mapped catalogue erasure work request';
 end if;

 -- Lock the work item before looking up sensitive receipt data. A worker
 -- with a stale, expired, blocked or differently scoped lease can never erase.
 select * into v_work
 from public.ebay_erasure_work_items w
 where w.receipt_id=p_receipt_id and w.surface='mapped_catalogue'
 for update;
 if not found
  or v_work.state <> 'leased'
  or v_work.attempts <> p_attempt
  or v_work.lease_until <= clock_timestamp() then
  raise exception 'No current mapped catalogue erasure lease';
 end if;

 select * into v_receipt from public.ebay_deletion_receipts r
 where r.id=p_receipt_id for update;
 if not found or v_receipt.state not in ('pending_privacy_review','processing') then
  raise exception 'Invalid or blocked eBay receipt for mapped purge';
 end if;

 -- Never execute in an accidentally activated or differently scoped source.
 select s.id,s.status,s.sync_enabled into v_source
 from public.sources s where s.connector_key='ebay';
 if not found or v_source.status <> 'paused' or v_source.sync_enabled is distinct from false then
  raise exception 'eBay must remain paused for private mapped purge';
 end if;

 -- Existing DBA-only audited purge handles exact ownership-linked source
 -- isolation. All deletes, audit and work state change are one SQL transaction.
 select * into strict v_audit from
  public.ebay_run_audited_partial_erasure(v_receipt.notification_digest);

 update public.ebay_erasure_work_items w
 set state='awaiting_evidence',lease_until=null,last_failure_code=null,
     updated_at=clock_timestamp()
 where w.receipt_id=p_receipt_id and w.surface='mapped_catalogue'
   and w.state='leased' and w.attempts=p_attempt;
 if not found then
  raise exception 'Mapped catalogue erasure lease lost before disposition';
 end if;

 -- 'awaiting_evidence' means a partial attempt was recorded, not erased globally.
 return query select v_audit.audit_id,v_audit.offers_erased,
  v_audit.ingestion_items_erased,v_audit.price_records_erased,v_audit.matches_erased;
end;
$$;
revoke all on function public.ebay_execute_leased_mapped_catalogue_erasure(bigint,integer)
 from public,anon,authenticated,service_role;
comment on function public.ebay_execute_leased_mapped_catalogue_erasure(bigint,integer)
 is 'DBA-only leased exact-source mapped-catalogue partial purge; awaiting evidence only. No receipt completion/provider acknowledgment.';
