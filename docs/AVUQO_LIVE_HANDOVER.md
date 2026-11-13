## VERIFIED UK SEASONAL CALENDAR PRODUCTION RELEASE · 13 November 2026

**PR #136 merged and application READY**: production commit `da22e97c6fdad31d23e6c972e0a39239e689d8fb`, deployment `dpl_Cj21PogF2EaRPrJ3PfQSv7ySKsmq`, aliases include `www.avuqo.com` and `avuqo.com`. Vercel's authenticated live homepage HTTP fetch confirmed the **“Black Friday at AVUQO”** main hero, its Black Friday image reference and destination on **13 Nov 2026**. Request-time UK-date calendar now automatically selects homepage image, headline and primary CTA; existing separate editorial feature uses the same date. Owner-only `/control-centre/seasonal-calendar` lists current/next-year events. All 28 audited public routes returned HTTP 200 and contained shared AVUQO branding. **This is not proof of pixel-perfect screenshots, mobile browser rendering, customer sign-in or approved retailer products.** Annual calendar does not publish affiliate offers, sponsored placements or social posts. See `docs/AVUQO_AUTOMATIC_UK_SEASONAL_CALENDAR_AND_PAGE_AUDIT_2026-11-13.md`. This documentation-only follow-up may produce a newer deployment SHA, so recheck Vercel on restart.


## Currently active: automated UK homepage calendar (13 Nov 2026 candidate)

The next priority branch `feature/automated-uk-seasonal-home-calendar-20261113` completes an automatic season selector for the live homepage hero and companion editorial spotlight, plus read-only owner Control Centre `/control-centre/seasonal-calendar`. London civil dates, future year recalculation and advertising/product permission firewalls apply. Existing seasonal pages remain actual public routes, with Black Friday descriptions no longer tied to 2026. Read `docs/AVUQO_AUTOMATIC_UK_SEASONAL_CALENDAR_AND_PAGE_AUDIT_2026-11-13.md`. **Candidate status only until GitHub CI and Vercel production READY.** Live HTTP 200 checks cover 28 public routes; real desktop/mobile screenshot and authenticated UX testing are still outstanding.
## VERIFIED PRODUCT DESIGN RELEASE · 13 November 2026 (PR #134)

The warm-premium customer design pass was **merged and deployed READY** as app commit `45da7456b66f6fa21d25753c39e497203f26c7ed`, Vercel `dpl_9fAgyrGS1Nz2Fh8Q7nyFjmVpEvG5`, with production aliases `www.avuqo.com` and `avuqo.com`. It covers the shared branded header/footer, MegaNav/mobile presentation, real category hub, public products index/details, seasonal and travel/lifestyle page styling. Product index photographs are shown only when `verifiedOffers` admits a rights-approved image; source/publication gates and Awin/eBay/tyre/Control Centre logic were not changed. **Owner desktop/mobile screenshot visual acceptance is still pending**, so do not claim pixel-perfect recreation of every concept board. This handover record itself may cause a newer docs-only production SHA; new chats must query current Vercel and read the machine state.


## Most recent design work (13 Nov 2026, release candidate)

`feature/restore-header-branding-production-20261113`: shared real-customer AVUQO gradient-A branding and tagline, nav/mobile/footer styling, warmer `/categories`, authorised-image `/products` grid, product-detail, SeasonalLanding and LifestyleLanding presentation. Preserves Awin/eBay/tyre permissions and Control Centre. **This paragraph describes a candidate, not necessarily a deployed release; recheck `main` and latest Vercel READY SHA/alias.** Source and acceptance in `docs/AVUQO_PRODUCTION_VISUAL_COMPLETION_PASS_2026-11-13.md`. After verified merge, next priority is owner desktop/mobile screenshot review and retailer rights/freshness validation.
# AVUQO · LIVE HANDOVER · START OF EVERY CHAT
**Reconciled 13 November 2026.** This is the **last verified snapshot**, not a real-time status endpoint. A fresh chat must read this from current GitHub `main` and **check Vercel** for the current deployed SHA, plus Supabase for source rights if necessary. Never assume a historical snapshot is today's production.

## 60-second startup checklist for ChatGPT or any coding agent
1. Fetch `https://github.com/crkian/AVUQO/blob/main/AVUQO_START_HERE.md`, **this file**, and `docs/AVUQO_CURRENT_STATE.json` from connected GitHub; use GitHub native tools, not guessed stale text. Also read `AGENTS.md` and `docs/AVUQO_PROJECT_COMPASS.md`.
2. Fetch `main` HEAD, all **open PRs**, their diffs/checks and branches relevant to the next task.
3. Query Vercel project **`avuqo`**, `target=production`. Record the newest **READY** deployment, exact commit SHA, target and aliases including **`www.avuqo.com`**. Distinguish latest BUILDING from last READY.
4. If source/offer/publication is involved, query Supabase project **`tfoukwcruaamrtgxzshh`**, reading live `sources`, current permission flags, private import/feed state and source readiness. Read-only first. **Code live is not proof product data is live.**
5. Read latest release register `docs/PROJECT_STATUS.md`, `CHANGELOG.md`, roadmap and relevant source/design documents; prioritize the observations from Steps 2–4 over dated prose.
6. State a concise current status: **verified production SHA**, live features, owner-only previews, pending provider approvals, open PRs, **next milestone** and blockers. Do not request the owner to re-explain earlier work when these records answer it.
7. After implementing a change, update **this handover, structured JSON, `docs/PROJECT_STATUS.md`, `CHANGELOG.md`**, and any roadmap/Compass changes; run relevant tests, confirm PR CI and Vercel production READY before claiming shipped.

## Snapshot: last confirmed live production
| Item | Verified 13 Nov 2026 |
|---|---|
| GitHub | `crkian/AVUQO`, `main` |
| Production domain | `https://www.avuqo.com` |
| Vercel project | `avuqo` |
| Deployment | `dpl_9AM8Hx9BPW2uHi9ZbswAQykbTaij` |
| Production status | **READY**, matching `www.avuqo.com` alias |
| Production commit | `ab055f73acce9a478075c61aecb0b7b248d101d3` |
| Package version | `0.5.1` |
| Supabase project | `tfoukwcruaamrtgxzshh` |

**The release chain:** PR #129 (joined Awin retailer/image URL evidence) → PR #130 (Compare+Bargains and supplier/travel/golf/insurance backlog) → PR #131 (original department strip and shopping dashboard) → PR #132 (restored full-width lifestyle photograph and evidence-first hero). All were merged and respective production deployments verified READY at the time. Original visual design **not yet completely reproduced**, especially site-wide branding, navigation, seasonal and canonical product layouts. Remaining mockup pixels are **visual references**, not actual licensed products/discounts.

## What's live versus private versus blocked
| Area | Code/UX status | Data/commercial status |
|---|---|---|
| Home `/` | **LIVE CODE**: photo-led warm-premium hero, Compare + Deals routes, category strip, groceries/tools/dashboard, seasonal modules | Product cards load only if verified offers pass public admission; otherwise editorial suggestions. No fabricated prices/scores |
| Awin | **PRIVATE CODE**: owner-only product inspection `/preview/products`, retailer Control Centre, historical private imports | **NOT PUBLIC-ACTIVATED BY THESE PRs**; signed-up status, real feed, current pricing, image/publication rights require verification |
| eBay | Sandbox/private owner preview built and owner exercised | Production Browse API access questionnaire submitted; approval not yet evidenced |
| Tyres | Dedicated model/finder/compare implementation from earlier release | No assertion that private tyre enrichment or public fitment/stock pricing is authorised; PR #117 open |
| Business email | Zoho `support@avuqo.com` | Owner verified incoming and reply sending in external mailbox |
| Auth | Supabase + Resend | Owner verified password-reset flow, live domain and signed email |
| Dropshipping | **Lead only**, not a customer checkout | Retailer-of-record model, VAT, delivery, returns and supplier API permissions need decision |
| Travel/golf/insurance | **Lead/backlog**, routes may exist editorially | No approved live prices/quotes or API keys inferred |

**Awin feed snapshot:** owner's 13 Nov CSV had 958 rows, 74 marked active over 12 distinct advertisers, 884 marked Not Joined, including PlayPress Toys UK advertiser 101445. This is **not 958 approved merchant feeds**, nor publication permission. 122,309 historical staged imports and 121,399 image references were counted previously, but they may be stale/duplicated and can't be silently marketed as live or licensed photos.

## Open PRs: historical audit queue (11 at this snapshot)
`#21 #25 #48 #50 #51 #58 #83 #85 #93 #102 #117`. Never bulk merge or delete. Priorities: privacy fix #50; CSV filename import fixes #58; terms/evidence #51; Tooled Up GBP/feed verification #102; tyre enrichment #117. Review obsolete UX branches #21 #25 #48 #83 #85 #93 against today's `main` before closing. An old PR may contain unique work even if another feature was shipped.

## Design sources and next active work
- **Original full artwork**: `design/warm-premium-visual-system-20261105:docs/design/mockups/`, with manifest; some image binaries were not on `main` when checked.
- **Original code**: `feature/warm-premium-experience-v1-20261105`; selectively port **only** absent components after inspecting current code; never overwrite Awin, eBay, tyre or customer changes.
- **Now next**: restore **real production header/logo/nav and mobile style** to match warm-premium reference while preserving functional auth, role-gated Control Centre, menus, search, responsive navigation. Then seasonal and product detail views on actual production public routes. Do not place launched features solely behind previews.
- **Business identity**: AVUQO. *Find what's worth it.* A single product catalogue for comparison + evidence-backed bargain discovery. Use `support@avuqo.com` for new outreach; keep existing eBay account email.
- **Other partner leads**: `docs/AVUQO_LIVE_PRODUCTION_PARTNER_AND_DESIGN_BACKLOG_2026-11-13.md`. Leads do not imply approved affiliation or API rights.

## Release bookkeeping procedure
A handover update is **not enough by itself to verify deployment**. In a feature PR, update status/docs, run CI, merge, confirm Vercel READY and correct alias; then either (a) follow up with a short docs-only handover PR recording the **exact merged production SHA** or (b) include a documented “last-verified” snapshot from the previous release and note that a newer release needs post-merge verification. Keep `docs/AVUQO_CURRENT_STATE.json` time-stamped; it is not a substitute for live queries.

**Fresh-chat prompt (copy/paste):**

> Continue AVUQO development. Connect to GitHub repository `crkian/AVUQO`. Read `AVUQO_START_HERE.md`, `docs/AVUQO_LIVE_HANDOVER.md`, `docs/AVUQO_CURRENT_STATE.json`, `AGENTS.md`, and `docs/AVUQO_PROJECT_COMPASS.md`. Check current `main`, open PRs, Vercel production SHA/READY/alias and, where relevant, Supabase permission status. Tell me what is **actually live versus private/pending**; continue the top eligible production task, preserving newer Awin, eBay, tyre and Control Centre work. Update the handover in GitHub as part of the release.
