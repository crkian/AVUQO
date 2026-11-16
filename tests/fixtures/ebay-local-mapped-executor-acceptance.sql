-- Synthetic rollback-only integration of the leased executor and stubbed
-- audited purge dependency. This DOES NOT validate live full-schema purge.
begin;
insert into public.ebay_deletion_receipts(notification_digest,user_id_digest)
 values(repeat('e',64),repeat('f',64));
insert into public.ebay_account_item_links(identity_kind,identity_digest,offer_id)
 values('user_id_digest',repeat('f',64),'00000000-0000-4000-8000-000000000004');
do $$
declare rid bigint; v_attempt integer; v_result record; rejected boolean;
begin
 select id into rid from public.ebay_deletion_receipts
 where notification_digest=repeat('e',64);
 begin
  perform public.ebay_execute_leased_mapped_catalogue_erasure(rid,1);
 exception when others then rejected:=true;
 end;
 if rejected is distinct from true then
  raise exception 'Unleased purge unexpectedly accepted';
 end if;
 select c.attempt into v_attempt from public.ebay_claim_erasure_work(90) c
 where c.receipt_id=rid and c.surface='mapped_catalogue';
 if v_attempt<>1 then raise exception 'Mapped catalogue claim absent'; end if;
 rejected:=false;
 begin
  perform public.ebay_execute_leased_mapped_catalogue_erasure(rid,2);
 exception when others then rejected:=true;
 end;
 if rejected is distinct from true then raise exception 'Stale attempt accepted'; end if;

 select * into v_result from public.ebay_execute_leased_mapped_catalogue_erasure(rid,1);
 if v_result.offers_erased<>1 then raise exception 'Expected one mapped offer deletion'; end if;
 if exists(select 1 from public.offers where id='00000000-0000-4000-8000-000000000004')
 then raise exception 'Owned eBay offer remained'; end if;
 if not exists(select 1 from public.offers where id='00000000-0000-4000-8000-000000000003')
 then raise exception 'Non-eBay offer was incorrectly deleted'; end if;
 if exists(select 1 from public.ebay_account_item_links where identity_digest=repeat('f',64))
 then raise exception 'Mapped link remained'; end if;
 if not exists(select 1 from public.ebay_erasure_work_items
   where receipt_id=rid and surface='mapped_catalogue' and state='awaiting_evidence'
   and lease_until is null)
 then raise exception 'Missing review disposition'; end if;
 if (select count(*) from public.ebay_partial_erasure_audit where receipt_id=rid)<>1
 then raise exception 'Audit and partial deletion not committed atomically'; end if;
 if not exists(select 1 from public.ebay_deletion_receipts
   where id=rid and state='pending_privacy_review' and completed_at is null)
 then raise exception 'Receipt falsely marked complete'; end if;
 rejected:=false;
 begin
  perform public.ebay_execute_leased_mapped_catalogue_erasure(rid,1);
 exception when others then rejected:=true;
 end;
 if rejected is distinct from true then raise exception 'Duplicate purge accepted'; end if;
end $$;
rollback;
do $$
begin
 if exists(select 1 from public.ebay_deletion_receipts)
 or exists(select 1 from public.ebay_erasure_work_items)
 or exists(select 1 from public.ebay_partial_erasure_audit)
 or exists(select 1 from public.ebay_account_item_links)
 then raise exception 'Executor test fixture residue after rollback'; end if;
 if not exists(select 1 from public.offers where id='00000000-0000-4000-8000-000000000004')
 then raise exception 'Source offer not restored by rollback'; end if;
end $$;
select 'EBAY_LEASED_MAPPED_EXECUTOR_SYNTHETIC_PASS';
