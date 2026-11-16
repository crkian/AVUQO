-- TEST-ONLY DEPENDENCY for the executor's existing audited purge RPC.
-- The actual production implementation remains unchanged and is NOT replaced.
-- This fixture intentionally models only deletion of mapped offers/ingestion.
create table public.ebay_partial_erasure_audit (
 id bigint generated always as identity primary key,
 receipt_id bigint not null references public.ebay_deletion_receipts(id),
 offers_erased bigint not null, ingestion_items_erased bigint not null,
 price_records_erased bigint not null, matches_erased bigint not null
);
create function public.ebay_run_audited_partial_erasure(p_notification_digest text)
returns table(audit_id bigint,offers_erased bigint,ingestion_items_erased bigint,
 price_records_erased bigint,matches_erased bigint)
language plpgsql security definer set search_path='' as $$
declare
 v_receipt public.ebay_deletion_receipts%rowtype;
 v_offers uuid[];
 v_items uuid[];
 v_offers_deleted bigint;
 v_items_deleted bigint;
 v_id bigint;
begin
 select * into strict v_receipt from public.ebay_deletion_receipts
 where notification_digest=p_notification_digest for update;
 select coalesce(array_agg(l.offer_id),array[]::uuid[]) into v_offers
 from public.ebay_account_item_links l
 where l.offer_id is not null and
   ((l.identity_kind='user_id_digest' and l.identity_digest=v_receipt.user_id_digest)
    or (l.identity_kind='username_digest' and l.identity_digest=v_receipt.username_digest)
    or (l.identity_kind='eias_token_digest' and l.identity_digest=v_receipt.eias_token_digest));
 select coalesce(array_agg(l.ingestion_item_id),array[]::uuid[]) into v_items
 from public.ebay_account_item_links l
 where l.ingestion_item_id is not null and
   ((l.identity_kind='user_id_digest' and l.identity_digest=v_receipt.user_id_digest)
    or (l.identity_kind='username_digest' and l.identity_digest=v_receipt.username_digest)
    or (l.identity_kind='eias_token_digest' and l.identity_digest=v_receipt.eias_token_digest));
 if exists(select 1 from public.offers o where o.id=any(v_offers)
     and o.source_id<>(select s.id from public.sources s where s.connector_key='ebay'))
 or exists(select 1 from public.source_ingestion_items i where i.id=any(v_items)
     and i.source_id<>(select s.id from public.sources s where s.connector_key='ebay'))
 then raise exception 'Mock linked cross-source target'; end if;
 delete from public.offers o where o.id=any(v_offers)
 and o.source_id=(select s.id from public.sources s where s.connector_key='ebay');
 get diagnostics v_offers_deleted=row_count;
 delete from public.source_ingestion_items i where i.id=any(v_items)
 and i.source_id=(select s.id from public.sources s where s.connector_key='ebay');
 get diagnostics v_items_deleted=row_count;
 insert into public.ebay_partial_erasure_audit
 (receipt_id,offers_erased,ingestion_items_erased,price_records_erased,matches_erased)
 values(v_receipt.id,v_offers_deleted,v_items_deleted,0,0) returning id into v_id;
 return query select v_id,v_offers_deleted,v_items_deleted,0::bigint,0::bigint;
end $$;
revoke all on function public.ebay_run_audited_partial_erasure(text)
 from public,anon,authenticated,service_role;
