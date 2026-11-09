# AVUQO Tyres: permanent design and multi-retailer comparison contract V1

Date: 9 November 2026. Status: proposed architecture, not a feed activation or live product release.

## Core promise

The right tyre. The exact specification. The real total cost.

AVUQO is an independent evidence-led tyre and price comparison experience, not a generic affiliate tyre catalogue. Offer ranking never depends on affiliate payout.

## Visual design: freeze AVUQO Tyres v0.3.1

- Own the midnight-plum (#191221, #301d3c), warm ivory (#f7f4f1), soft coral (#ffcec2) and lavender (#f1b4c8) palette.
- Editorial, confident typography with strong hierarchy and readable supporting data. Premium first impression, but never put visual decoration ahead of vehicle safety or complete price inclusions.
- First-party original AVUQO wheel art is the fallback. Actual tyres/photos, brands, logos and label graphics need confirmed reuse rights.
- Shared global AVUQO header/footer and navigation. No separate microsite branding.
- Mobile 360-390 px first; one-column offer cards, persistent selected tyre size, 48px tap controls, legible condition labels, meaningful focus states, reduced motion.
- The tyre homepage and manufacturer guides can have a dramatic hero. Search results and single product pages put model/spec/retailer comparison first.
- Stable no-data, needs-review, quote-needed and disabled states. Never fake a rating, price, discount or live stock.

## Canonical pages

1. /tyres: hero, functional size selector, verified collections/brands, explanation of full fitted cost.
2. /tyres/sizes: width/profile/rim, load and speed ratings, handbook/placard caution. A size alone is NOT fitment approval.
3. /tyres/brands and /tyres/brands/[slug]: editorial manufacturer navigation, no false affiliation; noindex placeholders.
4. /tyres/categories/[slug]: advice only until exact products are approved for their seasonal or construction classes.
5. Future /tyres/find: full tyre selection with exact dimensions and evidence confidence.
6. Future /tyres/products/[slug]: single exact variant, authorized image, size/load/speed/XL/OE/run-flat/season, valid tyre labels, retailer comparison by quantity + chosen fulfillment.
7. Future /tyres/compare: compare different verified tyres on relevant criteria. This is separate from comparing several retailers selling the SAME tyre.
8. Owner-only /preview/tyres: incoming feed QA, match suggestions and release review. Not checkout, not public.

## Source position recorded 9 Nov 2026

- Awin Tyres UK / Tyres.net: advertiser 12715, feed 93988, 31,372 private imported rows; 28,990 in review, 2,382 excluded. All 28,990 review rows have unverified size dimensions; zero saved load and speed candidates. The Awin programme describes Tyres.net as a marketplace / comparison platform, so source origin must not be confused with the eventual underlying seller.
- Awin Tyres Pneus Online UK: advertiser 15236, feed 26513. Joined programme observed and feed inventory found. No private product import completed in AVUQO. Feed-use permission confirmation remains false.
- The Awin source is paused, sync_enabled false. Both joined programme entries have feed_permission_confirmed false. Membership and feed availability are not publication/image rights.
- Prospective future direct partners, NOT currently verified connected suppliers: Blackcircles, Asda Tyres, Kwik Fit, Halfords, Protyre, Tyre Shopper and other UK specialists. Check authorised partner/API/feed access, coverage, legal permissions and whether true fitted/installation quotes are available, before implementing any connector. Never scrape third-party prices.

## Multi-retailer ingestion order

P0: Finish source-fingerprint-aware Tyres UK private technical enrichment, including load/speed and observed variant suffixes, without public offers or historical price mutation.

P1: Verify the existing Pneus Online UK programme and feed permissions. Read its schema from an authorised server-side Awin feed, record immutable private source snapshot and checksum, parser version, GB scope and product count, then privately import with resumable size limits. Do not assume it uses the Tyres UK schema, or turn on the paused shared Awin source globally.

P2: Match two private catalogues using a versioned, deterministic canonical variant engine; sample manual approvals and negatives before any public offer.

P3: Negotiate authorised data access with prospective further tyre sellers and installers, validate individual source rights and add them independently.

P4: Quote/fitting integrations: require user-chosen postcode or collection locality, quantity, live fitting availability and costs. Avoid retaining precise location unnecessarily.

## Canonical product identity

GTIN/EAN/MPN or manufacturer-confirmed identifier is preferred, with brand/model validation. Without a reliable unique code, a reviewed exact variant requires manufacturer, full model/line, width, aspect ratio, rim, load index, speed symbol, season, XL/reinforced, run-flat, vehicle OE homologation and relevant version suffixes. Unknown or conflicting required fields = needs_review; no exact comparison or recommendation. Matching the same brand + model + 205/55 R16 alone is NOT sufficient.

Separate manufacturer identity from supplier product ID and seller offer ID. For marketplace/aggregator offers record originating platform, underlying seller (if known), final merchant and redirect chain. If the underlying merchant is unknown, do not count the aggregator and a direct offer as two independent market sellers.

## Quoting and comparisons

Compare exact canonical tyre variant, same quantity, same fulfillment mode, same region/postcode context and price currency/VAT basis. Display modes separately: delivered / fitted at centre / mobile fitted / collection or quote needed.

Complete payable total = quantity times base tyre cost + known mandatory delivery + fitting, balancing, valve, disposal and mobile fees + other compulsory fees - verified eligible discounts. Determine which charges are already included, so none are double counted. Missing mandatory quote components never default to zero. If total is incomplete, display 'Full fitted cost unavailable' rather than a misleading cheapest badge. Shipping-only and fully fitted prices are not ranked against each other.

Offer status: latest permissioned price observation time, checkout/stock evidence, restrictions, fitting availability, quote expiration. Affiliate commission is excluded from AVUQO price/value ranking. Repeated underlying seller offers must not inflate retailer coverage. A verified price observation can become stale independently of its source-feed update timestamp.

## Labels, fitment and rights

Great Britain and Northern Ireland have different applicable tyre-labelling regimes. Use applicable manufacturer-backed fuel economy/rolling resistance, wet grip, external noise and seasonal markers, with consumer-facing disclosure and the relevant product-information sheet where needed. Reference: GOV.UK Supply or distribute vehicle tyres: labelling rules, https://www.gov.uk/guidance/eu-tyre-labelling-regulation-compliance-and-guidance.

A registration lookup may only become a vehicle-fitment tool after reliable licensed matching, applicable vehicle-manufacturer requirements and user safeguards are available. Never imply that tyre dimensions alone confirm suitability.

Awin membership is not blanket permission to redistribute images, descriptions, labels, pricing, or to represent downstream marketplace retailers.

## Mandatory acceptance gates

- Design: mobile, tablet, desktop, 320/360/390 widths, focus, accessibility, long model names, and failed/no-data states.
- Source: rights, provenance, exact feed fingerprints, schema, retries, partial failure, storage security, account pause.
- Identity: wrong model, run-flat, XL, load, speed, OE, season, motorcycle/van, EAN collision, duplicate marketplace seller all fail closed.
- Price: shipping vs fitting, quantity, mandatory fee unknown, VAT, coupon, postcode, fitting availability, stale quotes and seller attribution cannot mis-rank.
- Publication: owner-reviewed product and offer, source rights, freshness, fitting/vehicle caveats, audit, emergency pause. Do not release private import rows or claim market coverage until evidenced.
- Separate the design+model preparation PR from the existing PR #117 automatic enrichment worker.

This document is a design and comparison contract only. It does not activate a data source, run imports, apply migrations, change prices, or approve publication.
