-- All synthetic user records are rolled back after these checks.
begin;
insert into public.ebay_deletion_receipts(notification_digest,user_id_digest) values(repeat('a',64),repeat('b',64));
do $$
declare n bigint;c record;st text;stale_rejected boolean:=false;
begin
 select count(*) into n from public.ebay_erasure_work_items;
 if n<>7 then raise exception 'Expected 7 queue items; got %',n; end if;
 select * into c from public.ebay_claim_erasure_work(90);
 if c.attempt<>1 or c.surface is null then raise exception 'Initial claim invalid'; end if;
 perform public.ebay_record_erasure_work_outcome(c.receipt_id,c.surface,c.attempt,'retry','LOCAL_RETRY');
 select state into st from public.ebay_erasure_work_items
 where receipt_id=c.receipt_id and surface=c.surface;
 if st<>'pending' then raise exception 'Retry state invalid'; end if;
 begin
  perform public.ebay_record_erasure_work_outcome(c.receipt_id,c.surface,c.attempt,'blocked','STALE');
 exception when others then stale_rejected:=true;
 end;
 if not stale_rejected then raise exception 'Stale attempt incorrectly accepted'; end if;
 select count(*) into n from public.ebay_erasure_work_items;
 if n<>7 then raise exception 'Queue count changed'; end if;
end $$;
rollback;
do $$
begin
 if exists(select 1 from public.ebay_deletion_receipts)
 or exists(select 1 from public.ebay_erasure_work_items)
 or exists(select 1 from public.ebay_account_item_links) then
  raise exception 'Synthetic records remain after rollback';
 end if;
end $$;
select 'LOCAL_ERASURE_ACCEPTANCE_PASS';
