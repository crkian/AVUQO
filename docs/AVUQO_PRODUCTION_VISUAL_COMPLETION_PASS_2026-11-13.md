# AVUQO · Production Visual Completion Pass · 13 November 2026

## What this change does on real production routes
This is a **shared warm-premium styling and image-eligibility pass** for live AVUQO customer pages. It is **not** a blanket replacement with the older concept branch, which might regress newer source, tyre, account and owner functionality.

| Area | Real route / component | Change and evidence |
|---|---|---|
| Shared header and nav | Every customer page using `Header` | Branded gradient A + AVUQO tagline, warm search pill, focused navigation, mobile menu/dock polish. Existing auth, user role, search, MegaNav, signout, account and Control Centre links retained. |
| Shared footer | Every customer page using `Footer` | Same logo and brand tagline, editorial warm surfaces. Existing legal, email and affiliate disclosures retained. |
| Shopping homepage | `/` | Earlier PR #130–132 already restored hero, department sprite strip, shopping dashboard, comparison/bargains and evidence-first story. Uses same shared header/footer here. |
| Category atlas | `/categories` | Brand typography, warm cards/hero, keyboard/mobile states; existing 25 departments and links untouched. |
| Physical products | `/products` | Published verified product image appears **only** if admitted `published.image_url` is non-null; otherwise neutral AVUQO placeholder. Warm product cards. **No private Awin imported image is released by this change.** |
| Product detail | `/products/[slug]` | Warm product hero/art and clearer call to compare; existing `verifiedProduct`, image rights and tyre specification gates untouched. |
| Seasonal | `/sales`, `/black-friday`, `/easter`, `/valentines` | Reuse existing complete `SeasonalLanding`: photo-led hero, categories, editorial stories/planning/tools and verification disclosure. Premium typography/cards, focus/motion/mobile consistency. |
| Lifestyle | `/travel`, `/home`, `/tech`, `/beauty`, `/gifts`, `/toys`, `/pets`, other `LifestyleLanding` destinations | Editorial photography, warm category cards/CTAs and consistent responsive design. No fake hotel quotes, availability, offers or scores. |
| Specialist tyres | `/tyres` and specialist routes | Existing dark-plum specialist styling, tyre fitment rules, private feed controls **left untouched**; shared header/footer update only. |
| Accounts/admin | Saved, Watches, Lists, auth, Control Centre | Existing functionality and access controls preserved. No fake spend metrics or supplier release changes. |

## What is NOT claimed
- Designs are **code-complete for the shared pass**, not independently proven pixel-identical to every user-supplied visual board. Visual screenshot QA at desktop 1440px and mobile 390px is still required. Responsive tests are code/regression checks, not a substitute for browser screenshots.
- Some source design PNG files remain on `design/warm-premium-visual-system-20261105` rather than `main`. They are concepts with fictional products/prices/scores; do not publish those as real retail evidence.
- Publication, licensing and feed access for Awin/eBay/tyres are **not** newly granted here; product and offer gates stay fail-closed.
- Historical Awin products shown on `/preview/products` are **not** promoted to public products.
- Dropshipping checkout and live travel/insurance quotations remain out of scope without supplier/commercial approvals.

## Production acceptance checklist
- [x] Changes isolated to visual components/styles and verified-only public catalogue cards
- [x] Core header actions and owner role controls preserved in source
- [x] Real routes reuse existing components, no new permanent preview routes
- [ ] GitHub lint, build, design regression tests and secret scan pass on PR HEAD
- [ ] PR merged without overwriting newer product/source or tyre implementations
- [ ] Vercel production READY on exact merged SHA with `www.avuqo.com` alias
- [ ] Owner browser screenshot review on desktop and mobile: navigation, logo, hero, category density, cards, footer and product imagery fallback
- [ ] Independently verified current live product photos/prices before displaying customer offers

## Next after this PR
1. Check actual desktop/mobile production screenshots against the archived reference boards and fix remaining misalignments rather than guessing.
2. Reconcile any remaining original image assets from design branch without importing fictional product/price pixels.
3. Work the 11 historic PR backlog, focusing on Awin errors/rights/import fixes and tyre feed worker, then release authorised retailer products through existing admission gates.
4. Keep cross-chat handover `AVUQO_START_HERE.md` and `docs/AVUQO_CURRENT_STATE.json` current after deployment verification.
