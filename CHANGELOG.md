## 13 November 2026 · Editorial hero refresh deployed

PR #167, production `50a3e9d3a1fdc2b7457683f2688667b6df0cb2a6`.

## Unreleased · Editorial hero refresh

- Add locally hosted editorial photographs for the Black Friday campaign and the Electronics, Home & Living and Beauty departments. Align seasonal headlines to the content grid and keep mobile copy legible below the photographs.

## Unreleased · Saved offer destinations

- Reopen eligible saved offers from Saved Items, Watches and shared lists through the live offer route. Historical demo slugs still resolve to their labelled examples.

## Unreleased · Mobile search and visual audit coverage

- Make global search visible at phone and tablet widths. Extend the public screenshot audit to search, Wishlist and Comparison Basket, and to 768px and 360px widths.
- Preserve historical Awin diagnostic evidence and the shared offer, Watches and SEO acceptance requirements from PRs #48 and #85.

## Unreleased · Campaign timing and Awin monitoring

- Fix anonymous homepage campaign ordering under the existing column grants, show scheduled/live/ended placements in the Control Centre, and link the UK seasonal calendar.
- Reject empty Awin inventories, require an explicit mode on manual import requests, and show full refresh counts, last-seen dates and stale-check status in the private monitor.

## Unreleased · Warm-premium storefront and mobile shortcuts

- Restore the faceted gradient AVUQO mark in the shared header and footer, move categories and shopping tools directly below the homepage hero, and add Saved and Lists to the mobile dock. The full-site tour remains linked from the homepage.

## Unreleased · Dormant private Tyres UK snapshot-job schema foundation

- Stage additive service-role-only, RLS-enabled `awin_tyres_spec_enrichment_jobs` journal with `blocked` default, explicitly provided feed ID, content-addressed source digest/path and no old-93988 auto approval.
- Add migration security contract tests and controlled live RLS/grant/empty-table verification checklist.
- No worker RPCs, cron, supplier snapshots, price mutations or publication; PR #117 stays open until further runtime safety acceptance.

## 13 November 2026 · Tyres UK owner-only read-only worker preflight deployed

- PR #155 merged and Vercel production READY app SHA `5954beb29fc849dc9368991fdce6ba2db5a3b063` at `www.avuqo.com`; quality/security tests passed.
- Added owner-only read-only `automation_preflight` with private job-table/bucket checks, readiness blockers and permanent `ready_to_enable:false` pending independent acceptance.
- Live DB confirms existing private bucket but absent V2 job table/RPCs; Awin remains paused/sync off. No migration, scheduled worker, provider feed download, historical price updates, source rights or public publication changed.
- Historical PR #117 remains open pending controlled migration, lease/retry, feed identity and storage-retention validation.

## Unreleased · Read-only Tyres UK automatic worker readiness preflight

- Add owner-only `automation_preflight` action to existing private tyre-spec API and Control Centre to show whether snapshot-job table and bucket are available, without invoking any worker, querying private feed URL or changing data.
- Direct Supabase audit confirms private snapshot bucket, missing job table/functions and paused sync-off Awin source; record blocking migration, feed proof, runtime/lease and retention tasks.
- Keep PR #117 worker intentionally unmerged/off, no automatic cron, migration, environment change, price/fitment/publication changes.

## 13 November 2026 · Tyres UK private candidate validator deployed

- PR #153 merged and Vercel production READY SHA `7c8619352d5458a1c1ce69c3dc5f4960a813a3d2`, domain `www.avuqo.com`.
- Strict source schema and description-matched technical candidate extraction, returning no price or publication approval; owner tyre Control Centre states automatic worker not enabled.
- Full old PR #117 migration/worker remains unmerged/disabled; Awin source paused, no cron added, existing Pneus schedule unchanged. No new public products or feed/photo rights.

## Unreleased · Private Tyres UK current-snapshot candidate validation

- Selectively port the safe, pure current-feed schema and description-cross-checked technical candidate logic from old PR #117 to current main; candidate output excludes prices and all fitment/publication approvals.
- Make the owner-only tyre Control Centre show automatic enrichment as **not enabled** and retain original exact-file manual recovery.
- Add tests for invalid/cross-advertiser rows, conflicting load/speed, wrong currencies, no returned price and absence of automatic cron.
- Do NOT port/enable old worker or migration until live Supabase job tables, storage leases and existing Pneus cron can be safely reconciled. Old PR #117 stays open.

## 13 November 2026 · Tooled-Up Awin joined-programme currency diagnostic deployed

- PR #151 merged; protected, read-only `/api/internal/awin-tooled-up-currency` with Awin source paused/joined guard and exact advertiser 496 `currencyCode`; Vercel READY `36b2840a159db2d274c38837dcdef9dc02333aac` on `www.avuqo.com`.
- Old PR #102 closed as superseded; historic 496:89987 feed ID not assumed current, and **no live Awin currency response has been observed**.
- All product, image and feed rights remain unverified and publication disabled; no DB writes, source changes or importer activation. Tests/secret scan passed.

## Unreleased · Tooled-Up Awin GBP programme currency verification

- Port old PR #102's protected, read-only joined-programme `currencyCode` inspection to current main without reactivating deleted historical Tooled-Up feed IDs.
- Return strictly programme-only GBP evidence; hard-code no feed activation, price confirmation, product staging, image rights, public offer publishing or database writes.
- Use 15s timeout, bounded provider response, fail-closed ambiguous/missing currency handling; test source gating, non-GBP outcomes and no-write invariants.
- Actual Awin API invocation with live credentials and current replacement-feed permission remain unverified.

## 13 November 2026 · Cadbury and Petlibro terms visible in production

- PR #149 merged, Vercel READY `b6b6a93f7da3837f02d004cade0ec1fee52715a8` on `www.avuqo.com`, old PR #51 closed as superseded.
- Private owner retailer Control Centre now explains documented sale/PPC/territory/commission restrictions and outlines evidence required before using Awin data or photographs.
- Preserve historical source-provenance and current permissions uncertainty. Rights gates unchanged, no merchant feeds activated or public images/offers released.

## Unreleased · Cadbury and Petlibro merchant terms visibility

- Preserve historical owner-supplied Awin Cadbury/Petlibro programme terms summary from stale PR #51 in current repo with explicit provenance limitation.
- Surface commercial restrictions and evidence checklist inside private Retailers Control Centre, including Cadbury sale-category exclusion and branded PPC, Petlibro GB delivery exclusions, PPC/CSS and disputed rates.
- Add source-rights and private-owner-view regression tests. **No image/feed republication approval, source activation, imports or public offer release.**

## 13 November 2026 · Awin numbered private CSV importing deployed

- PR #147 merged with Vercel READY app SHA `ba25af858c203df11713c4496276b2d38d4caa22` on `www.avuqo.com`. Historical PR #58 closed as superseded.
- Handle Chrome/Windows duplicate-numbered Craft Buddy Google-format Awin CSV names for parser selection without guessing advertiser identity from filename.
- Show distinct errors for invalid `.csv`/`.csv.gz` extension, upload over 8 MB, empty file.
- Retain owner/admin and verified joined-advertiser selection, row-by-row merchant identity, private-only import and unverified publication status; no feed imported or products published.

## Unreleased · Awin numbered CSV owner-upload safety and clarity

- Support Chrome/Windows ` (1)`, ` (2)`, ` (10)` duplicate suffixes for correctly selecting the Craft Buddy Google-format Awin parser; general extension acceptance already covered numbered Cadbury/Petlibro filenames.
- Return precise file-extension, 8MB-size and empty-upload errors rather than one misleading combined error.
- Retain newer owner-selected joined advertiser, private staging and row-by-row identity checks; never infer merchant rights from filename. Reconcile conflicting historical PR #58 rather than merging it wholesale.
- Add tests for malicious filename variations, exact format selection, private merchant validation and error messages.

## Unreleased · Awin HTTP provider error redaction
- Replace raw failed Awin provider response snippets/status text in thrown feed connector errors with numeric HTTP status only, carrying forward security intent from old PR #50.
- Add CI regression test; leave credentials, importer, publication, image rights and feed status untouched.
## 13 November 2026 · 119 historical branches safely removed
- Verified PR #143 deleted 16 merged PR #127–142 branch refs.
- Verified PR #144 deleted 103 older branches after exact frozen merged-PR last-commit and head SHA comparisons. Count now 26 including main and 2 cleanup branches, down from 143 before task (plus task-created branches).
- Preserved all 11 open PRs, original AVUQO design assets, security references and unmatched code. Final cleanup PR #145 will prune merged housekeeping branch heads if unchanged; verify final count.

## 13 November 2026 · First merged branch cleanup completed, second staged
- PR #143 merged; GitHub verified 16 safe merged PR #127–142 branch heads deleted. 144 branches including cleanup branch fell to 128; open PR heads and original warm-premium sources retained.
- Add narrowly validated historical PR #1–126 cleanup workflow with frozen final PR commit verification, no-open-PR, no branch reuse and protected/reference branch exclusions. Candidate must pass tests and confirm deletion before claiming its outcome.

## Unreleased · GitHub safe merged-branch clean-up
- Inventory all 143 pre-task GitHub branches and map 11 open PR branch heads to protected/unresolved work.
- Add guarded GitHub Actions cleanup of 16 recent merged PR #127–142 branches only if branch HEAD SHA exactly matches frozen merged PR, no other open PR uses it and branch is not protected; provide manual dry-run mode and GitHub summary.
- Preserve original visual reference and source branches plus all unreviewed Awin, eBay and tyre safety changes. Deletion status requires subsequent verification.

## Unreleased · Remove generic homepage flash before correct seasonal page
- Replace old `HeroPlaceholder` in streamed Suspense fallback with neutral accessible responsive loading shell; correct UK date-specific hero remains determined by `editorialSpotlight(new Date())` per request.
- Add regression test guarding against ever displaying the obsolete living-room hero as a loading state.


## 13 November 2026 · Screenshot-driven homepage fix deployed
- PR #140 deployed READY as app commit `e310af5a6ac49b00a01f7742c8d6a3664ebb5cf5` to `www.avuqo.com`.
- Replaced nonexistent department sprite URL with editorial photo tiles, simplified to one automatic seasonal hero, corrected hero scale/alignment, removed owner private CTA from homepage while preserving role-gated navigation.
- Live HTTP markup reconfirmed; post-deploy image render/mobile browser signoff remains pending. No Awin/eBay/tyre source permissions changed.


## Unreleased · Homepage screenshot corrections
- Correct blank department image tiles caused by an absent sprite asset: use editorial category photography rather than licensed merchant products.
- Remove duplicate seasonal homepage banner while keeping the automatic UK-date Black Friday/Christmas/Easter main hero.
- Adjust hero headline scale, content alignment and responsive layout; keep existing evidence-first panel and CTAs.
- Remove private storefront CTA from the public homepage composition; owner-only navigation/control-centre access remains.

## 13 November 2026 · Production screenshot QA mechanism deployed
- PR #138 merged with production READY commit `08459b492fa8c9497b94cee933d9fa08dec0f01c`, alias `www.avuqo.com`.
- Public desktop/mobile screenshot audit for 28 production routes enabled via GitHub Actions; no customer code, data or permissions modified.
- Actual screenshot report/artifact review and human visual acceptance still pending; investigate the workflow run before marking visual design complete.


## Unreleased · Automated public production screenshot audit
- Add read-only headless Chrome checks and desktop/mobile screenshots for 28 real public production routes, rather than relying on HTTP-only verification.
- Add a GitHub Actions on-demand/weekly workflow, triggered on first merge, with downloadable screenshots and Markdown/JSON evidence report; measure horizontal overflow, missing H1, broken HTML images and page errors.
- Keep Control Centre, private previews and signed-in personal data out of screenshot automation. Original design boards remain reference-only; no fake product evidence added.
## 13 November 2026 · Automatic seasonal homepage deployed
- PR #136 merged: UK-year-round editorial calendar selects real homepage photographic hero, copy and CTA at the correct UK date per request, plus companion seasonal editorial module.
- Christmas, Black Friday, Easter, Valentine's, Mothering Sunday, Father's Day, Halloween, back to school, spring/summer/autumn and winter sales; dynamic yearly date calculations and DST regression tests.
- Owner-only `/control-centre/seasonal-calendar` shows current and future year dates, read-only with existing access gate.
- Application deployment `da22e97c6fdad31d23e6c972e0a39239e689d8fb` READY on `www.avuqo.com`, November Black Friday hero independently verified. 28 public URLs HTTP 200/shared branding. Full browser screenshot QA remains pending; no live retail promotions/image licences inferred.


## Unreleased · Automatic UK homepage seasonal calendar
- Extend seasonal editorial schedule into a year-round Europe/London calendar including Christmas, Black Friday, Valentine's, Easter, Mother's Day, Father's Day, Halloween, school season, spring, summer and autumn.
- Change real `/` homepage photo, headline and primary CTA to current UK theme on request. Keep existing sponsored placements and verified product admission separate.
- Add `/control-centre/seasonal-calendar` owner-only current/next-year read-only calendar, linked from Control Centre.
- Remove hard-coded 2026 Black Friday editorial copy; introduce DST, Easter and multi-year regression tests.
- Audit 28 customer routes through authenticated production HTTP fetch (status 200; visual screenshot acceptance not implied).
## 13 November 2026 · Sitewide warm-premium design verified on production
- PR #134 merged; Vercel application release `45da7456b66f6fa21d25753c39e497203f26c7ed` READY on `www.avuqo.com`, deployment `dpl_9fAgyrGS1Nz2Fh8Q7nyFjmVpEvG5`.
- Shared branded A-lockup and tagline, navigation/mobile/footer, category, public product index/detail, seasonal and travel/lifestyle presentation updated on real routes. Existing public offer and image-rights checks remain unchanged.
- Owner reference screenshot acceptance remains a distinct uncompleted check; no Awin/eBay/tyre live-price/source publication is asserted. The final exact Vercel SHA may change when this handover-only record deploys.


## Unreleased · Live website visual completion pass
- Complete warm-premium AVUQO shared header, mobile navigation and footer brand lockup without altering auth, search or Control Centre access.
- Bring real category, product index/detail, seasonal and travel/lifestyle page presentation into consistent premium responsive styling.
- In `/products`, show only independently approved `published.image_url` from the verified-source product index and retain a neutral placeholder for all other products.
- Register pixel-fidelity/manual desktop/mobile QA as a separate acceptance gate. No private Awin/eBay/tyre offers or photographs become public via this style change.

## 13 November 2026 · Verified live code and restart handover
- Reconciled PRs #129–#132 as merged; latest live Vercel READY deployment at `ab055f73acce9a478075c61aecb0b7b248d101d3` on `www.avuqo.com` (as-of observation, must be refreshed on every new release).
- Added canonical root `AVUQO_START_HERE.md`, readable `docs/AVUQO_LIVE_HANDOVER.md` and structured `docs/AVUQO_CURRENT_STATE.json` so new connected chats can read the real GitHub project state without relying on conversation text.
- Added mandatory check of current GitHub/Vercel/Supabase, open PRs and live-vs-private gates to contributor/assistant instructions.

## Unreleased · Restore photographic homepage hero in production
- Reconstruct original full-bleed photo-led warm premium storefront with readable overlay, hero Compare/Sales CTAs and evidence-first shopping panel on actual homepage.
- Keep current approved product, navigation and editorial source controls. Add responsive and no-fabricated-score CI test.

## Unreleased · Restore full original premium storefront to live homepage
- Recover `StorefrontQuickLinks` and `HomeShoppingDashboard` with responsive original CSS from `feature/warm-premium-experience-v1-20261105` and render on public homepage, not a preview.
- Keep existing new sections, verified-only product index and honest editorial fallback when retailer offers are not approved.
- Record precise mockup PNG source branch and release safety checklist; add CI regression tests.

## Unreleased · LIVE production shopping journeys and partner roadmap
- Add a photo-led Compare and Discover bargains section directly to the real public homepage, linking to existing real production destinations. No fictional offers or score data.
- Record versioned provider leads and API/access conditions for UK supplier/dropshipping platforms, holiday and activity search, golf trips, travel insurance and regulated UK comparison.
- Locate the original warm-premium mockup reference paths in Git and define production, mobile, image-rights and data-integrity acceptance gates. Add CI regression coverage.

## Unreleased · Awin inventory and image evidence
- Extend owner-only retailer onboarding with stored private image URL coverage, without loading or publishing retailer photos.
- Reconcile Awin feed export and newly observed PlayPress Toys UK programme and feed IDs without committing private download URLs.
- Document AVUQO's single-catalogue Compare + Bargain Discovery strategy and rights-first launch sequence. Existing `/preview/products` remains the production-hosted owner view for layout testing.
# AVUQO software changelog

## [0.5.1] - 2026-11-13 (verified production, eBay Sandbox and Awin retailer onboarding)

- Fixed the pre-existing owner-only eBay UK Browse pilot to use environment-specific Sandbox App ID/Cert ID instead of always calling Production endpoints. Default remains Sandbox, with real UK production Browse gated behind a separate keyset and explicitly recorded restricted API approval.
- Added owner-only `/control-centre/retailers`: real Awin joined-programme observations, private imported rows, feed freshness and independent permission flags, plus eBay private preview setup and keyset/partner approval guidance.
- Preserved original eBay seller/private-product review, hidden image choice, no automatic eBay imports, no public eBay checkout, no source activation, and unchanged canonical source/offer publication gating.
- Added regression tests for keyset isolation, limited production permissions, safe eBay affiliate URL detection and admin-only read-only retailer onboarding.
- Onboarding reference: `docs/AVUQO_V051_AWIN_EBAY_ONBOARDING.md`; Vercel credentials required from owner before real Sandbox API testing. No secret or production feed permission granted by this code change.
- **Production verified:** PR #127 merged as `f8c0eb92`, Vercel `dpl_DaokykruBiQBXm7E3SYqF1L2dXfu` READY, release route smoke tests and private page safeguards verified. eBay OAuth cannot be exercised until owner creates and installs Sandbox keys.
- Source audit: 16 historically joined Awin programmes with advertiser-level `feed_permission_confirmed=false`, 122,309 existing private feed rows, and no eBay credential env vars. Old Tooled-Up feeds replaced by `awinnew`, and mytyres.co.uk application rejected. New live goods are therefore **not** represented as imported or approved.


**Production verified 13 November 2026:** PR #125, SHA `4b9231f173db8d3d42cc150cc0d16e0c96092259`, Vercel `dpl_tCLBPtevXFWNGHr65sZo8kvSVNrN` READY, all live smoke routes HTTP 200, both owner dashboards gated while signed out. Real licensed supplier goods and social/advertiser publication remain disabled pending external approvals.

## [0.5.0] - 2026-11-10 (marketing, tyre and all-category product readiness release candidate)

- Complete 25 distinctive warm-premium category-specific product shopfronts at `/categories/[department]/products`, opening safely without fake offers and automatically admitting real approved products through the unchanged public supplier-rights/freshness gate. Link them from Marketplace Shop and the main /products directory.
- Add departmental buying-guidance panels to existing canonical individual product pages, with exact source-category assignment and truthful instructions for 25 product families.
- Complete the plum tyre customer system with `/tyres/find` exact size/manufacturer finder, `/tyres/compare` two-model comparator, `/tyres/products/[slug]` exact product page and 1/2/4 tyre unit-price subtotals with no fabricated fitter/fitment quote. Integrate these destinations into the existing showroom, brand, type and size guides.
- Add protected read-only `/control-centre/tyres` for source, private import, technical verification, product admission and retailer-release review.
- Reuse four-brand marketing studio, AI-reviewed creative, draft automation, owner approvals and Buffer delivery gates; create `/control-centre/marketing/readiness` for explicit live per-brand facts, channels, emergency stop, provider reconciliation and Pinterest/email integration gaps. No new social account connection or unattended publication.
- Add `/advertise` premium enquiry/integrity guide with no rate card, payment or delivery implication; connect to existing private site-advertising owner workflow.
- Add new source/variant/independence safety tests, preserve original v0.4.1 warm-premium design and the permanent GitHub Compass, and document remaining source/rights/provider dependencies in `docs/AVUQO_V050_MARKETING_TYRES_ALL_CATEGORY_RELEASE.md`.
- **Safety:** no migrations, database writes, commercial source activation, fake product prices/scores/reviews, ad serving, automatic email, Pinterest/social publishing or vehicle-fitment approvals. CI/preview/production validation still required before claiming a live release.


## [0.4.1] - 2026-11-10 (production verified; manual signed-in visual acceptance pending)

- Bring original approved Warm Premium AVUQO design identity, page blueprints, full token file, image register and screenshot manifest from its unmerged design branch into the current source of truth. Index all ten new user screenshots and other uploaded design/source files.
- Create permanent root `AGENTS.md` guidance, `docs/AVUQO_PROJECT_COMPASS.md` and README start-here links so future GitHub-connected chats can inspect context and branch/release state before coding.
- Restore a full photographic seasonal editorial system and missing Easter/Valentine's pages, retain current Christmas gift-finder plus privately approved Crafts products, and reintroduce festive discovery/planning panels.
- Add automated UK-calendar seasonal homepage inspiration (Black Friday, Christmas, Valentine's, Easter and January sales). This updates only editorial stories and links, **never public product offers or advertising**.
- Add warm user-first My AVUQO account overview with real signed-in Saved/Watches/Lists counts, never fictional screenshot numbers. Preserve existing preferences update functionality.
- Restore original warm-premium Saved, Watches and Lists layouts using existing RLS-scoped account records. Show saved prices as historic snapshots; Watches do not promise unverified automated email or price-drop alerts.
- Add owner seasonal status and read-only Design System reference page, both in the existing Control Centre, with links to current site-advertising, marketing, source and approval workspaces.
- Add GitHub CI regression tests and sitemap/footer links; no new migrations, source activation, retailer-image rights, ads, social post scheduling, pricing claims or account surveillance.
- **Verified production:** GitHub PR #123 merged at `36c8a6f4`, Vercel `dpl_29DGCrLWzMAbT7FRimMBLWFx4U9k` READY and aliased to www.avuqo.com; public route HTTP checks successful and signed-out admin access-guard verified. **Still open:** authenticated owner-browser and physical mobile/desktop visual QA and full screenshot-to-implementation parity.


## [0.4.0] - 2026-11-09 (unified marketplace + Source Atlas release candidate)

- Unify public AVUQO Explore, Shop, Compare and Who's Who journeys across the homepage, all 25 editorial category families, existing specialist category pages and mobile navigation.
- Build premium Marketplace homepage, Who's Who business discovery with approved-public-offer gate, sector-specific comparison hub and missing editorial category detail routes.
- Add owner-only read-only Marketplace Operations and Source Atlas dashboards covering 25 taxonomy roots, all source connectors, supplier private imports, catalogue/evidence states, grocery and travel records, system controls and content publication state.
- Preserve source-rights, private-feed and live offer verification gates, existing Control Centre management actions, legal rules and pricing independence. No data migrations or new feed activation.
- See docs/AVUQO_UNIFIED_MARKETPLACE_SOURCE_ATLAS_V0_4_0.md for complete 9 November source audit, acceptance checklist and unimplemented dependencies.


- **Unreleased draft: Pneus Online UK second-tyre private importer (9 Nov 2026):** Secret-authenticated, daily rights-gated Awin feed snapshot worker and owner phone-facing status page, reusing private storage and resumable 250-row checkpoints; CI source-gate and merchant-identity tests. Disabled by default and blocked by missing actual feed permission evidence. No Awin products or offers imported, no publication rights granted.


- **Unreleased draft: AVUQO Tyres V1 comparison contract (9 Nov 2026):** Freeze premium tyre design palette and page rules, document safe second tyre supplier (Tyres Pneus Online UK) private-first onboarding, exact variant identity, provenance, marketplace deduplication, and full-cost delivery/fitting comparisons. Add pure TypeScript admission helpers and negative evidence tests only; no feed imports, public prices or activation.



## [0.3.1] - 2026-11-09 (production deployment READY; manual mobile acceptance pending)

- Launch an editorial premium AVUQO Tyres showroom using original first-party vector artwork, refined plum/coral branding, responsive design and accessible native tyre size controls.
- Add an educational tyre size journey, noindex manufacturer directory and tyre-type buying guides. The size tool explains dimensions; it does not claim vehicle-fitment or live tyre prices.
- Build an owner-only real-feed tyre showroom with full private manufacturer and size search, tyre-specific product evidence and image opt-in; protect all staged supplier records behind the existing owner/admin gate.
- Extend only the existing verified-offer product pipeline with a tyre-specific template. Safety-critical technical specifications are hidden unless an explicit canonical verification flag is present.
- Keep all historical supplier tyre offers, images, rights decisions, prices, registration lookup and fitment approval private or deferred. No supplier source activated, no database migration, and no automatic feed import enabled.
- Include responsive, public/private isolation and technical-candidate regression tests. GitHub CI and Vercel preview passed. Production deployment `dpl_Dank3dPU1mk8kudb83BAq3wpAb9R` on main merge `b15a0209` is READY and aliased to www.avuqo.com. Manual signed-in/mobile acceptance is still pending.

## Unreleased


- **Approved-product tyre template (draft):** Public canonical `/products/[slug]` chooses a tyre-specific buying experience only for a product classified in a verified tyre category; specification fields remain hidden unless an explicit `tyre_specs_verified` flag is recorded. No staged tyre data becomes a public offer.

- **Draft tyre showroom and manufacturer/category pages (9 Nov):** Create responsible public tyre buying hub plus noindex manufacturer/tyre-type guides; build owner-only exact-size and full brand browse, tyre-specific product panels, historical price labels and private images behind opt-in. No public feed products, fitment, fresh offers or merchant permissions activated.


- **Unreleased Awin feed discovery matrix:** Owner feed inventory displays all 16 joined programmes, format-group counts and zero-feed programmes, plus a filtered credential-free metadata CSV copy. Does not download feeds or merge overlapping records.

- **Awin import hardening:** Add before-upload feed dialect and row-inspection diagnostics, align TSV server acceptance, live joined-programme revalidation on resume, strong source feed-ID binding at DB layer, and service/contract feed quarantine. Existing physical Awin private imports unaffected. No public or automatic activation.

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


### 2026-11-13 — Whole-site public AVUQO tour (candidate)
- Added a customer-facing `/explore-avuqo` tour linked directly from the homepage, pointing to existing shopping, comparisons, deals, groceries, motoring, travel and My AVUQO routes.
- Included in sitemap and quality regression tests; no external offer/source rights, private owner data or automation changed. Production release pending checks.


### 2026-11-13 — Whole-site public AVUQO tour verified live
- PR #159 merged, code `58355149ef69e82924a00c6866b0859a7483234a`, Vercel production READY `dpl_GVkTsnRpkWTc2p79DwUXD4EvhUEX` with `www.avuqo.com` alias. Public tour, homepage entry and sitemap HTTP 200 verified. No source activation or publication changes. Desktop/mobile screenshot sign-off pending.
