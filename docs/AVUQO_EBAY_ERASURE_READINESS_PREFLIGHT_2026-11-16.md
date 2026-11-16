# eBay deletion readiness: non-destructive database preflight

**Date:** 16 November 2026. **Status:** read-only preflight. **NOT a complete erasure solution or live eBay approval.**

## Purpose

Run `scripts/ebay-erasure-readiness-preflight.sql` as an authorised DBA to obtain aggregate evidence of the *database-visible* eBay source and deletion safeguards. The query does not fetch any raw eBay identity digests, does not edit records, and never claims to prove cross-session overlap, backups, retention, remote/processor cleanup or signed provider notifications.

The preflight checks the exact paused source and disabled sync setting, both account-tombstone guard triggers, service-role exclusion from DBA-only partial purge functions, and counts for receipts, account links, eBay-source offers/ingestion/matches/price history, and partial purge audit records. Five explicit release columns remain `false` because their evidence cannot come from this one SQL query.

Run in the approved Supabase SQL editor, or using authorised `psql` without putting a connection string in chat or logs:

```bash
psql -X -v ON_ERROR_STOP=1 -f scripts/ebay-erasure-readiness-preflight.sql
```

Do **not** infer that zero rows equals all historical account data erased: unhashed identifiers, orphan relationships, JSON content, logs, CDN, Storage history, third parties and backups need independent audited evidence. Neither static CI nor this aggregate read-only query is the two-session race proof.

## Existing deletion boundary

`public.ebay_purge_mapped_account_rows(text)` is DBA-only and removes exact account-linked source-scoped database rows; `public.ebay_run_audited_partial_erasure(text)` wraps it in a private count-only audit and checks for remaining account links. It **does not** guarantee account-wide removal from every database and processor surface, and it cannot complete a receipt.

## Open gates

- An authorised independent-two-client `psql` test of the receipt-first transaction path (still unexecuted).
- Real link-first and multi-identity committed transaction races on a controlled clone. The reverse witness from PR #247 is a key-level probe, not that end-to-end test.
- Full idempotent cross-store erasure with durable retry, failure handling, retention/backup evidence and signed provider integration.
- Approved eBay production credentials and Buy/Browse rights, and real signed notification tests.

**Operational NO-GO:** Keep eBay source paused and DB quarantine enabled; deletion webhook must remain unregistered and HTTP 503. Preserve Awin private integrations.
