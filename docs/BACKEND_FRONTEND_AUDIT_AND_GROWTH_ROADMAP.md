# AVUQO backend, frontend navigation and design audit
Date: 2026-10-29
Source-of-truth: AVUQO_MASTER_SOURCE_OF_TRUTH_2026-10-28.md, Master Product Build Specification, Intelligent Supermarket Comparison Specification, Content & Backend Plan, current GitHub main and production Supabase inspection.
Status: tracked implementation progress. Requirements are NOT proof of implementation.

## Audited facts
- Consumer Navigation v2 is live and organised into seven routes: Discover, Deals & Sales, Compare, Groceries, Categories, Travel and More, with protected Control Centre navigation editing.
- Public /, /search and /groceries were verified in the previous release via Vercel HTTP and build checks; authenticated visual/accessibility testing at variable zoom still requires a real interactive browser session.
- Control Centre already contains real workspaces for Sources, Source Readiness, Product Readiness, Pipeline, Coverage, Live Data, Groceries, Grocery Price Evidence, Website Content, Navigation, selected page and legal content, Seasonal, Brand Social Marketing, Affiliate Promotion, Automation, Exceptions, Revenue and Trust.
- Prior admin sidebar was a flat list with many nested routes not listed. It also used exact-match active state, making child routes less discoverable.
- An independent Site Advertising backend did not previously exist: third-party advertisers must be isolated from the four brand social marketing workspaces and AVUQO's independent deal/score engine.
- Existing owner-facing summary displayed zero for failed counts, which could make disconnected systems appear empty. This change distinguishes unavailable from zero.
- Existing marketing homepage editor supported a sponsored toggle despite allowing only AVUQO-owned facts/internal links. Removed the toggle for new editorial features to prevent conflating owner content with third-party paid ads.
- Supabase public records include sources, groceries, marketing, content and operational tables with RLS enabled; these are not proof of fully authorised live source feeds.

## This release builds
1. Grouped, labelled private sidebar: Start Here; Website & Experience; Sources & Value; Advertising & Growth; Operations & Trust. Includes every existing Control Centre route plus new release readiness and Site Advertising pages.
2. Better owner dashboard with workspace cards, real database-count unavailable states, and independent-trust disclosure.
3. Release Readiness dashboard distinguishing available UI/data, deliberately disabled external systems, pending source acceptance and unknown values; links to workspaces.
4. Separate private advertiser and on-site campaign brief registry, verification, reviewed creative text, scheduled date windows, landing-domain checks and audit trail. No anonymous policies, no public ad delivery, no payment or advertiser self-service.
5. Explicit editorial-only AVUQO homepage rotation, separate from outside advertiser inventory.

## Site advertising is NOT a live commercial product yet
Before paid bookings or ad serving:
- Agree final advertiser terms, inventory zones, rates, billing and cancellations
- Add creative media handling, image rights, responsible ad policies, domain review and legal signoff
- Build consent-aware impression and click logging, delivery evidence, fair rotation, frequency caps, fraud controls and truthful reports
- Verify active sponsorship disclosure and organic ranking/Score isolation
- Test advertiser access permissions, billing, lead intake and refunds if implemented
- Never turn on paid bookings or invoices until these gates are met

## Other outstanding foundations from the master specs
- Budgeting & Savings: build a genuine budget model and local/consented state, without claiming bank integration
- Unified search: authorised cross-category matching and meaningful suggestions; current product search cannot guarantee complete market coverage
- Verified deal feeds: only licensed source data and evidence freshness; avoid claiming internet-wide crawling
- Grocery intelligence: approved price feeds, matching/pack-size confidence, complete-basket tests, source freshness and rights, eventually budget/list integration
- Media library and page CMS: expand from current footer/navigation/selected pages to reusable page blocks and correctly licensed imagery
- Consumer QA: live authenticated testing, browser-zoom responsive inspection, loading states, form errors, WCAG keyboard navigation and core web vitals
- Social marketing: Buffer/other provider permissions, real scheduling/cancellation and analytics, AI model availability and spending caps must be tested before connecting. Fantasy Lockr absolute source firewall remains in force

## Rollout and safety
- Migration: supabase/migrations/20261030001000_site_advertising_private_foundation.sql.
- Review security first. Run CI and preview testing. Apply migration separately and verify RLS, grants and private audit.
- Production interface can launch while ads remain private and unsent, provided tests pass.
- Feature rollback: Vercel previous deployment; additive private tables remain inert with no public policies.
- No actual advertiser contacts, campaigns, ad expenditure or brand social posts are created in this change.
