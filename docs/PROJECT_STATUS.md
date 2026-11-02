# AVUQO living project status

**Purpose:** The single GitHub starting point for AVUQO project work across chats, contributors and tools. GitHub `main` is the authority for deployed code. Private business data and API credentials never go here.

**Current software version: `0.2.2` (P0-02, PR #40 merged at `f7dc24ccf0e3b3101570419d43b7d9b647707361`, Vercel production READY).**

**Previous software version on `main`:** `0.2.1` (PR #38 merged at `f81b34f99bf5f95e59aa18efa877ce0292996d7c`; Vercel production READY). Previous version: `0.2.0`. (PR #34 merged 2 November 2026); feature release READY at `18fe575458588be511ffc5762152eccee4798a53` (PR #35); documentation audit PR #36 subsequently deployed READY at `7563e14fb76d02621cdbafac6a2b8ab58311aea0`. Latest SHA must be rechecked in Vercel. Signed-in customer journey acceptance still pending.
**Previous software version:** `0.1.0`, commit `17a73a6fc20ecad2c892d45f2e2c95b82a6087ef`. The old `0.8` handover labels are historical product-plan labels, not the package's software version.
**Release status:** v0.2.0 compiled and deployed READY, but end-to-end signed-in validation of wishlist, basket, named copy and email-app draft is still outstanding. Do not claim these user journeys are fully verified.
**Source of truth:** [Original product specifications](./AVUQO_2026-10-30_SPEC_INTEGRATION_REGISTER.md), then current implementation in GitHub, then real database and production evidence. Claims need checks.

## Latest spec-to-code audit, 2 November 2026

- **Full source traceability and measured maturity:** [SOURCE_TO_CODE_AUDIT_2026-11-02.md](./SOURCE_TO_CODE_AUDIT_2026-11-02.md). Covers the 2 original master PDFs, affiliate/analytics/CMS plans, unified source of truth, 2 handovers, an uploaded brand image, GitHub code, current PRs and read-only Supabase.
- **Original-source provenance:** [SOURCE_MANIFEST_2026-11-02.md](./SOURCE_MANIFEST_2026-11-02.md) indexes all 9 uploaded originals by SHA-256 and authority; [SOURCE_REQUIREMENT_GAPS_2026-11-02.md](./SOURCE_REQUIREMENT_GAPS_2026-11-02.md) adds 12 finer-grained checks.
- **Prioritised living execution plan:** [ROADMAP.md](./ROADMAP.md). IDs P0-01 through P4-05 (including new P1-07, P2-06, P3-06 and P4-05), dependencies and release/acceptance gates. Feature maturity M0–M4 is an evidence rubric, **not percentage completion**.
- **Checked baseline:** `main` commit `18fe575458588be511ffc5762152eccee4798a53`, version `0.2.0`, Vercel production READY. New roadmap-only work does not bump the app version.
- **DB audit:** 1,384 categories (8 active), 4,588 **private unapproved** Awin import records in 5 runs (AKKO duplicated), 12 product identities (4 active), 6 offers/published deals **all from internal demo**, 0 grocery price records, 0 analytics events, 0 affiliate conversions and 7 historical click events. These are records, **not live verified retail coverage or earnings**.
- **Immediate safety review:** `analytics_events` and `click_events` have anonymous INSERT policies that need effective-grant, consent and provenance tests. Awin source is marked active/sync-on but credentials are not configured and permissions are not recorded; retain server-side publication gates and review fail-closed operations.
- **Open drafts:** #21 customer Saved/Watches fixes and #25 universal taxonomy. Their work must be reconciled onto current `main` before merging, not blindly replayed.
- **Source-specific omissions made explicit:** true natural-language search, transparent Preference Graph, timed Seasonal Calendar Engine and optional native/push experience remain separate requirements, not assumed delivered by related pages. Browser-saved affiliate prices are snapshots, not trusted server-verified prices.
- **Acceptance still outstanding:** real signed-in Wishlist/Basket/Lists journey, negative cross-account access tests, live authorised merchant data, privacy/consent, and actual revenue/social provider reconciliation.

## P0-01 event integrity implementation (release candidate)

The database audit verified anonymous and signed-in INSERT grants on both `analytics_events` and `click_events`. PR implementation removes the existing unauthenticated/client write surface and pauses new merchant click recording while retaining verified redirects. The matching SQL migration was applied on 2 November 2026 under Supabase migration `20261102162756_p0_01_event_write_integrity`; effective `anon`/`authenticated` event INSERT grants are now false, the old INSERT policies are absent, service_role INSERT is preserved, and historical seven click rows remain. **Status: deployed and database permissions verified; direct REST denial and eligible-merchant browser smoke tests still outstanding.** Details: [P0-01 runbook](./P0_01_EVENT_INTEGRITY_RUNBOOK.md). Existing seven historical click rows are not certified conversions and must not be deleted by this release.

## P0-02 Awin source-rights safety (release candidate)

Current source registry misleadingly marks Awin active/sync enabled despite unconfigured credentials and missing source/advertiser usage, feed and image rights. Five private Awin imports contain 4,588 staged rows (including duplicate AKKO), all unverified; Awin live pipeline runs = 0. This release candidate requires exact advertiser-specific evidence, current territory/expiry, fail-closed source controls, and emergency-stop rechecks. The owner UI no longer invites unapproved Awin runs. The conditional Supabase migration `20261102170256_p0_02_pause_unapproved_awin` was applied successfully after the code deployed. Verified Awin `paused`, `sync_enabled=false`, no successful Awin sync, 4,588 staged records retained, five unverified import runs and zero published Awin offers. External advertiser permissions and real live-data acceptance remain outstanding. **No feed or public listing has been activated.** [Operator rollout and checks](./P0_02_AWIN_SOURCE_GATE_RUNBOOK.md).

## Feature delivery ledger

| Feature | Status at audit | Next gate |
|---|---|---|
| Existing AVUQO public website, categories and product preview work | Merged on `main`; production READY at prior audit | Continue production smoke checks |
| Awin product imports (Craft Buddy, Cadbury, Petlibro, AKKO) | Private staged records only | Merchant-by-merchant rights, deduplication and release approval |
| Affiliate expansion for eight networks | Private preparation merged in PR #33 | Apply, verify credentials/rights and build separate adapters |
| Affiliate promotion approval guard | Merged in PR #20 | Review underlying database authorization and role denial tests |
| Saved / Watches / legacy routes | Basic features in `main`; PR #21 holds proposed fixes | Consolidate fixes and test customer journeys; no live alerts assumed |
| Universal taxonomy and Control Centre explorer | Draft PR #25, not merged; inactive seed already staged historically | Reconcile old navigation against current `main`; no blind re-seeding |
| Personal wishlist | Merged PR #34; deployment READY, user acceptance pending | Signed-in RLS acceptance, product verification and production smoke test |
| One account basket of eligible merchant offers | Merged PR #34; deployment READY, user acceptance pending | Verify offer persistence, duplicate handling and expiry messaging |
| Save basket as one named list | Merged PR #34; deployment READY, user acceptance pending | Account ownership and RLS tests |
| Email basket | Merged PR #34: email-app draft UI, not automated sending | Test desktop/mobile email clients; automated delivery is NOT implemented |
| Verified multi-network price comparisons | Not live for unapproved feeds | Permissioned offers, price freshness, exact matching |
| First-party analytics / commission reconciliation | Partial framework; not a confirmed end-to-end revenue system | Consent, security, real attribution and settlement evidence |

## Release protocol (every feature PR)

1. Read this register, `CHANGELOG.md`, `package.json` and linked master specifications before editing.
2. Use a feature branch; do not overwrite other unmerged work, and do not merge older stacked PRs blindly.
3. Update the ledger, add a human-readable `CHANGELOG.md` entry and bump the **one software version** in `package.json` and root `package-lock.json` if the PR releases customer-facing functionality.
4. Add negative/permissions tests. Run clean lint, build, tests and preview. Do not enable unlicensed sources, automated messages or synthetic products.
5. Merge reviewed work. Confirm production SHA and URL/alias, account permissions and visual functionality.
6. Change feature status to **Live and verified** only after real verification. Never write a speculative main SHA in this file: Git tags and GitHub commits provide exact current history.

## How future chats should use this

Read `AGENTS.md`, this status page and `CHANGELOG.md` from `crkian/AVUQO` using the connected GitHub tool each time work begins. Project attachments are historical snapshots, not automatically up-to-date. **A GitHub file is not automatically injected into every chat**; a new chat must explicitly retrieve it or have an integration that does so.

## Safety

- One independent AVUQO Score; affiliate commission cannot alter rankings.
- Only permissioned fresh offers can appear in product pages, wishlists' new-item actions or basket additions.
- Basket totals are **snapshots**, not live purchase quotes; final price and checkout remain at the retailer.
- No stored customer email addresses or third-party email sent without a deliberate service design and consent.
