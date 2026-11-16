## 16 November 2026 · Public eBay UK affiliate discovery, implementation candidate

**Customer-facing change:** `/partners/ebay-uk` and homepage partner shelf. Six fixed UK categories plus a general eBay UK link use the documented EPN tracking parameters `mkevt=1`, `mkcid=1`, UK rotation `710-53481-19255-0`, existing active AVUQO campaign `5339240499` and `toolid=10001`. Every link is labelled, externally hosted by ebay.co.uk, opens a new tab with sponsored disclosure and **does not claim any AVUQO-verified listing prices, stock, images, discounts, score, comparisons or checkout**.

**Evidence:** The connected Gmail EPN digest dated 5 Nov 2026 says eBay Partner Network accepted proposed contract terms. Owner's EPN screenshot independently recorded the active default campaign. This supports ordinary EPN outbound linking, but **is not** approval of eBay restricted production Buy/Browse/Feed APIs. Vercel production has `EBAY_SANDBOX_CLIENT_ID` / `EBAY_SANDBOX_CLIENT_SECRET`, but no `EBAY_CLIENT_ID`, `EBAY_CLIENT_SECRET` or `EBAY_BROWSE_PRODUCTION_APPROVED`. eBay source remains paused, and the six existing Supabase offers are all October demo rows. No legitimate eBay item-priced offers are live.

**API rule:** eBay requires production Buy API growth check and approvals (https://developer.ebay.com/api-docs/buy/buy-requirements.html). Search-category affiliate links can be constructed under the official EPN UK specification (https://developer.ebay.com/api-docs/buy/static/ref-epn-link.html) and the EPN Link Generator documents category and search links (https://partnernetwork.ebay.com/resources/create-your-affiliate-link). Only fixed allowlisted destination paths are constructed, no user-controlled open redirect.

**Awin remains separate:** 251 draft Awin product identities, zero public retailer offers, paused source and pending merchant price/image rights. Existing four pilot imports and Tooled Up private capture/validate need actual current preflight, price and publish/withdrawal gating. Do not count EPN search links as eBay product offers, and never represent them as Awin feed publication.

**Release gates:** Test exact EPN parameters, strict search list and false-price disclosure; GitHub CI and Vercel preview, merge exact SHA and verify signed-out homepage + new page READY. Do not automatically click tracked EPN links to test them. Record production confirmation in Git without extra application build.


# AVUQO eBay Partner Network UK integration

## Evidence and identity

User-supplied screenshot dated 2026-11-05 shows eBay Partner Network -> My campaigns, account AVUQO, **active** campaign named `default` with ID **5339240499**. This is an affiliate campaign, not an eBay API application nor Feed API authorisation.

The existing `sources.connector_key='ebay'` stays `paused` and `sync_enabled=false`. There are currently no configured `EBAY_CLIENT_ID` or `EBAY_CLIENT_SECRET` Vercel environment variables. Never use the Awin tokens for eBay.

## Required credentials and exact owner setup

1. Open **https://developer.ebay.com/** and sign in to the eBay Developer Program (EDP), which is separate from EPN.
2. Go to **Your Account -> Application Keys**, select the **Production** keys. Identify the **App ID (Client ID)** and **Cert ID (Client Secret)**. Never paste keys into chat or commit them to GitHub.
3. In Vercel -> AVUQO -> Project Settings -> Environment Variables, add **`EBAY_CLIENT_ID`** and **`EBAY_CLIENT_SECRET`**, target **Production**, secure as sensitive/secret. Redeploy production after saving.
4. The campaign ID **5339240499** is already allowlisted in the server code. The private diagnostic sends `affiliateCampaignId=5339240499` in the official Browse `X-EBAY-C-ENDUSERCTX` header with `X-EBAY-C-MARKETPLACE-ID: EBAY_GB`.
5. Test the protected route with your existing `CRON_SECRET` as a bearer header: `POST https://www.avuqo.com/api/internal/ebay-browse-preflight`, JSON `{"q":"wireless headphones"}`. This returns **counts only**, never item values, live tokens or links. Expected status is `private_ebay_browse_diagnostic`; zero valid tracked GBP items requires follow-up.
6. For public launch, add an owner-reviewed terms and traffic-policy record, confirm applicable eBay programme terms, implement offer staging, fresh-price/availability rechecks, safe image/display conditions and scoring. Do not activate public source simply because EPN campaign is active.

### Bulk eBay feeds are separately gated

The eBay Partner Network data feeds are **restricted to eligible publishers** who also have an EDP account. Request data-feed access via **https://partnernetwork.ebay.com/page/developer-questionnaire** and specify the UK marketplace, requested feed type and comparison use case. Do not claim mass-feed access based on the screenshot.

Browse API and EPN tracking documentation:
- https://developer.ebay.com/api-docs/buy/static/api-browse.html
- https://developer.ebay.com/api-docs/static/oauth-credentials.html
- https://partnernetwork.ebay.com/solutions/scale-listings-on-your-site-with-data-feeds
- https://developer.ebay.com/api-docs/buy/static/ref-epn-link.html

## Security

The bounded private diagnostic authenticates `CRON_SECRET`, requires paused eBay source, uses OAuth client-credentials grant and a UK-only Browse request for up to 20 fixed-price items. Every accepted item must have GBP positive price and an eBay-hosted affiliate URL bearing the exact EPN campaign ID. It returns aggregate diagnostics only. No product inserts, schedules, partner feeds, source activation or public release are in this PR.

A complete eBay live-offer importer and automatic refresh architecture requires API credentials, Browse integration testing and separately granted bulk-feed access where relevant. It cannot responsibly be completed by reusing Awin permissions or publishing arbitrary scraped listings.
