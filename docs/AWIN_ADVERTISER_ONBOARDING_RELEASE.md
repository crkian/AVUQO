# Awin advertiser onboarding and owner-approved publication

**Current pilot register:** [Cadbury and Petlibro, 4 November 2026](./AWIN_CADBURY_PETLIBRO_PILOTS_2026-11-04.md). Both are private, paused, unapproved, with no public offers. The owner release SQL migration is applied after PR #45, and the release tables remain empty. The connector currently supports one configured advertiser ID at a time.

**4 November 2026 original baseline:** The Awin source is paused and not credential-ready in Supabase. Historical Awin uploads contain 4,588 private, unverified rows across five uploads. A Vercel API token and publisher ID do **not** prove permission to publish any merchant. The advertiser environment variable was not present at the previous check.

## Owner procedure

1. In **Control Centre → Awin advertiser release** (`/control-centre/awin-advertisers`), register the programme's numeric **Advertiser ID** and official name. This creates a paused draft. Never type the OAuth token into AVUQO.
2. Confirm in Awin that AVUQO is accepted to that precise advertiser programme and has explicit authority to use UK feed, price, affiliate link and, separately, image data. Record evidence references and expiry dates in the owner-only form. This is owner attestation, not automated proof from Awin.
3. Configure `AWIN_PUBLISHER_ID`, `AWIN_ACCESS_TOKEN`, `AWIN_ADVERTISER_ID` as server-only Vercel Production secrets and redeploy. The configured Advertiser ID must match the registered and approved programme.
4. Run the owner **read-only API test**. It fetches at most three feed items, checks merchant identity, saves no data and leaves the source paused. Connectivity is not permission to publish.
5. Explicitly **activate** the rights-ready source, then run the Awin pipeline with the existing private pipeline action (up to 50 offers). Mixed advertiser IDs are rejected. **All Awin offers are held even with global deal publishing enabled.**
6. Review the resulting products, offer identity, GBP pricing, delivery, stock, valid HTTPS affiliate destination, independence of AVUQO Score and freshness. Record a checked live sample and evidence reference. The sample must have a recent successful Awin run and eligible Score.
7. Explicitly approve a single held offer via the owner's **Approve public release** action. The server rechecks rights, source, controls, merchant identity, current price, current Score and available stock; an atomic, service-only database function records the per-offer approval, publishes the staged row and appends an audit event.
8. Confirm public search/product display and `/go/<offerId>` merchant redirect with a licensed pilot. Pause an individual offer or the whole source at once if the price/rights change. Re-syncs return Awin offers to held pending fresh review.

## Deployment / verification

- Review CI and merge code first; confirm Vercel production READY at the exact commit.
- Only then apply `20261104112500_awin_offer_owner_release.sql`. This adds private owner release and audit tables plus a transaction-scoped release function. It neither creates nor publishes an advertiser.
- Re-query RLS and effective grants: no anonymous or normal authenticated access to the two release tables or privileged function.
- Confirm existing Awin source remains paused, existing staging rows untouched, zero new feed or public Awin rows.
- Test owner, admin, normal and anonymous role behaviour. Directly setting `published_deals.status=published` must **not** bypass per-offer public admission.
- Test invalid merchant ID, expired evidence, bad/missing rights, stale/GBP-invalid price, changed price after approval, unavailable stock, no HTTPS affiliate link, bad match, low Score, provider failures, global stop and source pause.
- When an **actually approved advertiser** is available, run read-only provider connectivity, a small private import, a manual single-offer publication, public visibility and owner pause/rollback. Test desktop/mobile and consumer disclosures.
- If provider rights change or a refresh changes offer/Score, the published item must cease to qualify without re-review. No commission affects the AVUQO Score.

## Unfinished external requirements

No advertiser ID, publisher acceptance, merchant-specific feed licence, image licence, live provider sample, real customer smoke test or earned commission was independently established by this code release. Do not treat historic private uploads or a configured API key as authorisation.
