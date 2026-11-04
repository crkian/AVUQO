# AVUQO living project status

**4 Nov 2026 live-site polish and Awin staging shortlist:** Production route audit confirmed homepage, Shopping, Categories, Gifts, Pets, Technology and Motoring render HTTP 200 with shared live site layout. Narrow-screen screenshot automation was blocked by network policy, so visual viewport assertions remain unverified. Shopping department shelf uses a genuinely compact 4-card layout on homepage and Categories but the full 6-card layout on Shopping, adding editorial Technology and Motoring routes with no unapproved merchant products. Owner-only `/control-centre/feed-imports#next-merchant-feeds` lists verified active Awin feed IDs and counts from the 4 Nov 2026 inventory: Mozillion SIM-free 74135 (224), 1pMobile 81201 (10), Compare Parking 109353 (60), Lyca 116573 (10), Mozillion SIM-only 97136 (33), Petlibro latest hero 119009 (19). Larger Tyres UK 93988 (31,354), Tyres Pneus 26513 (20,034) and Mozillion pay-monthly 97090 (7,729) need large-feed support. No feed downloads, new product imports, credentials or public release were made. eBay developer approval pending.

**Pending eBay UK read-only private pilot and product detail polish (4 Nov 2026):** Adds owner-only `/preview/ebay` search via server-side eBay Browse OAuth client credentials, `EBAY_GB` and item-location country GB. All data is genuine API-only and returned only to owner; no DB ingestion or public offer. Optionally recognises EPN campaign ID for presence diagnostics, but never exposes affiliate checkout URLs or publishes eBay images. Private product detail now checks completed import status, shows source import date, flags manufacturer as unverified and degrades broken image links. eBay app keys and EPN campaign are NOT configured/verified, source remains paused. No automatic eBay sync or release authorization.

**Live-site shopping layout integration (4 November 2026, pending checks):** Insert AVUQO warm editorial shopping department cards into the real homepage, /shopping and /categories using the existing LifestyleLanding flow and the current brand palette, type, shapes and mobile breakpoints. Departments use only existing public editorial destinations, not unapproved merchant listings. Verified owner/admin accounts see additional links to private Tooled-Up, Cadbury, Petlibro and Craft Buddy product staging. Private `/preview/storefront` styling and wording aligned with established AVUQO lifestyle look. No staged retailer product data or photography is made public. Customer-facing product links remain gated pending current prices, verified permissions, and approved offer releases.

**Pending responsive owner-only storefront rehearsal (4 Nov 2026):** `/preview/storefront` connects a homepage-style private browsing journey to completed merchant imports for Tooled-Up (Awin 496), Cadbury (736), Petlibro (77952), and Craft Buddy (45747). Visible only after verified owner/admin role, noindex, no public product release. Owner-only homepage CTA and Categories menu shortcut; department links to private actual product records and individual category-adaptive product evidence. Tooled-Up detail pages now inspect source category path, unverified retailer brand, EAN, GTIN, MPN and historic availability where recorded. Desktop, tablet and narrow-screen responsive styles added to storefront, Tooled-Up catalogue/cards and individual product detail. No production customer product listings, automatic feed downloads, permission status or Awin/eBay source activation.

**Pending opt-in Awin metadata monitor (Nov 4, 2026):** Owner-only feed-update dashboard plus disabled-by-default daily Vercel cron, checking official Awin Product Feed List for last-imported changes among joined advertisers. Credentials remain server-only, signed URLs never stored, source stays paused. No automatic product feed downloads, retailer image rights or public offer releases. New migration required.

**Tooled-Up private full-catalogue discovery (pending 4 Nov 2026):** Owner-only server-side search across 84,284 records, 313 brands and 32 departments, exact retailer category paths, EAN and source model fields, historical price sort, 48-row paging and private opt-in host-restricted image inspection. RLS-preserving SQL functions applied and tested. No public offers or automatic feeds.

**Tooled-Up owner-only image visibility fix (pending, 4 Nov 2026):** Tooled-Up's 84,284 private records have image URLs hosted at `www.tooled-up.com`. The exact HTTPS host is added to opt-in private card/detail photo inspection only. The 100-page private preview cap is expanded so all 84,284 rows can be browsed in 48-item server-side pages. This does not permit public images or checkout, verify image URLs are reachable, or change source/offer rights.\n
**Pending private Tooled-Up large-feed importer (4 Nov 2026):** Owner-only streaming browser importer at `/control-centre/large-feed-import` for advertiser 496, feed 89987. Validates 250-row chunks, matches per-row advertiser and Awin publisher IDs, stores retailer `brand_name` (not independently verified legal manufacturer), brand ID, model, EAN, GTIN, MPN, source categories, stock and source images as private unverified references. Transactional Postgres chunk receipts and a compressed-file SHA256 make 84,284-row imports resumable without duplicate chunks. Rows stay under `importing` status until final private review. Requires new `supabase/migrations/20261104171000_large_feed_private_import.sql` before use. This is a MANUAL source-file import, not automatic Awin downloading; Tooled-Up underlying `awinnew` file identity, credentials and publication/image rights are not verified. All source sync controls remain paused.

**Pending owner-only category product detail views (4 Nov 2026):** `/preview/products/[id]` uses authentic staged records and category-specific evidence checklists for gifts, pet, crafts, computing and future tyres. Private image opt-in only; all historical prices are labelled, missing specifications remain unverified, retailer checkout remains disabled. No public product rights or feed activation inferred.

**Pending private Awin inventory review (4 Nov 2026):** Owner-only `datafeeds.csv` inspector lists active feed IDs, counts and source update timestamps for currently joined Awin advertisers, never returning or persisting signed download URLs. The owner's 952-entry list has 72 `active` feed entries across 11 joined advertisers. Tooled-Up's new daily feed rule requires the underlying filename to begin `awinnew`; Awin display names alone are insufficient. No automatic feed fetching, rights release or product publication activated.

**Proposed owner-only customer storefront rehearsal (PR #52, not deployed):** `/preview/products` reuses customer catalogue styling and read-only staged feed rows while requiring Control Centre owner/admin authorisation. It hides merchant images, labels staged prices as historical, disables buying links, and does not publish offers or enable scheduled Awin ingestion. Browser, mobile and role-denial acceptance remain open. Current software version stays `0.3.0`.

**Proposed premium storefront browsing (PR pending, not deployed):** Owner-only `/preview/products` has provisional department suggestions, search, retailer filters, sorting and private comparison for existing staged records. Merchant feed category gaps remain 578/1,371 Cadbury, 98/98 Petlibro and 162/1,299 Craft Buddy; no canonical category assignments, licence verification, feed automation or public offers are changed. Current application version remains `0.3.0`.

**Unreleased private catalogue pagination (PR pending, 4 Nov 2026):** Owner-only preview gains 48-item paginated browsing per imported merchant using private staging data; the general highlights mode remains a sample. Tyres UK (12715) and Tyres Pneus Online UK (15236) appear only as feed-pending onboarding notices with no invented products. Image URLs are present in historical staged imports but are not rendered absent confirmed rights. No public offers or live feed sync enabled.

**Proposed private image review + import classification (PR pending, 4 November 2026):** The signed-in owner can opt to display images referenced by the existing permitted-format feed uploads from allowlisted HTTPS hosts (`cdn.shopify.com`, `www.cadburygiftsdirect.co.uk`). Image loading is off by default and is not public publication approval. New manually uploaded feed rows preserve the advertiser category and record a provisional department and `needs_review` status for unknown items in private metadata. No canonical category ID, merchant licence, public offer, feed schedule or advertiser activation is inferred. All 16 joined Awin advertisers remain registered as paused onboarding entries. Existing historical imported records are not rewritten by this proposal.

**Proposed multi-advertiser private Awin CSV intake (4 Nov 2026):** Owner explicitly selects one of 16 observed joined Awin IDs and uploads a matching product feed. Server verifies exact current joined registry status and exact advertiser ID on every row; stores unverified private records only. Awin source remains paused. This is not a live provider feed connection or publisher licence. [Connector comparison and eBay Browse API research](./UNIVERSAL_CONNECTOR_NEXT_PILOT_2026-11-04.md). Pending PR review and acceptance.

**Purpose:** The single GitHub starting point for AVUQO project work across chats, contributors and tools. GitHub `main` is the authority for deployed code. Private business data and API credentials never go here.

**Awin 16-programme intake, 4 Nov 2026:** User-reported signed-in v0.3.1 Preview diagnostic returned 16 joined programme IDs including Cadbury `736`, Petlibro `77952` and Craft Buddy `45747`. All 16 registered in the private, **paused and unapproved** Awin source; no provider approvals, rights expiry or publication added. Supabase still shows 0 Awin sync runs, 0 Awin offer releases and 0 public Awin offers. See [programme queue](./AWIN_JOINED_PROGRAMMES_2026-11-04.md). PR #48 diagnostic remains a draft pending signed-out/non-admin acceptance. The existing single-advertiser connector does **not** simultaneously support 16 feeds.

**Latest verified Awin onboarding (4 November 2026):** v0.3.0 owner-release code deployed READY; PR #45 SQL terminator fix merged at `18752f41287f30f82ba679c170e61b685520765e` and release migration applied. Cadbury (`736`, 1,371 private rows) and Petlibro (`77952`, 98 private rows) are **registered as unapproved, paused drafts**. Awin sync is disabled, zero public Awin offers. The connector currently uses one `AWIN_ADVERTISER_ID` at a time. [Pilot register](./AWIN_CADBURY_PETLIBRO_PILOTS_2026-11-04.md). Do not infer rights from the archived feeds or available token.

**Proposed customer safety patch: `0.2.3` on the P0-03 feature branch (not yet deployed).**

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

## Awin advertiser onboarding and per-offer publishing (v0.3.0 candidate)

The owner release SQL function terminator was corrected in follow-up PR #45 before migration. Runtime code was deployed in PR #44, but the live database remains unchanged until the corrected reviewed migration is applied and verified. No advertiser has been activated.

**Release candidate version:** `0.3.0` (not deployed, pending CI and migration).

An owner-only Awin advertiser workflow is prepared in `/control-centre/awin-advertisers`. It records private programme drafts and owner permission references, tests a small feed response without writing products, runs the existing ingestion pipeline only after rights and credential checks, reviews a fresh priced offer and releases or pauses **one offer at a time** with an independent private approval record and audit. The Awin pipeline is now held-first; public admission requires exact approval/price/timestamp/Score consistency. Matching SQL: `20261104112500_awin_offer_owner_release.sql`. **Candidate only until CI, deployed code SHA, migration and provider evidence/acceptance are verified.** No real Awin advertiser has been authorised or published, and the existing 4,588 staged rows remain private. Details: [Awin release runbook](./AWIN_ADVERTISER_ONBOARDING_RELEASE.md).

## P0-03 private customer collections (release candidate)

Existing personal Wishlist/Basket operations stored browser-provided prices and merchants without trusted server verification. The v0.2.3 candidate moves creation and named basket copying to authenticated server endpoints, validates current rights-approved offers, introduces unique list/item keys and adds restrictive owner-only RLS for planning collections. The migration is **not yet applied**; normal Saved/Watches/collaborative list routes are preserved. Customer data count was zero at audit. Full two-account, mobile email-app and approved-merchant acceptance is still pending. [P0-03 checklist](./P0_03_COLLECTIONS_ACCEPTANCE.md).

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
