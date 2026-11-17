# AVUQO Awin universal feed schema probe handover
Date: 2026-11-17

## Objective
Recognise every feed in the accepted Awin portfolio before trying to process or publish individual products. Preserve independent source permissions, exact identity matching, specialist tyre and service adapters and owner-controlled publication.

## Last independently confirmed production baseline
- Production READY deployment: `dpl_A5hE5mUr15QRT7Mda6c6RfCMppTY`, commit `f69c465`.
- Historical recorded dashboard: 21 accepted programmes, 76 feed observations, 0 canonical Awin offers. These are not fresh claims about the live database.
- Feed-by-feed owner recognition is live, but unknown headers (example Petlibro 77952:109051) remain blocked from ordinary product staging.

## New work in draft PR #288
Branch: `feature/awin-universal-schema-probe-20261117`.
- Added `lib/awin/feed-schema-profile.mjs`: safe, header-only comma/tab/semicolon/pipe inspection and JSON/XML format recognition.
- Added regression tests `tests/awin-feed-schema-profile.test.mjs` (4 local passes).
- Added `/api/internal/awin-feed-schema-probe`: server-only CRON-secret authenticated read-only probe selecting one observed feed linked to an explicitly accepted programme, authenticating it against the exact live Awin inventory.
- Unknown retail feeds can be inspected without adding them to the importer staging allowlist.
- Product-data download is bounded to 3 MB compressed/12 MB uncompressed per request, with no redirects, no persistence and no returned row data, credential, signed link or sample values. Oversized feeds are quarantined for streaming-adapter development.
- Existing specialist tyre, service/contract and large Tooled Up sources remain on specialist routes.
- Owner task `portfolio_schema_probe_next` added to `/api/control-centre/awin-run-now`, with an `Inspect next accepted feed` button in `OwnerAwinRunNow.tsx`.
- Existing allowlisted importer returns safer schema profile diagnostics on both successful and failed preflights.

## Do not misrepresent
- This is a draft branch, not production until independently deployed.
- Probing is not ingestion, schema-adapter approval, merchant rights verification, product identity matching, or public publication.
- Profiles are returned live to the owner, not persisted yet; the UI counter resets on reload.
- The existing nine-feed physical staging allowlist and product-row maximum remain unchanged.

## Remaining work
1. Verify Vercel preview READY, TypeScript, lint and source-specific tests.
2. Test owner-only probe against Awin for multiple observed feeds including Petlibro sale and both CSV variants; audit no signed URLs or raw values in the response.
3. Create a private persisted schema observation ledger using an additive, RLS-protected Supabase migration and owner-authenticated scan tracking.
4. Build streaming parsing adapters with checkpoints and idempotent source records, separate from publication.
5. Connect product identity, stock, GBP price, affiliate tracking, rights validation and the existing canonical HELD review pipeline.
6. Test non-owner rejection, emergency stop boundaries, malformed provider feeds, giant compressed files and provider rate limits.
7. Promote to production only after preview checks, review and explicit release decision.

## Production and live database audit at 2026-11-17
- PR #288 merged into main: `4eabef766354c67ade5d695244828dae92637be3`.
- Vercel production READY: `dpl_CJjNthnvjj3H8rEiU24cUuvFZWvK`, aliased to `www.avuqo.com`.
- Live Supabase: 21 accepted Awin programmes; 76 observed feed entries; 122,538 private feed import records (119,843 review status). These are NOT published products.
- All 13 `feed_import_runs` have `permission_status=unverified` and `status=private_review`.
- Zero `feed_import_records` include the `live_feed_verified_at` metadata key at audit time.
- `awin_offer_release_reviews` currently has zero records.
- General `offers` has six active GBP rows, none with a `last_seen_at` within the past seven days; not counted as verified Awin live products.
- Nine of 21 accepted programmes have zero observed feeds; four have no advertiser ID mapping. All-publisher live publication is NOT accomplished and cannot be inferred from accepted Awin membership.
- New read-only owner inspection action is deployed, but actual authenticated Awin probe results have not yet been collected in this conversation.
- Keep public publication gated on verified feed schema, exact advertiser/feed binding, product price/currency/availability/link, rights and owner release evidence. Do not bulk-activate unverified records.
- Next decisive step is authenticated owner probe of accepted feeds and importer verification; then implement per-feed adapters, resumable jobs and rights reviews before canonical HELD and public release.

## Persisted schema inspection release (2026-11-17)
- PR #289 merged onto main at `1e752135654cf02ea52397c08a717a8f8cb69143`.
- Production deployment `dpl_EVxz6Jmf8NNpsLusZz2YhycHQXnf` confirmed READY and aliased to `www.avuqo.com`.
- Database migration `awin_feed_schema_profiles` applied: private per-feed status, safe field names, reason, route and inspection timestamp. No product rows, signed links or credentials in this table.
- Security audit: RLS enabled, no direct anon/authenticated table SELECT, server service role insert allowed. Advisory flags lack of RLS policy as informational, intentional for private service-only access.
- Owner button now selects the oldest/uninspected accepted feed, rather than browser-local rotation. Dashboard lists inspected coverage, recent outcomes and remaining count.
- Database at release had **zero** recorded profile inspections; no authenticated owner scan executed here. Do not claim products or feed schemas have been verified as a result of deploying code.
- Next: run authenticated owner inspections, develop streamed adapters for oversized sources, verify source rights and fresh product rows, then match into HELD canonical offers before owner-controlled publication.

## Owner Awin field and supplied-image directive (2026-11-17)
Owner provided screenshots of Awin Classic Create-a-Feed column picker, plus a successful AVUQO schema profile for PlayPress Toys feed `101445:96428` (candidate retail adapter; recognised identity/title/price/link). The UI is evidence of selectable field vocabulary, NOT evidence that every actual merchant feed contains or populates every possible column.

**Product field groups shown in owner's Awin screenshots**:
- Core: `aw_deep_link`, `aw_product_id`, `merchant_product_id`, `merchant_image_url`, `merchant_category`, `product_name`, `description`, `search_price`.
- Recommended: `merchant_name`, `merchant_id`, `category_name`, `category_id`, `aw_image_url`, `currency`, `store_price`, `delivery_cost`, `merchant_deep_link`, `language`, `last_updated`, `display_price`, `data_feed_id`.
- Product specification: `brand_name`, `brand_id`, `colour`, `product_short_description`, `specifications`, `condition`, `product_model`, `model_number`, `dimensions`, `keywords`, `promotional_text`, `product_type`.
- Category: `commission_group`, `merchant_product_category_path`, `merchant_product_second_category`, `merchant_product_third_category`.
- Price: `rrp_price`, `saving`, `savings_percent`, `base_price`, `base_price_amount`, `base_price_text`, `product_price_old`.
- Terms: `delivery_restrictions`, `delivery_weight`, `warranty`, `terms_of_contract`, `delivery_time`.
- Availability: `in_stock`, `stock_quantity`, `valid_from`, `valid_to`, `is_for_sale`, `web_offer`, `pre_order`, `stock_status`, `size_stock_status`, `size_stock_amount`.
- Images: `merchant_thumb_url`, `large_image`, `alternate_image`, `aw_thumb_url`, `alternate_image_two`, `alternate_image_three`, `alternate_image_four` (plus core `merchant_image_url`, `aw_image_url`).
- Ratings: `reviews`, `average_rating`, `rating`, `number_available`.
- Custom: `custom_1` through `custom_9`.
- IDs: `ean`, `isbn`, `upc`, `mpn`, `parent_product_id`, `product_GTIN`.
- Other: `basket_link`.
- Google format also uses `image_link`, `additional_image_link`, `lifestyle_image_link` and possibly per-vertical fields.
This is an inventory of screenshot-visible fields, not a guarantee that no other Awin-supported fields exist. Maintain a flexible, versioned recognition registry and preserve unknown fields safely for private adapter investigation.

**Image handling owner requirement:** Use publisher-supplied Awin product imagery when covered by applicable Awin/advertiser terms, including primary image, thumbnails, alternates and gallery images. Keep origin, advertiser/feed binding, rights/expiry, image role and source URL provenance; validate HTTPS and do not assume every image is licensed for copying, caching, editing or republishing outside authorised product promotion. Never invent images or substitute images for mismatched SKUs. Distinguish eligible Awin promotion permission from unconditional third-party image copyright permission.

**Known code gap:** `lib/feed-imports/general-awin-large.ts` stores a single primary image in `feed_import_records.image_url` and hardcodes `source_image_rights_confirmed:false`. `lib/awin/private-live-canonical-stage.ts` currently sets `imageUrl:null` for held Awin canonical candidates. Therefore multiple publisher-supplied image fields and canonical image handoff are NOT complete. Improve this in a separate reviewed patch, preserving publication rights gates and preventing URL/credential leaks.

Official Awin reference: https://help.awin.com/developers/docs/product-feed-publisher-guide-intro and https://help.awin.com/developers/docs/enhanced-telco-data-feeds-overview and https://help.awin.com/developers/docs/enhanced-feeds-prod-spec

## Rapid launch acceleration release, 2026-11-17
- PR #290 merged as commit `0f5abaae66bdb7dbfb962089c0abf5ae41d7419a`. Vercel production `dpl_7AwR2DB8f1phRCD91oZdhFqtqTom` READY on `www.avuqo.com`.
- New `lib/awin/collect-images.mjs` collects merchant/Awin primary, thumbnails, large, alternate 1-4, and Google additional/lifestyle fields from each supported new private import; validates HTTPS, deduplicates, stores source-field/role/feed provenance. Four regression cases in `tests/awin-collect-images.test.mjs`; Vercel preview build READY.
- Pilot normalizers preserve extra image source columns. `general-awin-large.ts` stores `supplied_image_gallery` in private `feed_import_records.metadata`, retains primary URL, sets `source_image_rights_confirmed:false` pending programme evidence. The canonical bridge only supplies approved image URL/gallery when explicit `source_image_rights_confirmed:true` exists; no blanket permission inferred.
- Owner Control Centre can inspect five accepted feeds in one bounded operation.
- New CRON_SECRET-only `/api/internal/awin-schema-autoscan` is scheduled every 10 minutes and records up to eight previously uninspected accepted feed profiles per invocation. Stops automatically when all observed accepted feed IDs have profiles. This is schema inspection ONLY, never product staging or public publication. Verify actual scheduled outcomes in Supabase.
- Live Supabase audit this turn: 122,538 private feed records; 121,628 have primary `image_url`; zero have `metadata.source_image_rights_confirmed=true`. New importer does not retroactively restore absent gallery columns in existing records.
- Crucial source readiness audit: Awin source status `paused`, `sync_enabled=false`, `credential_status=not_configured`, metadata publication permission `pending`, current price evidence `pending`, owner publication authorization `granted`. System ingestion and deal publishing controls true; emergency stop false. Owner authorization alone does not authorise merchant/product publication.
- Awin GUI screenshot showed that stock fields (e.g. `in_stock`, `stock_status`) and several alternate image fields were unchecked in the displayed feed configuration. For feeds relying on those configurations, select the relevant fields and regenerate appropriate feed subscriptions before expecting stock-gated product releases or complete galleries.
- **Still not live for all publishers:** 21 accepted programmes, 76 observed feed entries, 9 programmes without observed feed entries, 4 without advertiser mapping, zero fresh-verified feed record markers at last check, zero recorded Awin release approvals. Specialist referral/service programmes cannot be turned into physical product offers without their own adapters and term verification.
- Highest priority next: verify Awin live credentials/source readiness without altering pending rights; collect complete source feed columns, run authenticated private import/recheck, verify current GBP price/stock/tracking/image permission and publish through existing atomic owner-authorised gate. Do not promote stale private records wholesale.

- Additional Vercel key-name-only audit (no secrets accessed): production environment has `AWIN_DATAFEED_API_KEY`, `AWIN_ACCESS_TOKEN`, `AWIN_PUBLISHER_ID`, `CRON_SECRET`, `AWIN_AUTO_IMPORT_ENABLED`, and `AWIN_FEED_MONITOR_ENABLED` variable entries. **Existence does not prove valid credentials or enabled flags**. Supabase Awin source still marks `credential_status=not_configured`; verify authenticated provider access and reconcile registry from evidence rather than blindly setting `ready`.

## Publisher launch evidence and numeric stock fix (2026-11-17 ~19:13 UTC)
- PR #291 merged commit `d08be6816bbfabab7629af5286d63562a79ae4b5`. Adds `public.awin_private_product_readiness` security-invoker view (service-role only; anon/authenticated SELECT denied) and owner-only per-publisher readiness matrix. Supabase migration applied; verified 7 advertiser IDs, 122,538 private records, 121,628 primary image URLs, ZERO fresh live-feed verified markers.
- Latest 9 inspected accepted feed entries: 2 `schema_profiled`, 6 specialist, 1 not uniquely active. Scheduled inspection is recording results. This does not imply any new public offers.
- Live importer audit: Mozillion `31539:74135` has 883 private rows with stored availability value `1`, 883 tracking-marked and explicit GBP currency rows, but zero live verification markers. Petlibro has 44 newer `in_stock` rows with tracking-marked links; Cadbury 2,738 rows have no stock field or verified tracking; Craft Buddy 1,299 stock values but zero tracking-marked rows. No blanket publication.
- Awin's current official Hosting and Column Descriptions document says standard `in_stock` uses 1 for in-stock and 0 for no stock: https://help.awin.com/developers/docs/hosting-feeds . The `stock_status` field is separate; unknown numeric status by itself remains insufficient evidence.
- PR #292 merged as `96b387e0c59a60a9edb5743a28205c68c01c4fb5`. New `normalizeAwinAvailability` explicitly uses documented `in_stock` 1/0, never guesses numeric `stock_status`, retains `availability_source`, and adds 4 regression tests. Vercel preview READY. Follow-up: run an actual authenticated Mozillion exact-feed recheck using the existing owner-safe import action, then verify `live_feed_verified_at` count and canonical HELD results. Do NOT assume the rows have become fresh solely from deploying code.
- First-launch blockers persist: source is paused, sync disabled, credential registry `not_configured`, publication permission pending, price evidence pending. Vercel's presence of credential keys is not proof they are valid. Owner standing release authorisation is recorded but doesn't waive source/merchant evidence.
