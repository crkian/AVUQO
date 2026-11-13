# AVUQO · Compare + Discover Bargains Product Positioning and Awin Release Plan
**Owner direction reaffirmed 13 November 2026.** This is product positioning and an implementation plan, not a statement that unlicensed live offers, historical prices or images are already available.

## Positioning
- Brand: **AVUQO. Find what's worth it.**
- Supporting description: **Discover genuine deals, compare prices and shop smarter across trusted UK retailers.**
- Two customer intentions use **one canonical product-and-offer system**: **Compare** (specific product, exact variant, true all-in cost and seller differences) and **Discover bargains** (evidence-backed savings, clearance, promotions, seasonal offers, watches).
- Never allow affiliate commissions, placements or paid sponsorships to change independent product matching, organic AVUQO Score, rank, basket, buy/wait advice, or discount verification. Clearly distinguish sponsored placements.
- Preserve the approved warm-premium site styling and existing routes. Do not create a parallel bargain catalogue.

## Customer journeys and acceptance
1. **Discover deals:** surface only eligible live offers with an accurately observed price, stock state, retailer identity, time checked and legitimate promotional evidence; never invent crossed-out prices, historical price drops or retailer availability.
2. **Compare prices:** group only matched products sharing exact identifiers, condition, pack size and meaningful variant. Display shipping-inclusive total when available, unknown shipping clearly otherwise. Show observation timestamps and avoid implying all retailers were checked.
3. **Shop by category:** curated categories may exist without published offers. Clearly label sparse/empty states rather than fabricate catalogue breadth.
4. **Saved / Watches:** retain existing saved and watch mechanisms. Alert only from genuine, permissioned changes with correct user consent.
5. **Groceries and services:** groceries require independent basket completeness/price provenance; broadband/mobile, energy, breakdown and travel need sector-specific plans/quotes, not physical-SKU price cards.

## Provider sequence
- **eBay:** Sandbox OAuth/Browse test succeeded 13 November. Owner submitted the Production Browse API questionnaire. Await explicit permission; production Browse, public feed imports and seller images remain disabled until independently approved.
- **Awin:** Next provider in active development. Reuse current imports, monitoring, permissions gate and Control Centre. The private 13-Nov feed export has 74 active feed entries from 12 advertisers, and 884 entries marked Not Joined. Feed entries and image URLs are not reproduction licences. Owner has verified `support@avuqo.com` two-way email; retain eBay's existing registration email.
- **impact.com, CJ Affiliate, direct merchants:** Subsequent onboarding opportunities; use verified support/business contact, without duplicate accounts and only once Awin permissioned data pipeline works.
- **Travel (Booking.com/Skyscanner):** Later, distinct service integration.

## First eligible Awin releases
1. Validate present-day joined state, authoritative feed IDs/download ability, licence to use feed data and images, GBP currency, click tracking, price/stock recency and product matching for **Petlibro, Craft Buddy, Cadbury and PlayPress Toys UK**.
2. PlayPress ID **101445**, feed IDs **96428** and **F5142** were observed in the owner's private CSV. Do not commit the private CSV or access URLs. Avoid duplicate products across different formats.
3. Also assess **Mozillion** physical SIM-free listings distinctly from contracts and refurbished grades; stage the former privately while contract offers require term calculations.
4. **Tooled Up** old feed IDs were withdrawn; require current replacement feed validation before pricing or publication. **Tyres UK/Pneus** need exact fitment and specialist data. No blanket activation.
5. For no-observed-feed partners, pursue approved publisher deep links, merchant-provided API/feed or permitted editorial profile; don't scrape websites or manufacture offer/price/image records.

## Owner Control Centre: partner applications register (delivery requirement)
Plan a record per provider and advertiser: programme identity/ID, registered email/contact channel, application date, observed membership vs verified current membership, feed IDs, API availability, authorised image usage, affiliate link terms, country/currency, last successful import, source freshness, public release decision with reviewer and evidence, next action, and status history. Never store API passwords, tokens, signed downloads, personal mail contents or certificates in these records. Prefer extending existing source metadata/review systems over building duplicate tables.

## Release gates for each merchant and each offer
- Current explicit publisher/advertiser approval and verified data/image licence as applicable.
- Fresh, accurate product identity, condition, price, delivered total and stock evidence; current authorised affiliate destination.
- Owner-controlled review trail and source release permission; no source auto-sync/public release by mere programme join.
- Confirm customer-facing imagery copyright/use terms and image hotlink/cache conditions separately.
- Run tests, security scans, Vercel build, production checks and permission-state verification before claiming publicly available.

## Status and immediate next step
This document records an **agreed target**. It does not publish Awin inventory or approve photographs. Reconcile 19 observed historical/screenshot programme names, complete the feed inventory and image-rights assessment, then ship first independently eligible physical-product offers to the same Compare + Bargains catalogue.
