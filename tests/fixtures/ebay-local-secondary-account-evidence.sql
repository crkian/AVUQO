-- Synthetic exact-account secondary evidence on real eBay ownership migrations.
-- All operations rolled back. Does not alter any live database.
begin;
insert into public.ebay_account_item_links(identity_kind,identity_digest,offer_id)
values
 ('user_id_digest',repeat('a',64),'00000000-0000-4000-8000-000000000004'),
 ('username_digest',repeat('b',64),'00000000-0000-4000-8000-000000000004'),
 ('user_id_digest',repeat('c',64),'00000000-0000-4000-8000-000000000007');
insert into public.ebay_deletion_receipts
 (notification_digest,user_id_digest,username_digest)
values
 (repeat('e',64),repeat('a',64),repeat('b',64)),
 (repeat('f',64),repeat('d',64),null);

insert into public.analytics_events(offer_id) values
 ('00000000-0000-4000-8000-000000000004'),
 ('00000000-0000-4000-8000-000000000007'),
 ('00000000-0000-4000-8000-000000000003');
insert into public.attribution_events(offer_id) values
 ('00000000-0000-4000-8000-000000000004'),
 ('00000000-0000-4000-8000-000000000007'),
 ('00000000-0000-4000-8000-000000000003');
insert into public.user_feedback(id,offer_id) values
 ('00000000-0000-4000-8000-00000000000b','00000000-0000-4000-8000-000000000004'),
 ('00000000-0000-4000-8000-00000000000c','00000000-0000-4000-8000-000000000007'),
 ('00000000-0000-4000-8000-00000000000d','00000000-0000-4000-8000-000000000003');
insert into public.watch_events(id,offer_id) values
 ('00000000-0000-4000-8000-00000000000e','00000000-0000-4000-8000-000000000004'),
 ('00000000-0000-4000-8000-00000000000f','00000000-0000-4000-8000-000000000007'),
 ('00000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000003');

do $$
declare
 v_first bigint;
 v_second bigint;
 v_report record;
begin
 select id into strict v_first from public.ebay_deletion_receipts
 where notification_digest=repeat('e',64);
 select * into strict v_report
 from public.ebay_secondary_account_reference_counts(v_first);
 if v_report.mapped_offers<>1 then
  raise exception 'Expected one distinct linked eBay offer';
 end if;
 if v_report.analytics_records<>1
 or v_report.attribution_records<>1
 or v_report.feedback_records<>1
 or v_report.watch_records<>1
 or v_report.has_unresolved_secondary_records is not true then
  raise exception 'Expected four secondary records for exact account';
 end if;
 if v_report.analytics_records>1 or v_report.feedback_records>1 then
  raise exception 'Unrelated source data leaked into account evidence';
 end if;
 select id into strict v_second from public.ebay_deletion_receipts
 where notification_digest=repeat('f',64);
 select * into strict v_report
 from public.ebay_secondary_account_reference_counts(v_second);
 if v_report.mapped_offers<>0 or v_report.analytics_records<>0
 or v_report.attribution_records<>0 or v_report.feedback_records<>0
 or v_report.watch_records<>0
 or v_report.has_unresolved_secondary_records is not false then
  raise exception 'Zero-linked account must have zero secondary records';
 end if;
 if not exists(select 1 from public.ebay_deletion_receipts
 where id=v_first and state='pending_privacy_review' and completed_at is null)
 then raise exception 'Evidence function changed receipt state'; end if;
 if (select count(*) from public.ebay_erasure_work_items)<>14
 then raise exception 'Evidence function changed work queue'; end if;
end $$;
rollback;
do $$
begin
 if exists(select 1 from public.ebay_deletion_receipts)
 or exists(select 1 from public.ebay_account_item_links)
 or exists(select 1 from public.ebay_erasure_work_items)
 or exists(select 1 from public.analytics_events)
 or exists(select 1 from public.attribution_events)
 or exists(select 1 from public.user_feedback)
 or exists(select 1 from public.watch_events)
 then raise exception 'Synthetic secondary evidence residue remains'; end if;
end $$;
select 'EBAY_ACCOUNT_SCOPED_SECONDARY_EVIDENCE_PASS';
