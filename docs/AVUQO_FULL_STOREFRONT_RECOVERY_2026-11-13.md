# AVUQO · Full Warm-Premium Storefront Recovery · 13 November 2026
## Original sources located
- **Full screen design PNGs and manifest exist in** `design/warm-premium-visual-system-20261105`, under `docs/design/mockups/`. Some of these binary files were absent from the current `main` branch when checked; a string asset register on `main` is not the actual PNG.
- **Implemented homepage was found at** `feature/warm-premium-experience-v1-20261105`, including `app/page.tsx`, `app/homepage-warm.module.css`, `components/home/HomeShoppingDashboard.tsx`, `components/home/StorefrontQuickLinks.tsx` and styles.
- The historical homepage must **not** be merged wholesale: it predates the production source controls, latest UI and category pages.
- Other design references: PR #83 (image/mockup design assets) and PR #93 (large older visual rework). Reconcile with main, don't blindly merge.

## This restoration
- Transplants the old **StorefrontQuickLinks** shopping department strip and **HomeShoppingDashboard** groceries / deals-or-editorial / helpful tools into **real `app/page.tsx`**, preserving later home features and existing price/publication controls.
- The dashboard reads `verifiedProductIndex(8)`, which fails closed when sources/offers are not properly approved; the display falls back to honest editorial links without invented deals. The product imagery field comes from **published eligibility records** rather than private feed URL.
- Retains current `CategoryJourneys`, dual Compare + Bargains section, updated campaigns and owner-only previews. All public route links are real.
- No images from full concept mockups have been used as customer product photos. Their static mockup pixels contain fictional price/discount/score text and cannot be used as commercial product evidence.
- Full graphical recreation, mobile screenshot fidelity, logo tweaks and original mockup PNG preservation on `main` remain separate milestones.

## Evidence boundaries and acceptance
- Current GitHub PR is not production until quality, secret scan, exact Vercel SHA READY and custom domain checked.
- Verify desktop/mobile layout and images at real `https://www.avuqo.com/`, plus product, sales, seasonal and travel pages. Any issue fixes must be made against current main.
- No outside retailer offers go live solely by restoring component code.
