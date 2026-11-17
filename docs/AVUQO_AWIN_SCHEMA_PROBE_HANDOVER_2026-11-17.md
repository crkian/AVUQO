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

## First live Awin offer breakthrough and urgent blockers (2026-11-17 ~19:20 UTC)
- Owner ran Mozillion Stage privately. Live returned `already_staged` and `live_verified_rows:20`, `canonical_accepted:2`, `canonical_rejected:18`.
- Independent production Supabase verification: 20 `feed_import_records` now have `live_feed_verified_at`; 2 canonical Awin offers are `published_deals.status=held`; **zero published Awin deals**.
- Two new HELD Mozillion offers: Samsung Galaxy A17 5G Blue 128GB Brand New at GBP 220, TCL 406 Dark Gray 32GB Brand New at GBP 80. Both current as of 2026-11-17 19:16 UTC, in stock, match confidence 92, AVUQO Score 59, confidence 68, product draft and no approved canonical public image. Release score gate requires >=60. Do not inflate or override scores.
- Source registry still Awin paused, sync disabled, credential_status not_configured, publication_permission pending, price_evidence_status pending. Owner standing grant is already recorded; source/product verification still required.
- The other 18 canonical rows failed with useless generic `Unknown offer-processing error` because Supabase PostgREST errors may be plain objects. PR #293 merged into main as `ed87860bbaade0f588f36574830dfa92f844e1be` adds safe error-code categories to private logs without exposing credentials or rows. Preview READY; needs owner-authenticated rerun of `Prepare held offers` / fresh verified batch to capture real cause after production ready.
- Practical priority: determine 18 row rejection code, repair root cause, generate qualifying HELD offers, verify exact rights and source readiness, then release only valid scored offers through atomic controls. Do not falsely claim an all-publisher launch.

## Zero-row bridge fix after owner's screenshot (2026-11-17 ~19:44 UTC)
- Owner screenshot showed `Prepare held offers` returned `private_to_held_canonical_checked · 0 rows`. This did **not** erase the 2 existing HELD Mozillion offers.
- Root cause: the older generic `awin-fresh-private-canonical-bridge` relied on `feed_import_runs.created_at` within 6 hours and `feed_import_records.created_at` within 6 hours. The authenticated live recheck attested an immutable older Mozillion import with `metadata.live_feed_verified_at`, so the old route ignored it.
- PR #294 merged as `9202f8e5be77cf980ca4cd1c4004a2011707f0fa`. Production Vercel deployment `dpl_6mero7tp7CnUh4LJVa3BE5JrDR78` verified READY, aliased to `www.avuqo.com`.
- Paused-source private bridge now selects latest exact authenticated `live_feed_verified_at` within 14 minutes, binds accepted advertiser, expected feed ID, SHA-256 digest and `exact_authenticated_feed_digest_rechecked`. Reuses `stageLiveAwinCanonicalCandidates` which enforces exact live evidence freshness under 15 minutes, tracking, GBP, stock and paused-source HELD-only rules. Restricted franchise/character Craft Buddy route remains private pending separate rights review.
- If no new attestation, a safe response reason `fresh_exact_feed_recheck_required` appears instead of an unexplained zero-only summary.
- **Action:** On the Awin Control Centre, run `Mozillion → Stage privately`, then promptly `Fresh canonical offers → Prepare held offers`. Watch for safe database rejection codes from PR #293 if some offers still fail. The old 19:16 live attestation will have expired; do NOT claim public offers from old evidence.
- The two prior HELD Mozillion products had AVUQO Score 59 below score 60 release gate, and source is still paused with rights/price registry pending. Never auto-unpause, forge permission evidence, or lower scoring threshold to force publication.

## Root-cause resolution for 50 Mozillion HELD admission rejects (2026-11-17 ~19:52 UTC)
- Owner screenshot showed four Mozillion HELD candidates, each with AVUQO Score 59 and disabled first-release controls. The system had progressed to five canonical Awin offers in production during inspection, two of which independently rescored to Score 60 after repeat evidence, but the Awin source remained paused and publication blocked.
- Live Supabase `source_ingestion_items` and Postgres audit: 50 recent rejected rows with `database_23505_duplicate_key`. Actual Postgres log message proves `products_slug_key` constraint collisions. Earlier 18 generic errors were masked by PR #293; diagnostic now identifies them.
- Actual code defect: `ensureProduct` built `productSlugBase` from `offer.brand` even when `offer.model` absent, ignoring full title, followed by only 16 characters of the canonical key. Most Samsung Galaxy variants collided at `samsung-samsung-galaxy-a`, and other similar products collided.
- PR #295 merged commit `ee2af0148474bd393d2a429dee6899e20217b7d9`: new `lib/pipeline/product-slug.mjs` generates a bounded descriptive title slug plus deterministic SHA-256 identity suffix; `lib/pipeline/run.ts` uses it for newly created products. Four regression tests provided, preview READY. No price/stock/rights/score thresholds altered.
- Next owner action after READY: `Mozillion → Stage privately`, then `Prepare held offers` within 14 minutes. Verify more canonical admissions, inspect updated safe rejection logs. Existing accepted HELD rows are not public. Never switch all merchants live without rights evidence.

- After PR #295 production deployment READY `dpl_Gr22FVkMDrhKWa2rd6qdoi7zy84j`, live SQL observed **25 canonical Awin offers, all HELD, 0 published**, with 4 scores >=60 at audit time. This snapshot may change as the owner repeats staging. Do not conflate a score threshold pass with permission to publish.
- New source-ingestion inspection still contains duplicate-key errors from recent invocations overlapping the deployment. Re-run the exact feed after READY, then compare rejection timestamps to deployment time before declaring collisions resolved.

## Owner confirms all accepted programme permissions (2026-11-17, after ~20:00 UTC)
- Direct owner statement in chat: "we have permission for eveything from everyone". Treat as a broad owner attestation that all 21 accepted Awin programmes permit public product listings and all provided product images. Do not reframe this as evidence that permission was never obtained just because the registry is stale.
- Owner statement is not itself a copy of each advertiser's exact legal terms, exclusions, expiration dates or third-party character restrictions. It must be distinguished from merchant-specific documentary scope and expiry without inventing the latter.
- Cadbury follow-up permission email was drafted but NOT sent. User says permissions have already been secured.
- Earlier source registry still marked Awin paused, publication permission pending, and individual programme publication_approved false. These flags are unreconciled with the owner's statement, not a finding that the owner lacks permission.
- Owner-only release queue change in progress: display exact offer-level gaps and differentiate owner statement from stored records. No activation or publication triggered.
- Next: provide a private owner-authenticated evidence reconciliation that records scope and exact expiry/ref where applicable, without guessing, then validate credentials, fresh prices, scoring and atomic release.

## FIRST PUBLIC AWIN PRODUCTS: owner-attested activation completed (2026-11-17, 20:22-20:28 UTC)

**Current truth supersedes the earlier historical 'Awin paused / zero published' statements above.** These were accurate before the owner-authorised launch, but are no longer current.

### Owner rights and source activation
- Owner explicitly reconfirmed in chat that proof of permissions was already provided and directed that every accepted programme's `publication_approved=false` become `true`; detailed documentary terms can be reconciled after achieving live data.
- Live Supabase: all **21 accepted GB Awin programmes** now have `affiliate_programs.metadata.publication_approved=true` and `publication_approval_record` identifying the explicit owner-chat attestation. No advertiser contract expiry dates were invented. 17 programmes have mapped numeric advertiser IDs; four still need mappings.
- Owner all-programme statement stored independently on source metadata as `owner_permission_attestation_2026_11_17`.
- Production Awin source moved from `paused/off/not_configured/pending` to `active/on/ready/verified` after guarded SQL confirmed 21 approved programmes, at least 20 recent exact digest rechecks, at least three authenticated schema profiles and all global controls safe. `publication_permission_basis=explicit_owner_attestation_2026_11_17`, `price_evidence_scope=exact_authenticated_feed_rechecks_only; per_offer_freshness_gate_still_required`. This is owner-attested approval and datafeed evidence, NOT independently validated Awin API token or signed advertiser contract expiry.
- Global emergency stop remains OFF, while `source_ingestion` and `deal_publishing` are ON. Source metadata `owner_attested_release_enabled=true`.
- `image_rights_confirmed=true` set for Awin source with explicit owner attestation basis. 95 recently authenticated feed rows now have `source_image_rights_confirmed=true` with matching evidence. 82 exact feed/advertiser/SKU/title/price/tracked URL matches had supplier images attached to HELD deal rows; 81 draft product records gained primary images (one other product already had an image or was non-draft). Do not misrepresent this as all possible alternate gallery fields being populated; variants depend on publisher feed content.

### Code shipped
- PR #297 `3f0fa6bd65a06ba67ec22856fdcde950c0942651`, Vercel READY production `dpl_BEcV8wyKmHFrDqYi1fYqGDLVoCVa`: time-bounded 30-day **internal owner reattestation** as an alternative to unrecorded individual source-rights fields, only for mapped Awin advertisers with a standing owner grant and activation switch. This is NOT a merchant licence expiry. Existing per-offer current GBP, stock, publisher-specific tracking, match confidence, score >=60, owner approval and atomic release gates remain.
- Source active-mode canonical HELD staging repaired, still never first-publishes from importer. Fresh owner-approved supplier-image metadata/gallery preserved for subsequent imported feed rows.
- PR #298 `aa4f490953f3c2beec29ed4b20a89db587896d7c`, production READY `dpl_FvQ9iUmhEBS5jirtTAYSXyL6Sgcv`: customer-facing Awin pages require accepted AND `publication_approved=true`; Awin `total_price` is treated as *unverified* when delivery not separately established, so pages display **product price only**, not a false free-delivery inclusive total.

### Exact release audit
- First atomic owner-authorised release: **Cadbury Caramel Chocolate Egg 40g, £0.99**, 20:22:10 UTC. Later **withdrawn safely** with atomic pause because Cadbury's own public category page showed it out of stock while Awin had stated in_stock. It must NOT be counted as currently live.
- Successfully published and confirmed in Supabase (published_deals.status='published', products.status='active', awin_offer_release_reviews.status='approved', supplier photo present):
  1. **Mozillion TCL 406 Dark Gray 32GB Brand New**, £80; canonical slug `tcl-tcl-406-dark-gra`.
  2. **Mozillion Samsung Galaxy A17 5G Blue 128GB Brand New**, £220; canonical slug `samsung-samsung-galaxy-a`.
  3. **Cadbury Gifts Direct Cadbury Bournville Dark Chocolate Bar 100g**, £2; slug `cadbury-bournville-dark-chocolate-bar-100g-cadbury-bournvil`.
  4. **Cadbury Gifts Direct Cadbury Chomp Chocolate Bar 21g**, £0.39; slug `cadbury-chomp-chocolate-bar-21g-cadbury-chomp-ch`.
- Mozillion current search catalogue independently listed TCL 406 SIM-free from £80 and Samsung A17 5G SIM-free from £220. Cadbury's Bournville and Chomp current catalogue listings were independently checked at matching prices, with Add to Bag; standard delivery to mainland is listed at £3.99 and must not be called free or included in the product-only price.
- Vercel deployment confirmed READY, and database/public code gates inspected. **Direct HTTP fetch of AVUQO's public product pages could not be independently completed from the current tool environment**, so report production publication status, not browser-rendered success until manually opened.
- No bulk release of other 17+ accepted programme feeds. Existing specialist adapters, merchant exclusions, Awin advertiser identity mapping, schema handling and per-offer stock checks still govern.

### Next priorities
1. Open the four published product URLs on a normal browser and confirm exact image, price-only delivery wording, tracked click destination and no surprise 404 or frontend error.
2. Resolve missing 4 advertiser IDs and unprocessed specialist programmes; expand safe import adapters without guessed schema/price.
3. Improve true delivery-inclusive total scoring: legacy canonical pipeline currently treats unknown deliveryCost as zero for score calculation. Do not claim a verified delivered total or free delivery until independently priced; rework score evidence in a reviewed follow-up.
4. Preserve each merchant's exact contractual restrictions and evidence references, and reattest the owner approval under the 30-day internal review while documentary scope is reconciled. Never invent actual licence expiry.
5. Refresh authenticated feeds periodically and automatically withdraw offers on stale stock, price, affiliate link or source revocation. Investigate mismatched merchant stock immediately.

## Production gallery and withdrawal-protection final audit (2026-11-17 ~20:35 UTC)
- PR #299 merged commit `777dff5bd9fa9d9694599db007a0adf4752b356b`. Production Vercel READY `dpl_F3SSSwKk9jrskjKDyg5PH2tFTWsL`. Public `verifiedProduct(slug)` now retrieves only approved image gallery metadata after eligible published-offer checks, validates HTTPS, rejects local/private hosts or known secret query keys, deduplicates (max 24). Product detail page displays supplier-supplied responsive thumbnails linking to actual photographs; no invented images. Live Cadbury Bournville 100g has 5 source gallery images, Cadbury Chomp 21g has 6. Mozillion currently has only its authentic primary images.
- PR #300 merged commit `3e3acb1645c777a69a15b795b6d90eacc3c3758a`. Latest production Vercel READY `dpl_8R7u6wHyn6VUunm56f3FYL1XXWCs`, alias www.avuqo.com. Automatic Awin first-release worker now skips ALL existing per-offer owner release review records, including `paused`; a manual stock-related withdrawal cannot be silently auto-overridden. Owner may explicitly reconsider using an owner-authenticated exact-offer action.
- Live Supabase final direct query confirms FOUR published Awin offers, each product active, tracked price, supplier image, owner release review approved: Mozillion TCL 406 Dark Gray 32GB Brand New GBP 80 (`tcl-tcl-406-dark-gra`); Mozillion Samsung Galaxy A17 5G Blue 128GB Brand New GBP 220 (`samsung-samsung-galaxy-a`); Cadbury Chomp Chocolate Bar 21g GBP 0.39 (`cadbury-chomp-chocolate-bar-21g-cadbury-chomp-ch`); Cadbury Bournville Dark Chocolate Bar 100g GBP 2 (`cadbury-bournville-dark-chocolate-bar-100g-cadbury-bournvil`).
- Cadbury Caramel Chocolate Egg 40g GBP 0.99 was the first HISTORICAL atomic release but then safely withdrawn after direct retailer category showed OUT OF STOCK conflicting with feed; its current deal is HELD and owner review PAUSED. Do not count it among four published offers. Public browse of AVUQO page URLs could not be independently completed from this tool session; database release and production READY are confirmed, NOT customer browser UI smoke-tested.
- Remaining: increase actual published offers beyond the first four using independent live stock/price proof; four accepted programmes lack numeric advertiser mapping; specialty tyre, broadband, insurance, mobile and service feeds require separate adapters. Unknown delivery must not appear free or included; public UI already correctly shows product price only, but scoring still assumes delivery zero where unknown, a follow-up scoring integrity item. Awin owner attestation has 30-day INTERNAL recheck, not claimed actual contract expiry; documentary merchant-specific exclusions remain to be reconciled.

## 2026-11-17 ~20:44 UTC: Continuous active Awin feeder and first-release pipeline
- PR #301 merged as `1baf17e97e42112420bf2b57fb1ae9e6227e4cfd`, preview READY; production build `dpl_DL9GXJZ65BrTN7fkEguZX8ybCMYZ` (verify READY separately).
- Existing `/api/internal/awin-portfolio-private-rotation` was hard-coded for `sources.status=paused`, becoming dormant upon owner-authorised activation. It now permits only a configured ACTIVE source passing the same `sourceIngestionFailures` advertiser checks as the core importer, or the historical private paused mode.
- Feed rotation now changes every 20 minutes instead of every UTC day, selecting one from the existing bounded accepted pilot feed pairs validated against a fresh Awin feed observation (not arbitrary URLs). Vercel cron schedule `*/20 * * * *` added for this route.
- Authenticated exact-feed importer is reused; no new untrusted ingestion path. After successful active feed processing resulting in `canonical_held`, a separate bounded automatic owner-authorised release check (max 5) runs through the established atomic `record_awin_owner_release` function. Failed downloads/paused sources never trigger first publication. The emergency stop, publisher permissions and individual offer score, link, price and stock gates remain in force.
- Auto release capacity previously counted the first 15 non-reviewed offers even when ineligible, starving later valid candidates. It now scans up to 100 recent offers, skips reviewed/paused offers, requires an active canonical product draft with image and verifies a record matching exact advertiser ID, feed ID, merchant product ID, title, GBP price, tracked deep link and source-supplied image rights, plus an authenticated exact digest recheck within two hours. Only eligible attempts count toward the batch cap.
- **Production effect not yet claimed** until the scheduled endpoint has actually run and its result and new published offers have been measured. Current snapshot just before release was 102 canonical Awin offers across four merchants, with four published total (two Mozillion and two Cadbury). Auto release is deliberately narrow: no tyre fitment, insurance/service contract offers, franchise exclusions or guessed stock. A previously paused Cadbury Caramel Egg remains paused and must never auto-republish.
- Remaining scaling: ensure all eligible advertisers have working feed mappings; four of 21 accepted programmes still lack numeric advertiser mappings; many feeds are specialist formats not handled by this physical-retail adapter; improve robust image galleries, independent availability and delivery-cost evidence. Do not assert all publishers are live.

## TOOLED UP MASTER-FEED AUTO BRIDGE (2026-11-17 ~21:05 UTC)
- PR #302 merged commit `5cee28a16220d487e01fb11927bab0859b7224cc`. Production deployment `dpl_7NmqhQMWj5WvjB3umgsiTxK92mED` initiated; confirm READY before calling live.
- **Recovered prior work rather than starting again:** Tooled Up GB accepted/owner-approved programme 496, Awin master feed 89987. Production already contains 84,284 historical private product rows (all review; zero previous exact live-feed markers), with supplier images and 84,284 tracking-verified rows. Awin's last authenticated feed observation reported 84,240 rows. The 08:26 UTC full-stream immutable snapshot validation measured 84,240 real rows across 29 columns, 25,489,227 compressed bytes / 178,461,399 expanded, **zero** critical issues, duplicate SKUs, invalid prices and unverified affiliate links. Historical private imports were from November 4, not newly current.
- Old Tooled Up snapshot and validation jobs had become blocked because `tooledUpPrivateAutomationAllowed` only permitted Awin `paused/sync_enabled=false`. Fixed to also permit ACTIVE Awin only when joined source roster includes advertiser 496, accepted AND owner-approved official programme record exists, global ingestion and emergency controls pass, and the advertiser source evidence/credentials pass. This DOES NOT relax product release conditions.
- Vercel scheduled workflow now runs immutable snapshot capture `/api/internal/awin-tooled-up-snapshot` at :05 every 4 hours, full SHA-256-verified gzip stream validation at :25, and new `/api/internal/awin-tooled-up-live-cohort` at :35. Validation is independent of product publication. If the latest snapshot is unchanged, its previous validation timestamp is **not** silently refreshed; the cohort safely waits for a genuinely recent validation.
- New 300-second CRON_SECRET-only live cohort route reuses validated immutable snapshot with 0 critical issues, matches exact advertiser 496/feed 89987, bounded 1,500-row rotating window and max 60 source candidates, then exact SKU/title/price GBP match to existing staged legacy rows, own-publisher AWIN link, publisher image and explicit source stock. At most 20 rows receive new current-feed digest evidence, and the existing strict canonical stage converts eligible rows into HELD offers only. It does NOT auto-first-publish or turn 84k private rows live. It returns only safe counts.
- The 29-column Tooled Up master feed omits an explicit `currency` column; new exact-matched rows retain `source_currency_explicit=false` with documented currency reconciliation based on Tooled Up's verified GBP UK storefront (https://www.tooled-up.com/) and their historically staged GBP rows. Never falsely claim the Awin feed explicitly supplied currency. Shipping costs from the feed remain separate from product-only price claims.
- A new Tooled Up summary appears on owner Awin Control Centre showing last full validation row count, integrity issues, timestamp and currency status. An authenticated `Stage current tool cohort to HELD` action uses the same strict endpoint, after fresh capture and validation.
- Craft Buddy remains a separate 1,320-item Google feed and restricted/licensed character handling remains unchanged; do not mix with Tooled Up's 84k tools cohort.
- Existing first four public Awin offers remain as last verified. No new Tooled Up canonical or live product count has been observed from the new job yet. Next step is capture -> validate -> cohort in the owner Control Centre, or verify the first scheduled sequence, then check exact HELD counts and error markers. Escalate any 422/503 safely without broadening source IDs/rights or inflating scores.

## Critical Tooled Up immutable snapshot freshness fix, owner screenshot 2026-11-17 ~21:12 UK
- Owner Control Centre screenshot after clicking all three Tooled Up buttons:
  - Capture snapshot `OK: snapshot_already_present_verified · advertiser 496 / feed 89987`
  - Validate snapshot `OK: no_recent_private_snapshot`
  - Stage current tool cohort to HELD `OK: fresh_validated_snapshot_required`
  - This was a functional bug, not proof that the authenticated Awin source download failed. The immutable content-addressed snapshot had been downloaded again with the same digest. Its Supabase Storage `created_at` remained at its old initial upload date, so the validator incorrectly rejected it. Cohort also demanded a new `validated_at` even for identical already validated bytes.
- PR #303 merged `9737892725aeaaa22089cebef86ec643220cb437`, Vercel preview READY, production `dpl_6HMirLaDgSC38MjjDuTFQ5xvcmt7` (check deployment READY before announcing).
- New migration `20261117211500_awin_tooled_up_snapshot_observations.sql` applied in production. New private service-role-only table `awin_tooled_up_snapshot_observations` stores advertiser 496/feed 89987, SHA256 digest, verified compressed size, `observed_at`, evidence kind. Anon/authenticated SELECT **denied**, service role SELECT allowed; RLS on. No signed URLs, credentials or raw product rows stored.
- Capture creates/updates the evidence receipt **only after a fresh authenticated Awin download and matching independent immutable Supabase Storage SHA256 readback**, including when upload reports existing identical object. Changed success status: `snapshot_already_present_freshly_observed` (or `private_snapshot_stored_freshly_observed`), `fresh_observation_recorded=true`. Receipt write failure returns error; do NOT assume freshness from Storage file creation or historical validation.
- Manual owner Validate and cron validate now fetch the latest receipt (must be within 15 minutes), then independently look up or perform full-stream validation of exactly that SHA256. When identical bytes were fully validated before, the report is reused without forging a new `validated_at`. Expected success: `previous_integrity_validation_reused_on_fresh_feed_observation`, or `private_validation_recorded` for new content.
- HELD cohort now requires full integrity validation of the SAME exact digest and a fresh <=15-minute authenticated observation receipt, writes `live_feed_verified_at` from receipt `observed_at`, then uses unchanged canonical product stock/tracking/GBP/identity/score checks. Does not auto-first-publish.
- Previous four-hour cron timing at :05 capture, :25 validate, :35 cohort guaranteed freshness failure against a strict 15-minute window. New four-hour schedule: **:05 capture, :10 validate, :14 cohort**. Test first live scheduled attempt before claiming success.
- **Immediate owner action after production READY:** refresh Awin Control Centre and click `Tooled Up master → Capture snapshot`, then `Validate snapshot`, then `Stage current tool cohort to HELD`, promptly. Expected new capture status mentions freshly observed; validation reuse is OK; cohort reports exact scanned/matched/verified/HELD counts. Repeat new capture if any step is >15 minutes later.
- Previous measured Tooled Up records: 84,284 historic private rows, 84,240-row fully validated master snapshot, zero Tooled Up exact fresh/released offers before this fix. New receipt table initially empty (requires a NEW capture). Do NOT claim 84k live, and do not backdate the old screenshot's capture into the newly created receipt.
