-- eBay production hard-stop. This lock intentionally remains in force until a
-- future reviewed migration replaces it with an atomic, privacy-safe importer.
-- No existing eBay offers/items were present at creation, and no source is enabled.
-- Suppression helper alone is NOT a database-level admission control.
create function public.ebay_reject_unapproved_source_writes()
returns trigger language plpgsql security invoker set search_path = ''
as $$
declare v_old_ebay boolean := false; v_new_ebay boolean := false;
begin
 if tg_op='UPDATE' then
   select exists(select 1 from public.sources s
     where s.id=old.source_id and s.connector_key='ebay') into v_old_ebay;
 end if;
 select exists(select 1 from public.sources s
   where s.id=new.source_id and s.connector_key='ebay') into v_new_ebay;
 if v_old_ebay or v_new_ebay then
   raise exception 'eBay ingestion quarantined until approved privacy-safe import';
 end if;
 return new;
end;
$$;
revoke all on function public.ebay_reject_unapproved_source_writes()
  from public,anon,authenticated,service_role;

create trigger ebay_offers_quarantine
before insert or update on public.offers for each row
execute function public.ebay_reject_unapproved_source_writes();

create trigger ebay_ingestion_quarantine
before insert or update on public.source_ingestion_items for each row
execute function public.ebay_reject_unapproved_source_writes();

create trigger ebay_product_matches_quarantine
before insert or update on public.product_matches for each row
execute function public.ebay_reject_unapproved_source_writes();

create trigger ebay_price_history_quarantine
before insert or update on public.price_history for each row
execute function public.ebay_reject_unapproved_source_writes();

-- A separate source-state guard prevents accidental unpausing and connector
-- relabels from bypassing the write quarantine.
create function public.ebay_reject_unapproved_source_activation()
returns trigger language plpgsql security invoker set search_path = ''
as $$
begin
 if tg_op='UPDATE' and old.connector_key='ebay'
  and new.connector_key is distinct from 'ebay' then
   raise exception 'eBay source identity cannot be relabelled';
 end if;
 if new.connector_key='ebay'
   and (new.status is distinct from 'paused' or new.sync_enabled is distinct from false)
 then
   raise exception 'eBay source cannot be activated before production approval';
 end if;
 return new;
end;
$$;
revoke all on function public.ebay_reject_unapproved_source_activation()
  from public,anon,authenticated,service_role;
create trigger ebay_source_activation_quarantine
before insert or update on public.sources for each row
execute function public.ebay_reject_unapproved_source_activation();

comment on function public.ebay_reject_unapproved_source_writes() is
'Quarantine: eBay writes forbidden until future reviewed atomic admission with deletion suppression. Does NOT complete account deletion.';
