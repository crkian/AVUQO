-- AVUQO eBay four-foundation function-body attestation, 17 Nov 2026.
-- READ-ONLY. Source hashes are computed from exact versioned repository SQL
-- body AS $$...$$, trimmed at edges (same as btrim(prosrc, E' \t\r\n')).
-- A match is *not* equivalent to object/role/constraint certification or
-- authorisation to run any production migration or acknowledge eBay POST.
with expected(name,repo_body_md5) as (
 values
 ('ebay_is_account_digest_suppressed'::text,'41e3d2f6633faa4e88bb94fb2a0e0610'::text),
 ('ebay_lock_deletion_receipt_accounts'::text,'9a11b1711bc943752bd3385debc7b0dd'::text),
 ('ebay_protect_pending_deletion_receipt'::text,'8687da9d39a127cc3ab0e2c74039bd40'::text),
 ('ebay_purge_mapped_account_rows'::text,'f35f791b832ee34c18cc132033d8467c'::text),
 ('ebay_reject_tombstoned_account_item_link'::text,'678edf574dc8fa14dca6c09f4f875e55'::text),
 ('ebay_run_audited_partial_erasure'::text,'a0e1dc0ad223fd3f575808a97eb7baee'::text),
 ('ebay_validate_account_item_link'::text,'ca4c8707e798593ab1d7a6e08b27e604'::text)
), observed as (
 select e.name,e.repo_body_md5,md5(btrim(p.prosrc,E' \t\r\n')) installed_body_md5,
        p.oid is not null as installed
 from expected e left join pg_proc p on p.proname=e.name
    and p.pronamespace='public'::regnamespace
)
select name,
 case when installed and installed_body_md5=repo_body_md5
      then 'MATCH' else 'BLOCK' end as body_attestation,
 repo_body_md5 as committed_expected_md5,
 coalesce(installed_body_md5,'') as current_production_md5
from observed
union all
select 'production_installation_authorised'::text,'BLOCK'::text,''::text,''::text
order by name;