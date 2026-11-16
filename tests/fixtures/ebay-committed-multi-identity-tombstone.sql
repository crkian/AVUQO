-- Docker-free GitHub-native PostgreSQL synthetic committed lifecycle.
-- Disposable CI DB only. Do NOT run against AVUQO production.
-- Real COMMITs intentionally remain until GitHub runner discards its VM.
-- They prove tombstone suppression and persisted queue seeding, NOT erasure.
begin;
insert into public.ebay_account_item_links(identity_kind,identity_digest,offer_id) values
 ('user_id_digest',repeat('1',64),'00000000-0000-4000-8000-000000000004'),
 ('username_digest',repeat('2',64),'00000000-0000-4000-8000-000000000005'),
 ('eias_token_digest',repeat('3',64),'00000000-0000-4000-8000-000000000006');
commit;

do $$
begin
 if (select count(*) from public.ebay_account_item_links where identity_digest in (repeat('1',64),repeat('2',64),repeat('3',64))) <> 3 then
  raise exception 'Committed synthetic account links missing';
 end if;
end $$;

begin;
insert into public.ebay_deletion_receipts(
 notification_digest,user_id_digest,username_digest,eias_token_digest
) values(repeat('4',64),repeat('1',64),repeat('2',64),repeat('3',64));
commit;

do $$
declare
 v_receipt_id bigint;
 v_kind text;
 v_digest text;
 v_blocked boolean;
 v_actual text;
 v_work_count bigint;
begin
 select id into strict v_receipt_id
 from public.ebay_deletion_receipts where notification_digest=repeat('4',64);
 select count(*) into v_work_count from public.ebay_erasure_work_items where receipt_id=v_receipt_id;
 if v_work_count<>7 then raise exception 'Committed receipt did not create exactly seven durable work items'; end if;
 for v_kind,v_digest in
  select * from (values
   ('user_id_digest',repeat('1',64)),
   ('username_digest',repeat('2',64)),
   ('eias_token_digest',repeat('3',64))
  ) as identifiers(kind,digest)
 loop
  if not public.ebay_is_account_digest_suppressed(v_kind,v_digest) then
   raise exception 'Committed receipt suppression missing for %',v_kind;
  end if;
  v_blocked:=false;
  begin
   insert into public.ebay_account_item_links(identity_kind,identity_digest,offer_id)
    values(v_kind,v_digest,'00000000-0000-4000-8000-000000000004');
  exception when others then
   get stacked diagnostics v_actual=message_text;
   if v_actual like '%Deleted eBay account cannot be relinked%' then
    v_blocked:=true;
   else
    raise exception 'Unexpected link rejection for %: %',v_kind,v_actual;
   end if;
  end;
  if not v_blocked then raise exception 'Suppressed identity relink was allowed for %',v_kind; end if;
 end loop;
 if (select count(*) from public.ebay_account_item_links where identity_digest in
  (repeat('1',64),repeat('2',64),repeat('3',64)))<>3 then
   raise exception 'Committed original account links were unexpectedly altered';
 end if;
 if exists(select 1 from public.ebay_deletion_receipts
   where id=v_receipt_id and (state<>'pending_privacy_review' or completed_at is not null)) then
  raise exception 'Committed receipt marked complete';
 end if;
 v_blocked:=false;
 begin
  update public.ebay_deletion_receipts set state='completed',completed_at=clock_timestamp()
   where id=v_receipt_id;
 exception when others then
  get stacked diagnostics v_actual=message_text;
  if v_actual like '%completion blocked%' then
   v_blocked:=true;
  else
   raise exception 'Unexpected completion protection error: %',v_actual;
  end if;
 end;
 if not v_blocked then raise exception 'False completion was accepted'; end if;
 if exists(select 1 from public.ebay_erasure_work_items where receipt_id=v_receipt_id
   and (state<>'pending' or attempts<>0)) then
  raise exception 'Committed work journal unexpectedly processed any tasks';
 end if;
end $$;
select 'COMMITTED_MULTI_IDENTITY_TOMBSTONE_PASS' as result;
