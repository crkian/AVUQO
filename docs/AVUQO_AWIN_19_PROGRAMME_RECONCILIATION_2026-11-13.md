# AVUQO · Awin programme reconciliation and feedless-partner routing
**Evidence: owner-supplied Awin joined-programme screenshots, 13 November 2026.** These show two account pages, 18 visible programme names. Programme membership can change; this is not a live API membership recheck, advertiser data-feed licence, or image licence.

## Owner screenshots: visible programme names
- Page 1: Petlibro UK Affiliate Program; Onestream; 1pMobile; Craft Buddy Shop; Compare Parking Prices UK; Tooled Up; EPCs, Gas Safety Certificates and Electrical Check; Chattr Sim Only; Tyres UK; **PlayPress Toys UK**.
- Page 2: Cadbury Gifts Direct; Lyca Mobile UK; Holiday Extras; **Your Co-op Energy**; Christmas Letters from Santa; Mozillion; **BroadbandCoop & MobileCoop**; AutoAid Breakdown.

The existing `lib/awin/joined-catalogue.ts` lists 16 historical programmes (observed 4 November), including Tyres Pneus Online UK, which is not visible in these new screenshots. The union is **19 names**, not proof of 19 currently joined programmes. Do not invent IDs for the three new entries. Obtain exact advertiser IDs from authenticated Awin programme detail/API before adding them to identifier-keyed registries.

## Live private Awin feed observations checked 13 November
Observed advertiser IDs: `37738` (1pMobile), `736` (Cadbury), `118401` (Compare Parking Prices), `45747` (Craft Buddy), `25022` (EPC/Certificates), `128157` (Lyca), `31539` (Mozillion), `77952` (Petlibro), `496` (Tooled Up), `15236` (Tyres Pneus Online), `12715` (Tyres UK).

These are feed **observations**, not successful current downloads, merchant rights, fresh prices, or permission to render product photographs. Previous local private imports span seven merchants and 122,309 rows; 121,399 rows contain image URLs; image use is still unverified. Tooled Up has withdrawn older feeds, requiring new feed ID verification.

## Partners without observed feed rows: use the correct integration path
| Programme | Data type | Next verification |
|---|---|---|
| PlayPress Toys UK | Physical products | Exact Awin advertiser ID, current product-feed inventory, image licence; request feed from merchant if none |
| Christmas Letters from Santa | Seasonal personalised service | Approved landing-page affiliate linking, offer period and pricing/fulfilment terms; do not fabricate SKU/image data |
| Holiday Extras | Parking, airport services/travel | Affiliate deep links or authorised booking/search integration; no invented live travel quotes |
| Onestream | Broadband contracts | Approved plan data, contract duration, setup fees, mid-contract price changes; otherwise affiliate referral only |
| Chattr Sim Only | Mobile SIM contracts | Plan terms, coverage, allowances, full-term pricing; otherwise affiliate referral only |
| AutoAid Breakdown | Breakdown cover | Cover levels, exclusions, eligibility, renewal pricing; otherwise affiliate referral only |
| Your Co-op Energy | Energy services | Exact advertiser ID and current availability; quote eligibility, tariffs and regions; otherwise referral only |
| BroadbandCoop & MobileCoop | Broadband/mobile | Exact advertiser ID and feed/API existence; contract transparency; otherwise referral only |

No current feed observation was found for these names in the `awin_feed_update_observations` table, but this does **not** prove no feed exists. Historical membership and offer terms must be checked individually. Other screenshot entries with feed observations may still require non-product service handling (e.g. Lyca, 1pMobile, Compare Parking Prices, EPC).

## Practical Awin verification checklist
1. In Awin publisher UI, open programme details for each name, obtain advertiser ID and current joined status; do not rely on orange status dots alone.
2. Use the publisher's **Product Feeds / Create-a-Feed** inventory filtered by joined advertiser. Confirm current feed ID, country, currency, update date, fields, and download permission; don't use stale historical IDs.
3. For physical goods, inspect feed item count, product identifiers (GTIN/MPN/variant), GBP prices, stock, approved click URLs and images. Verify image display/cache rights independently of feed access.
4. When no usable feed exists, contact the merchant through Awin requesting an approved UK feed or API and image/link usage terms. Do not scrape merchant websites.
5. For services and contracts, prefer approved referral/deep-link content or separately licensed quotation data, with accurate whole-term disclosures. Do not invent prices or claim comparable live quotes.
6. Stage permitted data through the existing private small/large Awin importers; keep product offer admission and image publication gated, and deduplicate successive imports.
7. Record member status, feed ID, last successful freshness check, image-use evidence and route type in the existing source-control process before any public release.

**No rights/status changes, public images, public product offers, source activation, bulk import jobs or secret handling are authorised by this document.**

## Owner-provided Awin Datafeed Inventory CSV (13 November 2026)
Source: `datafeeds (3).csv` supplied privately by the owner. **DO NOT commit/export the original CSV:** its URL column contains private feed-download links and publisher identifiers. No URLs or access keys are stored in this documentation.

- 958 datafeed rows across 619 advertiser IDs. Membership Status values: 74 `active` and 884 `Not Joined`. These are feed-level rows; **12 unique advertisers** have active feed entries. The 74 active rows report **274,898 listed product rows**, not unique sellable products.
- Newly verified **PlayPress Toys UK**, advertiser ID **101445**, has active Awin feed `96428` and Google-format feed `F5142`, **81 listed rows in total**. This resolves its formerly unknown identifier. Verify both feed schemas and image rights before private import.
- The other two newly seen screenshot names, **Your Co-op Energy** and **BroadbandCoop & MobileCoop**, have no matches in this CSV; their exact Awin IDs remain to be confirmed from programme details, and no public offer or feed should be inferred.
- Active feed advertisers and row counts (may overlap across feeds):

| Advertiser ID | Name | Active feed entries | Listed product rows |
|---|---|---:|---:|
| 496 | Tooled Up | 53 | 208831 |
| 12715 | Tyres UK | 1 | 31738 |
| 15236 | Tyres Pneus Online UK | 1 | 19997 |
| 31539 | Mozillion | 5 | 11311 |
| 736 | Cadbury Gifts Direct | 1 | 1371 |
| 45747 | Craft Buddy Shop | 2 | 1311 |
| 118401 | Compare Parking Prices UK | 2 | 120 |
| 77952 | Petlibro UK Affiliate Program | 4 | 117 |
| 101445 | PlayPress Toys UK | 2 | 81 |
| 37738 | 1pMobile | 1 | 10 |
| 128157 | Lyca Mobile UK | 1 | 10 |
| 25022 | EPCs / certificates | 1 | 1 |

**Caution:** the active-feed `Tooled Up` entries include historical ID `89987`; merchant previously reported old feeds deleted. An inventory row alone does not prove the URL still works or offers current licensed data. `active` is a feed inventory membership field, not evidence of permission to republish products, images, or links.

**Current gap:** the other five historical joined programmes with no active CSV feed rows are Holiday Extras, Onestream, Christmas Letters from Santa, AutoAid Breakdown and Chattr Sim Only; the new screenshot programmes Your Co-op Energy and BroadbandCoop & MobileCoop also have no CSV entry. Treat as seven lead follow-ups, not automatically feedless services.
