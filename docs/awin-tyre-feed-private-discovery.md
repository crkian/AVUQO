# Awin tyres: schema discovery before private ingestion

**Owner requested tyre integration on 5 November 2026.** The latest saved Awin inventory identifies two exact feeds:

| Merchant | Advertiser ID | Feed ID | Listed rows (inventory snapshot) |
|---|---:|---:|---:|
| Tyres UK | 12715 | 93988 | 32,053 |
| Tyres Pneus Online UK | 15236 | 26513 | 20,062 |

The combined 52,115 is a **feed-inventory count**, not validated unique tyres, current stock or public offers.

## Read-only diagnostic

`POST /api/internal/awin-tyre-header?advertiser_id=12715&feed_id=93988` (or `15236&feed_id=26513`). Header `Authorization: Bearer <existing CRON_SECRET>`.

The endpoint requires the connected advertiser and paused `awin` source (`sync_enabled=false`), retrieves the live active Awin feed inventory using existing private credentials and exact feed IDs, rejects redirects, and reads only a bounded gzip/plain CSV header. It returns **only field names and aggregate presence checks**; no product row values, credential-bearing URLs or actual imports.

Tyre-schema evidence includes explicit tyre dimensions (size or width, aspect and rim), load/speed index, EU wet-grip/fuel/noise fields and whether delivered/fitted pricing has dedicated columns. Header presence does not prove data is complete or accurate in individual rows. Filename, advertised row count, price semantics, territories and retailer rights must still be corroborated.

## Product model required before staging

The future Awin tyre adapter must validate per-row:
- exact advertiser/feed identity, stable retailer tyre ID, manufacturer and model/pattern;
- normalized size in width/profile/rim (e.g., 225/45 R17), load index and speed rating, marking any title-derived value unverified;
- season (summer/winter/all-season), run-flat/XL markings and optional EU tyre-label metrics, without inventing absent values;
- unit quantity, VAT inclusion, delivery cost, fitting services and whether the advertised GBP amount is a **delivered-only tyre** or an **installed/fitted total**;
- validated GBP source convention and owned Awin affiliate links;
- out-of-stock cases, duplicate identities across full snapshot, rights and stock freshness.

Only exact-spec tyres may be matched together. An installer service, wheel/tyre bundle, inner tube or accessory must not be represented as a standalone tyre. Pricing must show **per tyre** and total quantity, and must not compare fitted versus unfitted quotes as equivalent.

## Next action

Use the authenticated header endpoint for each feed and inspect the returned safe JSON results. Once actual columns are known, implement source-specific private snapshot validation and staging; do not assume the same dialect for the two retailers.

This change does **not** create products/offers, enable scheduled tyre imports, activate Awin, approve permissions or publish tyre listings. It leaves eBay on hold.
