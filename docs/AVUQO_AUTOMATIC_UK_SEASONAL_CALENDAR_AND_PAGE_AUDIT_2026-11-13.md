# AVUQO · Automatic UK Seasonal Homepage & Production Page Audit
**Created 13 November 2026. Implementation scope: editorial only, no scheduled commercial offer publication.**

## Audited baseline (before calendar release)
Vercel `avuqo`, production READY deploy `dpl_mxAHQ6fa4gHVy2kcpqG2F6W71v7b`, SHA `e6861fda5e8b5a59dc7a872c6aba4de216ec0fe0`. Audited URLs through Vercel's authenticated site fetch. The following **28 customer routes returned HTTP 200 and included the shared `avuqo-brand-lockup` markup**:

| Area | Routes | Baseline status |
|---|---|---|
| Homepage/navigation | `/`, `/discover`, `/marketplace`, `/marketplace/compare`, `/shopping` | HTTP 200, branded |
| Category and departments | `/categories`, `/tech`, `/home`, `/beauty`, `/fashion`, `/toys`, `/pets`, `/gifts` | HTTP 200, branded |
| Seasonal | `/sales`, `/black-friday`, `/easter`, `/valentines`, `/christmas` | HTTP 200, branded, editorial images in server response |
| Shopping, travel and groceries | `/products`, `/travel`, `/groceries` | HTTP 200, branded; product list may honestly be empty of approved goods |
| Tyres | `/tyres`, `/tyres/find`, `/tyres/compare` | HTTP 200, branded |
| Personal | `/saved`, `/watches`, `/lists`, `/account` | HTTP 200, branded; auth-dependent behaviour not independently verified |

**Review limitations:** HTTP fetch verifies routing/server markup and image references, **not actual screenshot layout, image render/crop quality, visual regression pixel matching, browser console, mobile interaction or authenticated user outcomes**. Previous wording “all pages visually checked” would be inaccurate. Further desktop 1440px, tablet 768px and mobile 390px screenshots and owner approval remain required. Do not expose private dashboard information to run public visual scans.

## Calendar implementation
The **existing** `lib/editorial/seasonal-schedule.ts` and `HomeSeasonalSpotlight` have been expanded rather than replaced with parallel schedulers. `lib/editorial/seasonal-date.mjs` provides a pure Europe/London civil calendar and annual date calculations; TypeScript declarations make it usable on Next.js pages.

**Automatic homepage** `/`: on each request, `await connection()` ensures the time-sensitive page is not frozen at build time. Its main photographic hero, headline, editorial copy and primary CTA now change to the correct theme **at UK local midnight**, plus the existing seasonal feature. The regular compare route, shopping dashboard, verified-only product index and approval controls remain untouched. No cron needed for the time-driven editorial switch.

**Owner controls:** `/control-centre/seasonal-calendar` is inherited from the existing authenticated, owner/admin-gated Control Centre layout. Shows current UK theme and this/next year's planned windows, with links to real public pages and approved campaign placement management. **Read-only** scheduling, no live-merchant switch or social publishing.

| Theme | Dates and rule | Public destination |
|---|---|---|
| Winter/post-Christmas sales | 27 Dec–20 Jan | `/sales` |
| Valentine's | 21 Jan–14 Feb | `/valentines` |
| Mothering Sunday | 14 days before UK Mothering Sunday through that Sunday | `/gifts` |
| Easter | 20 days before Easter Sunday through Easter Monday | `/easter` |
| Father's Day | 14 days before 3rd Sunday in June through that Sunday | `/gifts` |
| Summer | June–August, except priority campaigns | `/travel` |
| Back to school | 15 Aug–10 Sep, overriding summer/autumn | `/categories` |
| Halloween | 15–31 Oct, overriding autumn | `/gifts` |
| Black Friday | 1–30 Nov, annual Friday calculated for messaging | `/black-friday` |
| Christmas | 1–26 Dec | `/christmas` |
| Evergreen spring / autumn | Other matching dates | `/home` |

**2026 key checks:** Easter Sunday **5 April**; Mother's Day **15 March**; Father's Day **21 June**; Black Friday **27 November**; Christmas begins **1 December**; Boxing Day remains Christmas and 27 Dec transitions to winter sales. Date functions recalculate for later years; DST-aware London civil dates and year boundaries have regression tests.

## Commercial and editorial separation
- Changing theme **does not make an imported Awin/eBay/tyre product public** or activate credentials, publishing, paid marketing, discounted-price assertions or sponsored placements.
- Merchant permissions, source freshness, offer validity, licensed product imagery and user/tracking consent continue through their separate existing controls.
- Approved paid homepage placements continue through `loadHomeCampaigns` and distinct sponsored labels. The UK calendar is editorial and cannot fabricate discounted product cards or AVUQO Scores.
- Seasonal page designs remain on **real production routes**, never only in `/preview`.

## Pre-merge and post-deployment gates
- [ ] Date boundary/DST/Easter/Black Friday tests and existing CI pass
- [ ] Vercel preview READY, then merged production exact SHA READY and `www.avuqo.com` aliases
- [ ] Re-fetch live homepage to confirm **Black Friday in November 2026**, including main hero, and owner Control Centre authenticated calendar view
- [ ] Obtain actual browser screenshots across desktop/mobile and inspect layout, spacing, focus, image availability and mobile nav before claiming visually pixel-complete
- [ ] Reconcile `AVUQO_START_HERE.md`, `docs/AVUQO_LIVE_HANDOVER.md`, `docs/AVUQO_CURRENT_STATE.json`, `docs/PROJECT_STATUS.md` and `CHANGELOG.md` after deployment

No false claim of full visual acceptance or approved supplier rights is permitted.
