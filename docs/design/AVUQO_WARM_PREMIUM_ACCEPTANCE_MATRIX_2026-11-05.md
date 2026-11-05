# AVUQO warm premium visual implementation and acceptance
**Implementation:** Draft PR #93, `feature/warm-premium-experience-v1-20261105`  
**Reference:** Draft design PR #83, `docs/design/mockups/`, contact sheet and 17 PNG references from the 5 November 2026 design pack  
**Status:** Code implementation in review. Pixel-level visual acceptance and live-data acceptance are **not** yet claimed.

## Binding design rules
1. Follow the supplied mockup's **composition and hierarchy**: wide warm hero, two-row global shopping header, photographed categories, compact editorial panels, restrained gradients, large serif heading hierarchy, soft cards and clear purple actions.
2. **Do not recreate a logo**. The user's original AVUQO brand asset must be supplied or identified and approved. The temporary Q-mark inherited from `main` remains unchanged, and a separately invented A-mark was explicitly removed.
3. The mockup's example prices, crossed-out prices, percentage reductions, retailer names, product photographs, review counts, revenue figures, charts, account counts and AVUQO Scores are **not authorised merchant or user data**. Real public product cards must pass the existing `verifiedProductIndex` and source-rights gates; no private or demo feed is public inventory. Account activity must come from authenticated, RLS-scoped rows.
4. Christmas is the **only active homepage season**: UK 15 Oct–14 Nov early preparation, 15 Nov–14 Dec planning, 15–26 Dec festive. Outside that period the evergreen storefront renders. Sales, Black Friday, Easter and Valentine pages may exist as standalone editorial destinations but are not automatically promoted.
5. Preserve existing routes, RLS, role checks, source rights, grocery coverage/null logic, score calculation, outbound disclosures and the Control Centre.

## Reference-to-page acceptance matrix

| Saved reference design | Implementation route(s) | What has been implemented | Remaining acceptance work |
|---|---|---|---|
| full-storefront-and-navigation-concept.png | `/`, `/categories`, `/products`, `/groceries`, `/travel` | Two-row header, global search, photo hero, truthful evidence card, photo department ribbon, Groceries / Finds / Tools three-column dashboard | Review original approved logo; compare 1440px hero position, card heights, photos, mobile header |
| homepage-groceries-travel-profile-reference.png | `/`, `/groceries`, `/travel`, `/account` | Shopping worktop, category imagery and account entry points | Check real grocery basket and travel search behaviour in a seeded test environment |
| category-tech.png | `/tech` | Tech hero, 8 subcategories, four discovery cards, guidance, eligible product shelf | Actual photography crops, responsive grid, relevant verified products |
| category-home-and-living.png | `/home` | Home hero, photo ribbon, discovery cards, four guidance cards, product shelf | Visual compare and approved product fixtures |
| category-beauty.png | `/beauty` | Beauty hero, ribbon, discovery cards, guidance and eligible product shelf | Visual compare and approved product fixtures |
| seasonal-christmas.png | `/` during Christmas window; `/christmas` year-round guide | Christmas hero, six photo departments, discovery/planning columns, genuine festive finds or honest editorial fallback, gift finder and craft approval gate | Match photographic crops and run simulated date-transition tests |
| seasonal-black-friday.png | `/black-friday` only | Shared seasonal hero, six category tiles, discovery and planning panels, editorial finds and confidence ribbon | Not activated in automated home schedule; future date/content review |
| seasonal-sales.png | `/sales` only | Shared warm seasonal layout | No fictional sale claims; review before promotion |
| seasonal-easter.png | `/easter` only | Shared Easter hero and editorial system, six category tiles, discovery / planning and confidence | Not activated in automated home schedule; future date/content review |
| seasonal-valentines.png | `/valentines` only | Shared Valentine hero and editorial system | Not activated in automated home schedule; future date/content review |
| product-detail-screen-crop.png | `/products/[slug]` | Three-part hero, breadcrumb/tabs, real published score if available, approved retailer cost comparison, evidence state, buying specs | Actual seeded approved product and image-rights test; **no fabricated history graph** |
| product-profile-page-set.png | `/products/[slug]`, `/account` | Product / account shells and sidebars | User and product-specific screenshots required |
| product-profile-watches-lists-reference.png | `/products/[slug]`, `/account`, `/watches`, `/lists` | Matching warm cards and real signed-in collections | Account data, CRUD, responsive and browser test |
| account-profile-screen-crop.png | `/account` | Welcome photo, left navigation, four metric tiles from real private counts, recent activity, editable preferences | Sign-in / sign-out, per-user RLS and 390px screenshots |
| saved-items-screen-crop.png | `/saved` | Premium cards, sort/remove and historical price-snapshot disclosure | Real account item tests; authorised product photos not available in snapshots |
| watches-screen-crop.png | `/watches` | Horizontal watch cards and removal | No promise of price-alert emails or background monitoring |
| shared-lists-screen-crop.png | `/lists` | Private lists with creation and navigation | Shared-member permissions and interactive collaboration tests |

## Automated verification

- `npm run lint` and `npm run build` run on PR CI; verify both **on the latest head SHA**, since older runs were cancelled by later commits.
- `.github/workflows/visual-review.yml` launches the local CI build on Ubuntu 24.04 and executes `scripts/visual-review.mjs`.
- At 1440×900 and 390×844, screenshots cover the homepage, Christmas, seasonal future pages, Tech, Home, Beauty, Fashion, Travel, Shopping, Categories, Products, Search, Discover, Groceries, Account, Saved, Watches, Lists, Wishlist and Basket.
- The visual run checks HTTP response, heading, horizontal overflow and mobile menu opening/closing, then uploads screenshots and a machine-readable report as a GitHub Actions artifact.
- This is **responsive smoke testing, not a pixel-level image comparison**. External image loading, authenticated profile records and the dynamic product detail route need further visual and data QA with reviewed fixtures.

## Release gate
Do not promote or merge until: (a) latest PR build and lint both pass, (b) desktop/mobile screenshot artifacts have been reviewed against the design pack, (c) actual logo asset is approved, (d) signed-in and product-driven screens have real-fixture acceptance, (e) owner explicitly accepts remaining differences, and (f) no mock data is presented as commerce evidence.

**The implementation is not production deployed or user-accepted by virtue of passing CI.**
