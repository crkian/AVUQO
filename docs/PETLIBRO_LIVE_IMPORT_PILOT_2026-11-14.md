# Petlibro UK: controlled real-data import pilot

Recorded 14 November 2026. This is a gated pilot plan, not approval to activate Awin or publish products. Rights source: Petlibro affiliate-team reply copied by the owner into chat; original email headers and current Awin terms still need independent confirmation.

## Permission scope from owner-provided Petlibro reply
- Awin advertiser ID 77952; joined in owner Awin screenshots.
- Allowed: feed product titles, descriptions, GBP prices, stock/availability, affiliate deep links, unmodified feed-supplied photographs and Awin banners on comparison/product pages.
- Allowed: retain/update item data for matching and genuinely observed historical prices. Distinguish historical and current prices and refresh current stock and prices.
- Organic SEO, editorial comparison, email newsletters, unpaid social permitted. Paid NON-brand keywords only during Q4; bidding on Petlibro brand names prohibited.
- Commissions: Luma Litter Box 5%; other products 8%; accessories 0%. Never rank by commission.
- Existing publisher account sufficient. Image cropping/resizing/caching and retention restrictions remain unclarified: do not assume broad editing rights.

## Read-only live database baseline, 14 Nov 2026
- Petlibro latest private import ID 36271b63-fad9-4e5d-88bc-9dcb10feb16d, created 5 November: 44 records, all GBP, positive price, image URL present, 44 distinct supplier IDs. All review/pending; import permission unverified.
- Earlier 28 October Petlibro import 98 rows but only 49 distinct IDs; 49 excluded. Do not use it as current inventory.
- Awin observations: UK Product feed 103580 lists 44; Sales Price feed 109051 lists 42; Hero 119009 lists 19; Default 119210 lists 19; UK Hero 109652 lists 12. Counts overlap and are not unique-product totals.
- Awin new snapshot validations: 0; bulk import jobs: 0. Public offers: 6 total, 0 from Awin; Awin release approvals: 0.
- Awin source paused, sync disabled, credentials not configured in source registry. Deal publishing and source ingestion global controls enabled; global emergency stop disabled. Do not toggle global controls for merchant pilot.
- Feed observation counts do not establish up-to-date prices, inventory, image HTTP safety or affiliate tracking.

## Pilot release gates
1. Verify original Petlibro reply headers and current programme terms; record narrow rights and expiry/recheck requirements only after validation.
2. Refresh only standard feed 103580 using existing owner-authorised private bounded importer. Do not enable global source sync. Capture snapshot SHA, timestamp, feed ID, row totals, errors.
3. Check IDs, duplicates/cross-feed overlap, variants, GBP VAT/delivery, prices, stock, HTTPS affiliate tracking, photo URLs and permissions. Keep candidate rows private.
4. Select one to five products after fresh field-level validation and owner review. Keep image usage unmodified unless additional rights confirmed.
5. Confirm source permission, verified price, approved per-offer review and score gates before any public release. Review current code Awin environment advertiser ID single-merchant assumption before multi-merchant activation; do not weaken gate.
6. Define and test Petlibro-specific withdrawal and global emergency stop without activating other sources. Confirm customer-facing pages and clickouts in exact production deployment, then expand gradually.

## Stop conditions
Withdraw for stale/incorrect price, stock or variant, rights uncertainty, broken tracking, missing offer approval, private-data exposure or inability to withdraw merchant offers. No scheduled import, DB grants, public deals, campaign, or automatic marketing is authorised by this documentation.

## Separate deployment dependency
PR #200 remains candidate pending genuine HTTP 404 acceptance. This documentation must not be represented as publication or production deployment.