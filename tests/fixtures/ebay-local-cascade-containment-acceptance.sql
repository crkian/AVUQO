-- Synthetic full dependency containment. Exact original DBA worker
-- and audited purge, plus the eBay offer guards, run on local PostgreSQL.
-- Each of the seven real CASCADE tables must not be silently deleted.
-- Exact real partial-purge path must fail atomically for availability.
begin;
insert into public.availability(offer_id)
 values('00000000-0000-4000-8000-000000000004');
insert into public.ebay_account_item_links(identity_kind,identity_digest,offer_id)
 values('user_id_digest',repeat('1',64),'00000000-0000-4000-8000-000000000004');
insert into public.ebay_deletion_receipts(notification_digest,user_id_digest)
 values(repeat('9',64),repeat('1',64));
do $$
declare rejected boolean:=false;rid bigint; n integer;
begin
 select id into strict rid from public.ebay_deletion_receipts
 where notification_digest=repeat('9',64);
 begin
  perform public.ebay_run_next_mapped_catalogue_erasure();
 exception when raise_exception then
  if position('dependent catalogue/event/release records require review' in sqlerrm)>0 then
   rejected:=true; else raise; end if;
 end;
 if not rejected then raise exception 'Cascading record of availability erased without review'; end if;
 if not exists(select 1 from public.offers
  where id='00000000-0000-4000-8000-000000000004')
 or not exists(select 1 from public.availability
  where offer_id='00000000-0000-4000-8000-000000000004')
 or exists(select 1 from public.ebay_partial_erasure_audit where receipt_id=rid)
 or not exists(select 1 from public.ebay_erasure_work_items
  where receipt_id=rid and surface='mapped_catalogue'
   and state='pending' and attempts=0 and lease_until is null)
 then raise exception 'availability failed atomic rollback'; end if;
 if not exists(select 1 from public.ebay_deletion_receipts
  where id=rid and completed_at is null and state='pending_privacy_review')
 then raise exception 'availability receipt incorrectly completed'; end if;
end $$;
rollback;

-- Exact real partial-purge path must fail atomically for awin_offer_release_reviews.
begin;
insert into public.awin_offer_release_reviews(offer_id)
 values('00000000-0000-4000-8000-000000000004');
insert into public.ebay_account_item_links(identity_kind,identity_digest,offer_id)
 values('user_id_digest',repeat('2',64),'00000000-0000-4000-8000-000000000004');
insert into public.ebay_deletion_receipts(notification_digest,user_id_digest)
 values(repeat('a',64),repeat('2',64));
do $$
declare rejected boolean:=false;rid bigint; n integer;
begin
 select id into strict rid from public.ebay_deletion_receipts
 where notification_digest=repeat('a',64);
 begin
  perform public.ebay_run_next_mapped_catalogue_erasure();
 exception when raise_exception then
  if position('dependent catalogue/event/release records require review' in sqlerrm)>0 then
   rejected:=true; else raise; end if;
 end;
 if not rejected then raise exception 'Cascading record of awin_offer_release_reviews erased without review'; end if;
 if not exists(select 1 from public.offers
  where id='00000000-0000-4000-8000-000000000004')
 or not exists(select 1 from public.awin_offer_release_reviews
  where offer_id='00000000-0000-4000-8000-000000000004')
 or exists(select 1 from public.ebay_partial_erasure_audit where receipt_id=rid)
 or not exists(select 1 from public.ebay_erasure_work_items
  where receipt_id=rid and surface='mapped_catalogue'
   and state='pending' and attempts=0 and lease_until is null)
 then raise exception 'awin_offer_release_reviews failed atomic rollback'; end if;
 if not exists(select 1 from public.ebay_deletion_receipts
  where id=rid and completed_at is null and state='pending_privacy_review')
 then raise exception 'awin_offer_release_reviews receipt incorrectly completed'; end if;
end $$;
rollback;

-- Exact real partial-purge path must fail atomically for awin_release_audit.
begin;
insert into public.awin_release_audit(offer_id)
 values('00000000-0000-4000-8000-000000000004');
insert into public.ebay_account_item_links(identity_kind,identity_digest,offer_id)
 values('user_id_digest',repeat('3',64),'00000000-0000-4000-8000-000000000004');
insert into public.ebay_deletion_receipts(notification_digest,user_id_digest)
 values(repeat('b',64),repeat('3',64));
do $$
declare rejected boolean:=false;rid bigint; n integer;
begin
 select id into strict rid from public.ebay_deletion_receipts
 where notification_digest=repeat('b',64);
 begin
  perform public.ebay_run_next_mapped_catalogue_erasure();
 exception when raise_exception then
  if position('dependent catalogue/event/release records require review' in sqlerrm)>0 then
   rejected:=true; else raise; end if;
 end;
 if not rejected then raise exception 'Cascading record of awin_release_audit erased without review'; end if;
 if not exists(select 1 from public.offers
  where id='00000000-0000-4000-8000-000000000004')
 or not exists(select 1 from public.awin_release_audit
  where offer_id='00000000-0000-4000-8000-000000000004')
 or exists(select 1 from public.ebay_partial_erasure_audit where receipt_id=rid)
 or not exists(select 1 from public.ebay_erasure_work_items
  where receipt_id=rid and surface='mapped_catalogue'
   and state='pending' and attempts=0 and lease_until is null)
 then raise exception 'awin_release_audit failed atomic rollback'; end if;
 if not exists(select 1 from public.ebay_deletion_receipts
  where id=rid and completed_at is null and state='pending_privacy_review')
 then raise exception 'awin_release_audit receipt incorrectly completed'; end if;
end $$;
rollback;

-- Exact real partial-purge path must fail atomically for click_events.
begin;
insert into public.click_events(offer_id)
 values('00000000-0000-4000-8000-000000000004');
insert into public.ebay_account_item_links(identity_kind,identity_digest,offer_id)
 values('user_id_digest',repeat('4',64),'00000000-0000-4000-8000-000000000004');
insert into public.ebay_deletion_receipts(notification_digest,user_id_digest)
 values(repeat('c',64),repeat('4',64));
do $$
declare rejected boolean:=false;rid bigint; n integer;
begin
 select id into strict rid from public.ebay_deletion_receipts
 where notification_digest=repeat('c',64);
 begin
  perform public.ebay_run_next_mapped_catalogue_erasure();
 exception when raise_exception then
  if position('dependent catalogue/event/release records require review' in sqlerrm)>0 then
   rejected:=true; else raise; end if;
 end;
 if not rejected then raise exception 'Cascading record of click_events erased without review'; end if;
 if not exists(select 1 from public.offers
  where id='00000000-0000-4000-8000-000000000004')
 or not exists(select 1 from public.click_events
  where offer_id='00000000-0000-4000-8000-000000000004')
 or exists(select 1 from public.ebay_partial_erasure_audit where receipt_id=rid)
 or not exists(select 1 from public.ebay_erasure_work_items
  where receipt_id=rid and surface='mapped_catalogue'
   and state='pending' and attempts=0 and lease_until is null)
 then raise exception 'click_events failed atomic rollback'; end if;
 if not exists(select 1 from public.ebay_deletion_receipts
  where id=rid and completed_at is null and state='pending_privacy_review')
 then raise exception 'click_events receipt incorrectly completed'; end if;
end $$;
rollback;

-- Exact real partial-purge path must fail atomically for deal_scores.
begin;
insert into public.deal_scores(offer_id)
 values('00000000-0000-4000-8000-000000000004');
insert into public.ebay_account_item_links(identity_kind,identity_digest,offer_id)
 values('user_id_digest',repeat('5',64),'00000000-0000-4000-8000-000000000004');
insert into public.ebay_deletion_receipts(notification_digest,user_id_digest)
 values(repeat('d',64),repeat('5',64));
do $$
declare rejected boolean:=false;rid bigint; n integer;
begin
 select id into strict rid from public.ebay_deletion_receipts
 where notification_digest=repeat('d',64);
 begin
  perform public.ebay_run_next_mapped_catalogue_erasure();
 exception when raise_exception then
  if position('dependent catalogue/event/release records require review' in sqlerrm)>0 then
   rejected:=true; else raise; end if;
 end;
 if not rejected then raise exception 'Cascading record of deal_scores erased without review'; end if;
 if not exists(select 1 from public.offers
  where id='00000000-0000-4000-8000-000000000004')
 or not exists(select 1 from public.deal_scores
  where offer_id='00000000-0000-4000-8000-000000000004')
 or exists(select 1 from public.ebay_partial_erasure_audit where receipt_id=rid)
 or not exists(select 1 from public.ebay_erasure_work_items
  where receipt_id=rid and surface='mapped_catalogue'
   and state='pending' and attempts=0 and lease_until is null)
 then raise exception 'deal_scores failed atomic rollback'; end if;
 if not exists(select 1 from public.ebay_deletion_receipts
  where id=rid and completed_at is null and state='pending_privacy_review')
 then raise exception 'deal_scores receipt incorrectly completed'; end if;
end $$;
rollback;

-- Exact real partial-purge path must fail atomically for promotion_candidates.
begin;
insert into public.promotion_candidates(offer_id)
 values('00000000-0000-4000-8000-000000000004');
insert into public.ebay_account_item_links(identity_kind,identity_digest,offer_id)
 values('user_id_digest',repeat('6',64),'00000000-0000-4000-8000-000000000004');
insert into public.ebay_deletion_receipts(notification_digest,user_id_digest)
 values(repeat('e',64),repeat('6',64));
do $$
declare rejected boolean:=false;rid bigint; n integer;
begin
 select id into strict rid from public.ebay_deletion_receipts
 where notification_digest=repeat('e',64);
 begin
  perform public.ebay_run_next_mapped_catalogue_erasure();
 exception when raise_exception then
  if position('dependent catalogue/event/release records require review' in sqlerrm)>0 then
   rejected:=true; else raise; end if;
 end;
 if not rejected then raise exception 'Cascading record of promotion_candidates erased without review'; end if;
 if not exists(select 1 from public.offers
  where id='00000000-0000-4000-8000-000000000004')
 or not exists(select 1 from public.promotion_candidates
  where offer_id='00000000-0000-4000-8000-000000000004')
 or exists(select 1 from public.ebay_partial_erasure_audit where receipt_id=rid)
 or not exists(select 1 from public.ebay_erasure_work_items
  where receipt_id=rid and surface='mapped_catalogue'
   and state='pending' and attempts=0 and lease_until is null)
 then raise exception 'promotion_candidates failed atomic rollback'; end if;
 if not exists(select 1 from public.ebay_deletion_receipts
  where id=rid and completed_at is null and state='pending_privacy_review')
 then raise exception 'promotion_candidates receipt incorrectly completed'; end if;
end $$;
rollback;

-- Exact real partial-purge path must fail atomically for published_deals.
begin;
insert into public.published_deals(offer_id)
 values('00000000-0000-4000-8000-000000000004');
insert into public.ebay_account_item_links(identity_kind,identity_digest,offer_id)
 values('user_id_digest',repeat('7',64),'00000000-0000-4000-8000-000000000004');
insert into public.ebay_deletion_receipts(notification_digest,user_id_digest)
 values(repeat('f',64),repeat('7',64));
do $$
declare rejected boolean:=false;rid bigint; n integer;
begin
 select id into strict rid from public.ebay_deletion_receipts
 where notification_digest=repeat('f',64);
 begin
  perform public.ebay_run_next_mapped_catalogue_erasure();
 exception when raise_exception then
  if position('dependent catalogue/event/release records require review' in sqlerrm)>0 then
   rejected:=true; else raise; end if;
 end;
 if not rejected then raise exception 'Cascading record of published_deals erased without review'; end if;
 if not exists(select 1 from public.offers
  where id='00000000-0000-4000-8000-000000000004')
 or not exists(select 1 from public.published_deals
  where offer_id='00000000-0000-4000-8000-000000000004')
 or exists(select 1 from public.ebay_partial_erasure_audit where receipt_id=rid)
 or not exists(select 1 from public.ebay_erasure_work_items
  where receipt_id=rid and surface='mapped_catalogue'
   and state='pending' and attempts=0 and lease_until is null)
 then raise exception 'published_deals failed atomic rollback'; end if;
 if not exists(select 1 from public.ebay_deletion_receipts
  where id=rid and completed_at is null and state='pending_privacy_review')
 then raise exception 'published_deals receipt incorrectly completed'; end if;
end $$;
rollback;

-- Missing FK cannot become a silent bypass even when no child row exists.
begin;
alter table public.click_events
 drop constraint click_events_offer_id_fkey;
insert into public.ebay_account_item_links(identity_kind,identity_digest,offer_id)
 values('user_id_digest',repeat('a',64),'00000000-0000-4000-8000-000000000004');
insert into public.ebay_deletion_receipts(notification_digest,user_id_digest)
 values(repeat('b',64),repeat('a',64));
do $$
declare rejected boolean:=false;
begin
 begin
  perform public.ebay_run_next_mapped_catalogue_erasure();
 exception when raise_exception then
  if position('cascading offer FK schema drift' in sqlerrm)>0 then
   rejected:=true; else raise; end if;
 end;
 if not rejected then raise exception 'Cascade FK drift allowed eBay mapped purge'; end if;
end $$;
rollback;
-- A newly introduced offer FK is unknown to the reviewed inventory,
-- so the original purge cannot silently delete or orphan new table records.
begin;
create table public.ebay_ci_unreviewed_new_fk(
 id bigint generated always as identity primary key,
 offer_id uuid references public.offers(id) on delete cascade
);
insert into public.ebay_account_item_links(identity_kind,identity_digest,offer_id)
 values('user_id_digest',repeat('e',64),'00000000-0000-4000-8000-000000000004');
insert into public.ebay_deletion_receipts(notification_digest,user_id_digest)
 values(repeat('f',64),repeat('e',64));
do $ebay_new_fk$
declare rejected boolean:=false; rid bigint;
begin
 select id into strict rid from public.ebay_deletion_receipts
 where notification_digest=repeat('f',64);
 begin
  perform public.ebay_run_next_mapped_catalogue_erasure();
 exception when raise_exception then
  if position('unknown offer FK dependency' in sqlerrm)>0 then
   rejected:=true; else raise; end if;
 end;
 if not rejected then raise exception 'Unknown new offer FK allowed eBay mapped purge'; end if;
 if not exists(select 1 from public.offers where id='00000000-0000-4000-8000-000000000004')
 or exists(select 1 from public.ebay_partial_erasure_audit where receipt_id=rid)
 or not exists(select 1 from public.ebay_erasure_work_items
  where receipt_id=rid and surface='mapped_catalogue' and attempts=0 and state='pending')
 then raise exception 'Unknown FK failed atomic rollback'; end if;
end $ebay_new_fk$;
rollback;

-- Normal non-eBay retailer deletion behaviour remains unchanged.
begin;
insert into public.click_events(offer_id)
 values('00000000-0000-4000-8000-000000000003');
delete from public.offers
 where id='00000000-0000-4000-8000-000000000003';
do $$
begin
 if exists(select 1 from public.click_events
  where offer_id='00000000-0000-4000-8000-000000000003')
 then raise exception 'Unrelated retailer cascade incorrectly blocked'; end if;
end $$;
rollback;
-- Valid eligible mapped eBay offer without dependent records still moves
-- only to awaiting_evidence, never a complete provider deletion.
begin;
insert into public.ebay_account_item_links(identity_kind,identity_digest,offer_id)
 values('user_id_digest',repeat('c',64),'00000000-0000-4000-8000-000000000004');
insert into public.ebay_deletion_receipts(notification_digest,user_id_digest)
 values(repeat('d',64),repeat('c',64));
do $$
declare result record;
begin
 select * into strict result from public.ebay_run_next_mapped_catalogue_erasure();
 if result.offers_erased<>1 then
  raise exception 'Valid eBay mapped purge rejected by cascade guard'; end if;
 if not exists(select 1 from public.ebay_erasure_work_items
  where receipt_id=result.receipt_id and surface='mapped_catalogue'
   and state='awaiting_evidence')
 then raise exception 'Valid eBay purge failed awaiting-evidence disposition'; end if;
 if not exists(select 1 from public.ebay_deletion_receipts
  where id=result.receipt_id and state='pending_privacy_review' and completed_at is null)
 then raise exception 'Valid eBay purge falsely completed account deletion'; end if;
end $$;
rollback;
do $$
declare n integer;
begin
 if exists(select 1 from public.ebay_deletion_receipts)
 or exists(select 1 from public.ebay_erasure_work_items)
 or exists(select 1 from public.ebay_partial_erasure_audit)
 or exists(select 1 from public.ebay_account_item_links)
 or (select count(*) from public.offers)<>3
 then raise exception 'Synthetic cascade containment residue remains'; end if;
 if exists(select 1 from public.availability) then
 raise exception 'availability synthetic data was not rolled back'; end if;
 if exists(select 1 from public.awin_offer_release_reviews) then
 raise exception 'awin_offer_release_reviews synthetic data was not rolled back'; end if;
 if exists(select 1 from public.awin_release_audit) then
 raise exception 'awin_release_audit synthetic data was not rolled back'; end if;
 if exists(select 1 from public.click_events) then
 raise exception 'click_events synthetic data was not rolled back'; end if;
 if exists(select 1 from public.deal_scores) then
 raise exception 'deal_scores synthetic data was not rolled back'; end if;
 if exists(select 1 from public.promotion_candidates) then
 raise exception 'promotion_candidates synthetic data was not rolled back'; end if;
 if exists(select 1 from public.published_deals) then
 raise exception 'published_deals synthetic data was not rolled back'; end if;
 select count(distinct c.conrelid) into n from pg_catalog.pg_constraint c
 where c.contype='f' and c.confdeltype='c' and c.convalidated
 and c.confrelid='public.offers'::regclass
 and c.conrelid in (
 'public.availability'::regclass,
 'public.awin_offer_release_reviews'::regclass,
 'public.awin_release_audit'::regclass,
 'public.click_events'::regclass,
 'public.deal_scores'::regclass,
 'public.promotion_candidates'::regclass,
 'public.published_deals'::regclass
 );
 if n<>7 then raise exception 'Seven cascading constraints not restored'; end if;
 select count(*) into n from pg_catalog.pg_constraint
 where contype='f' and confrelid='public.offers'::regclass;
 if n<>13 then raise exception 'Thirteen offer foreign keys not restored'; end if;
end $$;
select 'EBAY_SEVEN_CASCADE_DEPENDENCIES_SAFE_PASS';
