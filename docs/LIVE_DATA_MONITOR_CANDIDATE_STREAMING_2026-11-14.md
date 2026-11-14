# Live Data Monitor: isolate private candidate scan from operational metrics

Date: 14 November 2026. **Status: release candidate, not yet production-verified.**

## Baseline
- Verified production before branch: `73d12db074ce89e3b2bc9d17163db71574ff2364`, Vercel `dpl_HBrdWCKnWRYe4UAspqeTqpHaJWNa` READY on `www.avuqo.com`.
- Owner's read-only browser audit found `/control-centre/live-data` slow to finish rendering. Source: `docs/AVUQO_CONTROL_CENTRE_OWNER_AUDIT_2026-11-14.md`. It rendered, but state-changing actions were not tested.
- Previously, the route's initial Promise.all loaded dashboard data and 200 pending candidate rows; **before producing any JSX**, it paged the pending review feed sequentially up to 5,000 rows, 200 at a time, calculated duplicate candidates and showed its first paint only after the scan. No actual seconds were measured in this session.

## Code change
- Preserve the authenticated Control Centre layout guard and request-time `connection()` in the parent.
- Move the entire read-only candidate query, 200-row pagination, 5,000-row maximum, deduplication, original 40-candidate shortlist and screening flags into an async server-only `CandidateReviewPanel.tsx`.
- Wrap the candidate section in its own React Suspense loading panel with `role=status`, `aria-live=polite`, explanatory source-approval safety text. The dashboard's counts, source health and recent runs can stream once their independent reads complete without waiting for the serial candidate scan.
- Preserve the latest 10 import-batch restrictions and pass only restricted merchant IDs, not credentials or customer records, into the panel. Missing permissions/scan errors now explicitly show **Unavailable**, not an inferred zero or approval.
- Keep all source rights, publisher decisions, affiliate prices, image evidence and merchant approval controls untouched.

## CI and release acceptance
1. Node contract tests confirm the paginated candidate loop is no longer in the parent, the new component retains 200-row pages and a 5,000-row limit, its 40-entry shortlist and dedup, and no writes/network calls/approval side effects are introduced.
2. GitHub build and lint, full CI suite, secrets scan and Vercel preview must pass before merging.
3. Verify exact merged GitHub SHA is Vercel production READY with correct `www.avuqo.com` / `avuqo.com` aliases, homepage 200 and a signed-out Control Centre access guard. Public signed-out fetching cannot prove internal scan timing.
4. In an authorised **read-only signed-in owner browser**, compare navigation-to-metrics versus navigation-to-candidate-table times on `/control-centre/live-data`. Confirm fallback appears when the query is slow and candidate results still contain duplicate/permission flags, capped/partial-data messaging and no unverified public offers. Do not log personal/feed secrets, trigger imports or publish changes. Exact latency improvement is **pending measurement**.
5. Treat the original endpoint checker with no configured targets and upstream Open Food Facts HTTP 503 as separate dependencies; this change does not touch either.

## Remaining priorities
- Product true HTTP 404 remains unverified after #194: actual unknown/pilot slug response was HTTP 200 with not-found content.
- Owner-signed-in Marketplace and Source Atlas must be checked for current Awin feed observation counts (74 at the last read-only query), plus private page editor runtime warning acceptance after #195.
- Obtain approved retailer/product rights and fresh price/stock/variant proof for **one** public offer through the existing gated release workflow; never publish demo offers as real inventory.
- Continue exact source-to-main review of 14 divergent historical branches while preserving original design and security references.

No Supabase migrations or writes, no provider API calls, no cron changes, no social publishing, no tyre worker activation.
