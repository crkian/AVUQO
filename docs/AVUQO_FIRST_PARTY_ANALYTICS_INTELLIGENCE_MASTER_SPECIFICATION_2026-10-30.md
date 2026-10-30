# AVUQO — First-Party Analytics & Business Intelligence Engine

**Status:** Proposed product requirements; **not a claim of implementation or deployment**  
**Date:** 30 October 2026  
**Feature category:** Owner Analytics, Behavioural Intelligence, Commercial Attribution, Growth, Trust and Operations  
**Product principle:** *Find what's worth it.*

## 1. Executive requirement

AVUQO must operate a comprehensive first-party analytics system owned and controlled by AVUQO. It will be integrated into the existing Supabase-backed **AVUQO Control Centre**, not built as a separate admin app or merely embedded from an external analytics provider.

The system must explain (a) how people find AVUQO, (b) how they use it, (c) where they succeed or abandon their journeys, (d) which features genuinely help customers, (e) how commercial journeys generate **measurable, attributable** revenue, and (f) where data quality, trust or system reliability need attention.

**Source alignment:** The original master product specification calls for a first-party event store, attribution, funnels, trust metrics, experiments and automatic adaptation. The affiliate engine requires campaign cost, traffic, affiliate conversion and estimated-versus-confirmed revenue. The grocery addendum requires price coverage, basket usage, missing-price rates and data-quality analytics. The 28 October source-of-truth register says implementation state must be checked independently of plans. This addendum gives those requirements implementation-ready detail without silently asserting they already exist.

## 2. Core principles

1. **First-party ownership:** AVUQO operates its canonical event schema, ingest, warehouse/aggregations, dashboards and reporting. External tools may be optional complements, not the sole source of truth.
2. **Accurate status:** Never represent hypothetical, unobserved or inferred activity as real. Distinguish instrumented, estimated, reported, approved, paid, invalid and unavailable metrics.
3. **Consent and privacy:** Tracking and identification must respect actual user choices and applicable UK privacy and cookie requirements. Review the consent model legally before release. Do not collect passwords, payment-card data, private note contents or sensitive free text in analytics.
4. **Trust firewall:** Traffic, affiliate commissions and sponsorship never alter the organic AVUQO Score, the cheapest-complete-basket calculation or evidence-based recommendations.
5. **Explainable metrics:** Every dashboard KPI has a visible calculation, time zone, time window, data-source provenance, freshness and limitations.
6. **Owner visibility:** Relevant metrics are drillable and exportable. Important changes, experiments, automated decisions and configuration edits are audited.
7. **Progressive delivery:** Start with reliable core event collection and truthful dashboards before adding automated predictions or AI suggestions.

## 3. Control Centre information architecture

Add **`/control-centre/analytics`** to the current authenticated owner navigation. The pages below are views into one shared analytics foundation, not independent tracking silos:

| Area | Owner questions and drill-downs |
|---|---|
| **Overview** | Sessions, unique visitors (subject to identity limits), engaged visits, searches, products viewed, merchant clicks, Watches, completed basket comparisons, confirmed revenue, trend and alerts |
| **Live Activity** | Recent aggregate activity, working event pipeline, last update timestamp, unusual spikes, system/test/bot filtering; avoid inappropriate individual surveillance |
| **Audience & Acquisition** | New/returning, source, medium, campaign, referrer, landing page, device category, coarse geography, consented cohorts, attribution windows |
| **Behaviour & Journeys** | Navigation paths, on-site search terms after redaction, zero-results searches, filters, product/deal interactions, drop-offs, return rates |
| **Funnels & Conversion** | Landing → search → product/deal → merchant click; social → verified deal → merchant click; Watch creation; grocery list → comparison → complete basket outcome |
| **Deals & Product Intelligence** | Impression-to-open rate, save/watch rate, outbound-click rate, product/category engagement, price freshness, AVUQO Score distribution, source coverage |
| **Groceries** | Basket creation, completion, items per basket, supermarket selection, full-basket comparison availability, missing-price hotspots, customer-price overrides, abandonment and repeat usage |
| **Watches, Saved & Retention** | Watch setup and triggers, alert delivery and opens, return visits, saved lists, household collaboration, retention cohorts and reactivation |
| **Revenue & Affiliates** | Valid click-throughs, affiliate-network conversions, pending/approved/paid/refunded commission, merchant and category performance, campaigns, true costs and profitability |
| **Content, SEO & Social** | Landing pages, editorial content, Pinterest and other authorised channel campaigns, impressions where reported, outbound visits, creative and UTM performance |
| **Trust & Data Quality** | Stale-price rate, incomplete comparisons, broken links, source outages, false-deal reports, price mismatches, confidence trend and customer corrections |
| **Experiments & Insights** | A/B test exposure and guardrails, statistically defensible outcomes, anomaly alerts, explainable suggestions and approved rollout history |
| **Operations & Analytics Health** | Event ingestion, queue latency, failed/dropped/duplicate events, active connectors, ingestion jobs, aggregation freshness, storage usage and AI spend |
| **Reports & Settings** | Saved dashboards, CSV export, authorised scheduled summaries, event dictionary, attribution definitions, suppression rules, data retention and access audit |

Views must support date ranges (today, yesterday, 7/30/90 days, custom), period comparisons, dimensions (channel/category/device/product/store/merchant), filters, top-N tables, time-series charts and drill-through. Charts and KPIs must clearly say **No data yet** when appropriate, not invent illustrative values on the live dashboard.

## 4. Metric dictionary and calculation standards

Provide owner-visible definitions and instrument these with versioned rules:

- **Sessions:** User activity grouped by a published inactivity window, initially propose 30 minutes; session counts depend on lawful tracking and technical limitations.
- **Unique visitors:** Number of distinguishable visitors only when lawful and feasible. If consentless aggregate counting cannot identify unique visitors reliably, label the measure as an estimate or suppress it rather than claim certainty.
- **Engaged sessions:** Defined consistently using active time, multiple page views or a meaningful action; disclose actual rule and exclude background-tab time.
- **Search-to-product view:** Sessions with a product view after a tracked search / sessions with tracked searches, subject to same-session attribution rules.
- **Search zero-result rate:** Search-result responses with zero eligible results / all eligible completed searches.
- **Deal open rate:** Valid deal opens / eligible measured deal impressions (not page views).
- **Merchant click-through rate:** Valid attributed merchant clicks / eligible measured deal/product views or impressions; state denominator in each chart.
- **Grocery complete-coverage rate:** Comparable basket runs with at least one eligible complete supermarket / valid basket-comparison runs. A partial basket is never treated as complete.
- **Price data freshness:** Valid price observations within their source-specific allowed freshness window / applicable visible prices; exclude revoked or expired prices.
- **Watch activation:** Watches created / eligible customer sessions or product views; show denominator.
- **Return/retention:** Cohorts based on first qualifying visit or account action, with D1/D7/D30 and a clear cohort rule. Do not assume visitors can be linked across devices without consent/identity.
- **Attributed affiliate conversions:** Only events received from approved network reports, authorised postbacks or reconciled feeds; a click is not a sale.
- **Estimated commission / approved commission / paid commission / reversals:** Separate lifecycle states and amounts in integer currency minor units; currency conversions require documented exchange rates.
- **Net confirmed earnings:** Approved or paid commissions less applicable reversals/refunds according to the explicitly selected accounting view.
- **Revenue per 1,000 valid impressions / per valid merchant click:** Net or gross commission numerator must be clearly labelled; never mix click and impression windows unnoticed.
- **Campaign profitability:** Attributable net commission less tracked production, platform and paid promotion costs. Show **unavailable** when expenses or network reports are missing rather than present a false ROI.
- **Data reliability:** Event receipt lag, drop rate, duplicates suppressed, stale aggregations, consent breakdown and unavailable attribution.

All currency is stored in integer minor units, timestamps in UTC and owner displays default to **Europe/London** with time-zone indication. Historical comparisons should use equivalent periods and correct daylight-saving behaviour.

## 5. Event taxonomy: MVP contracts

Use predictable, versioned `snake_case` names with minimal approved properties. Suggested events:

**Acquisition and navigation**: `page_viewed`, `session_started`, `navigation_selected`, `campaign_landing_viewed`, `content_viewed`.

**Search and products**: `search_submitted`, `search_results_returned`, `search_result_selected`, `filter_changed`, `product_viewed`, `offer_compared`, `deal_impression`, `deal_opened`, `merchant_link_clicked`, `product_saved`, `share_initiated`.

**Watches and engagement**: `watch_created`, `watch_updated`, `watch_triggered` (server), `notification_sent` (server), `notification_opened`, `shared_list_created`, `shared_list_item_added`, `feedback_submitted` (redacted metadata only).

**Groceries**: `grocery_list_started`, `grocery_item_added`, `grocery_quantity_changed`, `grocery_store_selection_changed`, `grocery_comparison_requested`, `grocery_comparison_completed`, `grocery_complete_basket_available`, `grocery_missing_prices_shown`, `grocery_manual_price_entered` (metadata only, not arbitrary free-text), `grocery_basket_saved` (only when actually synced).

**Commercial and promotion**: `campaign_published` (server), `campaign_impression` where verified, `outbound_affiliate_click` (server), `affiliate_conversion_imported` (server), `commission_status_changed` (server), `campaign_cost_recorded` (server), `experiment_exposed`.

**Trust and operations**: `price_marked_stale`, `source_sync_completed`, `source_sync_failed`, `match_exception_created`, `broken_link_detected`, `analytics_batch_failed`, `trust_report_received`.

Use canonical product, merchant, deal, category, grocery store, campaign and experiment IDs. Do not store raw search strings indefinitely without a specific privacy and retention policy. Redact emails, telephone numbers and other personal identifiers from query text; consider aggregation thresholds before displaying query strings.

## 6. Data and ingestion architecture

Reuse the active Next.js, React, TypeScript, Supabase/PostgreSQL, authenticated Control Centre, source registry, RLS, server roles and versioned migration model. Inspect the **current live code and schema** before naming migrations or creating tables. Where equivalent tables exist, extend rather than duplicate them.

Recommended logical components:

1. **Typed browser SDK:** Lightweight page and interaction events; consent gates; SPA route awareness; event sampling and batch sending; resilience when blocked/offline; no browser-visible secrets.
2. **Server event API:** Validate event names/versions and payload schema, rate-limit, reject sensitive fields, apply bot/test suppression, deduplicate IDs and timestamp receipt. Handle unauthenticated traffic without granting database writes.
3. **Server business events:** Generated from actual merchant redirect/click handlers, network reconciliation, feeds, Watches and automation jobs. These are preferable to easily spoofed client claims for consequential commercial metrics.
4. **Canonical event store:** Append-only, timestamped, partitionable as volume grows. Keep `event_id`, `event_name`, `schema_version`, `occurred_at`, `received_at`, `session_id`/visitor linkage only where permitted, authenticated `user_id` if applicable, consent class, route, attribution metadata, canonical object IDs, source and sanitised allowed properties. Consider a separate authoritative click and revenue ledger.
5. **Attribution pipeline:** Preserve UTM/referrer/campaign data lawfully. Produce reproducible first-touch, last non-direct touch and assisted views with defined lookback. Ensure idempotent provider imports, deduplication, reversal handling, source IDs and reconciliation logs.
6. **Aggregation layer:** Precompute hourly/daily summaries and cohort/funnel aggregates; publish materialized summaries/views or reporting tables. Do not scan high-volume raw events for every dashboard card.
7. **Protected reporting API:** RLS and server-side owner/admin permissions. Aggregate queries only for ordinary owner dashboards; tighter access for identifiable records or payout details.
8. **Audit and observability:** Event-schema version history, reporting definition changes, job monitoring, tracing, failed imports, data provenance, reconciliation and administrative actions.

**Proposed data entities**, subject to reuse audit:

- `analytics_events` (or existing equivalent), `analytics_event_schemas`, `analytics_sessions` (where lawfully derived), `analytics_daily_metrics`, `analytics_funnel_runs`, `analytics_cohorts`, `analytics_saved_reports`.
- Existing/extended `click_events`, `affiliate_events`, `conversion_events` or `affiliate_conversions`, `revenue_reconciliations`, `campaign_costs`, `experiment_exposures`, `source_runs`, `admin_audit_events`.
- `analytics_data_quality_alerts`, `analytics_dashboard_settings`, `analytics_consent_audit` as necessary rather than assumed default tables.

No implicit personal identity stitching. Only link anonymous activity to an account when there is a defined lawful basis and consent/notice model. Do not treat an event tracking ID as anonymous merely because it is pseudonymous.

## 7. Attribution and revenue integrity

- Every legitimate affiliate outbound click gets a server-minted unique reference or approved network `sub_id` if supported, with a durable relation to merchant, campaign, placement, product and timestamp.
- If programme rules forbid particular identifiers, do not create a non-compliant workaround; use the attribution fidelity the provider allows.
- Import provider conversions by authoritative transaction IDs; make import **idempotent** and preserve correction/reversal history.
- Separate **click**, **network-reported conversion**, **pending**, **approved**, **paid**, **declined** and **refunded/reversed**.
- Attribute only where evidence supports a link. Show an **unattributed** category instead of guessing.
- Provide reconciliation across affiliate network reporting and internal click data, with coverage percentages and reporting delays.
- Do not infer all merchant purchases from AVUQO clicks. Report actual observed conversion coverage.
- Never feed commission weights into AVUQO Score or cheapest-basket algorithms.

## 8. Grocery-specific analytics and product impact

Track feature usefulness as well as traffic: baskets started; items/units; percent reaching a comparison; percent finding at least one **complete, verified-eligible** store basket; which products or stores account for missing prices; frequency of user-entered prices; selected stores; repeat visits; share/list use; and comparison execution latency. Present incomplete comparisons and user-entered price reliance distinctly.

Potential savings are **illustrative or calculated comparative opportunities** unless AVUQO has actual purchase evidence. Do not report hypothetical basket differences as realised customer savings. Use missing-price demand to prioritise authorised retailer-feed coverage and catalogue matching, subject to rights and data reliability.

## 9. Intelligent insights and experiments

Analytics should provide an **Insights Feed** with numerical evidence, not unsupported marketing conclusions. Example insight: "Searches for 500g pasta variants had a 37% zero-result rate this week (N=142), driven primarily by missing catalogue identities." The insight must link to the underlying report, identify its denominator and confidence/limitations and suggest a human-reviewable action.

Later capabilities:

- Change-point and anomaly detection for unexpected traffic, affiliate conversion dips, feed failures, stale data, broken links or unusual customer journeys.
- Privacy-safe cohorts and audience segments (new versus returning, traffic channel, product category, grocery shoppers, Watch users).
- A/B tests with recorded randomisation, exposure, primary metric, guardrail metrics, effect size, sample size, rollout history and owner approval.
- Consent-aware personalisation experiments. Changes to scoring, rankings, important disclosures or trust presentation require extra review.
- AI-generated **daily/weekly** plain-English analytics summaries; explanations must cite computed metrics, avoid unsupported causality, and indicate if evidence is insufficient.

Automated recommendations may be proposed. Uncontrolled changes to organic rankings, publishing or merchant choice are prohibited.

## 10. Privacy, access, accuracy and resilience

- Complete a UK GDPR/PECR and consent-management assessment before deploying identification, cookies or other nonessential tracking. Support consent changes and ensure disallowed events are not processed contrary to the policy.
- Declare data categories and retention limits; configure retention separately for raw events, aggregates and financial/audit records. No arbitrary retention promise without policy approval.
- Provide documented data-subject access/deletion/export handling where applicable, with lawful financial-record exceptions assessed separately.
- Keep credentials server-side; use least-privilege RLS; prohibit direct unauthorised inserts into canonical events and commission tables; log owner access to sensitive reports.
- Exclude staff, preview/test sessions, automated uptime checks and known bots where identifiable; show filtering and reconciliation rules. Do not silently discard material events.
- Validate that each user action is counted only according to its metric definition; account for retries, multi-tab use, deduplication and late conversions.
- Dashboard empty, error, partial and stale states must be explicit; never silently replace failed analytics with zero.
- Include observability for collect/API failure, ingest latency, aggregates, event-cost budget, source permissions and report freshness.

## 11. Implementation phases

**Phase 0 — Current-source audit and data contracts.** Review latest `C:\avuqo`, Supabase schema/RLS, existing Control Centre, revenue conversion tables, cookie/consent solution, click tracking, source/automation events and all existing analytics modules. Record what is *already deployed*, what is historical and what remains planned. Define event and KPI contracts before writing tracking code.

**Phase 1 — First-party analytics MVP.** Add `/control-centre/analytics` and nav; typed page/search/deal/product/merchant-click events; lawful consent gates; server validation; aggregate jobs; date filters; top pages, sources, search, merchant clicks, engagement; reporting glossary; bot/test suppression; error states; owner-only RLS and tests.

**Phase 2 — Product and grocery funnels.** Add validated funnels for search → compare → merchant, Watch lifecycle, lists, grocery basket completion/coverage and missing-price analytics, D1/D7/D30 cohorts where measurement permits, filtering, exports and drill-downs.

**Phase 3 — Commercial attribution and campaign intelligence.** Integrate approved affiliate transaction reporting, commission lifecycle, campaign costs, product/merchant/channel performance, payout/reversal reconciliation and separate estimated/confirmed/paid views. Connect authorised social campaign IDs and UTM links.

**Phase 4 — Intelligence and optimisation.** Add experiment assignments, anomaly detection, alerts, saved dashboards, authorised scheduled owner digests, explainable AI summaries and human-approved recommendations.

Each phase requires versioned migrations, reversible features/flags, an automated test suite, security/RLS verification, telemetry correctness checks and production browser acceptance. A successful code build alone is not proof of deployment.

## 12. Acceptance tests and release gates

At minimum demonstrate:

1. An opted-out visitor does not generate events that require consent; opted-in visitor events follow the configured policy.
2. Ordinary website visitors cannot query owner analytics or insert forged confirmed revenue.
3. One eligible interaction produces one canonical event even with client retries or multiple delivery attempts.
4. A reported affiliate click is **not** counted as a conversion or earned commission without authoritative evidence.
5. Pending, approved, paid, refunded and missing-network-report states produce correct and distinct sums.
6. Date filters, time zone changes, DST boundaries and period comparison are calculated consistently.
7. A grocery basket with incomplete prices cannot contribute to a "complete basket available" count.
8. User-entered grocery prices are labelled separately from independently verified data.
9. A report with missing or delayed inputs is marked incomplete/stale, not silently zero.
10. Revenue metrics can be traced to underlying network records and internal click IDs only where permitted.
11. Staff/test/bot rules and de-duplication have explicit automated tests and observable counters.
12. Row-level security, owner/admin roles and data export permissions pass negative as well as positive tests.
13. Dashboard aggregates match a controlled fixture of raw events and deterministic metric formulas.
14. No analytics, sponsorship or commission optimisation modifies organic AVUQO Score or cheapest basket ranking.
15. Preview and production releases show actual deployed version, migration status, test results and known data gaps.

## 13. Current known state and integration caution

The **28 October 2026** unified source-of-truth documents analytics as an intended shared platform capability. A supplied **historical** `build.zip` contains a `/control-centre/revenue` route and `affiliate_conversions` readout plus a Control Centre nav, but no `/control-centre/analytics` route in that snapshot. This does **not** prove that the present live site lacks analytics or that the old ZIP reflects the latest production source. The current repository, migrations and production behaviour must be checked before implementation.

**Decision requested for the project record:** Accept this Analytics & Business Intelligence Engine as a core AVUQO capability. Its placement is within the current Control Centre, its event ownership is first-party, and trust/privacy safeguards are release-blocking. This document supplements, rather than overwrites, the original master requirements.