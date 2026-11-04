# Universal connector next pilot: Awin multi-advertiser feeds and eBay Browse API

**Review:** 4 November 2026. **Status:** private intake candidate and second-source research, not a live/evidenced integration.

## Primary requirements from uploaded AVUQO source materials

- `AVUQO_Master_Product_Build_Specification.pdf`, §8 (pp. 15–16): use a **Universal Source Connector** to normalise Product, Offer, Merchant, Availability, Source, Affiliate, Price and Confidence. Priority sources include **Awin, eBay, CJ Affiliate, impact.com, Tradedoubler, Webgains, Amazon where appropriate, Booking.com, Skyscanner, Expedia, travel networks and direct retailer/provider feeds/APIs**. Registry requires credentials/status, territory, currency, categories, feed/API type, refresh, freshness, errors, reliability, affiliate status, rate limits, retries/pauses, mapping version. Product matching must avoid false merges.
- Same specification §9: Autopilot fetches, validates, normalises, matches, monitors and pauses; publishing remains subject to source, integrity and owner controls.
- `AVUQO_MASTER_SOURCE_OF_TRUTH_2026-10-28.md`, requirements 51–55 and 62–65: preserve licences, explicit evidence, authentic observations and price-history timestamps, and independent AVUQO Score. No unauthorised scraping.
- `AVUQO_v0.8_Control_Centre_Content_Backend_Plan.md`: extend existing Control Centre; merchant membership and feed/data permission are **different**.
- `# AVUQO Intelligent Affiliate Marke.txt`: authorisation, offer verification, compliant creative and owner publishing limits are prerequisites, not automatic consequences of feed access.

## Track A: joined Awin advertiser CSV intake

The source registry contains 16 observed joined advertisers. This branch adds **explicit selection of the advertiser ID** for an owner-uploaded Awin CSV, comparing it to **the current joined status in `sources.metadata.awin_advertisers`** and rejecting any row with a different merchant ID. No guessed ID from a filename. Any accepted rows remain **private, `permission_status=unverified`**, subject to the existing 8 MB, 2,500-row and validation limits. Craft Buddy's specific Google-format pilot is preserved; other enhanced Awin feed formats require separate parsers after inspecting their schemas. This branch does not fetch from Awin automatically.

### Official Awin feed options verified externally

- **Product Feed List Download** provides accessible feed IDs, joined status, last imported time and download locations; it needs the **datafeed-specific API key**, not the Partner API token used for joined-programme checks. See https://help.awin.com/developers/docs/product-feed-list-download
- Awin supports normal downloadable CSV feeds and **Google enhanced retail feeds**, potentially via the Publisher Product API. Availability and mapped columns differ by advertiser. See https://help.awin.com/developers/docs/product-feed-publisher-guide-intro and https://success.awin.com/articles/en_US/Knowledge/Product-Data-Feed-FAQ
- A listed feed is not proof of a current licence to republish or retain every product image. Per-advertiser terms, pricing, image/brand-use scope, territory and campaign wording must be checked before public release.

**Next acceptance:** owner obtains feed-list API key securely in the Awin interface, confirms access without sharing key in chat, observes which of the 16 have real usable feeds, and checks individual terms. Build a read-only, credential-server-side feed-list inspector with redacted download URLs; schedule no jobs until isolation, retries and kill switches pass tests.

## Track B: different integration type, eBay Buy Browse API

**Why eBay first:** The original master specification explicitly lists eBay as a priority source, and the **Browse API** uses authenticated **search/item JSON endpoints** instead of an advertiser CSV download. It can return item summary, attributes and item detail, allowing a meaningful test of the standard Product/Offer/Availability objects. Official docs: https://developer.ebay.com/api-docs/buy/api-browse.html

Official eBay documentation says:
- `GET /item_summary/search` and `GET /item/{item_id}` are supported; application OAuth client-credentials token is required.
- EPN affiliate `itemAffiliateWebUrl` requires an eligible eBay Partner Network relationship and an `X-EBAY-C-ENDUSERCTX` header with `affiliateCampaignId`. Do **not** fabricate a campaign ID, assume commission eligibility or substitute generic untracked links.
- EPN's developer questionnaire says Browse API does not require extra restricted-API approval, but use-case, policy, application keys, API terms and EPN eligibility still require verification. See https://partnernetwork.ebay.co.uk/page/developer-questionnaire and https://developer.ebay.com/develop/get-started/get-started-on-a-buying-application

**Pilot design, not yet connected:**
1. Create a disabled and independently permission-gated eBay connector entry with GB marketplace, GBP and read-only `search` + `getItem` methods.
2. Keep credentials on server; limit rate, page size, bounded errors and one-merchant/marketplace scope. Do not search without real API keys.
3. Normalise listing ID, condition, seller, item price, delivery cost, shipping locale, image rights, current availability, GTIN/model/variant and observed timestamp.
4. Reject ambiguous variants and price mismatches. Do not compare total costs until the mandatory shipping/fitting inputs are present.
5. Stage 10–20 genuine test items privately, check official display/retention terms and seller/brand rules, then review one eligible public offer under the same release gate as Awin.

**Other options:** direct retailer APIs/feeds may be better for a particular category where licensed data and service details exist; grocery feeds require separate explicit pricing rights. Booking.com, Skyscanner and Expedia entail date/availability/total-price models, so should follow a stable physical-product connector.

## Status and safeguards

- Awin's source row remains **paused** and `sync_enabled=false`; there is no automatic multi-advertiser downloader in this change.
- The current 16 are **joined**, not publication-approved. Tyres UK `12715` and Tyres Pneus Online UK `15236` have **no verified staged product imports**. Need model fitment, speed/load ratings and total fitting/transport prices.
- No product image, feed, price, affiliate link, recurring sync, public `offers` or `published_deals` is approved by importing privately.
- Before scaling, implement separate per-advertiser run cursors, pause, rights and expiry, link validation, freshness and contract-aware public release.
