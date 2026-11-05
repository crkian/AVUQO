# Tyres UK private staging: owner workflow

Current live evidence (5 November 2026): Awin advertiser 12715, feed 93988, 37-column gzip CSV; 25/25 sampled GBP prices and positive numeric prices, 21/25 description size patterns, no missing product identities in sample. This is a bounded sample, not a full-feed validation.

**Owner-only importer:** `/control-centre/general-feed-import`. Choose `Tyres UK · 12715`, enter feed ID `93988`, select the matching downloaded Awin `.csv.gz`, click `Inspect actual feed columns`, confirm Awin source identity and then `Start private import`. Import is 250-row resumable batches bound to the file SHA256, with no publication. Do not import Pneus 15236 through this Tyres UK adapter.

The exact Tyres UK adapter is now used in both the browser preflight and the authenticated server chunk handler. It extends the strict existing Awin checks for merchant ID, product ID, affiliate tracking attribution, positive price and explicit GBP. It inspects title/description/category size candidates, rejects no-size or conflicting-size rows as excluded, filters obvious accessories and records whether delivery cost is numeric. A review row is still **unverified**, has no automatic tyre match, no fitted-price confirmation, no approved canonical category and no public release. Original product and row source provenance remains in private `feed_import_records`; this staging route cannot produce `offers` or `published_deals`.

The shared Awin source is required to remain paused and sync-disabled when starting, resuming or writing Tyres UK imports. An owner/admin session is required for all large feed actions. The selected importer is not scheduled to run automatically. The first complete import has **not** been executed by this change. The owner can browse staged results at `/preview/products?merchant=12715` once completed.

Pneus Online UK (15236, feed 26513) remains separate because its 32-column feed has no explicit currency field and its 25-row sample found no title size patterns. A distinct source-specific adapter is necessary.

Future release requires confirmed retailer permissions, full-feed validation, GBP/availability freshness, load and speed index, product-versus-wheel separation, delivery/fitting totals and accurate price comparison, plus individual owner release records.

## Complete user-provided file audit (local, not Supabase)

Full owner-supplied compressed Awin exports inspected locally on 5 November 2026. These files contain 86 CSV columns each, differing from the 37 and 32 columns returned by the live Awin header probes (which use the current feed-list URL). Do not assume the historic snapshots are byte-identical to the live downloads.

| Measure | Tyres UK 12715:93988 | Pneus 15236:26513 |
|---|---:|---:|
| Original rows | 31,372 | 20,087 |
| Rows with explicit GBP | 31,372 | 20,087 |
| Positive numeric search_price | 31,372 | 20,087 |
| Duplicate retailer product ID | 0 | 0 |
| Publisher ID 3135746 present in tracking URL | 31,372 | 20,087 |
| Description size regex candidates | 29,073 | 1,341 |
| Rows with multiple size patterns across inspected fields | 0 | 106 |
| Rows with field exceeding 10k characters | 26 | 0 |

Tyres UK's 26 oversized fields are exclusively `custom_6` (maximum 16,422 characters); the owner importer permits up to 20k characters only for Tyres UK's `custom_6` field, and the private adapter truncates it to 10k before generic validation while setting an explicit redaction flag in private metadata. This field is not used to infer tyre specifications. Other advertiser fields retain the 10k cap. The original owner's compressed file remains unchanged on the owner's machine.

The audit establishes historical file format only, not current live stock, price accuracy, images/retention rights or customer-facing availability. No product was added to Supabase during this local audit.
