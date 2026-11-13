# AVUQO PROJECT COMPASS · START HERE IN EVERY NEW CHAT

**Last reconciled: 13 November 2026, after v0.5.1 production verification.** Project: `crkian/AVUQO`, Supabase `tfoukwcruaamrtgxzshh`, Vercel `avuqo`, public site `https://www.avuqo.com`. This is an evolving operational handover, **not** an instruction to trust a stale commit or to assume production is healthy without checking.## VERIFIED AUTOMATIC SEASONAL RELEASE · 13 November 2026

PR #136 **deployed to production**, feature SHA `da22e97c6fdad31d23e6c972e0a39239e689d8fb` READY on `www.avuqo.com` (Vercel `dpl_Cj21PogF2EaRPrJ3PfQSv7ySKsmq`). The live November homepage was independently fetched and displays Black Friday hero and image. UK-date scheduling is request-time for main headline/art/CTA and related editorial panel, with recurring calendar in Control Centre `/control-centre/seasonal-calendar`. 28 public URLs passed an HTTP 200/shared-brand-markup check but **visual pixel fidelity and authenticated browser interaction are unverified**. See `docs/AVUQO_AUTOMATIC_UK_SEASONAL_CALENDAR_AND_PAGE_AUDIT_2026-11-13.md`. Supplier/publication gates stay intact. Subsequent docs-only releases can produce a new latest READY SHA, so recheck.


## UK automatic seasonal homepage candidate · 13 November 2026

Branch `feature/automated-uk-seasonal-home-calendar-20261113` extends the **existing** editorial schedule, not sponsored marketing automation. Real production `/` hero uses current UK date to select artwork, headline and CTA, with server request-time evaluation and year-round fallback; the owner-only `/control-centre/seasonal-calendar` shows UK calendar windows. Fixed-date events and moving Easter/Mothering Sunday/Father’s Day/Black Friday are handled by central `lib/editorial/seasonal-date.mjs`. Approved advertiser campaigns, affiliate image rights, eBay Production API rights and tyre publishing gates remain separate and unchanged. Baseline 28 production routes returned HTTP 200 and shared AVUQO branding, but desktop/mobile **visual screenshot QA is not yet proven**. See `docs/AVUQO_AUTOMATIC_UK_SEASONAL_CALENDAR_AND_PAGE_AUDIT_2026-11-13.md`. Verify CI, merged exact SHA and Vercel READY before marking deployed.

## VERIFIED SHARED DESIGN RELEASE · 13 November 2026

PR #134 has now **merged and deployed**. Production feature SHA `45da7456b66f6fa21d25753c39e497203f26c7ed` was observed READY on `www.avuqo.com` with Vercel deployment `dpl_9fAgyrGS1Nz2Fh8Q7nyFjmVpEvG5`. Shared AVUQO branding and responsive chrome, real categories, rights-gated public product images and product details, seasonal and lifestyle/travel visual treatment are part of the site. **Not a claim of full pixel-perfect screenshot matching or newly approved retail feeds.** Owner desktop/mobile screenshot review is still required, and any correction must use current `main` rather than wholesale merging old branches. See live handover and structured JSON for current state; subsequent docs-only production deployments can carry newer SHAs.


## Current production design completion candidate · 13 November 2026

Current branch `feature/restore-header-branding-production-20261113` selectively finishes warm-premium styling on real production Header/Footer, `/categories`, `/products`, `/products/[slug]`, seasonal pages and LifestyleLanding travel/shopping routes. It preserves all newer Awin, eBay, tyres, customer/auth and Control Centre source code, and public imagery still requires explicit `image_rights_confirmed` source verification. See `docs/AVUQO_PRODUCTION_VISUAL_COMPLETION_PASS_2026-11-13.md`. Candidate must pass CI and Vercel production READY before stating live. Full visual pixel fidelity to archived images requires owner screenshot review after deployment.

## CURRENT VERIFIED HANDOVER · 13 November 2026 (read first)

**Canonical entry:** `AVUQO_START_HERE.md` → `docs/AVUQO_LIVE_HANDOVER.md` → `docs/AVUQO_CURRENT_STATE.json`. Previous sections below describe historical candidates and may say “pending” even though the changes shipped. On 13-Nov the **latest production READY** deployment on **www.avuqo.com** was Vercel `dpl_9AM8Hx9BPW2uHi9ZbswAQykbTaij`, exact SHA `ab055f73acce9a478075c61aecb0b7b248d101d3`. PRs **#129–#132 merged**: private Awin feed/image evidence board; Compare+Bargains and partner roadmap; fuller original shopping dashboard; full-bleed photo-led hero. The main mockup collection remains in historic design branch and whole-site visual restoration is incomplete. **Do not claim Awin/eBay/tyre merchant public offers or licensed images live** solely from a UI deployment. Recheck current GitHub main and Vercel before relying on this snapshot. 11 older PRs remained open as-of review.

## Original hero restoration follow-up · 13 November 2026

The next code candidate restores the photographic storefront hero and evidence-first shopping intelligence panel from `feature/warm-premium-experience-v1-20261105` to the real production homepage, using the existing AVUQO editorial photo source. Numerical mockup scores, invented price drops, and images from private merchant imports remain excluded; the original design target remains in `design/warm-premium-visual-system-20261105`. See PR attached to `feature/restore-photographic-home-hero-20261113` for exact release validation.

## Original full visual version FOUND · 13 November 2026

The original rich AVUQO visual concept PNGs and `ASSET_MANIFEST.json` exist on `design/warm-premium-visual-system-20261105` under `docs/design/mockups/` (the PNGs were missing on `main` when checked). Original coded home exists on `feature/warm-premium-experience-v1-20261105`: `app/page.tsx`, `HomeShoppingDashboard`, `StorefrontQuickLinks` and complete styles. Restore these selectively to current production, never overwrite newer safety features by merging the historical branch wholesale. `docs/AVUQO_FULL_STOREFRONT_RECOVERY_2026-11-13.md` tracks what was brought forward and remaining graphical fidelity. Customer website must use real `/` and other public routes, not only `/preview/*`; no fictional product prices/scores may be transferred from mockup pixels.

## Next production direction · 13 November 2026

The owner has explicitly chosen **one AVUQO catalogue for Compare + Discover Bargains**, and requires the warm-premium editorial look from the original mockups on **real production pages, not only preview routes**. The delivery source is `docs/AVUQO_LIVE_PRODUCTION_PARTNER_AND_DESIGN_BACKLOG_2026-11-13.md`, including actual reference design paths in `docs/design/`, a prioritised dropshipping/affiliate/holiday/golf-travel/insurance partner pipeline, image and data-rights gates, and real-domain production acceptance. Current mockups are design references and include fictional prices/score badges that must not be copied into public claims. External provider API offering does not mean AVUQO has access. eBay Production approval pending; Awin private-imported images/offers remain rights gated.

## Archived 0.5.0 candidate plan (implemented and production verified 13 Nov 2026)

Branch: `feature/marketing-tyres-all-category-product-readiness-20261110`. Read `docs/AVUQO_V050_MARKETING_TYRES_ALL_CATEGORY_RELEASE.md` for full code paths, current source audit, feature gates, CI/preview status and exact remaining dependencies. Adds all 25 photographic department product showrooms, category-specific canonical product details, tyre finder + two-model comparison + exact individual tyre model pages and product unit subtotals, marketing launch readiness for four brands, a protected tyre supplier operations dashboard and a transparent public `/advertise` enquiry page. **Product/tyre goods, Pinterest and social posting, fitting quotes, direct ad booking and email distribution remain unavailable until explicit rights, provider connections and verified data.** These features are now production verified at the v0.5.0 commit recorded above. Commercial source and marketing gates remain inactive.

## eBay/Awin retailer intake v0.5.1 · deployed and verified

Branch `feature/ebay-sandbox-awin-retailer-readiness-20261113`. Read `docs/AVUQO_V051_AWIN_EBAY_ONBOARDING.md`. AVUQO already had `/preview/ebay` owner-only UK Browse API pilot; this update correctly uses **separate Sandbox and Production keysets** and defaults private tests to Sandbox. A Production keyset does not grant restricted eBay Buy API approval. The owner-only `/control-centre/retailers` now consolidates real 16 historically joined Awin programme observations, private imported product and feed counts, and permission gaps alongside eBay setup. **No eBay credentials are present in Vercel at audit**, no real eBay or Awin goods have been publicly admitted, all 16 Awin per-advertiser feed permissions were `false`, and source registry rows remain paused. The current source audit also identified withdrawn old Tooled-Up feeds and a rejected mytyres Awin programme application. Do not conflate private historical imports with live public offers or claim completed Sandbox OAuth testing until the owner configures keys and verifies results. Release verified in the production record above; external keysets and supplier/publication approvals remain outstanding.

## Verified latest production release

**AVUQO `0.5.1` VERIFIED PRODUCTION RELEASE (13 Nov 2026):** PR #127 merged as `f8c0eb92b740ba010a88ae8b097490241b4aadb6`; Vercel production deployment `dpl_DaokykruBiQBXm7E3SYqF1L2dXfu` READY. GitHub quality (build/lint and eBay/Awin safety suites) and committed-secret prevention passed on final PR head. Live `www.avuqo.com` returned HTTP 200 using the exact production deployment for `/products`, `/categories/tech/products`, `/tyres`, `/preview/ebay`, `/control-centre/retailers` and `/control-centre/feed-imports`. Owner pages do not display private eBay/onboarding content to a signed-out request. Sandbox/Production OAuth routing is now isolated, a separate production Browse approval gate is enforced, and 16 historically joined Awin observations and private feed reviews are visible through the existing owner controls. **Not claimed complete:** actual Sandbox OAuth tests (Vercel eBay credentials absent at audit), eBay Buy API production approval, current Awin advertiser-specific publication/image rights (all recorded false), any real eBay/public Awin product publication, or external partner account acceptance. User must create the eBay Sandbox keyset and configure the two server-only Vercel secrets. See `docs/AVUQO_V051_AWIN_EBAY_ONBOARDING.md`.



**AVUQO `0.5.0` VERIFIED PRODUCTION RELEASE (13 Nov 2026):** PR #125 merged via squash commit `4b9231f173db8d3d42cc150cc0d16e0c96092259`. Vercel production deployment `dpl_tCLBPtevXFWNGHr65sZo8kvSVNrN` reached READY. The exact release head passed GitHub quality checks and prevented-secrets scan after the final JSX and tyre-guide wording fixes. Live `www.avuqo.com` verified HTTP 200 for `/products`, `/categories/tech/products`, `/categories/baby-nursery/products`, `/categories/insurance-finance/products`, `/tyres`, `/tyres/find`, `/tyres/compare`, `/tyres/brands/michelin` and `/advertise`. Signed-out `/control-centre/tyres` and `/control-centre/marketing/readiness` display access verification rather than owner data. **Live software is ready for eligible goods, not falsely populated:** the sampled category showrooms correctly report zero approved offers; previous source/rights/tyre fitment gates and marketing emergency stop are unchanged. Authenticated owner/mobile visual acceptance, real suppliers, paid ads, Pinterest integration, approved email or autonomous marketing remain unverified or unavailable. The original user-supplied screenshots are creative references, not verified retail prices. See `docs/AVUQO_V050_MARKETING_TYRES_ALL_CATEGORY_RELEASE.md`.



**AVUQO `0.4.1` RESTORED WARM-PREMIUM DESIGN PRODUCTION RELEASE (10 Nov 2026):** PR #123 merged at `36c8a6f4325b873044f13ba9ea39f8823a83612a` and Vercel production `dpl_29DGCrLWzMAbT7FRimMBLWFx4U9k` reported READY, assigned to `www.avuqo.com` (apex redirects to www). GitHub lint/regression/build and secret scan passed on final reviewed PR head. Production HTTP 200 verified for homepage, Christmas, Easter, Valentine's, Black Friday, Sales, Account, Saved, Watches, Lists; signed-out Design System and Seasonal Control Centre URLs display sign-in verification, not owner data. Vercel reported no runtime errors in inspected route/time window. **The original warm-premium source documents and all 16 user screenshot references are indexed in `docs/design/AVUQO_VISUAL_REFERENCE_INDEX_2026-11-10.md`; root `AGENTS.md` points to `docs/AVUQO_PROJECT_COMPASS.md` for every future coding session.** Safe UK seasonal editorial rotation, image-led seasonal pages, genuine My AVUQO overview and restored Saved/Watches/Lists layouts are deployed. No feed/ads/social worker activation or migrations. **Still open:** authenticated owner-browser and physical 360px/desktop visual acceptance, full pixel parity of homepage/category/product screenshots, real merchant licence and quote/score evidence, production alert/advertiser automation. Do not label those completed.

## First actions for any new AVUQO development conversation

1. **Read this compass and root `AGENTS.md`**, followed by `docs/design/AVUQO_WARM_PREMIUM_VISUAL_IDENTITY_2026-11-05.md`, `docs/design/AVUQO_PAGE_BLUEPRINTS_AND_DESIGN_COVERAGE_2026-11-05.md` and `docs/design/AVUQO_VISUAL_REFERENCE_INDEX_2026-11-10.md`.
2. Fetch **current** `main` commit, open PRs, live Vercel production SHA, and read-only Supabase data/permissions before modifying code. Any statements below about state are historical observations.
3. Review `docs/PROJECT_STATUS.md`, `CHANGELOG.md`, `docs/AVUQO_UNIFIED_MARKETPLACE_SOURCE_ATLAS_V0_4_0.md`, `docs/tyres/AVUQO_TYRES_DESIGN_COMPARISON_CONTRACT_V1.md` and relevant original specs.
4. Work from current `main` on a branch, avoid replacing current files with historical branch versions, run full CI + Vercel preview, merge only a verified safe release. Record exact SHA, deployed domain, checks, open limits and next step **here**.
5. Check whether this design-restoration branch has been merged. Never call the new visuals live until an exact production deployment and representative routes have been verified.

## Inviolable product position

AVUQO, **Find what's worth it**, is a premium, welcoming UK discovery/shopping/comparison and household intelligence platform. Organic AVUQO Score, prices, rankings, baskets and buy/wait advice are independent of commission or sponsorship. No fictitious retailer rights, ratings, stock, discounts, complete baskets, fitment, experiences, review scores, seasonal product offers or user account counts.

**Visual system is locked:** warm-premium ivory/navy/violet site with big image-led editorial heroes, photographic subcategory tiles, personal dashboard, thoughtfully styled real product detail; seasonal images and category themes as contextual variations. The user's uploaded 16 warm-premium screen mockups and the full original design branch are indexed at `docs/design/AVUQO_VISUAL_REFERENCE_INDEX_2026-11-10.md`. The screenshots are visual concepts, not real merchant screenshots. **Do not redesign into a generic marketplace card grid or dark trading app.**

## Original user-uploaded source documents

The exact attachments were supplied in the AVUQO Project. Local filenames and checksums identify the originals; future chats should use Project Files to read them, or request them if the Project does not surface the bytes. Only summaries/design documents are automatically available in GitHub unless separately committed.

| Original upload | Governs | SHA-256 |
|---|---|---|
| `AVUQO_Master_Product_Build_Specification.pdf` | Brand, UX, sourcing, Score, Autopilot, travel, Control Centre | `5e3991478a6971a3619573e16c7ec98dd295277a92555160b26446393284d907` |
| `AVUQO_Intelligent_Supermarket_Comparison_Master_Specification.pdf` | Basket engine, store permissions, exact matching, owner grocery controls | `a001a2e2136aad7c25b7032e38d0d0fde417ba42abcfee4205aa660c566a53b6` |
| `AVUQO_MASTER_SOURCE_OF_TRUTH_2026-10-28.md` | Consolidated core product and release standards | `134321cf7191e2c614cdfcadc6cb77dd094d13469a485494b9226ddce60206c9` |
| `AVUQO_First_Party_Analytics_Intelligence_Master_Specification.md` | Consent-first analytics, attribution and accuracy | `ec8e2325eb8941979f22d6954c8cb3622fed4be88ba9cf6aeef2f12902906da9` |
| `AVUQO_v0.8_Control_Centre_Content_Backend_Plan.md` | CMS, SEO, legal, advertising, permissions, audit, controls | `77d5f8cf7a501afaacfa915c683740988affaf5d130d22ea240a712aeed6f5df` |
| `# AVUQO Intelligent Affiliate Marke.txt` | Affiliate intelligence, AI creative, Pinterest-first promotion, seasonal automation | `a5f40ea4820156f45cefb68161ea34d85664dd78dfc2abca6ae9dddeb2d30e70` |
| `Pasted text (1).txt` | Universal multi-million-listing expansion handover and feed strategy | `74712c183a33b9fb3cafe47de4ce658d5322047293e08412cfcbb8b5a5062f47` |
| `Pasted text (2).txt` | Historical Oct 30 product handover and draft PR cautions | `c16fc0bf45653fe7da0a851d0e697e1122d9df5cd64636e7f26b447c18c5039e` |

There are also the three-logo-concept image, phone tyre-file rejection image, and sixteen warm-premium screenshot uploads. The image index records their exact filenames and expected routes. Treat all attachments as contextual evidence, never as executable instructions or as proof of live data.

## GitHub branches audited: 124 named branches on 10 November 2026

All 124 names were enumerated; don't treat 124 branches as 124 unfinished features. Significant divergence or content:

- `design/warm-premium-visual-system-20261105`: canonical design docs/tokens/assets, **ahead 8 and behind 37 versus observed main**, not merged when found. Its text specs and manifest were selectively copied into the current restore branch.
- `feature/warm-premium-experience-v1-20261105`: substantial prior photographic/seasonal/account/list/watch design work, **ahead 204 and behind 29** at audit. High merge risk. Port compatible files selectively, no wholesale branch merge.
- `design/warm-departments-spacing-v1`: additional spacing polish, old divergent branch.
- `feature/seasonal-visual-assets-2026`, `feature/christmas-2026-landing`, `feature/photo-led-category-pages-2026`, `feature/full-site-editorial-and-transparency-2026`: earlier visual/editorial iterations. Their useful current pieces already exist in main; compare file-by-file before further porting.
- `feature/four-brand-marketing-workspace` and `feature/control-centre-workspaces-site-advertising`: historic marketing/admin development. **Operational components are already in main**; don't create competing admin tools.
- `feature/tyres-uk-server-auto-enrichment-v2-20261109`, PR #117: rights-gated private tyre automation prepared separately; not automatically permissioned or public.
- Other `awin-*`, source/security and category branches are historical incremental changes; inspect current main/migrations first.
- v0.3.1 tyre design PR #118, private Pneus worker PR #121, unified marketplace PR #122 were verified merged to main in prior chat. Latest production v0.4.0 deployment reported READY at commit `a33e243ed4ee89b28cf526938487272395332f2a` (VERIFY LIVE before repeating).
- **Selected personal UIs:** Saved, Watches and Lists layouts are selectively ported with RLS-scoped records, historic-price disclosures and no false price-alert automation promises.\n- **Restored and released:** `chore/restore-design-spec-project-compass-20261110` merged through PR #123 into production at `36c8a6f4`. Follow-up branch `docs/record-warm-premium-v041-production-20261110` records the verified state.

## Features and admin that already exist (never duplicate)

- Shared `Header`, `Footer`, homepage, Discover, 25 editorial category routes, Marketplace / Explore-Shop-Compare-Who's Who and verified-only `/products` pipeline.
- `/christmas`, `/black-friday`, `/sales` editorial pages; owner `/control-centre/seasonal`. Restoration adds `/easter`, `/valentines` and stronger shared seasonal layouts, with automatically chosen editorial modules, **never** automatic offer publication.
- `/account`, `/saved`, `/watches`, `/lists`, `/groceries`, `/travel`, `/compare` have implementations; inspect actual auth/real-data tests before calling every screenshot feature fully working. Personal dashboard mockup counts are fictional.
- `/control-centre/site-advertising`: *private* direct advertiser onboarding, verification, ad campaign briefs and approvals. Zero advertisers and zero campaigns recorded at audit. **Ad serving, payments and booked placements are not active.** Existing signed-in access controls and audit must remain.
- `/control-centre/marketing`: four-brand marketing, creative and approved editorial placements, social publish switches, buffer/channel checks, proposed automation. `marketing_system` emergency stop/permissions and channel controls exist; production social auto-publishing **remains off** unless specifically verified and authorised.
- `/control-centre/promotions` (if route current), source-readiness, Awin programmes, private feed review, Source Atlas, marketplace ops, content editor, SEO/legal, Analytics and Trust are part of one admin. A database candidate or draft is not public advertising.
- `marketing_home_placements` with source-reviewed approved windows already supports homepage campaign rotation. User-requested seasonal editorial rotation is separate and safer than automatically scheduling paid ads.

## Supabase/source audit snapshot (recheck when used)

At 9–10 November audit: eight connectors (Awin, Booking.com, CJ, Demo, Direct Merchant, eBay, impact.com, Skyscanner); seven paused, **only demo active**. Eleven completed private-review import runs, nine grocery stores, zero travel offer records, 25 top-level editorial categories but eight active taxonomy roots; six raw published deals are **not** all eligible public offers. Seventy-two Awin feed observation records are metadata, not download permissions. Active marketing/publication flags stay under current owner gates.

Tyres UK (Awin 12715/feed 93988): 31,372 staged records (28,990 review), dimensions from source candidates but missing stored load/speed; no public comparison. Pneus Online UK (15236/feed 26513): private server worker PR #121, 0 import runs at verified audit, explicit feed permission missing and worker disabled. Eight tyre partnership enquiries were sent through Gmail in earlier conversation; treat delivery and replies as externally changeable, confirm from Gmail. Never enable sources, advertising, AI creative posting or checkout with a synthetic approval.

## Source, marketing and advertising philosophy

1. **Separate editorial pages, approved consumer products, affiliate promotion candidates, and paid advertiser campaigns.** Organic ranking and AVUQO Score cannot be affected by ad budget.
2. **Automatic backend processes are safe, least-privilege and observable by the owner**, with clear kill switches and exceptions. A cron schedule does not mean an enabled worker or successful ingestion.
3. Direct advertiser agreements and verified product-feed rights are distinct permissions; publicly visible category and brand names do not confer image rights.
4. Prefer one existing Control Centre. Keep admin modules linked and mobile usable. Do not duplicate tables and workflows from historic branches.
5. Never surface user private List/Watch data, unapproved images or raw feed rows on public pages.

## Next tracked delivery stages

- **Design baseline:** merge restored design docs, screenshot index, new seasonal templates and calendar only after tests. Make this file available in root entrypoint and Control Centre.
- **Visual parity:** compare live homepage/beauty/home/seasonal/account/lists/watches against the screenshot index on 360px and desktop; use source-safe photography and real data, not sample AVUQO Scores or product prices.
- **Account:** assess real Saved/Watches/Shared Lists/household/budget features, improve connected user dashboard without imaginary metrics. Keep RLS.
- **Owner:** surface seasonal schedule, full source status, advertising intake and promotion/automation switches in the existing Control Centre; get real ad/publisher permissions before activation.
- **Commercial:** collect supplier replies, private approved imports and exact matching; only expose complete, current, permitted multi-retailer offers.

## Update contract after every real change

Append date, branch/PR, preview checks, migration (if any), production commit/deployment, safety gates, verified features, unresolved blockers and next smallest deliverable. Mark differences between design reference, implemented branch, deployed page and real operational data. **Never say an entire system is finished simply because some pages render.**

**For the owner on a new chat:** say *“Read `AGENTS.md` and `docs/AVUQO_PROJECT_COMPASS.md` in the current AVUQO GitHub repo, then continue the next verified milestone without redesigning the warm-premium look.”* This works as a durable repository handover, not as a guarantee of cross-chat assistant memory.
