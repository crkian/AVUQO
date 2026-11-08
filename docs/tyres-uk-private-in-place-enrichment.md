# Tyres UK: enrich original private import in place

## Verified source
Original owner-provided `AVUQO_Awin_Tyres_UK_12715_feed_93988.csv.gz` SHA-256 is `8519714de23fbe58130428c9e16d026fa49bf7f86874695b8b2b430cc02285c7`, exactly the digest recorded for the completed run `8ea807f1-7050-4dfb-af51-e08dc7c7bbd5`. The original file has 31,372 rows. A full local audit found 29,026 rows with exactly one standard size/load/speed description pattern corroborating source columns custom_1...custom_5. The live private run has 28,990 review candidates and 2,382 excluded rows. Source and live feed snapshots are not interchangeable.

## Owner workflow
Go to `/control-centre/tyre-spec-enrichment` with an owner session. Select the **same original Tyres UK .csv.gz** used for the completed import, then choose **Enrich existing private records**.

The browser checks the whole-file SHA256 before any updates, reads the gzip CSV incrementally (20k character field maximum only for this exact source), and submits at most 250 corroborated candidates per authenticated request. The server independently checks owner session, joined Tyres UK programme, paused Awin source, complete import ownership/status/digest, row bounds and merchant IDs. The Supabase procedure will only update pre-existing Tyres UK `review` records with matching product ID, original title, numeric historical price, GBP currency and existing width/profile/rim candidate. It only appends private load and speed candidates with explicit provenance, preserving all review decisions, imagery, prices, approval and publication flags. Re-running is safe; already populated records are skipped. It never inserts new products or public offers.

After enrichment, `/preview/products?merchant=12715` has full-catalogue load-index and speed-rating filters in addition to manufacturer, width, profile, rim, model and historic price. Missing/unconfirmed ratings remain absent from the filter options.

## Boundaries
The saved technical attributes are **unverified candidates**, not confirmed legal tyre speed/load ratings for a vehicle. We still need product-category/vehicle compatibility checks, season/run-flat/XL evidence, permission for public data/images, and fresh comparable delivered/fitted totals. No automatic public release, source activation or eBay changes occur here.

The code deployment only installs the enrichment tool. This PR does not itself transfer the owner-supplied CSV into production. Owner browser operation is required to process the existing private records.
