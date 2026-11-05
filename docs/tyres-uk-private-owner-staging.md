# Tyres UK private staging: owner workflow

Current live evidence (5 November 2026): Awin advertiser 12715, feed 93988, 37-column gzip CSV; 25/25 sampled GBP prices and positive numeric prices, 21/25 description size patterns, no missing product identities in sample. This is a bounded sample, not a full-feed validation.

**Owner-only importer:** `/control-centre/general-feed-import`. Choose `Tyres UK · 12715`, enter feed ID `93988`, select the matching downloaded Awin `.csv.gz`, click `Inspect actual feed columns`, confirm Awin source identity and then `Start private import`. Import is 250-row resumable batches bound to the file SHA256, with no publication. Do not import Pneus 15236 through this Tyres UK adapter.

The exact Tyres UK adapter is now used in both the browser preflight and the authenticated server chunk handler. It extends the strict existing Awin checks for merchant ID, product ID, affiliate tracking attribution, positive price and explicit GBP. It inspects title/description/category size candidates, rejects no-size or conflicting-size rows as excluded, filters obvious accessories and records whether delivery cost is numeric. A review row is still **unverified**, has no automatic tyre match, no fitted-price confirmation, no approved canonical category and no public release. Original product and row source provenance remains in private `feed_import_records`; this staging route cannot produce `offers` or `published_deals`.

The shared Awin source is required to remain paused and sync-disabled when starting, resuming or writing Tyres UK imports. An owner/admin session is required for all large feed actions. The selected importer is not scheduled to run automatically. The first complete import has **not** been executed by this change. The owner can browse staged results at `/preview/products?merchant=12715` once completed.

Pneus Online UK (15236, feed 26513) remains separate because its 32-column feed has no explicit currency field and its 25-row sample found no title size patterns. A distinct source-specific adapter is necessary.

Future release requires confirmed retailer permissions, full-feed validation, GBP/availability freshness, load and speed index, product-versus-wheel separation, delivery/fitting totals and accurate price comparison, plus individual owner release records.
