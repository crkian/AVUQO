-- READ ONLY: eBay four-foundation structural compatibility inventory
-- A PASS is a scoped structural check, never authority to install a migration.
-- No private account/receipt rows queried. No DDL, DML, calls, or secrets.
with functions as (
 select p.proname, p.prosecdef, p.provolatile, p.proconfig, p.oid
 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname='public' and p.proname in
 ('ebay_validate_account_item_link','ebay_purge_mapped_account_rows',
 'ebay_protect_pending_deletion_receipt','ebay_run_audited_partial_erasure',
 'ebay_is_account_digest_suppressed','ebay_lock_deletion_receipt_accounts',
 'ebay_reject_tombstoned_account_item_link')
), required_functions as (
 select count(*) n, count(*) filter(where
   (proname in ('ebay_purge_mapped_account_rows','ebay_run_audited_partial_erasure',
                'ebay_reject_tombstoned_account_item_link'))=prosecdef
   and proconfig @> array['search_path=""']::text[]
 ) safe
 from functions
), required_triggers as (
 select count(distinct v.name) filter(where t.oid is not null and t.tgenabled='O'
   and t.tgfoid=to_regprocedure('public.'||v.fn||'()')) matched
 from (values
 ('ebay_account_item_link_source_gate','ebay_account_item_links','ebay_validate_account_item_link'),
 ('ebay_account_item_00_tombstone_gate','ebay_account_item_links','ebay_reject_tombstoned_account_item_link'),
 ('ebay_deletion_receipt_account_lock','ebay_deletion_receipts','ebay_lock_deletion_receipt_accounts'),
 ('ebay_deletion_receipt_insert_lock','ebay_deletion_receipts','ebay_protect_pending_deletion_receipt'),
 ('ebay_deletion_receipt_update_lock','ebay_deletion_receipts','ebay_protect_pending_deletion_receipt'),
 ('ebay_deletion_receipt_delete_lock','ebay_deletion_receipts','ebay_protect_pending_deletion_receipt'),
 ('ebay_deletion_receipt_truncate_lock','ebay_deletion_receipts','ebay_protect_pending_deletion_receipt')
 ) v(name,rel,fn)
 left join pg_trigger t on t.tgname=v.name
   and t.tgrelid=to_regclass('public.'||v.rel) and not t.tgisinternal
), indexes as (
 select count(distinct v.name) filter(where i.indexrelid is not null and i.indisvalid
   and i.indisready) matched
 from (values
 ('ebay_links_offer_identity_key'),('ebay_links_item_identity_key'),
 ('ebay_links_offer_lookup'),('ebay_links_item_lookup'),
 ('ebay_partial_erasure_audit_receipt_idx'),
 ('ebay_deletion_receipts_user_digest_idx'),
 ('ebay_deletion_receipts_username_digest_idx'),
 ('ebay_deletion_receipts_eias_digest_idx')
 ) v(name)
 left join pg_class ic on ic.relname=v.name and ic.relnamespace='public'::regnamespace
 left join pg_index i on i.indexrelid=ic.oid
), relations as (
 select count(*) filter(where c.relrowsecurity) rls_enabled
 from (values ('ebay_account_item_links'),('ebay_deletion_receipts'),
 ('ebay_partial_erasure_audit')) v(name)
 left join pg_class c on c.oid=to_regclass('public.'||v.name)
), privs as (
 select count(*) filter(where not has_function_privilege('anon',oid,'EXECUTE')
   and not has_function_privilege('authenticated',oid,'EXECUTE')
   and not has_function_privilege('service_role',oid,'EXECUTE')) locked
 from functions where proname in ('ebay_purge_mapped_account_rows',
 'ebay_run_audited_partial_erasure','ebay_reject_tombstoned_account_item_link')
), version_history as (
 select count(*) count_found
 from supabase_migrations.schema_migrations
 where (version,name) in (
 ('20261116131949','ebay_account_scoped_erasure_foundation_20261116'),
 ('20261116140013','ebay_deletion_receipt_integrity_lock_20261116'),
 ('20261116141927','ebay_audited_partial_erasure_20261116'),
 ('20261116160011','ebay_atomic_tombstone_admission_20261116'))
), later as (
 select count(*) count_found from supabase_migrations.schema_migrations
 where version in ('20261116181000','20261116192000','20261116200000',
 '20261116203000','20261116211000','20261116214000',
 '20261116221000','20261116224000','20261116230000')
)
select check_id,case when ok then 'PASS' else 'BLOCK' end status,meaning from (
 select 1 sort,'seven_foundation_functions' check_id,
  (select n=7 and safe=7 from required_functions) ok,
  'seven functions with reviewed invoker/definer and empty search path' meaning
 union all select 2,'seven_foundation_triggers',
  (select matched=7 from required_triggers),
  'seven enabled named trigger bindings'
 union all select 3,'eight_foundation_indexes',
  (select matched=8 from indexes),
  'eight required non-primary indexes valid and ready'
 union all select 4,'three_private_rls_relations',
  (select rls_enabled=3 from relations),
  'foundation relations RLS enabled'
 union all select 5,'three_privileged_erasure_rpcs',
  (select locked=3 from privs),
  'privileged routines not executable by anon/authenticated/service_role'
 union all select 6,'historic_foundation_versions',
  (select count_found=4 from version_history),
  'four historical foundation migration records exist with exact names'
 union all select 7,'nine_pending_versions_not_installed',
  (select count_found=0 from later),
  'nine later candidate versions absent'
 union all select 8,'manual_sql_object_equivalence',
  false,'separate exact body, constraints, defaults, FK shapes, column/sequence ownership and grants comparison required'
 union all select 9,'production_migration_authorised',
  false,'never inferred from schema or synthetic tests'
) checks order by sort;
