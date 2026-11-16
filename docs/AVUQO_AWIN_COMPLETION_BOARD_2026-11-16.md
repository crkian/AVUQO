## 16 Nov 2026 · Owner-run-now deployment proof, original index reconciliation

[PR #216](https://github.com/crkian/AVUQO/pull/216) merged; production `dpl_E5cbjLHeTA1s6CHPmtJu2UFvjeuh` READY at `d977cfa3a01265b1401235c728c089da377a256d`, homepage HTTP 200 and Control Centre Awin feed monitor route HTTP 200 with exact deployment. The owner-only POST route `/api/control-centre/awin-run-now` returned 405 to an unauthenticated **GET**, as expected for POST; this is **not** signed-in POST or feed verification. Four small existing pilots support preflight then confirmed **private** stage; Tooled Up supports immutable capture then validate. No actual owner action or live supplier preflight was performed, and no public offers were released. Awin source remains paused.

The original 14 Nov [master idea index](AVUQO_COMPLETE_GIT_BRANCH_IDEA_HANDOVER_INDEX_2026-11-14.md) also tracks 29 original platform workstreams, 12 fine-grained gaps, eBay, social, mobile, groceries and all original design references; the Awin work here is one implementation track, not the whole product. See the [crosswalk](AVUQO_GIT_BRANCH_SOURCE_FEATURE_TRACKER_2026-11-16.md).

## 16 Nov 2026 · Owner-run current Awin preflight/private stage and Tooled Up master, proposed PR

Added owner-only `POST /api/control-centre/awin-run-now` with strict auth role and Origin, fixed supplier pair allowlist, private-write confirmation, server-only `CRON_SECRET` and no arbitrary URL/digest. It reuses current workers for Petlibro, Mozillion, Cadbury and Craft Buddy preflight/private staging and Tooled Up immutable snapshot/validation in-process. Extended private `/control-centre/awin-feed-updates` with owner buttons and service-role-read scheduled job journal after role checks. Manual operations are **not** logged as scheduled cron attempts. No source activation, rights override, customer-facing prices or offers. Require CI/preview and an actual signed-in owner click before claiming any current feed was tested. After current successful private import, release one genuinely eligible offered item with seller/rights/freshness audit and automatic withdrawal, not all historic rows.

# AVUQO Awin · Completion board · 16 November 2026

**Goal:** publish each truly eligible retailer offer from a fresh, authorised feed and update/withdraw it automatically. Not "turn on all historical supplier rows". The owner has approved AVUQO's use of current joined suppliers; supplier and third-party media/price/trademark rights still require evidence per merchant. The Awin source is `paused`, `sync_enabled=false`, `publication_permission=pending`; `source_ingestion=true`, emergency stop OFF, public Awin offers **0** as of this audit.

## Existing actual automation

| Merchant | Exact feed | Scheduled private source | Evidence | Need to finish |
|---|---|---|---|---|
| Petlibro | 77952:103580 | 07:05 import, 07:27 reconcile | 44 private source rows, 22 exact SKU pairs/draft identities (5 Nov); no fresh 16 Nov import | Current full price, availability and item timestamp, membership-ID discrepancy 77952 vs 77942 in correspondence, per-media rights and reviewed offer release |
| Mozillion | 31539:74135 | 07:09 import, 07:37 reconcile | 229 private handset drafts/records (14 Nov); 166 Brand New, 63 Good as New | Current price by handset grade, tracking, commerce terms and publishing rights; no contracts/eSIMs represented as physical handsets |
| Cadbury Gifts Direct | 736:48599 | 07:13 import, 07:47 reconcile | 16 Nov inventory lists ~1,371; latest private import historical manual 4 Nov | First validated modern AUTO import, tracking/GBP, stock, sale-category commission exclusion, rights |
| Craft Buddy Shop | 45747:F1356 | 07:17 Google feed import, 07:57 reconcile | 16 Nov inventory lists ~1,308; latest manual Oct 28 has 66 excluded | First validated modern AUTO import, preserve excluded, licensed third-party character art and promo-code rules |
| Tooled Up | 496:89987 | 08:05 snapshot, 08:25 full validator | 16 Nov inventory lists ~84,256; historical 4 Nov manually held 84,284. Existing 29-column master/250-row importer ALREADY BUILT. | First immutable SHA snapshot + exhaustive validation, missing explicit GBP evidence, wire existing resumable staging, master/brand duplicate SKU handling |
| Tyres UK / Pneus | 12715:93988 and separate partner | 08:41 Pneus private | Tyres UK 31,372 private rows historically, 28,990 review and 2,382 excluded | Fitment/stock/total fitted price, owner-reviewed tyre lease PR #158, leave unsafe #117 dormant |

## Next accountable actions

- **A01 (diagnostics):** after 17 Nov 07:05–07:17, inspect `public.awin_private_cron_attempts` for each of four pilot job keys: `started/completed/disabled/rejected/exception`, HTTP and safe outcome. Correlate exact `feed_import_runs` and import session/digest. If journal empty, inspect Vercel invocation/auth/route. Avoid assuming a new import should exist if digest is unchanged and response is `already_staged`.
- **A02 (Tooled Up):** after 17 Nov 08:05/08:25 verify storage under `awin/496/89987`, source SHA, gzip row count/duplicate/price/affiliate check and validator journal. Code only reached production after 08:25 on 16 Nov, so missing 16 Nov snapshot is **not** evidence of a failure.
- **A03 (private bulk):** when Tooled Up full-file validity and independently documented GBP evidence pass, connect its already-existing 250-row resumable importer to scheduled/private jobs. Do not replace it with another importer or import partial 84k data by raising Vercel RAM unboundedly.
- **A04 (first public item):** promote a single known supplier item with exact merchant and seller rights, current GBP price, stock, condition, compliant tracked link, permitted image or image-free presentation and correct merchant commission class. Verify signed-out public 200/404 boundaries, click and on/off controls; keep separate from source-wide flag.
- **A05 (autopilot):** after first real saleable item, roll release across eligible SKUs and merchants with idempotency, new feed digest, SKU/variant/GTIN isolation, observed price, stale/unavailable offer withdrawal and failure alerts. Confirm true absence of historical price data rather than inventing a discount.
- **A06 (runbook & tracker):** every attempted job, error and published offer must update active Git tracker/handover and changelog. The private cron journal records runtime outcomes, but Git tracks decisions and actual released code.

## Merchant licensing / commission caution

Attached owner-provided terms dated Petlibro 11 Apr 2024, Mozillion 25 Jul 2022, Cadbury 16 Jan 2023, Craft Buddy 2 Mar 2023 and Tooled Up 14 Apr 2023 were opened for this audit. They contain paid-search/brand restrictions; Cadbury terms expressly exclude the sale category from commission. Craft Buddy carries third-party character artworks and brand restrictions in additional terms. These documents and user-provided joined programme screenshots are useful evidence, but current affiliate account Commission Groups, territory, asset reuse/retention and programme validity may differ. Do not backfill rights flags to `true` merely because the owner approves website publication. Store rights evidence references separately from media bytes.

## Current blockers, not claims of completion

Six-job private attempt journal installed via PR #213, zero attempts at latest 16 Nov read. Public Awin offers zero. Owner-only Petlibro manual preflight and stage route exists; equivalent user-friendly controls for other merchants and current Tooled Up snapshot are a product gap. The on-site Control Centre remains a source/diagnostic tool, not proof of live offer publication. All next supplier activation must be verified against fresh Supabase and Vercel state; today's counts are dated.
