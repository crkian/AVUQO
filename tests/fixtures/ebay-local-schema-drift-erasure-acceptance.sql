-- Native local-only synthetic Postgres. All DDL/DML drift is rolled back.
-- Exact original eBay mapped catalogue executor and audited purge are used.
-- Source fixture starts with one mapped eBay offer, unrelated eBay and other.

-- Baseline: valid schema + enabled existing guard => exact mapped purge works.
begin;
insert into public.ebay_account_item_links(identity_kind,identity_digest,offer_id)
 values('user_id_digest',repeat('1',64),'00000000-0000-4000-8000-000000000004');
insert into public.ebay_deletion_receipts(notification_digest,user_id_digest)
 values(repeat('2',64),repeat('1',64));
do $$
declare result record;
begin
 select * into strict result from public.ebay_run_next_mapped_catalogue_erasure();
 if result.offers_erased<>1 then
  raise exception 'Integrity interlock blocked valid eBay purge'; end if;
 if not exists(select 1 from public.ebay_erasure_work_items
  where surface='mapped_catalogue' and state='awaiting_evidence')
 then raise exception 'Valid work was not left awaiting evidence'; end if;
end $$;
rollback;

-- A removed FK must not permit the account mapping to be discarded.
begin;
alter table public.analytics_events drop constraint analytics_events_offer_id_fkey;
insert into public.ebay_account_item_links(identity_kind,identity_digest,offer_id)
 values('user_id_digest',repeat('3',64),'00000000-0000-4000-8000-000000000004');
insert into public.ebay_deletion_receipts(notification_digest,user_id_digest)
 values(repeat('4',64),repeat('3',64));
do $$
declare rejected boolean:=false;rid bigint;
begin
 select id into rid from public.ebay_deletion_receipts
 where notification_digest=repeat('4',64);
 begin
  perform public.ebay_run_next_mapped_catalogue_erasure();
 exception when raise_exception then
  if position('secondary ownership FK schema drift' in SQLERRM)>0 then
   rejected:=true;else raise;end if;
 end;
 if not rejected then raise exception 'Missing FK drift allowed mapped purge'; end if;
 if not exists(select 1 from public.offers
  where id='00000000-0000-4000-8000-000000000004')
 or exists(select 1 from public.ebay_partial_erasure_audit where receipt_id=rid)
 or not exists(select 1 from public.ebay_erasure_work_items
  where receipt_id=rid and surface='mapped_catalogue' and state='pending'
  and attempts=0 and lease_until is null)
 then raise exception 'Missing FK drift failed transaction rollback'; end if;
end $$;
rollback;

-- A changed ON DELETE action is equally unsafe, even with no child rows.
begin;
alter table public.attribution_events
 drop constraint attribution_events_offer_id_fkey;
alter table public.attribution_events
 add constraint attribution_events_offer_id_fkey
 foreign key(offer_id) references public.offers(id) on delete cascade;
insert into public.ebay_account_item_links(identity_kind,identity_digest,offer_id)
 values('user_id_digest',repeat('5',64),'00000000-0000-4000-8000-000000000004');
insert into public.ebay_deletion_receipts(notification_digest,user_id_digest)
 values(repeat('6',64),repeat('5',64));
do $$
declare rejected boolean:=false;rid bigint;
begin
 select id into rid from public.ebay_deletion_receipts
 where notification_digest=repeat('6',64);
 begin
  perform public.ebay_run_next_mapped_catalogue_erasure();
 exception when raise_exception then
  if position('secondary ownership FK schema drift' in SQLERRM)>0 then
   rejected:=true;else raise;end if;
 end;
 if not rejected then raise exception 'CASCADE drift allowed mapped purge'; end if;
 if exists(select 1 from public.ebay_partial_erasure_audit where receipt_id=rid)
 or not exists(select 1 from public.ebay_erasure_work_items
  where receipt_id=rid and surface='mapped_catalogue' and state='pending'
  and attempts=0 and lease_until is null)
 then raise exception 'CASCADE drift failed rollback'; end if;
end $$;
rollback;

-- A disabled orphan guard must never make the path delete-safe.
begin;
alter table public.offers disable trigger ebay_offer_00_unreviewed_reference_gate;
insert into public.ebay_account_item_links(identity_kind,identity_digest,offer_id)
 values('user_id_digest',repeat('7',64),'00000000-0000-4000-8000-000000000004');
insert into public.ebay_deletion_receipts(notification_digest,user_id_digest)
 values(repeat('8',64),repeat('7',64));
do $$
declare rejected boolean:=false;rid bigint;
begin
 select id into rid from public.ebay_deletion_receipts
 where notification_digest=repeat('8',64);
 begin
  perform public.ebay_run_next_mapped_catalogue_erasure();
 exception when raise_exception then
  if position('secondary orphan guard unavailable' in SQLERRM)>0 then
   rejected:=true;else raise;end if;
 end;
 if not rejected then raise exception 'Disabled orphan guard allowed mapped purge'; end if;
 if not exists(select 1 from public.offers
  where id='00000000-0000-4000-8000-000000000004')
 or exists(select 1 from public.ebay_partial_erasure_audit where receipt_id=rid)
 or not exists(select 1 from public.ebay_erasure_work_items
  where receipt_id=rid and surface='mapped_catalogue' and attempts=0 and state='pending')
 then raise exception 'Disabled guard failed rollback'; end if;
end $$;
rollback;

-- Non-eBay deletes remain under their original independent source rules.
begin;
alter table public.analytics_events drop constraint analytics_events_offer_id_fkey;
delete from public.offers where id='00000000-0000-4000-8000-000000000003';
do $$
begin
 if exists(select 1 from public.offers
   where id='00000000-0000-4000-8000-000000000003')
 then raise exception 'Schema drift affected unrelated source'; end if;
 if not exists(select 1 from public.offers
   where id='00000000-0000-4000-8000-000000000004')
 then raise exception 'Non-eBay delete interfered with eBay data'; end if;
end $$;
rollback;

do $$
declare n integer;
begin
 if exists(select 1 from public.ebay_deletion_receipts)
 or exists(select 1 from public.ebay_account_item_links)
 or exists(select 1 from public.ebay_erasure_work_items)
 or exists(select 1 from public.ebay_partial_erasure_audit)
 or (select count(*) from public.offers)<>3
 then raise exception 'Synthetic schema drift evidence remains'; end if;
 select count(*) into n from pg_catalog.pg_constraint c
 where c.contype='f' and c.confdeltype='n' and c.convalidated
  and c.conrelid in ('public.analytics_events'::regclass,
  'public.attribution_events'::regclass,
  'public.user_feedback'::regclass,'public.watch_events'::regclass)
  and c.confrelid='public.offers'::regclass;
 if n<>4 then raise exception 'Schema shape did not restore after rollback'; end if;
 if not exists(select 1 from pg_catalog.pg_trigger where
  tgrelid='public.offers'::regclass
  and tgname='ebay_offer_00_unreviewed_reference_gate' and tgenabled='O')
 then raise exception 'Orphan guard remained disabled'; end if;
end $$;
select 'EBAY_FK_DRIFT_AND_DISABLED_GUARD_FAIL_CLOSED_PASS';
