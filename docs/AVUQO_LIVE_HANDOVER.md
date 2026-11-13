## Product comparison and My AVUQO candidate · 13 November 2026

Production starting point was `78a17cfc6daef5d3913c6956825b83264c94155d`. The candidate brings retailer comparisons closer to product details and gives My AVUQO distinct guest and signed-in layouts. Catalogue evidence gates and account access controls stay in place. Browser acceptance for private account features depends on an authenticated session.

## Seasonal artwork verified · 13 November 2026

PR #169 is READY on the production domain at `3caf3f6f8800addca8436edf9d0979566e02ef45` (`dpl_5SwnUJNdTUQDBcZRtUFUsqaJauM6`). Christmas, Easter, Valentine’s and Sales now use dedicated, unbranded local WebP artwork, shared with their existing homepage themes. Signed-out production browser checks confirmed the expected hero and no horizontal overflow on all four pages at 1348 and 449 CSS pixels. Build, lint, secrets and date-rotation checks passed. Christmas gift planning and evidence gates remain intact.

Next visual work: refine product and signed-in account layouts.

## Seasonal artwork candidate · 13 November 2026

Verified starting point is production `85359fdd5803fc063632d1fe0720400bd4883c41`. The candidate adds locally hosted art to the Christmas, Easter, Valentine’s and Sales pages and their existing homepage themes. Deployment and browser acceptance are pending.

## Black Friday and department artwork verified · 13 November 2026

PR #167 is READY on the custom domain at `50a3e9d3a1fdc2b7457683f2688667b6df0cb2a6` (`dpl_GUSqxRdimdjEzNoagagxJ9pQZXKF`). Build, lint, secret checks and targeted design/date tests passed. The Black Friday landing page and date-driven homepage use the new locally hosted editorial artwork. Electronics & Tech, Home & Living and Beauty now have distinct artwork and direct headings. Signed-out production browser checks confirmed the landing and department pages render at desktop and 449 CSS pixels without document overflow. No provider, customer or schedule changes.

Next visual release: bring Christmas, Easter, Valentine’s and Sales artwork closer to the reference, then refine product and signed-in account composition.

## Editorial hero refresh candidate · 13 November 2026

Last verified baseline before this change: `821b730ba71a6550e861ce2560f6cf51485e3c28`, `dpl_HC9FkzX8JxsvCNHtL2GhLbPrtmtC`. Candidate updates the seasonal hero layout and adds locally hosted Black Friday, Electronics, Home & Living and Beauty artwork. No mockup prices, merchant imagery or supplier changes. Verify exact deployment and desktop/mobile before closing the release.

## Production visual audit passed · 13 November 2026

PR #165 is READY on the custom domain at `a2d1be5d988a0d8908acd1936223621d58fa6af4`, deployment `dpl_EEM8GELPoKxkjit6W1m5LG6thKw5`. [Audit run 43509641975](https://github.com/crkian/AVUQO/actions/runs/43509641975) passed 124 captures across 31 public routes at 1440, 768, 390 and 360 pixels. All logged HTTP statuses were 200. There were zero flagged cases. This is signed-out capture evidence. Signed-in end-to-end and mockup-by-mockup visual completion remain open.

Production read-only checks found 62 feed refresh flags across 74 observed feeds. Awin remains paused with sync off. The metadata monitor has recorded nine successful checks. Marketing publishing and AI are disabled with emergency stop on and zero publication jobs. No approved homepage campaigns are currently live or scheduled. Anonymous access to feed observations was confirmed absent. The existing Pneus cron is unchanged.

PR #158 exact lease SQL passed isolated single-connection PostgreSQL checks for role grants, blocked and paused-source gates, lease ownership, renewal and expired reclaim. Production has the journal at migration version 20261113202720 and no lease RPCs. A two-connection race, migration-history reconciliation and approved current feed evidence remain outstanding. No SQL was applied to production.

## Verified Saved, Watches and Lists release · 13 November 2026

PR #164 is READY on the custom domain at `41932649077862ce8ce1d226bcd957dba3616612`, deployment `dpl_8tTvq2WhzbvkDYiEMre98iV7fqv1`. GitHub quality and secret checks passed. Saved, Watches and Lists recognise live-offer IDs and preserve historical demonstration links. No database migration or customer-data rewrite was used. Superseded PR #21 closed after its fix and historical delivery plan reached main.

Public screenshot audit run [43508505598](https://github.com/crkian/AVUQO/actions/runs/43508505598) captured 31 public routes at 1440, 768, 390 and 360 pixels. The 66 flags were cached HTTP 304 responses; the run reported no document overflow, broken image elements, browser render errors or other failing statuses. The follow-up bypasses the browser cache and accepts valid revalidation responses with rendered content. Direct production browser check at 337 CSS pixels confirmed visible search, successful submission, no document overflow and menu dismissal with Escape. The test was signed out. Actual product and merchant images, offers and automated alert delivery remain gated.

Next production work: replace generic seasonal/category photography with approved editorial assets and refine category/product/account composition. Keep #83 as design source, #93 for remaining selective design work, #25 for taxonomy review, and #117/#158 for controlled private tyre validation. No new marketing campaign, social posting, supplier auto-import or feed publication approval was applied. Existing Pneus schedule remains 08:41 UTC daily.

## Mobile search release verified · 13 November 2026

PR #163 is READY on the custom domain at `9093cbc9d9f4b814beea5cb82b432896879a4e98`, deployment `dpl_CSmkg3D9G2BZht1MzRj6wFgpHDnQ`. GitHub quality and secret checks passed. Existing production screenshot audit run 43508505598 now covers four widths. Superseded PRs #48 and #85 closed after their unique evidence and requirements reached main.

Candidate selectively ports the remaining saved-offer destination bug fix from #21 and preserves its original roadmap. No customer records will be rewritten.

## Private Awin monitor and homepage scheduling verified on production · 13 November 2026

PR #162 is READY on the custom domain at `b0cc915c6af15eff0b853ed9fb05fc58fcf72ae2`, deployment `dpl_9BeEhxZGbE9RYSfmUmUqbWzKkXbf`. GitHub quality and secret checks passed. Read-only production DB checks earlier today recorded nine successful Awin metadata checks, 74 observed feeds and a last success at 06:17 UTC. Awin source paused/sync off. Marketing publishing and AI disabled with emergency stop on. Zero currently approved-in-window or future approved homepage placements. No external runs or production writes were triggered in verification.

Current candidate keeps search visible on phones and tablets and expands the read-only visual audit to 1440, 768, 390 and 360 pixels, including search, Wishlist and Comparison Basket. Retained older PR #48 diagnostic evidence and PR #85 offer/SEO acceptance criteria. PR #83 retains the canonical mockup assets. Keep #21, #25, #93, #117 and #158 open for remaining unique work and controlled testing.

## Production storefront polish verified · 13 November 2026

PR #161 is READY on the custom domain at `0ddd9edd94b3164f1d6fc6064e43fde7d842c377`, deployment `dpl_BhuZZtzkermnyqCLdwBaKMcNS4Ln`. GitHub quality and secret checks passed. Campaign timing and private Awin monitor improvements are the next release candidate.

## Storefront polish in review · 13 November 2026

Last verified custom-domain deployment before this change: `07928970409eabaa2063e83bcb0bf19fc07bfbe1`, `dpl_A6ehuJD55mapwL8QAwAN8razakdt`. The storefront candidate restores the original faceted mark from PR #93 and gives the category strip and shopping dashboard priority under the seasonal hero. Mobile Saved and Lists are one tap away. Verify production and update this entry after merging.

## VERIFIED LIVE-FIRST WHOLE-SITE PUBLIC TOUR RELEASE · 13 November 2026

**PR #159 merged** into current `main` at `58355149ef69e82924a00c6866b0859a7483234a`. Vercel production deployment `dpl_GVkTsnRpkWTc2p79DwUXD4EvhUEX` was independently checked **READY** and assigned aliases `www.avuqo.com` and `avuqo.com`. Connected Vercel HTTP inspection verified `https://www.avuqo.com/explore-avuqo` **200**, expected whole-site heading and exact `data-dpl-id`; matching deployment homepage **200** and `/explore-avuqo` link present; sitemap.xml **200** and route included. GitHub quality/lint/build, whole-site route regression, secrets and Vercel preview checks passed for PR head `63b03f669acb3e1547f7ee0af57f8be8fdf29cb2`. The page links real public customer journeys, not mockup routes; no merchant images/offers/prices, private owner controls, flags, Awin sync or jobs were activated. Post-release manual desktop/mobile visual acceptance still pending. Continue Awin/marketing automation and warm-premium design in parallel; PR #158 remains a draft and PR #117 remains blocked. Revalidate the current production SHA in future sessions.

## LIVE-FIRST FULL-SITE PUBLIC TOUR · CANDIDATE · 13 NOVEMBER 2026

Fresh-main branch `feature/public-whole-site-tour-live-first-20261113` adds a public `/explore-avuqo` whole-site journey index, direct links to real existing production areas and a homepage discovery link. The sitemap lists the new route. This makes the whole AVUQO customer experience easier to inspect and demonstrates honest incomplete-source boundaries. No APIs, merchant rights, database schemas, marketing automation flags, payments or product prices are modified. The private Control Centre remains private. **Candidate until CI succeeds, merged main exact SHA is Vercel READY with both AVUQO aliases, and public route and responsive screenshot QA checked.** Original visual design references are preserved. See project status and changelog. Old Tyres UK PR #117 and draft #158 remain unactivated.

## CURRENT CANDIDATE · Dormant Tyres UK snapshot job journal · 13 Nov 2026

Connected Supabase inspection confirms that the old PR #117's private snapshot job table and claim/apply functions are absent; private Awin snapshots bucket exists; Awin source is paused/sync off. Current branch `feature/tyres-uk-private-job-journal-foundation-20261113` stages an **additive, RLS-enabled, service-role-only journal table** with `state='blocked'` default, no hardcoded feed ID and content-addressed paths, and **no data inserts, functions, cron, worker enablement or public offers**. The SQL has security contract tests and a controlled migration/verification plan `docs/TYRES_UK_DORMANT_SNAPSHOT_JOURNAL_RELEASE_2026-11-13.md`. Only mark it live after CI, connected Supabase migration and role/RLS/zero-row verification, plus Vercel production READY. The original PR #117 is still OPEN. Separately, Supabase security advisor warned of two authenticated-callable publishing SECURITY DEFINER functions (`publish_editorial`, `publish_avuqo_legal`); independently audit their authorisation before changing them. Do not activate tyre automation without runtime/lease/source-rights tests.

## VERIFIED OWNER-ONLY TYRES UK WORKER PREFLIGHT · 13 November 2026

**PR #155 merged** and exact app commit `5954beb29fc849dc9368991fdce6ba2db5a3b063` Vercel **production READY** (`dpl_5CoPiwj5gLSAiES6LwWc1Ux2U9v9`) with `www.avuqo.com` and `avuqo.com` aliases. Existing owner-only tyre spec enrichment page now includes **Check automatic worker prerequisites (read-only)**, calling authenticated `automation_preflight` with no provider fetch, database/storage writes, job creation, cron or flag updates. Live Supabase facts: private snapshot bucket exists and is not public; new worker job table and associated RPCs are NOT installed; Awin paused/sync disabled. Preflight always reports `ready_to_enable:false`, unresolved feed identity/licence, snapshot retention and lease/runtime checks. Browser owner-click end-to-end testing still pending; Vercel readiness alone does not prove that. Historical PR #117 remains OPEN and its migration and worker unactivated. Preserve live Pneus cron, exact-file manual recovery, historical prices, permissions and public-offer fail-closed rules. Detailed audit: `docs/TYRES_UK_AUTO_WORKER_PREFLIGHT_2026-11-13.md`. This docs-only merge may produce a newer Vercel SHA; future chats recheck current production.

## CURRENT CANDIDATE · Tyres UK owner-only automation preflight, 13 Nov 2026

Latest read-only Supabase verification: Awin source paused and sync off; `public.awin_tyres_spec_enrichment_jobs` and proposed claim/apply RPCs **not installed**; `awin-bulk-private-snapshots` bucket exists and is **private**; zero general `storage.objects` policies observed; existing `enrich_private_tyres_uk_specs` is security invoker. The remaining old PR #117's migration, daily cron and live supplier snapshot have **not** been activated. Branch `feature/tyres-uk-worker-readonly-preflight-20261113` adds an owner-authenticated `automation_preflight` action to the **existing** private tyre-enrichment API/UI. It only reads whether prerequisites exist and reports blockers, **always `ready_to_enable=false`**, no jobs, feed downloads, writes or customer product changes. Keep existing exact-original-file manual recovery and Pneus cron. See `docs/TYRES_UK_AUTO_WORKER_PREFLIGHT_2026-11-13.md`. This is candidate until CI and Vercel READY. Old PR #117 remains OPEN; need lease, storage retention, current feed ID and migration security review before worker activation.

## VERIFIED PRIVATE TYRES UK CANDIDATE-ONLY RELEASE · 13 November 2026

**PR #153 merged**, Vercel production **READY** SHA `7c8619352d5458a1c1ce69c3dc5f4960a813a3d2`, deployment `dpl_G5W4w3GCFbjnqnAikP8UJSKWVBCK`, aliases include `www.avuqo.com` and `avuqo.com`. Strict pure candidate parsing for current Tyres UK standard rows and description-correlated load/speed was selectively ported from historical PR #117. **No prices are returned** from candidate extraction; no fitment verified or offers published. The existing owner-only `/control-centre/tyre-spec-enrichment` now accurately states automatic worker **not enabled**; original file manual recovery remains. Quality CI, Vercel build and secrets passed. **Old PR #117 stays OPEN** because the proposed automatic snapshot/lease job is NOT deployed: live Supabase lacks `awin_tyres_spec_enrichment_jobs`, Awin source paused/sync off, no worker cron added, no SQL migration applied and current feed 93988 not reverified. Old #117 Vercel manifest would remove the existing Pneus scheduled import if merged wholesale. Full worker requires migration/storage/RLS/runtime and source-rights approval before activation. Next review #117's migration and live current Tyres UK feed evidence. A later docs-only deployment may advance production HEAD.

## CURRENT CANDIDATE · PR #117 private Tyres UK worker safety split · 13 Nov 2026

PR #117 is unmergeable and materially broader than a safe production update: it includes an immutable private snapshot storage workflow, new SQL job/lease migration, scheduled Vercel cron and an enable flag. Live Supabase was checked on 13 November: **`awin_tyres_spec_enrichment_jobs` does NOT exist**, Awin source `status=paused`, `sync_enabled=false`. Its old Vercel manifest would also remove today's existing `/api/internal/awin-pneus-private-import` cron if merged wholesale. Therefore **do not merge old #117, deploy that migration blindly, set `AWIN_TYRE_AUTO_ENRICH_ENABLED=true`, or repurpose old feed 93988 without live confirmation**. Fresh-main branch `feature/tyres-uk-candidate-validation-production-20261113` ports only pure strict schema/description-correlated load+speed candidates (never prices, never verified fitment/public listings), adds CI tests, and clearly labels automatic mode NOT enabled on the real private tyre Control Centre page. Existing exact-file manual enrichment remains. PR #117 remains OPEN until its SQL/storage/lease/runtime safety is separately audited, tested and deployed. This candidate requires CI+Vercel READY before calling it live.

## VERIFIED TOOLED-UP READ-ONLY CURRENCY INSPECTION RELEASE · 13 November 2026

**PR #151 merged** on fresh modern `main`, Vercel **production READY** app SHA `36b2840a159db2d274c38837dcdef9dc02333aac`, deployment `dpl_HU1PbTyE3oRrCYujGSPZZRFUPNHZ`, aliases `www.avuqo.com` and `avuqo.com`. Old conflicting **PR #102 CLOSED as superseded**, never merged wholesale. Protected `POST /api/internal/awin-tooled-up-currency` reads the current Awin joined-programme `currencyCode` for uniquely matched advertiser 496, only if source paused/sync off and existing long CRON_SECRET provided. Tests, build, lint and secret scan passed. **No real live Awin API call performed, no programme GBP outcome observed, and historic feed ID 496:89987 is NOT verified as current.** No database writes, permissions, product prices, images, staging or public offers are authorised. The result explicitly refuses feed/image/price/publication approval. See `docs/tooled-up-awin-programme-currency.md`. **Next:** confirm current replacement feed list and actual programme GBP with private owner evidence, then licence and fresh product prices; or triage PR #117 private tyres feed worker. Later docs-only release may advance Vercel SHA, so recheck on next chat.

## CURRENT CANDIDATE · Tooled-Up programme currency inspection, 13 November 2026

Historical conflicting PR #102 provides a read-only Awin joined-programme `currencyCode` check for **Tooled Up advertiser 496**. Branch `feature/tooled-up-readonly-gbp-verification-current-main-20261113` selectively ports this check to modern main: bearer-secret protected `POST /api/internal/awin-tooled-up-currency`, paused Awin source, joined advertiser precondition, exact numeric ID 496 response match, GBP-only currency verification. **Important correction:** obsolete historical feed `496:89987` is NOT treated as a currently existing feed. The result never approves any feed, GBP product price, images, staging, public offers or writes to database. Official Awin docs confirm `currencyCode` is programme currency and that blank feed currency defaults to programme currency; this is narrower than permission to use a specific current feed. Source docs: `docs/tooled-up-awin-programme-currency.md`. Tests/CI and Vercel production required before calling it live. No private API invocation with real credentials has yet occurred and no live GBP response is claimed. Next current feed-ID / licence evidence and rights review.

## VERIFIED CADBURY/PETLIBRO MERCHANT RESTRICTIONS RELEASE · 13 November 2026

**PR #149 merged** and Vercel production **READY** on `www.avuqo.com`: app commit `b6b6a93f7da3837f02d004cade0ec1fee52715a8`, deployment `dpl_2L3ihuCwwJX5UYBGrL5naFBxDemm`. Historical owner-supplied Awin terms summary is preserved at `docs/AWIN_CADBURY_PETLIBRO_TERMS_REVIEW_2026-11-04.md`. Owner-only `/control-centre/retailers` now displays Cadbury 736 and Petlibro 77952 restrictions and evidence checklist. **Old PR #51 CLOSED as superseded, NOT merged wholesale**. Build/lint/rights-tests/secrets passed. Historical PDF/email source materials were **not freshly re-opened** during this port; the recorded restrictions do not establish current photo/feed copying, caching, price republishing or usage rights. Awin source and per-advertiser feed approval remain fail-closed; no images/offers were published or permissions written. Next **PR #102 Tooled-Up GBP currency proof**; use fresh main and preserve merchant rights requirements. Docs-only follow-up may change the Vercel SHA.

## CURRENT CANDIDATE · Cadbury/Petlibro Awin terms and image rights, 13 November 2026

Old unmergeable PR #51 was **documentation only**, recording a review of owner-supplied Cadbury/Petlibro affiliate welcome emails and programme-terms PDFs dated 4 November. Branch `feature/awin-cadbury-petlibro-rights-evidence-20261113` preserves its historical account as `docs/AWIN_CADBURY_PETLIBRO_TERMS_REVIEW_2026-11-04.md`, explicitly identifying that the underlying PDFs/emails were *not independently reopened during this port*. It also places restrictions and an evidence checklist on the existing **authenticated owner-only** `/control-centre/retailers` page. Cadbury 736: directory/comparison/editorial listed, sale-category noncommissionable, branded PPC restricted, image/feed republication not confirmed. Petlibro UK 77952: organic comparison/editorial listed, Channel Islands/Gibraltar territory exclusions, brand PPC/CSS restrictions, conflicting commission rates; image/feed caching/republication not established. No current source-rights evidence or public image licence asserted; **no database changes, no source activation and no public offers**. Test the existing rights firewall; after CI, production READY and live owner-page confirmation, close obsolete PR #51 and log verified release. Next #102 Tooled-Up currency proof.

## VERIFIED AWIN PRIVATE CSV IMPORT RELEASE · 13 November 2026

**PR #147 merged into current main** and verified **Vercel production READY** on `www.avuqo.com`: app SHA `ba25af858c203df11713c4496276b2d38d4caa22`, deployment `dpl_EBxNpctsyr6Vswy9WeCjNdAcHhWd`. **Old conflicting PR #58 CLOSED as superseded, not merged.** Actual useful changes: standard numbered CSV names already accepted; Craft Buddy Google-format CSV `45747-retail-en_GB (1).csv.gz` now selects the correct parser after safe suffix normalisation, only when the owner explicitly selected joined advertiser 45747. Invalid extension, >8 MB upload and zero-byte file report separate errors. The modern strict owner/admin authentication, joined source registry check, explicit advertiser selection, per-row advertiser ID rejection and `private_review`/`unverified` status all remain unchanged. CI build, lint, unit/security regressions and secret scan passed. **No external Awin feed was imported in this release and no permission to show product images/prices was granted.** Future chat priorities: review old PR #51 Cadbury/Petlibro terms and image rights; #102 Tooled Up GBP evidence; then #117 private tyre enrichment if appropriate. A docs-only follow-up may deploy a newer SHA, so always query live Vercel.

## CURRENT CANDIDATE · Awin numbered CSV/private import fixes, 13 Nov 2026

Fresh-main branch `fix/awin-numbered-csv-private-import-current-main-20261113` selectively ports the still-useful parts of old conflicting **PR #58**: Chrome/Windows duplicate ` (1)`, ` (2)`, ` (10)` suffix handling for **Craft Buddy Google-format parser selection only**, distinct error responses for invalid `.csv/.csv.gz` extension, over 8MB file and empty upload, plus dedicated regression tests. Standard numbered CSV files already passed the general extension check. **Do not port the old PR's filename-derived merchant identity or AKKO fallback.** Current production requires owner-selected `advertiser_id`, `joinedInSource` against private source registry, row-by-row merchant ID match and `private_review` + `unverified` permission status. No external Awin feed upload was performed here; do not claim owner successfully retried the Cadbury file. After CI and exact-SHA Vercel READY, close #58 as superseded and record it in JSON/changelog. Next highest merchant work is PR #51 programme terms and image permission evidence, then #102 Tooled-Up GBP. All public rights gates stay closed without approval.

## VERIFIED AWIN HTTP ERROR SECURITY RELEASE · 13 November 2026

Merged **PR #146** safely reimplements stale PR #50's provider HTTP error redaction on current main. Real production SHA `3f8574c9520b7cb2c57cc8279e14bae4e5c38334` Vercel READY with `www.avuqo.com` alias, deployment `dpl_Cue4UGzwMXxoLPdSahM9jru1Mfzh`. `lib/connectors/awin.ts` no longer reads/quotes failed Awin provider response bodies or `statusText`; it throws only a numeric HTTP status. CI regression tests and secret scanner passed. **Old PR #50 CLOSED, not merged** because its branch conflicted with current main. No Awin sources activated or offers/images published. Next: compare PR #58 numbered Awin CSV filename/owner import errors to current main, selectively port missing code, test and release, then close obsolete PR. The new handover-only commit may generate a later production SHA; always recheck Vercel.

## Awin response redaction correction · 13 Nov 2026 (candidate)

PR #50 on a stale branch identified a genuine production error-leak: `lib/connectors/awin.ts` included up to 500 chars from unsuccessful Awin provider response in thrown exceptions. Candidate `fix/awin-http-error-redaction-current-main-20261113` ports the narrow fix to current main: error text is HTTP numeric status only; never read response body or untrusted status text. Preserves Awin endpoint, authorisation, parser, limits and all source-publication gates, no feed activation. Old PR #50 is unmergeable and should be closed *after* validated replacement deployment. See `tests/awin-http-error-redaction.test.mjs`.

## FINAL VERIFIED BRANCH CLEANUP · 13 November 2026

**Actual GitHub recount after PR #145: 24 branches remain**, from 143 before the task. The 2 verified cleanups deleted **119 pre-existing merged feature/docs branch refs**, and final housekeeping deleted the 3 newly created cleanup branch refs, a total of **122 deleted during the task**. All **11 open PR branches**, original `design/warm-premium-visual-system-20261105` / `feature/warm-premium-experience-v1-20261105` source branches and security references are retained. No arbitrary unique commits or unresolved provider rights were erased. Last confirmed app release: PR #145 SHA `8af0882eef7d9022066528a6304d81ffc0d1551d` READY on `www.avuqo.com`; this docs-only handover change can cause a subsequent SHA and must be verified fresh. **Next:** use fresh `main` to selectively finish open PR #50 Awin error redaction, #58 filename/import robustness, #51 merchant restrictions, #102 Tooled Up GBP and #117 private tyre worker. Never bulk merge old branches.

## BRANCH CLEANUP ACTUAL RESULTS · 13 November 2026

First batch PR #143 **deleted 16** recent merged branches. Historical batch PR #144 **deleted 103** additional exact matched merged PR branches. Combined **119 verified deletions**; repository count was **26** immediately afterward (includes `main` plus 2 housekeeping branches). All 11 open PR branches, original complete AVUQO visual source branches and security references remain. Final housekeeping PR #145 will target its own 3 merged cleanup PR branch refs, conservatively. Requery GitHub after its merge before claiming 24 branches. `docs/AVUQO_BRANCH_AUDIT_AND_SAFE_PRUNING_2026-11-13.md` holds the original 144-row inventory and proof boundaries. App production READY after #144 at SHA `d70a663d1963d81c4ec6e1f6ac9fd2b22320828d`. Unresolved source permissions and approved offers are unchanged.

## Historical merged branch cleanup candidate · 13 November 2026

After PR #143, verified GitHub branch count fell from 144 (including first cleanup branch) to **128**; 16 exact already-merged heads #127–142 were deleted, 11 open PRs and original design source branches preserved. Second guarded batch lives in `.github/workflows/verified-historical-branch-cleanup.yml` and considers only old merged PR #1–126. It deletes a branch only where **exact current HEAD matches both merged PR head SHA and frozen final PR commit**, no open PR or other merged PR reuses it, and branch is neither protected nor a reference/security archive. The actual result must be verified by recounting branches after workflow execution. Do not claim all 115 unreviewed branches safe.

## GitHub branch cleanup audit · 13 November 2026

Live repo had **143 branches** before the cleanup work started (144 including current cleanup branch) and **11 open PRs**. All 11 are unmergeable against present `main`, including Awin source rights/security, tyres and original visual assets. **Do not merge or delete those heads blindly.** See full 144-name inventory `docs/AVUQO_BRANCH_AUDIT_AND_SAFE_PRUNING_2026-11-13.md`. An exact-SHA-protected GitHub Actions cleanup workflow `.github/workflows/verified-merged-branch-cleanup.yml` targets only 16 already-merged PR #127–142 branches on first merge, requiring matching frozen PR head SHA, same repository, merged state, main base, no open PR and no branch protection. **Deletion must be confirmed from a new GitHub branch list after running**, not inferred from workflow code. Remaining 115 historical branches are reserved for a second audited cleanup; never discard original mockup assets or unpublished provider safety work.


## Streaming homepage flash fix candidate · 13 November 2026

Owner supplied two consecutive live screenshots: an old generic `Find what’s worth it` living-room homepage initially appears, then the correct Black Friday seasonal homepage. Root cause verified in `app/page.tsx`: a `Suspense` fallback rendered `HeroPlaceholder` (an entire obsolete homepage) while `HomeContent` awaited `connection()` and its data. Branch `fix/no-false-homepage-loading-hero-20261113` changes only the fallback to a neutral accessible loading surface with responsive CSS, preserving the request-time UK seasonal hero and all integration/auth gates. It must pass CI and Vercel production READY before considering live. Actual browser transition QA pending.


## VERIFIED LIVE HOMEPAGE SCREENSHOT CORRECTIONS · 13 November 2026

PR #140 merged. App SHA `e310af5a6ac49b00a01f7742c8d6a3664ebb5cf5` READY on Vercel production `dpl_55ZKhZvcp4JFFVSYqT8a5MMdzm9d` with `www.avuqo.com` alias. Live homepage HTTP 200 checked: Black Friday primary hero present, new editorial category-photo URL present, nonexistent sprite reference absent, duplicate seasonal banner absent, owner preview CTA absent. Corrections responded to four owner desktop screenshots: blank category cards, duplicated event, giant left-edge headline, owner preview taking hero space. **Still pending: new actual browser screenshots, successful external background image loads and mobile visual signoff.** No Awin/eBay/tyres/rights changes. Read `docs/AVUQO_HOMEPAGE_OWNER_SCREENSHOT_CORRECTIONS_2026-11-13.md`. A docs-only deployment may advance HEAD; recheck Vercel next chat.


## Owner-provided actual homepage screenshot findings · 13 November 2026

The user supplied four real desktop screenshots. Immediate visual defects: blank department tiles from missing `/branding/avuqo-department-reference-sprite.svg`, duplicate large Black Friday hero, headline overly large/at viewport edge, owner private-shop prompt occupying main public hero. Candidate branch `fix/homepage-screenshot-findings-20261113` restores editorial category photos, a single dynamic UK seasonal hero, constrained responsive typography and keeps private owner access only in navigation. No source/publication/tyres/eBay/Awin changes. Reference `docs/AVUQO_HOMEPAGE_OWNER_SCREENSHOT_CORRECTIONS_2026-11-13.md`. Candidate requires green CI, merged SHA Vercel READY and live screenshot review; do not claim image availability from code alone.

## VERIFIED PRODUCTION VISUAL AUDIT AUTOMATION · 13 November 2026

PR **#138 merged** and the audit workflow code shipped to production `www.avuqo.com` with app SHA `08459b492fa8c9497b94cee933d9fa08dec0f01c`, Vercel `dpl_CJ7yRusAX2fGppGBxy9jydXfHVdZ` **READY**. The website still returned the expected Black Friday homepage after release. GitHub workflow `.github/workflows/production-visual-audit.yml` is configured for weekly/on-demand desktop 1440×900 and mobile 390×844 browser screenshots of 28 public routes and an Actions artifact `avuqo-public-visual-audit`. **The first screenshot artifact and actual screenshot review have NOT yet been verified**; do not assert the original design is pixel-perfect. At next chat startup locate the first Actions workflow run, examine the report, fix observed visual issues and preserve all Awin/eBay/tyre/auth/Control Centre protections. This docs-only follow-up may advance the production SHA; always recheck live Vercel.


## Next production visual QA automation candidate · 13 November 2026

Branch `feature/production-visual-audit-20261113` adds read-only GitHub Actions screenshots of 28 public `www.avuqo.com` routes on desktop and phone widths, weekly/on demand, with machine-readable checks and PNG artifacts. This addresses the incomplete real-browser visual review. It **does not** edit customer UI, update retailer data or publish anything; current approved site remains the previous latest READY release. After branch merge, check the workflow's first run and artifact `avuqo-public-visual-audit`, inspect screenshots against `docs/design/AVUQO_VISUAL_REFERENCE_INDEX_2026-11-10.md`, and fix observed browser issues without rolling back integrations. See `docs/AVUQO_PRODUCTION_SCREENSHOT_QA_2026-11-13.md`. Candidate remains non-live until CI, merge and Vercel READY checked.
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
