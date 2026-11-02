# AVUQO living delivery roadmap

**Last evidence audit:** 2 November 2026 · [full source-to-code matrix](./SOURCE_TO_CODE_AUDIT_2026-11-02.md) · [original source manifest](./SOURCE_MANIFEST_2026-11-02.md) · [granular source gaps](./SOURCE_REQUIREMENT_GAPS_2026-11-02.md).
**Software version:** currently live `0.2.0` at audit; P0-01 security fix proposes `0.2.1` on its feature branch. Do not call it deployed until code, migration and role checks are verified.
**Evidence policy:** Features remain “proposed”, “code foundation”, “internally testable”, “deployed but unaccepted” or “customer/provider verified”. Never express speculative percentage completion, income, source approvals or live listings.
**Owner policy:** Protect independent AVUQO Score, consumer trust, permissioned data, source separation and non-destructive deployment.

## 0. Release and source gate definitions

**Done** for a customer feature requires: requirements traced to the original source, ownership/security tests, deterministic tests where possible, staging preview, successful build, live SHA recorded, mobile/browser acceptance and supportable source evidence. A source/feed is **live** only after publisher and merchant acceptance, rights, authorised credentials, fresh data, provenance, consent/attribution where applicable, incident disablement and owner release review.

**Severity:** P0 = security/compliance/trust/correctness blocker; P1 = core customer/product functionality and commerce foundations; P2 = strategic first-party expansions; P3 = authorised scale/sector expansion. **Priority is not a promise of delivery date.**

## Phase P0 | Preserve trust and make the deployed base verifiable

| ID | Work | Current state | Action and required acceptance |
|---|---|---|---|
| P0-01 | Event/click integrity and consent | Direct anon/auth INSERT grants and lax event INSERT policies confirmed; security patch and reversible rollout plan prepared in P0-01 feature PR; 7 historic clicks, 0 conversions | Code: retain verified /go redirect but pause click records; migration `20261102153000_event_write_integrity.sql`: revoke anon/auth/PUBLIC direct writes and remove lax event policies. Complete reviewed production rollout and re-query privileges, test cross-role direct POST denial and redirect behaviour. Keep historic events uncertified; visitor analytics remains off until consent/legal review. See [runbook](./P0_01_EVENT_INTEGRITY_RUNBOOK.md). |
| P0-02 | Awin and source rights/kill-switch audit | Awin registry `active`, `sync_enabled=true` but `credential_status=not_configured`, rights flags missing; all 5 feed imports unverified | Require a consistent fail-closed readiness state, independently verify no automated unlicensed ingestion/publication, record evidence and hard-stop controls. **Do not infer source activation from a registry toggle.** |
| P0-03 | Signed-in customer journey tests | Wishlist/basket/list functionality merged in v0.2.0, no observed customer data | Test own vs another account's access, list item ownership, duplicate adds, removed/expired offers, named basket copy/rollback, 18-item email-draft limit, mobile mailto and accessible keyboard interactions. Explicitly test browser-tampered/stale merchant, price and URL snapshots: account storage is not server-verified price evidence. |
| P0-04 | Review legacy drafts safely | Open PRs #21 and #25 overlap earlier merged navigation/product work; #22–#24 closed but included in #25 ancestry | Reconcile unique functionality onto fresh `main`; test old routes/headers/categories, avoid applying historical category seeds twice. Close only when unique work is accounted for and retained. |
| P0-05 | Release reliability and role security | Vercel READY + GitHub CI exist; admin RLS policies present | Test owner/admin/ordinary/anonymous routes, server action authorisation, SEO/cookie/affiliate disclosures, mobile accessibility, rollback and database restore. Require release SHA plus smoke-test checklist. |

## Phase P1 | Make comparison genuinely useful with permitted data

| ID | Work | Current state | Action and required acceptance |
|---|---|---|---|
| P1-01 | Awin pilot authorised catalogue | 4,588 private records; duplicated AKKO; zero approved feed records | Obtain **individual** approved advertiser/feed/image/link permissions, reconcile duplicates, map canonical models/packs/variants, confirm price currency/shipping, then accept one small reviewed non-demo offer set end to end. |
| P1-02 | Universal connector SDK and source management | Only demo + Awin adapters coded; 8-network planning register is not integrations | Standardise connect/auth/read/normalise/refresh/check rights/log/retry/pause and rate-limit contracts. Add eBay behind disabled feature flag after approval; future Webgains, impact, CJ, Tradedoubler, Rakuten, Amazon each need specific rights and contract tests. |
| P1-03 | Shared offer identity and price history | Product/offer schemas and Score code exist; 6 demo-only offers, 12 product identities; public guard excludes demo | Golden product/variant matching fixtures; duplicate merchant offers; total cost, GBP and delivery; actual time-series evidence with source timestamp; stale and expiry handling, out-of-stock restrictions. |
| P1-04 | Products, Deals, Search and Compare | Public pages and standalone illustrative contract cost calculator, no authorised multi-merchant dataset | Full result pagination/index, filters, relevant ranking, exact product links, user-readable confidence/price history and fair side-by-side **eligible** merchants. Validate before any public marketing of live coverage. |
| P1-05 | Canonical taxonomy and navigation | 1,384 category rows, 8 active. PR #25 not merged | Reconcile hierarchies, data, navigation and source-mapping, keep inactive categories hidden without products, test search destinations. |
| P1-06 | Revenue and affiliate redirect correctness | Verified redirect handler, 7 historical clicks; no conversions | Permissioned live click fixture, non-spoofable source attribution, network conversion imports, dedupe, adjusted/reversed/paid commission states and reconciled ledger. Payout must never enter AVUQO Score. |
| P1-07 | Natural-language search and catalogue-scale result quality | Original S01 PDF pp. 5–7 asks for structured query intent, Best Value default, alternative sorts and domain-specific filters; current app/search/page.tsx matches words against only the first 60 verified products | Build a permission-aware indexed search, deterministic parsing and sort/filter contracts, result pagination and negative quality tests. Do not market NLP search or full-market coverage until proved. |

## Phase P2 | Grocery and retention evidence

| ID | Work | Current state | Action and required acceptance |
|---|---|---|---|
| P2-01 | Grocery Phase 1 customer acceptance | Nine supermarket directory entries, guest local basket, personal prices, deterministic compare; no grocery price records | Test exact pack/quantity, complete vs incomplete, missing/stale/unlicensed prices, storage persistence, accessibility and user price provenance. Never announce a cheapest retailer without complete valid evidence. |
| P2-02 | Permissioned supermarket prices | No verified retailer feed or published evidence | Owner-approved store/product pricing integration, freshness/region/loyalty/delivery rules; compare at least one real complete basket only once licensing and fixtures pass. |
| P2-03 | Watches and notifications | Saved watch UI/DB exists, no verified outbound messages | Scheduled evaluator, threshold and stock-change policies, dedupe, subscription/opt-in, unsubscribe, retry/delivery records and owner disablement. |
| P2-04 | Saved, wishlist, households and shareable lists | v0.2.0 code deployed, unaccepted customer journey; shared list tables exist | Complete P0-03, then sharing/invites, collaborators' roles, household budgets and privacy/guest migration without leaking lists or email addresses. |
| P2-05 | Budget and spending goals | Strategic pillar specified, no complete customer budget engine | Design weekly/monthly and category budgets; saved plans vs actual reported spend; deliberate opt-in association with grocery baskets and watches. No bank-account connectivity without separate scope. |
| P2-06 | Explainable Preference Graph and recommendation controls | S01 pp. 13–14 requires explicit + behavioural preferences, confidence/decay, household contexts and “This was for someone else”; current accounts expose simple preferences only | Decide consent/retention boundaries, build user-correctable preference graph, “Why am I seeing this?” explanation and dismissal/decay, then cross-account privacy and recommendation acceptance. No inferred sensitive data or unwarranted profiling. |

## Phase P3 | Content, acquisition, first-party intelligence

| ID | Work | Current state | Action and required acceptance |
|---|---|---|---|
| P3-01 | Owner CMS/legal/media/SEO | Footer, nav, pages and legal draft/publish UI | Versioned revisions/rollback, effective dates, source/licence of media, metadata and structured-data controls; legally reviewed cookie/privacy/disclosure content. |
| P3-02 | Affiliate promotion / Pinterest / AI creative | Control Centre and Buffer worker code; marketing switch off, 0 posts | Approved factual inputs and image rights, separate Promotion Score, staged social account authorisation, idempotent scheduled publishing and accurate platform reports; owner approval and stop controls. |
| P3-03 | Independent Site Advertising | Private advertiser/campaign workflow, 0 campaigns, no public ads | Contract/placement/rights/consent and billing design; separate sponsored inventory, explicit disclosure and ranking firewall. |
| P3-04 | First-party analytics and experiments | Event schema + private dashboard, 0 events | Only after P0-01: privacy/consent-gated SDK/API; dedupe and bot filters, metric dictionary, funnels/cohorts/retention; correct incomplete-data states and logged experiments. |
| P3-05 | Reality Check, feedback and trust | URL intake, merchant lookup, no live remote verification | Safe allow-listed verification, permissions and factual responses; moderated feedback and claim disputes; no fake reviews or unjustified merchant reputations. |
| P3-06 | Seasonal Calendar Engine | S01 p. 19 specifies dated seasonal modules and thresholds; Control Centre Seasonal page is currently only an editorial/review index with no scheduler | Add country/time-zone aware, owner-approved event rules, dry-run, source/creative rights, consent-aware notifications, expiration and reversible activation. Prove blackout/expired-event behaviour before auto-publish. |

## Phase P4 | Broader services, reliability and scale

| ID | Work | Current state | Action and required acceptance |
|---|---|---|---|
| P4-01 | Travel, accommodation, experiences and hire | Editorial pages, Booking.com and Skyscanner paused/unconfigured | Approved APIs; comparable route/date/availability/taxes/fees/cancellation and booking disclosure; source-specific scoring. |
| P4-02 | Broadband, mobile, insurance, energy, motoring and services | Editorial sections and illustrative contract calculator | Licensed data and appropriate regulatory/legal basis; exact geography/coverage, contract costs, fees and exclusions. Expand one sector at a time. |
| P4-03 | Autopilot, exception remediation and audit | Pipeline jobs, internal switches and Control Centre pages coded | Real provider monitoring, scheduled refresh/retries, cost controls, change audit, incident drills, owner-level emergency stop and demonstrated reversible releases. |
| P4-04 | 10k → 100k → 1m+ eligible offer scale | Architecture ambition only; 4,588 staged raw records including duplicates | Measure ingestion throughput, queue backlog, canonical dedupe, query performance, refresh latency, source licence compliance and infrastructure cost before increasing volume. |
| P4-05 | Mobile PWA and conditional native app / push | S01 pp. 9, 24 requires thumb-first app and push, but current code has only a web manifest and MobileDock; no native app or delivered push evidence | Test installability, offline/notifications/permission UX and browser/device support. Decide native after commercial and technical gate, then implement app/backend parity with opt-in push, quiet hours and unsubscribe tests. |

## Requirements that must not disappear in broad workstream labels

The uploaded 26-page product specification explicitly calls for natural-language intent search (P1-07), explainable and removable personalisation (P2-06), an event-driven seasonal calendar (P3-06), and a thumb-first mobile/PWA/push experience with native app conditional on commercial justification (P4-05). These are independently traceable acceptance gates, not proof of implemented features. Keep groceries' guest basket separate from the signed-in affiliate planning basket (G09). See SOURCE_REQUIREMENT_GAPS_2026-11-02.md for exact original page references and code findings.

## Action sequence for the next development session

1. Start with **P0-01 / P0-02**. Do not switch on analytics or unlicensed source ingestion. Read-only audit first; use a reviewed migration PR for any security change.
2. Run **P0-03** signed-in wishlist/basket acceptance and preserve existing Saved/Watches.
3. Resolve **P0-04** with current `main` as base, especially the unique fixes in PR #21 and old taxonomy PR #25.
4. Work in parallel on **P1-01** merchant permissions and **P1-02** reusable connector contracts; enable no new network until authorisation.
5. Deliver one genuine, properly licensed offer and its end-to-end click path (**P1-03/04/06**), then scale; pursue groceries P2-01/02 with equivalent rights discipline.

## Change control for every future chat/PR

- **Before work:** read `AGENTS.md`, `docs/PROJECT_STATUS.md`, this roadmap, the dated audit and `CHANGELOG.md`. Check `main` SHA, open PRs and database only where necessary.
- **When implementing:** identify phase IDs in PR description and tests. Change the actual code, not just a visual preview, while protecting data/RLS/approved-source boundaries.
- **After completion:** update the roadmap row's factual state, attach deterministic test and browser/provider acceptance evidence, log release commit and blockers, and amend `CHANGELOG.md`.
- **Versions:** user-visible app releases bump **both** package versions; audit and roadmap-only changes leave `0.2.0` unchanged. Record Vercel production SHA separately.
- **Status must remain truthful:** source docs state intent, repo proves implementation, database proves records, CI proves build checks, signed-in browser/provider proves functional acceptance. None replaces the others.
