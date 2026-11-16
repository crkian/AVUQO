-- Read-only eBay deletion release-gate preflight.
-- Run as an authorised DBA in Supabase SQL editor or psql.
-- Aggregate counts only. No account digests, raw user data or writes.
-- IMPORTANT: passing these DB checks NEVER certifies complete erasure,
-- backup/processor compliance, signed notifications, or eBay API approval.
with source_status as (
 select count(*) as source_rows,
        count(*) filter (where status = 'paused' and sync_enabled = false) as paused_rows
 from public.sources where connector_key = 'ebay'
), guard_status as (
 select count(*) filter (where tgname in (
  'ebay_deletion_receipt_account_lock',
  'ebay_account_item_00_tombstone_gate'
 ) and tgenabled = 'O') as enabled_count
 from pg_catalog.pg_trigger where not tgisinternal
), receipt_status as (
 select count(*) as total,
        count(*) filter (where state <> 'completed') as not_completed,
        count(*) filter (where state = 'completed') as completed
 from public.ebay_deletion_receipts
), account_links as (
 select count(*) as total from public.ebay_account_item_links
), source_rows as (
 select
  (select count(*) from public.offers o join public.sources s on s.id=o.source_id
   where s.connector_key='ebay') as offers,
  (select count(*) from public.source_ingestion_items i join public.sources s on s.id=i.source_id
   where s.connector_key='ebay') as ingestion_items,
  (select count(*) from public.product_matches m join public.sources s on s.id=m.source_id
   where s.connector_key='ebay') as product_matches,
  (select count(*) from public.price_history h join public.sources s on s.id=h.source_id
   where s.connector_key='ebay') as price_history
), audit_status as (
 select count(*) as partial_audit_rows from public.ebay_partial_erasure_audit
), permissions as (
 select
  not (has_function_privilege('anon','public.ebay_run_audited_partial_erasure(text)','EXECUTE')
    or has_function_privilege('authenticated','public.ebay_run_audited_partial_erasure(text)','EXECUTE')
    or has_function_privilege('service_role','public.ebay_run_audited_partial_erasure(text)','EXECUTE'))
  as private_partial_purge,
  not (has_function_privilege('anon','public.ebay_purge_mapped_account_rows(text)','EXECUTE')
    or has_function_privilege('authenticated','public.ebay_purge_mapped_account_rows(text)','EXECUTE')
    or has_function_privilege('service_role','public.ebay_purge_mapped_account_rows(text)','EXECUTE'))
  as private_mapped_purge
)
select
 s.source_rows=1 and s.paused_rows=1 as ebay_source_paused,
 g.enabled_count=2 as both_admission_guards_enabled,
 p.private_partial_purge and p.private_mapped_purge as purge_rpc_private,
 r.total as receipt_count,
 r.not_completed as not_completed_receipts,
 r.completed as completed_receipts,
 l.total as account_link_count,
 x.offers as ebay_offers,
 x.ingestion_items as ebay_ingestion_items,
 x.product_matches as ebay_product_matches,
 x.price_history as ebay_price_history,
 a.partial_audit_rows,
 false as two_session_race_proven_by_this_query,
 false as cross_store_erasure_proven_by_this_query,
 false as backup_retention_proven_by_this_query,
 false as signed_provider_event_proven_by_this_query,
 false as ebay_activation_authorised_by_this_query
from source_status s
cross join guard_status g
cross join receipt_status r
cross join account_links l
cross join source_rows x
cross join audit_status a
cross join permissions p;
