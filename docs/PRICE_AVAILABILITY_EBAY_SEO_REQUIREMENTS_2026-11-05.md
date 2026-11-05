# AVUQO shared price, availability, eBay and SEO requirements
**Date:** 5 November 2026  
**Status:** Approved scope to implement, **requirements only**; not deployed or provider-authorised.  
**Owners:** P1-02, P1-03, P1-04, P2-03, P3-01, P0-05.  
**Sources:** AVUQO master product specification, unified source of truth, current `docs/ROADMAP.md`, `docs/PROJECT_STATUS.md`, existing Awin/eBay private preparations.

## 1. Objective and boundaries
Across all eligible retail providers, AVUQO must explain when a product price was last verified, whether the observed offer remains purchasable, what changed since an earlier genuine observation, and which retailer or seller offers an accurately comparable alternative. Build one canonical offer-state model and UI contract for Awin, eBay Browse, future permitted networks and direct merchants. Keep physical product identity separate from merchant offer and eBay item/listing identity. No auto-publication from a new source; source/advertiser permissions, image rights, stock claims, link rights and current data are independent release gates. Affiliate remuneration never changes organic ranking, AVUQO Score or price comparisons.

## 2. Authoritative offer-status vocabulary
Use separate dimensions, not a single misleading `available` boolean:
- `publication_state`: private, pending_review, approved, withdrawn.
- `source_state`: active, paused, failed, permissions_pending, rights_revoked.
- `availability_state`: in_stock, out_of_stock, preorder, backorder, limited_quantity (only with source evidence), ended, unknown.
- `freshness_state`: current, stale, expired, unverified, unavailable; source-specific TTL; never assume a successful feed fetch confirms a specific offer.
- `condition`: new, used, refurbished, seller_refurbished, parts_or_not_working, unknown where provider supports it.
- `price_evidence_state`: verified_current, source_observed_unverified, stale, absent; keep source quotations distinct from AVUQO-independent verification.
The public Buy/Visit action is eligible only when explicit approval, rights, source health, offer availability, valid matching, sufficient freshness and allowed affiliate-link usage all pass. Unknown/ended/stale offers cannot masquerade as actively purchasable.

## 3. Price-observation and update history
Keep canonical product ID, merchant ID, source ID, source-specific listing/offer ID, variant/condition, region, currency, **integer minor-unit amount**, postage/delivery and fees where reliable, relevant discount/loyalty conditions, stock signal, observation timestamp in UTC, source-provided update timestamp (if any), ingestion/verification timestamp, expiry and provenance/evidence pointer. Append observations only for genuinely received changes/reads; idempotently dedupe repeated provider batches. Do not fabricate prior prices, reference discounts, saving percentages or market completeness.

Display `Price checked {date/time}` only for an actually validated observation, `Price changed {date/time}` only when two genuine comparable observations support it, and `Price not recently verified` when stale. On price change, show previous amount and difference only if same identity, currency, pack, condition and shipping/fee basis are comparable. If price, shipping or purchase terms are uncertain, explain the limitation rather than asserting savings. Display the actual seller/merchant checkout as the final authority. Recheck on click or use safe last-known-state messaging according to provider constraints.

## 4. Availability and customer-facing fallbacks
For available eligible offers, display a restrained status label and last checked timestamp with a clearly attributed source. For `out_of_stock`, `ended`, stale/unverified or withdrawn offers: suppress misleading Buy Now CTAs, explain reason, show last reliable timestamp, offer a permitted comparable alternative with accurate condition/variant distinction, and optionally offer a Watch. If no valid alternatives exist, show an honest empty state. Avoid a false `only X left` scarcity claim; never infer inventory from omission or a failed API. A temporary provider outage must not turn `unknown` into `out_of_stock`. Keep relevant product/price history view where useful even if an individual offer ends.

## 5. eBay-specific adapter, including EPN
Use the **existing planned private, owner-only eBay Browse pilot** as the starting point; do not replace it or create a second eBay catalogue. Require approved eBay developer credentials, actual Browse scope, GB marketplace/territory eligibility, applicable API/affiliate terms and documented data/image caching rights. Existing EPN default campaign ID is a tracking configuration input, not evidence of Browse API approval or affiliate purchase attribution. Store campaign reference server-side; do not place credentials in source control.
- Preserve eBay unique item ID, seller, listing URL, item condition, available/sold/ended state where returned, quantity/availability signal where permissible, shipping charge and destination basis, offer currency, return terms, variation identifiers, item location and source observation timestamps.
- Treat eBay `item ended` separately from `product unavailable`: another seller or approved retailer may have the same canonical product.
- Never silently compare used/refurbished items as equivalent to new products; condition filters and condition-specific pricing are mandatory for valid best-price assertions.
- Account for short-lived marketplace inventory, provider rate limits, item cancellation/removal, API outages and re-verification. No public stock, price or seller-trust claim without source support.
- Keep public listing, affiliate click construction and feed/image publication **disabled by default** until separate approvals and provider acceptance; offer-specific EPN eligible links only if permitted.
- When available, expose stock/ended transitions through the shared Watch evaluator, not a separate eBay-only notifications subsystem.

## 6. Watches and consented notifications
Existing Saved/Watches storage is a foundation, **not proof of working automatic alerts**. Build an opt-in watch evaluator for: (1) price below threshold, (2) meaningful price drop compared on like-for-like terms, (3) verified restock after an earlier recorded out-of-stock state, (4) listing/offer ended or unavailable, (5) replacement eligible seller/retailer offer. Explicitly distinguish a product Watch from an individual eBay listing Watch. Evaluations must use allowed fresh data and source permissions, deduplication/idempotency, minimum change thresholds, cool-downs, quiet hours, event history, per-channel opt-in/opt-out, delivery failures, unsubscribe and owner pause/kill switch. Do not promise email or push delivery before an authorised provider and live acceptance exist. If only in-app display is implemented, label it as such.

## 7. Search engine optimisation and metadata
Use existing Next.js `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts` and existing CMS metadata workflows as shared foundations; audit actual route hierarchy first.
- Generate unique, factual title and description for eligible, indexable canonical **product pages**; include descriptive brand/model/variant rather than a repetitive keyword-stuffed template. Descriptions must not promise a price/discount/availability unsupported by fresh evidence.
- Add consistent absolute canonical URLs, Open Graph and X card metadata, appropriate permitted product images and alt text, and `en-GB` locale. Strip referral/UTM/query-sort parameters from canonical choices; ensure pagination/filtering policy is deliberate.
- Render valid JSON-LD `Product` and `Offer` only from actual eligible product identity and reliable offer records; seller, availability, itemCondition, currency and price must be correct. Do not manufacture `AggregateRating`, `Review`, `priceValidUntil`, discounts or structured data offers. Schema.org offers are separate per seller/condition as appropriate.
- Generate `BreadcrumbList` for real navigational hierarchy, `Organization` / `WebSite` where supported by actual business identity, and editorial/article structured data only where genuine. Canonical product page should remain useful when a single offer expires; an ended individual eBay listing should not create an evergreen indexable page with a fictional offer.
- Keep Control Centre, owner-only previews, private imports, search-result permutations, demo/placeholder, unapproved/staged records and empty categories out of indexing via the appropriate `noindex`/auth and sitemap exclusion. Robots disallow is not a substitute for access control or per-page noindex.
- Include only public canonical index-eligible URLs in dynamic sitemaps; use truthful `lastModified` based on material published changes, not every cron check. Review status codes: durable expired-product page with useful alternatives vs 404/410 for truly gone content.
- Verify that output matches Google Search Central guidance and schema validation at implementation time; do not assert SEO rich results will be granted. No cloaking, duplicate thin affiliate pages, generated fake reviews or unnecessary mass category indexing.

## 8. Owner Control Centre and operational diagnostics
Extend existing Sources, Offers/Products, Watches, Exceptions and Content/SEO views. Required fields: latest successful source sync; per-offer last verified; data licensing/approval; state and state-change audit; stale/expired counts; missing stock signal; non-comparable price deltas; duplicate/variant conflicts; eBay item-ended rate; pending notification jobs and delivery results; canonical/index eligibility; JSON-LD validation defects; sitemap exclusion reason. Provide manual recheck, pause, withdraw and exception review with server-side authorisation and RLS. Never expose provider keys, signed feeds or personal alert destinations to public clients.

## 9. Implementation work, in dependency order
1. **Audit:** latest main/PR ancestry, product/offer/price schemas, eBay private pilot, Awin rights, Watches, existing SEO/layout, current migrations and RLS.
2. **Contracts:** shared typed status enums, price observation invariants, source-specific TTL and public eligibility selectors; adapt Awin and eBay without bypassing existing publication gates.
3. **Frontend:** customer freshness/availability/condition messaging, checked timestamps, related verified alternatives, safe no-purchase state; responsive/accessibility tests.
4. **Metadata:** per-route Next.js metadata, canonical/robots, structured data from allowed data, dynamic sitemap from published records; verify page-specific noindex.
5. **Alerts:** server-side change detector and consented Watch queue/delivery, starting with in-app state; release external channels only after approved integration and consent review.
6. **Ops:** Control Centre exceptions, audit and kill switches; telemetry for update/expired/index defects.
7. **Release:** reviewed additive migrations and backfill if actually necessary, test fixtures, CI, protected preview and signed-in/customer acceptance; separately record production SHA and provider access rights.

## 10. Acceptance tests and release blockers
- A genuine same-condition offer price change is shown with correct prior/new GBP minor units, source evidence and timestamps; identical re-import does not create a fake change.
- Missing, stale, expired, unapproved, rights-revoked and unknown-stock states cannot appear as confirmed in-stock offers or generate misleading Buy Now.
- eBay used/refurbished/new variants and distinct item IDs cannot collapse into an incorrect best-price winner; ended item can still have another valid seller offer.
- eBay/API outage does not falsely imply out of stock; no public eBay promotion prior to developer/affiliate/data usage authorisation.
- Notifications are not emitted without explicit opt-in, fresh valid triggering evidence and a live delivery channel; replays do not duplicate delivery; opt-out and owner stop work.
- Approved product emits one canonical URL and schema-valid factual Product/Offer metadata; unapproved/preview/demo/expired-only listing is correctly noindexed/excluded; sitemap does not contain private or empty URL inventory.
- No fabricated ratings, stock urgency, historical prices, advertised savings, checkout/commission earnings or programme approval; no consumer data or secrets leak.
- Test permissions (guest/customer/owner) and RLS, responsive mobile, a11y, provider rate limits, redirects, stale source fallback, SEO crawler responses, lint/build/regression and production verification.
- Report implementation files/migrations, test outcomes, live SHA, source authorisations and open blockers separately. **This document alone implements none of these features.**
