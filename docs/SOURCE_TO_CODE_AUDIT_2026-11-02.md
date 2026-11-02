# AVUQO specification-to-code and source audit | 2 November 2026

**Type:** Evidence-led audit snapshot. **Not** a deployment, supplier licence, account approval or customer acceptance report.
**Compared against:** GitHub `main` at `18fe575458588be511ffc5762152eccee4798a53`, application version `0.2.0`; Vercel production READY on that SHA; read-only Supabase schema/count/policy queries on 2 Nov 2026. Do not infer that READY equals full signed-in browser acceptance.
**Living actions:** [ROADMAP.md](./ROADMAP.md) and [PROJECT_STATUS.md](./PROJECT_STATUS.md). Read those before starting new work.

## 1. Source inventory and authority

The following user-supplied originals were reviewed as **requirements or historical handovers**, not evidence of current completion. These source filenames are in the project attachment collection; not all original PDF/image bytes are stored in GitHub. GitHub copies of some later handovers are also in `docs/handover/`.

| ID | Source | Role / principal requirements | Temporal caveat |
|---|---|---|---|
| S01 | `AVUQO_Master_Product_Build_Specification.pdf` (26 pages) | Original consumer platform, premium brand/UX, Score + confidence, product intelligence, search, watches, personalization, community, universal connector, Autopilot, analytics, social, Control Centre, privacy and rollout | Product requirements, not implementation |
| S02 | `AVUQO_Intelligent_Supermarket_Comparison_Master_Specification.pdf` (20 pages) | Nine supermarkets, catalogue/pack identity, guest list, quantity, verified and private prices, complete vs incomplete baskets, admin, edge cases and acceptance | Grocery requirements, not retailer permissions |
| S03 | `# AVUQO Intelligent Affiliate Marke.txt` | Affiliate opportunity selection, separate Promotion Score, AI Creative Studio, Pinterest-first then multiplatform promotion, scheduling, attribution/revenue and disclosure | Proposal, not connected social channels |
| S04 | `AVUQO_v0.8_Control_Centre_Content_Backend_Plan.md` | Owner CMS, draft/review/publish, legal versioning, media rights, source registry, advertiser approvals, audit/roles, tests | Explicitly proposed v0.8 architecture, not software version |
| S05 | `AVUQO_MASTER_SOURCE_OF_TRUTH_2026-10-28.md` | Consolidated UK-first unified platform: groceries, budgeting, services, travel, comparison, retention, evidence and trust wall; source authority hierarchy | 28 Oct baseline, subsequently superseded for live status |
| S06 | `AVUQO_First_Party_Analytics_Intelligence_Master_Specification.md` | First-party consented events, schema dictionary, attribution, funnels, cohorts, quality, confirmed vs estimated commission, experiments, retention, RLS and privacy | Explicitly proposed 30 Oct, not proof of tracking |
| S07 | `Pasted text (1).txt` (“Complete Product Content, Data Sources & Million-Listing Expansion Handover”) | Scale to 10k/100k/1m+ **eligible** listings through approved Awin/eBay/impact/CJ/Webgains/Tradedoubler/Rakuten/Amazon/direct and sector-specific connectors; product identity/offer separation | Capacity/coverage target, **not millions live** |
| S08 | `Pasted text (2).txt` (“AVUQO PROJECT HANDOVER”) | Historical Supabase, imported merchants, PR #20/#22–#25, staged roadmap and safe sequencing | 30 Oct statuses are outdated after later merges |
| S09 | Uploaded AVUQO brand options image | Three visual directions, score badge and illustrative desktop layout proposals | Concept art; no evidence an option was approved or implemented |
| R01 | GitHub `docs/PROJECT_STATUS.md`, `docs/UNIVERSAL_COVERAGE_AND_SOURCE_STRATEGY.md`, `docs/BACKEND_FRONTEND_AUDIT_AND_GROWTH_ROADMAP.md`, `docs/AVUQO_2026-10-30_SPEC_INTEGRATION_REGISTER.md` | Later decisions, route and coverage history, implementation caution | Treat dated audit figures as historic unless rechecked |
| E01 | GitHub code, PRs, CI, Vercel, and read-only Supabase query results | Current **evidence** of what exists and what is configured | Source code presence is not end-to-end user acceptance |

Where sources conflict: preserve the original wording and mark a decision for the owner. In particular, **global reach** (S01) versus **UK-first launch** (S05) is resolved operationally as UK-first, international later, not as deletion of global ambition. Dropshipping is a supplier prospect workflow, not evidence that AVUQO has become a retailer or merchant of record.

## 2. Evidence rubric (do not use invented completion percentages)

- **M0 | Specified:** a requirement exists but no corresponding working module verified.
- **M1 | Scaffolded:** public/editorial page, registry, admin screen, schema or contract exists, not a proven user journey.
- **M2 | Functionally coded:** operational logic/actions and/or unit tests exist; may use local/manual/demo data or have missing real sources.
- **M3 | Technical deployment verified:** released code passes CI and Vercel deployment, but some real account/provider acceptance remains outstanding.
- **M4 | Customer/provider verified:** authenticated or anonymous browser, permissions/RLS, actual eligible data and relevant provider reports passed explicit acceptance. No audited area should be labelled M4 merely from this inspection.

**Maturity describes evidence of implementation, not percent of the original multi-year vision completed.** Each row lists a next acceptance gate, not a claim that the rest is done.

## 3. Code and live-state coverage matrix

| Platform workstream | Source requirement | Code/DB evidence observed | Audit maturity | Remaining release/acceptance gap |
|---|---|---|---|---|
| Brand, navigation, premium UX and SEO | S01 S04 S05 S09 | Customer pages, responsive categories, header/mega-nav/mobile dock, metadata, manifest and sitemap on main; production deployment READY | M3 (technical) | Accessibility/zoom/mobile regression and real brand-design selection not verified |
| Website content and legal CMS | S01 S04 | Footer/nav, page and legal draft/publish editors in existing Control Centre | M2 | Scheduled publish, revision rollback, SEO per page, asset licensing, qualified legal review and owner vs editor negative tests |
| Universal source registry and pipeline | S01 S04 S05 S07 | `sources`/permissions UI, `lib/connectors/registry.ts` contains **demo and awin only**, `lib/pipeline/run.ts` + private endpoint | M2 | Credentials/merchant rights, real monitoring, rate limits, dedupe/idempotency and authorised provider acceptance |
| Affiliate eight-network expansion | S03 S05 S07 | PR #33 private planning register; 8 target networks, only Awin and demo have connector code | M1 | Build eBay, Webgains, impact, CJ, Tradedoubler, Rakuten, Amazon adapters only with access and terms; never call registry “connected” |
| Awin staged imports | S03 S05 S07 S08 | 5 import runs / 4,588 staged rows: AKKO 910 **twice**, Craft Buddy 1,299, Cadbury 1,371, Petlibro 98. All 5 import permissions **unverified** | M2 (private only) | Merchant by merchant feed/image/link rights, advertiser approval, duplicates and canonical product matching |
| Products, offers, canonical identity and price history | S01 S05 S07 | 12 product rows, 4 marked active; 6 offer rows and 6 published_deal rows, **all from demo source**. Catalogue/public-offer guards intentionally exclude demo | M2 (foundations) | Product/variant/pack matching, GTIN/brand confidence, true merchant matches, authorised price history and expiry/reversal evidence |
| Independent Score and trust firewall | S01 S03 S05 | `lib/pipeline/score.ts` computes weighted evidence/confidence; `lib/products/public-catalog.ts` checks source rights, freshness, image permission and matching; Promotion Score separate | M2 | Golden fixtures, real cross-retailer observations, explanation checks and explicit proof commission cannot influence organic score |
| Customer product search and deals | S01 S05 S07 | `/search`, `/products`, `/discover`, `/sales`, `/live` and verified offer routes, with no eligible non-demo offers evidenced | M2 | True full-catalogue search, filters, ranking, variants, fresh offers, price history, buy/wait, zero/missing states and click-to-retailer acceptance |
| General comparison and recurring contracts | S01 S05 S07 R01 | `/compare` supports an **illustrative editable contract cost** comparison; product pages can compare permissioned offers | M2 for demo maths; M1 for providers | Live mobile/broadband/TV terms/availability and price evidence; UK contract calculation acceptance, total payable comparison |
| Taxonomy, browse and discoverability | S01 S05 S07 S08 | 1,384 DB categories; **8 active, 1,376 inactive**. Existing 25-department public browsing. PR #25 still draft and unmerged | M2 (partial) | Reconcile PR #25 with new nav, test parent hierarchy, canonical mapping and prevent accidental activation/re-seed |
| Grocery list and deterministic basket | S02 S05 S07 | `/groceries`, local basket/personal prices, 9-store fallback, `calculateBasket` with incomplete-price safeguards and unit tests; admin catalog and evidence review | M2 for list/logic | User tests for pack variants, quantities, missing data, complete/partial ranking and manual-price labeling |
| Genuine supermarket comparison | S02 S05 | **0 grocery_prices**, 1 grocery_products row, no authorised supermarket feed; store listing ≠ connection | M1 / externally blocked | Approved retailer price access, evidence freshness, product/pack mapping, real store-basket test, delivery/loyalty/region constraints |
| Budgeting, savings goals, spend planning | S05 and S01 | Some financial/contract examples and list budgets; no verified unified household budget/reconciliation engine | M0–M1 | Specify consent-conscious weekly/monthly budgets, goals, planned vs actual and grocery/list links |
| Saved, Wishlist and basket snapshots | S01 S05; newer PR #34 | `/saved`, `/wishlist`, `/basket`, `/lists/[id]` deployed v0.2.0; customer tables currently contain **0 rows** | M3 (technical) | Signed-in cross-account RLS + duplicate/expiry tests, copy and mailto checks, no stale affiliate deep links, no checkout |
| Watches and notifications | S01 S05 | Client Watches storage/migration UI; notification switch exists, no delivered alert evidence | M2 for storage; M0–M1 delivery | Actual evaluator, scheduler, opt-in email, dedupe, unsubscribe, consent and message deliverability |
| Collaborative households and personal intelligence | S01 S05 | Profiles, private `shared_lists`/members/items, account preferences; no observed shared item records | M1–M2 | Multi-user invitation/role, household acceptance, explainable recommendations and consent/retention controls |
| Travel, experiences, car hire and motoring | S01 S05 S07 | `/travel`, `/experiences`, `/motoring` mainly editorial. Booking.com and Skyscanner registered, **paused/no credentials** | M1 | Dates, taxes/fees, booking terms, accommodation/transport availability, permitted live travel APIs |
| Broadband, insurance, services and other verticals | S05 S07 R01 | Category/section landing pages and illustrative contract calculator; no approved service/regulated quote partner demonstrated | M1 | Address/eligibility, coverage/excess, FCA/regulated disclosures and partner data licences |
| Reality Check and community feedback | S01 S05 | `/reality-check` accepts/labels URLs without remote fetch; feedback components/tables exist | M1–M2 | Safe approved-source verification worker, moderation/reputation and true evidence/result UX |
| Affiliate clicks, reconciliation and revenue | S03 S05 S06 S07 | `/go/[offerId]` verified redirect path; **7 click rows** (not sales), **0 affiliate conversions**; private revenue table/display exists | M1–M2 | Real eligible clicks, network imports, attribution IDs, reversals, confirmed vs paid commission and independent audit |
| Brand social / Pinterest and AI creative | S03 S04 | Marketing Control Centre, brand facts/assets/posts, Buffer adapter and worker with explicit environment/approval gates; **0 marketing_posts** | M2 (disabled infrastructure) | Provider permissions, approved brand facts and image rights, Pinterest channel, worker dry run, real posting and metrics |
| Site advertising and sponsorship | S04 S05 | Dedicated advertiser/campaign briefs and audit; no public serving or payments, **0 site_ad_campaigns** | M1–M2 | Contracts, billing, inventory, disclosure, consented reporting and independence tests |
| First-party analytics and experiments | S01 S06 | Event contracts and private rolling counts page; **0 analytics_events**. Explicit collection off pending consent/privacy review | M1 | Consent-gated SDK/API, dedupe/bot controls, cohorts/funnels, schema dictionaries, attribution and real acceptance |
| Autopilot, monitoring, exceptions and controls | S01 S04 | Owner job UI, pipeline logs/events, switches, private source monitoring; `deal_publishing` and `source_ingestion` switches enabled but rights gate still mandatory | M2 | End-to-end scheduled jobs, reconciliation, fail-closed controls, incident drills, verified manual override |
| Privacy, security, PWA and resilience | S01 S02 S04 S05 S06 | Supabase RLS enabled for sampled tables; authentication/control centre guards; manifest, cookies/legal routes, CI and Vercel | M2–M3 (mixed) | Negative role/auth tests, explicit consent, anonymous event insertion audit, performance, accessibility, backups, cost and incident rollback |

### Cross-cutting negative evidence

1. `sources` contains **8 rows**. Awin is labelled `active` + `sync_enabled=true`, but `credential_status=not_configured` with no recorded source/image rights flag. Demo is marked active/healthy. eBay, CJ, impact, Booking.com, Skyscanner and Direct Merchant Feed are paused or unconfigured. Webgains, Tradedoubler, Rakuten and Amazon are **planned**, not registered as ready connectors.
2. The **6 demo offers** are recorded as `published_deals` but public code `sourceReady()` rejects `source_type=internal_test` and connector `demo`. “Published row” must not be reported as a real public merchant offer.
3. `feed_import_records` = 4,588 rows, **0 status=approved**. The aggregate is not 4,588 distinct sellable products.
4. `grocery_prices` = 0. Grocery comparison user interface can render correctly without being able to name a genuinely cheapest supermarket.
5. `analytics_events` = 0; `affiliate_conversions` = 0; marketing_posts and site-ad campaigns = 0. Avoid presenting absent data as earned revenue or successful automation.
6. Read-only `pg_policies` shows `analytics_events` and `click_events` have INSERT policies for both `anon` and `authenticated`, subject to `user_id` checks. This is an **integrity / privacy review item**; the effective grants, exploitability, consent controls and server-only event policy need tests. It is not evidence of an actual incident.
7. Some existing docs report PRs #20/#22/#23/#24 as open. Those are **historical**. Current open drafts are #21 and #25; PRs #20, #33, #34 and #35 were merged.
8. Software version `0.2.0` is not the same as earlier “AVUQO v0.8” product planning labels.

## 4. Decisions, unknowns and acceptance gaps

- **Verified release != provider success:** GitHub CI and Vercel READY only prove a build was released; authentication, checkout, mailto clients, merchant rights and social posts require independent demonstrations.
- **Source rights matrix:** Record each network **and** advertiser separately: publisher acceptance, merchant join, API scope, feed rights, image rights, link terms, refresh/caching policy, UK permitted audience and expiry. `active` alone is inadequate.
- **Wishlist/basket use:** Basket is a saved planning bundle. No AVUQO payment, no automatic emails, and no unsupported prices or shipping guarantees.
- **Original brand image:** Visual options 1–3 are reference designs; do not treat any choice as final without explicit owner selection. Inspect implemented mobile and desktop appearance separately.
- **Budget pillar:** Explicitly a product requirement from S05; page templates or contract calculators are not a complete budget implementation.
- **Experiments/AI optimisation:** The specs are forward-looking and subject to consent, actual input data and traceable decision gates.
- **Regulated verticals:** Insurance, energy and finance require separately scoped legal/provider contracts. A landing page is not a compliant quotes service.
- **Additional original source archives:** The current GitHub project documents cover much of the intent but not every original source PDF/image. Future chats may need the Project attachments when checking exact wording and visual layouts.

## 5. Acceptance evidence still not obtained in this audit

No customer login, independent non-admin account journey, real retailer API/permissions verification, full visual browser regression, email client compatibility, network conversion report, actual Awin/eBay price publication or cross-account leakage test was performed. These remain explicit roadmap acceptance gates, not silent checkmarks.

## 6. Evidence pointers for next engineers

- GitHub code paths: `lib/connectors/registry.ts`, `lib/connectors/awin.ts`, `lib/pipeline/{run,score}.ts`, `lib/products/public-catalog.ts`, `lib/groceries/compare.ts`, `app/go/[offerId]/route.ts`, `app/control-centre/{analytics,marketing,revenue,site-advertising,source-readiness}/`, `app/{wishlist,basket,lists,saved,watches,compare,groceries,travel}/`.
- DB query groups (read-only): categories and active flag; sources credentials/metadata; imports permissions and status; offers joined to sources; grocery prices; affiliate conversions/clicks; analytics events; marketing and site-ad records; pg_policies/RLS. Counts above are **as of 2 Nov 2026** and must be re-run before relying on them.
- Status/priorities: [Living project register](./PROJECT_STATUS.md), [Roadmap](./ROADMAP.md), [Release change history](../CHANGELOG.md), [Previous integration register](./AVUQO_2026-10-30_SPEC_INTEGRATION_REGISTER.md).
