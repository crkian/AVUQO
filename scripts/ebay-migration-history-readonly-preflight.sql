-- READ-ONLY eBay migration-history reconciliation. No DDL/DML or private rows.
-- Historical production eBay foundations used different *version* timestamps
-- than corresponding versioned repository candidate files.
-- Never apply full candidate bundle when prior equivalent names are installed.
with candidates(candidate_version, existing_name) as (values
 ('20261116132000'::text,'ebay_account_scoped_erasure_foundation_20261116'::text),
 ('20261116153000'::text,'ebay_deletion_receipt_integrity_lock_20261116'::text),
 ('20261116155500'::text,'ebay_audited_partial_erasure_20261116'::text),
 ('20261116165000'::text,'ebay_atomic_tombstone_admission_20261116'::text),
 ('20261116181000'::text,null::text),
 ('20261116192000'::text,null::text),
 ('20261116200000'::text,null::text),
 ('20261116203000'::text,null::text),
 ('20261116211000'::text,null::text),
 ('20261116214000'::text,null::text),
 ('20261116221000'::text,null::text),
 ('20261116224000'::text,null::text),
 ('20261116230000'::text,null::text)
), observed as (
 select c.candidate_version,c.existing_name,
  existing.version::text as already_applied_version,
  exact.version::text as candidate_applied_version
 from candidates c
 left join supabase_migrations.schema_migrations existing
  on existing.name=c.existing_name
 left join supabase_migrations.schema_migrations exact
  on exact.version=c.candidate_version
)
select candidate_version,
 case
  when candidate_applied_version is not null and
   already_applied_version is not null and
   already_applied_version<>candidate_version then 'VERSION_COLLISION_REVIEW'
  when candidate_applied_version is not null then 'ALREADY_RECORDED_REVIEW'
  when already_applied_version is not null then 'EXISTING_EQUIVALENT_REVIEW'
  when existing_name is not null then 'EXPECTED_EQUIVALENT_MISSING_BLOCK'
  else 'NEW_CANDIDATE_UNAPPLIED'
 end as migration_status,
 coalesce(already_applied_version,candidate_applied_version,'') as production_history_version
from observed order by candidate_version;
