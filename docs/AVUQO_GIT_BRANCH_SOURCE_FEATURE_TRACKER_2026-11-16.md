## 16 Nov 2026 · PR #224 eBay signed-notification validation deployed, not subscribed

**Verified implementation:** [PR #224](https://github.com/crkian/AVUQO/pull/224) merged at application SHA `7a791a342d60f5dfff9326f0a8b5fb0e80250afa`. GitHub quality checks and secret scan succeeded. Exact Vercel production deployment `dpl_YJKMvcPyXzHGcrkngV4m7DDWeRuE` is **READY**. This supersedes PR #222 as the latest confirmed application code.

**What it does:** `lib/ebay/deletion-signature.ts` has strict bounded parsing of eBay `X-EBAY-SIGNATURE`, production eBay OAuth and fixed Notification API public key retrieval/cache, and signed JSON verification following eBay's official Node SDK protocol. Existing `/api/ebay/account-deletion` GET challenge is preserved; POST now rejects invalid signatures and unsupported topics, then deliberately responds HTTP 503 even to verified messages because durable idempotent deletion and suppression are not yet implemented. Synthetic crypto tests and lint/build checks passed, but **no real eBay signed notification** was tested and the live endpoint was not provider-verified. No production OAuth secrets were installed here.

**eBay NO-GO:** Owner's screenshot still shows Production keyset disabled pending Marketplace Account Deletion compliance; do NOT register the endpoint or claim the receiver is compliant. Next implementer must construct service-only durable deletion-event journal, identify all stored seller/user identifiers and implement actual erasure/suppression with idempotency and independent security acceptance. Then add production credentials/token in Vercel privately, conduct signed provider test, and register the working endpoint with eBay. Separate Buy/Browse approval remains unresolved. EPN category/search links from PR #219 are deployed but still not item-level priced eBay offers.

**Awin unchanged:** Petlibro, Mozillion, Cadbury, Craft Buddy, Tooled Up bulk and tyre private pipeline exists; 19 programme target, last 251 private canonical drafts / zero verified public Awin offers; live publication requires current merchant rights/prices, owner preflight and merchant-scoped refresh/withdrawal. No Awin source changed. Keep all Git MD/JSON handovers plus Awin board and status/changelog updated after each action.

## 16 Nov 2026 · eBay signed POST verification implemented, deletion processing still gated

**Implementation candidate:** New `lib/ebay/deletion-signature.ts` verifies eBay `X-EBAY-SIGNATURE` headers using decoded key ID, fixed production OAuth client-credentials token endpoint and eBay Notification public-key endpoint (short-lived cached), the official eBay Node SDK's JSON message verification procedure and EC/SHA-1 digest, with strict input bounds and a fixed host. Existing `/api/ebay/account-deletion` now parses bounded JSON, rejects invalid/missing signature (HTTP 412), rejects other topics and malformed notifications, and still deliberately refuses verified deletion events (HTTP 503) until durable erasure/suppression is built. Added negative-contract and synthetic EC signature tests. Do not call this receiver compliant yet.

**Critical permissions and reality:** `EBAY_CLIENT_ID` and `EBAY_CLIENT_SECRET` production OAuth values are not configured/verified; the owner screenshot still shows production keyset **disabled**. No API token call, eBay live signed message, full erasure or portal subscription was performed. Public EPN-only search links from PR #219 remain separate from API item feeds. Awin existing Petlibro/Mozillion/Cadbury/Craft Buddy/Tooled Up/tyres private infrastructure unchanged, no new public Awin offers.

**Next eBay code:** privacy inventory of all data stored against eBay seller/user identifiers; non-public deduplicated notification-event audit/queue and tamper-safe suppression/deletion across all data-bearing tables, safe repeat handling and rejection tests; provider-specific verification fixture using an actual approved eBay sandbox test before enabling the endpoint. Only after successful GitHub CI, Vercel READY and actual signed test should owner register HTTPS URL + secret in eBay Developer. Awin owner's signed-in private preflight remains next separate lane.

## 16 Nov 2026 · Verified PR #222 eBay deletion challenge release

**Merged code:** [PR #222](https://github.com/crkian/AVUQO/pull/222), production code commit `2691b5e1d7b0bf74e0f3918ee99074ec5b87275f`; exact Vercel deployment `dpl_DPzu7bNj2qGcyXkyFSeDu9zHi5m6` reported **READY**. GitHub quality checks and committed-secret scan succeeded after correcting a Next.js 16 `cacheComponents` incompatibility: the first build rejected route-level `runtime="nodejs"`, removed before merge. Live endpoint challenge-response HTTP request was **not independently tested** because network retrieval was unavailable, and runtime secrets `EBAY_DELETION_VERIFICATION_TOKEN` and `EBAY_DELETION_ENDPOINT_URL` were **not configured**. The GET route thus fails closed until properly configured.

**Critical NO-GO for eBay registration:** GET SHA-256 challenge groundwork exists, but signed POST `X-EBAY-SIGNATURE` verification, durable idempotent deletion/retention audit and negative testing are **not implemented**. POST deliberately responds 503. **Do not paste the endpoint into eBay Developer, submit a token or claim eBay production keys enabled** until full receiver is implemented and verified. eBay's production keyset remains disabled as evidenced by owner screenshot, and Buy/Browse API production approval remains unverified. No individual eBay item catalogue or Awin retailer offers were published in PR #222.

**Next engineering priority:** finish fully authenticated and durable eBay deletion notification receiver with test coverage, preserve source privacy, configure secrets directly in Vercel and verify challenge/POST before owner portal registration. Owner can separately save the eBay notification-down email, but saved state was not yet evidenced. Awin existing private import machinery continues unchanged; run signed-in owner preflight then merchant-specific publication with fresh rights/price checks.

**CI correction 16 Nov:** Initial PR #222 GitHub build failed because `export const runtime="nodejs"` is incompatible with existing Next.js 16 `cacheComponents`; removed this segment config without changing challenge or POST refusal logic. Do not mark build/production READY until rerun checks pass. No production change arose from the failed CI.

## 16 Nov 2026 · eBay account-deletion callback phase 1 implementation (PR candidate)

**Actual new code:** `app/api/ebay/account-deletion/route.ts` provides an exact canonical-URL eBay SHA-256 GET challenge, server-only `EBAY_DELETION_VERIFICATION_TOKEN` (32-80 permitted chars), server-only `EBAY_DELETION_ENDPOINT_URL` that must equal `https://www.avuqo.com/api/ebay/account-deletion`, rejects extra query parameters/malformed tokens, never caches the response, and fails closed without correct environment. `tests/ebay-deletion-challenge.test.mjs` covers URL, digest order and POST refusal.

**CRITICAL INCOMPLETE COMPLIANCE GATE:** The POST handler deliberately returns HTTP **503** and never acknowledges a deletion message until authenticated `X-EBAY-SIGNATURE` verification with eBay public key plus durable idempotent delete/retention-audit workflow have been implemented. **DO NOT enter/register this endpoint in eBay Developer. DO NOT mark production keyset enabled.** This is verified challenge groundwork, **not an operational deletion subscription**. No eBay credentials or token have been entered; no SQL/new storage/rights/source change; no imported eBay or Awin offers. eBay sandbox keys remain separate and owner screenshots prove Production keyset disabled. Next implementer task is complete signed POST verification and erasure queue after privacy/data-inventory review, with negative tests and eBay challenge verification, before any registration. Run CI/preview then merge, update exact deployed SHA and handover.

**Awin unchanged:** existing Petlibro/Mozillion/Cadbury/Craft Buddy fixed private importers, Tooled Up full snapshot + 250-row batch pipeline and specialist tyre staging. Owner should run safe preflight from `/control-centre/awin-feed-updates` and capture actual outcomes, then merchant-scoped rights/price release and withdrawal. Do not reactivate paused global Awin source or treat private drafts as public offers.

## 16 Nov 2026 · Critical latest resume: eBay production keyset **disabled**, Awin imports already built

**Always read this first in new chats, then [exact eBay/Awin resume and screenshot evidence](AVUQO_EBAY_AWIN_EXACT_RESUME_2026-11-16.md), [Awin completion board](AVUQO_AWIN_COMPLETION_BOARD_2026-11-16.md), [19-programme rollout matrix](AVUQO_ALL_AWIN_MERCHANT_STAGING_TO_LIVE_2026-11-16.md), and [branch/feature tracker](AVUQO_GIT_BRANCH_SOURCE_FEATURE_TRACKER_2026-11-16.md).** Owner requires Git handover + JSON and status/changelog updated at every meaningful action or failure, preserving all earlier history.

**NEW owner screenshots:** eBay Developer Production keyset for AVUQO Product Comparison exists but explicitly displays **"Your keyset is currently disabled"** until marketplace account-deletion compliance or qualifying exemption. Marketplace Account Deletion is selected; HTTPS endpoint and verification token blank, exemption toggle off, notification email save not verified. Never claim the production keys usable or insert a fictional endpoint. Owner next saves notification-down email; developer next safely builds and tests an account-deletion challenge and signed POST handler, deploys it before owner registers the endpoint, then verifies re-enablement and separate production Buy/Browse approval.

**Shipped eBay customer foundation:** [PR #219](https://github.com/crkian/AVUQO/pull/219) merged at `71ac99ac5d6fa0d060823d9f0c1efde1e94d8ef6`; matching Vercel production **READY**. `/partners/ebay-uk` and homepage EPN category searches are affiliate linkouts, **not live imported eBay product prices**. Prior production key observations only showed sandbox names. **Awin already built:** Petlibro, Mozillion, Cadbury and Craft Buddy fixed private import/reconcile; Tooled Up snapshot, SHA validator and resumable 250-row bulk importer; specialist tyre staging, owner run-now and six-job journal. 19 programme evidence records, 251 private Awin draft identities, last observed public Awin offers 0. Do **not rebuild**. Next owner action: current signed-in Awin preflight at `/control-centre/awin-feed-updates`; then merchant-specific verified publication and automatic withdrawal. Prior checked Supabase Awin/eBay sources paused, zero non-demo offers; no new supplier offer or production credentials activated here.

**PR reconciliation:** older PR #220 used a pre-#219 main snapshot and may conflict with eBay launch handover. This newer checkpoint preserves #219 as actual latest shipped app; do not merge stale docs over it.

## 16 November 2026 · Public eBay UK affiliate discovery, implementation candidate

**Customer-facing change:** `/partners/ebay-uk` and homepage partner shelf. Six fixed UK categories plus a general eBay UK link use the documented EPN tracking parameters `mkevt=1`, `mkcid=1`, UK rotation `710-53481-19255-0`, existing active AVUQO campaign `5339240499` and `toolid=10001`. Every link is labelled, externally hosted by ebay.co.uk, opens a new tab with sponsored disclosure and **does not claim any AVUQO-verified listing prices, stock, images, discounts, score, comparisons or checkout**.

**Evidence:** The connected Gmail EPN digest dated 5 Nov 2026 says eBay Partner Network accepted proposed contract terms. Owner's EPN screenshot independently recorded the active default campaign. This supports ordinary EPN outbound linking, but **is not** approval of eBay restricted production Buy/Browse/Feed APIs. Vercel production has `EBAY_SANDBOX_CLIENT_ID` / `EBAY_SANDBOX_CLIENT_SECRET`, but no `EBAY_CLIENT_ID`, `EBAY_CLIENT_SECRET` or `EBAY_BROWSE_PRODUCTION_APPROVED`. eBay source remains paused, and the six existing Supabase offers are all October demo rows. No legitimate eBay item-priced offers are live.

**API rule:** eBay requires production Buy API growth check and approvals (https://developer.ebay.com/api-docs/buy/buy-requirements.html). Search-category affiliate links can be constructed under the official EPN UK specification (https://developer.ebay.com/api-docs/buy/static/ref-epn-link.html) and the EPN Link Generator documents category and search links (https://partnernetwork.ebay.com/resources/create-your-affiliate-link). Only fixed allowlisted destination paths are constructed, no user-controlled open redirect.

**Awin remains separate:** 251 draft Awin product identities, zero public retailer offers, paused source and pending merchant price/image rights. Existing four pilot imports and Tooled Up private capture/validate need actual current preflight, price and publish/withdrawal gating. Do not count EPN search links as eBay product offers, and never represent them as Awin feed publication.

**Release gates:** Test exact EPN parameters, strict search list and false-price disclosure; GitHub CI and Vercel preview, merge exact SHA and verify signed-out homepage + new page READY. Do not automatically click tracked EPN links to test them. Record production confirmation in Git without extra application build.


## 16 Nov 2026 · Owner target: stage **all eligible** Awin feeds through genuine live publication

[Complete 19-programme Awin staging/live matrix](AVUQO_ALL_AWIN_MERCHANT_STAGING_TO_LIVE_2026-11-16.md) ([structured JSON](AVUQO_ALL_AWIN_MERCHANT_STAGING_TO_LIVE_2026-11-16.json)). This scope is **not** a 6-merchant pilot as an end state. Supabase has 19 programme evidence records, 17 numeric IDs (16 currently in joined-code registry, extra PlayPress 101445 pending joined verification), two without IDs, and 74 observed feed IDs across 11 advertisers. Some include overlapping Tooled Up subfeeds and contract/quote products; summed rows do not equal unique offers. **Current public Awin offers 0; 251 private draft products**; no live publication or rights approvals have been modified. The next executable work is to verify live private-feed outcomes, finish Tooled Up 250-row staging and build per-advertiser automatic offer admission/withdrawal with actual current price and media rights, rather than globally enabling the paused Awin source. All 19 programme lanes and exact blockers are enumerated in the linked matrix.

## 16 November 2026 · Checked against original 14 November master idea index

The [original Git/branch/ideas handover](AVUQO_COMPLETE_GIT_BRANCH_IDEA_HANDOVER_INDEX_2026-11-14.md) is now explicitly reconciled, **without deleting or rewriting its frozen 14 Nov history**. The original had **22 branches and 5 open draft PRs**; latest current state was **25 branches, 7 open PRs**. The three additional branches are PR #200, PR #201 and the historical product soft-404 fix. Both security refs are preserved. Original [machine index](AVUQO_COMPLETE_GIT_BRANCH_IDEA_HANDOVER_INDEX_2026-11-14.json) remains historical; this tracker's JSON holds the complete current **29-workstream and 12-gap crosswalk**.

**These are thematic links, NOT completion badges.** Their original requirement/acceptance details remain in [ROADMAP](ROADMAP.md), [source gap audit](SOURCE_REQUIREMENT_GAPS_2026-11-02.md), the original source attachments and safe historical branches.

### All 29 original P0–P4 roadmap tracks

| Original ID | Original requirement | Current feature group(s) |
|---|---|---|
| `P0-01` | Event/click consent integrity | `F21`, `F22` |
| `P0-02` | Awin/source rights pause | `F11`, `F31` |
| `P0-03` | Signed-in customer collections acceptance | `F06`, `F29` |
| `P0-04` | Legacy PR reconciliation | `F35`, `F33` |
| `P0-05` | Role/release/security acceptance | `F28`, `F29`, `F33` |
| `P1-01` | Permissioned Awin pilot | `F11`, `F09`, `F10` |
| `P1-02` | Universal source connector registry | `F09`, `F12`, `F34` |
| `P1-03` | Canonical products/offers/price history | `F01`, `F04`, `F09` |
| `P1-04` | Products Deals Search Compare | `F01`, `F02`, `F03`, `F04` |
| `P1-05` | Taxonomy/navigation | `F02`, `F09`, `F15` |
| `P1-06` | Verified affiliate redirects/commissions | `F22`, `F25` |
| `P1-07` | Indexed natural-language search | `F03` |
| `P2-01` | Guest groceries/complete basket | `F14`, `F16` |
| `P2-02` | Approved supermarket prices | `F17`, `F18` |
| `P2-03` | Watches and alerts | `F05` |
| `P2-04` | Shared lists and households | `F06`, `F14` |
| `P2-05` | Budgeting/spending goals | `F19` |
| `P2-06` | Explainable preference graph | `F07` |
| `P3-01` | CMS/legal/media/SEO | `F28`, `F29` |
| `P3-02` | Approved affiliate/social/Pinterest promotion | `F25`, `F26` |
| `P3-03` | Separated site advertising | `F25`, `F29` |
| `P3-04` | First-party analytics/experiments | `F21`, `F22`, `F23`, `F24` |
| `P3-05` | Reality Check and feedback | `F08` |
| `P3-06` | Seasonal calendar engine | `F27` |
| `P4-01` | Travel/hotel/activities/hire | `F20` |
| `P4-02` | Broadband/insurance/motoring/services | `F20` |
| `P4-03` | Autopilot and exception monitoring | `F10`, `F31`, `F33` |
| `P4-04` | Large-scale eligible-offer processing | `F34` |
| `P4-05` | PWA, opt-in push, conditional native mobile | `F32` |

### All 12 original requirement gaps

| Original gap | Current thematic feature group(s) |
|---|---|
| `G01` | F03: Natural language search / intents / filters |
| `G02` | F32: Native mobile, push and PWA |
| `G03` | F07: Preference graph and personal intelligence |
| `G04` | F06: Saved products, shared household lists, votes and budgets |
| `G05` | F05: Watches: stock/price alerts, digest, quiet hours, push |
| `G06` | F27: Seasonal campaigns, evergreen content and expiry |
| `G07` | F04: Evidence-based AVUQO Score / confidence / buy-or-wait; F11: Awin: current authorised physical feed publication |
| `G08` | F16: Complete vs partial basket, no zero missing prices |
| `G09` | F14: Guest grocery baskets: local save, 1–99 quantities, 100 lines; F16: Complete vs partial basket, no zero missing prices |
| `G10` | F22: Affiliate attribution, confirmed commission and refunds; F25: Pinterest-first AI Creative Studio and promotion score |
| `G11` | F21: First-party event schema, consent and RLS; F22: Affiliate attribution, confirmed commission and refunds |
| `G12` | F02: Premium visual website / consumer navigation; F36: Full branded site concepts: three distinct logo, icon and homepage options |

**Important extra details preserved from the original:** PR #25's **1,384 inactive categories**, historical **50 category guides/shelves**, **16 original mockup references** and possible privately held high-resolution design assets; strict signed-in/multi-account customer collection acceptance; distinct marketing AI/social/stop controls (only historical state is known); Tyres UK draft lease/journal migration-version mismatch; eBay production Browse approval; and real confirmed/reversed/paid commission reconciliation. No superseded PDF/branch is treated as approved source prices or a ready-to-run installer.

**Newest Awin code release proof:** [PR #216](https://github.com/crkian/AVUQO/pull/216) merged; Git commit `d977cfa3a01265b1401235c728c089da377a256d`, production Vercel `dpl_E5cbjLHeTA1s6CHPmtJu2UFvjeuh` READY, homepage HTTP 200 and Control Centre feed monitor HTTP 200 on exact deployment. Owner-only run-now route exists, but **no owner-signed-in operation was performed by this audit**, so current preflight/stage results, licensed prices, images, offer publication and six scheduled job executions remain unverified. Awin public offers 0, source remains paused.


## 16 Nov 2026 · Owner-run current Awin preflight/private stage and Tooled Up master, proposed PR

Added owner-only `POST /api/control-centre/awin-run-now` with strict auth role and Origin, fixed supplier pair allowlist, private-write confirmation, server-only `CRON_SECRET` and no arbitrary URL/digest. It reuses current workers for Petlibro, Mozillion, Cadbury and Craft Buddy preflight/private staging and Tooled Up immutable snapshot/validation in-process. Extended private `/control-centre/awin-feed-updates` with owner buttons and service-role-read scheduled job journal after role checks. Manual operations are **not** logged as scheduled cron attempts. No source activation, rights override, customer-facing prices or offers. Require CI/preview and an actual signed-in owner click before claiming any current feed was tested. After current successful private import, release one genuinely eligible offered item with seller/rights/freshness audit and automatic withdrawal, not all historic rows.

# AVUQO · LIVE GIT BRANCH / SOURCE / FEATURE TRACKER

**Audit date:** 16 November 2026 UTC. **Repository:** [crkian/AVUQO](https://github.com/crkian/AVUQO). **Current main at inventory:** `f9e5157de0da39651d3bef9f6461c5c8579d2d57`. **Machine companion:** [JSON](AVUQO_GIT_BRANCH_SOURCE_FEATURE_TRACKER_2026-11-16.json). **Current operations:** [active handover](AVUQO_ACTIVE_HANDOVER.md). This is an observed snapshot, not a live GitHub API.

## Ground rules
Every material PR, investigation, rights decision, branch cleanup, test failure and deployment must update this tracker, its JSON, the active handover Markdown/JSON, PROJECT_STATUS and CHANGELOG. Source feature requirements are **not deployment evidence**. Original confidential PDFs/images are referenced only by filename and SHA-256, not copied into PUBLIC Git. For any branch deletion the existing GitHub Actions exact head SHA / final merged PR commit / open PR / source preservation gates apply. **No branch was deleted by this audit.** All 24 non-main branches diverge with ahead commits; never classify them as automatically redundant.

## 1. Exact branch inventory: 25 total, 24 non-main

Counts: main **1**, open PR heads **7**, protected security references **2**, unreconciled historical refs **15**. The 24 comparisons against main all returned `diverged`, with ahead/behind counts as shown. Ahead commits alone are not evidence of unique unported functionality, but they block deletion without diff/PR/source verification. Numbers will change with new main commits.

| Branch | Classification | Ahead / behind | Next action |
|---|---|---:|---|
| `main` | default | –/– | protected default |
| `design/warm-premium-visual-system-20261105` | PR #83 | 8/129 | retain original design |
| `docs/p0-03-verified-rollout-20261104` | archive | 3/157 | review document parity |
| `docs/petlibro-live-import-pilot-20261114` | PR #201 | 1/13 | retain rights review |
| `feature/awin-auto-import-clean-rebase-20261105` | archive | 4/132 | review importer parity |
| `feature/awin-canonical-private-taxonomy-20261030` | archive | 25/176 | retain taxonomy source |
| `feature/awin-departments-crafts-20261030` | archive | 23/176 | retain taxonomy source |
| `feature/awin-feed-catalogue-safety-20261104` | archive | 11/148 | review monitor parity |
| `feature/awin-readonly-diagnostics-20261104` | archive | 15/154 | review diagnostics parity |
| `feature/awin-safe-feed-change-monitor-20261104` | archive | 8/143 | review monitor parity |
| `feature/category-specific-product-previews-20261104` | archive | 11/148 | retain ui source until diffed |
| `feature/photo-led-category-pages-2026` | archive | 21/186 | retain visual source until diffed |
| `feature/tooled-up-awin-programme-currency-proof-20261105` | archive | 4/111 | review currency evidence |
| `feature/tooled-up-private-catalogue-filters-20261104` | archive | 9/144 | review owner ui parity |
| `feature/tyres-uk-private-lease-primitives-review-20261113` | PR #158 | 9/53 | retain until tyre worker acceptance |
| `feature/tyres-uk-server-auto-enrichment-v2-20261109` | PR #117 | 16/97 | retain disabled unsafe worker |
| `feature/universal-categories-inactive-20261030` | PR #25 | 35/176 | retain inactive taxonomy |
| `feature/warm-premium-experience-v1-20261105` | PR #93 | 204/121 | retain original customer design |
| `fix/customer-item-links-and-roadmap-20261030` | archive | 10/176 | review watch link parity |
| `fix/numbered-feed-filenames-20261104` | archive | 6/148 | review import filename parity |
| `fix/phase1-saved-watches-routing-20261030` | archive | 6/176 | review saved watch parity |
| `fix/product-pilot-soft-404-and-release-proof-20261114` | archive | 10/19 | retain until pr200 http acceptance |
| `fix/products-request-bound-true-404-20261114` | PR #200 | 12/13 | retain http404 acceptance |
| `security/block-future-secret-commits` | security | 2/182 | retain incident reference |
| `security/remove-exposed-build-archive` | security | 4/184 | retain security reference |

**Open PR disposition:** #25 taxonomy, #83 original warm-premium assets, #93 original storefront, #117 dormant potentially unsafe tyre enrichment, #158 isolated tyre lease primitives, #200 genuine HTTP 404, #201 Petlibro rights notes. Do not merge any wholesale without current-main diff and signed-in/signed-out acceptance.

**Historical candidate queue, in order:** (a) Awin importer/feed monitor/read-only diagnostics and Tooled Up owner filters/currency evidence, (b) numbered-file naming and Saved/Watch links, (c) category preview and taxonomy, (d) original photo-led design, (e) historic documentation, (f) product soft-404 alongside PR #200. After each *exact* source-to-main review, record preserved replacements and frozen hashes, then only retire through the existing SHA-safe cleanup workflow. The two security refs must not be removed as casual housekeeping.

## 2. Original attached sources actually reopened in this audit

| ID | Source | What it governs | SHA-256 prefix |
|---|---|---|---|
| S01 | AVUQO_Master_Product_Build_Specification.pdf | 26 pages | 5e3991478a69… |
| S02 | AVUQO_Intelligent_Supermarket_Comparison_Master_Specification.pdf | 20 pages | a001a2e2136a… |
| S03 | # AVUQO Intelligent Affiliate Marke.txt | text | a5f40ea48201… |
| S04 | AVUQO_v0.8_Control_Centre_Content_Backend_Plan.md | markdown | 77d5f8cf7a50… |
| S05 | AVUQO_MASTER_SOURCE_OF_TRUTH_2026-10-28.md | markdown | 134321cf7191… |
| S06 | AVUQO_First_Party_Analytics_Intelligence_Master_Specification.md | markdown | ec8e2325eb89… |
| S07 | Pasted text (1).txt | text | 74712c183a33… |
| S08 | Pasted text (2).txt | text | c16fc0bf4565… |
| S09 | file_00000000c30c81f4b1db6a04908c02f9.png | concept image | 26470cd8ae76… |
| M01 | Petlibro UK Affiliate Program Terms (2).pdf | 5 pages | 539e66416afa… |
| M02 | Mozillion Terms.pdf | 3 pages | 3bd9d2264ba8… |
| M03 | Cadbury Gifts Direct Terms (3).pdf | 3 pages | ea3cad9a3f2d… |
| M04 | Craft Buddy Shop Terms (2).pdf | 4 pages | 8d9e2962f316… |
| M05 | Tooled Up Terms.pdf | 3 pages | 269514ac4a1e… |

Source S01 is 26 pages (sections 1–16); S02 is 20 pages. The 5 older advertiser terms PDFs were also inspected for commission exclusions, branded bidding and media restrictions. Their historical dates do **not** establish the latest commission or all current photo rights. S09 has **three competing original** AVUQO brand concepts (navy/violet, plum/coral, navy/lime), not three deployed brand systems. Existing [source manifest](SOURCE_MANIFEST_2026-11-02.md) and [requirement gap audit](SOURCE_REQUIREMENT_GAPS_2026-11-02.md) remain intact.

## 3. Feature register: 37 identifiable groups from original sources

**Status convention:** `partial` means at least a corresponding foundation or route is described by current Git/handover, but its *complete end-to-end customer acceptance is not proven in this audit*. `roadmap` is a requested future capability. `private_only` / `blocked_external_data` are explicit gates. No status is a fabricated completion percentage.

| ID | Feature / request | Source | Status | Next evidence or build |
|---|---|---|---|---|
| F01 | One real catalogue: Compare + Discover | S01, S05, S07 | partial | First fresh permissioned Awin offer, exact product identity and true delivered total; then bargain evidence |
| F02 | Premium visual website / consumer navigation | S01, S09 | partial | Visual comparison against three concept options, keep historical reference branches until original assets reconciled |
| F03 | Natural language search / intents / filters | S01 | partial | Test current search; build intent resolution and cross-source index, never fake results |
| F04 | Evidence-based AVUQO Score / confidence / buy-or-wait | S01 | partial | Verify real price history, merchant trust, stock, shipping and non-commission ranking |
| F05 | Watches: stock/price alerts, digest, quiet hours, push | S01, S05 | partial | Inspect stored watches and prove scheduled evaluation and delivered opt-in notifications |
| F06 | Saved products, shared household lists, votes and budgets | S01, S05 | partial | Verify real cross-account invitation, voting, purchased state, collaborative budget |
| F07 | Preference graph and personal intelligence | S01 | roadmap | Opt-in intent and explainable recommendations with privacy/decay |
| F08 | Customer reports / Found Better / community trust | S01 | partial | Moderation, verification and abuse/rate limits |
| F09 | Universal source connector, GTIN/MPN/variant identity | S01, S07 | partial | Resumable source-specific integrations with rights, freshness and failure audit |
| F10 | Autopilot ingest, score, publish, expire and exception queue | S01 | partial | Real feed-to-public-offer pipeline, safe automatic withdrawal and error retries |
| F11 | Awin: current authorised physical feed publication | S01, S07, M01, M02, M03, M04, M05 | private_only | See Awin finishing board; independent per-advertiser terms and source stop gates |
| F12 | eBay, Amazon, CJ, impact, Webgains, Tradedoubler, Rakuten, direct | S07 | roadmap | Use authorised access and provider-specific data schemas; never scrape restricted feeds |
| F13 | Supermarket directory (nine stores) and grocery /groceries | S02 | partial | Directory is not live price access; enforce inactive/missing states |
| F14 | Guest grocery baskets: local save, 1–99 quantities, 100 lines | S02 | partial | Verify live guest local persistence, product/unit and multipack maths |
| F15 | Exact grocery pack/brand matching and substitutions | S02 | partial | GTIN and pack-size distinction; own-label alternatives clearly separate |
| F16 | Complete vs partial basket, no zero missing prices | S02, S06 | partial | Integration tests for completeness and trusted lowest complete basket |
| F17 | Licensed retailer grocery prices, local/user-observed prices | S02 | blocked_external_data | First retailer data licence/API; manual observations private and labelled |
| F18 | Grocery Control Centre / price freshness / provenance | S02 | partial | Store/category/price audit and currency/stock permission checks |
| F19 | Budgeting, spending and weekly household savings | S05 | roadmap | Explicit financial/household permissions; no synthetic savings |
| F20 | Travel, car hire, attractions, experiences and services | S01, S05, S07 | roadmap | Quote-specific connectors and commercial constraints, not product SKU offers |
| F21 | First-party event schema, consent and RLS | S06 | partial | Verify consent boundaries and dedup, bots/test traffic isolation |
| F22 | Affiliate attribution, confirmed commission and refunds | S06, S03 | partial | Reconcile real Awin network conversions before declaring revenue |
| F23 | Analytics funnel, cohort, timezones, growth dashboards | S06 | partial | Controlled reconciled metrics and stale-data flags |
| F24 | Controlled experiments and self-learning optimisation | S06, S03 | roadmap | Owner-verified experiments; never modify independent score/rank |
| F25 | Pinterest-first AI Creative Studio and promotion score | S03 | partial | Separate Promotion Score from AVUQO Score; approved assets and APIs |
| F26 | Facebook, Instagram, TikTok, X and email scheduling | S03 | partial | Channel rules, approval and verified publisher APIs/consent |
| F27 | Seasonal campaigns, evergreen content and expiry | S03, S01 | partial | Verify real calendar output and expired post landing pages |
| F28 | Content CMS: owner footer/nav/pages and revisions | S04 | partial | Published-version controls, preview, rollback, signed-in owner acceptance |
| F29 | Legal version approval, cookie/consent and media rights | S04, S06 | partial | Publisher/merchant rights evidence and legal owner approvals |
| F30 | Owner Source Atlas / retailer onboarding / errors | S04, S01 | partial | Live connected source status, invoice/commission rights and error evidence |
| F31 | Owner emergency stop and source-scoped controls | S01, S04 | partial | Check signed-in stop and per-advertiser release; do not bypass pending rights |
| F32 | Native mobile, push and PWA | S01 | roadmap | PWA manifest already a foundation; delivered push/native not verified |
| F33 | Fraud resilience, secrets, RLS, cost controls | S01, S06 | partial | Maintain CI secrets, privacy, source abuse control and Vercel ignored builds |
| F34 | Scale 10k → 100k → 1m+ listings | S07 | partial | Use lease/retry, content-digest and streaming large feeds, no full-RAM shortcuts |
| F35 | Original historical milestones PR #20–#25 | S08 | historical_only | Keep frozen historic branch/feature evidence; do not take old PR status as live |
| F36 | Full branded site concepts: three distinct logo, icon and homepage options | S09 | design_reference | Preserve original visual asset and track owner's chosen implementation, do not reinterpret original image as production proof |
| F37 | Partner pricing and commission restrictions | M01, M02, M03, M04, M05 | under_review | Term PDFs have older effective dates; check current Awin account-specific rate/media/trademark terms |

## 4. Startup, patch packs, safety and Git workflows inspected

| Path / group | Actual role | Disposition |
|---|---|---|
| `AVUQO_START_HERE.md` | CURRENT first read | keep update |
| `AGENTS.md` | CURRENT developer rules and Next 16 boundaries | keep update |
| `README.md` | CURRENT developer entrypoint | keep update |
| `docs/AVUQO_ACTIVE_HANDOVER.md` | CURRENT delivery source of truth | keep update every material turn |
| `docs/AVUQO_ACTIVE_HANDOVER.json` | CURRENT structured state | keep update every material turn |
| `docs/AVUQO_COMPLETE_GIT_BRANCH_IDEA_HANDOVER_INDEX_2026-11-14.md` | dated 14-Nov archive | preserve do not treat live |
| `docs/SOURCE_MANIFEST_2026-11-02.md` | original 9-source checksum archive | preserve |
| `docs/SOURCE_TO_CODE_AUDIT_2026-11-02.md` | old feature-to-code audit | preserve snapshot not live |
| `README-FIRST.md / README-FIRST-v0.6.md / README-FIRST-v0.7.md / README-v0.8-PHASE1.md` | historic setup/patch descriptions | archive only no auto execute |
| `APPLY_PHASE2.ps1 / APPLY_PHASE3.ps1 / APPLY_PHASE4.ps1 / APPLY_STYLE_FIX.ps1 / APPLY_TO_C_DRIVE.ps1` | historic local Windows C:\avuqo patch/backup installers | do not run on live without diff |
| `AVUQO_SUPABASE_RESET_AND_SETUP.sql` | DESTRUCTIVE development reset | NEVER RUN ON PRODUCTION |
| `AVUQO_PHASE2_AUTH_WATCHES.sql` | historic migration after destructive reset | do not run as new migration |
| `AVUQO_v0.8_Feed_Review_Dashboard.zip` | historic code pack whose binaries were not inspected here | preserve archive not live proof |
| `.github/workflows/verified-merged-branch-cleanup.yml` | post-main push exact merged PR head cleanup | keep sha and PR gates |
| `.github/workflows/verified-historical-branch-cleanup.yml` | exact historical merged PR <=126 cleanup | keep sha and PR gates |
| `.github/workflows/reconciled-closed-pr-branch-retirement.yml` | narrow #50/#51/#85 cleanup | keep frozen head checks |
| `.github/workflows/quality.yml / prevent-secrets.yml` | CI and secret protection | keep |
| `vercel.json` | 13 UTC scheduled cron routes; skip docs-only build | keep validate after each release |

**High-impact safety:** `AVUQO_SUPABASE_RESET_AND_SETUP.sql` explicitly deletes AVUQO public-schema development records. Never execute in production. Old `APPLY_*.ps1` scripts copy files into `C:\avuqo` and are *not* migrations or current build instructions. Historical v0.6–v0.8 README/ZIP artifacts must not be silently treated as deployed code or resurrected without a diff. SHA-gated merged-branch cleanup already runs after main pushes; its actual deletion result must be verified by re-listing branches.

## 5. Awin finish line, not another importer

Awin production currently has **251 private canonical candidate products**, no public Awin offers, paused source and pending publication, and the six-job private attempt journal has **0** observed entries at this audit. Tooled Up master immutable snapshots and full-file validation reports are **0**. These are real *read-only database observations*, not predictions.

For Petlibro (44 staged lines/22 identities), Mozillion (229 distinct handsets), Cadbury (feed listing ~1,371), Craft Buddy (Google feed listing ~1,308) and Tooled Up (listing ~84,256), read the [Awin completion board](AVUQO_AWIN_COMPLETION_BOARD_2026-11-16.md). The first eligible 17 Nov 07:05–08:25 UTC scheduled cycle will make the new journal useful; diagnose categorical outcomes then. The owner wants all eligible, genuinely licenced retailer offers live and automatically refreshed, but approval intent cannot replace supplier rights, current price evidence and publisher/source gates. Build merchant-specific release/automatic withdrawal rather than bulk turning on unverified old data.

## 6. Reconciliation / deletion acceptance

1. Capture exact current branch SHA and upstream PR state. Reconfirm no open PR, protected branch, security evidence or original mockup exists exclusively there.
2. Diff **content**, not just file names or ahead/behind. If needed, port unique tests, changes or non-secret design assets into current main, update this tracker and verify CI.
3. Verify final reviewed PR commit, SHA-safe cleanup workflow and last-minute branch ref equality; retain when any checks fail. Do not force-delete divergent branches or rewrite hidden history.
4. Rerun complete branch inventory, update both tracker formats plus handover, record exact removed references, and verify production ready SHA for any code changes.

**Next executable action:** owner-authenticated current Awin pilot preflight/private staging and 17 Nov live journal inspection, then first rights-cleared actual offer with stale-price withdrawal. Track each outcome in Git.
