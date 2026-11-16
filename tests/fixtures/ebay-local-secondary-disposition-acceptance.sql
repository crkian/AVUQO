-- Minimal synthetic PostgreSQL schema; all owner-linked shopper records are
-- fake and rolled back. Exact original migrations under test.
begin;
insert into public.ebay_account_item_links(identity_kind,identity_digest,offer_id)
 values('user_id_digest',repeat('a',64),'00000000-0000-4000-8000-000000000004');
insert into public.ebay_deletion_receipts(notification_digest,user_id_digest)
 values(repeat('b',64),repeat('a',64)),
       (repeat('c',64),repeat('d',64));
insert into public.analytics_events(offer_id)
 values('00000000-0000-4000-8000-000000000004'),
       ('00000000-0000-4000-8000-000000000007');
insert into public.attribution_events(offer_id)
 values('00000000-0000-4000-8000-000000000004');
insert into public.user_feedback(id,offer_id)
 values('00000000-0000-4000-8000-00000000000b',
        '00000000-0000-4000-8000-000000000004');
insert into public.watch_events(id,offer_id)
 values('00000000-0000-4000-8000-00000000000c',
        '00000000-0000-4000-8000-000000000004');

do $$
declare rid bigint; other_id bigint; result record; rejected boolean;
begin
 select id into strict rid from public.ebay_deletion_receipts
 where notification_digest=repeat('b',64);
 select id into strict other_id from public.ebay_deletion_receipts
 where notification_digest=repeat('c',64);
 rejected:=false;
 begin
  perform public.ebay_assess_leased_secondary_history(rid,1);
 exception when others then rejected:=true;
 end;
 if not rejected then raise exception 'Unleased secondary assessment accepted'; end if;

 -- This is an isolated lease fixture. General claim order may select
 -- a different surface, so acquire only the named surface here.
 update public.ebay_erasure_work_items
 set state='leased',attempts=1,
     lease_until=clock_timestamp()+interval '90 seconds'
 where receipt_id=rid and surface='analytics_attribution';
 rejected:=false;
 begin
  perform public.ebay_assess_leased_secondary_history(rid,2);
 exception when others then rejected:=true;
 end;
 if not rejected then raise exception 'Stale assessment was accepted'; end if;

 select * into strict result
 from public.ebay_assess_leased_secondary_history(rid,1);
 if result.work_state<>'blocked'
 or result.mapped_offers<>1 or result.analytics_records<>1
 or result.attribution_records<>1 or result.feedback_records<>1
 or result.watch_records<>1 then
  raise exception 'Linked shopper history not blocked';
 end if;
 if not exists(select 1 from public.ebay_erasure_work_items
 where receipt_id=rid and surface='analytics_attribution'
 and state='blocked' and attempts=1 and lease_until is null
 and last_failure_code='SECONDARY_REVIEW_REQUIRED')
 then raise exception 'Blocked outcome was not durable within transaction'; end if;
 rejected:=false;
 begin
  perform public.ebay_assess_leased_secondary_history(rid,1);
 exception when others then rejected:=true;
 end;
 if not rejected then raise exception 'Duplicate assessment was accepted'; end if;
 if (select count(*) from public.analytics_events)<>2
 or (select count(*) from public.attribution_events)<>1
 or (select count(*) from public.user_feedback)<>1
 or (select count(*) from public.watch_events)<>1
 then raise exception 'Assessment altered shopper history'; end if;

 update public.ebay_erasure_work_items
 set state='leased',attempts=1,
     lease_until=clock_timestamp()+interval '90 seconds'
 where receipt_id=other_id and surface='analytics_attribution';
 select * into strict result
 from public.ebay_assess_leased_secondary_history(other_id,1);
 if result.work_state<>'awaiting_evidence'
 or result.mapped_offers<>0 or result.analytics_records<>0
 or result.attribution_records<>0 or result.feedback_records<>0
 or result.watch_records<>0 then
  raise exception 'No unlinked account may be called verified';
 end if;
 if not exists(select 1 from public.ebay_erasure_work_items
 where receipt_id=other_id and surface='analytics_attribution'
 and state='awaiting_evidence' and last_failure_code is null)
 then raise exception 'Zero-link work must still await independent evidence'; end if;
 if (select count(*) from public.ebay_deletion_receipts
 where state='pending_privacy_review' and completed_at is null)<>2
 then raise exception 'Assessment must never complete account deletion'; end if;
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
 then raise exception 'Synthetic secondary disposition residue remains'; end if;
end $$;
select 'EBAY_SECONDARY_DISPOSITION_REVIEW_PASS';
