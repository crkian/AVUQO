# AVUQO eBay: four-foundation production reconciliation checkpoint

**17 November 2026. READ-ONLY evidence; NO-GO for production migration application.**

## Scope and source authority

Live Supabase project `tfoukwcruaamrtgxzshh` queried using read-only catalog and migration-history SQL. Repository source is the 13-file chronological manifest `tests/fixtures/ebay-migration-replay-manifest.txt` at the PR #266 baseline. This record supplements, not replaces, the 16 November comprehensive runbook. **No production DDL, DML, application activation, subscriptions, credentials, network spend or deletion operations.**

## Migration-history check

Four earlier eBay foundations already appear in live migration history using *different* versions than the repository candidate migration files:

| Candidate timestamp | Installed production timestamp | Migration name | Decision |
|---|---|---|---|
| 20261116132000 | 20261116131949 | ebay_account_scoped_erasure_foundation_20261116 | Hold: do not replay |
| 20261116153000 | 20261116140013 | ebay_deletion_receipt_integrity_lock_20261116 | Hold: do not replay |
| 20261116155500 | 20261116141927 | ebay_audited_partial_erasure_20261116 | Hold: do not replay |
| 20261116165000 | 20261116160011 | ebay_atomic_tombstone_admission_20261116 | Hold: do not replay |

Nine candidate versions `20261116181000`, `20261116192000`, `20261116200000`, `20261116203000`, `20261116211000`, `20261116214000`, `20261116221000`, `20261116224000`, `20261116230000` remain absent from live migration history. This does not itself establish their complete absence from the schema.

## Production structure observed

The seven primary eBay function signatures found in the four candidate files are present on production: `ebay_validate_account_item_link`, `ebay_purge_mapped_account_rows`, `ebay_protect_pending_deletion_receipt`, `ebay_run_audited_partial_erasure`, `ebay_is_account_digest_suppressed`, `ebay_lock_deletion_receipt_accounts`, `ebay_reject_tombstoned_account_item_link`. Read-only `pg_get_functiondef` inspection showed the corresponding PL/pgSQL bodies aligned on inspection; **this is not yet a byte- or AST-normalised equivalence certificate**. Each has an empty search_path in the inspected definitions. Explicit `pg_proc.proacl` for the seven exposed no application-role EXECUTE grants in that inspection; note PUBLIC defaults and effective privilege checks must be verified independently.

Live eBay triggers queried by name/function were present and enabled, including the two account-item link gates, the four receipt lock triggers, and the receipt advisory lock gate. Existing tables `ebay_account_item_links`, `ebay_partial_erasure_audit`, `ebay_deletion_receipts` all have RLS enabled. These checks alone are **not** an exhaustive match of every column, index, constraint, trigger definition, sequence grant, policy or object owner.

## Mandatory work before any installation proposal is approved

1. Run a **machine-comparable** per-object reconciliation for the four foundations: SQL function bodies/attributes, trigger definitions/order/enablement, table columns/defaults/check constraints/FKs, indexes, RLS/policies, object and sequence grants, owner and comments. Record exact differences or an evidenced match. Avoid exposing seller or shopper rows.
2. Use the nine-only list, not the full thirteen-file synthetic replay, to prepare a dependency-ordered **additive** production migration candidate with the four foundations skipped or explicitly guarded by validated preconditions.
3. Review production backup/restore, expected locks, transaction boundaries, service roles, independent Awin isolation, rollback and maintenance authorisation. All changes stay in a review branch until separately approved.
4. Re-run the production-compatible read-only release and cascade preflights. Keep all legal/retention, stored media, provider notification and genuine 2xx-acknowledgement gates blocked pending independent evidence.

## Release controls

**NO-GO**: Do not apply the original 13 candidate SQL files to production, overwrite existing foundations, enable the eBay connector, issue an affirmative deletion acknowledgement, or alter Awin. eBay remains paused, sync off, ingestion quarantined and webhook intentionally HTTP 503/unregistered at last verified checkpoint. This document only records a further read-only reconciliation step.
