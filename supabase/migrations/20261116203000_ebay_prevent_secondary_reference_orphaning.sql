-- Candidate migration: NEVER deploy without review.
-- Guard against irreversible offer->event ownership loss under ON DELETE SET NULL.
-- This does not erase analytics, attribution, feedback, watch history, backups,
-- processors or logs. It fails closed on a linked eBay offer.
create function public.ebay_guard_unreviewed_offer_references()
returns trigger language plpgsql security invoker set search_path = ''
as $$
begin
 if not exists (select 1 from public.sources s
   where s.id=old.source_id and s.connector_key='ebay') then
   return old;
 end if;

 -- Actual production FKs on these tables are ON DELETE SET NULL. Without this
 -- guard the original mapped purge could silently make the surviving event
 -- rows impossible to associate with an eBay seller/account later.
 if exists(select 1 from public.analytics_events e where e.offer_id=old.id)
 or exists(select 1 from public.attribution_events e where e.offer_id=old.id)
 or exists(select 1 from public.user_feedback e where e.offer_id=old.id)
 or exists(select 1 from public.watch_events e where e.offer_id=old.id) then
   raise exception 'eBay mapped purge blocked: dependent personal/event records require privacy review';
 end if;
 return old;
end;
$$;
revoke all on function public.ebay_guard_unreviewed_offer_references()
 from public,anon,authenticated,service_role;
create trigger ebay_offer_00_unreviewed_reference_gate
before delete on public.offers
for each row execute function public.ebay_guard_unreviewed_offer_references();

comment on function public.ebay_guard_unreviewed_offer_references()
 is 'Fail-closed eBay-only deletion guard: do not orphan analytics, attribution, feedback and watch records via ON DELETE SET NULL. NOT complete erasure.';
