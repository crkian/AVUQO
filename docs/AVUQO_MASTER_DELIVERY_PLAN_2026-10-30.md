# AVUQO — Master Delivery Plan and Release Register
**Baseline:** 30 October 2026
**Product authority:** AVUQO_MASTER_SOURCE_OF_TRUTH_2026-10-28.md and original master specs. Current code and real database/deployment evidence take precedence for implemented status. Historical ZIP files do not.

## Trust and release constraints
- AVUQO Score, buy/wait advice, organic order and valid cheapest baskets remain independent of commission and advertising.
- Display only source-authorised, fresh, correctly matched offers. Never fabricate product prices, market coverage, history, savings, availability or rights.
- Do not compare incomplete grocery baskets as complete. User-entered prices stay clearly marked as personal.
- Owner approval, asset licences, real service connectivity, disclosure and emergency stop gate all external publishing.
- Preserve Supabase RLS, server-side authorization, audited updates and credentials. No destructive overwrite, unsupported secrets or automated production deployment.
- Each change needs tests, lint/typecheck/build and browser acceptance before merge; a CI-ready commit is not a live deployment.

## Sequenced workstreams

### P0: Security and broken customer journeys — in progress
Correct Saved and Watches links: previously stored `deal:<uuid>` keys must open source-gated `/live/<uuid>`; demonstration slugs retain `/deal/<slug>`. Invalid links must be non-clickable. Correct Watches copy: saving a Watch is not evidence of live automated notifications. Add unit tests to GitHub quality checks and preserve existing records. Review draft PR #20 for affiliate approval/owner permissions before merging.
**Gate:** unit tests green; correct routes for legacy and verified records; no new merchant publication.

### P1: Real search, product comparison and deals
Unified search, category matches, fast no-results recovery, exact product models, total costs, provenance, price history and meaningful buy/wait explanations.
**Gate:** from search to eligible offer to approved merchant with matching, freshness, legal and price validation; no demo contamination.

### P2: Groceries, Shared Lists and Watches
Guest basket persistence, exact items/pack sizes, complete-vs-incomplete price comparisons, transparent source coverage, user prices, permissions for shared lists, monitoring/notification infrastructure.
**Gate:** nine store listings usable; no false cheapest-basket claim; no alert-promise until operational.

### P3: Approved networks, attribution and revenue
Authorise each Awin/other merchant and data use, product feeds, verified destination hosts, click IDs, conversion imports/deduplication, estimated vs confirmed/refunded revenue.
**Gate:** at least one end-to-end permitted programme and reconciled conversion; importer pilots never assumed approved.

### P4: Two separate commercial marketing workflows
Owned-brand social: review -> compliant creative -> scheduled authorised publication -> provider reconciliation. External website advertising: vetted advertiser -> approved creative -> labelled inventory -> consent-aware serving/billing. Commission never influences rankings.
**Gate:** independent owner controls, audit, licensed creative and proven provider acknowledgements; default OFF.

### P5: Budgeting, travel and premium experience
Consent-aware budgeting MVP, non-fabricated savings estimates, authorised travel comparison, accessible responsive UI, SEO and measurable performance.
**Gate:** mobile/keyboard acceptance, consent controls, transparent limitations, error monitoring.

## Release checklist
- [ ] Current main verified, changed files scoped, rollback documented.
- [ ] Node 24 CI: unit tests, npm ci, npm run lint, npx tsc --noEmit, npm run build.
- [ ] Browser checks for signed-in/out, desktop/mobile, user permissions, data rights and empty/error states.
- [ ] Database/RLS security advisor reviewed when schema/auth changes.
- [ ] Owner-approved merge and production deploy; verify Vercel READY and actual affected pages afterwards.
- [ ] Record actual evidence, blockers and outstanding feature status.

## Grounded baseline
On 30 October 2026 Vercel production for main was READY. The database recorded nine grocery stores but zero published grocery prices, zero approved affiliate programmes, zero affiliate conversions and zero marketing publication jobs. Marketing publishing and AI were disabled with emergency stop enabled. Four exposed privileged SQL helper functions were restricted; two owner-checked publisher functions and leaked-password protection remain for review. Affiliate approval draft PR #20 has not been merged. The separate site advertising interface was on a development branch, not certified live.

**Delivery register:** Phase 1 route repair is prepared on `fix/phase1-saved-watches-routing-20261030`, pending CI and preview review. No production deployment claimed.
