-- AVUQO eBay foundation exact release gate 2026-11-17
-- SELECT only, no private rows, no DDL/DML, secrets, external calls or migrations.
-- PASS means an enumerated scoped invariant matches, NOT a provider GO decision.
with expected(table_name,column_name,typ,not_null,identity_flag,default_expr) as (
 values
 ('ebay_account_item_links','id','bigint',true,'a',''),
 ('ebay_account_item_links','identity_kind','text',true,'',''),
 ('ebay_account_item_links','identity_digest','text',true,'',''),
 ('ebay_account_item_links','offer_id','uuid',false,'',''),
 ('ebay_account_item_links','ingestion_item_id','uuid',false,'',''),
 ('ebay_account_item_links','linked_at','timestamp with time zone',true,'','now()'),
 ('ebay_deletion_receipts','id','bigint',true,'a',''),
 ('ebay_deletion_receipts','notification_digest','text',true,'',''),
 ('ebay_deletion_receipts','user_id_digest','text',false,'',''),
 ('ebay_deletion_receipts','username_digest','text',false,'',''),
 ('ebay_deletion_receipts','eias_token_digest','text',false,'',''),
 ('ebay_deletion_receipts','state','text',true,'','''pending_privacy_review''::text'),
 ('ebay_deletion_receipts','first_received_at','timestamp with time zone',true,'','now()'),
 ('ebay_deletion_receipts','completed_at','timestamp with time zone',false,'',''),
 ('ebay_partial_erasure_audit','id','bigint',true,'a',''),
 ('ebay_partial_erasure_audit','receipt_id','bigint',true,'',''),
 ('ebay_partial_erasure_audit','attempted_at','timestamp with time zone',true,'','now()'),
 ('ebay_partial_erasure_audit','offers_erased','bigint',true,'',''),
 ('ebay_partial_erasure_audit','ingestion_items_erased','bigint',true,'',''),
 ('ebay_partial_erasure_audit','price_records_erased','bigint',true,'',''),
 ('ebay_partial_erasure_audit','matches_erased','bigint',true,'',''),
 ('ebay_partial_erasure_audit','result','text',true,'','''partial_rows_purged''::text')
), observed as (
 select c.relname::text table_name,a.attname::text column_name,
   format_type(a.atttypid,a.atttypmod)::text typ,
   a.attnotnull not_null,a.attidentity::text identity_flag,
   coalesce(pg_get_expr(d.adbin,d.adrelid),'')::text default_expr
 from pg_class c
 join pg_attribute a on a.attrelid=c.oid and a.attnum>0 and not a.attisdropped
 left join pg_attrdef d on d.adrelid=c.oid and d.adnum=a.attnum
 where c.oid in (to_regclass('public.ebay_account_item_links'),
    to_regclass('public.ebay_deletion_receipts'),
    to_regclass('public.ebay_partial_erasure_audit'))
), cols as (
 select (select count(*) from expected)=22
 and (select count(*) from observed)=22
 and not exists (
   select * from expected except select * from observed
 ) and not exists (
   select * from observed except select * from expected
 ) ok
), privs as (
 select bool_and(
  c.relrowsecurity
  and pg_get_userbyid(c.relowner)='postgres'
  and not has_table_privilege('anon',c.oid,'SELECT')
  and not has_table_privilege('authenticated',c.oid,'SELECT')
  and not has_table_privilege('service_role',c.oid,'UPDATE')
  and not has_table_privilege('service_role',c.oid,'DELETE')
  and (c.relname='ebay_partial_erasure_audit'
       or (has_table_privilege('service_role',c.oid,'SELECT')
        and has_table_privilege('service_role',c.oid,'INSERT')))
  and (c.relname<>'ebay_partial_erasure_audit'
       or (not has_table_privilege('service_role',c.oid,'SELECT')
        and not has_table_privilege('service_role',c.oid,'INSERT')))
 ) ok,count(*) n
 from pg_class c where c.oid in (
  to_regclass('public.ebay_account_item_links'),
  to_regclass('public.ebay_deletion_receipts'),
  to_regclass('public.ebay_partial_erasure_audit'))
), seqs as (
 select count(*) n,bool_and(
   s.relname=c.relname||'_id_seq'
   and not has_sequence_privilege('anon',s.oid,'USAGE')
   and not has_sequence_privilege('authenticated',s.oid,'USAGE')
   and (has_sequence_privilege('service_role',s.oid,'USAGE')=(c.relname<>'ebay_partial_erasure_audit'))
 ) ok
 from pg_class c join pg_attribute a on a.attrelid=c.oid and a.attidentity<>''
 join pg_depend d on d.refobjid=c.oid and d.refobjsubid=a.attnum and d.deptype='i'
 join pg_class s on s.oid=d.objid
 where c.oid in (to_regclass('public.ebay_account_item_links'),
 to_regclass('public.ebay_deletion_receipts'),to_regclass('public.ebay_partial_erasure_audit'))
), policy_counts as (
 select count(*) n from pg_policies
 where schemaname='public' and tablename in
 ('ebay_account_item_links','ebay_deletion_receipts','ebay_partial_erasure_audit')
), required_fk as (
 select count(*) filter(where c.convalidated
   and c.confdeltype=case when c.conname='ebay_partial_erasure_audit_receipt_id_fkey' then 'r' else 'c' end) n
 from pg_constraint c where c.contype='f'
 and c.conname in ('ebay_account_item_links_offer_id_fkey',
 'ebay_account_item_links_ingestion_item_id_fkey',
 'ebay_partial_erasure_audit_receipt_id_fkey')
), pending as (
 select count(*) n from supabase_migrations.schema_migrations
 where version in ('20261116181000','20261116192000','20261116200000',
 '20261116203000','20261116211000','20261116214000',
 '20261116221000','20261116224000','20261116230000')
)
select gate, case when ok then 'PASS' else 'BLOCK' end result from (
 select 1 sort,'exact_22_foundation_columns' gate,(select ok from cols) ok
 union all select 2,'private_table_effective_privileges',(select n=3 and ok from privs)
 union all select 3,'three_owned_identity_sequences',(select n=3 and ok from seqs)
 union all select 4,'zero_public_rls_policies',(select n=0 from policy_counts)
 union all select 5,'three_expected_fk_delete_rules',(select n=3 from required_fk)
 union all select 6,'nine_unapplied_history',(select n=0 from pending)
 union all select 7,'production_migration_authorised',false
) gate_checks order by sort;
