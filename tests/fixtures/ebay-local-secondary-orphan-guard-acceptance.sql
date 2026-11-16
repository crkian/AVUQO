-- Synthetic, rolled-back proof that original purge cannot orphan event rows.
begin;
insert into public.ebay_account_item_links(identity_kind,identity_digest,offer_id)
values ('user_id_digest',repeat('7',64),'00000000-0000-4000-8000-000000000004');
insert into public.ebay_deletion_receipts(notification_digest,user_id_digest)
values (repeat('8',64),repeat('7',64));
insert into public.analytics_events(offer_id) values('00000000-0000-4000-8000-000000000004');
insert into public.attribution_events(offer_id) values('00000000-0000-4000-8000-000000000004');
insert into public.user_feedback(id,offer_id) values
 ('00000000-0000-4000-8000-00000000000b','00000000-0000-4000-8000-000000000004');
insert into public.watch_events(id,offer_id) values
 ('00000000-0000-4000-8000-00000000000c','00000000-0000-4000-8000-000000000004');

do $$
declare v_receipt bigint; rejected boolean:=false; v_count bigint;
begin
 select id into strict v_receipt from public.ebay_deletion_receipts
 where notification_digest=repeat('8',64);
 begin
   perform public.ebay_run_next_mapped_catalogue_erasure();
 exception when raise_exception then
   if position('dependent personal/event records require privacy review' in SQLERRM)>0 then
     rejected:=true;
   else raise; end if;
 end;
 if not rejected then raise exception 'Unreviewed event references were not blocked'; end if;
 if not exists(select 1 from public.offers
   where id='00000000-0000-4000-8000-000000000004')
 then raise exception 'Guard failed to preserve eBay offer'; end if;
 if (select count(*) from public.analytics_events where offer_id='00000000-0000-4000-8000-000000000004')<>1
 or (select count(*) from public.attribution_events where offer_id='00000000-0000-4000-8000-000000000004')<>1
 or (select count(*) from public.user_feedback where offer_id='00000000-0000-4000-8000-000000000004')<>1
 or (select count(*) from public.watch_events where offer_id='00000000-0000-4000-8000-000000000004')<>1
 then raise exception 'Dependent event offer references were orphaned'; end if;
 if exists(select 1 from public.ebay_partial_erasure_audit where receipt_id=v_receipt)
 then raise exception 'Blocked purge created false audit'; end if;
 if not exists(select 1 from public.ebay_erasure_work_items
  where receipt_id=v_receipt and surface='mapped_catalogue' and state='pending' and attempts=0)
 then raise exception 'Blocked purge changed queue attempt'; end if;

 -- Test-only cleanup illustrates that a reviewed downstream erasure step
 -- must first remove ownership-dependent data (not provided in production).
 delete from public.analytics_events;
 delete from public.attribution_events;
 delete from public.user_feedback;
 delete from public.watch_events;
 select count(*) into v_count from public.ebay_run_next_mapped_catalogue_erasure();
 if v_count<>1 then raise exception 'Scoped purge did not proceed after synthetic dependencies cleared'; end if;
 if exists(select 1 from public.offers where id='00000000-0000-4000-8000-000000000004')
 then raise exception 'Mapped eBay offer remained after dependencies cleared'; end if;
end $$;
rollback;
do $$
begin
 if exists(select 1 from public.ebay_deletion_receipts)
 or exists(select 1 from public.ebay_erasure_work_items)
 or exists(select 1 from public.ebay_partial_erasure_audit)
 or (select count(*) from public.offers)<>3
 or exists(select 1 from public.analytics_events)
 or exists(select 1 from public.attribution_events)
 or exists(select 1 from public.user_feedback)
 or exists(select 1 from public.watch_events)
 then raise exception 'Synthetic reference-guard fixture residue remains'; end if;
end $$;
select 'EBAY_SECONDARY_RECORD_ORPHAN_GUARD_PASS';
