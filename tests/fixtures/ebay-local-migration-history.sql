-- Create only synthetic metadata to exercise the exact read-only report.
-- This lives in the disposable second PostgreSQL database, never production.
create schema supabase_migrations;
create table supabase_migrations.schema_migrations (
 version text primary key,
 name text
);
insert into supabase_migrations.schema_migrations(version,name) values
 ('20261116131949','ebay_account_scoped_erasure_foundation_20261116'),
 ('20261116140013','ebay_deletion_receipt_integrity_lock_20261116'),
 ('20261116141927','ebay_audited_partial_erasure_20261116'),
 ('20261116160011','ebay_atomic_tombstone_admission_20261116');
