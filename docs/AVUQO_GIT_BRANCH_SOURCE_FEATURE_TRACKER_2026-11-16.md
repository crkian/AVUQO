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
