**Supabase least-privilege verification:** The first migration created the journal with RLS and no anon/authenticated table grants, but connected Supabase default grants gave `service_role` extra DELETE/TRUNCATE/REFERENCES/TRIGGER rights alongside SELECT/INSERT/UPDATE. A second versioned migration `20261116191500_awin_private_cron_minimal_service_grants.sql` revokes all service grants and regrants only SELECT/INSERT/UPDATE. Both must be applied before merging, then inspect `information_schema.role_table_grants`. No public offer/source changes.

## 16 November 2026 · Implement private Awin Cron execution journal (PR candidate)

**Reason:** The Awin feed discovery job ran on 16 Nov, but the four existing 07:05–07:17 privately scheduled imports produced no *new* `feed_import_runs` rows, and Vercel historical runtime-log queries returned no matching requests. Absence of a new import is ambiguous: a private worker can return `already_staged`, `disabled`, `feed_selection`, `feed_validation`, `source_gate`, `http_503` etc without creating a run. Tooled Up's 08:05/08:25 capture/validator code was deployed after those times on 16 Nov, so its first eligible scheduled run is **17 Nov**.

**Implementation:** Add one service-role-only `public.awin_private_cron_attempts` table with a fixed six-job allowlist, start/completion timestamps, HTTP status, duration, a small enumerated state and **whitelisted categorical outcome only**. Apply RLS, revoke anon/auth/public and grant minimal service-role rights. Each of the four fixed private pilot schedules and both Tooled Up daily endpoints writes `started` *after checking the cron secret*, before invoking the existing worker. On success, `already_staged`, disabled or rejection, finalize with sanitized outcome. Unhandled exceptions finalize as `unhandled_exception`; a killed/timed-out invocation remains `started`. If either journal write is unavailable, fail closed with a generic private 503 so an unobserved run cannot silently continue. **No product, price, image, affiliate URL, raw provider error text, secret value, signed digest/URL, customer identity or offer is journaled.** Private manual POST routes are not tracked as Cron runs.

**Unchanged:** Awin source remains `paused`, source controls and publisher rights gates remain in worker and Tooled Up logic, no new imports/products/offers, no different schedules. An audit record proves a scheduled endpoint passed authentication, **not** that a merchant price is licenced or an offer is published. Zero Awin public offers at the latest verified read.

**Release acceptance:** GitHub contract/unit tests for exact six jobs, auth-before-log, outcome-code sanitisation, interruption semantics, least-privilege migration, unchanged 13 cron routes and other security tests; Vercel preview READY, apply versioned Supabase migration and verify service-only permission and zero initial attempts; then merge after CI/preview and verify exact production READY. On first eligible 17 Nov schedule, inspect journal by job with `SELECT job_key,started_at,finished_at,state,http_status,outcome_code,duration_ms FROM public.awin_private_cron_attempts ORDER BY started_at DESC LIMIT 30;` to locate real errors. Keep all handover documents in Git with any findings or failures.

## 16 November 2026 · Existing-feed verification, cron timing and permanent Git handover rule

- **Check before adding any merchant:** Today's Awin feed monitor did run at 06:17 UTC, showing Petlibro 44 (no refresh flag), Mozillion 229, Cadbury 1,371, Craft Buddy 1,308 and Tooled Up 84,256 (latter four marked for private refresh). These are listing observations, not newly imported/current-priced offers. There are **no** new import run rows dated 15/16 Nov among the five merchants; latest Mozillion AUTO 14 Nov and Petlibro 5 Nov. Need actual per-URL logs or DB status to determine why 16 Nov pilots did not stage.
- Tooled Up PR #209's first production READY was **16 Nov 09:47 UTC**, after the new 08:05/08:25 cron times. Consequently **zero snapshots/validation reports today is expected**, not evidence the new schedule is broken. First possible cron jobs are **17 Nov** at 08:05/08:25 UTC. Inspect storage object SHA, validator result and stop controls after those times.
- Vercel log searches for 16 Nov early UTC returned no matching log records; absence is inconclusive. Env **key names** for Awin private automation and CRON_SECRET are present in Production; their values were neither printed nor independently validated.
- Awin source remains paused, sync disabled, publication pending; source_ingestion ON, global stop OFF, zero public Awin offers. **No activation or code/data changes** in this audit.
- Owner's standing instruction: **every material investigation, outcome, source review, error, fix and deployment must be written into Git handover Markdown and machine JSON as well as this status and CHANGELOG before ending the task**, even for read-only audits. Implementation PRs have mandatory CI checks; audit-only work must also be committed. Full detail: [active operational handover](AVUQO_ACTIVE_HANDOVER.md).

## POST-MERGE GIT HANDOVER PROOF · 16 November 2026

PR [#210](https://github.com/crkian/AVUQO/pull/210) merged. GitHub main application commit `3a98b50948d16599ac46d6c8a087c323e7688e7b`, Vercel `dpl_6oMYNWsFCrUG1ZM37Zu8B6mfPGAY` READY, signed-out homepage HTTP **200** with exact deployment marker. This is a documented handover release, **not** new merchant publication, a verified daily cron execution, or a source activation. The complete active operational handover is [AVUQO_ACTIVE_HANDOVER.md](AVUQO_ACTIVE_HANDOVER.md) with [JSON](AVUQO_ACTIVE_HANDOVER.json). The verification follows the initial morning audit, so 16-Nov Supabase counts and Tooled Up snapshot absence remain explicitly **at that earlier audit**, not a newly rechecked condition. A subsequent docs-only Git commit may intentionally skip a Vercel rebuild.

## COMPLETE ACTIVE GIT HANDOVER (16 November 2026)

**First read:** [AVUQO_ACTIVE_HANDOVER.md](AVUQO_ACTIVE_HANDOVER.md) and [AVUQO_ACTIVE_HANDOVER.json](AVUQO_ACTIVE_HANDOVER.json) are the active operational and machine-readable source of truth, with all 13 crons, six merchant rights registers, private and production data, seven open PRs, 22 prioritised work items, original source/vision indexes and every next release gate. The previous 14 November and October entries below are deliberately preserved as dated history, **not claims about today**. At audit, production application was Git `39cb4a94`, Vercel `dpl_Hs18EQdhAm31mh3kDKUJA4c3DZzr` READY, public site HTTP 200. Awin source still paused, 251 private canonical products, zero public Awin offers, and no captured/validated Tooled Up master snapshot despite the newly configured schedule.

## Tooled Up: automated verified private snapshot and full-stream diagnostics · candidate · 15 Nov 2026

- The existing Tooled Up importer was **already built**: `lib/feed-imports/tooled-up-large.ts`, exact master-feed adapter `lib/awin/tooled-up-master-adapter.ts`, full-gzip validator, private snapshot uploader/validator endpoints, and resumable feed-import infrastructure. On Nov 4 an owner-uploaded import stored 84,284 private review rows. Awin listed 84,255 products on Nov 15 in the replacement feed `496:89987`. There are **no** immutable snapshots in `awin-bulk-private-snapshots/awin/496/89987`, and no completed full-file validation reports as of this change.
- Candidate **wires the existing endpoints**, not a replacement importer: daily 08:05 UTC GET on `/api/internal/awin-tooled-up-snapshot` reuses authenticated POST to check joined Awin membership, exact feed/URL, gzip size <=48 MiB, content-addressed SHA/TUS private upload and independent storage readback. Daily 08:25 UTC `/api/internal/awin-tooled-up-daily-validation` picks a snapshot created within two hours from the exact private 496/89987 folder and calls the already-existing validator in-process. On empty/stale storage it reports `no_recent_private_snapshot`, not a false successful feed. No new database tables or import product rows.
- Both endpoints now recheck the original paused source and joined advertiser **AND** `source_ingestion` ON / global emergency stop OFF at admission and immediately before writes. Existing `CRON_SECRET` and `AWIN_AUTO_IMPORT_ENABLED` opt-in are reused; no client-controlled URLs, digests or feed IDs. The validator is bounded to 250 MiB compressed/1 GiB expanded/500k rows; the snapshot capture remains deliberately bounded to 48 MiB for current Vercel memory.
- Diagnostic inventory comparisons use recent source-observed counts (or null if unavailable), rather than the outdated fixed 84,245-row estimate; row-count divergence is a warning, not automatic price/rights approval.
- This **does not yet stage new Tooled Up rows automatically**, grant currency evidence or image/publisher rights, activate Awin/public products, or implement daily 84k-row draft matching. The current master feed omits explicit currency: the adapter still fails closed unless independently approved GBP evidence is supplied. Continue only after fresh snapshot + exhaustive validation report and runtime testing, then connect resumable chunks and withdrawal as a separate safe release.
- Requires GitHub lint/build/secrets, Vercel preview and exact production READY before daily schedules are live. Do not claim a feed capture succeeded until the scheduled invocation actually runs.

## Craft Buddy 45747:F1356 automatic private identity reconciliation · candidate · 15 November 2026

- At 21:34 UTC, Supabase has **no** newest Craft Buddy F1356 AUTO snapshot; the sole 28 October owner-uploaded 1,299-row private import with 1,233 review and 66 excluded records is ineligible. Awin 15 Nov monitor lists 1,307 products on Google-format F1356, but discovery does not prove a successful download.
- Candidate adds 07:57 UTC daily service-role-only post-import RPC, following 07:17 private staging. Rejects missing/stale (>72 hours), importing, incomplete, wrong-digest, wrong-feed and duplicate-identity snapshots. A valid AUTO import can include excluded out-of-stock/malformed rows if separately accounted for; only reviewable valid GBP/stock/tracking rows become matched candidates. Runs under a per-feed advisory lock.
- Uses immutable `awin:45747:F1356:<full supplier ID>` identity. Bulk creates draft products with NULL images and no price, and review-only candidate links; no merging by title/GTIN/character names. Detects changed existing product titles/brands and mismatched source links, aborts transaction on ambiguity. Returns how many formerly linked identities disappeared or were excluded, without deleting/activating listings.
- Craft Buddy's third-party licensed Harry Potter/Disney/Marvel/Star Wars artwork, merchant logo and current GBP offer rights still require independent evidence. All draft metadata marks licence/category/price review required; no public pages/offers, paid ads, image URL copying, brand approval or Awin source activation. No live feed preflight yet.
- Release gates: GitHub lint/build/security, Vercel preview, versioned Supabase migration, first no-auto-snapshot RPC smoke with zero drafts and zero offers, production build exact commit. No asynchronous success assumed.

## Craft Buddy 45747:F1356 Google private Awin import · candidate · 15 Nov 2026

- Owner uploaded joined Awin screenshot and 4-page 2 Mar 2023 terms. Rights ledger records content 8% and coupon 5% screenshot rates; comparison/newsletter/editorial supported; dashboard-provided creatives, trademark written consent, protected character artwork and kid-safe content rules are preserved. No public brand assets, ads or feed photos approved.
- On 15 Nov Awin monitor records Google-format feed F1356 with 1,307 items and a separate two-item Awin feed 109997. Historical 28 Oct private upload contained 1,299 rows, 1,233 reviewed and 66 excluded. It cannot prove current price, stock, schema or rights.
- Candidate adds exact private-only 45747:F1356 importer support and 07:17 UTC cron. Google feed header is required to include six exact, unique columns; at most 256 raw columns projected to the validated 120-column parser. Exact publisher-bound tracking and Awin signed feed URLs, explicit GBP, unique IDs, row/size caps, owner source pause, global stop and idempotence remain enforced. Fail closed if real Google schema differs.
- No fresh preflight yet; no public offers, logos, images, rights approvals, active products or product draft reconciliation.

## Cadbury Gifts Direct private candidate matching · candidate · 15 November 2026

- Owner 15 Nov Awin profile screenshot confirms joined 736, online tracking, UK, indicative commission 7%, sometimes 8%. Owner-uploaded Cadbury 2023 terms confirm permitted comparison engine, shopping directory, editorial content and linking; sale category earns zero commission and Cadbury branded PPC is prohibited. Neither the PDF nor profile by itself proves image reuse, public feed price licence or current purchase total. Evidence saved to `affiliate_programs` on 15 Nov.
- Awin discovery sees feed `736:48599`, Cadbury Shopping Feed, 1,371 listed on 15 Nov. Last privately uploaded snapshot (4 Nov) contains 1,367 rows but no modern `tracking_link_verified`, `source_currency_explicit`, `listing_kind` or supplier update timestamps; it is **never** used as fresh/approved pricing or an automatic candidate input.
- This candidate adds a 07:47 UTC daily service-role-only, transactionally locked reconciliation following the 07:13 private Awin refresh. It accepts only the **newest** complete `GENAWIN__48599__AUTO__%` job with a completed digest/batch session, no exclusions, bounded <=2500 physical GBP/stocked/tracked rows, unique merchant IDs and a paused source. All incoming data must pass before writes, otherwise the transaction fails with no inserts.
- Creates immutable supplier-SKU-keyed draft products and review-only candidate links, never cross-merges bundles and individual chocolate bars by barcode/title, copies no historical prices or image URLs, and flags sale-category commission eligibility for later human review. Existing source ID/title disagreement fails closed. Source rights, scores, offers, publication and merchandising controls unchanged.
- Pending source-preflight: Cadbury live feed format, tracking, GBP, stock and merchant rights are not yet confirmed. On no valid AUTO snapshot returns `no_validated_auto_snapshot`, zero writes. Requires DB migration, CI, protected preview and exact production build before daily cron is active. No public Awin offers created.

## Mozillion physical-handset private catalogue reconciliation · CANDIDATE · 15 November 2026

- Live read-only audit of newest Mozillion 31539:74135 private AUTO snapshot from 14 November: 229 rows, 229 unique merchant product IDs, 229 GBP prices with explicit source currency, verified tracking links, physical handset flag and observed stock. Titles split 166 Brand New and 63 Good as New. Brands are Apple, Samsung, Google and TCL. No GTIN/MPN or source timestamps, no contract/eSIM titles. Three rows privately checked, 226 still pending. None of these observations proves publication or image reuse rights.
- Candidate adds 07:37 UTC daily post-import service-role-only reconciliation after the 07:09 UTC private import. It validates latest SHA-completed snapshot, joined registry, paused Awin source, emergency stop and source_ingestion control. Checks every row, including handset naming, manufacturer, explicit GBP, source feed binding, stock and condition. Distinct merchant SKUs and handset grades are separate product identities; there is no cross-retailer match by title.
- Stable `awin:31539:74135:<merchant_product_id>` canonical key. Inserts draft products without images or prices, and `candidate` product_matches only. Never touches offers, scores, current prices, source controls, customer-visible product status, rights or owner approvals. Existing SKU with changed name, brand or condition rejects the full transaction. Missing product IDs in newer snapshots only reported for future withdrawal logic.
- Requires versioned Supabase migration, GitHub CI, protected preview, DB idempotence/reverification and exact production READY before release. Uses existing CRON_SECRET and AWIN_AUTO_IMPORT_ENABLED opt-in. Supplier feed auto staging stays private.

## Petlibro safe automatic identity reconciliation · CANDIDATE · 15 November 2026

- Following owner request to make each available feed automatic, a post-feed task is proposed for 07:27 UTC, behind existing Awin product feed import at 07:05 UTC. It operates **only** on the newest Petlibro 77952:103580 private AUTO snapshot.
- One transactional, service-role-only, SECURITY INVOKER Supabase RPC rejects source activation, emergency stop, missing ingestion control, missing joined observation, incomplete/newer importing snapshots, oversized snapshots (>500), excluded rows and ambiguous `_feed`/`_health` SKU pairs. Uses a per-feed transactional advisory lock and unique source-offer identity.
- It reuses the 22 previously prepared draft products (including the original Polar Feeder draft), attaches any newly observed well-formed Petlibro SKUs as additional **drafts only**, and adds candidate `product_matches` without overwriting owner review decisions. It never merges distinct SKUs by GTIN: observed 22 logical SKUs have 20 distinct GTIN values, so a GTIN collision count is reported.
- It does not write `offers`, `published_deals`, `deal_scores`, images, prices, approval records or source/rights flags. It cannot activate customer-facing inventory. Database migration needs connected Supabase application and verification, followed by GitHub CI, Vercel READY and signed-out smoke.
- Last private Petlibro product snapshot is 5 Nov 2026 (44 rows) with no source-update timestamps. Merchant response Gmail thread `1a1a6f1eba600746` discusses advertiser 77952 while its signature says 77942. Merchant ID, freshness, delivered price, image edit/retention and per-offer owner review are still unresolved; user publishing approval alone cannot establish them.
- Other Awin feeds remain on their existing private schedules. No new Awin feed import or public offer release triggered by this candidate.

## Three daily physical Awin private feed refreshes · CANDIDATE · 15 November 2026

- User requested automated operation of all joined feeds and rapid public products. The live 15 November inventory has 74 feed observations across 11 advertisers, with overlapping, large, service, contract and tyre feeds. In Supabase the Awin source remains paused/sync disabled; no source-wide rights approvals, and no approved public offers. A feed observation alone does not grant publication rights.
- Candidate replaces the alternating small-pilot Vercel daily cron with three separate, fixed cron paths: Petlibro 77952:103580 at 07:05 UTC; Mozillion 31539:74135 at 07:09; Cadbury 736:48599 at 07:13. Awin feed-list discovery stays at 06:17; existing Pneus and marketing cron remain unchanged. Cadbury 48599 previously had 1,367 privately staged records (4 Nov), **not** proof its current schema or prices have been revalidated.
- Each scheduled task requires `CRON_SECRET` and existing `AWIN_AUTO_IMPORT_ENABLED=true`. Its exact feed goes through the existing private worker, which checks joined registry, source pause, emergency stop, account-specific tracking, bounded size and strict feed schema, full-row identity checks, SHA idempotence and resumable private chunks. If Cadbury's current schema is unsupported, it **fails without product-row writes**. No public products, canonical offers, rights flags, email/social/PPC or source activation.
- Other feed families require scoped workers: Tooled Up 84k and tyres 20k-31k need large-feed/tyre-size rules; Craft Buddy Google-format feed needs a dialect adapter; service/contracts require dedicated full-term or quote handling. No owner permission or price evidence is inferred for any advertiser.
- Add Vercel `ignoreCommand` to skip docs and CI-only builds while preserving code, package and vercel.json builds. This mirrors the isolated Vercel project-level setting changed 15 Nov. The project still needs monitoring to quantify saving; skipping a build is not evidence of eliminated all deployment costs.
- CI and Vercel preview, signed-in owner operator acceptance and exact production READY are required before merge. No production importer, public offers, account charging or existing Vercel project/cron changed by this candidate PR.

## Petlibro paired-SKU production audit · private review candidate · 15 November 2026

- Read-only Supabase audit of latest Petlibro 77952:103580 private import (5 Nov): **44 staged rows map to 22 logical product identities**, each with a `_feed` and `_health` merchant SKU suffix. All 22 pairs agree on title, GBP price, GTIN and model field; 44/44 have tracked links marked verified, 0/44 have source-updated timestamps, 0/44 have per-row image rights confirmed, 0/44 have approved category mapping. Absence of a model field in this feed is not used to invent model evidence.
- New bounded private owner Control Centre audit groups those pairs and flags conflicting variants, missing companion rows, currency, tracking or review anomalies. These are **candidate identity comparisons only**, not deduplication/approval of any live offers.
- No automatic conversion to `products`, `offers`, `price_history` or public sale is implemented. Merchant permission email supplied by the owner must be reconciled separately from stored row rights, and prices must be freshly checked. No live database changes were performed.
- After CI, acceptance of PR #202 still needs real owner session checks. Do not merge or activate while approval gates remain untested.

## Petlibro owner pilot controls and emergency stop · CANDIDATE · 14 November 2026

- The existing Awin automatic worker has already staged Petlibro 77952:103580 (44 rows on 5 Nov) and Mozillion 31539:74135 (229-row snapshot on 14 Nov) behind private-review gates; daily feed-list monitor is functioning. The public pipeline is a separate single-advertiser connector and has not converted these private rows into public products/offers.
- Candidate adds /control-centre/awin-pilot for owner-authenticated, fixed-feed read-only preflight and separately confirmed private staging. It invokes the existing worker server-side without exposing CRON_SECRET. All feed network/download/parse/persistence invariants stay in the existing worker.
- Correct global emergency-stop gap: private auto-import stage now refuses new writes if source ingestion disabled or global emergency stop enabled, checks again after download, before each chunk and before finishing. A safe preflight remains available while paused.
- No production controls changed or product feed triggered by this code PR; manual stage creates only private review rows with unverified permissions. Petlibro owner-provided permission email has not yet been attested in production source metadata, and no current priced offers are approved.
- Next gate: PR CI/build/preview, signed-in owner preflight (correct current provider rows and GBP inference), private-stage idempotence test, stop/rollback acceptance, then separately implement source-specific, auditable canonical product/offer mapping. PR #200 unknown product HTTP 404 remains separate.

## Live Data streaming and pre-query auth fix · VERIFIED · 14 November 2026

- PR #197 (`927e60d4174d5ac58f3d0cfa8587065ea9f5dfe2` / Vercel `dpl_8KU4CnG7t2rWMVC5GKFZbpbw9YtP`) shipped an independent Suspense candidate panel. Signed-out RSC response exposed private UI markers while redirecting to login, so original acceptance **failed**; no private product row exposure was confirmed in sampled response.
- PR #198 (`0f84dba3a1c9e8487c953b24c8a0ca1a4eb1838d` / `dpl_6J8N1ErH35V3GqY77rQR7xxAkowP`) added explicit role-before-query in both parent and child. Build/lint/tests/secrets/preview and Vercel READY passed. Live homepage 200 exact deployment; signed-out Live Data response still contained a framework login redirect instruction but **no private UI markers or source metrics**, meeting this RSC smoke criterion. Error/fatal runtime log sample empty.
- 5,000 cap, 200-row batches, dedup/40-result shortlist, private permissions and read-only status preserved. **Actual signed-in first-paint and candidate latency acceptance pending**. No DB/cron/import/publisher/source activation. See `docs/LIVE_DATA_MONITOR_CANDIDATE_STREAMING_2026-11-14.md` and Work owner QA brief.

## Private Live Data stream auth fix · urgent candidate · 14 November 2026

- PR #197 deployed READY `927e60d4174d5ac58f3d0cfa8587065ea9f5dfe2` / `dpl_8KU4CnG7t2rWMVC5GKFZbpbw9YtP`, with main metrics separated from the 5,000-row candidate scan. Code CI passed.
- **Signed-out HTTP inspection found that login-redirecting RSC output still contained private Live Data panel UI markers and a generic empty state.** No actual private product rows were confirmed in that sample, but this must fail access-control acceptance.
- Fresh-main hotfix adds role verification **inside both the Live Data route and async candidate panel**, before any session DB reads/streamed UI. Layout guard remains defense in depth. No other private route or source activation changed.
- CI, preview, exact production READY and signed-out response recheck required. Signed-in owner timing and counts remain pending. See `docs/LIVE_DATA_MONITOR_CANDIDATE_STREAMING_2026-11-14.md`.

## Live Data candidate scan streaming · candidate · 14 November 2026

- Refactor `/control-centre/live-data` to stream independent source counts, source health and recent import runs while its up-to-5,000-row candidate scan loads inside a separate accessible Suspense server component. Preserve 200-row serial pages, 40-row shortlist, dedup, error/partial labels and private-source permission restrictions.
- Candidate reads now use the existing session-scoped Supabase client inside the auth-protected Control Centre layout. No new DB grants, writes, supplier imports, price approvals, cron or social action. Explicitly mark permission/scan failure Unavailable, not zero.
- Regression test `tests/live-data-candidate-streaming.test.mjs` included in quality CI. **Not live until merge and Vercel READY**. Signed-in metrics-versus-candidates browser timing remains pending. See `docs/LIVE_DATA_MONITOR_CANDIDATE_STREAMING_2026-11-14.md`.

## Owner Control Centre audit editor release VERIFIED · 14 November 2026

PR #195 code `08c34b2c58aa93084ed8e72d166bcba4120bf800`, Vercel `dpl_2r8GhTAvLXmMw4nbuA1EgymqdGbT` READY, homepage HTTP 200 exact deployment; quality, lint, owner-audit tests, secrets and preview passed. Private editorial page requests now explicitly enter `connection()` before role and DB reads, with no Save/Publish logic changes. Vercel runtime search for Date.now/prerender had no matching lines within the sampled release window; no fresh signed-in browser or write-path acceptance was performed.

Source Atlas and Marketplace already read private observations through a role-gated admin client; 74 database rows were observed, but signed-in owner/admin metric display remains unverified. Live Data scan loading state next. Separate product #194 unknown/pilot response **still 200**, true HTTP 404 pending. Work read-only audit: `docs/WORK_PARALLEL_OWNER_CONTROL_CENTRE_AUDIT_2026-11-14.md`. No Awin or social permissions altered.

## Control Centre owner-audit reconciliation · candidate · 14 November 2026

- Marketplace and Source Atlas already use authenticated server-only admin client for private Awin observation metric; live DB count 74. This supersedes the old *code* access gap, but signed-in owner/admin browser card confirmation still pending.
- Public editor adds request-bound `instant=false` and `connection()` before role/searchParams/data reads to address previously observed request-time prerender warning. No save/publish changes. CI/test/preview and owner browser + fresh Vercel log acceptance required.
- Live Data Monitor has sequential candidate scans up to 5,000 rows before first render; isolate behind a loading state in a separate PR. Open Food Facts 503 is external, endpoint targets currently unconfigured.
- PR #194's product route still returned 200 for unpublished/unknown slugs on real production checks despite missing-content guard. **True HTTP 404 remains unresolved.** No demo price may appear.
- See `docs/CONTROL_CENTRE_OWNER_AUDIT_RECONCILIATION_2026-11-14.md`.

## Public product real HTTP 404 · candidate · 14 November 2026

Four editorial research model guides are live via PR #191 but are not approved-price retailer comparisons. A draft pilot/unknown slug can return HTTP 200 with a streamed not-found component; current candidate moves public eligibility checks before any header/Suspense stream and adds an explicit CI regression. The earlier PR #193 was closed unmerged; this is a narrowly rebuilt patch from latest `main`. Awin remains paused and 0 Awin offer releases are approved. Live 404 status and production READY remain acceptance gates before declaring finished.

## PRODUCT VISIBILITY FIRST: FOUR MODEL RESEARCH GUIDES · CANDIDATE · 14 NOV 2026

Owner priority is to put recognisable products on the actual site before further Git housekeeping. Fresh read-only production Supabase: **4 active product identities**, **8 draft pilots**, **6 demo-only offers** and **0 approved Awin offer release reviews**; Awin remains **paused, sync disabled, publisher/product rights pending**. Existing public `verifiedProductIndex` correctly excludes the demo offers, so showing live prices today would misrepresent the data.

Candidate `feature/public-product-research-guides-20261114` adds four editorial model guides (Apple MacBook Air M4 13-inch, Ninja AF300UK, Dyson V15 Detect Absolute, LG C4 65-inch family), with no retailer price, stock, score, merchant photo or affiliate buy link. All four have their own `/products/[slug]` guide fallback and manufacturer info references; `/products`, homepage cards and home/tech product showrooms surface them without activating a source. Existing independent verified-offer pages win if a product later passes rights/variant/score/price freshness checks. Unapproved draft pilot products remain hidden and research detail pages are `noindex`. No new DB migration, cron, Awin flag, customer entitlement, social or tyre worker. See `docs/PUBLIC_MODEL_RESEARCH_GUIDES_RELEASE_2026-11-14.md`; Work parallel read-only QA brief `docs/WORK_PARALLEL_PRODUCT_DESIGN_QA_BRIEF_2026-11-14.md`.

**Release status CANDIDATE until CI, preview, merge and exact SHA production READY.** After release: owner-approved current Awin merchant feed/permission check and one real offer release, then continuing visual and branch reconciliation. Never backfill demo prices as real offers.

## Unified Git, all branches, ideas and handovers VERIFIED · 14 November 2026

- PR #189 merged SHA `20006d39f7ae9541f79ca39ef9966818cb0cae93`, Vercel `dpl_DrcFffyiYBCmdF9T6PcYoKfjDqd4` READY; exact live homepage HTTP 200 on both-domain deployment. Build/lint/source register tests/secrets/preview passed.
- Master linked docs: `docs/AVUQO_COMPLETE_GIT_BRANCH_IDEA_HANDOVER_INDEX_2026-11-14.md` + `.json`: 22 Git branch refs, 5 open drafts, 14 divergent old refs, 2 security refs, 9 original owner sources (hash-provenanced, not raw confidential files), 29 roadmap IDs and 12 gaps. Linked from README, Start Here, AGENTS, ROADMAP and handovers.
- GitHub repo is public; original confidential master product/grocery PDFs and incomplete artwork are not automatically committed. The index is a dated navigation/evidence registry, not a claim all integrations or ideas are live. Preserve production source/publication gates, release cron and owner roles.

## Full Git / all branches / owner ideas and handovers index · candidate · 14 Nov 2026

Added linked Markdown and JSON inventory at `docs/AVUQO_COMPLETE_GIT_BRANCH_IDEA_HANDOVER_INDEX_2026-11-14.md`. It consolidates **22 observed branches**, five open draft PRs, two protected security references, fourteen divergent old branches, nine original source-asset IDs/checksums, 29 roadmap workstreams and twelve granular requirement gaps. The index points to existing living handover, Compass, roadmap, audit, design and source approvals without replacing them. GitHub is public and confidential master source PDFs/image binaries are indexed but **not** committed as raw attachments. This is a candidate until CI and production READY verification. No customer-facing or provider activation changes.

## Branch retirement verified: 25 to 22 · 14 Nov 2026

PR #187 merged at `79e97df4761cb57010bbf874bc92440545b6709f`; Vercel `dpl_wWZ37buUPN9syB77c9AEYFfXQVGf` READY with both production aliases and exact live homepage HTTP 200. Three closed-but-unmerged PR branches #50/#51/#85 were reconciled against current Awin error-safe code, merchant terms review and byte-identical shared requirements. They were independently absent in fresh GitHub search after the bounded workflow. The temporary PR branch was also pruned. Now 22 refs including main: 5 open PRs, 2 protected security, 14 historical divergent, 1 main. The per-ref workflow log was not independently inspected; deletion is evidenced by the ref listing. Source, marketing and feed controls unchanged. See the current inventory and proof ledger under `docs/BRANCH_REDUCTION_RESULTS_AND_RECONCILIATION_2026-11-14.md`.

## Closed old PR source preservation · candidate · 14 November 2026

- 25 live GitHub branches remain. Closed-not-merged historical PRs #50, #51 and #85 have been source-compared to current main. Awin errors already disclose only HTTP status, Cadbury/Petlibro restriction review exists with newer current notes, and price/eBay/Watch/SEO requirements doc has an identical content SHA.
- A strictly three-name pinned-head cleanup will delete only if exact closed PR head and final reviewed commit, original branch ref, current preserved main blob and reconciliation ledger all match, with no active/reused PR or protection. This release is **candidate**, and no deletions are yet claimed. Read `docs/CLOSED_LEGACY_BRANCH_RECONCILIATION_2026-11-14.md`.
- Open PR #25/#83/#93/#117/#158, security refs and other divergent historical work remain untouched. No merchant rights or runtime automation flags changed.

## Branch cleanup VERIFIED: 63 -> 25 refs · 14 November 2026

- PR #185 deployed READY at `a032f85a39964dff2ade6785331c399d2eccda1b` / `dpl_GhzjfNTsg2UYTumhPRwiPvSbwkJ3`. Homepage 200 on exact deployment; tests, build, lint, secrets and preview passed.
- New main-push verified merge cleanup reduced GitHub refs from 63 to 25 including main. 38 refs disappeared in observed branch inventories, not merely CI simulations. Per-ref Actions logs were not separately inspected.
- Retain 5 open PR heads, 2 security refs and 17 divergent older branches until diff-to-live review; original visual source is among protected open PR heads. `docs/BRANCH_REDUCTION_RESULTS_AND_RECONCILIATION_2026-11-14.md` records all 25 and next safe review order.
- Continue marketing, imports and visual releases through short-lived PRs; automatic cleanup prevents ongoing merged branch buildup.

## Branch hygiene toward zero stale branches · candidate · 14 November 2026

- Read-only count: 63 GitHub branches including `main`; 5 open PRs (#25/#83/#93/#117/#158). Not all branches are safe to remove; original reference design and security work must survive until fully incorporated/archived.
- Candidate update to the already installed GitHub Actions verified-merged cleanup: after every main push, prune only existing PR #127+ branch tips confirmed closed+merged into main, exact frozen head and final PR commit SHA, unique branch name and no open PR, without touching protected/security/original design refs. Never delete a moved ref. Existing historical <=126 workflow remains.
- The CI tests exercise **safety contract**, while actual deletion outcomes and new count require post-merge workflow logs and branch search. See `docs/VERIFIED_BRANCH_RETIREMENT_POLICY_2026-11-14.md`.

## Awin private metadata monitor integrity VERIFIED · 14 November 2026

- PR #183 merged at `0727c0866ad15053955dc3b9fa6822a043122376`, Vercel `dpl_5z93DKd4sceJjCdMFDpyi5zzca5U` READY with production aliases; public homepage HTTP 200 on exact deployment. Quality build/lint, regression, secrets and preview passed.
- Feed-list metadata now fails closed on duplicate/empty headers, malformed counts and conflicting duplicate feed identifiers without retaining credential URLs. Awin source still paused, sync off. No imports or product publication activated.
- Private endpoint's unauthenticated response could not be independently checked because connected Vercel inspection reported deployment authentication failure. Retest with an authorised read-only browser/session rather than running the cron. Controlled malformed-inventory integration remains pending.

## 14 November 2026: Awin inventory ambiguity guard candidate

- Add strict metadata-only feed-list CSV identity validation: distinct nonblank headers, explicit safe-integer counts, and fail-closed handling of conflicting duplicate advertiser/feed IDs. Signed URLs are never retained; harmless URL rotation remains deduplicated. Existing monitor stops before its discovery RPC if inventory rows are ambiguous.
- Awin source was verified paused with sync disabled. PR #176 recovery and all four Vercel cron registrations remain unchanged. No supplier downloads or offers activated. Candidate requires CI, merge, and exact-SHA Vercel READY verification; see `docs/AWIN_FEED_INVENTORY_AMBIGUITY_GATE_2026-11-14.md`.

## 14 November 2026: Marketing editorial schedule isolation VERIFIED

PR #181 code release `a75964878b61b9ae175252e085646404dd8a5cb1` deployed READY at `dpl_2pc1X5UNfnSpQC9TnGSmFPf6sxJQ`, homepage HTTP 200 at matching custom-domain deployment and unauthenticated marketing cron HTTP 404. GitHub build, lint, targeted tests, secrets and preview passed. Per-rule malformed schedules/claim errors no longer abort other review-only draft schedules. No live marketing rules or posts exist; publishing and AI OFF with emergency stop ON. Owner-approved rule acceptance remains pending.

## Marketing review-only draft scheduler resilience · candidate · 14 November 2026

- The existing daily marketing cron's editorial-draft substep is hardened so one malformed/due rule or claim error cannot block other brands and channels. The same brand/platform/owner/cadence validation is now applied within a per-rule error boundary, with best-effort, concurrency-guarded failure recording. No new social/publishing activation.
- Live baseline: 0 editorial rules, 0 marketing posts; publishing/AI OFF, emergency stop ON. No production fixtures or new rights. See `docs/MARKETING_EDITORIAL_RULE_ISOLATION_RELEASE_2026-11-14.md`.
- Branch-only until CI and exact READY production are verified.

## Category picker verified · 14 November 2026

PR #179 deployed `a71b9bcc25a2a65b53a2744b661dffc86c20c067` (Vercel `dpl_5vmb555PfgdUQYwE9HVSq9b8Hb3J`, READY on `www.avuqo.com`). GitHub Build, Lint and secret checks passed on `ea516cdaa4ebf2d7f86180dfcb6ca8b2adf0aa0e` and the Vercel preview succeeded. The desktop category directory now selects Books and follows its direct product link. At narrow width the picker selects Musical Instruments and opens its guide. Browser checks across the release sequence found no horizontal overflow on the 14 refreshed guides and 25 shelves at 1,348 and 449 CSS pixels. The Books shelf also passed at 337 CSS pixels. Populated public item acceptance remains pending verified external offers.

Warning: truncated output (original token count: 17189)
Total output lines: 341

## Category directory pointer and scroll fix · 14 November 2026

Version `0.5.3` bounds the desktop directory and menu grid rows so their footers do not overlap selectable categories. The directory continues to stack on mobile. PR #178 deployed `8010f564c5042d2058463dd6ad376b8ba67002ec` (Vercel `dpl_6KZUk22Bq8hqmKi6nKFqNtwDRKXX`, READY on `www.avuqo.com`). Build, lint, secret scan and preview passed. All 50 category guides and product shelves returned HTTP 200 with a heading on the exact deployment. All 25 shelves showed zero verified listings. Browser spot checks covered Books and Instruments and the Books shelf had zero document overflow at 337 and 1348 CSS pixels. Production had six demo deal rows and zero eligible external product listings, so populated item pages remain fixture-verified pending approved offers.

## Department and item presentation · 14 November 2026

Version `0.5.2` covers 25 department product shelves, the 14 generated guides, the category directory and product-detail presentation. Existing dedicated category landings retain their own content. The Pets offer rail now uses the verified public catalogue. No supplier, merchant-offer, cron, account or database changes. Deployment verification is recorded in the live handover after CI.

## Private Awin retry recovery deployed · 14 November 2026

PR #176 is READY at `043f7f3a9d72e93daa7d07744cf353d6f2d82c83` (`dpl_59juctLSxXAr3bMbvMPiBbKLxKuN`) on `www.avuqo.com`. It makes setup resumable for an empty interrupted run and deduplicates starts for the same feed fingerprint. GitHub quality and secrets checks passed. The unauthenticated live endpoint returned HTTP 401 and a private non-cacheable response. A read-only production check confirmed the Awin source was paused, sync was off and zero incomplete setup runs were present. Isolated database checks verified that duplicate inserts preserve the original run and session data. No authenticated supplier invocation, production test write, migration, cron or public offer change occurred. A real authenticated retry remains to be exercised.

## Private Awin retry recovery candidate · 14 November 2026

The two allowlisted pilot feeds can recover an interrupted empty session. Concurrent automatic starts use a stable run ID and a duplicate-safe session insert. No new cron, feed activation, schema or public offers.

## VERIFIED MARKETING HOME CLAIM GATE · 13 November 2026

PR #173 merged app SHA `1fcad1afd007544a2f4a2669b4d20c45d0226d19`; Vercel `dpl_22XM7ti5pdEDcgCnprCyfF7WMfYb` READY with `www.avuqo.com` alias; public homepage HTTP 200 with matching deployment. Build/lint/evidence and secrets tests passed. Public homepage now rechecks private current approved AVUQO fact eligibility for custom campaigns and falls back to safe editorial; owner resume and dashboard also respect revoked/expired facts. Live marketing system still disabled with emergency stop ON and zero campaigns. Actual owner campaign publishing acceptance remains pending.

## Marketing homepage current-fact safeguards · candidate · 13 November 2026

- Public homepage campaigns now require a second server-side, private evidence check at request time: fact must still be AVUQO-specific, approved and unexpired. Existing public RLS and column-limited SELECT stay intact.
- Owner-only creation lists current facts and approve/resume actions recheck evidence; Control Centre shows withheld invalid campaigns. Safe evergreen content remains fallback.
- Verified baseline: live database had zero marketing facts or placements, with social publishing/AI disabled and emergency stop ON. No feed import, social automation, paid ads or product releases enabled. Candidate not yet deployed; see `docs/MARKETING_HOME_CURRENT_EVIDENCE_RELEASE_2026-11-13.md`.

## Verified product/account production visual release · 13 Nov 2026

PR #171 app SHA `29454fd87952e66a1e02815ef26d3db46887ce5c`, Vercel `dpl_4vN5FNZght94Uje3YV5AX4wrV8dG` READY with aliases; homepage/products/account HTTP 200 and matching deployment ID. Build, lint, secrets and Vercel preview passed. No source approval, product publication or account permission changes; authenticated journeys and exact-variant eligible-product visual comparison need further browser acceptance.

## Product comparison and My AVUQO candidate · 13 November 2026

Move verified retailer comparisons ahead of buying guidance. Show only images from eligible offers. My AVUQO uses real account counts and presents an explicit guest sign-in link. No merchant publication or account access rules change.

## Seasonal artwork verified · 13 November 2026

PR #169 is READY on the production domain at `3caf3f6f8800addca8436edf9d0979566e02ef45` (`dpl_5SwnUJNdTUQDBcZRtUFUsqaJauM6`). Christmas, Easter, Valentine’s and Sales now use dedicated, unbranded local WebP artwork, shared with their existing homepage themes. Signed-out production browser checks confirmed the expected hero and no horizontal overflow on all four pages at 1348 and 449 CSS pixels. Build, lint, secrets and date-rotation checks passed. Christmas gift planning and evidence gates remain intact.

Next visual work: refine product and signed-in account layouts.

## Seasonal artwork candidate · 13 November 2026

Christmas, Easter, Valentine’s and Sales use dedicated unbranded artwork in their guides and existing homepage rotation. No seasonal date, provider or source changes.

## Black Friday and department artwork verified · 13 November 2026

PR #167 is READY on the custom domain at `50a3e9d3a1fdc2b7457683f2688667b6df0cb2a6` (`dpl_GUSqxRdimdjEzNoagagxJ9pQZXKF`). Build, lint, secret checks and targeted design/date tests passed. The Black Friday landing page and date-driven homepage use the new locally hosted editorial artwork. Electronics & Tech, Home & Living and Beauty now have distinct artwork and direct headings. Signed-out production browser checks confirmed the landing and department pages render at desktop and 449 CSS pixels without document overflow. No provider, customer or schedule changes.

Next visual release: bring Christmas, Easter, Valentine’s and Sales artwork closer to the reference, then refine product and signed-in account composition.

## Editorial hero refresh candidate · 13 November 2026

New generated editorial images follow the original warm-premium boards and show generic, unbranded subjects. Black Friday shares its local image with the UK-scheduled homepage spotlight. Three category heroes use direct department names and compact responsive layouts. Pricing and supplier eligibility are outside this release.

## Saved offer destination candidate · 13 November 2026

Selectively port #21 routing onto the current Saved, Watch and List pages. The live route continues to recheck offer eligibility, and previously stored list keys are recognised without a customer-data migration.

## Mobile search and audit candidate · 13 November 2026

Keep global search usable on the phone and tablet. Extend visual audit to four widths and three additional public journeys. PR #162 already deployed with private Awin monitor and homepage scheduling fixes.

## Campaign scheduling and private Awin monitor candidate · 13 November 2026

Homepage editorial placement delivery uses publicly readable sort fields. The existing owner review stays in place. The Awin monitor distinguishes an empty response from a successful check, and the importer requires explicit preflight or approved staging mode for POST. No change to schedules, switches, source rights or data.

## Warm-premium storefront candidate · 13 November 2026

Shared brand mark recovered from design PR #93. Homepage department links and shopping dashboard now lead the content after the date-aware hero, and the mobile dock includes Saved and Lists. Existing public-offer admission and provider schedules are outside this release.

# TYRES UK DORMANT JOB JOURNAL CANDIDATE · 13 NOV 2026

Old PR #117 snapshot-job table missing from live Supabase; private bucket exists and Awin is paused/sync disabled. A narrow additive job-journal SQL migration with RLS, service-role-only grant, `blocked` default state and explicit feed ID rather than historical 93988 is staged in `supabase/migrations/20261113210500_tyres_uk_private_job_journal_only.sql`. It does not install worker RPCs, schedule cron, insert data or enable any feeds. Dedicated migration safety test is in CI. Must apply reviewed SQL using migration tooling and verify actual live table permissions/zero rows after tests, before calling it complete. PR #117 full worker remains OPEN; details `docs/TYRES_UK_DORMANT_SNAPSHOT_JOURNAL_RELEASE_2026-11-13.md`.

# VERIFIED TYRES UK AUTOMATIC-WORKER PREFLIGHT RELEASE · 13 NOVEMBER 2026

PR #155 merged; Vercel production READY SHA `5954beb29fc849dc9368991fdce6ba2db5a3b063`, deployment `dpl_5CoPiwj5gLSAiES6LwWc1Ux2U9v9`, alias `www.avuqo.com`. Owner-only `/control-centre/tyre-spec-enrichment` now has read-only prerequisite check for private snapshot bucket and job-table existence, with always-negative enable decision and explicit blocked requirements. Live DB: job table/RPCs absent; private bucket present; Awin paused/sync off. Build/lint/tests/secrets passed. No auto-worker, SQL migration, cron, supplier feed fetch, price change or public offers. Actual owner browser preflight execution remains unverified. Old PR #117 remains OPEN pending migration/lease/retention and verified current supplier feed.

# TYRES UK AUTO-WORKER PREFLIGHT CANDIDATE · 13 NOVEMBER 2026

Live Supabase read-only audit confirms bucket `awin-bulk-private-snapshots` private, proposed V2 job table absent and claim/apply snapshot RPCs missing; existing private enrichment RPC security invoker, Awin paused/sync off. A new authenticated owner-only preflight in the existing tyre API/UI checks job-table and private-bucket readiness without any writes, current Awin download, feed activation or public prices. Always returns not approved to enable; old PR #117 remains open. No migration or cron will ship in this candidate. CI/production verification pending. Full evidence `docs/TYRES_UK_AUTO_WORKER_PREFLIGHT_2026-11-13.md`.

# VERIFIED PRIVATE TYRES UK CANDIDATE VALIDATION RELEASE · 13 NOV 2026

PR #153 merged and Vercel READY app SHA `7c8619352d5458a1c1ce69c3dc5f4960a813a3d2`, `dpl_G5W4w3GCFbjnqnAikP8UJSKWVBCK` with `www.avuqo.com` alias. Strict private-only Tyres UK source-header, advertiser and description-cross-checked load/speed candidate parsing deployed without any current price output or verified fitment. Owner Control Centre explicitly labels automated enrichment NOT ENABLED. Historic PR #117 **remains OPEN**; its migration/storage/cron/lease worker is NOT yet deployed or enabled. Live Supabase job table absent, Awin paused/sync off. Preserve existing Pneus cron and manual original-file recovery. No public offers or source rights changed.

## Tyres UK disabled-worker safety reconciliation candidate · 13 Nov 2026

Live Awin source paused/sync off; production SQL currently lacks `public.awin_tyres_spec_enrichment_jobs`. Old PR #117 relies on un-applied migration, storage snapshot and cron job, and its `vercel.json` is stale relative to the existing Pneus cron. Do **not** wholesale merge or activate. Current-main branch selectively ports candidate-only strict CSV schema and description-cross-checked load/speed validation (no returned price, no publication), plus honest owner Control Centre state and CI negative tests. Worker/migration remain unfinished and PR #117 stays open. Current historical feed 93988 must be revalidated before any future worker. No source, data, price, fitment or permissions changed.

# VERIFIED TOOLED-UP AWIN PROGRAMME CURRENCY CODE RELEASE · 13 NOVEMBER 2026

Merged PR #151, Vercel production READY SHA `36b2840a159db2d274c38837dcdef9dc02333aac`, deployment `dpl_HU1PbTyE3oRrCYujGSPZZRFUPNHZ` on `www.avuqo.com`. Superseded old PR #102 CLOSED. Read-only, secret-protected current Awin joined-programme `currencyCode` inspection for advertiser 496, requires Awin paused/sync disabled, no writes and no image or product authorisation. Historic feed 496:89987 remains unverified/possibly retired. **No live owner API currency outcome or replacement feed ID confirmed.** Next owner evidence of GBP and new Tooled-Up feed rights, then PR #117 if appropriate.

# CANDIDATE · TOOLED-UP READ-ONLY GBP PROGRAMME CURRENCY PROOF, 13 NOV 2026

Selectively port old PR #102 to current main. Awin Publisher API `GET /publishers/{publisherId}/programmes?relationship=joined` includes `currencyCode`. Protected manual API endpoint tests numeric ID 496 and GBP, with server-only secrets, historic joined membership plus paused and sync-disabled source. No database writes, no feed/import/publication approval. Historical feed 496:89987 **must not be treated as currently available**; active feed ID and product prices require separate evidence, as do image publication rights. CI, production READY and old PR disposition pending. Details `docs/tooled-up-awin-programme-currency.md`.

# VERIFIED CADBURY/PETLIBRO AWIN TERMS RELEASE · 13 NOVEMBER 2026

PR #149 merged and verified production READY SHA `b6b6a93f7da3837f02d004cade0ec1fee52715a8`, Vercel `dpl_2L3ihuCwwJX5UYBGrL5naFBxDemm`, `www.avuqo.com` alias. Historic PR #51 CLOSED as superseded. Existing owner-only retailer onboarding now describes previously reviewed programme restrictions and links to source-rights evidence review. Cadbury sales commission exclusions and brand PPC; Petlibro territory, PPC/CSS and conflicting rates. Original emails/PDFs **not re-examined** for this release; merchant image/feed republication rights are NOT verified, no source status/approval flag changed, no public offers. Next #102 Tooled Up GBP proof.

# CADBURY/PETLIBRO HISTORICAL TERMS REVIEW CANDIDATE · 13 NOVEMBER 2026

Current-main work selectively preserves documentation-only PR #51 terms from owner emails/PDFs reviewed 4 Nov and surfaces conservative guidance in the private retailer Control Centre. Awin Cadbury 736: organic comparison/editorial listed, sale category excluded from commission, branded PPC restricted. Petlibro 77952: UK exclusions, PPC/CSS constraints, contradictory commission terms. Both: public feed/images/republication rights not confirmed, historical review not a current legal grant. All rights flags, source ingestion/publishing controls and unapproved images stay unchanged. Dedicated regressions and CI; after Vercel READY, old conflicting PR #51 should be closed. No owner-supplied underlying PDF/email freshly re-read during this port.

# VERIFIED AWIN NUMBERED CSV PRODUCTION RELEASE · 13 November 2026

Merged PR #147, production READY app SHA `ba25af858c203df11713c4496276b2d38d4caa22` on `www.avuqo.com` (Vercel `dpl_EBxNpctsyr6Vswy9WeCjNdAcHhWd`). Historical conflicting PR #58 **closed as superseded**. Imported private CSV format detection now handles Chrome/Windows numbered Craft Buddy Awin CSV names; other numbered `.csv`/`.csv.gz` files already passed extension checks. Precise extension, >8 MB and empty-file errors. Preserved authenticated owner/admin role checks, joined advertiser registry, explicit selection, per-row merchant validation, unverified rights/private-review status. CI tests and secrets passed. No production feed upload, public offer or image-rights approval claimed. Next #51 and #102. Read current Vercel after subsequent docs releases.

## Current candidate: Awin CSV duplicate filenames · 13 November 2026

Modern `app/api/control-centre/feed-imports/route.ts` already accepts named `.csv` and `.csv.gz` files, but a filename-based Craft Buddy Google-format matcher did not accept Windows duplicate suffixes. Candidate selectively ports PR #58 duplicate suffix normalisation and clearer extension/size/empty upload errors **without** restoring its obsolete filename-derived advertiser trust or AKKO fallback. New unit and source gate tests; existing owner/admin authentication, joined registry selection, row advertiser match and private-only staging unchanged. No external uploads, merchant publication, Awin image rights or source activation. Pending CI, Vercel READY and old PR #58 closure after replacement deployment.

**Awin security fix candidate (13 Nov):** Porting stale PR #50 onto current `main`: unsuccessful Awin feed response error must expose HTTP numeric status only, never the provider body/statusText in logs/UI. Source rights, feed activation, parser, Awin/eBay/tyre business rules remain unchanged. Candidate requires CI, merge, Vercel READY and legacy #50 closure after replacement verification.

# VERIFIED HISTORIC MERGED-BRANCH CLEANUP · 13 November 2026

GitHub actual branch counts: initial 143 branches; first cleanup PR #143 removed 16; historical merged PR #144 removed 103 more, leaving **26 branches**, inclusive of 2 new housekeeping branches and `main`. All 11 open PR heads, original visual references and security refs were preserved. Final PR #145 will try to remove its own 3 matched cleanup refs, after exact merged PR verification; recount for the actual final number. Vercel production after #144 READY at `d70a663d1963d81c4ec6e1f6ac9fd2b22320828d` on `www.avuqo.com`. No merchant feed/image, Supabase, eBay/tyre or customer code changed.

# VERIFIED FIRST BATCH / HISTORICAL CLEANUP CANDIDATE · 13 November 2026

**PR #143 merged and executed:** 16 recent branches from merged PR #127–142 actually disappeared in GitHub, branch count **144 → 128** with current cleanup branch included. Vercel production READY app SHA `557bf52a4e10004fae0f2578bcbb98e7ca7f3610` (project `avuqo`, `www.avuqo.com`). 11 open PRs and original warm-premium source branches remain protected. A **second candidate** workflow checks historical merged PR #1–126, using final frozen PR commit, current SHA, open PR, branch protection and multiple-PR reuse tests before deletion. No second-batch deletion verified yet. Source registry and customer app unchanged.

# GITHUB PRODUCTION-FIRST BRANCH CLEANUP CANDIDATE · 13 November 2026

GitHub branch inventory: 143 original branches, 11 open PRs (all non-mergeable against current `main`), and known 16 merged PR #127–142 heads. Curated action `.github/workflows/verified-merged-branch-cleanup.yml` checks exact frozen merged PR HEAD, branch protected status, and active PR refs before deleting the 16 known safe candidates; intended to trigger only on first merge into `main`. The remaining historical branches require separate provenance/unique-code review. **No deletion has been verified at candidate stage.** See `docs/AVUQO_BRANCH_AUDIT_AND_SAFE_PRUNING_2026-11-13.md` for every branch and safeguards. User requested production-first execution while reducing unneeded branches. No Awin/eBay/tyre or customer data changes.


**Streaming old-homepage flash candidate (13 Nov 2026):** Owner screenshots show generic living-room hero before correct Black Friday homepage. `app/page.tsx` Suspense explicitly rendered obsolete HeroPlaceholder before server data resolved. Replaced only fallback with neutral branded layout pending CI/production. No seasonal date logic, category photos, Awin/eBay/tyre/source rights or auth changes. Verify `www.avuqo.com` exact SHA; actual browser transition signoff pending.


# VERIFIED OWNER HOMEPAGE SCREENSHOT FIXES · 13 November 2026

PR #140 merged; Vercel app SHA `e310af5a6ac49b00a01f7742c8d6a3664ebb5cf5` production READY, `dpl_55ZKhZvcp4JFFVSYqT8a5MMdzm9d`, alias `www.avuqo.com`. Black Friday hero remains, new editorial category-image URLs are in live markup, missing sprite and duplicate seasonal panel removed, owner private-shop hero shortcut removed (owner-only navigation remains). Hero responsive max-width and typography adjusted. **Actual loaded photo visual and post-fix mobile screenshots have not yet been independently inspected.** Existing provider and tyre safeguards unchanged; details in `docs/AVUQO_HOMEPAGE_OWNER_SCREENSHOT_CORRECTIONS_2026-11-13.md`.


**Owner screenshot corrections (13 Nov 2026; pending CI/merge at entry):** Real live desktop screenshots showed broken/blank department photo cards from missing `/branding/avuqo-department-reference-sprite.svg`, duplicate Black Friday hero/spotlight, oversize/edge-aligned hero copy, and prominent owner-only storefront CTA. Fixed department backgrounds to editorial photos, removed second seasonal homepage panel (annual London-time date switch remains in primary hero), constrained responsive hero text/grid, and removed owner-only shortcut from main merchandising (owner role-gated menu remains). No Awin/eBay/tyre/source/auth changes. See `docs/AVUQO_HOMEPAGE_OWNER_SCREENSHOT_CORRECTIONS_2026-11-13.md`. Release checks and owner mobile screenshot QA pending.

# VERIFIED DESKTOP/MOBILE VISUAL QA WORKFLOW RELEASE · 13 November 2026

PR #138 merged, production READY commit `08459b492fa8c9497b94cee933d9fa08dec0f01c`, Vercel `dpl_CJ7yRusAX2fGppGBxy9jydXfHVdZ`, alias `www.avuqo.com`. The live homepage still serves Black Friday. Automated 28-route public Chrome screenshot/audit **workflow added** and scheduled weekly/on-demand; actual execution artifact review remains **unverified**, so graphical approval is not complete. Workflow does not access private Control Centre/preview, credentials or protected supplier data, and no customer UI/integrations changed in this PR. See `docs/AVUQO_PRODUCTION_SCREENSHOT_QA_2026-11-13.md`. Do not confuse Vercel READY with successful screenshot review.


**Real production screenshot-QA workflow candidate (13 Nov 2026):** Following verified PR #136 UK seasonal homepage deployment and 28 public HTTP 200 checks, added a read-only GitHub Actions workflow `production-visual-audit.yml` capturing 28 public URLs on 1440×900 and 390×844 Chrome, HTTP/H1/overflow/broken-image/JS diagnostics, and `report.md`, `report.json`, 56 PNG screenshots in a 14-day artifact. Workflow automatically starts on merge, weekly Monday 08:00 UTC and on demand. Owner-only previews, Control Centre, credentials, Awin/eBay/tyre publishing remain untouched. **No actual visual screenshot artifact has yet been reviewed**, so pixel visual acceptance is still pending. See `docs/AVUQO_PRODUCTION_SCREENSHOT_QA_2026-11-13.md`.
# VERIFIED AUTOMATIC SEASONAL HOMEPAGE RELEASE · 13 November 2026

**LIVE CODE**: PR #136 merged, Vercel READY app commit `da22e97c6fdad31d23e6c972e0a39239e689d8fb`, deployment `dpl_Cj21PogF2EaRPrJ3PfQSv7ySKsmq`, `www.avuqo.com` alias. Current November homepage verified showing **Black Friday at AVUQO**, real seasonal photo and public seasonal link. The same UK civil calendar now changes main hero and editorial spotlight by date without manual updates, supports annually moving Easter, Mothering Sunday, Father's Day and Black Friday, and offers an owner-only two-year view at `/control-centre/seasonal-calendar`. Baseline 28 customer URLs responded HTTP 200 with shared brand markup. No pixel-level screenshot/browser visual QA has been completed. Awin/eBay/tyre approval gates and paid placement controls are unchanged. Follow-up handover docs may change deployment HEAD; read current Vercel.


**UK automatic homepage season calendar candidate (13 Nov 2026, pre-merge):** Existing editorial schedule expanded to year-round London-time switching with dynamically calculated Easter, Mothering Sunday, Father’s Day and Black Friday. Real homepage `/` main photographic hero and CTA switch on each request at the correct local date; existing seasonal editorial spotlight uses the same schedule. New owner-only `/control-centre/seasonal-calendar` lists current theme and rolling current/next-year events, without switching provider offers or publishing marketing. A 28-route baseline authenticated Vercel HTTP inspection returned 200 with AVUQO shared branding; **not a screenshot/browser visual acceptance**. Black Friday text no longer hardcodes 2026. See `docs/AVUQO_AUTOMATIC_UK_SEASONAL_CALENDAR_AND_PAGE_AUDIT_2026-11-13.md`. CI, Vercel production SHA and post-release homepage audit pending.
# VERIFIED SITEWIDE VISUAL RELEASE · 13 November 2026

**LIVE CODE on `www.avuqo.com`**: PR #134 merged and Vercel production READY at app SHA `45da7456b66f6fa21d25753c39e497203f26c7ed` (deployment `dpl_9fAgyrGS1Nz2Fh8Q7nyFjmVpEvG5`). Shared AVUQO warm-premium brand, header/footer, navigation and mobile treatment, real categories, public product list/details, seasonal and travel/lifestyle pages are updated. Approved public image rendering remains behind existing source image-rights verification. No merchant Awin/eBay/tyre public offer release, credentials or source activation. **Still outstanding:** human desktop/mobile screenshot comparison to the full concepts and proof of provider data rights/current prices. See `docs/AVUQO_PRODUCTION_VISUAL_COMPLETION_PASS_2026-11-13.md`. Handover-only releases can move deployment HEAD; recheck Vercel on restart.


**Production sitewide design candidate (13 Nov 2026, not deployed at entry):** New shared warm-premium AVUQO A-lockup, navigation/mobile styling and footer; unified category, verified-public product cards/detail, seasonal and lifestyle presentation. Existing `verifiedOffers` image-rights and price/source gates unchanged. Awin/eBay/tyre source modules and admin were not replaced. See `docs/AVUQO_PRODUCTION_VISUAL_COMPLETION_PASS_2026-11-13.md`. Full automated test, exact Vercel READY deployment and owner visual screenshot acceptance are separate gates.

# CURRENT VERIFIED PRODUCTION STATE · 13 November 2026

**First read:** `AVUQO_START_HERE.md`, `docs/AVUQO_LIVE_HANDOVER.md`, `docs/AVUQO_CURRENT_STATE.json`. The many “candidate/pending” entries below are historical PR-stage notes, **not current production status**.

**Verified 13 Nov:** Vercel project `avuqo` deployment `dpl_9AM8Hx9BPW2uHi9ZbswAQykbTaij`, target production, READY, exact `main` commit `ab055f73acce9a478075c61aecb0b7b248d101d3`, alias `www.avuqo.com`. PRs #129, #130, #131 and #132 **merged and code live**. Real public homepage has restored photographic hero, editorial Compare/Bargains links, category tiles and home shopping dashboard. Other sections remain in further visual restoration. Historical Awin imports/merchant image URLs are **private**, eBay Production Browse approval **unconfirmed**, tyre worker #117 remains open. No provider activation or rights approval inferred. This entry is dated evidence, **not a live telemetry feed**.

**Photographic production homepage hero candidate (13 Nov 2026):** Adapted the original `feature/warm-premium-experience-v1-20261105` photographic storefront hero and evidence-first shopping-intelligence panel into real `app/page.tsx` with photo overlay, desktop/mobile responsive layout, independent evidence wording and direct Compare, Sales and Products links. Existing dashboard, categories and permission-gated public product index unchanged. This code does not import conceptual price tags, score figures or unapproved retailer photos. CI and Vercel production confirmation required before claiming live.

**Full warm-premium storefront restoration candidate (13 Nov 2026):** Recovered the original visual concept PNGs from `design/warm-premium-visual-system-20261105` (some absent from main) and the complete coded homepage on `feature/warm-premium-experience-v1-20261105`. Restored the original department quicklink strip and product-evidence-gated grocery/shopping/tools dashboard onto real `app/page.tsx` without discarding newer production Compare + Bargains sections and source gates. No newly approved offers or merchant photographs. See `docs/AVUQO_FULL_STOREFRONT_RECOVERY_2026-11-13.md`. CI, merged SHA, production deployment and mobile acceptance pending.

**AVUQO live-production partner and visual delivery candidate (13 Nov 2026, pre-merge):** Owner requires the warm-premium supplied mockup look on real `www.avuqo.com` pages, not indefinitely in `/preview`. Added public homepage photo-led Compare vs Discover bargains entry cards linking to real `/marketplace/compare` and `/sales`, backed by editorial imagery rather than fictional supplier goods. Added `docs/AVUQO_LIVE_PRODUCTION_PARTNER_AND_DESIGN_BACKLOG_2026-11-13.md` with visual reference asset paths, provider lead/approval matrix for dropshipping, holidays, golf travel and insurance, sector-specific integration gates and exact production acceptance requirements. Requires final CI, production SHA deployment and visual/mobile owner check. This PR does not onboard providers, activate order taking or release unverified public product offers.

**Awin private display/branch reconciliation candidate (13 Nov 2026):** Owner-only retailer onboarding now includes per-merchant stored image URL counts for all historically recorded joined programmes, alongside 13-Nov Awin CSV inventory reconciliation (74 active feed entries over 12 advertisers, 884 Not Joined rows) and the owner-approved Compare + Bargain Discovery strategy. Product browsing and opt-in image inspections already exist at `/preview/products` on production, gated to owner/admin; all staged prices remain historical, public images and offers remain permission-gated. PR #129 release checks and acceptance remain pending. No source activation or public goods are authorised by this candidate.
# AVUQO living project status

**AVUQO `0.5.1` VERIFIED PRODUCTION RELEASE (13 Nov 2026):** PR #127 merged as `f8c0eb92b740ba010a88ae8b097490241b4aadb6`; Vercel production deployment `dpl_DaokykruBiQBXm7E3SYqF1L2dXfu` READY. GitHub quality (build/lint and eBay/Awin safety suites) and committed-secret prevention passed on final PR head. Live `www.avuqo.com` returned HTTP 200 using the exact production deployment for `/products`, `/categories/tech/products`, `/tyres`, `/preview/ebay`, `/control-centre/retailers` and `/control-centre/feed-imports`. Owner pages do not display private eBay/onboarding content to a signed-out request. Sandbox/Production OAuth routing is now isolated, a separate production …2189 tokens truncated…6 — Tyres V1 design/comparison contract DRAFT:** Established docs/tyres/AVUQO_TYRES_DESIGN_COMPARISON_CONTRACT_V1.md as the fixed AVUQO Tyres visual and multi-retailer comparison architecture. Added pure fail-closed exact tyre variant and comparable delivered/fitted price models with regression tests. Second joined Awin tyre programme Tyres Pneus Online UK (15236/feed 26513) identified but no private import; both tyre programme feed-permission flags remain unconfirmed, Awin paused. Existing Tyres UK 28,990 review rows have unverified size but zero load/speed candidates; cannot publish exact matching/comparison yet. No source activation, migration, public product, price or offer created. Implementation remains an unmerged PR pending CI and review.



**AVUQO `0.3.1` TYRES SHOWROOM PRODUCTION RELEASE (9 Nov 2026):** PR #118 was merged at commit `b15a0209a8d38bb04fd71fd742dcfc3d38b22810`. Vercel production deployment `dpl_Dank3dPU1mk8kudb83BAq3wpAb9R` reported READY, with `www.avuqo.com` and `avuqo.com` assigned to the deployment (apex redirects to www). GitHub quality and secret checks passed for the PR head. The premium public /tyres showroom, original AVUQO tyre illustration, educational /tyres/sizes route, noindex manufacturer/category guides and owner-only preview were deployed. Tyres UK staged records remain private; Awin remains paused; no source rights, historical prices, canonical category approvals, automatic import or public offers were activated. PR #117 automation remains separate and disabled. Vercel returned no tyre-route runtime errors for the inspected hour. **Direct independent phone-browser and signed-in acceptance were not performed and remain open; crawler-based public HTML verification was unavailable.**


**Tyre-specific verified-offer product template (draft):** Existing public `/products/[slug]` now uses a distinct tyre specification and fitment checklist only when an eligible, currently verified commercial offer exists. Safety-related specifications are hidden unless `tyre_specs_verified` is explicitly true in the canonical product record; even then no vehicle compatibility is guaranteed. No feed permission or publication settings changed.

**9 November 2026, draft Tyres showroom and category architecture (NOT production published):** Premium public /tyres landing, tyre-type guides and noindex manufacturer guide routes are prepared with no live supplier offers; owner-only /preview/tyres uses the actual Tyres UK private 28,990 review records for full-catalogue brand browsing, size finder and single-product technical evidence panels. Only source-derived unverified size/load/speed candidates display, no guessed season, run-flat, vehicle match or fitted price. Original catalogue and rights remain unchanged. Public Car tyres taxonomy category is still inactive and no seller-feed images or prices are published. Requires CI, preview/mobile acceptance, technical validation, merchant rights and exact source freshness before a customer-facing commercial catalogue release.


**Awin complete feed-type matrix (4 Nov 2026, pending release):** Existing owner-only `/control-centre/feed-list-audit` now lists all 16 confirmed joined advertiser records, including those with no active product-data feed in a supplied Awin Product Feed List. Classifies actual listed entries into standard/legacy, Google/enhanced, and other/inspect; filters advertisers and format families, flags possible overlapping full-range/category feeds, and copies a safely redacted CSV containing no signed download URLs, Awin API key or affiliate links. User must supply the latest feed inventory or configure the official dedicated product-data credential for server-side metadata checks. This tool **does not download any product files or verify current downloadability**, and Awin/eBay sources remain paused.

**General Awin import safety hardening (4 Nov 2026):** Introduces an explicit preflight inspection of up to 25 real rows before starting any new import, detecting Awin standard vs Google-retail fields and rejecting mismatched advertiser IDs/unsupported formats. Aligns API with the UI's documented TSV/TSV.GZ support, bounds JSON requests, rechecks live joined membership before every resume/chunk/finish, and enforces the original feed ID at PostgreSQL batch write time. Service and contract feeds (mobile tariffs, travel, broadband, certificates and breakdown cover) are stored excluded pending a specialised contract/terms adapter; physical sources remain review candidates. Migration `20261104201000_general_awin_feed_binding_hardening.sql` applied, with no product publishing, no new merchant imports or Awin/eBay source activation.

**Pending general resumable all-Awin feed ingestion (4 November 2026):** New owner-only `/control-centre/general-feed-import` accepts all 16 separately verified joined Awin advertisers, CSV/TSV files (plain or gzip) using strict Awin standard or Google-retail column templates with embedded advertiser ID. Other XML/retailer-specific formats fail closed until a dedicated adapter is reviewed. Data is streamed in 250-row transactions, sequenced and idempotent with source SHA256 file fingerprint, advertiser ID checked in every row, exact feed ID tied to run, and SQL merchant/rights enforcement. Awin tracking verified against publisher 3135746 for row review; price, category, model, EAN/GTIN/MPN and stock held as unverified source fields. Unsupported rows excluded or uploads rejected, no rights/public offers enabled. Existing Tooled-Up specialised importer stays separate. **No new merchant feed has yet been downloaded or imported** and no scheduled product refresh is activated.

**All joined Awin coverage (4 Nov 2026):** The owner-only `/control-centre/awin-programmes` register includes all 16 live observed joined programmes, their private import status, available redacted feed inventory metadata and separately labelled historical feed IDs, including large Tyres, Mozillion and Tooled-Up sources. It explicitly distinguishes private imports, feed-listed-but-not-imported, and unconfirmed feed availability. `joinedInSource` live check does not grant images, affiliate publication or product rights. Existing importer remains 2,500 rows; Tooled-Up 84k uploader is still specifically for advertiser 496, so a **generalised resumable importer** is required before automatic large-feed intake for all other merchants. No new product imports, automatic feed sync, publication or rights changes.

**4 Nov 2026 live-site polish and Awin staging shortlist:** Production route audit confirmed homepage, Shopping, Categories, Gifts, Pets, Technology and Motoring render HTTP 200 with shared live site layout. Narrow-screen screenshot automation was blocked by network policy, so visual viewport assertions remain unverified. Shopping department shelf uses a genuinely compact 4-card layout on homepage and Categories but the full 6-card layout on Shopping, adding editorial Technology and Motoring routes with no unapproved merchant products. Owner-only `/control-centre/feed-imports#next-merchant-feeds` lists verified active Awin feed IDs and counts from the 4 Nov 2026 inventory: Mozillion SIM-free 74135 (224), 1pMobile 81201 (10), Compare Parking 109353 (60), Lyca 116573 (10), Mozillion SIM-only 97136 (33), Petlibro latest hero 119009 (19). Larger Tyres UK 93988 (31,354), Tyres Pneus 26513 (20,034) and Mozillion pay-monthly 97090 (7,729) need large-feed support. No feed downloads, new product imports, credentials or public release were made. eBay developer approval pending.

**Pending eBay UK read-only private pilot and product detail polish (4 Nov 2026):** Adds owner-only `/preview/ebay` search via server-side eBay Browse OAuth client credentials, `EBAY_GB` and item-location country GB. All data is genuine API-only and returned only to owner; no DB ingestion or public offer. Optionally recognises EPN campaign ID for presence diagnostics, but never exposes affiliate checkout URLs or publishes eBay images. Private product detail now checks completed import status, shows source import date, flags manufacturer as unverified and degrades broken image links. eBay app keys and EPN campaign are NOT configured/verified, source remains paused. No automatic eBay sync or release authorization.

**Live-site shopping layout integration (4 November 2026, pending checks):** Insert AVUQO warm editorial shopping department cards into the real homepage, /shopping and /categories using the existing LifestyleLanding flow and the current brand palette, type, shapes and mobile breakpoints. Departments use only existing public editorial destinations, not unapproved merchant listings. Verified owner/admin accounts see additional links to private Tooled-Up, Cadbury, Petlibro and Craft Buddy product staging. Private `/preview/storefront` styling and wording aligned with established AVUQO lifestyle look. No staged retailer product data or photography is made public. Customer-facing product links remain gated pending current prices, verified permissions, and approved offer releases.

**Pending responsive owner-only storefront rehearsal (4 Nov 2026):** `/preview/storefront` connects a homepage-style private browsing journey to completed merchant imports for Tooled-Up (Awin 496), Cadbury (736), Petlibro (77952), and Craft Buddy (45747). Visible only after verified owner/admin role, noindex, no public product release. Owner-only homepage CTA and Categories menu shortcut; department links to private actual product records and individual category-adaptive product evidence. Tooled-Up detail pages now inspect source category path, unverified retailer brand, EAN, GTIN, MPN and historic availability where recorded. Desktop, tablet and narrow-screen responsive styles added to storefront, Tooled-Up catalogue/cards and individual product detail. No production customer product listings, automatic feed downloads, permission status or Awin/eBay source activation.

**Pending opt-in Awin metadata monitor (Nov 4, 2026):** Owner-only feed-update dashboard plus disabled-by-default daily Vercel cron, checking official Awin Product Feed List for last-imported changes among joined advertisers. Credentials remain server-only, signed URLs never stored, source stays paused. No automatic product feed downloads, retailer image rights or public offer releases. New migration required.

**Tooled-Up private full-catalogue discovery (pending 4 Nov 2026):** Owner-only server-side search across 84,284 records, 313 brands and 32 departments, exact retailer category paths, EAN and source model fields, historical price sort, 48-row paging and private opt-in host-restricted image inspection. RLS-preserving SQL functions applied and tested. No public offers or automatic feeds.

**Tooled-Up owner-only image visibility fix (pending, 4 Nov 2026):** Tooled-Up's 84,284 private records have image URLs hosted at `www.tooled-up.com`. The exact HTTPS host is added to opt-in private card/detail photo inspection only. The 100-page private preview cap is expanded so all 84,284 rows can be browsed in 48-item server-side pages. This does not permit public images or checkout, verify image URLs are reachable, or change source/offer rights.\n
**Pending private Tooled-Up large-feed importer (4 Nov 2026):** Owner-only streaming browser importer at `/control-centre/large-feed-import` for advertiser 496, feed 89987. Validates 250-row chunks, matches per-row advertiser and Awin publisher IDs, stores retailer `brand_name` (not independently verified legal manufacturer), brand ID, model, EAN, GTIN, MPN, source categories, stock and source images as private unverified references. Transactional Postgres chunk receipts and a compressed-file SHA256 make 84,284-row imports resumable without duplicate chunks. Rows stay under `importing` status until final private review. Requires new `supabase/migrations/20261104171000_large_feed_private_import.sql` before use. This is a MANUAL source-file import, not automatic Awin downloading; Tooled-Up underlying `awinnew` file identity, credentials and publication/image rights are not verified. All source sync controls remain paused.

**Pending owner-only category product detail views (4 Nov 2026):** `/preview/products/[id]` uses authentic staged records and category-specific evidence checklists for gifts, pet, crafts, computing and future tyres. Private image opt-in only; all historical prices are labelled, missing specifications remain unverified, retailer checkout remains disabled. No public product rights or feed activation inferred.

**Pending private Awin inventory review (4 Nov 2026):** Owner-only `datafeeds.csv` inspector lists active feed IDs, counts and source update timestamps for currently joined Awin advertisers, never returning or persisting signed download URLs. The owner's 952-entry list has 72 `active` feed entries across 11 joined advertisers. Tooled-Up's new daily feed rule requires the underlying filename to begin `awinnew`; Awin display names alone are insufficient. No automatic feed fetching, rights release or product publication activated.

**Proposed owner-only customer storefront rehearsal (PR #52, not deployed):** `/preview/products` reuses customer catalogue styling and read-only staged feed rows while requiring Control Centre owner/admin authorisation. It hides merchant images, labels staged prices as historical, disables buying links, and does not publish offers or enable scheduled Awin ingestion. Browser, mobile and role-denial acceptance remain open. Current software version stays `0.3.0`.

**Proposed premium storefront browsing (PR pending, not deployed):** Owner-only `/preview/products` has provisional department suggestions, search, retailer filters, sorting and private comparison for existing staged records. Merchant feed category gaps remain 578/1,371 Cadbury, 98/98 Petlibro and 162/1,299 Craft Buddy; no canonical category assignments, licence verification, feed automation or public offers are changed. Current application version remains `0.3.0`.

**Unreleased private catalogue pagination (PR pending, 4 Nov 2026):** Owner-only preview gains 48-item paginated browsing per imported merchant using private staging data; the general highlights mode remains a sample. Tyres UK (12715) and Tyres Pneus Online UK (15236) appear only as feed-pending onboarding notices with no invented products. Image URLs are present in historical staged imports but are not rendered absent confirmed rights. No public offers or live feed sync enabled.

**Proposed private image review + import classification (PR pending, 4 November 2026):** The signed-in owner can opt to display images referenced by the existing permitted-format feed uploads from allowlisted HTTPS hosts (`cdn.shopify.com`, `www.cadburygiftsdirect.co.uk`). Image loading is off by default and is not public publication approval. New manually uploaded feed rows preserve the advertiser category and record a provisional department and `needs_review` status for unknown items in private metadata. No canonical category ID, merchant licence, public offer, feed schedule or advertiser activation is inferred. All 16 joined Awin advertisers remain registered as paused onboarding entries. Existing historical imported records are not rewritten by this proposal.

**Proposed multi-advertiser private Awin CSV intake (4 Nov 2026):** Owner explicitly selects one of 16 observed joined Awin IDs and uploads a matching product feed. Server verifies exact current joined registry status and exact advertiser ID on every row; stores unverified private records only. Awin source remains paused. This is not a live provider feed connection or publisher licence. [Connector comparison and eBay Browse API research](./UNIVERSAL_CONNECTOR_NEXT_PILOT_2026-11-04.md). Pending PR review and acceptance.

**Purpose:** The single GitHub starting point for AVUQO project work across chats, contributors and tools. GitHub `main` is the authority for deployed code. Private business data and API credentials never go here.

**Awin 16-programme intake, 4 Nov 2026:** User-reported signed-in v0.3.1 Preview diagnostic returned 16 joined programme IDs including Cadbury `736`, Petlibro `77952` and Craft Buddy `45747`. All 16 registered in the private, **paused and unapproved** Awin source; no provider approvals, rights expiry or publication added. Supabase still shows 0 Awin sync runs, 0 Awin offer releases and 0 public Awin offers. See [programme queue](./AWIN_JOINED_PROGRAMMES_2026-11-04.md). PR #48 diagnostic remains a draft pending signed-out/non-admin acceptance. The existing single-advertiser connector does **not** simultaneously support 16 feeds.

**Latest verified Awin onboarding (4 November 2026):** v0.3.0 owner-release code deployed READY; PR #45 SQL terminator fix merged at `18752f41287f30f82ba679c170e61b685520765e` and release migration applied. Cadbury (`736`, 1,371 private rows) and Petlibro (`77952`, 98 private rows) are **registered as unapproved, paused drafts**. Awin sync is disabled, zero public Awin offers. The connector currently uses one `AWIN_ADVERTISER_ID` at a time. [Pilot register](./AWIN_CADBURY_PETLIBRO_PILOTS_2026-11-04.md). Do not infer rights from the archived feeds or available token.

**Proposed customer safety patch: `0.2.3` on the P0-03 feature branch (not yet deployed).**

**Current software version: `0.2.2` (P0-02, PR #40 merged at `f7dc24ccf0e3b3101570419d43b7d9b647707361`, Vercel production READY).**

**Previous software version on `main`:** `0.2.1` (PR #38 merged at `f81b34f99bf5f95e59aa18efa877ce0292996d7c`; Vercel production READY). Previous version: `0.2.0`. (PR #34 merged 2 November 2026); feature release READY at `18fe575458588be511ffc5762152eccee4798a53` (PR #35); documentation audit PR #36 subsequently deployed READY at `7563e14fb76d02621cdbafac6a2b8ab58311aea0`. Latest SHA must be rechecked in Vercel. Signed-in customer journey acceptance still pending.
**Previous software version:** `0.1.0`, commit `17a73a6fc20ecad2c892d45f2e2c95b82a6087ef`. The old `0.8` handover labels are historical product-plan labels, not the package's software version.
**Release status:** v0.2.0 compiled and deployed READY, but end-to-end signed-in validation of wishlist, basket, named copy and email-app draft is still outstanding. Do not claim these user journeys are fully verified.
**Source of truth:** [Original product specifications](./AVUQO_2026-10-30_SPEC_INTEGRATION_REGISTER.md), then current implementation in GitHub, then real database and production evidence. Claims need checks.

## Latest spec-to-code audit, 2 November 2026

- **Full source traceability and measured maturity:** [SOURCE_TO_CODE_AUDIT_2026-11-02.md](./SOURCE_TO_CODE_AUDIT_2026-11-02.md). Covers the 2 original master PDFs, affiliate/analytics/CMS plans, unified source of truth, 2 handovers, an uploaded brand image, GitHub code, current PRs and read-only Supabase.
- **Original-source provenance:** [SOURCE_MANIFEST_2026-11-02.md](./SOURCE_MANIFEST_2026-11-02.md) indexes all 9 uploaded originals by SHA-256 and authority; [SOURCE_REQUIREMENT_GAPS_2026-11-02.md](./SOURCE_REQUIREMENT_GAPS_2026-11-02.md) adds 12 finer-grained checks.
- **Prioritised living execution plan:** [ROADMAP.md](./ROADMAP.md). IDs P0-01 through P4-05 (including new P1-07, P2-06, P3-06 and P4-05), dependencies and release/acceptance gates. Feature maturity M0–M4 is an evidence rubric, **not percentage completion**.
- **Checked baseline:** `main` commit `18fe575458588be511ffc5762152eccee4798a53`, version `0.2.0`, Vercel production READY. New roadmap-only work does not bump the app version.
- **DB audit:** 1,384 categories (8 active), 4,588 **private unapproved** Awin import records in 5 runs (AKKO duplicated), 12 product identities (4 active), 6 offers/published deals **all from internal demo**, 0 grocery price records, 0 analytics events, 0 affiliate conversions and 7 historical click events. These are records, **not live verified retail coverage or earnings**.
- **Immediate safety review:** `analytics_events` and `click_events` have anonymous INSERT policies that need effective-grant, consent and provenance tests. Awin source is marked active/sync-on but credentials are not configured and permissions are not recorded; retain server-side publication gates and review fail-closed operations.
- **Open drafts:** #21 customer Saved/Watches fixes and #25 universal taxonomy. Their work must be reconciled onto current `main` before merging, not blindly replayed.
- **Source-specific omissions made explicit:** true natural-language search, transparent Preference Graph, timed Seasonal Calendar Engine and optional native/push experience remain separate requirements, not assumed delivered by related pages. Browser-saved affiliate prices are snapshots, not trusted server-verified prices.
- **Acceptance still outstanding:** real signed-in Wishlist/Basket/Lists journey, negative cross-account access tests, live authorised merchant data, privacy/consent, and actual revenue/social provider reconciliation.

## P0-01 event integrity implementation (release candidate)

The database audit verified anonymous and signed-in INSERT grants on both `analytics_events` and `click_events`. PR implementation removes the existing unauthenticated/client write surface and pauses new merchant click recording while retaining verified redirects. The matching SQL migration was applied on 2 November 2026 under Supabase migration `20261102162756_p0_01_event_write_integrity`; effective `anon`/`authenticated` event INSERT grants are now false, the old INSERT policies are absent, service_role INSERT is preserved, and historical seven click rows remain. **Status: deployed and database permissions verified; direct REST denial and eligible-merchant browser smoke tests still outstanding.** Details: [P0-01 runbook](./P0_01_EVENT_INTEGRITY_RUNBOOK.md). Existing seven historical click rows are not certified conversions and must not be deleted by this release.

## P0-02 Awin source-rights safety (release candidate)

Current source registry misleadingly marks Awin active/sync enabled despite unconfigured credentials and missing source/advertiser usage, feed and image rights. Five private Awin imports contain 4,588 staged rows (including duplicate AKKO), all unverified; Awin live pipeline runs = 0. This release candidate requires exact advertiser-specific evidence, current territory/expiry, fail-closed source controls, and emergency-stop rechecks. The owner UI no longer invites unapproved Awin runs. The conditional Supabase migration `20261102170256_p0_02_pause_unapproved_awin` was applied successfully after the code deployed. Verified Awin `paused`, `sync_enabled=false`, no successful Awin sync, 4,588 staged records retained, five unverified import runs and zero published Awin offers. External advertiser permissions and real live-data acceptance remain outstanding. **No feed or public listing has been activated.** [Operator rollout and checks](./P0_02_AWIN_SOURCE_GATE_RUNBOOK.md).

## Awin advertiser onboarding and per-offer publishing (v0.3.0 candidate)

The owner release SQL function terminator was corrected in follow-up PR #45 before migration. Runtime code was deployed in PR #44, but the live database remains unchanged until the corrected reviewed migration is applied and verified. No advertiser has been activated.

**Release candidate version:** `0.3.0` (not deployed, pending CI and migration).

An owner-only Awin advertiser workflow is prepared in `/control-centre/awin-advertisers`. It records private programme drafts and owner permission references, tests a small feed response without writing products, runs the existing ingestion pipeline only after rights and credential checks, reviews a fresh priced offer and releases or pauses **one offer at a time** with an independent private approval record and audit. The Awin pipeline is now held-first; public admission requires exact approval/price/timestamp/Score consistency. Matching SQL: `20261104112500_awin_offer_owner_release.sql`. **Candidate only until CI, deployed code SHA, migration and provider evidence/acceptance are verified.** No real Awin advertiser has been authorised or published, and the existing 4,588 staged rows remain private. Details: [Awin release runbook](./AWIN_ADVERTISER_ONBOARDING_RELEASE.md).

## P0-03 private customer collections (release candidate)

Existing personal Wishlist/Basket operations stored browser-provided prices and merchants without trusted server verification. The v0.2.3 candidate moves creation and named basket copying to authenticated server endpoints, validates current rights-approved offers, introduces unique list/item keys and adds restrictive owner-only RLS for planning collections. The migration is **not yet applied**; normal Saved/Watches/collaborative list routes are preserved. Customer data count was zero at audit. Full two-account, mobile email-app and approved-merchant acceptance is still pending. [P0-03 checklist](./P0_03_COLLECTIONS_ACCEPTANCE.md).

## Feature delivery ledger

| Feature | Status at audit | Next gate |
|---|---|---|
| Existing AVUQO public website, categories and product preview work | Merged on `main`; production READY at prior audit | Continue production smoke checks |
| Awin product imports (Craft Buddy, Cadbury, Petlibro, AKKO) | Private staged records only | Merchant-by-merchant rights, deduplication and release approval |
| Affiliate expansion for eight networks | Private preparation merged in PR #33 | Apply, verify credentials/rights and build separate adapters |
| Affiliate promotion approval guard | Merged in PR #20 | Review underlying database authorization and role denial tests |
| Saved / Watches / legacy routes | Basic features in `main`; PR #21 holds proposed fixes | Consolidate fixes and test customer journeys; no live alerts assumed |
| Universal taxonomy and Control Centre explorer | Draft PR #25, not merged; inactive seed already staged historically | Reconcile old navigation against current `main`; no blind re-seeding |
| Personal wishlist | Merged PR #34; deployment READY, user acceptance pending | Signed-in RLS acceptance, product verification and production smoke test |
| One account basket of eligible merchant offers | Merged PR #34; deployment READY, user acceptance pending | Verify offer persistence, duplicate handling and expiry messaging |
| Save basket as one named list | Merged PR #34; deployment READY, user acceptance pending | Account ownership and RLS tests |
| Email basket | Merged PR #34: email-app draft UI, not automated sending | Test desktop/mobile email clients; automated delivery is NOT implemented |
| Verified multi-network price comparisons | Not live for unapproved feeds | Permissioned offers, price freshness, exact matching |
| First-party analytics / commission reconciliation | Partial framework; not a confirmed end-to-end revenue system | Consent, security, real attribution and settlement evidence |

## Release protocol (every feature PR)

1. Read this register, `CHANGELOG.md`, `package.json` and linked master specifications before editing.
2. Use a feature branch; do not overwrite other unmerged work, and do not merge older stacked PRs blindly.
3. Update the ledger, add a human-readable `CHANGELOG.md` entry and bump the **one software version** in `package.json` and root `package-lock.json` if the PR releases customer-facing functionality.
4. Add negative/permissions tests. Run clean lint, build, tests and preview. Do not enable unlicensed sources, automated messages or synthetic products.
5. Merge reviewed work. Confirm production SHA and URL/alias, account permissions and visual functionality.
6. Change feature status to **Live and verified** only after real verification. Never write a speculative main SHA in this file: Git tags and GitHub commits provide exact current history.

## How future chats should use this

Read `AGENTS.md`, this status page and `CHANGELOG.md` from `crkian/AVUQO` using the connected GitHub tool each time work begins. Project attachments are historical snapshots, not automatically up-to-date. **A GitHub file is not automatically injected into every chat**; a new chat must explicitly retrieve it or have an integration that does so.

## Safety

- One independent AVUQO Score; affiliate commission cannot alter rankings.
- Only permissioned fresh offers can appear in product pages, wishlists' new-item actions or basket additions.
- Basket totals are **snapshots**, not live purchase quotes; final price and checkout remain at the retailer.
- No stored customer email addresses or third-party email sent without a deliberate service design and consent.


### 2026-11-13 Public live-first whole-site tour (candidate, not released)
- Add public `/explore-avuqo` route, grouped links for shopping, deals, groceries, tyres, travel and personal tools, and a visible homepage entry point. Include tour in sitemap.
- Explicitly label verification constraints and sign-in requirements; no fake prices, supplier imagery, approvals, automated alerts or merchant claims. No private Control Centre access is surfaced.
- Release only after CI, preview and exact SHA production Vercel READY, then verify `/explore-avuqo` HTTP 200 and responsive behavior. This does not activate marketing/affiliate automation.


### 2026-11-13 Verified live-first full-site tour release
- PR #159 merged to main at `58355149ef69e82924a00c6866b0859a7483234a`; Vercel READY `dpl_GVkTsnRpkWTc2p79DwUXD4EvhUEX`, `www.avuqo.com` / `avuqo.com` aliases.
- Real `https://www.avuqo.com/explore-avuqo` status 200, expected heading, matching deployment ID. Homepage and sitemap also status 200, both link the tour. CI build/lint/security passed; screenshot visual acceptance remains pending.
- No supplier rights, product price, database, marketing automation or Control Centre authentication changes. Continue live-first customer design and private automation separately.
