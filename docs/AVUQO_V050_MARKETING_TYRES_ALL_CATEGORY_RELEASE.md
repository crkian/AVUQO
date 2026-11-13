# AVUQO v0.5.0 · Marketing, Tyres and All-Category Product Readiness

**Date:** 10 November 2026  
**Code branch:** `feature/marketing-tyres-all-category-product-readiness-20261110`  
**State at creation:** release candidate, not yet deployed. Update project Compass after exact production verification.

## Design contract and source traceability

The chosen original Warm Premium design is authoritative, not a generic affiliate catalogue. Read `AGENTS.md`, `docs/AVUQO_PROJECT_COMPASS.md`, `docs/design/AVUQO_WARM_PREMIUM_VISUAL_IDENTITY_2026-11-05.md`, `docs/design/AVUQO_VISUAL_REFERENCE_INDEX_2026-11-10.md` and tyre-specific `docs/tyres/AVUQO_TYRES_DESIGN_COMPARISON_CONTRACT_V1.md`. The 16 original screenshots are mockups, **not** merchant authorization or live products.

No change to public offer admission (`lib/products/public-catalog.ts`) or current source rights: source active+licensed, exact variant, fresh prices, eligibility and image rights still gate individual public product pages. No approved public product is invented in an editorial category.

## Existing marketing implementation audited, selectively extended

### Already present, intentionally preserved
- Four-brand `/control-centre/marketing` workspace for AVUQO, Fantasy Lockr, Capshur, Cluedoku.
- Owner-approved facts, reviewed posts, creative asset library, budget-capped owner-initiated AI generation, content calendar, homepage editorial placements.
- Buffer Facebook/Instagram verified channels, queued provider reconciliation and emergency stop; backend `/api/internal/marketing` protected by CRON_SECRET with an existing 09:00 daily Vercel schedule.
- Recurrent factual editorial draft worker is separate from live social publishing and requires an explicit environment gate; content must use approved current facts, avoid duplicates and remain in the review queue.
- `/control-centre/promotions` for affiliate promotion candidates.
- `/control-centre/site-advertising` for **direct third-party advertiser intake and rights review**, independent of organic scoring. Ad serving, payments and booking are NOT active.

### New in this release
- `/control-centre/marketing/readiness`: one authenticated, read-only marketing cockpit with exact brand facts, approved social posts, verified channels, media evidence, active draft rules, reconciliation jobs, global stop and environment readiness.
- Explicit platform roadmap: Pinterest is the creative-first strategy, but **no authorised Pinterest posting connector exists**; its creative drafts cannot be silently pushed to Pinterest. Email bulk campaigns also lack consent, suppression and delivery connectors. Existing Facebook/Instagram via Buffer are safeguarded, not claimed connected just because their code exists.
- `/advertise`: visually finished warm-premium external partnership information and enquiry, with clear editorial firewall, no fake inventory rates/booking or checkout. Existing `/contact` handles inquiries; no new external records or ad payment flows.
- Marketing Studio header now correctly links existing advertiser intake and readiness. Existing workflows are not duplicated.

### Real live marketing audit (10 Nov 2026)
- Marketing global `publishing_enabled=false`, `emergency_stop=true`, `ai_enabled=false`.
- No connected channel records, public marketing posts, social publication jobs, registered advertisers or site-ad campaigns.
- Five affiliate promotion candidates remain in **review**; not public organic deals.
- This release **does not enable** publishing, AI, ad serving or source/retailer data without explicit owner and provider authorization.

## Tyres: complete public display architecture, no false quote

**Preserve the v0.3.1 premium midnight-plum tyre showroom** and its first-party wheel illustration.

### Already present
- `/tyres` showroom, `/tyres/sizes` educational size entry, `/tyres/brands` and 20 manufacturer guides, eight type/season category guides.
- Private Tyres UK technical and source review and private supplier onboarding for Pneus Online, rights-gated source pipeline, no live public tyre offers.

### New
- `/tyres/find`: functional width/profile/rim and manufacturer-specific public product search. Only approved exact variant + current licensed offers + independently verified load and speed evidence qualify.
- `/tyres/compare`: side-by-side two **different** approved tyre models, factual dimensions, load, speed, season, run-flat, XL and current unit price. No vehicle-fitment implication.
- `/tyres/products/[slug]`: premium individual technical model, approved photo only where legal, exact variant labels, real eligible retailer unit prices and 1/2/4 unit-price subtotal, explicitly **not** full fitted/delivered quote. Links to source-gated retailer redirects.
- Existing showroom, manufacturer, tyre type and size pages now lead to the three functional experiences rather than saying everything is only future work.
- `/control-centre/tyres`: owner-only live-state read-only workboard linking two supplier feeds, private imports, technical evidence, product readiness and public previews, with honest unavailable worker status if the latest migration is not active.

### Live source constraints preserved
- Tyres UK / Tyres.net: advertiser 12715, feed 93988, 31,372 private rows as audited earlier, 28,990 private review; load/speed still unverified for public use.
- Pneus Online UK: advertiser 15236, feed 26513, feed/rights authorization separately pending. No claim of product availability.
- Other tyre retailers are leads, not live connected and authorised comparators.
- A tyre's nominal size alone **does not** prove a specific vehicle fit. No guaranteed installation, fitter coverage or OE approval.

## All 25 departments, and every eligible individual product

- `lib/products/department-showrooms.ts` defines a **family-specific blueprint for all 25 editorial departments**. Each has its own purchasing focus, three useful suitability checks, warm premium photo treatment and explicit category aliases.
- `/categories/[department]/products` delivers 25 responsive storefronts, even when the source is not ready. It only imports `verifiedProductIndex` (a public-rights/freshness gateway) and filters by explicit source categories or product_type; it never publishes products by guessing category from names. Zero eligible listings creates a useful honest empty state.
- The main `/products` lists all 25 department showrooms as launch-ready category doors. Marketplace Shop journey links go to those doors, while Explore, Compare and Who's Who remain different user choices.
- `/products/[slug]` adds exact category-specific buying advice for any unambiguously assigned approved canonical product. Existing technology, home, beauty, grocery, tyres, motoring, travel, pets, fashion, gifts and general templates, accepted photos, verified offers, wishlists, eligible retailer redirection and publication gates are preserved.
- Products do **not** magically appear on inactive categories or on product routes without their verified offer and rights checks. They may be received privately by the import architecture, reviewed and activated separately.

## Database and privacy

- **No migrations** and no write to current Supabase production data.
- No affiliate source activation, merchant or advertiser account auto-approval, new marketing-connected platforms or booking/payment integration.
- No fake scores, product images, prices, stock, reviews, claims, user watches or fitted quotes.
- Owner pages require current `requireControlCentreAccess`; signed-out access must not expose their internals.
- All 25 public product showrooms use `robots: noindex` initially, until real eligible products and a separate SEO review make indexing appropriate.

## Release acceptance checklist

- [ ] GitHub lint, new marketing/tyre/25-category tests, existing safety suites and build green on exact head.
- [ ] Secret scan green.
- [ ] Vercel preview READY on exact SHA.
- [ ] Public routes: `/products`, 25 departments including new `/categories/tech/products`, `/categories/baby-nursery/products`, `/tyres/find`, `/tyres/compare`, `/tyres/brands/michelin`, `/advertise`.
- [ ] Owner routes `/control-centre/tyres`, `/control-centre/marketing/readiness` not accessible signed-out.
- [ ] Merge and verify exact production SHA, `www.avuqo.com` alias and live customer routes.
- [ ] Authenticated owner browser + physical 360px/desktop visual QA, sourced merchandising and commercial rights remain separate owner acceptance.

## Next authorised follow-up

1. Obtain explicit supplier and image rights, verify Tyres UK load/speed/XL/season and current prices, choose actual underlying sellers and true fitted pricing APIs before launching comparisons.
2. Connect/verify social accounts, review approved facts/creative, grant consent and publishing permissions before switching on live marketing. Build Pinterest integration only through an approved supported provider.
3. Expose actual approved products, add exact multi-retailer matches and real page-level AVUQO Score and price history only after independent scoring evidence exists.
4. Complete manual visual/mobile/accessibility and owner authenticated QA, including navigation and full login/user workflows.

**Do not call an empty but working catalogue a live retail marketplace.** “Ready to receive verified goods” is an accurate description; “all retailers integrated” is not.
