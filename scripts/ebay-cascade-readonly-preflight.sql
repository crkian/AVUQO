-- READ-ONLY: verify exact seven live cascading offer relationships and
-- independent eBay containment trigger. No DDL, mutation or account data.
with known(rel) as (values
 ('public.availability'),
 ('public.awin_offer_release_reviews'),
 ('public.awin_release_audit'),
 ('public.click_events'),
 ('public.deal_scores'),
 ('public.promotion_candidates'),
 ('public.published_deals')
), fks as (
 select count(distinct c.conrelid)::integer as valid_count
 from pg_catalog.pg_constraint c
 join pg_catalog.pg_attribute a
  on a.attrelid=c.conrelid and a.attname='offer_id'
 join pg_catalog.pg_attribute parent
  on parent.attrelid=c.confrelid and parent.attname='id'
 where c.contype='f' and c.confdeltype='c' and c.convalidated
  and c.confrelid=pg_catalog.to_regclass('public.offers')
  and c.conkey=array[a.attnum]::smallint[]
  and c.confkey=array[parent.attnum]::smallint[]
  and c.conrelid in (select pg_catalog.to_regclass(rel) from known)
), guard as (
 select count(*)::integer as enabled_count from pg_catalog.pg_trigger t
 where t.tgrelid=pg_catalog.to_regclass('public.offers')
  and t.tgname='ebay_offer_02_unreviewed_cascade_gate'
  and not t.tgisinternal and t.tgenabled='O'
  and t.tgfoid=pg_catalog.to_regprocedure(
   'public.ebay_guard_unreviewed_cascading_offer_records()')
)
select 'seven_validated_cascade_fks' as check_id,
 case when (select valid_count from fks)=7 then 'PASS' else 'BLOCK' end as status
union all
select 'cascade_containment_guard_enabled',
 case when (select enabled_count from guard)=1 then 'PASS' else 'BLOCK' end
order by check_id;
