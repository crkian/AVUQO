# AVUQO · COMPLETE ACCEPTED AWIN PORTFOLIO + LIVE DATA HANDOVER

**Observed and owner-attested 17 November 2026, Europe/London.** Replaces repeated generic permission requests. Covers **all 19 accepted programmes**, not merely six physical retailers.

## One-minute operational handover: WHAT / WHERE / WHEN / DONE / NEXT

**WHAT:** The owner has repeatedly confirmed that all previously joined programmes shown in authenticated Awin screenshots and owner documents were **accepted**. This is now recorded per programme as `public.affiliate_programs.metadata.owner_joined_accepted_attestation` and portfolio-wide as `public.sources.metadata.owner_portfolio_membership_attestation`. There are 19 accepted entries, 17 advertiser IDs and two accepted programmes with unknown numeric IDs. The older `public.sources.metadata.awin_advertisers` has only 16 entries and is NOT the membership source of truth. `affiliate_programs.status='pending'` describes internal publication workflow, NOT rejected Awin membership. Do not ask user to reprove general acceptance.

**WHERE:** Supabase project `tfoukwcruaamrtgxzshh`; `public.affiliate_programs` for accepted identity, evidence refs, merchant-specific restrictions; `public.sources` for source-wide activation and operational permissions; `public.awin_feed_update_observations` for current feed inventory; `public.feed_import_runs` and `public.feed_import_records` for private historical rows; `public.awin_private_cron_attempts`, `public.awin_private_snapshot_validations` for actual outcomes; `public.offers`, `public.deal_scores`, `public.awin_offer_release_reviews` and `public.published_deals` for public offer admission. Owner-only page `/control-centre/awin-feed-updates` now reads `affiliate_programs` and cross-references feed inventory/source registry without adding a duplicate endpoint.

**WHEN:** 17 Nov 2026 source inventory at 06:17:46 UTC; same-day private jobs at 07:05–08:25 UTC; owner acceptance attested 17 Nov 2026. Check actual runtime for newer records. Do not restamp historical prices.

**DONE:** Membership evidence reconciled for 19 via Supabase; owner page renders canonical accepted portfolio with missing joins, observed feeds and next data action. Existing parser, private tyre adapters, stale suppression, price/stock renewal and scheduled protected jobs remain. Added `lib/awin/portfolio-evidence.ts`, existing page integration and test. Direct `main`, NO BRANCHES OR PRs.

**NOW:** Global Awin source paused, sync=false, credential_status not_configured; 0 public Awin offers and 0 owner offer releases at the last verified DB check. Acceptance does not automatically turn stale historical rows into newly verified sellable offers. This is a technical launch state, NOT an unaccepted programme.

**NEXT IN ORDER:** (1) reconcile 3 membership records absent from 16-entry source roster and 2 missing IDs, while keeping the canonical acceptance source; (2) fix active private feed download/validation, particularly Cadbury 422 and Craft Buddy 502, and refresh Tyres UK/Pneus and Petlibro; (3) validate actual timestamped GBP price, stock, affiliate destination, advertiser identity, product identifiers, usage rules, and delivered/fitted price basis where applicable; (4) create offer+score via the existing publisher pipeline; (5) first controlled owner release of 3–10 genuinely verified SKUs; (6) verify customer page, click tracking, auto-refresh and withdrawal. Do not pretend metadata inventory is a price refresh.

## All accepted programmes and their current next live-data action

| Accepted programme | Awin advertiser ID | Live-data route and next action |
|---|---|---|
| 1pMobile | 37738 | Mobile PAYG/SIM; confirm whole-term plan prices and allowances |
| AutoAid Breakdown | 36276 | Breakdown service; referral and coverage/renewal data rather than invented retail SKU |
| BroadbandCoop & MobileCoop | ID unverified | Accepted in owner screenshots; map numeric Awin ID, obtain contract prices |
| Cadbury Gifts Direct | 736 | Feed 48599, 1,372 listed today; private scheduled 422 feed_validation; restrictions on Sale commission and brand PPC |
| Chattr Sim Only | 115559 | SIM contracts: full-term cost, allowance and eligibility |
| Christmas Letters from Santa | 35299 | Seasonal personalised service; live dated price and permissible referral |
| Compare Parking Prices UK | 118401 | Date/location-specific parking quotes, CSS account restrictions |
| Craft Buddy Shop | 45747 | Google F1356, 1,318 listed today; scheduled 502 download; third-party character/brand image restrictions |
| EPCs, Gas Safety Certificates and Electrical Check | 25022 | Service quotes; regional eligibility and total service fees |
| Holiday Extras | 3496 | Travel booking links and dated prices; IAR requirement before insurance links |
| Lyca Mobile UK | 128157 | Mobile plans with contract and recurring-price disclosure |
| Mozillion | 31539 | Feed 74135, 229 private rows latest 14 Nov; confirm exact handset condition, current stock and tracking |
| Onestream | 23296 | Broadband full-term contract quote/fees/mid-term rises |
| Petlibro UK Affiliate Program | 77952 | Feed 103580, 44 listed today, 44 private rows, 22 drafts; written merchant reply; reconcile reply-footer 77942 vs feed 77952; refresh prices |
| PlayPress Toys UK | 101445 | Feed 96428 plus Google F5142, 81 historical listed; inspect fresh schema, tracking and creatives |
| Tooled Up | 496 | Feed 89987, 84,240 verified snapshot rows today, structurally clean; price/stock evidence, source filename convention, rights/image scope |
| Tyres Pneus Online UK | 15236 | Feed 26513, 19,862 listed today; private Cron exists but requires approved-source binding; identify size, GBP and fitted/delivered totals |
| Tyres UK | 12715 | Feed 93988, 31,020 listed today; 31,372 historical private rows; tyre-size/brand/condition/total and fitting semantics |
| Your Co-op Energy | ID unverified | Accepted owner screenshot; map numeric advertiser ID; tariff/eligibility or referral |

## Endpoint and proof-consumer audit: distinguish specialised routes, avoid duplicate systems

| Existing code path | Purpose / status | Evidence it reads and what it does NOT prove |
|---|---|---|
| `app/api/internal/awin-feed-check/route.ts` | 06:17 daily metadata-only signed feed inventory | Older `sources.metadata.awin_advertisers` observed joined list. No product price, stock or public release. |
| `app/api/internal/awin-auto-import/route.ts` | Existing private CSV/Google physical feed worker for four allowlisted feed pairs | Older `joinedInSource` registry and active signed feed list; stages private rows, never public offers. Cadbury 422, Craft Buddy 502 last logged. |
| `app/api/internal/awin-pilot-schedule/[pilot]/route.ts` | Four scheduled per-pilot private invocations of same importer | Scheduler, not second implementation of parser. Check Cron journal for outcome. |
| `app/api/internal/awin-pneus-private-import/route.ts` | Pneus 15236/26513 bespoke resumable private bulk job | Uses `pneusPrivateSourceGate`, requiring old source-specific feed_permission and evidence; doesn't see canonical acceptance by itself; 19,862 LISTED is not staged. |
| `lib/awin/tyres-uk-private-adapter.ts` | Tyres UK 12715/93988 private tyre size/GBP/technical candidate mapping | Validates tyre-specific data, not fitted-price certainty or public permission. Preserve this adapter. |
| `app/api/internal/awin-tooled-up-snapshot` and `awin-tooled-up-daily-validation` | Tooled Up snapshot + full structural validation | 84,240 rows passed structural checks 17 Nov; rights/currency verification flags were false and ready_to_stage=false. |
| `lib/pipeline/source-readiness.ts` | Existing external Awin ingestion rights gate | Reads **sources.metadata** `usage_rights_confirmed`, `feed_permission_confirmed`, refs, GB territory and expiry plus exact old Awin advertiser approval. Does NOT query `affiliate_programs`. Must not equate blank expiry with verified rights; consider integrating canonical accepted proof in future without bypassing release checks. |
| `app/api/internal/awin-approved-refresh/route.ts` | 09:16 daily bounded 25-row Enhanced Awin connector, not a multi-CSV publisher importer | Requires active source, credentials and source evidence. Dormant while source paused. No first release. |
| `lib/products/public-catalog.ts` | Final customer-facing offer admission | Requires active source, verified price evidence, fresh GBP stock, score, `awin_offer_release_reviews` owner first-release and tracking. Old single `AWIN_ADVERTISER_ID` binding limits multi-advertiser scaling. No metadata-only evidence may bypass. |
| `app/control-centre/awin-feed-updates/page.tsx` | Existing owner feed monitor and joined acceptance view | NOW reads `affiliate_programs` source of truth plus feed observations and flags differences, with NO new external API route. |

**Important architectural decision:** There are multiple legitimate routes because feed formats, private staging, cron scheduling, tyre fitting semantics, Enhanced API and public admission are DIFFERENT tasks. Avoid creating another broad Awin importer or another membership table. Make `affiliate_programs` canonical for membership; do NOT copy blanket accepted status into public price verification or owner product-release flags.

## Evidence handling and known special rules

Evidence reference system: `affiliate_programs.metadata.evidence_refs` includes Gmail thread IDs, uploaded programme-term PDF hashes, authenticated Awin account screenshot hashes, and repository policy docs. Do not commit signed feed URLs or private correspondence. Petlibro's direct 5 Nov email permits source GBP price, descriptions, stock, affiliate links, photos and banners, but reply signature says ID 77942 while joined feed says 77952. Document and resolve the identity discrepancy while preserving the owner acceptance attestation. Cadbury Sale-category products are non-commissionable, and branded PPC prohibited. Craft Buddy has third-party licensed-art limits. Tooled Up restricts branded bidding/direct-linked PPC. Tyres UK prices must distinguish **tyre-only vs delivered vs fitted total** and tyre specs must be valid. Pneus Online needs exact live GBP feed and size/fitment verification. Holiday Extras insurance requires separate applicable authorisation. Service partners need quote/context rather than fabricated physical SKUs.

## Release acceptance checks

**Done only when:** at least 3–10 product offers have actually been imported from a timestamped current publisher feed with positive GBP prices, advertiser-matched Awin tracking, stock verified, category/identifier matched, correctly approved release rows, customer page showing actual price and no stale content; public `offers` and `published_deals` queries confirm, tested redirect and subsequent refresh/withdrawal confirmed. Until then, report **0 priced public Awin offers**, never substitute feed inventory counts.

**Latest known verified production application:** Vercel `dpl_GvnS9rbwFBzhwH8gbjAcJsT1UfKs`, application SHA `5da9c37fe68110aa8763605691989bf0b12fdd2b`, before this direct-main acceptance UI patch. Verify new build's exact SHA separately before claiming it is deployed.
