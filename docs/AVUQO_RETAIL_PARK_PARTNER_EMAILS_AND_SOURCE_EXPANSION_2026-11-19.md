# AVUQO retail park: 21 advertisers, verified email campaigns, mobile and source expansion
**Audit and implementation:** 19 November 2026. **Source of truth:** live AVUQO Supabase, Awin owner mail in `blogsrecord@googlemail.com`, advertiser's linked Google Docs pack, publicly inspected merchant websites, and the supplied supermarket master specification. A programme acceptance, current stock, product feed and affiliate-tracked link are different statements.

## Implemented in this release
1. `/partners`: a prominent, colour-coded, independently branded directory for the **21 accepted Awin advertiser records**, including publishers missing an exact mapped Awin ID. Categories are shopping, mobile, broadband, travel, motoring, energy and services.
2. `/partners/[slug]`: a **unique accent, symbol, subject-specific opening copy, checks and offer links** for all 21. Real merchant offer shelves call `verifiedOffersForAdvertiser`, which narrows by exact advertiser ID and then reuses **every original** `verifiedOffers` restriction (owner-reviewed release, current GBP, own-publisher Awin URL, stock, price equality, identity, source rights, score and emergency controls). No private feed row becomes a public price because it has a page.
3. Public `/mobile`: SIM/PAYG/handsets/mobile-broadband entry points with terms guidance; `/compare` retains user-input total-cost calculation, **not fabricated live tariff results**.
4. Homepage, /sales, /black-friday, /shopping and /travel show **date-bounded advertiser-announced promotions**, separate from independently verified price reductions. /broadband and /motoring link to relevant provider pages.
5. Expanded default navigation and sitemap while migrating previous owner-edited navigation by exact known hrefs. No new network keys, scraping, inventory writes, unapproved offers, irreversible operational changes, or image rehosting.

## Evidence: live feed and storefront state at 21:30 UK
- All **21** programmes are owner-attested accepted; there are **74 observed Awin feeds across 12** of them; **seven** have imported private product data; **five** have published canonical Awin offers. The five with published offers are Tooled Up, Petlibro, PlayPress Toys, Cadbury Gifts Direct, Mozillion. Public eligible rows may be lower than DB-published totals due to source freshness.
- Tooled Up 1,116 published at audit (and continuing automatic refresh), Petlibro 33, PlayPress 33, Cadbury 31, Mozillion 15. Craft Buddy 2,619 private rows and Tyres UK 31,372 remain unreleased. Pneus Online has a validated 19,890-row private snapshot not committed to rows; initial hourly worker attempts showed `pneus_private_bulk_claim_rejected` and zero lease attempts after earlier migration; do not imply repaired runtime progress without checking.
- **Exact cross-retailer comparisons:** zero published canonical product IDs with more than one Awin merchant at audit. Do not label arbitrary different products a cheapest-market comparison.

## Verified email and merchant links (exactly scoped)
| Programme | Evidence | Use on live pages | Distinct outstanding work |
|---|---|---|---|
| Holiday Extras 3496 | 3 Nov Awin account-manager welcome, 4 Nov AVUQO reply, linked Welcome Pack and Discount document | Exact supplied publisher tracking `https://www.awin1.com/cread.php?awinmid=3496&awinaffid=3135746`. Approved booking categories and official merchant destinations. Partner text explains link discount applies **after customer searches**; pack says up to 25% on a named Gatwick airport car park and conditional 10% discounts with airport/product exclusions. | Bookable date-based price API, booking-level promotion validation, postcode/airport and cancellation differences, negotiated exclusive offers. Do not assert a live AVUQO price. Pack forbids brand PPC and restricts photo use to promoting Holiday Extras; no third-party images were copied. |
| Tooled Up 496 | 9 Nov Black Friday weekly drops and 16 Nov Einhell Awin emails | Exact email-provided `cread.php` URLs using publisher 3135746 and retailer landing `ued`. BF 9 Nov–6 Dec: CLAIMFIFTY £50 off £500+, CLAIMSEVFY £75 off £750+, one code. Einhell EIN15PCDD 15% off qualifying Einhell basket £50+ 16 Nov–30 Dec, one code. | Recheck campaign landing response and checkout eligibility; products remain governed by approved price observations. |
| PlayPress Toys 101445 | 12 Nov programme broadcast | PLAY10 gives 10% off orders over £30 through 31 Dec 2026, not stackable. Public site link is **untracked direct merchant**; individual eligible product offers have validated Awin links. | Obtain offer-specific affiliate deep link if merchant supplies it. |
| Petlibro 77952 | Direct written feed and image permissions 5 Nov, 19 Nov Black Friday broadcast | Prior retailer-sale module with 19 Nov–3 Dec dated subsets. Product URLs checked against merchant site; official campaign landing may redirect to a later holiday campaign in current crawl, so checkout is authoritative. | Keep product claim expiry, link integrity and final price evidence separate. |
| Lyca Mobile 128157 | 11 Nov personal welcome from mobile affiliate team | Official UK mobile site and provider page, no invented SIM prices or unverified tracked URL | Obtain category-specific tracking URLs and exact tariff/renewal adapter |
| Broadband Genie | 16 Nov Awin welcome | Official broadband comparison site; email offers a bespoke white-label landing | Obtain publisher-specific white-label URL and terms before labelling custom branded quote page |
| Simply MOT | 17 Nov Awin welcome | Merchant-supplied `https://simplymot.co.uk` link with caution that an external HTTP smoke was inconclusive | Obtain individual garage prices/bookable slots and approved tracking; £3 commission per completed MOT is publisher revenue, never consumer saving |
| Co-op Mobile/Broadband & Energy | 6 Nov separate Awin welcomes | Official sites for products and informational pages; no non-evidenced affiliate link | Confirm exact programme advertiser IDs, current contracts/energy tariffs and eligible price/terms feeds |
| Onestream 23296 | 4 Nov Awin welcome | Official `https://onestream.co.uk`; postcode-dependent service terms not quoted by AVUQO | Get verified tracking and contract terms |
| Compare Parking Prices UK 118401 | 2 Nov Awin welcome and 3 Nov commission change | Official booking engine, not fixed price | Live airport/date/quote connector |
| 1pMobile 37738 | Awin 10-entry service feed observation; current official website inspected | Official UK website and SIM/PAYG provider page | Exact live tariff adapter |
| Craft Buddy 45747 | Awin feed evidence + publicly verified retailer site | Partner page and private-only evidence notice | Brand/character merchandising permissions, category and product release |
| Cadbury 736 | AVUQO follow-up 17 Nov requesting image and price rights; existing approved offers | Existing approved sources only, official merchant site | Confirm wider image/price historical permission before bulk release |
| Others | Accepted Awin owner records | Tailored information pages, links only where checked | Feed/quote/rights adapter per business |

**Important corrections from mailbox:**
- **Iceland advertiser 7868 rejected AVUQO on 2 Nov 2026.** Do not label an Iceland affiliate feed approved or import its Awin data based on grocery brand name.
- **New invitations are not accepted programmes:** brickzonehub 121692 (19 Nov), WorldSIM (9 Nov), Willow Parking (9 Nov), eSIM For U (6 Nov). Applications/invitations require programme-specific terms and explicit owner acceptance. Do not auto-click terms-acceptance links or activate.
- Searches of connected mailbox found **no Amazon Associates programme onboarding email** in the queried 2026 window. That does **not** prove an account does not exist; there is no active Amazon connector or verified programme credentials in AVUQO.

## Amazon UK: safe acquisition plan
- Official [Amazon UK Associates](https://affiliate-program.amazon.co.uk/) offers publisher enrolment. Product catalogue access is moving to the [Creators API](https://affiliate-program.amazon.co.uk/creatorsapi/docs/en-us/introduction). The PA API 5 has been deprecated in favour of Creators API; confirm current market-specific access and API credentials.
- Amazon programme linking requirements prohibit independently displaying stale/invented Amazon prices. Price and availability must come from compliant Amazon-served links/widgets or authorised Amazon API content with refresh timestamps/licence rules. The UK agreement imposes usage and disclosure conditions.
- **Status: research and onboarding prepared, NOT integrated or a live Amazon price source.** Do not copy Amazon photos or scrape listings; do not insert Amazon product comparisons without explicit approved entitlement and data API access. No secret recorded in GitHub, Supabase metadata or public site.

## Supermarket comparison: exact current state
- Existing nine store directory: Aldi, Asda, Iceland, Lidl, Morrisons, Ocado, Sainsbury's, Tesco and Waitrose.
- Production Supabase read 19 Nov: **0 published grocery products**, **0 currently eligible published grocery prices**, 0 stores with qualifying published price data. The `/groceries` shopping-list foundation exists but does not claim automatic basket coverage.
- The supplied `AVUQO_Intelligent_Supermarket_Comparison_Master_Specification.pdf` explicitly says usage rights, appropriate source, complete basket treatment, pack-size matching and fresh priced evidence must precede public publication; no unauthorised scraping or inference from an affiliate partnership.
- Acquire individual supermarket authorised feeds, partner APIs, licensed aggregators or owner-reviewed legitimately sourced price observations. Stage exact product name, EAN/GTIN/pack, store, postcode, Clubcard/Nectar/personalised vs standard price, stock, time and terms. Expired/partial or unauthorised feeds cannot appear as live cheapest basket.
- Prioritise **Tesco, Asda, Sainsbury's, Morrisons, Ocado**, then Waitrose, Iceland, Aldi and Lidl as data rights allow; a supermarket's online shop does not imply its product-level price feed is available for affiliate use. Iceland membership rejection remains a hard blocker on that Awin pathway.

## More retail and dropshipping
- **First convert already accepted shops**: Tooled Up, Petlibro, PlayPress, Cadbury, Mozillion, Craft Buddy; keep current 74-feed Awin monitor and explicit specialist worker routes, not a fictitious catch-all importer.
- **New retail programmes**: review Awin invitees and applicant terms; identify safe independent feed sources via Awin, CJ, impact, Rakuten/Partnerize/Webgains or direct merchants. Each activation needs verified membership, photo/product use rights, tracked links, acceptable refresh latency and valid GBP/stock.
- **Dropshipping is operationally distinct from affiliate click-out**. Selling as merchant of record creates order payment, supplier purchase, delivery/returns, product safety, consumer law, VAT and customer-support obligations. AVUQO has not connected stock ownership, payments/fulfilment or a dropship supplier contract. Do not treat an import URL as a dropshipping business. A vetted fulfilment pilot should be separate from comparisons and affiliate referrals.

## Verification and deploy gate
Run `node --experimental-strip-types --test tests/partner-retail-park-launch.test.mjs`, Next build, lint and synthetic DB jobs, secret scan, then inspect Vercel production READY against exact merged SHA. Check /partners, /partners/holiday-extras, /partners/tooled-up, /partners/mozillion, /mobile, /sales, /shopping, /travel; do not claim visual HTTP smoke if access unavailable.

## To continue source expansion
1. Holiday Extras bespoke tracked deep links/quote API and search-by-airport service comparison; retain 10%-vs-up-to-25% scope and PPC restriction.
2. Mobile tariff adapter for Lyca/1pMobile and contract feeds; join handset listings only on explicit variant/contract relationship.
3. Secure Amazon UK Associates and authorised Creators API access via owner approval. The site should never require Amazon for unbiased rankings.
4. Supermarket source/price rights, start with owner-verified small product cohorts with pack accuracy, then scale approved feeds.
5. Resolve remaining physical retail source permissions, bring more source-verified inventory into canonical matches across retailers, with no false lowest-price labels.
