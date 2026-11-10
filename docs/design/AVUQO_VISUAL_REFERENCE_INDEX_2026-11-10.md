# AVUQO DESIGN REFERENCE INDEX · 10 November 2026

**This file is the permanent cross-chat index for the user's uploaded mockups and the original warm-premium design pack.** These are *design references*, not screenshots of current production or evidence of real prices/scores.

## The original approved visual direction

Source design branch: `design/warm-premium-visual-system-20261105`

Now copied into the working design-restoration branch:
- `docs/design/AVUQO_WARM_PREMIUM_VISUAL_IDENTITY_2026-11-05.md` (creative rules)
- `docs/design/AVUQO_PAGE_BLUEPRINTS_AND_DESIGN_COVERAGE_2026-11-05.md` (page coverage)
- `docs/design/avuqo-warm-tokens.v1.json` (colour and spacing)
- `docs/design/AVUQO_ASSET_REGISTER_2026-11-05.md` (illustration/image usage)
- `docs/design/mockups/ASSET_MANIFEST.json` (original binary asset names and origin)

**Binary preview images remain on the original design branch** under `docs/design/mockups/` until a separately validated binary migration. Do not imply the mockup PNGs are deployed webpages. The uploaded user screenshots are in the Project conversation/files, not the public repository.

## Every supplied visual reference inspected

| Uploaded file | What it shows | Implementation requirement |
|---|---|---|
| `1000033119.png` | Christmas at AVUQO | Photo-led festive hero, six gift/home/food/toys/fashion/travel cards, discovery stories, planning, verified-only products |
| `1000033120.png` | My AVUQO account dashboard | Personal overview, saved items, watches, lists, budgeting and recent activity; genuine owner data only |
| `1000033121.png` | Beauty page | Blush photography, specialty rails, product-by-product decisions, fact-backed trusted-product cards |
| `1000033110.png` | Shared lists | List photo cards, privacy/shared labels, real item counts and permissions |
| `1000033112.png` | Easter at AVUQO | Spring lifestyle hero, gift category rail, discovery stories, groceries and planning; no fake savings |
| `1000033113.png` | Valentine's at AVUQO | Rose-tinted gifting editorial, date-night/experiences, care and planning, real eligible offers only |
| `1000033114.png` | My Watches | Price watch rows with real tracked prices and user-defined targets; never mock live drops |
| `1000033115.png` | Home & Living | Warm interiors, six speciality tiles, room stories, explainers and approved product highlights |
| `1000033116.png` | Full design overview | Header, home, product detail, seasonal pages, groceries, travel, account, owner Control Centre, mobile and full style palette |
| `1000033117.png` | Home storefront + categories | Main warm-photo shopping home with intelligence panel, product cards, department mega menu and groceries/price planning |
| `file_00000000c30c81f4b1db6a04908c02f9.png` | Three logo/visual identity explorations | Original design direction considered premium/discovery; not licence to replace the existing brand with every option |
| `1000033055.jpg` | Android tyre-spec fingerprint rejection | Historical operational defect; source-file verification blocks unrelated import files. Not a design mockup |

Other original reference filenames still preserved on the design branch:
`AVUQO_DESIGN_CONTACT_SHEET.jpg`, `full-storefront-and-navigation-concept.png`, `product-profile-page-set.png`, `category-beauty.png`, `category-home-and-living.png`, `category-tech.png`, `seasonal-christmas.png`, `seasonal-black-friday.png`, `seasonal-easter.png`, `seasonal-valentines.png`, `seasonal-sales.png`, `account-profile-screen-crop.png`, `watches-screen-crop.png`, `shared-lists-screen-crop.png`, `saved-items-screen-crop.png`.

## Stable design contract

**AVUQO stays one brand and one site.** Warm ivory `#FAF8F3` and warm cream `#F7F3EC` are the default canvas, white and warm white cards, navy `#17142B` / editorial ink `#302639` for type, violet `#5B35F5` to indigo `#3A20BD` gradients for primary controls, sparing blue `#3478F6`. Rounded 16–26px surfaces, shadowed cards, generous whitespace, strong photographic category stories and 44px+ controls. Tyres may use a dark plum performance-showroom subtheme without changing the global brand.

**Seasonal modules change content and photographs, not the entire brand identity.** Restore real routes for Christmas, Black Friday, Sales, Easter, Valentine's and later Mother's Day, summer and back-to-school using the same seasonal editorial layout. All generic product mockups have sample prices, scores or discounts that are design artefacts only; never re-create them with fabricated values.

**Account, Watches, Lists, budget, grocery comparisons** must use actual user-scoped RLS and live eligible source data. The screenshot numbers (saved 24, watches 6, £268 spend, discount percentages, score 9.2, etc.) are not AVUQO production facts.

## What happened, and how to prevent repeat drift

- The binary mockups were saved on a separate design branch and the detailed implementation accumulated on `feature/warm-premium-experience-v1-20261105`.
- Production `main` advanced independently with security, data, tyres and the unified v0.4.0 Marketplace. The warm-premium branch currently diverges (hundreds of historic commits) and cannot be merged wholesale.
- Fix: carry the design reference documents, screenshot map, stable tokens and selected compatible UI/components into current `main` through reviewed PRs. Update `docs/AVUQO_PROJECT_COMPASS.md` and `AGENTS.md` with verified delivery evidence.
- This index is intentionally durable: a new chat should read this page and `AGENTS.md` before proposing a redesign. References do not confer public product-image or advertiser reuse rights.

## Original user attachments and code provenance

See `docs/AVUQO_PROJECT_COMPASS.md` for the eight document uploads, checksums, original strategic specifications, existing marketing and self-advertising workspaces, automation flags and known source rights. No original font binary has been bundled or distributed.
