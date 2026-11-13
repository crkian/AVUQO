# AVUQO · Real Production Visual QA · 13 November 2026

**Goal:** compare actual public production rendering at desktop and phone sizes against the original **warm-premium** AVUQO design, using evidence that persists across chat restarts. This is a review aid, **not** a claim that every mockup is pixel-matched.

## The automation
- GitHub Actions workflow: `.github/workflows/production-visual-audit.yml`, runs on first merge, manually from Actions and weekly at **08:00 UTC Monday**.
- Script: `scripts/production-visual-audit.mjs`, uses headless Chrome (Puppeteer Core) **without authentication** and with no API/retailer keys. All captures target the public production domain `https://www.avuqo.com`, not a demo/preview.
- 28 routes × 2 viewports (**1440 × 900 desktop**, **390 × 844 mobile**) yields up to **56 screenshots**. Captures report `visual-audit-output/report.md` and machine-readable `report.json` as GitHub Actions artifacts named `avuqo-public-visual-audit`, kept for 14 days.
- Checks each public route's HTTP status, first `h1`, DOM horizontal overflow, visible broken `<img>` tags and JS page errors. It records the actual Vercel `data-dpl-id` served. The audit **fails** on flags but never deploys or changes inventory.
- Account-related pages are accessed **unauthenticated only** to avoid exposing private screenshots; actual signed-in experience still needs separate authorised manual testing. **Control Centre and /preview paths are excluded** from public screenshot capture.
- Full-page screenshots can be limited if a document exceeds 15,000 pixels vertically to avoid Chrome resource exhaustion; this is noted in the report.

## Page-by-page design checklist
| Journey | Pages | Visual conditions to verify |
|---|---|---|
| Brand & homepage | `/`, `/discover` | seasonal Black Friday/Christmas/Easter/Valentine hero, responsive image crop, AVUQO lockup, shopping intelligence panel, CTA order |
| Main shopping | `/shopping`, `/marketplace`, `/marketplace/compare`, `/products` | typography, category/product card hierarchy, photo sources, no fictional offers or brand score |
| Department showrooms | `/categories`, `/tech`, `/home`, `/beauty`, `/fashion`, `/toys`, `/pets`, `/gifts` | 25 departments, lifestyle photos, desktop and mobile tile density, no horizontal scroll |
| Seasonal | `/sales`, `/black-friday`, `/easter`, `/valentines`, `/christmas` | editorial photo-led hero, category rail, stories, shopping planning and honest empty states |
| Travel & groceries | `/travel`, `/groceries` | responsive filters/controls, unmistakable illustrative vs verified quote distinctions |
| Tyres | `/tyres`, `/tyres/find`, `/tyres/compare` | tyre showroom special styling and fitment/navigation, no layout regression |
| User journey shell | `/saved`, `/watches`, `/lists`, `/account` | unauthenticated view only; sign-in and authenticated RLS flows separately |

## Against what?
- `docs/design/AVUQO_VISUAL_REFERENCE_INDEX_2026-11-10.md` indexes 16 uploaded reference images and maps them to the page groups.
- Original binary concepts: branch `design/warm-premium-visual-system-20261105`, `docs/design/mockups/`.
- Original implemented but older code: `feature/warm-premium-experience-v1-20261105`. **Never merge wholesale over current main.**
- Look: ivory/cream, editorial ink/navy, subtle violet, photo-led merchandising, rounded premium surfaces and clear responsive hierarchy.

## Acceptance / current truth
- Production release PR #136 has already deployed the automatic UK seasonal homepage switching; calendar and Awin/eBay/tyre rights are unaffected by this screenshot workflow.
- **Baseline as of 13 Nov:** 28 pages previously returned HTTP 200 with shared branding. This only proves server markup, not screenshot appearance or image loading.
- **Visual approval pending** until a Chrome screenshot audit artifact is generated and images are actually reviewed. A workflow passing HTTP/overflow checks cannot alone prove visual fidelity.
- Human review must approve the real pages after inspecting screenshots, product evidence disclosure, and authenticated personal/owner controls. Fix only observed defects on fresh main; do not add fake prices/images to fill gaps.
- Future chats: use `AVUQO_START_HERE.md` and review the latest GitHub Actions visual-audit artifact and `docs/AVUQO_CURRENT_STATE.json`. The report is evidence specific to its recorded deployment SHA, **not current-state telemetry**.
