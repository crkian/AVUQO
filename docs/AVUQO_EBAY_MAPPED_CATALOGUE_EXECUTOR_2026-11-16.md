# eBay leased mapped-catalogue erasure executor: candidate only

**Date:** 16 November 2026. **No additional cost.** **NO-GO for live provider acknowledgement.**

## Implementation

`supabase/migrations/20261116192000_ebay_leased_mapped_catalogue_executor.sql` introduces the DBA-only `public.ebay_execute_leased_mapped_catalogue_erasure(receipt_id,attempt)` function. It requires an existing, unexpired matching **mapped_catalogue** queue lease, locks that row, locks the pending/processing deletion receipt, verifies that the eBay source is still paused and synchronisation disabled, then calls the existing *DBA-only* `public.ebay_run_audited_partial_erasure(notification_digest)`. The existing underlying source-isolated purge and audit are unchanged.

In the same SQL transaction, the new function moves only that one queue item to `awaiting_evidence` and clears its lease. If any step fails, PostgreSQL rolls back the purge, audit and work disposition. The procedure does **not** mark a receipt `completed`, process other work surfaces, make a provider API call or return an eBay webhook acknowledgement. It has no permission grants for anon/authenticated/service_role.

## Evidence: native GitHub PostgreSQL synthetic test

The `ebay_postgres` job on the public repository's existing Ubuntu hosted runner applies the exact new candidate function to the isolated Unix-socket-only PostgreSQL database. The existing production audited purge dependency is **simulated** for this test by `tests/fixtures/ebay-local-mapped-purge-dependency.sql`, which deletes mapped offers/ingestion and writes a count-only audit; this simulator is not the actual production purge function and does not validate production `price_history`, `product_matches` or complete schema. The linked-offer fixture belongs to eBay; a separate non-eBay offer must survive.

The acceptance `tests/fixtures/ebay-local-mapped-executor-acceptance.sql` tests that:
- A deletion receipt can be created *after* an existing account link.
- The new executor refuses an unleased or incorrect-attempt call.
- A genuine queue claim permits one audited partial deletion.
- Exact linked eBay offer and its ownership link disappear while a non-eBay offer survives.
- One private count-only audit exists and the mapped work item moves to `awaiting_evidence`.
- Duplicate execution is refused and the receipt remains `pending_privacy_review`.
- Every synthetic mutation is rolled back and the eBay offer is restored in the fixture database.

**Passing CI does not prove that the original production audited purge function works on the actual full AVUQO schema.** That needs a separate integration proof with actual versioned original purge migration and all linked price/match/ingestion tables, plus retention and legal review.

## Operational restrictions and unfinished work

The new migration is committed for review **but must not be applied to production** based on this synthetic evidence. No worker automatically calls it. Existing eBay receipt journal and suppression triggers are unchanged, eBay source remains `paused`, sync disabled, import quarantine active and deletion webhook HTTP 503/unregistered. Awin and its independent feed pipelines are untouched. No Docker, Supabase development branch or new paid service.

Before any eBay activation or deletion 2xx, independently verify full cross-system account erasure, identity alias mapping, cleanup of analytics/files/assets/logs, backups and retention policy, external processors, provider-signed notification authenticity, idempotent retries and legal approval. Never treat `awaiting_evidence` as completed erasure.
