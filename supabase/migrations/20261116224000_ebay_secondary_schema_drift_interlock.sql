-- CANDIDATE ONLY. DBA-reviewed eBay offer deletion schema-drift interlock.
-- Do not apply to live Supabase before full-schema review.
-- This is a last-line safety trigger: unexpected FK or guardian drift
-- must abort the *original* mapped purge atomically. No account deletion.
create function public.ebay_assert_secondary_offer_integrity()
returns trigger language plpgsql security invoker set search_path = ''
as $$
declare
 v_count integer;
begin
 if not exists (
  select 1 from public.sources s where s.id=old.source_id
   and s.connector_key='ebay'
 ) then
  return old;
 end if;

 -- Four known real production FKs, exactly offer_id -> offers.id,
 -- validated and ON DELETE SET NULL. If altered to CASCADE/RESTRICT
 -- (or removed or unvalidated), a purge based on the original
 -- schema assumptions must fail closed.
 select count(distinct c.conrelid) into v_count
 from pg_catalog.pg_constraint c
 join pg_catalog.pg_attribute a
  on a.attrelid=c.conrelid and a.attname='offer_id'
 join pg_catalog.pg_attribute parent
  on parent.attrelid=c.confrelid and parent.attname='id'
 where c.contype='f'
  and c.conrelid in (
   'public.analytics_events'::pg_catalog.regclass,
   'public.attribution_events'::pg_catalog.regclass,
   'public.user_feedback'::pg_catalog.regclass,
   'public.watch_events'::pg_catalog.regclass
  )
  and c.confrelid='public.offers'::pg_catalog.regclass
  and c.conkey=ARRAY[a.attnum]::smallint[]
  and c.confkey=ARRAY[parent.attnum]::smallint[]
  and c.confdeltype='n'
  and c.convalidated;
 if v_count<>4 then
  raise exception 'eBay purge denied: secondary ownership FK schema drift';
 end if;

 -- Protect against a disabled or removed existing orphan-preservation
 -- trigger. A missing guard must never silently become permission to erase.
 if not exists(
  select 1 from pg_catalog.pg_trigger t
  where t.tgrelid='public.offers'::pg_catalog.regclass
   and t.tgname='ebay_offer_00_unreviewed_reference_gate'
   and not t.tgisinternal and t.tgenabled='O'
   and t.tgfoid='public.ebay_guard_unreviewed_offer_references()'::pg_catalog.regprocedure
 ) then
  raise exception 'eBay purge denied: secondary orphan guard unavailable';
 end if;
 return old;
end;
$$;
revoke all on function public.ebay_assert_secondary_offer_integrity()
 from public,anon,authenticated,service_role;

-- Name follows the reference guard. Even if the first guardian is disabled,
-- this interlock rejects erasure rather than bypassing it.
create trigger ebay_offer_01_integrity_drift_gate
before delete on public.offers
for each row execute function public.ebay_assert_secondary_offer_integrity();

comment on function public.ebay_assert_secondary_offer_integrity()
 is 'DBA-only eBay offer DELETE interlock: requires 4 validated SET NULL FKs and enabled orphan gate; no completion or provider ack.';
