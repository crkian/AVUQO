<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Complete project and owner idea registry (14 November 2026)

The durable [master Git/branch/idea index](docs/AVUQO_COMPLETE_GIT_BRANCH_IDEA_HANDOVER_INDEX_2026-11-14.md) and [machine-readable companion](docs/AVUQO_COMPLETE_GIT_BRANCH_IDEA_HANDOVER_INDEX_2026-11-14.json) map **all 22 GitHub branch names observed on 14 Nov**, 5 draft PRs, 29 roadmap workstreams, 12 known requirement gaps, 9 original owner source assets, and the handover hierarchy. Read these when the owner asks for "everything", wants a comprehensive delivery plan, or starts a new project workstream. Re-query GitHub for the *current* branches/PRs and Vercel for production before acting. Do not commit confidential source PDFs or unpublished design binaries into the public repo to make the index look complete. Never call mapped ideas "live" without implementation, data rights, production and actual acceptance evidence.

## Required restart protocol (13 November 2026)

**FIRST: fetch from current `main`** `AVUQO_START_HERE.md`, `docs/AVUQO_LIVE_HANDOVER.md` and `docs/AVUQO_CURRENT_STATE.json`; then the Compass, status, backlog and relevant implementation sources. This is the canonical quick handover and overrides stale pending wording from old PR plans.

**SECOND: verify reality** using connected GitHub and Vercel, not this file alone: current main HEAD, open PRs, latest READY production deployment SHA and `www.avuqo.com` alias. For Awin/eBay/tyres, verify live Supabase rights, freshness and source state separately. Clearly label code live, private showroom, provider-approved, public offer live and blocked. Never assume an API approval from earlier conversation.

**THIRD: after each release**, update readable handover, machine-readable JSON, Compass (if strategy changed), status and changelog. When exact deployed SHA is known only after merge, a follow-up docs-only release record is needed, and every future chat still must recheck Vercel. Protect latest Awin/eBay/tyre/auth/Control Centre work; selectively port old design components onto current main only. Public customer features belong on production routes, not permanent `/preview` pages.

## Branch discipline and cleanup (14 November 2026)

- Always branch from currently verified `main`, one small PR per release. Do not leave idle merged branches, push directly to production or use a stale historical branch as the new baseline.
- `.github/workflows/verified-merged-branch-cleanup.yml` runs after main pushes and removes **only** unique verified merged PR #127+ branch tips matching the frozen final reviewed commit, with no active PR, protection, security or original design archive. It cannot safely retire branches whose history has diverged.
- Historical refs and all open PRs require diff-to-current-main reconciliation before closure. The 14 Nov branch inventory was reduced from 63 to 25 by merged-PR cleanup and then to **22 including main** after separately verified closed-PR #50/#51/#85 reconciliation; current names and proof live at `docs/BRANCH_REDUCTION_RESULTS_AND_RECONCILIATION_2026-11-14.md`. Do not delete other divergent refs without source-by-source reconciliation. Preserve original visual assets, security evidence and risky Tyres UK prototypes until value is incorporated or explicitly rejected with documentation.
- After an actual production release, record the exact GitHub SHA, Vercel READY ID, aliases and acceptance evidence in START_HERE, live handover and machine state, and verify the automatic cleanup's updated branch inventory before claiming the branch was removed.

## AVUQO living project context (read before doing work)

- Read `docs/PROJECT_STATUS.md`, `docs/ROADMAP.md`, `docs/SOURCE_TO_CODE_AUDIT_2026-11-02.md`, `docs/SOURCE_MANIFEST_2026-11-02.md`, `docs/SOURCE_REQUIREMENT_GAPS_2026-11-02.md`, `CHANGELOG.md` and `package.json` from the **current** GitHub branch. Current `main` and verified production data override dated snapshots.
- Check open PRs and branch ancestry before modifying `main`; never overwrite another branch's unique work.
- Update `docs/PROJECT_STATUS.md` and `CHANGELOG.md` whenever a feature's status or release scope changes. Bump `package.json` and the lockfile together when creating a software release. Do not invent a deployed commit, version or live capability.
- Distinguish draft, merged, and production-verified states. A successful preview is not a public release. Staged Awin products and future affiliates are not automatically licensed for public offer publication.
- No raw API credentials or private user/customer data in Git. Keep marketing, source activation and outbound email disabled until verified and approved.

## Permanent warm-premium visual and cross-chat handover (10 November 2026)

- **Always read `docs/AVUQO_PROJECT_COMPASS.md` first**, then the dated project status, live `main` and release evidence. The Compass indexes all original uploaded PDF/markdown specifications, user screenshot mockups, branch audit, source rights, seasonal plan, self-advertising and automation decisions.
- Read `docs/design/AVUQO_WARM_PREMIUM_VISUAL_IDENTITY_2026-11-05.md`, `docs/design/avuqo-warm-tokens.v1.json`, `docs/design/AVUQO_PAGE_BLUEPRINTS_AND_DESIGN_COVERAGE_2026-11-05.md` and `docs/design/AVUQO_VISUAL_REFERENCE_INDEX_2026-11-10.md` before changing any customer-facing design.
- **Do not drift away from the approved look:** warm ivory/cream pages, navy text, violet/indigo controls, high-quality category photography, inviting seasonal heroes, carefully spaced cards, My AVUQO personal tools. Tyres can have a dark-plum specialist theme but must share the brand.
- The old `design/warm-premium-visual-system-20261105` and `feature/warm-premium-experience-v1-20261105` branches hold original assets and unmerged UI. They are divergent from production; **selectively port**, never wholesale merge.
- Original screenshots contain illustrative AVUQO Scores, product prices, drops, reviews, budgets and advertiser logos. These are **not verified production data** and must never be silently treated as valid offers or customer metrics.
- Reuse existing `/control-centre/site-advertising`, `/control-centre/marketing`, `/control-centre/seasonal` and `/control-centre/source-atlas`. Independent editorial content, paid campaigns, social promotion and affiliate links have different approval gates. Respect kill switches.
- In every new coding session, fetch this file and the Compass from current GitHub. This handover is durable documentation, **not automatic conversational memory**. Update both project status and Compass after verified releases and clearly identify any work still in a branch.
