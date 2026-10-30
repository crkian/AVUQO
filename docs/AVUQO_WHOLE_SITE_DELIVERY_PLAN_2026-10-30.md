# AVUQO whole-site delivery plan
**Baseline:** 30 October 2026 | **Source:** AVUQO master source of truth (28 October), current `main`, connected Vercel production deployment and read-only Supabase inventory.  
**Mission:** Find what's worth it. A trustworthy, usable UK shopping, grocery and comparison service with commission-independent scores.  
**Rule:** Improve the existing app in small verifiable changes, do not overwrite newer work from historical ZIP snapshots, and do not activate any source or marketing publisher without actual credentials, contract rights and owner approval.

## Verified baseline and exclusions
- Production Vercel reported READY for `main` SHA `13d2549dfc76fde7e87daac0db9d8041e9687791` on 30 October. READY does **not** certify public UX or merchant integrations.
- Existing navigation v2 and owner-managed drafts are implemented; missing published navigation content means safe code defaults matter.
- Source registry contains Awin and other programmes, but current source rows do not prove publishing rights. Six stored offers, zero offers linked to an approved, ready source; zero affiliate programme rows and zero affiliate conversion rows.
- Nine grocery store records, zero published grocery prices. Never manufacture savings or claim complete comparisons where data is missing.
- Marketing system has publishing OFF, AI OFF and emergency stop ON; zero publication jobs and zero connected marketing channel rows.
- Existing `.github/workflows/quality.yml` already builds and lints PRs. Extend rather than duplicate.
- Open reviews as of planning: PR #19 (Control Centre/workspaces/site advertising), PR #20 (affiliate approval hardening). Neither is an automatic green light to deploy.
- Internal test offers, fictitious deals, sample pricing, unknown advertiser permissions and unverified creatives must remain separate from public verified evidence.

## Phase 0: Security, release discipline and operational truth (P0)
| Item | Work | Acceptance gate |
|---|---|---|
| A0.1 | Review and complete PR #20, including negative tests for admin vs owner approval and programme/source eligibility. | CI green; role tests pass; owner reviews before merge. |
| A0.2 | Review remaining Supabase warnings: two owner-guarded publishing RPCs and leaked-password protection. | No unjustified privileges; legal/editorial owner publishing still works; password protection configured where supported. |
| A0.3 | Protect secrets, production environments and database RLS; verify public/anonymous role behaviour and read-only data exposure. | No secrets in repository, logs, builds or archives; anonymous access cannot change admin content. |
| A0.4 | Establish release checklist: source SHA, CI, preview, authenticated owner/admin/customer, mobile, rollback and post-deploy smoke checks. | Failed checks block production. |
| A0.5 | Verify cron/health alerts, error state visibility and fail-closed affiliate redirect host policy. | Exceptions actionable; expired or unapproved offers never produce monetised clicks. |

## Phase 1: Connected consumer shopping journeys (P0)
| Item | Work | Acceptance gate |
|---|---|---|
| B1.1 | Fix saved/watched/shared-list deal URLs, preserving historical fixture bookmarks and routing UUID offers to `/live/`. **Started in this branch.** | Unit tests pass; sign-in/save/watch/add-to-list/view/remove flows work on desktop and mobile. |
| B1.2 | Improve sitewide search and category discovery; build appropriate suggestions and clear empty/error states, without pretending source data exists. | Relevant exact products found where authorised; no false deals; keyboard/mobile accessible. |
| B1.3 | Add genuine side-by-side comparison of eligible offers and full delivered cost; keep illustrative contract calculator labelled separately. | Exact product/variant matching; shipping distinctions and observed timestamps visible. |
| B1.4 | Strengthen verified product/deal templates with evidence, image rights, history provenance and usable retailer selection. | All visible offers pass the same admission gates as outbound links. |
| B1.5 | Finish Saved, Watches and shared-list experiences, including privacy, notifications opt-in, permissions and correct current-vs-saved prices. | User data private; stale/offline watch states clear; no unsupported automatic-alert promises. |
| B1.6 | Test homepage, mega navigation, tablet/mobile dock, browser back/forward and key conversion paths. | No broken internal links or blocking layout issues at 320–760px/mobile and desktop zoom. |

## Phase 2: Authorised inventory and revenue (P0, dependent on approvals)
| Item | Work | Acceptance gate |
|---|---|---|
| C2.1 | Get owner-confirmed Awin publisher/advertiser approval, approved data use, image rights, feed formats and credentials, kept in private server environment. | One real merchant feed syncs end-to-end with documented rights and evidence. |
| C2.2 | Normalise SKUs, GTINs, variants, availability, delivered prices and genuine reference prices; review matching confidence. | No duplicate variants or fabricated discounts; stale/offline records removed from public output. |
| C2.3 | Secure `/go/[offerId]` against unexpected redirect hosts and unsafe programme routing, with consent-aware click attribution. | Approved destinations only; click metadata excludes sensitive information. |
| C2.4 | Reconcile network conversion reports to orders, reversals and confirmed commission. | Network and dashboard reconciliation demonstrated with real accepted transactions. |
| C2.5 | Add eBay, impact.com, CJ, Webgains, Amazon and direct partners one at a time **only** after network and advertiser approval. | Every integration passes provider terms and automated source-rights checks. |

## Phase 3: Groceries and budgeting (P1, dependent on retailer data rights)
| Item | Work | Acceptance gate |
|---|---|---|
| D3.1 | Verify legal rights and retailer access to current grocery prices; build or approve product/pack matching and price freshness. | No guessed retailer prices, no unlawful scraping, no ambiguous unit costs. |
| D3.2 | Complete basket coverage and savings engine (delivery, loyalty limitations, substitutes, unavailable items). | Cheapest-basket wording only for full, comparable coverage; otherwise show missing items. |
| D3.3 | Join grocery lists, household collaboration, personal observations and supermarket comparisons. | Personal prices never mislabelled as verified retailer prices. |
| D3.4 | Build working Budgeting & Savings hub, then add to primary navigation. | Transparent calculations, privacy and clear links to real shopping data. |

## Phase 4: Two distinct growth workspaces (P1, not default-on)
| Item | Work | Acceptance gate |
|---|---|---|
| E4.1 | Affiliate Promotion Intelligence: route only approved, price-verified candidates to reviewed channel content. | Commission cannot affect AVUQO Score or organic ranking. |
| E4.2 | Brand Social Marketing: approved facts, reviewed AI drafts/images, channel verification, scheduling, provider dispatch and reconciliation. | Brand isolation, usage rights, owner approval, cost caps and global stop tested; live flag off until authorised. |
| E4.3 | Site Advertising: develop PR #19 separately for verified third-party advertisers, contracts, placement disclosure, privacy and eventual billing. | Sponsorship is always labelled, independent of organic scoring; no ads/billing until approved and tested. |
| E4.4 | Control Centre: reorganise operational workspaces and reveal live source health, import review, failures, campaign analytics and reconciliation. | Owners can see blockers rather than misleading zeroes or green indicators. |

## Phase 5: Expansion and finishing (P2)
- Travel and experiences only with approved providers, actual dates, fees and cancellation terms.
- Category-specific UX and product templates for Tech, Home, Fashion, Beauty, Motoring and Services.
- SEO content quality, accessible media, structured data, technical performance, consent handling and user support.
- Conversion and retention analytics with privacy-by-design; audit mobile, screen readers and all major flows before launch claim.

## Release and safety gates for every PR
1. One vertical slice; changes originate from the latest Git main and do not silently overwrite independent feature branches.
2. Reproducible `npm ci`; Node 24 typecheck, lint, tests and Next build; Vercel preview reviewed.
3. Anonymous, customer, admin and owner role checks where applicable; RLS and database changes verified separately.
4. No fabricated merchant pricing, unsupported lowest-price claims, invented permissions, misleading mock listings or cross-brand publishing.
5. External redirects, emails, scheduled publications, AI spending, new paid placements and changes to production secrets require explicit readiness and controlled enabling.
6. Production release after documented green gates; monitor endpoints, functionality and failed jobs; maintain rollback path.

## Next queue after this branch
1. Finish PR #20 checks and owner review.
2. Validate B1.1 saved/watch/list fix in preview with an existing fixture and an eligible UUID offer.
3. Implement B1.2 search results with fast indexed matching only on admitted, licensed catalogue data, plus accessible no-results paths.
4. Add side-by-side offer comparison and exact-variant presentation (B1.3).
5. Partner onboarding and source authorisation (C2.1) in parallel with consumer UX, without activating sources prematurely.

**Status language:** `implemented in branch` is not `merged`; `merged` is not `deployed`; `deployed` is not `verified live`. Maintain that distinction in every release note.
