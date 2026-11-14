# AVUQO verified branch cleanup: production results and retained inventory

## Latest verified position: 22 branches after PR #187

**14 November 2026, verified on current GitHub and Vercel.** PR #187 merged at `79e97df4761cb57010bbf874bc92440545b6709f`; Vercel `dpl_wWZ37buUPN9syB77c9AEYFfXQVGf` READY on `www.avuqo.com` and `avuqo.com`. Live homepage returned HTTP 200 with matching deployment ID.

Fresh GitHub listing: **22 branches including `main`**, down **41** from the original 63. Three deliberately reconciled closed-unmerged PR refs #50/#51/#85 were absent after the restricted retirement workflow; the temporary PR #187 branch was also auto-pruned. Original PRs remain closed and auditable. Their original content and evidence checks are recorded in `docs/CLOSED_LEGACY_BRANCH_RECONCILIATION_2026-11-14.md`. As before, per-branch GitHub Actions log output was not independently retrieved; GitHub branch inventory confirms the actual ref absences.

Current 22 = **1 main + 5 open-PR heads + 2 security refs + 14 divergent historical branches not yet reconciled.** The full 14 historical refs:

| Remaining historical ref | Next review |
|---|---|
| `docs/p0-03-verified-rollout-20261104` | Verify signed-in customer collection milestone records versus main |
| `feature/awin-auto-import-clean-rebase-20261105` | Compare with current private importer #176 recovery |
| `feature/awin-canonical-private-taxonomy-20261030` | Reconcile canonical taxonomy with open #25 |
| `feature/awin-departments-crafts-20261030` | Compare current 50 category routes |
| `feature/awin-feed-catalogue-safety-20261104` | Compare feed diagnostics with live #183 validations |
| `feature/awin-readonly-diagnostics-20261104` | Compare live Control Centre diagnostics |
| `feature/awin-safe-feed-change-monitor-20261104` | Compare live metadata monitor |
| `feature/category-specific-product-previews-20261104` | Compare product shelves and owner-only preview |
| `feature/photo-led-category-pages-2026` | Preserve any approved artwork before retiring |
| `feature/tooled-up-awin-programme-currency-proof-20261105` | Check latest currency-verification constraints |
| `feature/tooled-up-private-catalogue-filters-20261104` | Review current owner catalogue filters |
| `fix/customer-item-links-and-roadmap-20261030` | Check current Saved and Watches destinations |
| `fix/numbered-feed-filenames-20261104` | Check private upload file validation and tests |
| `fix/phase1-saved-watches-routing-20261030` | Check current Saved and Watches destinations |

Open PR #25/#83/#93/#117/#158, the original warm-premium design references and two security branches remain protected. No authorisation or source publication was activated by cleanup.

---

## Historical snapshot: 25 refs after PR #185

*Evidence timestamp: 14 November 2026, after PR #185 automatic cleanup; do not infer future live state.*

## Results
- Starting GitHub branch listing: **63** refs including `main`.
- After merging PR #185 and letting the automatic GitHub cleanup progress, a fresh search listed **25** refs including `main`, a reduction of **38 branch refs**. The temporary documentation branch used to write this record is **not** included in that count; it should itself be eligible for automatic retirement once this record is merged.
- PR #185 merged code `a032f85a39964dff2ade6785331c399d2eccda1b`. Vercel production `dpl_GhzjfNTsg2UYTumhPRwiPvSbwkJ3` was independently checked **READY** with `www.avuqo.com` / `avuqo.com` aliases. Public homepage returned HTTP 200 with exact deployment ID. GitHub quality build, lint, safety contract tests, secrets scan and preview passed on PR head `9526f17419338f9b3044a92d9c295a0e7e0794bc`.
- **Evidence strength:** GitHub branch count before/after independently verifies refs disappeared. The workflow's per-branch outcomes were not directly retrieved from Actions logs in this session; do not claim those logs were independently inspected.
- The updated cleanup runs automatically after pushes to `main`, and manual dispatch remains a dry run by default. It requires a merged PR, exact unchanged head and frozen last reviewed commit, unique PR use, no open PR, and no protected, security or original design ref.

## The 25 retained refs at that historical snapshot
- **1 production branch:** `main`.
- **5 open PR branches:** PR #25 `feature/universal-categories-inactive-20261030`; #83 `design/warm-premium-visual-system-20261105`; #93 `feature/warm-premium-experience-v1-20261105`; #117 `feature/tyres-uk-server-auto-enrichment-v2-20261109`; #158 `feature/tyres-uk-private-lease-primitives-review-20261113`. Each requires separate content/rights/security reconciliation. Do not auto-merge PR #117.
- **2 security refs:** `security/block-future-secret-commits`, `security/remove-exposed-build-archive`; preserve pending security-source review.
- **17 older divergent refs without open PRs:** listed below. GitHub's `main...branch` comparison found every one has a positive `ahead_by`, so none can be deleted merely by proving it is an ancestor of current `main`. Divergence alone does **not** prove unique product functionality; each needs a diff-to-live reconciliation.

| Historical branch | Ahead of main (commits) | Review priority |
|---|---:|---|
| `docs/awin-cadbury-petlibro-terms-review-20261104` | 1 | rights reference, compare against live terms docs |
| `docs/p0-03-verified-rollout-20261104` | 3 | rollout documentation, check if incorporated |
| `docs/price-availability-ebay-seo-20261105` | 7 | commercial/SEO requirements archive |
| `feature/awin-auto-import-clean-rebase-20261105` | 4 | private importer, compare against current #176 recovery |
| `feature/awin-canonical-private-taxonomy-20261030` | 25 | old private taxonomy, reconcile #25 and current 50 routes |
| `feature/awin-departments-crafts-20261030` | 23 | old category implementation, compare to current departments |
| `feature/awin-feed-catalogue-safety-20261104` | 11 | feed validation, compare to live #183 monitor |
| `feature/awin-readonly-diagnostics-20261104` | 15 | Control Centre diagnostics, compare live |
| `feature/awin-safe-feed-change-monitor-20261104` | 8 | metadata monitoring, compare live #183 |
| `feature/category-specific-product-previews-20261104` | 11 | private preview, compare current live shelves |
| `feature/photo-led-category-pages-2026` | 21 | photographic design, compare approved references |
| `feature/tooled-up-awin-programme-currency-proof-20261105` | 4 | currency proof, compare current verified checks |
| `feature/tooled-up-private-catalogue-filters-20261104` | 9 | private filter UX, compare live owner tools |
| `fix/awin-cadbury-feed-error-safety-20261104` | 1 | error redaction, compare live code |
| `fix/customer-item-links-and-roadmap-20261030` | 10 | saved/watch navigation, compare live |
| `fix/numbered-feed-filenames-20261104` | 6 | import filename parsing, compare live validation |
| `fix/phase1-saved-watches-routing-20261030` | 6 | saved/watch navigation, compare live |

## Original reduction plan after PR #185
1. For each of the 17 divergent refs, compare the actual code/document changes with current production and existing GitHub handovers; classify **already incorporated**, **missing feature to port**, **reference to archive**, or **unsafe/superseded**. Record evidence before closing/deleting. Never wholesale merge a stale branch.
2. Preserve original warm-premium artwork, security history, and Tyres UK #117/#158 while testing lease claims and resolving supplier permission questions.
3. Evaluate the three non-tyre open PRs against current category/design functionality and retain original art references until copied into current `main`. Close an obsolete PR only after its value is captured.
4. Keep using one short-lived PR per feature from latest `main`; let the automatic verified-merged workflow remove the branch. Retain no idle docs-only branches.
5. Keep making useful imports, marketing and design releases through the normal CI, READY production and signed-out/owner acceptance process.

**Goal: zero stale branches, not zero protected working source or archives at any cost.**
