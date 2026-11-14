# Awin feed metadata monitor: ambiguous inventory integrity
Date: 14 November 2026. Status: candidate pending CI, merge and production verification.

## Current verified production baseline
- Main `d104e3cf0bb5ab0ce51260c48220afeccfc2f595`, Vercel `dpl_4DA84MV1yqa96Mqfpzm3udag4uMh`, production READY.
- Connected Supabase source `connector_key='awin'` remained `paused` with `sync_enabled=false`. This change performs no production source writes.
- Existing `/api/internal/awin-feed-check` cron at 06:17 UTC is CRON_SECRET-authenticated and metadata-only. Never download merchant product feeds, store signed inventory URLs or grant offer/image rights as part of this monitor.
- Existing PR #176 private retry recovery is already deployed. Do not modify its import-run/session tables or replace the Pneus cron.

## Problem and fix
The inventory auditor previously silently kept the first record for duplicate `advertiser_id:feed_id`, even when the subsequent active row reported different product count, format, timestamp, name or language. It also converted missing/invalid counts to zero, falsely making malformed data appear like an empty feed. Duplicated header names could silently select the wrong column.

The auditor now:
1. Rejects empty or duplicate CSV column names before parsing feed identities.
2. Requires an explicit nonnegative, decimal, safe-integer product count, accepting valid zero only.
3. Deduplicates genuinely identical safe feed metadata even if signed URL values differ.
4. Marks conflicting duplicates invalid instead of silently updating source metadata with an arbitrary record.
5. Continues to exclude unobserved merchants and never return signed URLs.

The existing monitor responds 422 when `invalidRows>0` and will not call `record_awin_feed_discovery`. A thrown ambiguous-header error is treated as invalid inventory, with the existing alternate provider endpoint attempt and a safe redacted 502 if both fail. No changes to automatic feed downloads, supplier rights, import flags, source status or public product publication.

## Release gates
Run existing `tests/awin-feed-list-audit.test.mjs` and `tests/awin-automatic-feed-monitor.test.mjs`, full GitHub quality build/lint, secret scanning and Vercel preview. Merge a small PR only after green, verify exact production SHA/aliases, public homepage 200, monitor unauthorized 401 and no cacheable response, and live Awin source still paused. Do not trigger the authenticated live monitor or manufacturer import.
