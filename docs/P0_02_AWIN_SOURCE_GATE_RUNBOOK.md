# P0-02: external source rights and emergency-stop audit

## Verified baseline (2 Nov 2026, read-only database)
- Awin registry row: `active` and `sync_enabled=true`, but `credential_status=not_configured`, no last successful sync, and no evidence of approved data, link or image rights in metadata.
- Five private Awin file imports: Craft Buddy 1,299; Cadbury 1,371; Petlibro 98; AKKO 910 twice. Total **4,588 staged rows including the duplicated AKKO run**. All import-run permissions are **unverified**.
- Awin pipeline sync runs: 0. The **six** `published_deals` rows were pre-existing demo fixtures, not evidence of licensed Awin offers. No Awin feed or advertiser rights were granted by this audit.
- Source controls: `source_ingestion=true`, `deal_publishing=true`, `global_emergency_stop=false`. Control states are **not** licence approval.

## Verified code gap
- Before this fix, `runDealIntelligencePipeline` checked only registry active/sync and whether connector credentials existed, not rights/territory/advertiser-specific evidence. Missing or failed system-control reads defaulted to processing and publishing allowed.
- The public offer gate separately rejected demo/unlicensed offers, but that alone did **not** prevent external data ingestion and creation of private product, price history, Score and candidate rows.
- Awin's manual dashboard run button checked environment configuration without requiring recorded rights evidence.

## New fail-closed boundaries
1. Gate all non-demo ingestion before the feed HTTP call. Require active+sync, configured connector, registry credential ready, source usage/feed evidence, permitted GB territory and unexpired permission. For Awin, match the server-configured advertiser ID to an explicitly approved advertiser with its **own** evidence and expiry.
2. Re-check source status, approval expiry and emergency/ingestion controls during every external feed record. A source paused or revoked during a run stops the remainder. A missing/failed critical control read blocks processing rather than allowing it.
3. Public verified-offer admission also honours current emergency stop and publishing controls and source/advertiser evidence. Previously published rows cannot bypass a pause merely because their stored status is `published`.
4. Control Centre action/UI must not resume or launch an Awin source until eligibility passes. Demo remains a separate synthetic, non-public test source.
5. Apply `20261102172000_pause_unapproved_awin.sql` **after** the matching code is deployed. It pauses Awin and disables sync without deleting the private import records, original offers or scoring history.

## Operator verification
- Check Vercel matches merged release SHA and build is READY.
- Apply the reviewed SQL migration using the connected Supabase migration tool. Re-query Awin status and `sync_enabled`; both must be `paused/false`.
- Recheck `feed_import_runs` permission statuses, `feed_import_records` row count (4,588), Awin sync-run count (0), and public-surface source eligibility.
- Verify `system_controls` values and that `/control-centre/source-readiness` clearly displays missing evidence, even if registry flags are manually set to active.
- Test negative cases: control query error/missing row, stop enabled, source paused, no credentials, source network-level rights without matching advertiser, expired source/ad approval, wrong territory, connector configured but source not approved, and an approval revoked mid-run.
- Test positive case only with synthetic evidence fixtures. **Do not call an actual Awin API** or claim permission unless the publisher/advertiser approvals are independently supplied and recorded.

## What is not done
- No applications/credentials/merchant rights obtained, no feed API requests, no live Awin product ingestion, no publisher-approved images or price evidence, no automated publishing or data activation.
- Full owner emergency-stop drills and multi-user role acceptance still belong to P0-05. Merchant-by-merchant rights onboarding belongs to P1-01. This release is P0-02 safeguarding, not proof of a live affiliate programme.
