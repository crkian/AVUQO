# Awin Cadbury and Petlibro: owner-supplied terms review

**Evidence received:** 4 November 2026. **Status:** terms inspected; advertiser-specific publication rights still NOT confirmed. This review records only what the owner-provided welcome emails and Awin terms PDFs state. Do not attach the private source emails or PDFs to the public repository.

## Cadbury Gifts Direct (advertiser ID 736)

**Owner-provided sources:** Cadbury welcome email; `Cadbury Gifts Direct Terms (2).pdf`, last updated 16 January 2023 (3 pages).

- Welcome email confirms affiliate-programme sign-up and points to Awin **Linking Methods** for current banners and links; warns that branded PPC bidding results in withheld commission. It does not confer a general licence for image storage/republication.
- Page 2 lists **shopping directory**, **comparison engine**, **editorial content**, **direct linking**, and other publisher types as allowed.
- Page 1 says the **sale category** is excluded from earning commission. A sale product is not therefore automatically forbidden from appearing, but never treat it as commission-eligible.
- Pages 1–3 include apparently different paid-search answers: some paid search uses are marked Yes, while branded-variation/misspelling/brand-plus-keyword queries are No; page 3 expressly prohibits bidding on Cadbury names and variants and warns commissions will be withheld. **Fail closed for all branded PPC; do not auto-enable PPC campaigns.**
- Commission base includes VAT, credit-card fees and gift wrap/service fees, but excludes delivery (page 1). The document does not supply a verified commission rate, cookie duration or permitted image-retention period.
- "No branding guidelines" (page 3) is not a blanket copyright or logo-use licence.

**Onboarding conclusion:** joined programme and comparison/content partner types evidenced. Feed-price, image, banner usage scope, storage/republication, source freshness, approved tracking-link details and current programme updates still require verification. Keep `feed_permission_confirmed=false`.

## Petlibro UK Affiliate Program (advertiser ID 77952)

**Owner-provided sources:** Petlibro welcome email; `Petlibro UK Affiliate Program Terms (1).pdf`, last updated 11 April 2024 (5 pages).

- Welcome email says **default 8% commission** and **30-day cookie window**, and points to Awin Toolbox banners/links and My Offers. Its sample link contains placeholder `{!!!MID!!!}`, **not a ready-to-use URL**. Do not paste placeholder links into customer pages.
- Terms page 3 permits **shopping directories, comparison engines, editorial content, social traffic, direct linking** among partner types and describes approved pre-coded banner placement on websites/social/blogs (page 4).
- Commission statements are **not a single verified rate**: page 4 gives Deal/Coupon 8%, Loyalty/Rewards 8%, Network 10%, Content/Review 15%, Social Influencer 15%; page 5 says "up to 18%". Verify actual publisher-assigned commission group and current terms in Awin rather than hard-coding a high rate.
- Terms page 3 says UK target **excludes Channel Islands and Gibraltar**, and excludes PO box and UK military addresses for delivery.
- Terms pages 4–5 prohibit Petlibro trademarks/variants in PPC keywords, brand-name domains/subdomains, and require negative PPC keywords. Page 2 says paid search generally No, despite a specific direct-shopping-ad answer Yes; **do not launch PPC/CSS until separately reconciled**. Terms page 2 says CSS/ad network campaigns require a separate publisher account.
- Terms state no category exclusions on page 1, yet also allow rejection where a product is not commission-eligible; check actual network transaction eligibility. Commission base excludes VAT, delivery, card fees, gift wrap/service charges (page 1).
- The PDFs suggest updated product feeds and supply permitted pre-coded banners, but do not establish an unrestricted licence to download, persist, transform, redistribute or cache all imagery.

**Onboarding conclusion:** joined programme, organic content/comparison partner types and 30-day cookie evidenced. Exact assigned commission, image/feed retention, link requirements, current GBP prices, and per-offer eligibility still require acceptance. Keep `feed_permission_confirmed=false`.

## Shared safeguards and next verified steps

1. Use official Awin joined-programmes and **feed-list** endpoints to verify exact advertiser ID, available feed(s), type, last-update timestamp and allowed publisher access; Awin's publisher guide describes feeds for comparison and product links but does not override merchant-specific usage terms.
2. Read the full current advertiser terms within Awin. Verify banner/image rights including caching and resizing, whether feed content and prices may be displayed on AVUQO, attribution requirements, current campaign restrictions and any expiration. Record actual evidence reference/date, not invented future validity.
3. If a legal/right-use point remains unclear, request written clarification via the merchant's affiliate team. Do not attest rights as confirmed just because a programme is joined.
4. Only after permission checks: test the selected advertiser's feed read-only in owner-only tooling, retrieve a small fresh batch (≤50) to held/private state, validate product/variant IDs, GBP payable price including applicable delivery, availability, links and freshness. Excluded historical Petlibro rows remain excluded.
5. Validate individual owner release and pause controls. No bulk publish, auto social posting or commission influence over AVUQO Score. Multi-advertiser concurrent ingestion needs isolated configuration before activation.
6. Keep Awin source paused, synchronisation disabled, no rights approvals or public offers until each gate is evidenced.

**Current Awin reference:** https://help.awin.com/developers/docs/product-feed-publisher-guide-intro (last checked 4 November 2026).
