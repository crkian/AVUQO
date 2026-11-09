# Tyres Pneus Online UK: server-side private onboarding

**AVUQO source:** Awin advertiser 15236, feed 26513, Tyres Pneus Online UK.
**Status on 9 November 2026:** Joined programme observed, latest feed list reported 19,591 products. Feed-use permission in AVUQO source register is **not confirmed** and no private import exists. The Awin source is paused.

## Workflow

- Daily Vercel Cron at 08:41 UTC calls the secret-protected internal worker. The worker is disabled unless AWIN_PNEUS_PRIVATE_IMPORT_ENABLED equals true. It never accepts a browser-provided Awin credential or returns raw feed rows.
- Before any product download or database write, check that Awin remains paused and sync_enabled=false, programme 15236 is joined, feed_permission_confirmed is true, a real approval_evidence_ref exists and any valid_until date is not expired. These conditions are required for private staging, NOT permission to publish. Do not fabricate approval evidence just to run the worker.
- Retrieve only the exact active 15236:26513 standard Awin CSV from official Awin inventory, checking download URL against the configured server-side feed key. Redirects and user-provided hosts are forbidden. Cap compressed transfer at 36 MiB, uncompressed content at 180 MiB and 100,000 source rows.
- Validate UTF-8, headers, advertiser/product identity, row structure and globally unique product IDs before writing any private records. Unsupported source schemas fail closed.
- Archive the immutable compressed feed in the existing private Supabase Storage bucket awin-bulk-private-snapshots, at a content-addressed Pneus Online path. The SHA-256 hash covers decompressed source bytes.
- Use existing feed_import_runs, large_feed_import_sessions, awin_bulk_import_jobs and protected 250-record transaction RPCs. Every chunk is resumable under an expiring lease. Historical Tyres UK records are not changed.
- Every new row stays in private review or exclusion with publication permission and image rights unverified. This workflow cannot publish, verify vehicle fitment, create a customer offer, or activate the Awin source.

## Mobile Control Centre

The owner-only page /control-centre/tyre-supplier-onboarding shows live source and feed status, approval blockers, worker flag, committed private row count and next review. No file upload is required.

## Release and audit gates

1. Confirm actual affiliate programme/feed archival and private processing permission, and record the underlying evidence and expiry in the source register. A joined Awin programme or listed feed alone is not licence to publish data or imagery.
2. With approval, verify the current source schema and data quality. If Awin's general CSV dialect is unsuitable, add a dedicated retailer parser rather than guessing fields.
3. Verify secure private bucket, owner attribution, live credential binding, lease constraints, a sample of accurate products, stock/fitting terminology and required field coverage.
4. Only then explicitly enable the worker. Staged products still require separate product/offer and merchant rights approvals before publication.
5. Compare samples with Tyres UK using the exact variant comparison contract, resolving load/speed, XL, run-flat, season and OE markings. The 28,990 Tyres UK review rows still have no saved load/speed candidates and cannot establish exact public matching today.
6. Verify complete current delivered/fitted costs, seller identity, stock/availability and quote location before showing any cheapest badges.

## Known limits

- The implementation has **not** downloaded Pneus Online products; the rights/enablement gates remain closed. Preview build success is not acceptance of the real source schema.
- General private Awin CSV parsing may need a merchant-specific adapter. It cannot assume tyre/fitment or fitted-price semantics.
- An interruption during run/session/job creation may create an incomplete private run needing owner cleanup. A completed snapshot is content-addressed to prevent duplicate import.
- A source snapshot retention and deletion policy needs final approval.
- This PR neither changes production source permissions nor creates public tyre offers, affiliate clicks, or database migrations.
