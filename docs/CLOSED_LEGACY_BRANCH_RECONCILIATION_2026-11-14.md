# Reconciled closed historical PR branches: exact-scope retirement

Evidence date: 14 November 2026. **Candidate until GitHub CI, merger, action logs and a subsequent branch-count check.**

This is **not** a broad delete of divergent or closed PRs. Each branch below is a single, frozen historical PR, closed without merging, whose substantive contribution has been checked against current `main`. The historical PR's review and commits remain in GitHub after ref retirement.

## #50: safe Awin provider-error text
- Branch `fix/awin-cadbury-feed-error-safety-20261104`; frozen closed PR #50 head `a5e7e7b11c0bcb93275da0374b940dc7ed24884c`.
- Historical difference limited to `lib/connectors/awin.ts` (one file): remove raw provider body from errors, return only numeric HTTP status. The current `main` code already throws `Awin feed request failed (HTTP ${response.status})` and does not read/log the body in this failure branch. The comments were rewritten, but security behaviour is preserved and more clearly documented.
- Main file blob checked: `b04751fd8bdc0afbcbc1e7a2120f274c81a4d910`. This is the only preserved-code path trusted by the limited retirement workflow. If it changes, require re-review. No source activation, customer-visible images or live import work.

## #51: Cadbury/Petlibro restrictions and uncertain photo rights
- Branch `docs/awin-cadbury-petlibro-terms-review-20261104`; frozen closed PR #51 head `845dcee1c3b91007a02d915a36367253c9e14d5f`.
- Historical difference is a single added document: `docs/AWIN_CADBURY_PETLIBRO_TERMS_REVIEW_2026-11-04.md`. The current-main document has the full merchant restriction sections and **additional** 13 November porting/Control Centre notes. Compared long lines: 28 of the 29 original substantive lines remained verbatim; one opening statement changed. Preserve its original fact here: **"Evidence received: 4 November 2026. Status: terms inspected; advertiser-specific publication rights still NOT confirmed."** The original review was based on owner-provided welcome emails and PDFs and should not cause those private files to be committed publicly.
- Current main document is a newer reviewed copy, blob `711273ba18f911f437c3257fa91c697731488781`. No assertion of feed/image rights, commission resolution or source activation is made. This ledger is an index, not a replacement for the original private evidence.

## #85: price, availability, eBay and Watch/SEO requirements
- Branch `docs/price-availability-ebay-seo-20261105`; frozen closed PR #85 head `d513679c2ac41300f934e0624b8e2285546b4245`.
- Core requirements file `docs/PRICE_AVAILABILITY_EBAY_SEO_REQUIREMENTS_2026-11-05.md` has **identical Git blob SHA on current main and the historical branch**, `677e9daaf46dcf791e8fc4adc389cfec23b94411`. No requirements material in that document would be lost.
- The old PR also edited CHANGELOG, PROJECT_STATUS and ROADMAP with contemporaneous statements that the price/freshness states, opt-in Watches, eBay listing condition, canonical SEO and JSON-LD requirements were **documentation only**, not a live offer import, Watch notifier, schema change or merchant approval. The same referenced requirements remain available on current main. Current project status/roadmap are newer and must take precedence over those dated planning notes.

## Exact deletion gates
An additional one-time workflow, `.github/workflows/reconciled-closed-pr-branch-retirement.yml`, is permitted to retire **only the three explicit branch names** above. It must independently confirm the frozen closed PR number, its unmerged state, branch head and last PR commit; current GitHub ref head unchanged; no open/reused PR; no protected/security/design reference; and exact current-main preserved file blob plus this ledger. GitHub errors or mismatches **preserve** the branch.

Do not extend this allowlist without another actual diff-to-main audit, recorded old contribution, new frozen head and main-file digest. The separate ongoing cleanup of **merged** PR branches, and the pre-127 historical **merged** PR review workflow, have different proof requirements.

## Remaining review order
Review `docs/p0-03-verified-rollout-20261104` with the current authentication/data-access acceptance, then `fix/numbered-feed-filenames-20261104`, `feature/awin-safe-feed-change-monitor-20261104`, and the other dated supplier/UX refs. Preserve `design/warm-premium-visual-system-20261105`, `feature/warm-premium-experience-v1-20261105`, the two `security/` refs, open #25 taxonomy, unsafe #117 tyre worker, and #158 dormant lease primitives until separately reconciled.

**Retiring the branch is not merging its original PR.** The contribution was already selectively ported; the old PR remains closed and auditable. Check actual workflow runs and the branch list before claiming ref deletion.
