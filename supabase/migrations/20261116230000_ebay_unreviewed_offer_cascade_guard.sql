-- CANDIDATE ONLY: eBay-only cascade containment until per-store retention review.
-- Verified against live Supabase: 7 additional validated ON DELETE CASCADE FKs.
-- NO source activation, eBay acknowledgement or receipt completion.
create function public.ebay_guard_unreviewed_cascading_offer_records()
returns trigger language plpgsql security invoker set search_path = ''
as $$
declare
 v_fk_count integer;
 v_total_fk integer;
begin
 if not exists(select 1 from public.sources s
   where s.id=old.source_id and s.connector_key='ebay') then
   return old;
 end if;

 -- Exact current live FK shape: protect all seven named dependent tables.
 -- Do not infer authorization from generic CASCADE. These may contain
 -- shopper events, curated bargains or retailer release/audit evidence.
 select count(distinct c.conrelid) into v_fk_count
 from pg_catalog.pg_constraint c
 join pg_catalog.pg_attribute child
  on child.attrelid=c.conrelid and child.attname='offer_id'
 join pg_catalog.pg_attribute parent
  on parent.attrelid=c.confrelid and parent.attname='id'
 where c.contype='f' and c.confdeltype='c' and c.convalidated
  and c.confrelid='public.offers'::pg_catalog.regclass
  and c.conkey=array[child.attnum]::smallint[]
  and c.confkey=array[parent.attnum]::smallint[]
  and c.conrelid in (
   'public.availability'::pg_catalog.regclass,
   'public.awin_offer_release_reviews'::pg_catalog.regclass,
   'public.awin_release_audit'::pg_catalog.regclass,
   'public.click_events'::pg_catalog.regclass,
   'public.deal_scores'::pg_catalog.regclass,
   'public.promotion_candidates'::pg_catalog.regclass,
   'public.published_deals'::pg_catalog.regclass
  );
 if v_fk_count<>7 then
  raise exception 'eBay purge denied: cascading offer FK schema drift';
 end if;
 -- Full observed production dependency set includes seven reviewed CASCADE
 -- tables, four SET NULL shopper-history tables and two intentional mapped
 -- ownership/price-history CASCADE tables. A NEW FK must also fail closed:
 -- otherwise the offer could silently cascade into an unexamined surface.
 select count(*) into v_total_fk
 from pg_catalog.pg_constraint c
 where c.contype='f'
   and c.confrelid='public.offers'::pg_catalog.regclass;
 if v_total_fk<>13 then
  raise exception 'eBay purge denied: unknown offer FK dependency';
 end if;

 -- None of the seven records may be silently cascaded.  Retention and
 -- per-account ownership decisions must happen separately and explicitly.
 if false
  or exists(select 1 from public.availability x where x.offer_id=old.id)
  or exists(select 1 from public.awin_offer_release_reviews x where x.offer_id=old.id)
  or exists(select 1 from public.awin_release_audit x where x.offer_id=old.id)
  or exists(select 1 from public.click_events x where x.offer_id=old.id)
  or exists(select 1 from public.deal_scores x where x.offer_id=old.id)
  or exists(select 1 from public.promotion_candidates x where x.offer_id=old.id)
  or exists(select 1 from public.published_deals x where x.offer_id=old.id) then
  raise exception 'eBay purge blocked: dependent catalogue/event/release records require review';
 end if;
 return old;
end;
$$;
revoke all on function public.ebay_guard_unreviewed_cascading_offer_records()
 from public,anon,authenticated,service_role;
create trigger ebay_offer_02_unreviewed_cascade_gate
before delete on public.offers
for each row execute function public.ebay_guard_unreviewed_cascading_offer_records();
comment on function public.ebay_guard_unreviewed_cascading_offer_records()
 is 'Candidate eBay-only seven-table cascade-loss guard; prevents unexpected deletion of shopper events and retailer release records. Does NOT complete account deletion.';
