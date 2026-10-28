# AVUQO v0.8: Private Awin Product Import Centre

## Purpose
Provides an owner/admin-only web uploader for AKKO UK CSV or CSV.gz feeds. It validates records and stores a private staging snapshot in Supabase. It does **not** publish products, activate affiliate links, use merchant images or modify scoring. Merchant partnership and data licensing have **not been verified**.

## Installation
1. Back up current AVUQO source and Supabase database.
2. Copy `lib/feed-imports/parse.ts`, `app/api/control-centre/feed-imports/route.ts`, and `app/control-centre/feed-imports/*` into the same paths in your current project.
3. Apply `supabase/migrations/20261028000000_feed_import_staging.sql` **once** in a non-production Supabase environment. Confirm existing `public.user_roles` and roles `owner`/`admin`. This schema does not alter any existing tables.
4. Start dev server and open `/control-centre/feed-imports` as an owner/admin. Add a navigation link to this route after verifying the new module.
5. Upload the AKKO CSV or .csv.gz file (8MB compressed limit, 30MB uncompressed and 2500 rows maximum). The pilot only accepts Awin merchant ID `69178` (AKKO UK). File bytes are processed in memory and not retained.
6. Verify the counts: expected 910 total, 811 review, 99 excluded for the 28 October 2026 sample. Confirm import records aren't accessible when signed out or with a non-admin user.
7. Run `npm run build` and confirm `/control-centre/feed-imports` loads. The prior `cacheComponents` fixes should remain untouched.

## Constraints
- Do not paste feed API URLs or Awin access tokens into source code or browser-facing pages.
- There are **no public offers or affiliate links** created by this module; status is permanently `private_review` and permission status `unverified`.
- The records intentionally store only selected metadata, not source deep links or merchant image URLs.
- Server and DB enforce ownership. Public permissions must be re-audited before enabling merchant data outside the Control Centre.
- This is an early staging implementation, not a full sync engine. There is no automatic feed refresh, de-duplication against your canonical products, manual approval workflow, historical observations, or row-pagination beyond the first 100.
- This patch is based on the older uploaded v0.7 source structure, not a copy of your current working directory. Merge without overwriting other v0.8 changes.

## Build status
This patch has not been compiled against the user's current Windows checkout. Apply in preview/test first. Rollback: remove the new route/page/library files. Retain staging tables for audit or remove them separately after exporting anything needed.
