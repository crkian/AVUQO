-- Native GitHub PostgreSQL isolated database, synthetic records only.
-- The preview must NEVER delete, lease, mark review, or complete a receipt.
begin;
do $$
declare v record;
begin
 select * into strict v from public.ebay_preview_next_mapped_erasure();
 if v.preview_state<>'NO_ELIGIBLE_PENDING_WORK' then
  raise exception 'Unexpected preview when no work exists';
 end if;
end $$;

insert into public.ebay_account_item_links(identity_kind,identity_digest,offer_id)
 values('user_id_digest',repeat('1',64),'00000000-0000-4000-8000-000000000004');
insert into public.ebay_deletion_receipts(notification_digest,user_id_digest)
 values(repeat('2',64),repeat('1',64));
insert into public.analytics_events(offer_id)
 values('00000000-0000-4000-8000-000000000004');
insert into public.attribution_events(offer_id)
 values('00000000-0000-4000-8000-000000000004');
insert into public.user_feedback(id,offer_id)
 values('00000000-0000-4000-8000-00000000000b','00000000-0000-4000-8000-000000000004');
insert into public.watch_events(id,offer_id)
 values('00000000-0000-4000-8000-00000000000c','00000000-0000-4000-8000-000000000004');

do $$
declare v record; rid bigint;
begin
 select id into strict rid from public.ebay_deletion_receipts where notification_digest=repeat('2',64);
 select * into strict v from public.ebay_preview_next_mapped_erasure();
 if v.preview_state<>'REVIEW_REQUIRED' or v.linked_ebay_offers<>1
 or v.analytics_records<>1 or v.attribution_records<>1
 or v.feedback_records<>1 or v.watch_records<>1
 or v.outstanding_secondary_review is not true
 then raise exception 'Related shopper history must require review'; end if;
 if exists(select 1 from public.ebay_erasure_work_items where receipt_id=rid
  and (state<>'pending' or attempts<>0 or lease_until is not null))
 then raise exception 'Read-only preview changed work-item attempt'; end if;
 if (select count(*) from public.ebay_erasure_work_items where receipt_id=rid)<>7
 then raise exception 'Preview changed seven-surface work journal'; end if;
 if not exists(select 1 from public.ebay_deletion_receipts where id=rid
 and state='pending_privacy_review' and completed_at is null)
 then raise exception 'Preview incorrectly completed deletion'; end if;
 if (select count(*) from public.offers)<>3
 or (select count(*) from public.analytics_events)<>1
 or (select count(*) from public.user_feedback)<>1
 then raise exception 'Preview modified product or shopper records'; end if;
end $$;

-- No linked shopper data is not enough to approve any deletion.
delete from public.analytics_events;
delete from public.attribution_events;
delete from public.user_feedback;
delete from public.watch_events;
do $$
declare v record;
begin
 select * into strict v from public.ebay_preview_next_mapped_erasure();
 if v.preview_state<>'CANDIDATE_ONLY_NOT_AUTHORISED'
 or v.outstanding_secondary_review is not false then
  raise exception 'Never auto-authorise deletion'; end if;
end $$;

-- Even if candidate rows exist, an active source makes preview fail closed.
update public.sources set status='active' where connector_key='ebay';
do $$
declare v record;
begin
 select * into strict v from public.ebay_preview_next_mapped_erasure();
 if v.preview_state<>'SOURCE_NOT_QUARANTINED'
 or v.linked_ebay_offers is not null then
  raise exception 'Preview exposed wrong source when enabled'; end if;
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
 or (select count(*) from public.offers)<>3
 then raise exception 'Synthetic preview test residue remains'; end if;
 if not exists(select 1 from public.sources where connector_key='ebay' and status='paused')
 then raise exception 'Synthetic eBay source quarantine not restored'; end if;
end $$;
select 'EBAY_DB_ONLY_DRY_RUN_PREVIEW_PASS';
