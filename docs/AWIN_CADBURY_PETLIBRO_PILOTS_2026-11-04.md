# First Awin advertiser pilots: Cadbury and Petlibro

**Recorded 4 November 2026.** This is an evidence-led onboarding register, not permission to publish.

| Advertiser | Awin ID from private import | Private feed rows | Review | Explicit programme approval | Publication |
|---|---|---:|---|---|---|
| Cadbury Gifts Direct | `736` | 1,371 | All 1,371 pending | **Unverified** | **Disabled** |
| Petlibro UK Affiliate Program | `77952` | 98 (49 review, 49 excluded) | 49 pending, 49 excluded | **Unverified** | **Disabled** |

Both programme IDs originated in the historical private Awin feed import runs of 28 October. **New 4 November owner screenshots:** both programme names were visible in Awin's **Your Advertisers → Active** directory, each with **Product Feed = Yes** and green **Link Status**. These are useful programme-membership/feed-listing observations, but the screenshots did **not** display numeric advertiser IDs or the contractual feed/image/price republication terms; retain ID confirmation and rights checks. The directory does not itself authorise publishing.

## Recorded private state
- Both programmes were added to `sources.metadata.awin_advertisers` as paused drafts, with `feed_permission_confirmed=false`, empty approval references and expiry dates, `import_advertiser_id_unverified=true`. The source remains `status=paused`, `sync_enabled=false`, `credential_status=not_configured`, and publication/price evidence remains pending.
- No new import, offer, rights attestation, programme connection, customer listing, image permission or Score approval was created.
- v0.3.0 owner onboarding code deployed to production in PR #44; SQL terminator fix PR #45 merged at `18752f41287f30f82ba679c170e61b685520765e`, production Vercel READY. `20261104112500_awin_offer_owner_release.sql` applied in Supabase after the verified deployment. The two privileged release/audit tables are empty, have RLS enabled and no anon/auth SELECT or INSERT grants; only the service role can call the release function.
- **Existing Awin connector limitation:** it accepts a *single* `AWIN_ADVERTISER_ID` Vercel variable. Both advertisers can be registered now, but API/feed tests and owner release are scoped to one configured advertiser at a time. Do **not** imply simultaneous multi-advertiser ingestion or swap IDs without fresh authorisation and redeployment.

## Per-advertiser acceptance still required
1. Confirm Cadbury (`736`) and Petlibro (`77952`) are the correct programmes in the publisher's Awin account, with membership **approved and active** (not merely discoverable).
2. Verify each programme's feed availability, GB price/link rights, image rights (separate), source usage restrictions, evidence reference and expiration. Do not invent rights or treat a token as licence.
3. Configure the chosen active advertiser's `AWIN_ADVERTISER_ID` in **Vercel Production only**, then redeploy; the server already requires `AWIN_PUBLISHER_ID` and private `AWIN_ACCESS_TOKEN`.
4. From Control Centre Awin Advertisers, enter real evidence, run an owner-initiated **read-only** API test with that matching programme, then activate that source only when all gates pass.
5. Import a small batch to held/private status; review fresh product identity, stock, GBP totals, links, scoring and image permissions. Individually approve one held eligible offer, verify its public page and retailer redirect, and test pause/rollback.
6. For the other advertiser repeat under its own approval and environment configuration. A future per-advertiser connector refactor is required before parallel active use.

**Privacy:** Never paste Awin OAuth secrets, screenshots of unmasked tokens, or private permission documents into GitHub. The recorded `allowed_territory=GB` is a requested scope, **not a verified territorial licence**.

## Verification points
- Supabase Awin source `paused` / sync `false`; private imported records for these two programmes: **1,469**; Awin live sync runs **0** and public Awin offers **0** at registration.
- Reviewer grants `anon=false`, `authenticated=false`, service insert `true`; release-function execute `anon=false`, `authenticated=false`, service `true`.
- Owner/browser and actual Awin-provider acceptance remains open. No licence or public offer is asserted by this register.
