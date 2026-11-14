## Pending candidate scan rendering fix · 14 November 2026

Branch `perf/live-data-candidate-suspense-20261114` separates the sequential read-only 200-row candidate scan (up to 5,000) from main Live Data metrics with an async server component and accessible Suspense/loading state. Source count cards and health summaries no longer await that scan once their independent queries finish. No table rights or supplier controls changed; error and permission-source unavailability is labelled rather than zero-filled. Source/test review and CI are separate from measured owner-browser latency acceptance. Detailed scope and release gates: `docs/LIVE_DATA_MONITOR_CANDIDATE_STREAMING_2026-11-14.md`. This is not marked live until Vercel READY is verified.

## Verified production implementation of this candidate · 14 November 2026

PR #195 merged code `08c34b2c58aa93084ed8e72d166bcba4120bf800`, Vercel `dpl_2r8GhTAvLXmMw4nbuA1EgymqdGbT` READY on production custom aliases; public homepage HTTP 200 exact deployment. CI build, lint, audit regressions, secrets scan and preview passed. Runtime log search for the strings `Date.now` and `prerender` in this release's sampled window returned no records. **This is code and smoke validation, not authenticated editor acceptance**; owner browser must revisit the editor and inspect new logs. Marketplace and Source Atlas use current role-gated admin-client code with live private table count 74; user-facing values and admin negative checks remain unverified. Live Data sequential scan next. Separate post-#194 product 404 failure remains open.

# Control Centre owner audit reconciliation: live observation metrics and editor request boundary

**Date:** 14 November 2026. **Source audit:** [AVUQO_CONTROL_CENTRE_OWNER_AUDIT_2026-11-14.md](./AVUQO_CONTROL_CENTRE_OWNER_AUDIT_2026-11-14.md). **Release status:** candidate pending CI, preview, merge, Vercel READY and signed-in browser/log acceptance.

## What the original read-only owner audit proved

The original owner browser rendered **56 fixed/detail pages** plus **14 linked editor/marketing variants**. That proves view accessibility, not success for Save, Publish, Import, Retry, supplier activation, source settings or multi-role state changes. The read-only audit found unavailable Awin observation metrics on Marketplace and Source Atlas, slow Live Data candidate scan, a request-time prerender warning in the public page editor, no configured endpoint targets, an Open Food Facts 503 and disabled marketing publishing/AI.

## Current-main check: Source Atlas and Marketplace

As inspected after product route PR #194 on current production SHA `417751d287686948a09e1f67a390fecc15dc97ec` (Vercel `dpl_4okbG4LCkUNPAXRatMoyVFwAEng2` READY):

- `app/control-centre/marketplace/page.tsx` and `app/control-centre/source-atlas/page.tsx` **already** call `await requireControlCentreAccess()` before `createAdminClient()` and query `awin_feed_update_observations` with that server-only admin client.
- The dedicated Awin monitor uses the same private access pattern. This supersedes the **source-code aspect** of the older owner-audit diagnosis; no new table grants or RLS policy should be added to solve it.
- A connected **read-only** Supabase count of `public.awin_feed_update_observations` returned **74**. The table's grants include service-role access, not broad session SELECT for every user.
- **Not yet proved:** both dashboard cards actually render **74** in a fresh signed-in owner browser, and no permission regression appears for an `admin` role. Do not mark that user acceptance complete simply because source code is right.
- CI in this candidate now guards both role-first server-client patterns so a future refactor cannot accidentally restore a session client or widen database privileges.

## P1 editor request-time/prerender issue: change in this PR

The public page editor `app/control-centre/content/pages/page.tsx` now declares `export const instant=false` and calls `await connection()` **before** role-check, `searchParams` and draft/publication database reads. The route intentionally waits for the authenticated request rather than running a private editor during partial prerendering. The existing server actions, editor defaults, owner-only Publish form and content remain unchanged.

**Acceptance:** GitHub build/lint/owner-audit regression/secret scan; Vercel preview; exact SHA production READY and owner signed-in `/control-centre/content/pages?page=home` load; check Vercel runtime/build logs for the prior `Date.now()` prerender warning on a *fresh* request. A code or build pass alone does not prove absence of the previous warning in an authenticated browser.

## P1 next: Live Data Monitor scan isolation

`app/control-centre/live-data/page.tsx` currently gathers several data sources in parallel but then makes a **sequential paginated read** of up to **5,000** `feed_import_records` rows, 200 per page, before it renders any of its metrics. The next small PR should:

1. Measure actual route time and scan page count in a role-authorised, read-only session; keep timings generic and avoid merchant data in logs.
2. Move the bounded candidate scan into its own Suspense-isolated component and clear loading skeleton, so source/offer metrics can render without waiting for 25 serial pages.
3. Preserve the 5,000-row cap, historical import rows, dedupe semantics, error/partial-data labels and no-write boundary.
4. Treat the endpoint diagnostic's unconfigured state as a configuration dependency, not a fake failure; treat Open Food Facts 503 as an upstream sample error, not as permission to retry aggressively.

## Separately tracked product HTTP status failure

Four public named research-guide product routes were verified HTTP 200 with **no current authorised offers**. PR #194 tried a pre-stream slug check and reached production READY, but fresh live checks still found HTTP **200** for unknown and demo pilot slugs. Page content remains not-found/no approved offer, but **true HTTP 404 is still NOT accepted**. See the top live handover issue and do not claim it solved. Investigation must respect Next.js Cache Components/streaming and preserve dynamic future verified products without hardcoded exclusions.

## Production safety baseline

Latest read-only source checks: Awin `paused` and `sync_enabled=false`; marketing `publishing_enabled=false`, `ai_enabled=false` and `emergency_stop=true`. No Supabase writes, role grant changes, cron changes, source resume, campaign posting, paid placement or fake product publication in this PR.

## Work-mode parallel handoff

Use the existing [read-only Work product/design QA brief](./WORK_PARALLEL_PRODUCT_DESIGN_QA_BRIEF_2026-11-14.md) for **browser evidence only**, or run a separate **read-only** owner-session Control Centre acceptance pass when owner access is available. Never let Work modify the same Git branch, publish a page, import a supplier, or change settings while connected engineering work proceeds. Report screenshots, route timings, Awin count card values, and the exact request/log evidence with any unverified controls clearly labelled.
