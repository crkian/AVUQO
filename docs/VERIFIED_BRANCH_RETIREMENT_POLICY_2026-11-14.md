# AVUQO GitHub branch retirement policy · 14 November 2026

## Goal
Keep `main` as the sole production release branch and **zero unnecessary branches**. Branches exist only for active, small PRs and historical assets/unique work awaiting reconciliation. A PR merge does not authorize deleting a moved branch, a historical reference, a security investigation or an open PR.

## Read-only inventory baseline
- Current GitHub branch query returned **63 branches** including `main`; follow-up pagination returned none. **5 open PRs**: #25 taxonomy, #83 design reference, #93 historical storefront, #117 unsafe bundled Tyres UK worker, #158 draft lease-only SQL.
- Starting Vercel READY production app commit `43da00fd19e0e37e0cb3fe79c7da53504028da2e` (`dpl_5SNMJJUS1Y6KrinuFyJV6W8Rn867`). Repo state and actual deployment are rechecked before each release.
- The existing `verified-historical-branch-cleanup.yml` owns PRs <=126, with SHA equality and frozen PR commit checks. Preserve its original design/security exclusions.

## Ongoing verified merged-branch cleanup
The updated `.github/workflows/verified-merged-branch-cleanup.yml` runs after each **main push** and supports manual `workflow_dispatch` dry run by default. It enumerates **only existing branch names associated with merged PRs #127+**; it does not scan by names such as `feature/*` or delete arbitrary branches.
It deletes a ref only after confirming:
1. The PR is closed and merged into `main` from the same repository.
2. The name is neither `main`, `master`, a `security/` ref nor the original warm-premium archive branches.
3. No open PR uses the branch, and the name is not reused across PRs.
4. Its current SHA **exactly** matches the frozen PR head SHA and the last reviewed PR commit SHA.
5. GitHub confirms the branch is not protected; any error leaves the ref intact.

Any branch with unique commits, changed SHA, uncertain merge history, active PR, original design images or security evidence is **retained and reported for manual inspection**. A successful CI test proves the workflow gates, not that the actual GitHub delete run succeeded. Check the automatic workflow run log and re-query branches after merge; never claim deletion based on a plan alone.

## Future branch discipline
- Create short-lived branches from the verified current `main`. One PR per logical improvement; no direct pushes to production.
- Merge after CI, secret scans, Vercel preview and source gates. Verify exact `main` SHA READY, aliases and route smoke checks.
- The cleanup workflow can retire eligible merged heads. Do not create a separate long-lived docs branch; use a small docs-only PR only when needed to record exact production commit.
- Keep the remaining five historic open PRs and their source refs **until each unique contribution is either ported to current main or intentionally rejected with evidence**. Prioritise a taxonomy diff reconciliation, original warm-premium image asset preservation, then the isolated Tyres UK lease tests. **Do not merge old #117 wholesale.**
- Do not use force-update, rebase-away, or delete to conceal unmerged features.
