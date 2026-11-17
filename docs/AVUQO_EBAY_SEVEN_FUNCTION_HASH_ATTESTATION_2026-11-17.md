# eBay seven-function production hash attestation | 17 November 2026

**Verified result: 7/7 exact body-hash matches (read-only live production SQL). Production DDL/activation still NO-GO.**

## Why it matters

The four pre-existing eBay foundation migrations are installed under history versions different from their 13-file candidate equivalents. PR #271's isolated nine-only migration rehearsal passed. PR #273 established seven installed body matches on direct inspection and seven structural PASS/two manual BLOCK gates. This release makes the seven body checks **reproducible** and fails closed on drift.

## Source and production comparison

The expected body fingerprints are generated from the exact four checked-in versioned SQL files by extracting `CREATE FUNCTION public.<name> ... AS $$<body>$$` and applying CRLF-normalisation and `.trim()` in Node. The live PostgreSQL side uses `md5(btrim(pg_proc.prosrc, E' \\t\\r\\n'))`; both trim leading/trailing whitespace only. Only routine source definitions, not account records or identifiers, are read.

| Function | Expected and observed MD5 | Result |
| --- | --- | --- |
| ebay_is_account_digest_suppressed | `41e3d2f6633faa4e88bb94fb2a0e0610` | MATCH |
| ebay_lock_deletion_receipt_accounts | `9a11b1711bc943752bd3385debc7b0dd` | MATCH |
| ebay_protect_pending_deletion_receipt | `8687da9d39a127cc3ab0e2c74039bd40` | MATCH |
| ebay_purge_mapped_account_rows | `f35f791b832ee34c18cc132033d8467c` | MATCH |
| ebay_reject_tombstoned_account_item_link | `678edf574dc8fa14dca6c09f4f875e55` | MATCH |
| ebay_run_audited_partial_erasure | `a0e1dc0ad223fd3f575808a97eb7baee` | MATCH |
| ebay_validate_account_item_link | `ca4c8707e798593ab1d7a6e08b27e604` | MATCH |

**Evidenced changes:** `scripts/ebay-seven-foundation-body-hash-readonly.sql`, `tests/ebay-seven-foundation-body-hash.test.mjs`, and a GitHub quality workflow step. Read-only query executed against production on 17 November, all seven MATCH and `production_installation_authorised=BLOCK`. GitHub CI status is separately tracked by the PR.

**Precisely NOT proven:** whole-function configuration/owner/default privileges beyond PR #273's scoped checks, all table-column/default/check/index/sequence/owner/policy equivalence, compatibility of the nine SQL migrations against an actual production-derived schema, backup restoration and rollback, or eBay privacy/provider release approval. Even these seven hashes cannot authorise production migration by themselves.

**Next exact gate:** machine-generated whole-object schema attestation and faithful isolated production-schema replay. Follow with independent reviewed additive-only production migration installation, seven-surface GDPR/provider privacy handling, durable signed callback acknowledgement and approved Browse/EPN products. eBay paused, HTTP 503; Awin untouched. No production writes/DDL, Docker or additional spending.
