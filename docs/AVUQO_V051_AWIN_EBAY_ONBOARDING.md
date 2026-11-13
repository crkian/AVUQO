# AVUQO v0.5.1 · Awin Retailers + eBay UK Onboarding

**13 November 2026 · Release candidate, not automatically live**

## Why

The current warm-premium storefront already has 25 all-category product showrooms and strict public product/offer evidence gates, but few real data relationships are publication-ready. This milestone reuses the existing real Awin private ingestion and the already-built owner-only eBay UK pilot. It does not create a competing importer or treat keysets as rights grants.

## What was present on main

- Awin private feed monitor, owner feed imports and review flows, source membership observer, `/api/internal/awin-auto-import` (Petlibro and Mozillion private physical feed pilots), and source-level publication / image-rights gates.
- Owner eBay preview `/preview/ebay`, UK Browse normalization, image inspection opt-in, 24-item cap and no offer creation or checkout.
- `sources` records for Awin and eBay both paused, synchronisation disabled. The eBay source has no confirmed credentials and no rights approval.
- 16 historically observed Awin joined-programme IDs, 12 private import runs across seven merchants, 122,309 staged rows (119,614 in private review and 2,695 excluded), and **no rights-verified public retailer offer**. These numbers were read 13 November and change over time. Joined status is a historical observation, not a current feed-use licence.
- Production Vercel had no `EBAY_*` environment variables as of the audit. Existing `AWIN_*` credentials/flags are present in some environments but existence does not prove they are valid or authorised.
- Tooled-Up updated its old product feeds. Its 11 November email says the old feeds were deleted and new, daily refreshed `awinnew` feed IDs should be used. Historical private Tooled-Up records must not be presented as current offers.
- mytyres.co.uk Awin application was rejected 11 November. The other Tyres UK/Pneus and individual partner agreements need separate validation.

## Code completed

1. **Retain and correct the eBay private pilot**. Its previous server-only OAuth function always called Production `api.ebay.com`, even if the owner created a Sandbox keyset. Now it defaults fail-closed to **Sandbox**, uses both OAuth and Browse endpoints on the same environment and does not send EPN campaign IDs to Sandbox. Existing read-only, no-checkout, image-hidden, role-protected UX is preserved.
2. **Credential setup remains server-only**. Sandbox keys: `EBAY_SANDBOX_CLIENT_ID` (eBay App ID) and `EBAY_SANDBOX_CLIENT_SECRET` (eBay Cert ID). Add them as encrypted/sensitive environment variables for the Vercel deployment environment where the private pilot is tested, not in a chat, Git repository, public form or `NEXT_PUBLIC_*` variable. The Dev ID is not used by client-credentials Browse.
3. **Production cannot accidentally be activated by creating keys**. Requires `EBAY_BROWSE_ENVIRONMENT=production`, separate Production `EBAY_CLIENT_ID` and `EBAY_CLIENT_SECRET`, and `EBAY_BROWSE_PRODUCTION_APPROVED=true` only after eBay has explicitly granted restricted Browse API production access. Default/unknown environment is Sandbox. Even then, this remains a private preview and no source activation or public publishing occurs. An EPN campaign ID is separate, optional for private searches and needed for compliant affiliate linking.
4. **`/control-centre/retailers`**: owner/admin read-only onboarding board with the actual 16 historical Awin membership observations, most recent local private-import counts and dates, Awin feed monitor observations, explicit advertiser-level rights flags, and eBay keyset / approval status. Prioritises Petlibro, Mozillion, Cadbury Gifts, Craft Buddy and refreshed Tooled-Up rather than tyres first.
5. **No public release**: the real shopping pages `/products` and the 25 category showrooms remain governed by the existing source, rights, freshness, matching and approved offer gate.
6. **Regression tests** confirm Sandbox/Production isolation, no auto-permission, safe eBay affiliate URL detection, role-protected control panels and zero write operations. Existing eBay owner preview tests run as well.

## Owner process on eBay keyset page

1. Enter **AVUQO Product Comparison** for the Application Title (1–50 characters).
2. Select **Sandbox**, create the keyset, and keep the App ID and Cert ID somewhere private. Production requires a *separate* keyset.
3. Add **only** Sandbox App ID and Cert ID to Vercel as `EBAY_SANDBOX_CLIENT_ID` and `EBAY_SANDBOX_CLIENT_SECRET` (for the deployment environment in use). Redeploy so the application sees newly added environment variables.
4. Open `https://www.avuqo.com/preview/ebay` after signing in with AVUQO owner/admin access. Search a sandbox test product; these are not real live listings.
5. Request eBay Buy API Production access through EPN and eBay Developer Support. The official requirements and application are at `https://developer.ebay.com/api-docs/buy/buy-requirements.html`. A Production keyset alone is not approval.
6. Only once eBay confirms restricted Browse API production access, record the approval evidence and enable the production private pilot with approved variables. Public offer ingest, verified tracking and image rights are a separate subsequent milestone.

## Priority Awin review

- **Petlibro UK / 77952**: small physical-product private pilot. Evaluate current joined-programme terms, GB/UK feed licence, original source price/availability freshness, image rights and tracking before publication.
- **Mozillion / 31539**: separately confirm SIM-free physical phone feed, not phone contracts, refurbished condition and product-variant identification.
- **Cadbury Gifts Direct / 736**: consider seasonal categories, per-item stock, product images, delivery and expiry; original feed runs are private evidence only.
- **Craft Buddy / 45747**: craft/home/gift editorial match; validate current feed data and rights.
- **Tooled-Up / 496**: migrate **away from deleted old feeds** to current `awinnew` feeds, compare identifiers and freshness, no stale feed publication.
- **Tyres UK / 12715, Pneus / 15236**: keep the specialist tyre load/speed/fitment/installed-quote gates separate from this first multi-category release.
- **Lyca Mobile / 128157**: a welcome email was received, but contract/utility comparison requires whole-term pricing, eligibility, advertising disclosures and current programme terms, not a generic physical product card.
- **mytyres.co.uk / 4118** is rejected and must not be treated as approved.
- All other joined or invited programmes require fresh source-specific checking.

## Deliberate non-features

No eBay transaction checkout, automatic product imports, nightly eBay harvest, public seller images, fake ratings, copied affiliate URLs, source activation, paid advertising, permissions migration or social publication. Sandbox search returns test data, never a live offer. No automatic Awin publication from historical membership alone. Secrets must not be stored in database records, JSX, tests, docs or public channels.

## Release acceptance

- [ ] New and existing eBay/Awin source tests, lint and production-style Next build pass.
- [ ] GitHub secret scan passes on exact branch head.
- [ ] Vercel preview reports READY.
- [ ] Signed-out `/control-centre/retailers` and `/preview/ebay` redirect to login without exposing inventory or credential state.
- [ ] Merge then verify `www.avuqo.com` public pages are unaffected and owner pages remain protected.
- [ ] Manual Sandbox OAuth and Browse call **requires owner to create keyset and configure two Vercel secrets**. Cannot claim this step completed before keys exist.

Keep the root `AGENTS.md`, design screenshot index, Project Compass and product source-rights policy as the continuing canonical references.
