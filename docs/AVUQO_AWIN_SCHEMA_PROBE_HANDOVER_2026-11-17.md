# AVUQO Awin universal feed schema probe handover
Date: 2026-11-17

## Objective
Recognise every feed in the accepted Awin portfolio before trying to process or publish individual products. Preserve independent source permissions, exact identity matching, specialist tyre and service adapters and owner-controlled publication.

## Last independently confirmed production baseline
- Production READY deployment: `dpl_A5hE5mUr15QRT7Mda6c6RfCMppTY`, commit `f69c465`.
- Historical recorded dashboard: 21 accepted programmes, 76 feed observations, 0 canonical Awin offers. These are not fresh claims about the live database.
- Feed-by-feed owner recognition is live, but unknown headers (example Petlibro 77952:109051) remain blocked from ordinary product staging.

## New work in draft PR #288
Branch: `feature/awin-universal-schema-probe-20261117`.
- Added `lib/awin/feed-schema-profile.mjs`: safe, header-only comma/tab/semicolon/pipe inspection and JSON/XML format recognition.
- Added regression tests `tests/awin-feed-schema-profile.test.mjs` (4 local passes).
- Added `/api/internal/awin-feed-schema-probe`: server-only CRON-secret authenticated read-only probe selecting one observed feed linked to an explicitly accepted programme, authenticating it against the exact live Awin inventory.
- Unknown retail feeds can be inspected without adding them to the importer staging allowlist.
- Product-data download is bounded to 3 MB compressed/12 MB uncompressed per request, with no redirects, no persistence and no returned row data, credential, signed link or sample values. Oversized feeds are quarantined for streaming-adapter development.
- Existing specialist tyre, service/contract and large Tooled Up sources remain on specialist routes.
- Owner task `portfolio_schema_probe_next` added to `/api/control-centre/awin-run-now`, with an `Inspect next accepted feed` button in `OwnerAwinRunNow.tsx`.
- Existing allowlisted importer returns safer schema profile diagnostics on both successful and failed preflights.

## Do not misrepresent
- This is a draft branch, not production until independently deployed.
- Probing is not ingestion, schema-adapter approval, merchant rights verification, product identity matching, or public publication.
- Profiles are returned live to the owner, not persisted yet; the UI counter resets on reload.
- The existing nine-feed physical staging allowlist and product-row maximum remain unchanged.

## Remaining work
1. Verify Vercel preview READY, TypeScript, lint and source-specific tests.
2. Test owner-only probe against Awin for multiple observed feeds including Petlibro sale and both CSV variants; audit no signed URLs or raw values in the response.
3. Create a private persisted schema observation ledger using an additive, RLS-protected Supabase migration and owner-authenticated scan tracking.
4. Build streaming parsing adapters with checkpoints and idempotent source records, separate from publication.
5. Connect product identity, stock, GBP price, affiliate tracking, rights validation and the existing canonical HELD review pipeline.
6. Test non-owner rejection, emergency stop boundaries, malformed provider feeds, giant compressed files and provider rate limits.
7. Promote to production only after preview checks, review and explicit release decision.
