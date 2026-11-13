# AVUQO branch inventory and production-first cleanup · 13 Nov 2026

**Source:** Live GitHub search_branches, two pages; original count 144 including `main` and the newly created cleanup PR branch. GitHub previously reported 143 branches before this branch was added. Counts below are evidence as of this search, not a live query.

**Current live production app at start of this audit:** Vercel READY SHA `72a33d8a35e9479258ba1ae7d491c8ff7aa8e9a3` on `www.avuqo.com`. This does **not** mean unapproved Awin/eBay/tyre products are public.

## Action summary
- **16 known merged branches** from PR #127–#142 have exact merged PR heads checked again by `.github/workflows/verified-merged-branch-cleanup.yml` before deletion. Workflow checks merged-state, source repo, ref SHA, branch protection and whether another open PR references the branch. GitHub Actions executes the actual deletion; no branch delete connector is directly available in this chat.
- **11 open PR branch heads**, including original design branches and Awin/tyres safety work: keep until unique code and evidence have been reviewed. Their PRs were all reported unmergeable against current `main`; no blind merging.
- **115 other historical branches** are not automatically deleted. Some are merged as squash PRs, some have unmerged unique work, and may include original feed/tyre security or data-test findings. Audit source PR merge state and exact SHA before the next removal batch.
- Never delete `main`, protected refs, the original asset archive `design/warm-premium-visual-system-20261105` or original implementation `feature/warm-premium-experience-v1-20261105` while their unique design sources are needed.
- No writes to Supabase, no activation of Awin/eBay/tyre data, no customer UI changes, no rewriting branch history.

## Open PRs requiring disposition
| PR | Topic | Status |
|---|---|---|
| #117 | Private Tyres UK snapshot auto-enrichment | Review carefully; do not publish or enable worker by default |
| #102 | Tooled Up currency proof | Preserve source/currency correctness; reconcile current importer |
| #93 | Old complete warm-premium implementation | Preserve source design code; compare to deployed UI |
| #85 | Awin/eBay price freshness and SEO docs | Reconcile against current production specs |
| #83 | Original mockup designs and binary assets | Preserve until archived in `main` without fabricated price content |
| #58 | Numbered Awin CSV filename/import errors | Port useful fixes if absent in current code |
| #51 | Cadbury/Petlibro programme restrictions | Retain evidence |
| #50 | Redact raw Awin feed errors | Security priority, rebase selectively |
| #48 | Private Awin read-only diagnostics | Compare against current Control Centre |
| #25 | Universal categories and private taxonomy explorer | Reconcile with current 25 departments |
| #21 | Saved/Watches/Lists routing | Compare with current live routes |

## Full branch list (144)
| GitHub branch | Recommendation |
|---|---|
| `chore/github-quality-gates` | REVIEW: unique commits/merge ancestry not yet fully established |
| `chore/record-v020-release-20261102` | REVIEW: unique commits/merge ancestry not yet fully established |
| `chore/record-v050-marketing-tyres-products-production-20261113` | REVIEW: unique commits/merge ancestry not yet fully established |
| `chore/restore-design-spec-project-compass-20261110` | REVIEW: unique commits/merge ancestry not yet fully established |
| `chore/safely-prune-merged-branches-20261113` | CURRENT: branch audit and verified cleanup PR |
| `design/warm-departments-spacing-v1` | REVIEW: unique commits/merge ancestry not yet fully established |
| `design/warm-premium-visual-system-20261105` | KEEP: open PR #83 |
| `docs/awin-active-membership-evidence-20261104` | REVIEW: unique commits/merge ancestry not yet fully established |
| `docs/awin-cadbury-petlibro-terms-review-20261104` | KEEP: open PR #51 |
| `docs/awin-sixteen-programme-queue-20261104` | REVIEW: unique commits/merge ancestry not yet fully established |
| `docs/cadbury-petlibro-onboarding-20261104` | REVIEW: unique commits/merge ancestry not yet fully established |
| `docs/p0-01-verified-rollout-20261102` | REVIEW: unique commits/merge ancestry not yet fully established |
| `docs/p0-02-verified-rollout-20261102` | REVIEW: unique commits/merge ancestry not yet fully established |
| `docs/p0-03-verified-rollout-20261104` | REVIEW: unique commits/merge ancestry not yet fully established |
| `docs/price-availability-ebay-seo-20261105` | KEEP: open PR #85 |
| `docs/record-homepage-screenshot-fixes-20261113` | DELETE CANDIDATE: verified PR #127–142, exact merged head SHA checked at runtime |
| `docs/record-live-design-release-20261113` | DELETE CANDIDATE: verified PR #127–142, exact merged head SHA checked at runtime |
| `docs/record-tyre-showroom-production-20261109` | REVIEW: unique commits/merge ancestry not yet fully established |
| `docs/record-v051-awin-ebay-production-20261113` | DELETE CANDIDATE: verified PR #127–142, exact merged head SHA checked at runtime |
| `docs/record-warm-premium-v041-production-20261110` | REVIEW: unique commits/merge ancestry not yet fully established |
| `docs/seasonal-calendar-production-verification-20261113` | DELETE CANDIDATE: verified PR #127–142, exact merged head SHA checked at runtime |
| `docs/spec-gap-traceability-20261102` | REVIEW: unique commits/merge ancestry not yet fully established |
| `docs/spec-to-code-audit-roadmap-20261102` | REVIEW: unique commits/merge ancestry not yet fully established |
| `docs/visual-audit-release-verification-20261113` | DELETE CANDIDATE: verified PR #127–142, exact merged head SHA checked at runtime |
| `feature/advanced-tyre-facets-owner-catalogue-20261105` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/affiliate-network-readiness-20261101` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/all-16-awin-programmes-control-centre-20261104` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/analytics-intelligence-handover-20261030` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/automated-uk-seasonal-home-calendar-20261113` | DELETE CANDIDATE: verified PR #127–142, exact merged head SHA checked at runtime |
| `feature/awin-advertiser-onboarding-publishing-20261104` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/awin-all-retailer-image-evidence-20261113` | DELETE CANDIDATE: verified PR #127–142, exact merged head SHA checked at runtime |
| `feature/awin-auto-import-clean-rebase-20261105` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/awin-bulk-job-journal-20261105` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/awin-bulk-lease-checkpoint-20261105` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/awin-bulk-readiness-planner-20261105` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/awin-canonical-private-taxonomy-20261030` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/awin-departments-crafts-20261030` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/awin-feed-catalogue-safety-20261104` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/awin-feed-check-fallback-and-import-safety-20261105` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/awin-feed-inventory-on-latest-main-20261104` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/awin-feed-monitor-current-main-20261104` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/awin-full-feed-matrix-20261104` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/awin-manual-private-stage-20261105` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/awin-mozillion-manual-stage-20261105` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/awin-preview-department-routing-20261105` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/awin-private-auto-import-v1-20261105` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/awin-private-multi-advertiser-upload-20261104` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/awin-private-snapshot-storage-20261105` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/awin-private-snapshot-validation-reports-20261105` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/awin-private-tus-upload-and-validate-20261105` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/awin-readonly-diagnostics-20261104` | KEEP: open PR #48 |
| `feature/awin-safe-feed-change-monitor-20261104` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/awin-safe-private-scheduled-pilots-20261105` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/awin-seven-programme-policy-registry-20261105` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/awin-snapshot-verify-from-storage-20261105` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/awin-tooled-up-header-probe-20261105` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/awin-tooled-up-manual-private-snapshot-20261105` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/cadbury-private-import-2026` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/category-destinations-distinct-20261030` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/category-product-pages-current-main-20261104` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/category-specific-product-previews-20261104` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/christmas-2026-landing` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/control-centre-workspaces-site-advertising` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/current-live-handover-20261113` | DELETE CANDIDATE: verified PR #127–142, exact merged head SHA checked at runtime |
| `feature/ebay-epn-uk-browse-readiness-20261105` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/ebay-sandbox-awin-retailer-readiness-20261113` | DELETE CANDIDATE: verified PR #127–142, exact merged head SHA checked at runtime |
| `feature/ebay-uk-private-pilot-product-polish-20261104` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/eight-draft-products-review-20261030` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/four-brand-marketing-workspace` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/full-25-department-browse-20261030` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/full-site-editorial-and-transparency-2026` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/general-awin-streaming-import-20261104` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/lifestyle-category-destinations-2026` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/live-data-monitor` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/live-shopping-feed-onboarding-20261104` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/live-shopping-layout-integration-20261104` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/marketing-tyres-all-category-product-readiness-20261110` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/mobile-category-navigation` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/mobile-polish-2026-10-29` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/mozillion-multi-feed-type-safety-20261105` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/navigation-v2-cms-search-mobile` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/owner-images-category-queue-20261104` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/owner-storefront-products-preview-20261104` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/petlibro-private-import` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/pets-landing-2026` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/photo-led-category-pages-2026` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/pneus-online-private-server-import-20261109` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/premium-storefront-discovery-20261104` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/private-catalogue-pagination-tyres-20261104` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/private-product-brand-detail-previews-20261030` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/private-product-preview-gallery-20261030` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/private-responsive-storefront-journeys-20261104` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/production-shopping-partner-roadmap-20261113` | DELETE CANDIDATE: verified PR #127–142, exact merged head SHA checked at runtime |
| `feature/production-visual-audit-20261113` | DELETE CANDIDATE: verified PR #127–142, exact merged head SHA checked at runtime |
| `feature/project-register-wishlist-basket-20261102` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/restore-full-storefront-production-20261113` | DELETE CANDIDATE: verified PR #127–142, exact merged head SHA checked at runtime |
| `feature/restore-header-branding-production-20261113` | DELETE CANDIDATE: verified PR #127–142, exact merged head SHA checked at runtime |
| `feature/restore-photographic-home-hero-20261113` | DELETE CANDIDATE: verified PR #127–142, exact merged head SHA checked at runtime |
| `feature/seasonal-visual-assets-2026` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/tooled-up-awin-programme-currency-proof-20261105` | KEEP: open PR #102 |
| `feature/tooled-up-bounded-row-diagnostics-20261105` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/tooled-up-discovery-current-main-20261104` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/tooled-up-full-stream-validator-20261105` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/tooled-up-private-catalogue-filters-20261104` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/tooled-up-private-schema-adapter-20261105` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/tooled-up-resumable-large-feed-20261104` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/tyre-catalogue-production-readiness-20261109` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/tyre-custom-column-evidence-20261105` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/tyre-feed-readonly-inspection-20261105` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/tyre-safe-failure-codes-and-row-sample-20261105` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/tyre-spec-evidence-and-vehicle-roadmap-20261105` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/tyres-design-contract-multiretailer-comparison-20261109` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/tyres-uk-currency-and-fitment-safety-20261105` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/tyres-uk-in-place-spec-enrichment-20261108` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/tyres-uk-owner-private-staging-20261105` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/tyres-uk-server-auto-enrichment-v2-20261109` | KEEP: open PR #117 |
| `feature/unified-marketplace-whos-who-source-command-20261109` | REVIEW: unique commits/merge ancestry not yet fully established |
| `feature/universal-categories-inactive-20261030` | KEEP: open PR #25 |
| `feature/warm-premium-experience-v1-20261105` | KEEP: open PR #93 |
| `fix/affiliate-approval-admin-guards-20261030` | REVIEW: unique commits/merge ancestry not yet fully established |
| `fix/awin-atomic-release-sql-terminator-20261104` | REVIEW: unique commits/merge ancestry not yet fully established |
| `fix/awin-cadbury-feed-error-safety-20261104` | KEEP: open PR #50 |
| `fix/awin-import-preflight-and-resume-20261104` | REVIEW: unique commits/merge ancestry not yet fully established |
| `fix/awin-preflight-safe-header-diagnostics-20261105` | REVIEW: unique commits/merge ancestry not yet fully established |
| `fix/customer-item-links-and-roadmap-20261030` | KEEP: open PR #21 |
| `fix/header-menu-layout-20261029` | REVIEW: unique commits/merge ancestry not yet fully established |
| `fix/homepage-screenshot-findings-20261113` | DELETE CANDIDATE: verified PR #127–142, exact merged head SHA checked at runtime |
| `fix/mozillion-123-column-private-projection-20261105` | REVIEW: unique commits/merge ancestry not yet fully established |
| `fix/mozillion-distinguish-csv-parser-limits-20261105` | REVIEW: unique commits/merge ancestry not yet fully established |
| `fix/mozillion-header-inspection-20261105` | REVIEW: unique commits/merge ancestry not yet fully established |
| `fix/mozillion-preflight-parser-diagnostics-20261105` | REVIEW: unique commits/merge ancestry not yet fully established |
| `fix/no-false-homepage-loading-hero-20261113` | DELETE CANDIDATE: verified PR #127–142, exact merged head SHA checked at runtime |
| `fix/numbered-feed-filenames-20261104` | KEEP: open PR #58 |
| `fix/p0-01-event-write-integrity-20261102` | REVIEW: unique commits/merge ancestry not yet fully established |
| `fix/p0-02-source-rights-failclosed-20261102` | REVIEW: unique commits/merge ancestry not yet fully established |
| `fix/p0-03-private-collections-20261104` | REVIEW: unique commits/merge ancestry not yet fully established |
| `fix/petlibro-awin-uk-currency-adapter-20261105` | REVIEW: unique commits/merge ancestry not yet fully established |
| `fix/phase1-saved-watches-routing-20261030` | REVIEW: unique commits/merge ancestry not yet fully established |
| `fix/private-pilot-products-rls-20261030` | REVIEW: unique commits/merge ancestry not yet fully established |
| `fix/tooled-up-owner-images-pagination-20261104` | REVIEW: unique commits/merge ancestry not yet fully established |
| `fix/tyres-private-images-and-catalogue-20261105` | REVIEW: unique commits/merge ancestry not yet fully established |
| `main` | PROTECTED: live default branch |
| `security/block-future-secret-commits` | REVIEW: unique commits/merge ancestry not yet fully established |
| `security/remove-exposed-build-archive` | REVIEW: unique commits/merge ancestry not yet fully established |

**Next cleanup batch:** Build a verified merged-PR head map from GitHub across the older 2026-10/11 history. Do not equate `git compare` “diverged” with unmerged feature after squash merges. Only delete if the branch SHA still equals a merged PR's frozen head SHA and no open PR uses it. Maintain the source branch inventory in GitHub for restart.
