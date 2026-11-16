# eBay leased mapped-catalogue erasure executor: candidate only

**Date:** 16 November 2026. **No additional cost.** **NO-GO for live provider acknowledgement.**

## Implementation

`supabase/migrations/20261116192000_ebay_leased_mapped_catalogue_executor.sql` introduces the DBA-only `public.ebay_execute_leased_mapped_catalogue_erasure(receipt_id,attempt)` function. It requires an existing, unexpired matching **mapped_catalogue** queue lease, locks that row, locks the pending/processing deletion receipt, verifies that the eBay source is still paused and synchronisation disabled, then calls the existing *DBA-only* `public.ebay_run_audited_partial_erasure(notification_digest)`. The existing underlying source-isolated purge and audit are unchanged.

In the same SQL transaction, the new function moves only that one queue item to `awaiting_evidence` and clears its lease. If any step fails, PostgreSQL rolls back the purge, audit and work disposition. The procedure does **not** mark a receipt `completed`, process other work surfaces, make a provider API call or return an eBay webhook acknowledgement. It has no permission grants for anon/authenticated/service_role.

## Evidence: real versioned mapped purge on synthetic PostgreSQL

The native GitHub `ebay_postgres` job now loads the **actual committed original** `20261116132000_ebay_account_scoped_erasure_foundation.sql` migration, the exact `20261116155500_ebay_audited_partial_erasure.sql` migration, the work journal and the leased executor over a minimal **synthetic** local database. The former test-only implementation of the purge dependency was removed. This is genuine execution of the exact original database functions, not a stub.

`tests/fixtures/ebay-local-mapped-executor-acceptance.sql` creates synthetic source-scoped `offers`, `source_ingestion_items`, `price_history` and `product_matches`, including multi-alias ownership links on one eBay account, an unrelated eBay offer and non-eBay data. It verifies exact real purge counts of one for **all four affected surfaces**, mapped ownership link removal, a single audited result, source isolation, refusal of unleased/stale/duplicate work, no receipt completion and complete transaction rollback.

**Limit:** This is the original production SQL operating on a *minimal synthetic table schema*, not a full clone of AVUQO's actual constraints, triggers, indexes, storage, processors or backups. It does not establish completed erasure, external retention compliance or signed eBay provider webhook readiness. Future cross-store audit and full-schema integration remain required.

## Operational restrictions and unfinished work

The new migration is committed for review **but must not be applied to production** based on this synthetic evidence. No worker automatically calls it. Existing eBay receipt journal and suppression triggers are unchanged, eBay source remains `paused`, sync disabled, import quarantine active and deletion webhook HTTP 503/unregistered. Awin and its independent feed pipelines are untouched. No Docker, Supabase development branch or new paid service.

Before any eBay activation or deletion 2xx, independently verify full cross-system account erasure, identity alias mapping, cleanup of analytics/files/assets/logs, backups and retention policy, external processors, provider-signed notification authenticity, idempotent retries and legal approval. Never treat `awaiting_evidence` as completed erasure.
