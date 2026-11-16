# AVUQO | ACTIVE OPERATIONAL HANDOVER

### Verified post-merge handover release · 16 November 2026

**[PR #210](https://github.com/crkian/AVUQO/pull/210) merged** and all GitHub quality/security checks passed. GitHub main application SHA `3a98b50948d16599ac46d6c8a087c323e7688e7b` was independently seen at Vercel production deployment `dpl_6oMYNWsFCrUG1ZM37Zu8B6mfPGAY` in **READY** state, and a signed-out fetch of `https://www.avuqo.com/` returned **HTTP 200** with that exact deployment marker. All operational/source observations in the 16 Nov audit below still describe **what was checked at the earlier morning read**, not newly re-run ingestion or advertiser permission grants. This follow-up is **docs-only** and may advance Git main without building a second application deployment. Read application SHA from Vercel, document SHA from GitHub, and actual Awin data/cron status from live Supabase/Logs separately.


**Evidence date:** 16 November 2026, morning UTC. **Status:** Git-tracked, dated audit; not a continuously updated live API.  
**Repository:** [crkian/AVUQO](https://github.com/crkian/AVUQO), public, `main`. **Production:** [www.avuqo.com](https://www.avuqo.com). **Application:** Next.js 16 / React / TypeScript; Supabase PostgreSQL; Vercel; package version `0.5.3`.  
**Current verified application baseline:** GitHub `main` at `39cb4a94ae1a9a98a80e368f8664d79d1ed0bf53`, Vercel production `dpl_Hs18EQdhAm31mh3kDKUJA4c3DZzr` READY for that SHA, website returned HTTP 200 with that deployment marker. **Important:** this *documentation commit* may advance `main` without a new Vercel deployment because `vercel.json` skips documentation-only builds. Recheck actual code SHA and deployment at every restart.

> **Read this file first in every new coding session.** Then read [START HERE](../AVUQO_START_HERE.md), [AGENTS](../AGENTS.md), [live release history](AVUQO_LIVE_HANDOVER.md), [machine snapshot](AVUQO_ACTIVE_HANDOVER.json), [project status](PROJECT_STATUS.md), [roadmap](ROADMAP.md), [original source and Git branch index](AVUQO_COMPLETE_GIT_BRANCH_IDEA_HANDOVER_INDEX_2026-11-14.md), and the relevant implementation files. This page is the **current operational overlay**, not a deletion of the archives. A dated statement never outranks current connected GitHub, Vercel and Supabase observations.

## 1. Owner goals, authority and hard boundaries

- Owner wants **every genuinely eligible Awin merchant, product and feed published and refreshed automatically**, and explicitly authorises AVUQO's side of importing, publishing and using images. The goal is a durable *automatic comparison and evidence-backed bargain discovery* site, not a manually approved import for every daily price update.
- This **does not** substitute for each advertiser's actual licence, use of third-party photography/trademarks, commission-group exclusions, successful current-feed validation or accurate price and availability evidence. One merchant's open issue must eventually be isolated through **advertiser-specific controls**, not silently bypassed or allowed to block unrelated approved merchants.
- No demonstration product, historical feed price, mock review, illustrative AVUQO Score, affiliate commission ranking, copied unlicensed product image or inferred merchant permission may appear as real customer-facing evidence.
- Source ingestion/publication controls and owner approval are separate: the global Awin source can remain paused while **private monitored jobs** run. Never set Awin active, sync on, publish an offer, toggle stop controls, grant product-image rights or merge unverified draft work merely to report "live".
- Design direction: **AVUQO. Find what's worth it.** One canonical catalogue for **Compare** (same exact product/condition/variant, correct total price) and **Discover bargains** (genuine observed reductions). Warm-premium ivory/navy/violet visual system, quality photography where licensed, My AVUQO personal tools. Site is an affiliate referral/comparison business, **not** an authorised AVUQO-operated dropshipping checkout.
- Confidential original user PDFs, images, source exports, credentials, raw feed links and customer records **must not be copied into this public repo**. Existing source manifest references nine checked original owner documents by checksum/title; some source binaries remain private or outside the repo. No claim that unavailable attachments were read.

## 2. Verified current state, 16 Nov 2026

| Area | Observed evidence | What it **does not** prove |
|---|---|---|
| Application | `main` `39cb4a94`; Vercel `dpl_Hs18EQdhAm31mh3kDKUJA4c3DZzr` READY; homepage HTTP 200; PR #209 merged | Signed-in owner/browser actions, every job's success, merchant rights |
| Awin source | `public.sources` connector `awin`: `status=paused`, `sync_enabled=false`, `credential_status=not_configured`, `publication_permission=pending` | Awin server-side secrets are necessarily missing; private scheduled jobs have been configured separately |
| Source controls | `source_ingestion=true`, `global_emergency_stop=false`, `deal_publishing=true` | Awin public publishing has been approved or enabled; source gate is still paused |
| Catalogue | `262` total products; `258` draft and `4` active; `251` canonical keys with `awin:` prefix | 251 customer-ready prices, images or buy links |
| Private matches | `44` Petlibro row links to `22` distinct products; `229` Mozillion row links to `229` products; all `273` listed links are candidate status | Owner offer release or 273 separate physical products |
| Real Awin offers | `0` offers linked to the Awin source; `0` approved Awin offer-release reviews | New public price or image publication |
| Merchant permission ledger | Petlibro, Mozillion, Cadbury, Craft Buddy, Tooled Up and Tyres UK are all `pending` with evidence saved, `publication_approved=false` | Full merchant permission for every media type/advertisement |
| Tooled Up new snapshot process | `0` objects under private `awin/496/89987/` and `0` whole-file validation rows at the morning check | Successful capture/validation just because Vercel cron paths are configured |

**Watch this discrepancy:** 16 November is after several scheduled morning UTC jobs, but the latest database `feed_import_runs` entries observed were Mozillion **14 Nov** and Petlibro **5 Nov**, with no AUTO runs for Cadbury or Craft Buddy. Feed workers may legitimately skip unchanged files, or the schedule may fail. Confirm **Vercel Cron invocations and worker logs**, exact credentials, skip reasons and private store, rather than assuming success or failure from the absence of a new row alone. In particular, Tooled Up had no stored immutable snapshot even though the 08:05/08:25 jobs were deployed.

## 3. Completed, merged and production-deployed recent work

| PR | What is in production | Acceptance and remaining limit |
|---|---|---|
| [#191](https://github.com/crkian/AVUQO/pull/191), [#194](https://github.com/crkian/AVUQO/pull/194) | Four editorial product model guides and guarded product-route work | Editorial guides **are not** live retailer prices. A historic signed-out unknown/draft product HTTP-200 soft-404 remains a live-HTTP acceptance item; open #200 must be reconciled against current route before claiming fixed |
| [#195](https://github.com/crkian/AVUQO/pull/195), [#197](https://github.com/crkian/AVUQO/pull/197), [#198](https://github.com/crkian/AVUQO/pull/198) | Control Centre page editor request boundary, Live Data separated scanning and page/child role-before-read guards | Signed-out streamed private-data smoke passed after #198; signed-in owner performance/action acceptance remains pending |
| [#204](https://github.com/crkian/AVUQO/pull/204) | Petlibro 77952:103580 07:27 UTC private SKU reconciliation | Reused 22 draft products and 44 source-record pairs without duplicate canonical listings; GTIN collisions must not merge separate SKUs |
| [#205](https://github.com/crkian/AVUQO/pull/205) | Mozillion 31539:74135 07:37 UTC condition-aware private reconciliation | 229 private handset drafts; 166 Brand New and 63 Good as New; idempotent second test 0 new rows; no GTIN/MPN |
| [#206](https://github.com/crkian/AVUQO/pull/206) | Cadbury Gifts Direct 736:48599 07:47 UTC private draft reconciler | Returns `no_validated_auto_snapshot` until new modern AUTO staging succeeds; did not seed from historical upload |
| [#207](https://github.com/crkian/AVUQO/pull/207) | Craft Buddy 45747:F1356 Google-retail format bounded private download at 07:17 UTC | Feed has not yet had a confirmed fresh successful import; licensed character art protected |
| [#208](https://github.com/crkian/AVUQO/pull/208) | Craft Buddy 07:57 UTC private SKU candidate reconciliation | First DB test returned `no_auto_snapshot`; no false product creation |
| [#209](https://github.com/crkian/AVUQO/pull/209) | **Reused** existing Tooled Up master importer infrastructure for 08:05 UTC snapshot capture and 08:25 UTC full-gzip validation | Code/CI, preview/production READY. First actual snapshot still unobserved. Only private snapshot and diagnostic audit, **no 84k-row automatic stage yet** |

Other delivered areas already in source: warm-premium homepage and navigation/department routes; My AVUQO Saved/Watches/Lists; owner-only Control Centre and Source Atlas; marketing editorial scheduler and seasonal publishing gates; first-party analytics primitives; eBay sandbox/private previews; specialist tyre, fitment and customer comparison UI; source-health diagnostics, Vercel/GitHub branch/secret hygiene. **Do not equate a deployed route with verified functioning integrations**. See historical release detail in `AVUQO_LIVE_HANDOVER.md` and `PROJECT_STATUS.md`.

## 4. Every current Awin merchant in the active feed rollout

| Merchant / Awin ID | Current monitored / privately stored evidence | Current automation | Remaining delivery |
|---|---|---|---|
| **Petlibro 77952**, feed `103580` | 5 Nov full private AUTO snapshot: **44 rows, 22 SKU pairs**. 22 draft product identities, 44 candidate links. Two GTIN collisions across distinct supplier identities. Merchant reply subject says 77952 while signature says **77942**. | Daily private import 07:05, draft reconciliation 07:27 | Confirm correct advertiser account and current commission groups, fresh full prices/stock, licence scope/photographs; owner offer release; automate controlled withdrawal. Do not take missing per-row update timestamp as freshness proof |
| **Mozillion 31539**, feed `74135` | 14 Nov private AUTO **229 distinct SIM-free handset rows**; 166 Brand New / 63 Good as New, explicit GBP and tracking flags; 229 drafts/links. No GTIN/MPN or per-row supplier timestamps. | Daily 07:09 private import, 07:37 draft reconciliation | Live freshness, grade-specific comparisons, correct per-category account commissions, branded/logo and feed-photo permission, release and withdrawal. SIM contracts/travel eSIM need **different pricing models**, not mixed with phones |
| **Cadbury Gifts Direct 736**, feed `48599` | Feed monitor 15 Nov lists **1,371**; latest manual stored import **1,367** review rows on 4 Nov, missing modern tracking/currency flags; no verified AUTO snapshot | 07:13 private import, 07:47 private reconciler (zero until validated AUTO) | Verify live feed parsing/tracking/explicit GBP/stock, then private drafts; exclude sale category from commission, resolve rights, first public offers |
| **Craft Buddy Shop 45747**, Google feed `F1356` | Monitor lists **1,307** as of 15 Nov. 28 Oct manual import **1,299** rows, 1,233 review / 66 excluded; **no** verified AUTO snapshot | 07:17 exact-allowlisted Google private import, 07:57 draft reconciler (zero until current AUTO) | Validate true Google columns + real Awin links, preserve excluded rows, create reviewed drafts, confirm artwork rights for licensed properties, public offer gate |
| **Tooled Up 496**, master feed `89987` | Current feed-list 15 Nov **84,255** listed. Manual 4 Nov import **84,284** private review rows. New immutable snapshots **0** and whole-feed validation reports **0** as of 16 Nov | Existing 29-column master adapter + 250-row bulk importer, 48 MiB bounded private snapshot job **08:05**, 250 MiB/1 GiB/500k-row full stream validator **08:25**, now scheduled | Observe real capture/validation, verify replacement `awinnew` URL + checksum + all rows; resolve master feed's missing explicit currency without inventing GBP; then **connect existing resumable chunks to schedule**, deduplicate by SKU across overlapping feeds, add private draft matcher and controlled withdrawals. Avoid rebuilding importer |
| **Tyres UK 12715**, main feed `93988` | Private tyre import 5 Nov **31,372** rows: 28,990 review, 2,382 excluded. Joined profile advertises clickout £0.10 and sale 4% | Dedicated private tyre processes; dormant extra-worker PRs #117/#158, 08:41 private Pneus schedule exists | Normalize tyre size/fitment/season/load/speed exact matches, shipping vs fitting, stock and final seller price, clickout attribution, image rights, concurrency/lease safety, owner release |
| **Pneus Online** | Dedicated private tyre import/fitment path in repo | 08:41 UTC private cron | Review live evidence and country/tyre-fitment boundaries separately from Tyres UK |
| **Other joined advertisers** | Older 19-programme reconciliation / 74 monitored feed observations in historical docs (not a live count rechecked for all programmes today) | Discovery and owner-only registry, not an unconditional universal public importer | Identify joined/active exact IDs, current feed formats/terms, product category safety; build merchant-specific adapters only when needed; publish independently when permission/current offer checks pass |

### Rights, branding, advertising and commission facts in private Supabase ledger

The six mentioned advertiser records have **documentary evidence** and owner intent but remain `status=pending` and `publication_approved=false`. Any future commercial activation must be justified by the specific merchant evidence, not by toggling this flag in bulk.

- **Petlibro:** 2024 terms allow comparison/editorial/direct linking; separate CSS/ad-network account if used, ban brand bidding. PDF has affiliate-type commission examples up to 15% or 18% in different sections, **5 Nov 2026 email** quotes 5% Luma litter box / 8% other products / 0% accessories. Rates conflict by context and date; verify current Awin Commission Groups. Sender ID discrepancy **77952 vs 77942**. Email mentions some feed images; don't assume unrestricted alteration, retention or all photo licences.
- **Mozillion:** 15 Nov joined screenshot; programme rates from profile: up to £35/monthly-phone contract, up to £20/monthly SIM, £15 monthly-plus SIM, £10 preloaded, **£5 SIM-free phone**, 10% travel eSIM. Comparison/editorial allowed. Brand used in promotional creatives needs consent; branded PPC prohibited; feed image republication not yet attested. Existing importer is **SIM-free handsets only**, not those other categories.
- **Cadbury:** 15 Nov joined screenshot: advertised **7%, sometimes 8%**; 2023 terms allow comparison/editorial, exclude **sale-category** items from commission and prohibit brand-name PPC. Do not auto-publish coupon claims or unlicensed photographs.
- **Craft Buddy:** 15 Nov screenshot **8% content, 5% coupon**. 2023 terms mention dashboard/merchant-approved materials, brand/logo express written consent, and special third-party IP restrictions (Harry Potter, Disney, Marvel, Star Wars etc). Promotional codes visible until Dec 2026 are not independently approved for AVUQO.
- **Tooled Up:** 15 Nov joined screenshot **5% advertised**, 30-day cookie, no branded PPC/ad text/unauthorised coupon use. 11 Nov merchant notice: old feeds deleted, replacements start with `awinnew`; master `awinnew.txt` and brand/category feeds overlap. Terms allow comparison/editorial, but explicit product-image and promotional trademark licence scope unresolved. Master feed has no explicit GBP field.
- **Tyres UK:** 15 Nov joined/online profile advertises **£0.10 redirect/clickout** vs **4% sale**; more than 10,000 products is a marketing claim, not the current exact feed row count. Confirm third-party tyre images, partner-store seller/fitment delivery and per-transaction tracking.

**Image policy:** Owner approves the AVUQO use of images, but merchant/third-party licences must be independently evidenced. Public listings can be image-free if product/price rights permit; do not use unapproved art by default. Public thumbnails from old feeds are not automatically licensed.

## 5. Vercel scheduled jobs, exactly as deployed on `main`

All times **UTC**, daily, except no scheduling is implied by the presence of a source file alone:

| Time | Route | Function / status |
|---|---|---|
| 06:17 | `/api/internal/awin-feed-check` | Joined Awin feed inventory/change discovery; does not approve offers |
| 07:05 | `/api/internal/awin-pilot-schedule/petlibro` | Bounded private feed import |
| 07:09 | `/api/internal/awin-pilot-schedule/mozillion` | Bounded private feed import |
| 07:13 | `/api/internal/awin-pilot-schedule/cadbury` | Bounded private feed import |
| 07:17 | `/api/internal/awin-pilot-schedule/craftbuddy` | Bounded private Google feed import |
| 07:27 | `/api/internal/awin-petlibro-private-reconcile` | Draft-only candidate matching |
| 07:37 | `/api/internal/awin-mozillion-private-reconcile` | Grade-specific draft matching |
| 07:47 | `/api/internal/awin-cadbury-private-reconcile` | Draft-only after verified AUTO snapshot |
| 07:57 | `/api/internal/awin-craft-buddy-private-reconcile` | Draft-only after verified AUTO snapshot |
| 08:05 | `/api/internal/awin-tooled-up-snapshot` | **New PR #209** immutable private 496/89987 capture |
| 08:25 | `/api/internal/awin-tooled-up-daily-validation` | **New PR #209** whole-gzip SHA/row diagnostics |
| 08:41 | `/api/internal/awin-pneus-private-import` | Dedicated tyre private import |
| 09:00 | `/api/internal/marketing` | Scheduled marketing job; follow editorial/global publishing controls |

Source: [vercel.json](../vercel.json). `CRON_SECRET` used server-side for internal routes; no secret values should enter Git. **Configured is not evidence of successful invocation.** Check Vercel Cron and runtime logs and Supabase run state for dates after deployment. The snapshot capture has a **48 MiB compressed memory ceiling**; oversized feeds require a resumable/streaming transport rather than silently increasing RAM or publishing only the first rows.

## 6. Public launch pipeline still to build/accept

For each advertiser in a general **automatically refreshing** pipeline:

1. Exact authorised programme/feed and territory; downloaded fresh data with source digest, schema, permitted re-use and tracking redirect checks.
2. Complete import with explicit GBP or independent documented approved currency evidence; current stock, actual item/seller, shipping and total; reject ambiguous or disallowed categories.
3. Stable canonical product/SKU/condition identity with deduplication. Distinguish product listing identity from multiple supplier rows, and never merge on duplicate GTIN or marketing title alone.
4. Product/media/category permissions and commission exclusions checked separately. Owner intent recorded, advertiser rights actually evidenced, expiry observed.
5. **Advertiser-scoped activation** and per-offer public admission after source controls; no single paused programme should authorise another, and source-wide gate must not be silently overridden.
6. Publish eligible merchant offer with observed price timestamp, stock, variant and tracked destination. Compare like-for-like totals, fee, delivery and condition. Reject fabricated savings and rankings influenced by affiliate commission.
7. Automatically refresh and **withdraw/hold** when an item disappears, price expires, source changes terms, stock disappears, links fail, stop is activated, or rights expire. Audit reasons. Verify signed-out customer routes and signed-in Control Centre.

No step above should read the existing 84,284 Tooled Up private rows, old Cadbury/Craft Buddy records or 4 Nov designs as public current offers without fresh evidence.

## 7. Prioritised engineering and owner acceptance queue

Each item is **OPEN** unless an explicit completed/verified statement above says otherwise.

**P0: correctness and first real offer**
- **OPS-01**: Investigate 16 Nov Vercel Cron logs for all scheduled pilots, in particular Tooled Up `08:05/08:25`, because zero snapshots/validation rows existed at the 16 Nov audit. Verify production env names (without printing secrets), Vercel Pro cron configuration, active joined feed URL, 48 MiB cap, timeouts, availability, storage grants and skipped/unchanged conditions. Record the actual first successful source SHA. Do not claim success merely from deployed cron.
- **OPS-02**: Run exact fresh supplier preflight for Petlibro, Mozillion, Cadbury, Craft Buddy and Tooled Up; if needed use authenticated owner Control Centre. Capture safe redacted error categories and complete-run counts. Do not supply a fake signed-in session.
- **RIGHTS-01**: Reconcile advertiser-specific Awin terms and scope, image rights, merch commission groups, branded PPC/coupon restrictions, allowed GB territory, rights expiry and the Petlibro 77952/77942 discrepancy. Record evidence refs, not untrusted permissions flags.
- **RELEASE-01**: Ship first **real, rights-cleared, current-priced Awin offer**, using existing source-readiness / publication review and a merchant-specific release gate. Confirm public HTTP details, tracking link, image-or-no-image admission, rollback, source stop and expiry. Then roll out by merchant.
- **RELEASE-02**: Automatic feed-to-public-offer updating/withdrawal and stale-price suppression: enforce exact product/condition/stock identity, feed digests and no duplicate active offers.
- **SITE-01**: Verify genuine HTTP **404** for unknown/unapproved product slugs, 200 for four real research guides, no private RSC leakage. Review open PR #200 rather than merging blindly; earlier smoke reported a soft 404.
- **OWNER-01**: Signed-in owner Control Centre acceptance: saved/published page editor, Marketplace/Source Atlas count cards, Awin preflight and emergency stop, real Live Data first-paint/latency/permission flags, role-negative testing and sample Vercel runtime logs.

**P1: other feeds and scale**
- **TOOLED-01**: After fresh master snapshot, validate all 29 columns, duplicate source SKUs, actual active count, Awin redirect integrity and GBP rights evidence. Build **resumable private staging orchestration** using the pre-existing 250-item chunk adapter, large_feed_import_sessions / record journal, bounded memory and backoff/retry/lease controls. Avoid new importer from scratch.
- **TOOLED-02**: Source-SKU dedup across full master vs overlapping `awinnew_brand_*` and `awinnew_cat_*` feeds; category and brand taxonomy, image licence/retention, private drafts, daily incremental checkpoint, stale offer withdrawal. No Vercel build per batch.
- **CRAFT-01**, **CADBURY-01**: Resolve real Google/Awin feed validation errors; only current 45747:F1356 and 736:48599 AUTO snapshots may seed drafts, old excluded rows remain excluded. Confirm tracking, explicit GBP and owner rights.
- **TYRE-01**: Tyres UK and Pneus independent supplier-rights verification, fitment/stock/fitted total price and original download identity; review dormant PR #117/#158 before any worker activation.
- **FEED-ALL**: Complete joined 19-programme advertiser matrix and exact Awin feed list; add bounded adapters for additional physical suppliers only where needed; SIM-only, mobile contract, travel eSIM, travel/insurance/services require their own commercial comparison model, not physical-SKU price assumptions.
- **PRICE-01**: Accurate delivered price and observation timestamp, merchant-specific commission exclusions, duplicate bundle/condition/GTIN isolation, price drop and historical price retention restrictions, genuine savings logic.

**P2: product, experience, operations, research**
- **CAT-01**: Finish 25-department/long-tail taxonomy and specialist pages without prematurely activating 1,000+ inactive category seeds; reconcile draft PR #25 and original ideas.
- **UI-01**: Finish warm-premium screenshot parity across mobile nav/header, homepage/seasonal, category product cards, Compare, search, filters, favourite/saved/watch/list profiles and checkout handoff. Use source design branches selectively; no screenshot sample price assumptions.
- **MKT-01**: Keep editorial/seasonal marketing, brand social posts, paid ads, CSS shopping campaigns and sponsor placement as distinct channels; audit outbound marketing and tracking consent, permissions, keyword policies, actual conversions. Do not infer automatic public social posts from the 09:00 job alone.
- **EBAY-01**: Production eBay Browse API partnership entitlement not proven; retain sandbox/private preview and avoid live repricing claims. Inspect credential and policy state prior to public activation.
- **GROCERY-01**: Supermarket price-comparison roadmap requires first-party/API/store-level legal feeds, pack-size/loyalty/branch and price timestamp evidence; no live supermarket prices claimed. Source specifications may be outside public Git by design.
- **ANALYTICS-01**: First-party analytics, consent, event integrity, attribution, affiliate conversion matching, dashboards and privacy/retention review remain separate acceptance work. Distinguish implemented event tables from trustworthy revenue reporting.
- **OPS-03**: Vercel credits/build CPU: ensure docs-only changes skip builds (`vercel.json.ignoreCommand`), batch commits, use GitHub CI to catch code errors before deployment, retain live projects and existing cron. Historical 13 Nov build spend concentrated in AVUQO/other projects; no blind project deletion. Billing alerts and owner account alert settings remain separate.
- **SEC-01**: Signed-out RSC safety, Supabase RLS/service-role paths, secrets scanning, no credential logs, owner-only controls, global emergency stop, supplier rights expiry and retry/lock discipline. Keep historic security PR refs until reconciled.
- **BUSINESS-01**: Zoho support email, Resend auth, owner account, personal tools, search, SEO and conversion workflows; review operations and customer consent before claiming complete.
- **FUTURE-01**: Original creator/affiliate, travel, insurance, broadband, sports/golf, personalised shopping, comparison and other long-horizon ideas live as **requirements**, not automatically deployed features. See full 29-workstream/12-gap index.

## 8. GitHub PRs and archival state checked 16 Nov

**Open PRs (7):**
- [#201](https://github.com/crkian/AVUQO/pull/201) **draft**, Petlibro rights/first live-data import notes; compare against merged #204-#209 and current rights evidence, do not blindly merge.
- [#200](https://github.com/crkian/AVUQO/pull/200) **open non-draft**, genuine HTTP 404; run current production regression/preview acceptance and resolve or close after safe reconciliation.
- [#158](https://github.com/crkian/AVUQO/pull/158) **draft**, dormant Tyres UK claim/renewal primitives.
- [#117](https://github.com/crkian/AVUQO/pull/117) **draft**, private tyre auto-enrichment disabled by default.
- [#93](https://github.com/crkian/AVUQO/pull/93) **draft**, warm-premium customer design.
- [#83](https://github.com/crkian/AVUQO/pull/83) **draft**, original warm-premium design/specification and mockups.
- [#25](https://github.com/crkian/AVUQO/pull/25) **draft**, inactive category taxonomy and Control Centre explorer.

**Do not use the 14 Nov branch index as a live count**: it recorded 22 refs and five open PRs *at that date*. The historical Git index, archived branch/content hashes, security branches, retired refs and original design branches must remain discoverable and must not be bulk merged, deleted or re-seeded. Diff every still-open branch against current `main` first. Other production systems such as Fantasy Lockr, Cluedoku and Capshur are separate projects: do not modify as part of AVUQO handover.

## 9. Full document/source navigation without losing anything

**Current entrypoints:** [this handover](AVUQO_ACTIVE_HANDOVER.md); [machine companion](AVUQO_ACTIVE_HANDOVER.json); [root START HERE](../AVUQO_START_HERE.md); [agent rules](../AGENTS.md); [README](../README.md); [living release history](AVUQO_LIVE_HANDOVER.md); [dated machine state](AVUQO_CURRENT_STATE.json); [status](PROJECT_STATUS.md); [changelog](../CHANGELOG.md); [Compass](AVUQO_PROJECT_COMPASS.md); [roadmap](ROADMAP.md).

**What the owner originally requested:** [full 9-source checksum/identity manifest](SOURCE_MANIFEST_2026-11-02.md), [source requirement-to-code review](SOURCE_TO_CODE_AUDIT_2026-11-02.md), [12 missing details](SOURCE_REQUIREMENT_GAPS_2026-11-02.md), [complete Git/branch/idea index](AVUQO_COMPLETE_GIT_BRANCH_IDEA_HANDOVER_INDEX_2026-11-14.md), [machine idea index](AVUQO_COMPLETE_GIT_BRANCH_IDEA_HANDOVER_INDEX_2026-11-14.json), [October specification integration register](AVUQO_2026-10-30_SPEC_INTEGRATION_REGISTER.md), [universal coverage](UNIVERSAL_COVERAGE_AND_SOURCE_STRATEGY.md), [backend/UX growth audit](BACKEND_FRONTEND_AUDIT_AND_GROWTH_ROADMAP.md).

**Retailers/imports:** [Awin advertiser onboarding and release](AWIN_ADVERTISER_ONBOARDING_RELEASE.md), [19-programme reconciliation](AVUQO_AWIN_19_PROGRAMME_RECONCILIATION_2026-11-13.md), [four-brand private scheduling](awin-private-scheduled-pilot-refresh.md), [Tooled Up master adapter](tooled-up-master-private-adapter.md), [full-gzip validator](tooled-up-full-stream-validation.md), [private immutable snapshot](awin-manual-private-snapshot-capture.md), [private snapshot validation](awin-private-snapshot-revalidation-endpoint.md), [bulk job/lease/transport](awin-bulk-job-journal.md), [currency programme evidence](tooled-up-awin-programme-currency.md), [tyres UK worker acceptance](TYRES_UK_AUTO_WORKER_PREFLIGHT_2026-11-13.md), [eBay onboarding](ebay-epn-uk-onboarding.md).

**Experience/security/automation:** [brand and visual reference library](design/AVUQO_VISUAL_REFERENCE_INDEX_2026-11-10.md), [warm premium theme](design/AVUQO_WARM_PREMIUM_VISUAL_IDENTITY_2026-11-05.md), [whole-site delivery](AVUQO_WHOLE_SITE_DELIVERY_PLAN_2026-10-30.md), [marketing vs paid ads](AVUQO_SITE_ADVERTISING_VS_BRAND_SOCIAL_MARKETING.md), [P0 events](P0_01_EVENT_INTEGRITY_RUNBOOK.md), [P0 source gate](P0_02_AWIN_SOURCE_GATE_RUNBOOK.md), [P0 collections](P0_03_COLLECTIONS_ACCEPTANCE.md), [first-party analytics specification](AVUQO_FIRST_PARTY_ANALYTICS_INTELLIGENCE_MASTER_SPECIFICATION_2026-10-30.md), [owner Control Centre audit](AVUQO_CONTROL_CENTRE_OWNER_AUDIT_2026-11-14.md), [branch safety policy](VERIFIED_BRANCH_RETIREMENT_POLICY_2026-11-14.md), [external partner/backlog](AVUQO_LIVE_PRODUCTION_PARTNER_AND_DESIGN_BACKLOG_2026-11-13.md). Each contains additional detail, historical attempts and work not duplicated in this summary.

**Version/history rule:** This is a current index/decision log, **not a raw mirror of every Git object**, external email, privately uploaded original or live account. Follow linked primary documents for full detail. Do not overwrite archival material; append fresh corrections with date and evidence so old completion claims are not mistaken for current reality.

## 10. Required handover procedure after every development change

1. Read this active Git handover and machine companion **from current Git main**, the actual implementation files, PRs, current READY Vercel deployment, and relevant live Supabase rows **before** planning. Check original source manifest and owner vision when necessary.
2. For a substantive PR, update this file with **what changed, exact code paths, relevant PR/commit, tests, migrations, live data changes, security/rights, deployment evidence, what is unfinished and the next executable step**. Also update machine companion, `docs/PROJECT_STATUS.md` and `CHANGELOG.md`. This is enforced for app/library/schema/scheduling changes by `scripts/check-project-register.mjs` in GitHub CI.
3. Keep distinguishable statuses: `PROPOSED`, `PR DRAFT`, `CI/PREVIEW PASS`, `MERGED`, `PRODUCTION READY`, `PRIVATE DATA VERIFIED`, `PUBLIC OFFER APPROVED`, `ACTUAL CRON RUN CONFIRMED`. None implies the next one.
4. CI, no-secrets scan and Vercel preview before merge. After merge, verify exact production code SHA, public aliases and, for critical tasks, actual owner/browser and provider behaviour. If only a docs update, the Vercel ignored-build step may leave production running the earlier **application** SHA, and that is intentional.
5. Append a dated outcome and the remaining blockers **in Git**, not only in chat. Never publish secret credentials, private merchant signed URLs, customer info, raw licensed assets or confidential owner PDFs.
6. On all new PRs, detect new/changed user requirements and add them to the active handover/backlog, retaining the original 29-workstream/12-gap indexes. Do not mark everything done just because this index exists.

**Immediate next executable task as of this snapshot:** read Vercel's actual 16 Nov Tooled Up 08:05 and 08:25 Cron logs, determine why no immutable private snapshot/validation row exists, fix the smallest safe blocker, then complete a real private full-feed validation and connect the existing 250-row resumable staging importer. In parallel, follow through on Petlibro/Mozillion/Cadbury/Craft Buddy fresh feeds and first publisher-licensed public offer without weakening source admission.