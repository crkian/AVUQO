# AVUQO Awin: 16 joined programmes and sequential onboarding register

**Evidence timestamp: 4 November 2026.** The owner ran the signed-in, read-only Awin joined-programmes diagnostic on the v0.3.1 preview, which returned **16 valid joined programmes**. All IDs below come from that provider response copied by the owner. This establishes **joined-programme identity at that moment**, not licences for republication of data, imagery, or pricing.

## Sequential queue

| Order | Advertiser | Awin advertiser ID | Existing private import | First action | Publication |
|---|---|---:|---|---|---|
| 1 | Cadbury Gifts Direct | `736` | 1,371 rows, 1,371 review candidates | Reconcile terms, feed/image rights and GBP prices; test fresh feed | **Paused** |
| 2 | Petlibro UK Affiliate Program | `77952` | 98 rows, 49 review / 49 excluded | Reconcile terms and source exclusions; test fresh feed | **Paused** |
| 3 | Craft Buddy Shop | `45747` | 1,299 rows, 1,233 review / 66 excluded | Reconcile terms; dedupe and test fresh feed | **Paused** |
| 4 | Tooled Up | `496` | No staged import verified | Verify feed availability, terms, licences | **Paused** |
| 5 | Mozillion | `31539` | No staged import verified | Check device condition, warranty, grading, exact variant matching | **Paused** |
| 6 | Tyres UK | `12715` | No staged import verified | Check fitment, sizes, mandatory fitting/shipping | **Paused** |
| 7 | Tyres Pneus Online UK | `15236` | No staged import verified | Check tyre fitment, currency and delivered/fitted totals | **Paused** |
| 8 | Holiday Extras | `3496` | No staged import verified | Check product category, booking prices, travel date/fees and feed availability | **Paused** |
| 9 | Onestream | `23296` | No staged import verified | Check broadband contract prices, availability/coverage, term and hikes | **Paused** |
| 10 | EPCs, Gas Safety Certificates and Electrical Check | `25022` | No staged import verified | Check service type/coverage and whether product feed is usable | **Paused** |
| 11 | Christmas Letters from Santa | `35299` | No staged import verified | Check seasonal availability, delivery cutoffs and gift claims | **Paused** |
| 12 | AutoAid Breakdown | `36276` | No staged import verified | Check policy coverage, exclusions, duration and full cost | **Paused** |
| 13 | 1pMobile | `37738` | No staged import verified | Check SIM plan price, allowance, renewal and contract terms | **Paused** |
| 14 | Chattr Sim Only | `115559` | No staged import verified | Check SIM/data inclusions, contract and network coverage | **Paused** |
| 15 | Compare Parking Prices UK | `118401` | No staged import verified | Check parking dates, sites, bookings and all mandatory fees | **Paused** |
| 16 | Lyca Mobile UK | `128157` | No staged import verified | Check introductory vs recurring rates, bundle expiry, restrictions | **Paused** |

The sector-specific checks above are **implementation acceptance proposals**, not terms supplied by Awin or verified provider features. Some services/travel programmes may not expose a usable retail-style JSONL product feed even when they are joined. Do not fabricate catalogue coverage.

### What is already evidenced
- Provider diagnostic reported joined status for these 16 IDs on 4 November 2026.
- Owner's Awin directory screenshots independently showed the *names* Cadbury and Petlibro under Active, both with **Product Feed: Yes** and green Link Status. Those screenshots did not show the numeric IDs or legal licence terms.
- Existing historical private imports: Cadbury **1,371**, Petlibro **98**, Craft Buddy **1,299**. All associated import runs remain `permission_status=unverified`.
- Private AKKO UK import exists (910 rows twice, 1,820 total), but **AKKO ID 69178 is not in this 16-programme joined API response**, so it is excluded from this approved-first queue.
- Awin source `status=paused`, `sync_enabled=false`, `credential_status=not_configured`, `publication_permission=pending`; all 16 saved in `sources.metadata.awin_advertisers` with `feed_permission_confirmed=false` and no approval references/expiry. 0 Awin live sync runs, 0 public Awin offers, 0 per-offer approvals at check time.

## Original AVUQO requirements, traced

The source-of-truth requirements come from:
- **Master Product & Build Specification**, section 8 (pp. 15–16): Universal Source Connector, Source Registry authentication/status, territory, currency, categories, feed type, refresh schedule, last-successful-sync, freshness/errors/reliability, affiliate status, rate limits, retry/pause; canonical product identity and confidence/matching.
- Same PDF, section 9 (pp. 16–17): Autopilot validates, normalises, deduplicates, records history, scores, publishes/unpublishes, logs exceptions and supports source/merchant/category/global stops and audit trails.
- Same PDF, section 15 (p. 23): Affiliate commission must never influence the AVUQO Score and sponsored slots must remain separate from value ranking.
- **AVUQO Intelligent Affiliate Marketing & Automated Social Promotion Engine**, sections 2, 3, 9–11: authorised network/programme inputs, verified evidence, approved image usage, transparent disclosures, owner controls and separate Promotion Score; no invented savings, stock, claims or automated social publication without permission.
- **AVUQO Master Source of Truth (28 October)**, requirements 51–55 and 62–65: licence/permissioned source registry; canonical identification, variant-safe offers, real price history, freshness and confidence. Historic AKKO is private and must not be published without approval.

## Per-programme acceptance gates, applied one at a time

| Gate | Proof required before moving on | Current status |
|---|---|---|
| Identity | Awin joined-programmes API returns exact ID/name for publisher | **Confirmed for 16 on 4 Nov**, reconfirm if stale |
| Provider terms | Owner checks actual advertiser terms and permission to show affiliate deep links, feed data and prices | **Not yet evidenced** |
| Image and brand assets | Separate evidence of permission to show images/logos, allowed transformations/storage, and attribution/expiry rules | **Not yet evidenced** |
| Feed access | Correct access method, appropriate credential, advertised feed availability, rate limits and format; error handling | **Not yet live tested** |
| Rights audit | Owner records programme-specific evidence references, GB territory, valid-until and rights approval. Do not enter fabricated future expiration | **Unverified for all** |
| Isolation | Every imported offer linked to exact Awin advertiser; no cross-merchant source permission inheritance; credentials stay server-only | **Needs multi-advertiser design/acceptance** |
| Freshness | New authorised GBP price and true delivery/fees, stock status, valid link and expiry; don't treat archived upload as current | **Not yet checked** |
| Product matching | Canonical identifiers, variants/pack sizes, reject doubtful match, avoid duplicates, no fabricated price history | **Not yet accepted** |
| Scoring | Independent AVUQO Score and confidence with commission excluded; promotions tracked separately | **Code foundation exists, live acceptance open** |
| Manual public release | Stage/hold, owner verifies evidence, Score, price, rights and retailer link, then approves specific offer | **0 approvals / 0 public offers** |
| Stop/recovery | Test advertiser-specific source/offer pause, emergency stop, expiry and fresh re-approval after change | **Not yet tested live** |
| Monitoring | Last-sync, errors, exceptions, changed prices, attribution and network-confirmed conversion distinct from click | **Live provider acceptance open** |

**Critical architecture gap:** Existing `lib/connectors/awin.ts` and `lib/pipeline/run.ts` rely on one Vercel `AWIN_ADVERTISER_ID` and one Awin source row. Onboarding metadata now holds 16 advertisers but the current pipeline is not a simultaneous, per-advertiser isolated ingestion system. To scale safely, use explicit per-advertiser configuration/identity, source-level or merchant-level rights/stop controls, independent sync cursors and logs, and revoke/expiry behaviour scoped per advertiser. Implement and test this **before** turning on multiple advertisers together. Never loop over 16 with the old global source approval flag.

## Execution order
1. Complete PR #48 (read-only diagnostic) with owner-submitted joined API evidence and remaining negative access test. No product activation.
2. Cadbury `736`: inspect actual Awin programme terms, collect real feed/price/image evidence, use owner-initiated read-only feed test, stage ≤50 authorised offers, review one offer and test pause. **No publish until evidence and an owner release.**
3. Repeat for Petlibro `77952` and Craft Buddy `45747`, each with separate rights/expiry and quality checks. Do not blindly approve excluded Petlibro items.
4. Implement multi-advertiser isolation and controls, ideally proven by positive/negative tests for two simultaneous merchants with differing permissions. Preserve original feed uploads and historical price records.
5. Move through remaining 13 merchants in the listed order, pausing sector-specific work when a retailer cannot provide legally/technically appropriate data.
6. Only then consider scheduling recurring ingestion, public search activation and affiliate promotion; track source freshness, expiry and click/conversion reconciliation separately.

**No credentials, programme legal terms, brand licences or original screenshots are stored in GitHub.** The owner-provided API text is used as a factual observation, not elevated into legal authorisation.
