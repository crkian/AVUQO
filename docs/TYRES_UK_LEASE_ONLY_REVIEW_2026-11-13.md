# Tyres UK lease-only PR: review gates, not an activated worker

Date: 13 November 2026. Status: **draft, SQL not applied**.

## Verified starting point
- PR #157 merged at `f57ba2452f5fa4dd6d75ccb2bd3be681353458a8`; Vercel deployment `dpl_HJcyAeNgHBKyStJ8m7wbkNGabNuc` READY with `www.avuqo.com` and `avuqo.com` aliases.
- Connected Supabase job journal exists, has zero jobs, RLS, revoked browser privileges, default state `blocked`; Awin source remains paused with sync disabled.
- **Migration version discrepancy:** Repo journal file `20261113210500_tyres_uk_private_job_journal_only.sql` was applied through Supabase's migration service under version **`20261113202720`** and name `tyres_uk_private_job_journal_only`. Reconcile local CLI migration history **without rerunning a destructive migration** before accepting another schema release.
- Historical PR #117 is unmergeable and would replace the existing Pneus scheduled import. Its hardcoded historic Tyres UK feed `93988`, queued default, worker and price-derived logic must not be deployed wholesale.

## This PR adds
Only two dormant `SECURITY INVOKER`, service-role-executable SQL primitives:
1. `claim_private_tyres_uk_snapshot_job(uuid)`: atomic row update, admits **only queued jobs** or **expired running jobs** and only while Awin remains paused. Never promotes a blocked job. Returns a fresh lease token and immutable job identity.
2. `renew_private_tyres_uk_snapshot_lease(uuid,uuid)`: renews only an unexpired lease belonging to that exact token, while Awin remains paused.

Both functions are explicit `PUBLIC`/`anon`/`authenticated` execute-revoked. Neither creates or queues jobs, processes batches, writes product records, calls Awin, schedules cron or changes public offers. No write worker exists yet.

## Release blockers and tests
- Validate `sources.connector_key='awin'` against live schema and check there is exactly one paused Awin source.
- Reconcile migration history between GitHub SQL filename and connected Supabase version.
- In a controlled/test transaction, create *fixture-only* job references from authorised test import rows, validate **two simultaneous claims only return one lease**, expired lease reclaim gets a different token, wrong token cannot renew, unexpired lease cannot be stolen, blocked job cannot be claimed, and no product/source/pricing records change. **Do not insert fixtures in production**.
- Validate anonymous and authenticated roles cannot execute either RPC; service_role can, and no new Supabase security warnings other than known informational service-only/no-policy findings.
- Test fail-closed behaviour for absent/unpaused source, absent snapshot and invalid immutable source metadata. Lease functions do not themselves establish snapshot source rights; queue-state transitions require a later separate approved release.
- Confirm old `/api/internal/awin-pneus-private-import` remains in `vercel.json` and no new tyre cron/flag.
- Do not merge/deploy until CI, SQL runtime tests and current Supabase permissions review are complete. Keep PR #117 open.
