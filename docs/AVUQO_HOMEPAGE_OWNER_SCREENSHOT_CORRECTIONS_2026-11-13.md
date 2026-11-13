# Homepage visual review from owner screenshots · 13 November 2026

## Actual screenshot observations and targeted fixes
The owner supplied four consecutive real production desktop screenshots at approximately 1536×960. The live homepage had its seasonal Black Friday photo and AVUQO brand, but three defects stood out:

1. **Blank shopping-category photos.** `StorefrontQuickLinks` referred to `/branding/avuqo-department-reference-sprite.svg`. That file returned GitHub NOT_FOUND on current `main`; empty CSS background cards were visible. Replaced sprite with descriptive **editorial** category photographs (Unsplash) already used as the visual pattern elsewhere in AVUQO. No merchant/private Awin product images or prices are used.
2. **Competing duplicate seasonal hero.** The homepage rendered a full Black Friday header and another large `HomeSeasonalSpotlight` with the same seasonal image/headline below the category strip. Removed the second large homepage seasonal module; the live hero still auto-selects the UK theme with `editorialSpotlight(new Date())` and the owner annual calendar remains intact.
3. **Hero typography/centering.** The Black Friday headline looked overly large and started at the left viewport edge, with disproportionate image emphasis. Applied a constrained, centred content grid and smaller responsive headline, keeping image, contrast, intelligence panel, CTA and UK annual theme switch.
4. **Private preview occupying public merchandising hero.** Even for signed-in owners, `OwnerStorefrontShortcut` took visible space under the homepage CTA. Removed it from the public homepage composition; the private showroom remains gated, linked via existing owner-only navigation and private Control Centre.

## What this does not touch
No changes to Supabase migrations, Awin/CJ affiliate feeds, eBay credentials or Browse approval, tyre find/fitment/import processing, Account, Saved, Watches, marketing permissions or retailer publication gates. The category photographs illustrate *departments*, not specific products. Verified live prices are still unavailable unless independently licensed and current.

## QA and limits
- Test core source contracts: no missing sprite reference, single seasonal hero, navigation continues protecting owner preview, published product evidence gates unaffected.
- Run full GitHub CI, secrets scanner, and Vercel production deploy at exact merged SHA.
- Inspect actual desktop and mobile browser screenshots after release, especially category image load, hero edge alignment, legibility, nav, responsive crop. Automated markup tests alone cannot certify photo-host availability or pixel-level design.
- The production visual-audit workflow `.github/workflows/production-visual-audit.yml` remains the long-term screenshot source.

**Status:** this document is written in feature PR. Do not treat it as deployed until verified Vercel READY.
