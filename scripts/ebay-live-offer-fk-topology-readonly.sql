-- AVUQO eBay, exact production-derived offers.id FK topology (17 Nov 2026).
-- Read-only. No seller/shopping rows or identifiers. Unknown fourteenth
-- dependency, renamed FK, nonvalidated FK, deferrable FK or changed action fails.
-- This validates the live dependency graph, NOT full schema or a DDL permit.
with required(child_table,fk_name,delete_action) as (
 values
  ('analytics_events'::text,'analytics_events_offer_id_fkey'::text,'n'::"char"),
  ('attribution_events'::text,'attribution_events_offer_id_fkey'::text,'n'::"char"),
  ('availability'::text,'availability_offer_id_fkey'::text,'c'::"char"),
  ('awin_offer_release_reviews'::text,'awin_offer_release_reviews_offer_id_fkey'::text,'c'::"char"),
  ('awin_release_audit'::text,'awin_release_audit_offer_id_fkey'::text,'c'::"char"),
  ('click_events'::text,'click_events_offer_id_fkey'::text,'c'::"char"),
  ('deal_scores'::text,'deal_scores_offer_id_fkey'::text,'c'::"char"),
  ('ebay_account_item_links'::text,'ebay_account_item_links_offer_id_fkey'::text,'c'::"char"),
  ('price_history'::text,'price_history_offer_id_fkey'::text,'c'::"char"),
  ('promotion_candidates'::text,'promotion_candidates_offer_id_fkey'::text,'c'::"char"),
  ('published_deals'::text,'published_deals_offer_id_fkey'::text,'c'::"char"),
  ('user_feedback'::text,'user_feedback_offer_id_fkey'::text,'n'::"char"),
  ('watch_events'::text,'watch_events_offer_id_fkey'::text,'n'::"char")
), actual as (
 select c.conname::text fk_name,child.relname::text child_table,
 c.confdeltype delete_action,c.convalidated,c.condeferrable,c.condeferred,
 childatt.attname::text child_column,parentatt.attname::text parent_column,
 c.conkey,c.confkey,childatt.attnum child_attnum,parentatt.attnum parent_attnum
 from pg_constraint c
 join pg_class child on child.oid=c.conrelid
 join pg_namespace n on n.oid=child.relnamespace and n.nspname='public'
 join pg_attribute childatt on childatt.attrelid=child.oid and
  childatt.attnum=c.conkey[1]
 join pg_attribute parentatt on parentatt.attrelid=c.confrelid and
  parentatt.attnum=c.confkey[1]
 where c.contype='f' and c.confrelid=to_regclass('public.offers')
), discrepancies as (
 select r.child_table,r.fk_name
 from required r left join actual a on a.fk_name=r.fk_name
  and a.child_table=r.child_table and a.delete_action=r.delete_action
  and a.convalidated and not a.condeferrable and not a.condeferred
  and a.child_column='offer_id' and a.parent_column='id'
  and a.conkey=array[a.child_attnum]::smallint[]
  and a.confkey=array[a.parent_attnum]::smallint[]
 where a.fk_name is null
), quarantine as (
 select count(*) n,count(*) filter(where status='paused' and sync_enabled=false) paused
 from public.sources where connector_key='ebay'
), history as (
 select count(*) n from supabase_migrations.schema_migrations
 where version in ('20261116181000','20261116192000','20261116200000',
  '20261116203000','20261116211000','20261116214000',
  '20261116221000','20261116224000','20261116230000')
)
select check_id,case when valid then 'PASS' else 'BLOCK' end result,detail
from (
 select 1 sort,'exact_thirteen_foreign_keys' check_id,
 (select count(*)=13 from actual) valid,
 'Refuse changed or unexpected total offers.id dependencies' detail
 union all select 2,'all_thirteen_shapes_and_actions',
 (select count(*)=0 from discrepancies),
 '13 individually named validated offer_id to id FKs; four SET NULL, nine CASCADE'
 union all select 3,'ebay_quarantined',
 (select n=1 and paused=1 from quarantine),
 'Require eBay source paused with sync off'
 union all select 4,'nine_pending_versions',
 (select n=0 from history),
 'Nine later eBay privacy migration versions must be unapplied'
 union all select 5,'production_install_authorised',
 false,'Human approval and faithful offline schema-only restore required'
) checks order by sort;
