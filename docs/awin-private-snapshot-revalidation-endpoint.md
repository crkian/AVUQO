# Manual private snapshot validation endpoint

`POST /api/internal/awin-snapshot-validate`, authenticated using the existing `CRON_SECRET` bearer token.

Input: `{"snapshot_sha256":"<64 lowercase hex characters>"}`. The server derives the exact Tooled Up master feed key `awin/496/89987/<sha256>.csv.gz` in the non-public `awin-bulk-private-snapshots` bucket. The caller cannot select another advertiser, feed, object path or storage URL.

The route checks joined membership and the source's paused/sync-disabled state, then requests a **short-lived private read URL** for the existing object. It checks the Supabase origin and object path, redirects disabled, and passes the Storage response stream through the bounded gzip validator. It verifies the entire compressed SHA-256 matches the supplied object key, checks source state again and inserts only aggregate diagnostics into `awin_private_snapshot_validations`.

The table is private, RLS-protected and append-only. Repeated validation for the same digest reports `already_validated`; concurrent insert collisions resolve as already validated. At no point does this route fetch from Awin, upload a snapshot, store products, create an import run/job, enable automatic imports or publish offers.

**This endpoint is not yet ready to process an actual Tooled Up snapshot because no uploader is configured and the bucket is currently empty.** It must be exercised with an isolated synthetic object and assessed for runtime, memory, cancellation, signed URL expiry and multi-worker contention before processing the 84,245-row feed. The snapshot download/upload worker and complete runtime testing are separate milestones.

The existing validator reports `currency_verified=false`, `rights_verified=false` and `ready_to_stage=false` by design. It does not resolve Awin pricing rights or image permissions.
