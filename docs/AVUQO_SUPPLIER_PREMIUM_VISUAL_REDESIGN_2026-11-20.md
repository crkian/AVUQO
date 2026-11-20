# AVUQO premium supplier-studio visual redesign
**Date:** 20 November 2026
**Status:** Candidate implementation until full green CI, reviewed merge and exact production verification.
**Branch:** feature/premium-supplier-studio-art-direction-20261120

## Owner feedback and purpose
The first 21-studio release (#334) supplied individual stories, palettes and shopping journeys, but its visual system still looked too basic. Every accepted supplier should have a distinctive, thoughtfully art-directed retail destination that is impressive to its own team and useful to shoppers. This is a genuine layout and merchandising upgrade, not a substitute for rights-cleared content, live product imports or comparison evidence.

## Design approach
Retain original AVUQO cream/plum identity and existing 25 shopping departments, product browse and 21 approved advertiser routes. The original attached AVUQO brand reference shows modern/confident, premium/discovery and energetic treatments; this release builds on existing warm-premium art direction without falsely asserting a new formally selected official logo.

The redesign includes:
- A spacious magazine-quality hero with substantial custom type, tailored subheading, source caveats and elegant CTAs rather than generic cards.
- One dominant current source-eligible product image when permitted, a restrained 2-image secondary collage, a genuine item-price label and a link to the exact eligible product. No false delivered totals or cheapest-market badges.
- Without rights-cleared source photos, bespoke first-party line-art scene motifs for all 21 advertisers, not generic oversized emoji or hotlinked unofficial assets.
- Four-section studio navigation linking the actual editorial decision guide, source-eligible shelf, further discovery and supplier contribution invitation.
- A refined asymmetric buying guide with three genuinely useful advertiser-specific decision chapters, optional live source-matched product examples and category links.
- An asymmetric verified-product grid with a substantially larger editorial spotlight for one eligible item, then secondary current offers, rather than many indistinguishable boxes. The editorial feature is not a paid placement or AVUQO Score.
- Beautiful but restrained related shopping navigation, merchant campaign panels, independent comparison checks and affiliate disclosures.
- A dark editorial supplier-contribution section that invites rights-cleared photographs, descriptions, campaign assets and product corrections without selling organic rankings.
- A substantial retailer directory feature gallery for Tooled Up, Petlibro, PlayPress and Holiday Extras with authorised photos only where an existing public offer qualifies; otherwise original line art. All 21 partner pages remain searchable without fee or priority.
- Original line-art studio identities on all directory cards and in the owner-only visual QA gallery.

## Implementation files
components/partners/PartnerStudioExperience.tsx
components/partners/StudioGlyph.tsx
app/partners/studios.module.css
components/partners/FeaturedPartnerEditions.tsx
app/partners/featured.module.css
components/partners/RetailerCatalogueBrowser.tsx
app/partners/partners.module.css
app/partners/page.tsx
app/partners/[slug]/page.tsx
app/control-centre/supplier-studios/page.tsx
app/control-centre/supplier-studios/page.module.css
tests/premium-supplier-retail-design.test.mjs
.github/workflows/quality.yml

## Original requirements and release safeguards
1. No unauthorized merchant photos, official trademarks, campaign graphics or fabricated endorsements. The page is AVUQO editorial presentation, not a claim to be the merchant's official shop.
2. All public product imagery and product prices come only through verifiedOffersForAdvertiser and the existing independent offer gates. No raw private feed data, previews, missing-rights images, new source permissions, service prices or hidden inventory automatically appear.
3. Keep stock, GBP, explicit Awin publisher tracking, exact identity, source/image rights, atomic owner release, score and comparison rules untouched. The first product's larger visual merchandising does not change independent AVUQO ranking.
4. Preserve live tyre restrictions, no invented public grocery comparisons, independent affiliate disclosures, all original categories and historic 29-workstream/12-gap scope.
5. The new directory fetch is bounded and rejects missing privilege evidence by rendering an original editorial visual instead of a made-up supplier product.
6. Owner visual review route stays authenticated and does not modify supplier permissions.
7. CI must pass Build, Lint/regressions, native PostgreSQL synthetic tests and secret scan, then exact Vercel preview and production body checks.
8. Verify 21 public partner URLs, main catalogue/shop, representative product-detail return links and current public offer availability without treating HTTP 200 as pixel-level screenshot signoff.
9. Do not overwrite or truncate any of the six cumulative handover Markdown/JSON records. Release results must be recorded only after actual evidence exists.

## Remaining commercial work
Ask each supplier for genuinely approved official logo files, brand guidelines, campaign hero images, specifications and fuller source descriptions. Reconcile source-specific rights and Awin IDs, especially Petlibro. Use the description-evidence build from PR #332 for current and permitted copy. Extend correctly approved product coverage to Cadbury, Mozillion, Craft Buddy, Tooled Up and other sources. Build genuine quote adapters for mobile, broadband, energy, tyres, MOT, airport parking and travel. Test real mobile and desktop browser viewports and collect partner feedback before promising a formally co-designed supplier storefront.
