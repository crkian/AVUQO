-- AVUQO eBay: strictly read-only production structural preflight.
-- SAFE to execute by an authorised DBA on production. NO DDL/DML, RPC,
-- mutation, customer rows, account IDs, tokens or provider API.
-- PASS here means only one structural prerequisite is present; final
-- provider_release_authorised ALWAYS BLOCK until independently certified.
with
fk_contract as (
 select count(distinct c.conrelid)::integer as valid_fks
 from pg_catalog.pg_constraint c
 join pg_catalog.pg_attribute child on child.attrelid=c.conrelid and child.attname='offer_id'
 join pg_catalog.pg_attribute parent on parent.attrelid=c.confrelid and parent.attname='id'
 where c.contype='f'
  and c.confdeltype='n' and c.convalidated
  and c.confrelid=pg_catalog.to_regclass('public.offers')
  and c.conkey=array[child.attnum]::smallint[]
  and c.confkey=array[parent.attnum]::smallint[]
  and c.conrelid in (
   pg_catalog.to_regclass('public.analytics_events'),
   pg_catalog.to_regclass('public.attribution_events'),
   pg_catalog.to_regclass('public.user_feedback'),
   pg_catalog.to_regclass('public.watch_events')
  )
),
eBay_source as (
 select count(*)::integer as source_rows,
  count(*) filter(where status='paused' and sync_enabled=false)::integer as paused_rows
 from public.sources where connector_key='ebay'
),
queue as (
 select pg_catalog.to_regclass('public.ebay_erasure_work_items') as relation_oid,
 pg_catalog.to_regclass('public.ebay_partial_erasure_audit') as audit_oid
),
required_relations as (
 select count(*) filter(where pg_catalog.to_regclass('public.'||name) is not null)::integer as present
 from (values
  ('sources'),('offers'),('source_ingestion_items'),('price_history'),
  ('product_matches'),('ebay_deletion_receipts'),('ebay_account_item_links'),
  ('analytics_events'),('attribution_events'),('user_feedback'),('watch_events')
 ) v(name)
),
protected_functions as (
 select count(*) filter(where pg_catalog.to_regprocedure(signature) is not null)::integer as present
 from (values
 ('public.ebay_run_audited_partial_erasure(text)'),
 ('public.ebay_execute_leased_mapped_catalogue_erasure(bigint,integer)'),
 ('public.ebay_run_next_mapped_catalogue_erasure()'),
 ('public.ebay_secondary_account_reference_counts(bigint)'),
 ('public.ebay_assess_leased_secondary_history(bigint,integer)'),
 ('public.ebay_preview_next_mapped_erasure()')
 ) v(signature)
),
privacy_triggers as (
 select
 count(*) filter(where t.tgname='ebay_offer_00_unreviewed_reference_gate'
  and t.tgenabled='O'
  and t.tgfoid=pg_catalog.to_regprocedure('public.ebay_guard_unreviewed_offer_references()'))::integer as orphan_guard,
 count(*) filter(where t.tgname='ebay_offer_01_integrity_drift_gate'
  and t.tgenabled='O'
  and t.tgfoid=pg_catalog.to_regprocedure('public.ebay_assert_secondary_offer_integrity()'))::integer as drift_guard
 from pg_catalog.pg_trigger t
 where t.tgrelid=pg_catalog.to_regclass('public.offers')
  and not t.tgisinternal
),
checks as (
 select 'source_quarantine'::text id,
  (select source_rows=1 and paused_rows=1 from eBay_source) ok,
  'exactly one paused eBay source with sync disabled'::text reason
 union all select 'eleven_core_relations',
  (select present=11 from required_relations),
  'eleven foundational data relations exist'
 union all select 'four_validated_secondary_fks',
  (select valid_fks=4 from fk_contract),
  'exact offer_id foreign keys use validated ON DELETE SET NULL'
 union all select 'work_journal_installed',
  (select relation_oid is not null from queue),
  'private seven-surface work journal relation exists'
 union all select 'private_partial_audit_installed',
  (select audit_oid is not null from queue),
  'count-only partial audit relation exists'
 union all select 'six_required_dba_rpcs',
  (select present=6 from protected_functions),
  'six versioned DBA partial-processing and preview functions are available'
 union all select 'secondary_orphan_guard_enabled',
  (select orphan_guard=1 from privacy_triggers),
  'original secondary-event orphan guard enabled'
 union all select 'independent_drift_guard_enabled',
  (select drift_guard=1 from privacy_triggers),
  'independent secondary FK drift interlock enabled'
 union all select 'queue_rls_enabled',
  coalesce((select c.relrowsecurity from pg_catalog.pg_class c
   where c.oid=(select relation_oid from queue)),false),
  'work queue row-level security enabled'
 union all select 'queue_private_roles',
  (select case when relation_oid is null then false else
     not pg_catalog.has_table_privilege('anon',relation_oid,'SELECT')
     and not pg_catalog.has_table_privilege('authenticated',relation_oid,'SELECT')
     and not pg_catalog.has_table_privilege('service_role',relation_oid,'SELECT')
     and not pg_catalog.has_table_privilege('service_role',relation_oid,'UPDATE')
   end from queue),
  'anon, authenticated and service_role cannot read or update private queue'
 union all select 'dba_executor_private',
  (select case when pg_catalog.to_regprocedure(
    'public.ebay_run_next_mapped_catalogue_erasure()') is null then false
    else not pg_catalog.has_function_privilege('anon',
     'public.ebay_run_next_mapped_catalogue_erasure()','EXECUTE')
     and not pg_catalog.has_function_privilege('authenticated',
     'public.ebay_run_next_mapped_catalogue_erasure()','EXECUTE')
     and not pg_catalog.has_function_privilege('service_role',
     'public.ebay_run_next_mapped_catalogue_erasure()','EXECUTE')
   end),
  'partial deletion executor has no application-role execute grants'
 union all select 'provider_release_authorised',
  false,
  'NEVER inferred from schema; signed events, retention, processors and formal release remain unproven'
)
select id as check_id,case when ok then 'PASS' else 'BLOCK' end as status,
 reason as meaning
from checks order by check_id;
