# P1 product visibility: four public model research guides

Date: 14 November 2026. **Release candidate until PR merge and exact READY production evidence.**

## Owner goal
Make actual named products visible on the real AVUQO site now, without leaking demonstration offers, turning on unauthorised supplier sync, inventing merchant prices/stock, or losing the original warm-premium design direction.

## Verified production baseline before this release
- Live `products`: **4 active**, **8 draft**. The four active records are manufacturer/model research identities (MacBook Air M4 13-inch 16GB/256GB, Ninja Foodi AF300UK, Dyson V15 Detect Absolute, LG C4 65-inch family). The eight pilot/affiliate draft identities are **not** public.
- `offers`: **6 active records**, but attached to the internal demonstration source, not approved retailer price evidence. `published_deals`: 6 demo records. `awin_offer_release_reviews`: **0 approved**. The existing `verifiedProductIndex` correctly returns no admitted merchant products.
- Awin source: **paused, sync disabled**, publication and price evidence status **pending**, image rights not confirmed. eBay and other actual external sources are also paused/not credentialled.
- The global web publishing control is not the same as source or offer approval. Existing source/offer-level checks remain in charge. **No external-source prices, retailer images or offers are authorised merely because a product identity exists.**

## What this release implements
1. A **four-item, curated, editorial-only** research-guide allowlist at `lib/products/research-guides.ts`, with exact product/model titles, a neutral teaser, a three-item buying checklist, a model-variant caveat, and the manufacturer's *information* URL.
2. Public `/products`: four named model research cards *before* the existing verified-retailer comparison shelf. No merchant product photo, unapproved stock, score, discount, price, sale or affiliate CTA.
3. `/products/[slug]`: for an exact allowlisted identity, render a clear model research page if `verifiedProduct(slug)` has no eligible offers. It has a manufacturer-information link, buying considerations and an explicit no-live-comparison state. It is **noindex** until independently admitted real offers exist. Unknown and draft pilot slugs remain unavailable.
4. Homepage: when eligible offers are absent, three named research guide cards replace the generic inspiration placeholders. **If authorised offers later exist, the verified-offer cards retain priority**.
5. `/categories/tech/products` and `/categories/home/products`: research guide shelf separate from and before the verified retailer listing. Remaining 23 departments continue working as before.
6. All research artwork is generated from AVUQO's neutral CSS/card styling, **not copied from manufacturer, retailer or Awin images**.

## Independently checked model references
The editorial names were crosschecked against publicly accessible manufacturer pages, which are informational references, not merchant price/stock feeds or affiliate offers:
- Apple: `https://support.apple.com/en-gb/122209` (13-inch M4, 2025, base 16GB and 256GB; configuration still must be checked).
- Ninja: `https://www.sharkninja.co.uk/ninja-foodi-dual-zone-air-fryer-af300uk/AF300UK.html`.
- Dyson: `https://www.dyson.co.uk/vacuum-cleaners/cordless/v15/detect-yellow-nickel`.
- LG: `https://www.lg.com/uk/tvs-soundbars/oled-evo/oled65c43la/` (specific UK C4 suffix; AVUQO's older `OLED65C4` record is a *family* identity and must never force a match to an arbitrary exact suffix).

Do not use manufacturer pages to scrape changing retailer prices, images or copyrighted marketing copy. Guides ask the visitor to check specifications rather than claiming all variants are identical.

## Test and release acceptance
- CI must run `tests/public-research-product-guides.test.mjs` plus standard build/lint/secret/preview tests.
- Verify public `/products`, the four exact guide paths, homepage and tech/home shelves on the exact production Vercel deployment. No price, 'in stock', invented score, affiliate CTA or unlicensed product photo on those guide pages. Unknown/draft pilot slugs must 404.
- Verify `verifiedProduct` remains first in product-route admission, original owner/merchant publication gates are unchanged, and source `awin` remains paused.
- Validate mobile responsive layout and keyboard/focus behaviour, ideally at 360px/390px and desktop. CI structurally tests HTML contracts; visual screenshot/real signed-in QA is separate.
- **No database writes, new migrations, cron, Awin/eBay sync, source status, offer releases, marketing posting or tyre worker changes.**
- Do **not** call these 'four shoppable offers' or claim comparison prices are ready. They are *four model research guides*.

## Fastest path to actual retailer products with prices
P1-01 remains the priority: select a current joined Awin merchant with written promotional/image rights, use the current feed importer privately, review one real exact variant/GBP landed price/stock/freshness, run source and item permission checks and owner approval, and admit one real offer through the existing atomic release process. Without those rights and evidence, **do not publish Awin/eBay/demo offers as real products**. This step requires the owner's relevant permissions and genuine provider data; the app alone cannot create them.

## Parallel Work brief
If Work credits are available again, run a **read-only** independent browser QA review of the four product research pages and key mobile/desktop routes, comparing against the original warm-premium design guide. Return screenshots and an actionable issues list; **do not change source flags, publish products, merge branches or touch live Supabase**. Reference `docs/WORK_PARALLEL_PRODUCT_DESIGN_QA_BRIEF_2026-11-14.md`.
