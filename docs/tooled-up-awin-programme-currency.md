# Tooled-Up Awin programme currency verification · 13 November 2026

## Purpose and scope
Legacy PR #102 defined a **read-only** check of advertiser **Tooled-Up / Tooled Up, Awin ID 496** against Awin's joined-programmes API. This is a selective port onto current `main`, not a wholesale merge of the November 5 branch.

Awin currently documents `GET /publishers/{publisherId}/programmes?relationship=joined`, with `currencyCode` representing the **advertiser programme currency**. It also documents that a blank standard product-feed `currency` field defaults to the programme's currency. Official references:
- https://help.awin.com/apidocs/get-program-information (checked 13 November 2026)
- https://help.awin.com/developers/docs/hosting-feeds (checked 13 November 2026)

The historical PR referred to master feed **496:89987** and a feed schema lacking `currency` as of 5 November. **That old feed is not currently independently verified as still existing or approved**: previous feed lists indicated Tooled-Up replaced/deleted older feed identifiers. The API check in this release is therefore **programme-only** and deliberately does not present a hard-coded feed ID as active.

## Technical implementation
- `lib/awin/tooled-up-programme-currency.ts`: server-side read-only Awin Publisher API GET, filters `relationship=joined`, finds exactly one numeric ID 496, reads validated uppercase ISO-like three-letter `currencyCode`, and marks `currency_verified=true` **only when it equals GBP**.
- `POST /api/internal/awin-tooled-up-currency`: bearer-authenticated with existing long `CRON_SECRET`; requires source metadata to show historic joined membership, Awin source **paused**, synchronisation **off**, and server-side publisher ID/API token. It never writes database rows or changes source controls. Success/failure responses exclude access tokens, raw provider responses and unrelated programme details.
- Bounds: 15-second API timeout; 2 MB streaming response limit, no redirects, `no-store`; fail-closed on missing/duplicate/invalid advertiser currency.
- The result explicitly states `feed_identity_verified=false`, `feed_data_currency_verified=false`, `image_rights_verified=false`, `ready_to_stage=false`, `public_offer_approved=false`, `private_only=true` and `no_database_writes=true`.

## Critical distinction
A positive programme-currency response **does not establish** that product prices in an arbitrary historical feed are GBP, that old feed ID 89987 still exists, that the account may republish product images, that seller delivery cost or final payable total is verified, or that affiliate offers may go live. Neither owner approval flags nor Awin source activation are updated. The diagnostic does **not automatically run** merely because code is deployed. Live Awin credentials/response have not been exercised as part of the code-only release.

## Follow-up before public Tooled-Up products
1. Revalidate membership and obtain the **current Awin feed list** including new `awinnew` identifiers; never reuse old deleted 496:89987 by assumption.
2. Under explicit owner/private inspection, obtain programme-currency GBP evidence and independently inspect the current feed's price/currency schema. Reject anything inconsistent or ambiguous.
3. Confirm permitted UK price, product-data and image use, retention/resizing and current links; record written rights evidence per advertiser.
4. Review freshness, shipping charges, GTIN/variants, availability, commission-independent ordering, and verify private staging.
5. Only then consider merchant-specific release through existing owner controls; no blanket auto-approval.

## Historical PR disposition
PR #102 may be closed only after CI/secret scan, merge onto modern main, Vercel production READY with exact merged SHA and documented preservation of these gates. Existing tyre, Awin import, eBay Sandbox, seasonal and customer functionality must remain unchanged.
