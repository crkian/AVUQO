# AVUQO software changelog

- **Unreleased general Awin resumable importer:** Owner-only cross-merchant CSV/TSV gzip streaming and safe Awin / Google-retail format detection; 250-row atomic receipts, SHA256 resume matching, row advertiser and tracking checks, source attributes retained in private review. Deliberately rejects unsupported file dialects. No public release or automatic feed download.

- **Unreleased all-joined Awin programme register:** Owner-only dashboard of all 16 accepted advertisers, recent private imports, safely redacted metadata feed listings and known large catalogue references. Distinguishes no recorded feed from no available feed; explicitly flags full-range tyre and mobile imports as requiring a general large-file importer. No public activation.

- **Unreleased live shopping layout review:** Compact homepage/category shopping cards now genuinely compact on narrow browsers, full Shopping page adds editorial Technology and Motoring departments; owner Control Centre presents verified next Awin feed IDs, product counts and safe private import instructions, with large feeds flagged separately. No product-rights/publication changes.

- **Unreleased eBay private UK pilot:** Owner-only OAuth Browse UK search in existing AVUQO responsive shopping design; real seller, brand, condition, shipping and GBP observations, manual image opt-in and zero public checkout. Source keys remain server-only, no import enabled. Private product pages show import date and clearer identity/stock provenance.

- **Unreleased live-site shopping integration:** Responsive AVUQO-style editorial shopping departments on homepage, Shopping and Categories. Existing public destinations only, with role-verified owner links into imported-product previews. Private staging look aligned to existing warm lifestyle design; no merchant product publication or rights changes.

- **Unreleased private responsive storefront:** Owner-only homepage and navigation entry, real staged departments across four Awin retailers, category-specific source-backed product pages, and refined responsive layouts. No public product, image-rights or live-price activation.

- **Unreleased Awin feed metadata checker:** Daily cron is disabled by default, uses only server-side credential and bearer auth, and records changes to joined feed IDs without downloading products or enabling offers.

- **Unreleased private Tooled-Up catalogue:** Full 84k product brand/department/search/pagination with private opt-in images and RLS-invoker PostgreSQL discovery functions.

- **Unreleased Tooled-Up private image preview:** Add `www.tooled-up.com` to exact HTTPS owner-only opt-in image hosts and lift the 100-page cap on private merchant pagination. No public image rights or live price claims.

- **Unreleased private large-feed importer:** Resumable owner-only Tooled-Up 84k-product CSV.GZ staging with streamed decompression, 250-record atomic chunks, immutable file fingerprint, explicit retailer brand/manufacturer-source distinction and model/GTIN/EAN/MPN metadata. No automatic Awin fetch, public offers or images, and no guessed manufacturer legal identity. Requires accompanying SQL migration.

- **Unreleased private category product pages:** Premium owner-only individual product detail pages with category-tailored attributes and review prompts; no public affiliate URLs, image licence assumptions, or live price claims.

- **Unreleased safe feed catalogue:** Owner/admin-only in-memory Awin feed-list CSV audit with joined advertiser filtering, credential URL redaction and strict Tooled-Up `awinnew` filename validation helper. No live connector activation or public product changes.

- **Unreleased private Awin importer expansion:** Add exact advertiser selector for 16 owner-observed joined Awin programmes and verify live source-registry joined status and every feed row advertiser ID before storing as private unverified review. No extra programme approvals, automatic fetching, fresh-price attestation, published offers or image rights. Record official Awin feed-list and second-source eBay Browse API integration research.

- **Unreleased owner image/category review:** opt-in owner-only loading of existing allowlisted HTTPS feed image URLs, and provisional department suggestions recorded in metadata during new private file imports, with missing classifications flagged for review. Original merchant categories are preserved; no canonical category approval, public product imagery, Awin activation or automatic feed sync is granted. All 16 joined advertisers remain paused.

- **Unreleased owner catalogue browsing:** 48-item pages for private staged review candidates by retailer, plus accurately labelled Tyres UK and Tyres Pneus Online UK feed-pending notice. No public release, image publication, or live tyre import. Existing v0.3.0 unchanged.

- **Unreleased premium storefront preview:** Owner-only design candidate adds provisional departments, text search, merchant/category filters, price/name sorting and local side-by-side comparison to staged samples using premium AVUQO styling. Historical prices are never described as live, merchant images remain hidden, and no customer links, publishing rights, feed jobs or canonical category IDs are introduced. Software version remains `0.3.0` until separately released.

- PR #52 proposes an owner-only `/preview/products` page that displays already-staged private feed records using the existing public catalogue styling and site Header/Footer. Merchant imagery stays hidden, historical prices are labelled, customer links remain disabled, and no Awin source, offer, permission or scheduled fetch is activated. This is a **preview candidate**, not a deployed catalogue release.

## [0.3.0] - Awin advertiser onboarding and manual release (database acceptance pending)
- PR #45 corrects the SQL PL/pgSQL terminator in the unapplied owner-release migration; migration must pass final review and production checks before applying. No provider approvals or offers were activated by this correction.
- Owner-only Control Centre workflow: advertiser ID registration, private draft, evidence/expiry attestation, restricted read-only Awin feed test, explicit source activation and pilot import, price-evidence review and one-offer publication/pausing.
- Awin pipeline now **always holds** externally ingested offers for individual owner approval and rejects mixed programme IDs. No auto-publish on source flags.
- Public Awin admission requires private per-offer approval, exact advertiser, unchanged reviewed GBP price, offer timestamp, independent AVUQO Score and a safe affiliate link, even when `published_deals` says published.
- Add private RLS-enabled `awin_offer_release_reviews` and `awin_release_audit` plus service-role-only transactional release function. No advertisers created or offers published by the migration.
- CI regression tests and owner acceptance checklist in [Awin advertiser runbook](docs/AWIN_ADVERTISER_ONBOARDING_RELEASE.md). **Still requires** CI success, Vercel READY, migration, real Awin publisher/advertiser rights and licensed live acceptance. Historic 4,588 staged rows remain private.


## [0.2.3] - P0-03 release candidate (not deployed)
- Replace browser-supplied wishlist/basket merchant, price, title and timestamps with authenticated server capture from current, rights-verified product/offer records.
- Make one private basket and wishlist per account, deduplicate items at database level, and deny browser-side inserts/updates into personal planning lists using restrictive RLS.
- Copy named baskets from the authenticated user's server-stored records, with complete-copy rollback on errors. Preserve ordinary collaborative lists and the separate Saved/Watches areas.
- Strengthen historical snapshot validation, internal-only links, email text sanitization, and the 18-item email-draft overflow explanation. No automated email or merchant checkout.
- Add P0-03 negative regression tests and two-account acceptance runbook. **Outstanding:** CI, production SHA, reviewed migration, actual signed-in cross-account/mobile/browser tests and licensed product fixtures.


## Unreleased documentation / audit addendum (2 November 2026)
- Indexed nine original owner-provided source files using SHA-256, without publishing the confidential source documents or concept art to the GitHub repository.
- Traced 12 granular requirements not obvious from broad feature rows, particularly real natural-language search, explainable Preference Graph, scheduled seasonal campaigns, and PWA/push/native differences.
- Updated roadmap with P1-07, P2-06, P3-06, P4-05, and snapshot-integrity acceptance in P0-03. Read-only database checks reconfirmed baseline; no schema, product, feed or app code changed.
- **Documentation only:** software version remains v0.2.0.

## Original source-to-code audit (2 November 2026)
- Reviewed original master product and grocery PDFs, affiliate, content/Control Centre, analytics, unified source-of-truth and catalogue handovers and brand visual reference against current main, Vercel and read-only Supabase.
- Added `docs/SOURCE_TO_CODE_AUDIT_2026-11-02.md` with source provenance, 25 workstream maturity assessments and data/rights caveats.
- Added `docs/ROADMAP.md` with prioritised P0–P4 work, explicit acceptance gates and preservation of PR #21/#25 dependencies.
- Updated the living status, README and coding-agent entry point. **Documentation only: software remains v0.2.0; no migration, feed, credential or publication state changed.**

## [0.2.1] - 2026-11-02 (PR #38 deployed; database event-write restriction verified)
- Prevent direct client writes to `analytics_events` and `click_events` by withdrawing `anon`/`authenticated` grants and permissive INSERT policies in the reviewed migration.
- Preserve verified outbound merchant redirects but pause recording new clicks until a purpose-specific consent-reviewed server intake exists.
- Add negative regression tests and owner runbook; retain historical records and keep commission separate from clicks.
- CI (lint, build, tests, secret scanning) passed; Vercel production READY at `f81b34f99bf5f95e59aa18efa877ce0292996d7c`. Supabase migration `20261102162756_p0_01_event_write_integrity` applied successfully; effective anon/auth INSERT grants false, old INSERT policies absent, service role maintained. Historical seven clicks remain.
- **Still requires:** direct REST negative test with real anon/auth roles and real authorised merchant-redirect smoke test; visitor analytics is still OFF.

## [0.2.2] - 2026-11-02 (P0-02 source-safety release, deployed)
- Require current source usage, feed, GB territory and source-specific Awin advertiser approval evidence before external ingestion; recheck permissions and emergency controls during the run.
- Fail closed on missing or failed global control reads; require current controls and rights for any eligible public offer, including already-published rows.
- Show reasons for denied Awin runs and blocked source resumes in private Control Centre.
- Include conditional data migration to pause the unapproved Awin registry row while preserving all 4,588 private staged records.
- Add fail-closed rights, advertiser expiry, controls and integrity regression tests.
- CI build, lint, regression tests and secret scanning passed. PR #40 merged at `f7dc24ccf0e3b3101570419d43b7d9b647707361`; Vercel production READY. Supabase migration `20261102170256_p0_02_pause_unapproved_awin` applied: Awin now paused/sync off with 4,588 staged rows intact, five unverified import runs and zero public Awin offers.
- **Still awaiting:** actual advertiser/feed/image permission evidence and real negative/positive provider/owner acceptance checks; no Awin integration activated.

Versions below refer to the Next.js application in `package.json`, not historical v0.8 planning documents. GitHub tags and production SHA are the definitive release record.

## [0.2.0] - 2026-11-02 (main, deployment READY; signed-in customer acceptance pending)
- Merged through PR #34 at commit `79064ac4f24a73459c0506c4a18a4eeb9c07b2b4`, deployed to Vercel production with READY status.\n- Establish a living, versioned feature register and a mandatory check that future change PRs update the changelog/status.
- Add personal wishlist and a single grouped planning basket for approved affiliate offers, using existing private Supabase list tables.
- Allow the customer to save a basket into a named private list, copy the summary and launch an email draft in their own email application.
- Explicitly keep checkout with retailers and label saved prices as captured snapshots. No automated email service or source feeds activated.

## [0.1.0] - Existing baseline (through 2026-11-01)
- Version previously recorded in the application's package metadata.
- Main already includes private Awin staged imports, a Control Centre, eight-network affiliate-readiness planning (PR #33), and promotion approval improvements (PR #20).
- Production baseline verified at `17a73a6fc20ecad2c892d45f2e2c95b82a6087ef`. Earlier project documentation may call the product v0.8; that is a separate historical planning label.
