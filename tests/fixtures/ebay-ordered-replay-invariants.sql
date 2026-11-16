-- Read-only post-install invariants after exact chronological migration replay.
do $$
declare
 n bigint;
begin
 select count(*) into n from public.ebay_deletion_receipts;
 if n<>0 then raise exception 'Migration replay created private deletion receipt'; end if;
 select count(*) into n from public.ebay_account_item_links;
 if n<>0 then raise exception 'Migration replay created identity link'; end if;
 select count(*) into n from public.ebay_erasure_work_items;
 if n<>0 then raise exception 'Migration replay unexpectedly seeded work'; end if;
 select count(*) into n from public.ebay_partial_erasure_audit;
 if n<>0 then raise exception 'Migration replay created audit entry'; end if;
 if not exists(select 1 from public.sources where connector_key='ebay'
  and status='paused' and sync_enabled=false) then
  raise exception 'Migration replay changed source quarantine'; end if;
 if not exists(select 1 from public.offers where source_offer_id='outside-ebay')
 then raise exception 'Migration replay changed unrelated retailer offer'; end if;
end $$;
select 'EBAY_ORDERED_REPLAY_NO_SIDE_EFFECTS_PASS';
