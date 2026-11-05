# Tooled Up programme currency evidence

Awin's product-feed hosting documentation states: when an Awin-standard feed's `currency` field is blank, the feed price uses the advertiser programme currency. Tooled Up master feed 496:89987 was inspected on 2026-11-05 and its exact 29-column schema omits `currency` entirely.

This feature uses the configured **Publisher API** `AWIN_ACCESS_TOKEN` (not the product feed key) to make a read-only Bearer-authenticated request to `https://api.awin.com/publishers/{publisherId}/programmes?relationship=joined`, then selects a uniquely matching advertiser ID 496, reads `currencyCode`, and returns whether it equals GBP.

Manual secret endpoint: `POST /api/internal/awin-tooled-up-currency`. No token, product rows or unrelated programme details are returned; no database writes. A successful response is *independent programme-currency evidence* but **not** a blanket image license, publication permission, validated full feed, or importer activation.

Documentation: https://help.awin.com/apidocs/get-program-information and https://help.awin.com/developers/docs/hosting-feeds.

The existing Tooled Up adapter remains gated on a trusted reviewed `TooledUpCurrencyEvidence` object. This read-only endpoint does not itself approve staging or furnish an untrusted self-approval bypass. A future worker must independently verify currency from the server-side API, bind evidence to the snapshot/run, and enforce image-rights=false and private-only staging.
