# AVUQO warm premium visual implementation and acceptance
**Implementation:** Draft PR #93, `feature/warm-premium-experience-v1-20261105`  
**Reference:** Draft design PR #83, `docs/design/mockups/`, contact sheet and 17 PNG references from the 5 November 2026 design pack  
**Status:** Code implementation in review. Pixel-level visual acceptance and live-data acceptance are **not** yet claimed.

## Staged completion tracker (5 November 2026)

This checklist distinguishes **implemented** from **accepted**. "Exactly" means faithful layout, spacing, imagery, interaction and responsive behaviour where assets and factual data permit. It does **not** permit copying illustrative merchant or user information as if real.

| Stage | Deliverable | Current state | Exit requirement |
|---|---|---|---|
| 1 | Inventory all 17 reference screens and map to real routes | **Implemented** | Reference images retained read-only and matched to route inventory |
| 2 | Shared design system, desktop header/search, warm surfaces, navigation and mobile breakpoints | **Implemented, not visually accepted** | Approved AVUQO logo artwork and owner review of desktop/mobile shared chrome |
| 3 | Homepage and Christmas-first annual date build-up, category pages, discovery and product grids | **Implemented, not visually accepted** | Side-by-side sign-off for hero photo crops, card sizes, responsive order and real-data variants |
| 4 | My AVUQO, Saved, Watches, Lists, Wishlist, Basket and Groceries | **Implemented, not functionally accepted** | Signed-in CRUD and RLS tests on separately approved staging user, grocery coverage and list-share tests |
| 5 | Product detail, evidence/scoring and retailer offer presentation | **Implemented under source-rights gates** | Approved non-production fixtures, variant/cost consistency and product photo rights checks |
| 6 | Quality and screenshot release gates | **Automated baseline in place; latest head to be rechecked** | Lint, build, secret scan and visual workflow on the same commit; no route, overflow, landmark or search-navigation failures |
| 7 | Final design comparison, cross-browser accessibility and release | **Not complete; owner sign-off required** | No unresolved visual differences deemed material, approved logo asset, factual merchant/customer content and explicit release approval |

**Current new coverage:** Visual smoke checks now record visible headings, header/hero geometry, missing external images as warnings and real header-search navigation on desktop and mobile. These tests do not compare rendered pixels to the mockups.

**Release blockers that cannot be invented by the implementation:** (1) the exact approved logo file, which is not established by the mockup collages or speculative redraws; (2) authorised current merchant/product assets and eligible data to populate verified cards; (3) signed-in staging accounts/data for functional acceptance; (4) human visual approval of the final screenshots. Never claim this is complete or deploy while these remain open.

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

## Image-by-image visual acceptance workflow

Visual-review CI now checks out `design/warm-premium-visual-system-20261105` **read-only after the build** and includes the 17 approved design PNGs beside new render captures in the GitHub artifact. Open `compare.html` from that ZIP to review the 1440px design and rendered page side by side, then expand the 390px mobile capture. The reference images never enter the public application build, and the design-branch source is not executed.

Apply these review rules to each page:
- Compare the **first desktop viewport**: header height, hero photo crop and contrast, headline scale, button group, category-row count and spacing, card hierarchy, and page flow.
- Compare mobile at **390px**: accessible hamburger, correct vertical stacking, no horizontal overflow, tappable navigation, readable prices and non-overlapping fixed elements.
- An illustrative mockup product **must not** be copied into a public verified-offer card without a current, independently approved offer and image rights.
- Mockup account counts, score gauges, charts, retailer logos and festive sale badges are **composition examples**, not acceptable test fixtures for production.
- Dynamic product and authenticated user detail screens still require **reviewed non-production fixtures** and owner acceptance before they can be called faithful to the reference.
- If the exact original AVUQO logo asset is unavailable, keep existing branding and mark brand fidelity **blocked**, not complete.

The generated comparison is **not** a pixel-match assertion. The accepted outcome is a visually faithful real implementation, with honest substitutions where the reference includes unverified or fictional claims.
