-- AVUQO eBay privacy release gating: read-only structural controls.
-- 17 November 2026. Run against PRODUCTION only as an inspection, NEVER as an installer.
-- No receipt or seller rows, credentials, objects, or event payloads are retrieved.
-- The last gates must stay BLOCK until separately evidenced lawful data handling,
-- external processor/backup coverage and signed callback acceptance.
with candidate(version, foundation_name) as (
  values
   ('20261116132000','ebay_account_scoped_erasure_foundation_20261116'),
   ('20261116153000','ebay_deletion_receipt_integrity_lock_20261116'),
   ('20261116155500','ebay_audited_partial_erasure_20261116'),
   ('20261116165000','ebay_atomic_tombstone_admission_20261116')
), versions as (
  select count(*) filter(where x.version is not null) matched_foundations,
    count(*) filter(where exact.version is not null) conflicting_candidate_versions
  from candidate c
  left join supabase_migrations.schema_migrations x on x.name=c.foundation_name
  left join supabase_migrations.schema_migrations exact on exact.version=c.version
), later(version) as (
  values ('20261116181000'),('20261116192000'),('20261116200000'),
  ('20261116203000'),('20261116211000'),('20261116214000'),
  ('20261116221000'),('20261116224000'),('20261116230000')
), later_versions as (
  select count(*) filter(where m.version is not null) as applied_later
  from later l left join supabase_migrations.schema_migrations m on m.version=l.version
), fk_inventory as (
  select count(*) as total_fks,
   count(*) filter(where c.confdeltype='c' and c.convalidated
    and c.conrelid in (
      to_regclass('public.availability'),to_regclass('public.awin_offer_release_reviews'),
      to_regclass('public.awin_release_audit'),to_regclass('public.click_events'),
      to_regclass('public.deal_scores'),to_regclass('public.promotion_candidates'),
      to_regclass('public.published_deals'))) as audited_cascades
  from pg_constraint c
  where c.contype='f' and c.confrelid=to_regclass('public.offers')
), source_state as (
  select count(*) filter(where status='paused' and sync_enabled=false) paused
  from public.sources where connector_key='ebay'
), trigger_state as (
  select count(*) filter(where tgname='ebay_offer_02_unreviewed_cascade_gate'
   and tgenabled='O') as cascade_guard,
   count(*) filter(where tgname='ebay_offer_01_secondary_orphan_gate'
   and tgenabled='O') as orphan_guard
  from pg_trigger where tgrelid=to_regclass('public.offers') and not tgisinternal
), queue_state as (
  select to_regclass('public.ebay_erasure_work_items') is not null as journal_present
), rpc_privileges as (
  select count(*) filter(where p.proname in ('ebay_purge_mapped_account_rows','ebay_run_audited_partial_erasure')) as existing_baseline_functions, coalesce(bool_or(
     has_function_privilege('anon',p.oid,'EXECUTE') or
     has_function_privilege('authenticated',p.oid,'EXECUTE') or
     has_function_privilege('service_role',p.oid,'EXECUTE')
  ),false) as exposed
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname in
  ('ebay_purge_mapped_account_rows','ebay_run_audited_partial_erasure',
   'ebay_claim_erasure_work','ebay_record_erasure_work_outcome',
   'ebay_execute_leased_mapped_catalogue','ebay_run_bounded_mapped_purge')
)
select gate_id,case when passed then 'PASS' else 'BLOCK' end as outcome,reason
from (
 select 1 sort,'foundation_history_recorded' gate_id,
   (select matched_foundations=4 and conflicting_candidate_versions=0 from versions) passed,
   'Four historical foundations recorded; separately compare exact installed definitions' reason
 union all select 2,'nine_migration_history',
   (select applied_later=9 from later_versions),
   'All nine versioned candidates must be individually installed and verified; no blind replay'
 union all select 3,'ebay_paused',
   (select paused=1 from source_state),
   'eBay remains disabled during all database compatibility work'
 union all select 4,'all_thirteen_offer_fks',
   (select total_fks=13 and audited_cascades=7 from fk_inventory),
   'All thirteen offer FK dependencies and seven additional cascades must match'
 union all select 5,'evidence_queue_installed',
   (select journal_present from queue_state),
   'Private seven-surface work journal must exist with RLS and least privilege'
 union all select 6,'independent_cascade_guard',
   (select cascade_guard=1 from trigger_state),
   'Fail closed on unreviewed event, Awin and publication dependents'
 union all select 7,'private_erasure_functions',
   (select existing_baseline_functions=2 and not exposed from rpc_privileges),
   'DBA-only erasure must not be directly executable by app roles'
 union all select 8,'storage_log_backup_account_scope',
   false,'External verified per-account storage/log/CDN/backup inventory and handling required'
 union all select 9,'lawful_retention_and_processor_evidence',
   false,'Lawful retention and external processor disposition require human evidence'
 union all select 10,'provider_signed_notification_acceptance',
   false,'Production-ready signature verification, durable receipts, callbacks and retry tests required'
 union all select 11,'provider_activation_authorised',
   false,'Hard block: SQL alone cannot authorise eBay portal registration or successful POST acknowledgement'
) gates order by sort;
