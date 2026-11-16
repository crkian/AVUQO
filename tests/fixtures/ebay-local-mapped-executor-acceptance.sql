-- REAL versioned mapped purge + audited wrapper + leased executor integration.
-- Minimal synthetic schema, never a production customer, no remote database.
-- All synthetic transactions rolled back, including offer and price/match rows.
begin;

-- Pre-existing mappings are allowed before suppression receipt. Three aliases,
-- two target kinds, and two source boundaries cover scoped erasure.
insert into public.source_ingestion_items(id,source_id) values
 ('00000000-0000-4000-8000-000000000005','00000000-0000-4000-8000-000000000001'),
 ('00000000-0000-4000-8000-000000000006','00000000-0000-4000-8000-000000000002');
insert into public.price_history(offer_id,source_id) values
 ('00000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000001'),
 ('00000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000002'),
 ('00000000-0000-4000-8000-000000000007','00000000-0000-4000-8000-000000000001');
insert into public.product_matches(id,source_id,source_offer_id) values
 ('00000000-0000-4000-8000-000000000008','00000000-0000-4000-8000-000000000001','owned-ebay'),
 ('00000000-0000-4000-8000-000000000009','00000000-0000-4000-8000-000000000002','outside-ebay'),
 ('00000000-0000-4000-8000-00000000000a','00000000-0000-4000-8000-000000000001','unlinked-ebay');
insert into public.ebay_account_item_links(identity_kind,identity_digest,offer_id) values
 ('user_id_digest',repeat('f',64),'00000000-0000-4000-8000-000000000004'),
 ('username_digest',repeat('b',64),'00000000-0000-4000-8000-000000000004');
insert into public.ebay_account_item_links(identity_kind,identity_digest,ingestion_item_id)
 values('eias_token_digest',repeat('c',64),'00000000-0000-4000-8000-000000000005');

insert into public.ebay_deletion_receipts
 (notification_digest,user_id_digest,username_digest,eias_token_digest)
 values(repeat('e',64),repeat('f',64),repeat('b',64),repeat('c',64));
update public.ebay_erasure_work_items set state='blocked'
 where surface<>'mapped_catalogue';

do $$
declare
 rid bigint; v_attempt integer; v_result record; rejected boolean;
begin
 select id into rid from public.ebay_deletion_receipts where notification_digest=repeat('e',64);

 -- Stale and unleased workers cannot invoke the real purge.
 rejected:=false;
 begin
  perform public.ebay_execute_leased_mapped_catalogue_erasure(rid,1);
 exception when others then rejected:=true;
 end;
 if not rejected then raise exception 'Unleased purge unexpectedly accepted'; end if;

 select c.attempt into v_attempt from public.ebay_claim_erasure_work(90) c
 where c.receipt_id=rid and c.surface='mapped_catalogue';
 if v_attempt<>1 then raise exception 'Mapped catalogue claim absent'; end if;

 rejected:=false;
 begin
  perform public.ebay_execute_leased_mapped_catalogue_erasure(rid,2);
 exception when others then rejected:=true;
 end;
 if not rejected then raise exception 'Stale attempt accepted'; end if;

 select * into v_result from public.ebay_execute_leased_mapped_catalogue_erasure(rid,1);
 if v_result.offers_erased<>1 or v_result.ingestion_items_erased<>1
  or v_result.price_records_erased<>1 or v_result.matches_erased<>1 then
  raise exception 'Unexpected original-purge row counts (%,%,%,%)',
   v_result.offers_erased,v_result.ingestion_items_erased,
   v_result.price_records_erased,v_result.matches_erased;
 end if;

 if exists(select 1 from public.offers where id='00000000-0000-4000-8000-000000000004')
 or exists(select 1 from public.source_ingestion_items where id='00000000-0000-4000-8000-000000000005')
 or exists(select 1 from public.price_history where offer_id='00000000-0000-4000-8000-000000000004')
 or exists(select 1 from public.product_matches where source_offer_id='owned-ebay')
 then raise exception 'Linked eBay data remained after original purge'; end if;
 if exists(select 1 from public.ebay_account_item_links where identity_digest in (repeat('f',64),repeat('b',64),repeat('c',64)))
 then raise exception 'Mapped link remained'; end if;

 if not exists(select 1 from public.offers where id='00000000-0000-4000-8000-000000000003')
 or not exists(select 1 from public.offers where id='00000000-0000-4000-8000-000000000007')
 or not exists(select 1 from public.source_ingestion_items where id='00000000-0000-4000-8000-000000000006')
 or (select count(*) from public.price_history)<>2
 or (select count(*) from public.product_matches)<>2
 then raise exception 'Non-eBay or unrelated eBay rows were incorrectly deleted'; end if;

 if not exists(select 1 from public.ebay_erasure_work_items
   where receipt_id=rid and surface='mapped_catalogue' and state='awaiting_evidence' and lease_until is null)
 then raise exception 'Missing review disposition'; end if;
 if (select count(*) from public.ebay_partial_erasure_audit where receipt_id=rid
      and offers_erased=1 and ingestion_items_erased=1 and price_records_erased=1 and matches_erased=1)<>1
 then raise exception 'Partial audit has unexpected original-purge row counts'; end if;
 if not exists(select 1 from public.ebay_deletion_receipts
   where id=rid and state='pending_privacy_review' and completed_at is null)
 then raise exception 'Receipt falsely marked complete'; end if;

 rejected:=false;
 begin
  perform public.ebay_execute_leased_mapped_catalogue_erasure(rid,1);
 exception when others then rejected:=true;
 end;
 if not rejected then raise exception 'Duplicate purge accepted'; end if;
end $$;
rollback;
do $$
begin
 if exists(select 1 from public.ebay_deletion_receipts)
 or exists(select 1 from public.ebay_erasure_work_items)
 or exists(select 1 from public.ebay_partial_erasure_audit)
 or exists(select 1 from public.ebay_account_item_links)
 or exists(select 1 from public.price_history)
 or exists(select 1 from public.product_matches)
 or exists(select 1 from public.source_ingestion_items)
 then raise exception 'Real purge acceptance fixture residue after rollback'; end if;
 if (select count(*) from public.offers)<>3
 then raise exception 'Fixture offers not restored by transaction rollback'; end if;
end $$;
select 'EBAY_ORIGINAL_MAPPED_PURGE_NATIVE_POSTGRES_PASS';
