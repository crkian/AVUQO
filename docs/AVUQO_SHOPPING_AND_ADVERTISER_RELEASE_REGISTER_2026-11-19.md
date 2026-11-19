# AVUQO Shopping Experience & 21-Advertiser Completion Register
**Observed:** 19 November 2026 (production Supabase read-only audit). **Work branch:** `feature/integrated-shopping-experience-20261119`. **PR:** #324.

## Consumer release work implemented in draft
- Home verified product source window expanded 8 → 36 and customer shelf 3 → 12, interleaved by eligible source category.
- All six curated shopping department cards shown on homepage.
- Product images change in an accessible on-page gallery. Supplier-image raw external URLs are not opened by the thumbnails.
- Product pages show genuinely eligible same-category suggestions and a separate cross-category "Have you seen?" rail; only already gated public products are used.
- Ordinary retailer listings are distinguished from positive evidence-backed price reductions in homepage cards.
- Wishlist is explicitly saving for later, without reservation or purchase; comparison basket is not a checkout.
- Personal basket groups stored historical-price snapshots by merchant with clear partial-price disclosure. It does **not** assert a cheapest complete live basket.
- Regression contracts added to required CI. No changes made to rights, prices, feeds, scoring, release gates or external approval states.

## Production source and advertiser reality
- **21** Awin affiliate programme records exist, but **all 21 currently have `status=pending` in AVUQO's affiliate_programs table**. This does not negate separately attested accepted network membership; it also does not grant feed, image or public release rights.
- **7** of these programmes have nonzero current private product-readiness rows: Tooled Up (84,284), Tyres UK (31,372), Cadbury Gifts Direct (4,111), Craft Buddy (2,619), Mozillion (883), Petlibro (142), PlayPress Toys (40).
- AKKO has historical imported private records (1,820) and a readiness record but is **not** one of the current 21 affiliate_program rows returned by the join. Do not count it as an extra current accepted programme.
- **14** of the 21 programmes currently have zero private readiness rows, **including Pneus Online**, which has a separate 19,890-row `snapshot_ready` bulk-import job with zero committed records. Thus "zero private readiness" does not mean no source file exists.
- Tyres UK last checked full source cohort had **31,682** rows at 07:37 UTC 19 November; successful source check is not public publication of these rows.
- At earlier 07:42 UTC DB check: 688 published deals, 1,203 held deals, 1,891 active offer records, 84,779 product records, 1,386 category records (10 active). Record totals are not guaranteed distinct or publicly eligible product totals.

## Advertiser onboarding matrix
| Programme | AVUQO private readiness | Immediate route |
|---|---:|---|
| Tooled Up | 84,284 | Continue accurate live refresh, publication evidence and category coverage |
| Tyres UK | 31,372 | Convert current 31k source cohort to appropriately matched, rights-approved offers; verified specs only |
| Cadbury Gifts Direct | 4,111 | Preserve private import; verify product/image rights and active offers |
| Craft Buddy Shop | 2,619 | Preserve copyrighted creative and image-permission restrictions |
| Mozillion | 883 | Confirm SIM-free handset variants, refurb condition and image rights |
| Petlibro UK Affiliate Program | 142 | Resolve advertiser identity and rights scope before wider publication |
| PlayPress Toys UK | 40 | Verify exact feed and image permissions |
| 1pMobile | 0 | Determine approved feed/landing page scope for mobile services |
| AutoAid Breakdown | 0 | Confirm service quote and regulated terms integration |
| Broadband Genie | 0 | Resolve missing external account identifier and provider feed scope |
| BroadbandCoop & MobileCoop | 0 | Resolve missing identifier and validate contract/coverage data |
| Chattr Sim Only | 0 | Verify eligible offer feed and contract terms |
| Christmas Letters from Santa | 0 | Confirm product/creative permissions and seasonal validity |
| Compare Parking Prices UK | 0 | Authorised comparison/booking connector, date and location price rules |
| EPCs, Gas Safety Certificates and Electrical Check | 0 | Service-specific price, qualifications and postcode validity |
| Holiday Extras | 0 | Booking/availability connector and conditional travel charges |
| Lyca Mobile UK | 0 | Plan and activation terms, contract price and region verification |
| Onestream | 0 | Broadband availability, contract terms and total cost |
| Simply MOT (UK) | 0 | Resolve missing programme identifier and local service availability |
| Tyres Pneus Online UK | 0; 19,890 snapshot ready | Repair bulk-import worker progress; quarantine unverified GBP and image rights |
| Your Co-op Energy | 0 | Resolve missing identifier and current eligible tariffs |

## Release gates for every advertiser
1. Confirm exact live programme membership, merchant identity and applicable allowed publisher content/links.
2. Verify legal rights for price, image and copy usage; allow image-free listings if eligible.
3. Import only through authorised connector; keep all raw rows private.
4. Normalise product/service identity, variant, currency, stock, timestamps and source evidence; reject ambiguous records.
5. Map exact products to canonical categories, separate service/contract/travel logic from ordinary goods, and avoid duplicate pages.
6. Obtain required owner release approval and trustworthy current scoring; no unverified offer can bypass the public admission pipeline.
7. Audit product/category/search/navigation coverage, desktop/mobile, merchant redirects, saved collections, comparisons, expiry, and privacy/analytics before declaring a programme complete.
8. Record separately: accepted network membership, connected feed, staged private rows, valid public offers, published consumer pages, and active reliable attribution.

## Remaining platform work not completed by PR #324
- Full shared basket live per-retailer multi-item comparison, substitutes and grocery basket rules.
- Public canonical offers for all advertiser programmes, complete mapping and continuously working feeds.
- Final product category-specific filters and SKU depth, cross-retailer matching/price history throughout.
- Full end-to-end/mobile/accessibility coverage, purchase journey instrumentation and trust measures.
- Real permission evidence for current `pending` programme records and missing external account identifiers.
- Merge, production deployment and browser acceptance of #324 are separate from preview build success.

This register records observed state, not a claim that all features or advertisers are live. Keep this handover current only after independently verified results.
