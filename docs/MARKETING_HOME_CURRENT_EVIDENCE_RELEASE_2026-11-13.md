# AVUQO marketing homepage approval integrity

Status: **candidate**, 13 November 2026. Scope: homepage campaign evidence validation and owner review UX; no automated publication activation.

## Starting production evidence
- Connected Supabase `marketing_system`: `publishing_enabled=false`, `ai_enabled=false`, `emergency_stop=true`. On the inspection date there were **zero** `marketing_facts` and `marketing_home_placements` records.
- Cron `/api/internal/marketing` runs 09:00 UTC daily. Actual outbound dispatch is guarded by `MARKETING_WORKER_ENABLED=YES`, `MARKETING_LIVE_PUBLISH=YES`, system/brand/channel approvals and a verified social channel; editorial draft generation is a separate no-publication workflow. This release does **not** change any of those controls.
- The public homepage's anonymous Supabase role intentionally has column-limited SELECT on `marketing_home_placements` **excluding** private `fact_id` and marketing fact records. Keep those grants unchanged.

## Behaviour corrected
1. Continue selecting only approved/current AVUQO homepage campaigns via the existing **public** RLS and column-granted query.
2. For at most eight selected public placement IDs, a server-side service-role query checks that each placement still has the same approved/current status and retrieves only its private `fact_id`.
3. Check each referenced `marketing_facts` record is approved, AVUQO-specific and has no expired or invalid expiry. Invalid, revoked, missing, cross-brand or expired claims are **excluded** from public output. Any query error falls back to safe evergreen editorial content.
4. On the owner-only Control Centre, display `withheld` for approved placements with invalid/unavailable supporting evidence. Only show current approved facts in the homepage creation dropdown; only show a paused placement's resume button if its fact remains valid.
5. The owner-only server-side approve **and resume** actions recheck the same fact condition and placement expiry. Pausing remains allowed.
6. No new views, RPCs, SQL migrations, grants, product data, feeds, prices, cron schedules or marketing/AI/publishing flags.

## Acceptance
- Unit/contract tests cover approved, withdrawn, expired, malformed, missing, cross-brand and bad-link cases, matching evidence by placement ID, public/private column boundaries, owner approval/resume controls and no write side effects.
- GitHub build, lint, secrets, Vercel preview then exact-commit production READY with both AVUQO aliases.
- Unauthenticated production homepage continues rendering; owner-only `/control-centre/marketing` remains protected.
- With zero approved campaigns in live Supabase, do **not** create fake campaigns to force the display path. A future owner-approved **real** campaign must be manually verified after facts and rights exist.
- Marketing social delivery, AI generation, private Awin imports and paid advertising remain disabled until separately approved.
