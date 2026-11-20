# AVUQO 21 Supplier Retail Studios: Individual Brand Editions & Merchandising
**Date:** 20 November 2026
**Status:** PR candidate until full CI, reviewed merge and exact Vercel production verification.
**Source:** Current live `crkian/AVUQO` directory and partner page architecture, 21 owner-accepted Awin advertiser records, original 25-department taxonomy and earlier affiliate rejection/description/tyre handovers.

## Owner request and purpose
The retail park must feel like 21 actual, inviting supplier destinations rather than a repeated affiliate link template: retailers should see their own products, identity, editorial story and a coherent route through AVUQO. Customers should find worthwhile shopping and independent comparisons without mistaking AVUQO for the supplier's official website. All original AVUQO categories, navigation, warm-premium cream/plum brand, shopping functionality, handovers and prior approvals must remain.

## New customer-facing experience
- `lib/partners/studio-editorial.ts` authors a **different first-party AVUQO narrative, original scene treatment, prominent editorial edition, main headline and three detailed shopper guide chapters for each of the 21 accepted advertiser pages**. These are editorial descriptions, not merchant-supplied official identity or evidence of a product/price.
- `components/partners/PartnerStudioExperience.tsx` gives each page a styled magazine-like hero, contextual photo collage from *already rights-cleared source-verified offer images only*, retailer-focused original buying guidance, matched live product examples within relevant chapters, an expanded eligible product card shelf, and an invitation for supplier teams to contribute permissioned descriptions/photographs/campaign details.
- `app/partners/studios.module.css` introduces **21 different responsive scene patterns and arrangements**, with the existing advertiser accent/deep/glow tokens retained. No invented supplier logos, unlicensed photographs, fake model photos or unsupported endorsements. Missing verified product photos render an AVUQO-made typographic/emoji illustration rather than a false product photograph.
- Public `/partners/[slug]` pages keep the original documented merchant links, dated promotions, retailer-specific shopping topics, related verified categories and neighbouring stores, independent comparison/legal disclosures, and their existing current-offer safety gates. Editorial sections display even when a preview environment has no privileged feed credentials; **no placeholder private product rows or dummy prices appear**.
- The full `/partners` directory now previews each original retailer studio's edition, hero word and accent; search also matches studio guide topics. An advertiser-facing `/advertise` link is visible alongside existing category and shopping navigation.
- Canonical product detail pages use an **exact, fixed mapping of verified canonical merchant names** to link customers back to the appropriate AVUQO retailer studio. This does not modify offer order, product identity, stock, pricing or AVUQO Score.
- All 21 substantial public supplier guides receive indexable canonical metadata and remain part of the pre-existing sitemap. Indexing does not claim that the partner sells AVUQO-verified products or has live price feeds.

## One independent retail-studio edition per supplier
| Accepted programme | AVUQO edition | Original visual direction | Shopper guides |
|---|---|---|---|
| Tooled Up | The project desk | Workbench | Power, hand tools, workshops/outdoors |
| Petlibro UK | The companion edit | Pet care | Feeding, water, home monitoring |
| PlayPress Toys UK | The story workshop | Illustrated storybook | Building, adventures, gifts |
| Cadbury Gifts Direct | The gifting counter | Confectionery counter | Thank-yous, gifts to share, occasions |
| Mozillion | The handset gallery | Technology gallery | Handsets, everyday phones, pre-owned |
| Craft Buddy Shop | The maker's table | Craft atelier | Crystal Art, kits, gifts |
| Tyres UK | The fitment garage | Technical garage | Dimension, season, fitted total |
| Tyres Pneus Online UK | The tyre roadbook | Roadbook | Exact size, load/speed, fitting |
| Holiday Extras | The departure lounge | Travel lounge | Parking, hotel combinations, flexible bookings |
| Compare Parking Prices UK | The parking planner | Travel-parking plan | Location, timings, total quote |
| Simply MOT (UK) | The MOT desk | Garage desk | Vehicle, appointment, fees |
| Broadband Genie | The connection notebook | Broadband sketch | Availability, contract, switching |
| BroadbandCoop & MobileCoop | The co-operative connection | Green community | Mobile, home, total cost |
| Your Co-op Energy | The home energy notebook | Natural energy | Tariffs, usage, switching |
| Onestream | The fibre field guide | Fibre signal | Availability, equipment, full term |
| Lyca Mobile UK | The SIM selection | Mobile roaming | Data, roaming, renewal |
| 1pMobile | The everyday mobile edit | Everyday mobile | Allowance, top-ups, coverage |
| Chattr Sim Only | The clear-talk guide | Conversation | Data, contract, network |
| AutoAid Breakdown | The roadside essentials | Roadside assistance | Policy subject, rescue, renewal |
| EPCs, Gas Safety Certificates and Electrical Check | The property checklist | Property grid | EPC, gas, electrical |
| Christmas Letters from Santa | The festive writing desk | Seasonal stationery | Personalisation, recipient, postage |

## Back-office quality review
`/control-centre/supplier-studios` uses existing owner/admin authentication and provides a 21-card visual QA preview with each unique edition, accent and chapters, links to the public storefront and existing categories, and a practical source, branding and mobile audit checklist. It does not expose raw private Awin data or change account/advertiser rights. It links to the existing `/control-centre/supplier-readiness` and source-approval screens.

## Release gates and truthful source policy
1. No new images are downloaded or hotlinked to supplier sites without independently cleared publication rights. The hero/photo cards use ONLY `verifiedOffersForAdvertiser`, whose existing eligibility path validates accepted programme, exact canonical merchant identity, active source, owner release, permitted source imagery, fresh GBP offer, stock and own-publisher deep link.
2. No existing private feed rows, rejected advertiser correspondence, unverified affiliate prices, draft offers or unsourced product description are exposed in customer pages.
3. The big available-product shelves are retailer-only views of currently eligible offers. Item price excludes unverified delivery. A single seller is never presented as cheapest across the market.
4. Existing product comparison pages still compare all independently eligible retailers by evidenced item price or fully verified total, **never by affiliate commission**. Additional supplier-studio links are merchant identity navigation only, not featured placement.
5. Tyres remain blocked from two-supplier public comparisons without explicit GBP, full fitment and complete fitting/delivery evidence. Mobile, broadband, energy, insurance, travel bookings and MOT services need category-specific quote/terms adapters; the bespoke editorial studios do not invent tariffs.
6. Individual page indexing is for newly substantive first-party buying guides. Marked AVUQO editorial identity avoids representing the page as the merchant's official site.
7. Complete CI, lint, build, 21-studio regression, supplier image/right source review, preview/prod HTTP body, mobile width and runtime error checks before signoff. Anonymous access to owner-only dashboard must remain blocked.
8. Keep all original handovers/source matrices untouched except additive dated entries. Six mandatory project status/handover JSON and Markdown files must be extended. Latest release results must be recorded only after they are verified.

## Remaining commercial follow-up
- Ask each supplier for their **actual authorised logo, brand artwork, hero/campaign images, fuller specifications and editorial corrections**. The implemented 21 editorial themes are original AVUQO treatments, not approved official trade dress; do not masquerade as supplier sites.
- Reconcile permission to reuse full description text and supplier account IDs, then re-import genuinely current authorised source rows. Supplier description pipeline from PR #332 retains text privately until rights are granted; this storefront build does not change that flag.
- Fill product coverage: improve existing physical-retailer feeds, confirm Craft Buddy public scope, add specialist adapters for accepted service suppliers, ensure accurate category matching and source freshness.
- Use the new owner visual QA to inspect all 21 pages at mobile and desktop breakpoints, test every outgoing link and make supplier-specific improvements in response to evidence rather than invented claims.
- Recover eligible Awin rejections with public, accessible category/storefront examples; check the account promotional classification rather than falsely changing publisher type.
