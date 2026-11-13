# AVUQO | Generated image asset register

**Date:** 5 November 2026  
**Review branch:** `design/warm-premium-visual-system-20261105`  
**Storage distinction:** The full-resolution PNG files were generated in the ChatGPT workspace and collected in the deliverable **`AVUQO_Warm_Premium_Design_Pack_2026-11-05.zip`**. The GitHub connector used for these documentation commits accepts UTF-8 text and SVG but cannot transfer those already-generated local PNG bytes directly. **Do not claim the original PNG files have been committed until the ZIP contents are copied and pushed.**

## Images included in the design ZIP

All 12 full-resolution assets plus 5 enlarged single-screen crops have a manifest of SHA-256 digests in `ASSET_MANIFEST.json` inside the ZIP. The first eight are individual high-fidelity page concepts, the following four are multi-page reference boards and the final five are individual cropped screen references.

| Target relative GitHub file | Screen / purpose | Design status |
|---|---|---|
| `docs/design/mockups/seasonal-christmas.png` | Dedicated Christmas editorial landing / gifts and planning | Concept, existing `/christmas` page can be adapted |
| `docs/design/mockups/seasonal-black-friday.png` | Black Friday editorial and truth-first sales path | Concept, existing `/black-friday` page |
| `docs/design/mockups/seasonal-easter.png` | Spring/Easter shopping and planning | Concept, route not yet confirmed |
| `docs/design/mockups/seasonal-valentines.png` | Valentine's gifting and experiences | Concept, route not yet confirmed |
| `docs/design/mockups/seasonal-sales.png` | General sales and trusted savings guide | Concept, existing `/sales` page |
| `docs/design/mockups/category-tech.png` | Technology and electronics department | Concept, existing `/tech` page |
| `docs/design/mockups/category-home-and-living.png` | Home & living department | Concept, existing `/home` page |
| `docs/design/mockups/category-beauty.png` | Beauty department | Concept, existing `/beauty` page |
| `docs/design/mockups/full-storefront-and-navigation-concept.png` | Homepage, categories, groceries, navigation, product comparisons | Multi-screen design-board reference |
| `docs/design/mockups/product-profile-page-set.png` | Product detail, My AVUQO profile, Saved, Watches, Lists, mobile | Multi-screen design-board reference |
| `docs/design/mockups/product-profile-watches-lists-reference.png` | Expanded product and profile, Watch and list concepts | Multi-screen design-board reference |
| `docs/design/mockups/homepage-groceries-travel-profile-reference.png` | Broader site layout and warm interface system | Multi-screen design-board reference |

### Individual product and account panels (cropped from the reference board)

These five are enlarged crops from a single concept board, **not independently generated browser screenshots** and not evidence of live prices or account activity:

| Target file | Screen |
|---|---|
| `docs/design/mockups/product-detail-screen-crop.png` | Exact product detail, retail offer and price history concept |
| `docs/design/mockups/account-profile-screen-crop.png` | My AVUQO overview/profile concept |
| `docs/design/mockups/watches-screen-crop.png` | Price Watches concept |
| `docs/design/mockups/saved-items-screen-crop.png` | Saved products concept |
| `docs/design/mockups/shared-lists-screen-crop.png` | Shared Lists concept |

A contact sheet and this asset register are also in the ZIP.

## Required checks before production use

1. **AI illustration only.** Mockup product prices, strike-through discounts, review numbers, scores, savings, inventory, retailer logos and performance indicators are fictitious design placeholders.
2. Do **not** put these raster mockup images into the live public website as though the depicted merchandise were real available offers or the images had merchant re-use rights.
3. Use the existing `verifiedProductIndex` and gated public offer data for actual product listings; use zero/partial/no-data components when no verified records exist.
4. Preserve authorised licensed photography, brand mark accuracy, alt text and correct responsive crops when recreating layouts in React.
5. Account/profile values, customer identities and analytics numbers must be computed from real authorised sources or replaced with clear empty states.
6. Keep source/affiliate and sponsored content approval status separate from visual design decisions.

## Install original high-resolution images into the review branch

Unzip the ChatGPT deliverable to:
`%USERPROFILE%\\Downloads\\AVUQO_Warm_Premium_Design_Pack_2026-11-05\\`

Then use Windows PowerShell:

```powershell
cd C:\avuqo
git status
git fetch origin
git switch design/warm-premium-visual-system-20261105
$Pack = Join-Path $env:USERPROFILE 'Downloads\AVUQO_Warm_Premium_Design_Pack_2026-11-05'
New-Item -ItemType Directory -Force 'docs\design\mockups' | Out-Null
Copy-Item (Join-Path $Pack 'assets\mockups\*.png') 'docs\design\mockups' -Force
Copy-Item (Join-Path $Pack 'AVUQO_DESIGN_CONTACT_SHEET.jpg') 'docs\design\mockups' -Force
Copy-Item (Join-Path $Pack 'ASSET_MANIFEST.json') 'docs\design\mockups' -Force
git add docs/design/mockups
git diff --cached --stat
git commit -m 'docs(design): add full resolution warm AVUQO page visuals'
git push -u origin design/warm-premium-visual-system-20261105
```

If working tree has unrelated edits, do not discard them; inspect `git status` and use a separate worktree if needed. These image imports should remain documentation-only. No SQL, database migrations, deployed frontend changes or source connectors are required.

## Production editorial artwork · 13 November 2026

The generated, unbranded hero images in `public/editorial/` are AVUQO editorial illustrations. `black-friday.webp` is shared by the November homepage and Black Friday page. `electronics.webp`, `home-living.webp` and `beauty.webp` are department artwork. None represents a specific merchant listing or grants publication rights.

The Christmas, Easter, Valentine’s and Sales landing pages and homepage themes use four original generated WebP photographs from `public/editorial/`. Their shared paths are defined in `lib/editorial/seasonal-art.ts`. The scenes use unbranded editorial subjects.
