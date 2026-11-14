# Marketing editorial draft scheduler: per-rule failure isolation

Date: 14 November 2026. **Candidate until merged and production READY.**

## Actual starting state
- Main and live production verification: `0cd64b8ccd73a8f298a62e07937e0bb537f26d1c`, Vercel `dpl_BsoRWdS8cYsc9Z1JJ6v5EkiLctds` READY with `www.avuqo.com` and `avuqo.com` aliases.
- Connected Supabase read-only checks: `marketing_automation_rules` 0 total, 0 enabled/due; `marketing_posts` 0 total/drafts. `marketing_system` publishing OFF, AI OFF, emergency stop ON.
- The existing Vercel `/api/internal/marketing` cron at 09:00 UTC calls optional editorial draft generation separately from the gated social publishing worker. `MARKETING_AUTOMATION_DRAFTS=YES` is still a separate server-side prerequisite. **This change does not turn it on.**

## Defect and correction
Before this change, the scheduler calculated `nextEditorialRun` and claimed an enabled rule outside the per-rule `try/catch`. One malformed cadence or transient claim error could abort the entire cron response, skipping other due rules. It could also obscure which rule failed.

The new pure `editorialRulePreflight` checks: recognised brand, permitted Facebook/Instagram draft platform, non-empty owner identity, due timestamp, and cadence from 2 to 14 days. This is executed *inside* each rule's own error boundary, before any mutation. A failed rule is counted in `skipped` and gets a bounded `last_error` best-effort, guarded by its expected `next_run_at` and enabled state so stale workers cannot overwrite newer status. Errors in writing the error message are also isolated. Other rules continue processing. Successfully claimed rules retain the existing optimistic compare-and-set, fact approval, weekly cap, duplicate caption checks and **draft-only** insert.

## Release gates
- Unit/contract tests cover valid and invalid brands/channels, cadence boundaries, absent owner, invalid and future due times, per-rule error boundary and draft-only SQL semantics.
- GitHub quality build/lint, secrets check, successful Vercel preview, then merge and exact SHA production READY with `www.avuqo.com` alias.
- Verify signed-out `/api/internal/marketing` remains 404 (no leaked internals) and public homepage 200 with current deployment ID.
- No database migrations, cron changes, merchant import jobs, social posting or production test fixtures.
- With no live enabled rules and no posts, actual run-level acceptance requires a separately owner-approved rule and real approved fact later. No fake rules/posts will be inserted into production.

Next: controlled Awin metadata monitor/import recovery assessment and owner-visible readiness checks, while existing source pauses and merchant publication gates stay unchanged.
