# eBay erasure work journal: candidate staged foundation

**Date:** 16 November 2026. **Classification:** implementation candidate. **Not eBay deletion compliance.**

## What is implemented in this candidate
A versioned migration `20261116181000_ebay_erasure_work_journal.sql` defines a DBA-only, RLS-protected, durable work-item table and creates seven work items for each new deletion receipt, with idempotent `(receipt_id,surface)` uniqueness. Existing unresolved receipts receive the same items in a safe backfill. No personal identifier or payload is stored in the journal. A DBA-only `ebay_claim_erasure_work` uses `FOR UPDATE SKIP LOCKED`, bounded leases and monotonically increasing attempt numbers. An explicit `ebay_record_erasure_work_outcome` supports retry with bounded exponential backoff, awaiting evidence or blocked, rejecting stale attempts. **There is deliberately no work-complete or receipt-complete API.**

## Important limitations
The work journal is *not* an erasure executor. No worker is deployed or invoked. `awaiting_evidence` does not mean that data was erased, a processor confirmed removal or legal retention was reviewed. No customer data is deleted by this migration; source quarantine and the webhook 503 remain unchanged. Do not use this schema to justify receipt 2xx or eBay activation.

## Controlled acceptance tests before any production migration application
1. Apply migration to an isolated clone; inspect its schema, RLS, grants, triggers and function definitions.
2. Insert a synthetic deletion receipt in an explicit transaction with rollback and confirm seven deduplicated work items. Do not commit the synthetic account identity.
3. Establish two real psql connections and test `SKIP LOCKED` claim exclusion, lease expiry, retry backoff, stale-attempt rejection, worker crash/replay and no duplication.
4. Confirm `anon`, `authenticated` and `service_role` cannot call queue functions or read work items. Confirm webhook still 503.
5. Build independent full-store deletion implementation, prove each of the seven surfaces with retention/processor evidence, and get legal approval before a future reviewed state transition. Then test real signed eBay provider notifications.

No production schema changes should be represented as applied until verified separately. Do not weaken the permanent tombstone or disable source quarantine. Awin feeds and permissions remain unchanged.
