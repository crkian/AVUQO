# eBay production four-foundation reconciliation evidence | 17 November 2026

**Scope: production read-only catalog introspection only. No private receipt rows, deletion, source activation, credentials, DDL or payment.**
**Starting point:** GitHub `main` `0040b34910106e9304a3fe8830334d929b72d049` (merged #272), whose predecessor PR #271 added a Docker-free nine-only replay. Both production source rows for Awin/eBay remained paused and sync disabled at that checkpoint.

## Direct repository-to-production comparison

Fetched exactly four candidate repository SQL files:
- `20261116132000_ebay_account_scoped_erasure_foundation.sql`
- `20261116153000_ebay_deletion_receipt_integrity_lock.sql`
- `20261116155500_ebay_audited_partial_erasure.sql`
- `20261116165000_ebay_atomic_tombstone_admission.sql`

Queried actual `pg_get_functiondef` on production and compared each PL/pgSQL function's `AS $$...$$` body to the candidate SQL source by matching the function name, normalising CRLF and trimming surrounding whitespace, not by trusting migration names. **All seven function bodies matched exactly under that comparison**:

| Function | Body comparison |
| --- | --- |
| ebay_validate_account_item_link | MATCH |
| ebay_purge_mapped_account_rows | MATCH |
| ebay_protect_pending_deletion_receipt | MATCH |
| ebay_run_audited_partial_erasure | MATCH |
| ebay_is_account_digest_suppressed | MATCH |
| ebay_lock_deletion_receipt_accounts | MATCH |
| ebay_reject_tombstoned_account_item_link | MATCH |

The catalog also showed the intended SECURITY DEFINER/INVOKER classifications and an empty search_path for each; explicit ACL is not proof of effective privilege, so this PR uses `has_function_privilege` for the sensitive routines. No raw account identifiers or row contents were read.

## Checked production structures

A separate read-only `pg_catalog` inventory showed:
- Seven relevant named eBay triggers enabled on receipt/link relations, with expected function bindings.
- Eight manually defined relevant foundation indexes valid and ready, plus the primary key indexes.
- All three private relations `ebay_deletion_receipts`, `ebay_account_item_links`, `ebay_partial_erasure_audit` have RLS enabled.
- Twenty-two named constraints were inventoried on those three tables, including exact one-target link check, validated FK cascade/restrict relationships and immutable receipt identity checks enforced in trigger code.
- Found zero policies on these three private relations.
- Inspected 14 column declarations on the two foundation-created relations: identity `bigint GENERATED ALWAYS` keys, default `now()` timestamps, non-null count fields and fixed audit result. They align with the broad candidate shape on manual inspection, **not a machine-complete SQL AST equivalence certificate**.
- Foundation migration history has the four correct names with production-specific timestamps; none of the nine later candidate versions is recorded.

## Reproducible SQL gate

`scripts/ebay-four-foundation-exact-readonly-preflight.sql` was run against live Supabase with **7 PASS / 2 BLOCK**:
1. seven foundational functions and correct security classifications PASS
2. seven named enabled trigger bindings PASS
3. eight named valid/ready indexes PASS
4. RLS enabled on three private tables PASS
5. three sensitive erasure routines not executable by anon, authenticated or service_role PASS
6. four correct historical migration-name/version pairs PASS
7. nine later candidate versions not yet recorded PASS
8. whole-object source equivalence (constraints/defaults/sequence ownership/grants) **BLOCK pending automated attestation**
9. production migration authorisation **BLOCK deliberately**

The stand-alone comparison of seven function bodies is directly observed but not yet a committed CI-friendly expected-body hash ledger. Future work should implement reproducible normalised source and production function hash comparison without exposing any data.

## Why production remains NO-GO

A live schema is not a faithful copy of the disposable synthetic CI fixture. Nine candidate migrations may produce locks, privilege changes, default/owner issues, or new conflicts against unmodelled production objects. Additional eBay account deletion duties include exact account scope across shopper and retailer analytics, media/CDN/logs/backups, legal retention, external processors and a durable signed provider notification queue. **No eBay POST 2xx or portal registration** until the entire acknowledgement and erasure handling is correct.

## Next executable work

1. Make a fully reproducible normalised source/prod object attestation including constraints/defaults/sequence ACLs and the seven body hashes, not merely named object presence.
2. Build a faithful isolated PostgreSQL production-schema rehearsal without copying private customer data. Prove nine-only compatibility, reversible transactions, locks and unexpected FK drift, then review backups/rollback.
3. Obtain separate approval for any production DDL and verify post-install state on actual production. Only thereafter work toward signed provider notification acceptance and authorised Browse/EPN product imports.
4. The master handover and full source tracker must be updated after every PR and post-merge release.

**No changes made to production database. No Docker, no spend, no activation; eBay remains paused/HTTP 503 and Awin untouched.**
