# AVUQO | Page mockups and implementation blueprint

**Version:** 1.0 / 5 November 2026  
**Classification:** Design references only. Image-generation previews are **not** live website screenshots or claims of approved merchant inventory.  
**Source files consulted:** Original Master Product Build specification; Intelligent Supermarket Comparison addendum; 28 October unified Source of Truth; Affiliate Promotion spec; Analytics spec; the repository's living status/roadmap/source audits; current source code.

## Sitewide page model

Shared header, universal search, seven navigation groups, a searchable 25-department mega menu and a compact mobile dock. Use a warm paper background and lifestyle editorial photography, with violet/indigo as an accent. Consider sticky useful tools where appropriate, not artificial urgency.

### Public route coverage and desired designs

| Area | Current code / route | Design intention and truth boundary |
|---|---|---|
| Homepage | `app/page.tsx` / `/` | Preserve existing warm editorial home, reassurance strip, campaign rail, lifestyle explorer and department shelf. Enhance image selection, premium cards and navigation rhythm. Any price or score tile must come from real eligible records. |
| Discover | `/discover` | Browsable editorial stories and verified offer rail; never substitute sample deals when empty. |
| Categories hub | `/categories` | Full curated atlas, search and department explorer; add bespoke visual tiles for editorial department cards. |
| Department guides | `/categories/[department]` | 25 curated families, existing topic links and reliable no-data states; not 1,384 publicly activated catalogue pages. |
| Technology | `/tech` | Bright desk, warm room, laptops/headphones, subcategory row, compatibility advice and genuine available listings. |
| Home & living | `/home` | Sofa, fabrics, indoor plants, warm lamps; furniture, kitchen, bedding and storage journeys. |
| Beauty | `/beauty` | Soft blush, ceramic and botanical textures; skin suitability, product size and ingredients. |
| Fashion, toys, pets, gifts | `/fashion`, `/toys`, `/pets`, `/gifts` | Individual photographic stories and section-specific editorial cards; shared layout mechanics. |
| Christmas | `/christmas` | **Exists now** as dedicated Christmas page with gift-finder and craft pathways. Concept: candlelight, gift categories, lists and budgets. No fictional verified Christmas discount cards. |
| Black Friday | `/black-friday` | **Exists now** through `SeasonalLanding`; sophisticated plum/black accent used sparingly; planning, real price evidence and no fake deal countdowns. |
| Sales | `/sales` | **Exists now** through `SeasonalLanding`; continuous sale/discovery guide with verified feed rail only when eligible. |
| Easter | **No dedicated route confirmed on current `main`** | Planned `/easter` if approved; spring scenes, gifts, baking, family activities, household planning. Keep template off nav until built. |
| Valentine's | **No dedicated route confirmed on current `main`** | Planned `/valentines`; flowers, gifting, beauty, experiences, lists, appropriate retailer/price notices. |
| Summer and other campaigns | Strategic seasonal calendar requirement | Reuse common seasonal page architecture, art direction and owner scheduling controls only once implemented and authorised. |
| Product list | `/products` | Clear exact products, category filters, evidence-gated cards, never fill grid with unavailable offers. |
| Product detail | `/products/[slug]` | Gallery, exact variant, specifications, offer comparison, source freshness, total payable price, meaningful save/watch actions, accessible provenance. Price history only when actual observations exist. |
| Live offers | `/live`, `/live/[offerId]` | Dynamic eligible offer views; visible status/freshness and no unverified import promotion. |
| Contract compare | `/compare` | Existing contract calculator should keep its **illustrative** nature visible; never masquerade as real provider quotes. |
| Groceries | `/groceries` | Current real basket builder/quantity/store selection and personal prices; brighten dark gradient hero with lifestyle imagery without weakening exact-match/complete-basket safeguards. |
| Saved | `/saved` | Account shortlists with product thumbnails only when permitted and real; simple empty states and clear item retrieval. |
| Watches | `/watches` | Existing Watch persistence; do not promise delivered price-change alerts until verified scheduled notification functionality exists. |
| Lists | `/lists`, `/lists/[id]` | Familiar household cards, collaboration status based on real permissions, gift/shopping/trip list identities. |
| Account/profile | `/account` | Current profile preferences and signed-in forms; proposal: joined overview of Saved, Watches and Lists, with real counts or neutral empty-state skeletons. |
| Budgeting | Strategic feature pillar, **not confirmed public route** | Planning mockup only; must not show fabricated bank transactions, spending summaries or actual user savings. |
| Travel & experiences | `/travel`, `/experiences` | Rich destination photography and editorial guidance; real comparison/booking controls only when provider integrations are authorised. |
| Control Centre | Existing owner routes | Separate practical administrative product; warm surface tokens are appropriate, but no decorative metrics or fake revenue. Owner-only access remains enforced. |

## Seasonal template blueprint

1. Shared AVUQO chrome; optional temporary eyebrow such as “Christmas 2026”.
2. Warm, full-width story hero with strong readable text and genuine editorial photo.
3. Horizontal **seasonal subcategory cards** (gifts, home, food, toys, fashion, travel as relevant).
4. Editorial inspiration and category-guide panels, not thin keyword landing pages.
5. Seasonal planning tools linking to existing Groceries, Saved, Watches and Shared Lists.
6. **Eligible offers region** with verified retailer offers if available; otherwise meaningful discovery cards or a candid no-current-offers state.
7. Practical value advice, cut-off dates only when sourced, clear affiliate disclosure and shared footer.
8. Search, accessible mobile stacking, filters and useful focus states.

## Category template blueprint

1. Hero image with photo-specific crop, a locally themed headline and category-purpose line.
2. Thematic product/subcategory icon-and-photo strip (clickable actual routes or search paths).
3. Four varied editorial story cards.
4. Buying guides: what to compare, compatibility, cost over time, safety/suitability.
5. Available exact-product cards and comparison entry points, gated by approved data.
6. Cross-links to relevant Saved, Lists, Watches and wider AVUQO navigation.
7. Helpful absence state when no publishable source coverage is available.

## Product detail blueprint

- Breadcrumb: Home › department › subcategory › exact product.
- Large image gallery with keyboard-accessible thumbnail controls and accurate image alt text.
- Product title, brand, variant/specs, condition and pack size.
- Evidence rail: AVUQO Score and confidence **only if actually computed**, checked date and exact-match certainty.
- Retailer cards sorted by total comparable price when warranted, delivery/fees and stock caveats visible.
- Tabs: overview, specs, price observations/history, alternatives with explicitly identified differences, seller terms.
- Save and Watch controls based on true account availability and feature status.
- Recommendations must not depend on affiliate commission.
- If no eligible retailer offer: honest “No verified retailer offers for this variant yet”; useful navigation and real product details may remain.

## Profile and personal shopping blueprint

- Warm “My AVUQO” header; display name only when account provides it.
- Left-hand navigation for Overview, Saved, Watches, Lists, Preferences and Account settings.
- Real item counts rather than fictional engagement graphs, mock earnings or budgets.
- Accessible privacy and notifications controls. Authenticated account and RLS boundaries preserved.
- Shared Lists reflect real membership and permissions; don't imply joint access without invites.
- Watch triggers/delivery remain explicitly distinct from a saved Watch record.
- Future budgeting surfaces should carry “Coming later” / preview labels until implemented.
- Mobile: logical condensed cards and existing `MobileDock`.

## Design-to-code mapping

Reuse before creating new components:
- `components/layout/Header.tsx`, `MegaNav.tsx`, `MobileDock.tsx`, `Footer.tsx`
- `lib/content/navigation.ts` and `lib/categories/browse-tree.ts`
- `components/categories/DepartmentExplorer.tsx`
- `components/lifestyle/LifestyleLanding.tsx`
- `components/editorial/SeasonalLanding.tsx`
- `app/christmas/page.tsx` for custom festive needs
- `app/products/[slug]/page.tsx` for exact products
- `app/groceries/GroceryClient.tsx` and `lib/groceries/compare.ts`
- `app/account/page.tsx`, `app/saved/page.tsx`, `app/watches/page.tsx`, `app/lists/page.tsx`

## Release approach

**No code changes are part of these mockups.** Follow a review-approved phased process: token/component pilot → desktop and mobile QA → image-licence and merchant rights checks → automated build/accessibility checks → deployment review → browser verification.

**Never infer** that AI imagery proves real offers, an active affiliate partnership, connected grocery feeds, live analytics, budget data, verified alerts or approved product-image rights.
