-- Real native PostgreSQL permission and receipt integrity assertions.
-- Synthetic local CI database only. No production access.
do $$
declare
  v_role text;
  v_function text;
begin
 foreach v_role in array array['anon','authenticated','service_role'] loop
  if pg_catalog.has_table_privilege(v_role,'public.ebay_erasure_work_items','SELECT')
   or pg_catalog.has_table_privilege(v_role,'public.ebay_erasure_work_items','INSERT')
   or pg_catalog.has_table_privilege(v_role,'public.ebay_erasure_work_items','UPDATE')
   or pg_catalog.has_table_privilege(v_role,'public.ebay_erasure_work_items','DELETE') then
    raise exception 'Unexpected queue privileges granted to %',v_role;
  end if;
  foreach v_function in array array[
   'public.ebay_claim_erasure_work(integer)',
   'public.ebay_record_erasure_work_outcome(bigint,text,integer,text,text)'
  ] loop
   if pg_catalog.has_function_privilege(v_role,v_function,'EXECUTE') then
    raise exception 'Unexpected erasure function EXECUTE granted to %: %',v_role,v_function;
   end if;
  end loop;
 end loop;
 if not (select s.status='paused' and s.sync_enabled=false
   from public.sources s where s.connector_key='ebay') then
   raise exception 'eBay source was unexpectedly enabled in synthetic fixture';
 end if;
end
$$;

-- Confirm a signed receipt can never be represented as fully erased by
-- changing state to completed; perform all mutations within a rollback.
begin;
insert into public.ebay_deletion_receipts(notification_digest,user_id_digest)
values(repeat('c',64),repeat('d',64));
do $$
declare
 blocked boolean := false;
begin
 begin
  update public.ebay_deletion_receipts
    set state='completed',completed_at=clock_timestamp()
  where notification_digest=repeat('c',64);
 exception when others then
  if SQLERRM like '%completion blocked%' then
   blocked := true;
  else
   raise;
  end if;
 end;
 if not blocked then raise exception 'False completed receipt accepted'; end if;
 if (select count(*) from public.ebay_erasure_work_items) <> 7 then
  raise exception 'Receipt failed to seed seven private work items';
 end if;
end
$$;
rollback;
select 'EBAY_PRIVATE_GRANTS_AND_TOMBSTONE_PASS';
