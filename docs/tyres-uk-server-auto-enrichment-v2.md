# Tyres UK: automatic private snapshot enrichment (V2)

Status: **draft code / disabled until reviewed, migrated and accepted**. No public product publication or pricing activation.

## Why this replaces the phone-upload path

The 5 Nov 2026 Tyres UK run `8ea807f1-7050-4dfb-af51-e08dc7c7bbd5` finished with 31,372 rows (28,990 private review, 2,382 excluded). Its original compressed file digest must not be confused with later Awin feed snapshots. The original file is not retained in Supabase Storage. Existing private records contain candidate width/profile/rim but not enough original feed columns to safely derive load index and speed rating in place without source evidence.

The V1 browser uploader remains only as exact-original-file recovery. V2 uses configured **server-side** Awin feed credentials to inspect the active joined `12715:93988` source and fetch the current Awin snapshot, so an owner need not put a supplier file on a phone.

## Safe V2 flow

1. Vercel cron GET `/api/internal/awin-tyre-auto-enrich` (07:35 UTC daily), authenticated by existing `CRON_SECRET`. The additional `AWIN_TYRE_AUTO_ENRICH_ENABLED` variable must explicitly equal `true`; otherwise the handler makes no writes and fetches no products.
2. Require the Awin source still `paused` / `sync_enabled=false`, joined Tyres UK, and the original 31,372-row import completed in `private_review` with unverified source permission.
3. Use Awin's active feed inventory and exact approved productdata host binding. Never send or persist credential-bearing feed links.
4. Reject oversized, malformed, cross-advertiser or duplicate-ID snapshots. Hash **decompressed CSV content** for stable version identity; store the compressed bytes at a content-addressed path in private Supabase Storage `awin-bulk-private-snapshots` (not a public bucket). The hash is of the *current* snapshot content, not the original V1 file bytes.
5. Queue one job per source content hash. Claim with an atomic lease. Read the immutable snapshot and checkpoint after every 250 scanned source rows in a single database transaction. A later invocation resumes at the committed row offset. The worker is intentionally bounded by its serverless runtime.
6. Require unambiguous product ID, unchanged historical title, existing width/profile/rim, cross-checked Awin `custom_1...custom_5`/description, GBP and positive feed price. **The incoming price is only a source sanity check and is never used to overwrite or backdate the existing historical price.** Skip uncertain or changed products.
7. Append *unverified* load/speed evidence to existing review rows only. Do not insert products, update prices, verify vehicle fitment, grant image rights, change review decisions, reactivate the Awin source or publish offers.
8. Owner-only `/control-centre/tyre-spec-enrichment` shows job stage, row progress and the count of private records updated. Manual original-file upload remains under a recovery disclosure.

## New components

- `app/api/internal/awin-tyre-auto-enrich/route.ts`: gated server-only fetch/stage/lease/resume worker
- `lib/awin/tyres-uk-server-candidates.ts`: source evidence mapping
- `supabase/migrations/20261109133000_private_tyres_uk_snapshot_enrichment.sql`: private job state and service-role-only transaction/lease RPCs
- `tests/tyres-uk-server-candidates.test.mjs`: positive and negative input evidence checks
- Existing Control Centre status API / page and `vercel.json` schedule

## Required release gates

**Do not set the flag in production until all conditions hold.**

1. Review PR and apply additive migration in a controlled environment. Confirm new table has RLS, no `anon`/`authenticated` grants or RPC execute privileges; only service role.
2. Run Node tests, ESLint, TypeScript/Next production build and preview check. Confirm the cron defaults to disabled, has no anonymous access, and uses the expected Awin credentials.
3. Test a harmless fixture snapshot plus malformed, duplicate, cross-advertiser, conflicting-spec, changing-price, changed-title, concurrent-lease, interrupted-run and retry cases. Ensure completed jobs never modify unrelated catalogue records.
4. Confirm download size/parse/runtime/storage limits with real private Awin feed **without publishing or exposing provider data**. If too large for one serverless invocation, move staging/processing to a durable worker rather than removing bounds.
5. Compare reported totals to existing 28,990 review candidates; identify expected skipped rows and manually review a sample against the source. Check original prices and all publication flags before/after.
6. Set `AWIN_TYRE_AUTO_ENRICH_ENABLED=true` only after explicit owner acceptance. Keep Awin itself paused. Provide disable/rollback instructions.

## Known limits

- Cron schedule is daily: a partially processed large snapshot may take multiple runs to complete. A timed-out lease is recoverable on the next run.
- Material changes to the title, tyre dimensions or identity are intentionally skipped, not silently merged. This is an enrichment path, not the future full delta-price ingestion pipeline.
- Current feed may not reproduce the exact 2026-11-05 original dataset, and missing/conflicting technical fields remain unverified.
- No new source rights are granted by this feature. The snapshot retention and deletion policy must be approved before long-term operation.
- This PR does **not** apply migrations, set the runtime flag, or prove a successful production deployment.
