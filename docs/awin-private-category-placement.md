# Awin department routing: private storefront review

Existing **owner-only** retailer previews: `/preview/products`, `/preview/products?merchant=77952` (Petlibro), `?merchant=31539` (Mozillion), `?merchant=736` (Cadbury), `?merchant=45747` (Craft Buddy), plus detailed `/preview/products/tooled-up` for the 84,284 staged Tooled Up items. Access requires authenticated control-centre permissions. These previews show historical staged feed values, not live public deals.

The `suggestedDepartment` client helper now routes Tooled Up category families into Workwear & safety, Motoring maintenance, Gardening & outdoors, Home appliances & cleaning, Lighting & security, Power tools & equipment, Hand tools and DIY & home improvement. Unrecognised labels remain `Needs classification`. Mozillion SIM-free handsets are assigned `Mobile phones`, but contract/SIM plan labels remain unclassified for their future dedicated service comparison routes. The existing Petlibro, Cadbury, Craft Buddy and AKKO suggestions are preserved.

The shopping homepage's owner-only Mozillion shortcut now links directly to the corresponding private handset preview rather than the import control-centre page. The public shopping department links remain editorial until the actual product matching and release gates are passed.

This change **does not** mutate imported merchant rows or canonical category IDs, create public offers, activate the shared Awin source, release retailer images, claim fresh prices, run new imports, or bypass individual advertiser rights approval. These are placement-review suggestions only.

Future public release must create canonical products and matched offers in the correct `products.category_id` and `offers` records, verify current GBP prices and terms per advertiser, and pass manual Awin owner release checks. The existing public search uses `verifiedProductIndex`, which excludes private feed_import_records. Import counts are not public-offer counts.
