# Private advanced tyre finder (5 Nov 2026)

The Tyres UK 12715:93988 import currently contains 31,372 private records, of which 28,990 are candidates for review and 2,382 are excluded. The records contain feed-supplied manufacturer names (37 distinct values), model titles and parsed, unverified tyre-size candidate JSON: width_mm, aspect_ratio, rim_inches. There are 388 review candidates matching example size 225/45 R17.

**Owner navigation:** /preview/products?merchant=12715. The menu has manufacturer, width in mm, profile, rim diameter, text search on product model/title, historic £ price minimum/maximum and sorting. These are URL query filters applied by Supabase to the full import **before** LIMIT/OFFSET pagination. The page preserves selected filters when browsing next/previous pages. Search is not constrained to the 48 loaded cards.

The owner-only Postgres RPC `public.private_tyre_preview_facets(uuid)` generates complete distinct manufacturer/width/profile/rim options. It checks owner/admin role, exact Tyres UK merchant ID, private_review run status and retains invoker RLS. It does not expose private rows or product values to anonymous users.

On cards, extracted text dimensions appear as `Size candidate: ...` and remain **unverified**. Feed-supplied manufacturer names are not certified maker identities. The price is a historical import observation and must not be advertised as a current quote. No vehicle fitment, tyre load/speed index, summer/winter type, XL/run-flat, EU label, fitting price, live availability or rights verification is inferred. No public `offers` or `products` are created by the finder.

## Extension to other AVUQO departments

Reuse the same pattern: a category-specific validated attribute dictionary and indexed, normalized metadata; an owner-only facet/aggregate endpoint; server-side filtering and saved shareable URLs; and a public version only after individual merchant permissions and refresh checks. Candidate next menus:
- Mobile/SIM: handset manufacturer/model, network, monthly cost, upfront cost, data allowance, minutes, contract length, effective total cost.
- Tools: manufacturer, category, cordless voltage, battery platform, brushless, stock, price.
- Travel parking: airport, arrival/departure dates, terminal, shuttle vs meet-and-greet, cancellation terms, total booking cost.
- Grocery: product category, brand, size, multipack, unit price and nutrition filters.

Do not hard-code missing attributes as known or apply ordinary one-off price sorting to recurring contracts and date-sensitive bookings.
