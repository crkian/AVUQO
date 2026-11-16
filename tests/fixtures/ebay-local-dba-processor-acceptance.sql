-- Local GitHub native PostgreSQL only. The EXACT original migrations and
-- actual audited purge/executor run; only data is synthetic, all rolled back.
begin;
insert into public.ebay_account_item_links(identity_kind,identity_digest,offer_id)
values ('user_id_digest',repeat('1',64),'00000000-0000-4000-8000-000000000004');
insert into public.ebay_deletion_receipts(notification_digest,user_id_digest)
values (repeat('2',64),repeat('1',64));
do $$
declare
 v_id bigint;
 v_result record;
 v_n bigint;
begin
 select id into strict v_id from public.ebay_deletion_receipts
 where notification_digest=repeat('2',64);
 select * into strict v_result
 from public.ebay_run_next_mapped_catalogue_erasure();
 if v_result.receipt_id<>v_id
    or v_result.offers_erased<>1
    or v_result.ingestion_items_erased<>0
    or v_result.price_records_erased<>0
    or v_result.matches_erased<>0 then
   raise exception 'Unexpected audited mapped work count';
 end if;
 select count(*) into v_n from public.ebay_partial_erasure_audit
 where receipt_id=v_id and id=v_result.audit_id;
 if v_n<>1 then
   raise exception 'Audit not atomic with bounded runner';
 end if;
 if exists(select 1 from public.offers
  where id='00000000-0000-4000-8000-000000000004') then
  raise exception 'Owned mapped offer was not deleted';
 end if;
 if not exists(select 1 from public.offers
  where id='00000000-0000-4000-8000-000000000007') then
  raise exception 'Unrelated eBay offer deleted';
 end if;
 if not exists(select 1 from public.offers
  where id='00000000-0000-4000-8000-000000000003') then
  raise exception 'Non-eBay source offer deleted';
 end if;
 if not exists(select 1 from public.ebay_erasure_work_items
  where receipt_id=v_id and surface='mapped_catalogue'
   and state='awaiting_evidence' and lease_until is null and attempts=1) then
   raise exception 'Mapped surface did not remain under evidence review';
 end if;
 if not exists(select 1 from public.ebay_deletion_receipts
  where id=v_id and state='pending_privacy_review' and completed_at is null) then
   raise exception 'Receipt was falsely acknowledged';
 end if;
 select count(*) into v_n from public.ebay_run_next_mapped_catalogue_erasure();
 if v_n<>0 then raise exception 'Second claim must be empty'; end if;
end $$;
rollback;

-- The source must stay paused. Any unsuccessful nested procedure invocation
-- rolls back its queue claim in the same PostgreSQL transaction.
begin;
insert into public.ebay_account_item_links(identity_kind,identity_digest,offer_id)
 values ('user_id_digest',repeat('3',64),'00000000-0000-4000-8000-000000000004');
insert into public.ebay_deletion_receipts(notification_digest,user_id_digest)
 values (repeat('4',64),repeat('3',64));
update public.sources set status='active' where connector_key='ebay';
do $$
declare rejected boolean:=false; v_id bigint;
begin
 select id into v_id from public.ebay_deletion_receipts
 where notification_digest=repeat('4',64);
 begin
   perform public.ebay_run_next_mapped_catalogue_erasure();
 exception when others then rejected:=true;
 end;
 if not rejected then raise exception 'Active eBay source incorrectly permitted'; end if;
 if not exists(select 1 from public.ebay_erasure_work_items
   where receipt_id=v_id and surface='mapped_catalogue'
     and state='pending' and attempts=0 and lease_until is null)
 then raise exception 'Failed purge changed work state'; end if;
 if exists(select 1 from public.ebay_partial_erasure_audit where receipt_id=v_id)
 then raise exception 'Failed active-source purge created audit'; end if;
 if not exists(select 1 from public.offers where id='00000000-0000-4000-8000-000000000004')
 then raise exception 'Failed active-source purge deleted offer'; end if;
end $$;
rollback;

-- A later FK failure MUST rollback deletion, audit and claim together.
begin;
create table public.ebay_ci_restrictive_reference(
 offer_id uuid not null references public.offers(id) on delete restrict
);
insert into public.ebay_ci_restrictive_reference values
 ('00000000-0000-4000-8000-000000000004');
insert into public.ebay_account_item_links(identity_kind,identity_digest,offer_id)
 values ('user_id_digest',repeat('5',64),'00000000-0000-4000-8000-000000000004');
insert into public.ebay_deletion_receipts(notification_digest,user_id_digest)
 values (repeat('6',64),repeat('5',64));
do $$
declare rejected boolean:=false; v_id bigint;
begin
 select id into v_id from public.ebay_deletion_receipts
 where notification_digest=repeat('6',64);
 begin
  perform public.ebay_run_next_mapped_catalogue_erasure();
 exception when foreign_key_violation then rejected:=true;
 end;
 if not rejected then raise exception 'FK obstruction failed to halt mapped purge'; end if;
 if not exists(select 1 from public.ebay_erasure_work_items
  where receipt_id=v_id and surface='mapped_catalogue'
  and state='pending' and attempts=0 and lease_until is null)
 then raise exception 'Failed purge changed work state'; end if;
 if exists(select 1 from public.ebay_partial_erasure_audit where receipt_id=v_id)
 then raise exception 'Blocked purge created audit'; end if;
 if not exists(select 1 from public.offers where id='00000000-0000-4000-8000-000000000004')
 then raise exception 'Blocked purge removed offer'; end if;
end $$;
rollback;

do $$
begin
 if exists(select 1 from public.ebay_deletion_receipts)
 or exists(select 1 from public.ebay_account_item_links)
 or exists(select 1 from public.ebay_erasure_work_items)
 or exists(select 1 from public.ebay_partial_erasure_audit)
 or (select count(*) from public.offers)<>3
 then raise exception 'Synthetic processor residue remains'; end if;
end $$;
select 'EBAY_DBA_BOUNDED_MAPPED_PURGE_NATIVE_PASS';
