# eBay DBA-only read-only erasure preflight | 16 November 2026

**Status: candidate migration only.** Do not deploy to production without review. **Cost £0 extra, no Docker, no live Supabase changes.**

## What this delivers
Versioned SQL `supabase/migrations/20261116221000_ebay_readonly_mapped_erasure_preview.sql` adds `public.ebay_preview_next_mapped_erasure()`, a DBA-only, count-only, no-argument **strictly read-only** planning function. It previews *one eligible pending mapped-catalogue work item*, without exposing receipt IDs, account HMAC digests, sellers, analytics sessions, customer data, or raw payloads.

- If eBay is not demonstrably paused and sync disabled, returns `SOURCE_NOT_QUARANTINED` with no counts.
- If no currently eligible pending mapped task exists, returns `NO_ELIGIBLE_PENDING_WORK` with no counts.
- Otherwise calls the existing exact-account, exact-source `ebay_secondary_account_reference_counts` for counts of linked offers and analytics/attribution/feedback/watch records.
- When any linked shopper records exist, returns `REVIEW_REQUIRED` (not a deletion instruction).
- If none of those four links exist, returns `CANDIDATE_ONLY_NOT_AUTHORISED`. **This is never consent or confirmation that all stores are clear.**

No queue lease, state transition, receipt completion, purge, shopper event deletion, admin permission grant, provider acknowledgement, subscription change or automated worker is included. The preview may become stale immediately after it is returned, and can never be used to bypass the previously staged transactional guards.

The existing owner-only eBay Privacy Control Tower at `/control-centre/ebay-privacy` remains read-only and retains its hard `registrationReady=false` and `completionAuthorised=false` gates.

## Native PostgreSQL acceptance

On the £0 GitHub native Ubuntu PostgreSQL job, the new candidate SQL executes alongside the original versioned account ownership, queue, audited purge, processor and secondary-history guard migrations in a disposable Unix-socket synthetic database. `tests/fixtures/ebay-local-readonly-erasure-preview-acceptance.sql` verifies:

1. A missing candidate gives `NO_ELIGIBLE_PENDING_WORK`.
2. A synthetic account with exact linked eBay offer and all four customer-event references gives `REVIEW_REQUIRED`, counts 1 each, and leaves all data, attempt counters and seven queue tasks intact.
3. Clearing test-only secondary events gives `CANDIDATE_ONLY_NOT_AUTHORISED`, not a success/acknowledged state.
4. Temporarily switching the synthetic eBay source to active makes the preview refuse to issue a candidate.
5. All synthetic mutations roll back, including source status.

**This is not a complete production-schema clone and not an eBay compliance certification.**

## Completion gates

The work journal and private executor migrations have not been applied to production. Live eBay remains paused, sync disabled, imports quarantined and deletion POST HTTP 503/unregistered. Still required: reviewed lawful secondary shopper-history treatment, full referential/storage/log/backup/processor inventory and tests, securely deployed idempotent work orchestration and genuine signed eBay provider notification acceptance. Only after those gates and explicit authorisation should the production webhook and Developer Portal be enabled. Awin is untouched, and AVUQO never supplies inventory or fulfils purchases.
