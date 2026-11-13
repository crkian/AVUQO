# AVUQO · LIVE Production Delivery, Partner Pipeline & Visual Acceptance Register
**Owner direction: 13 November 2026 · Implementation target: `https://www.avuqo.com` production, not a collection of permanent /preview routes**

## Product decision (locked as direction)
**AVUQO. Find what's worth it.** One canonical catalogue supports **Compare** (correct same-product/variant all-in retailer offer comparisons) AND **Discover bargains** (genuine observed discounts and worthwhile promotions). A retailer's affiliate commission must never influence organic rankings or AVUQO Score. Preserve the existing warm, inviting premium appearance in the supplied reference boards. Do not create a separate dropshipping shop without an explicit commercial/fulfilment decision.

## Evidence and statuses
- `LIVE`: route/code is on verified production commit. Does **not** imply provider data is approved.
- `READY FOR APPROVAL`: provider offers application or API, AVUQO not accepted/credentialed.
- `INVESTIGATE`: lead or capability to verify, not a contracted partner.
- `BLOCKED`: legal, security, rights, feed, product identity or commercial approval still needed.
- **All external names below are leads, not active AVUQO partners unless stated as an existing account/integration.** Never invent live quotes, price cuts, scores, reviews or stock to resemble mockups.

## P0: Production presentation (start immediately)
| ID | Target LIVE production route | Action | Source of design truth | Acceptance |
|---|---|---|---|---|
| UI-001 | `/` | Restore photo-led warm premium hero, decisive Compare vs Discover bargains CTAs, useful category picture tiles and product-quality navigation. | `docs/design/AVUQO_WARM_PREMIUM_VISUAL_IDENTITY_2026-11-05.md`; `docs/design/AVUQO_PAGE_BLUEPRINTS_AND_DESIGN_COVERAGE_2026-11-05.md`; owner 13-Nov image attachments | Responsive mobile and desktop, real routes, no sample discount/score |
| UI-002 | `/sales`, `/black-friday`, `/christmas`, `/easter`, `/valentines` | Reconcile seasonal reference boards and existing pages. Schedule seasonal promotion at appropriate times, editorial fallbacks otherwise. | `docs/design/mockups/seasonal-*.png` and `docs/design/AVUQO_ASSET_REGISTER_2026-11-05.md` | Visible on production with permitted editorial assets and no fake product price evidence |
| UI-003 | `/products`, `/products/[slug]`, `/categories/[department]/products` | Make canonical item pages image-rich **only** for permissioned image sources; compare all-in prices only from eligible offers. Preserve valid empty states. | `docs/design/mockups/product-profile-page-set.png` and `full-storefront-and-navigation-concept.png` | Live customer routes, verified image rights and product identity, no preview dependency |
| UI-004 | shared header, mobile navigation, `/groceries`, `/saved`, `/watches`, `/lists`, `/travel` | Deliver coherent warm-premium styling and working links on all real pages. | Design mockup boards and `docs/design/AVUQO_WARM_PREMIUM_VISUAL_IDENTITY_2026-11-05.md` | Production-verified desktop 1440px and mobile 360/390px, keyboard and no overflow |
| UI-005 | Control Centre | Track visual delta screenshots, provider/source status, last verified production SHA, asset rights and owner acceptance; owner-only not publicly indexed | Existing Control Centre; no duplicate sources registry | Clear live/blocked state, explicit release approvals |

**Design assets located in Git:** `docs/design/mockups/`, `docs/design/AVUQO_ASSET_REGISTER_2026-11-05.md`, `docs/design/AVUQO_PAGE_BLUEPRINTS_AND_DESIGN_COVERAGE_2026-11-05.md`, `docs/design/AVUQO_WARM_PREMIUM_VISUAL_IDENTITY_2026-11-05.md`, branch `design/warm-premium-visual-system-20261105`, older PR #83. Some listed high-resolution image assets were originally in a ZIP rather than committed; **verify a file exists before depending on it**. Owner's Nov-13 screenshots are concept references, not evidence of live data, prices or reviews. No merchant photo may be republished merely from an old feed URL.

## P0: Current supplier releases (known AVUQO infrastructure)
| ID | Source | Mode | Next action | Public blocker |
|---|---|---|---|---|
| DATA-001 | Awin, existing joined programmes | Product CSV/feed, private staging | Reconcile 13-Nov active feed inventory; validate joined advertiser, links, current download, price, stock, image rights for Petlibro, Craft Buddy, Cadbury, PlayPress first | Rights, freshness, variant identity, owner publication approval |
| DATA-002 | Awin larger catalogues: Mozillion, Tooled Up, tyres suppliers | Physical products plus sector-specific contracts/tyre fitment | Validate replacement Tooled Up feeds, phone condition/grade, tyre fitment, resumable imports | Stale/withdrawn feeds, specialist comparison and image licence |
| DATA-003 | eBay Buy Browse UK | Sandbox already exercised by owner; Production application submitted | Await actual restricted Production API approval; keep keys server-side | Browse approval and separate images/affiliate rules |
| DATA-004 | Awin no-observed-feed service programmes | Authorised deep link, merchant-provided API or licensed feed | Contact partner or search affiliate tools individually; no web scraping | Current programme/offer terms and data rights |

## P1: Supplier & dropshipping lead list (do NOT confuse with an affiliate marketplace)
| ID | Provider | Candidate capability | Access/fit decision | Next action |
|---|---|---|---|---|
| SUP-001 | **Avasam** (`https://www.avasam.com/dropship-suppliers/`) | UK supplier sourcing, marketplace and order workflow | **Investigate.** Primarily for AVUQO as retailer-of-record; not automatically an affiliate product feed | Ask whether read-only authorised catalogue/image API and referral model exist; assess stock, VAT, returns, shipping and wholesale margin |
| SUP-002 | **Syncee** (`https://syncee.com/`) | Supplier marketplace and catalogue/stock sync | **Investigate.** Its normal solution connects stores to suppliers and manages orders; external feed manager has platform restrictions | Verify a supported Next.js/custom ecommerce path, availability of legal export/API for comparison, image rights, cost and who sells |
| SUP-003 | **UK wholesalers / direct suppliers** | Direct approved CSV/XML/JSON or REST catalogue/stock API | **Investigate** merchant-by-merchant, especially home, garden, electronics, gifts, golf equipment | Contact via `support@avuqo.com`, request UK feed sample, EAN/GTIN, licensed images, shipping, expiry and reseller/referral terms |
| SUP-004 | **impact.com / CJ Affiliate** | Approved merchant affiliate links, some feeds/APIs | **Not applied/approved here by default** | Use the existing source connectors; seek publisher acceptance and merchant-specific licences, don't register duplicate accounts |

**Commercial decision gate before dropshipping checkout:** AVUQO currently refers customers to external retailers; becoming seller of record adds payment handling, consumer return obligations, supplier fulfilment SLAs, tax/VAT, delivery promises, fraud and dispute handling. **Pilot in separate architecture only after owner explicitly authorises it.** Preferred immediate path is affiliate comparison/referral feed with authorised retailer photos, not order fulfilment.

## P1: Holidays, travel, activities, golf and insurance
| ID | Lead | Capability supported by provider | Gate / path |
|---|---|---|---|
| TRV-001 | **Booking.com Demand API** `https://developers.booking.com/demand` | Accommodation, car rentals and attractions with partner integration flows | Managed Affiliate Partner / token access required; content/search-and-redirect path first; rights and rates/availability contract |
| TRV-002 | **Expedia Rapid API** `https://partner.expediagroup.com/en-gb/solutions/build-your-travel-experience/rapid-api` | Partner lodging shopping/booking; car/activity capabilities vary | Apply for partner access, comply with API launch requirements; do not present live holiday package inventory without it |
| TRV-003 | **Travelpayouts** `https://support.travelpayouts.com/hc/en-us/articles/20384016664594-Brands-that-provide-access-to-APIs-and-data-feeds-for-Travelpayouts-partners` | Some brands provide flight, transfers, hotels, activities/eSIM APIs or feeds | Each brand has its own eligibility and traffic threshold; distinguish static destination data from live prices |
| TRV-004 | **Golfbreaks** `https://www.golfbreaks.com/en-gb/about/affiliate-scheme/` | Golf trip operator with published partner contact | Partnership enquiry first; **no public self-service golf-travel API verified**. Request packages/content availability/deep links/images and price/availability rights |
| TRV-005 | **Elite Golf Holidays** `https://elitegolfholidays.com/golf-holiday-affiliate-programme/` | Lead/referral programme with specialist handling of enquiries and bookings | No API verified. Referral/golf editorial trial only if approved; don't invent package quote |
| TRV-006 | **GroupiaGolf** `https://groupiagolf.com/affiliate` | Golf group-trip affiliate enquiry programme | No API verified. Check audience/commission eligibility and authorised links |
| INS-001 | **Seopa / Quotezone** `https://www.seopa.com/` | UK insurance/utilities partner platform, affiliate and white-label comparison | Financial promotions / FCA-perimeter and white-label compliance review; do not ingest personal quote details without lawful basis |
| INS-002 | **HelloSafe Atlas** `https://atlas.hellosafe.com/en-gb/platform/` | Travel insurance quote/compare API, tracked referrals and white-label | Verify UK coverage and provider authorisation, personal-data processing, disclosures and integration terms before quote UI |
| INS-003 | **Coverontrip Partners Club** `https://travelinsurancecot.co.uk/partners-club/` | Travel-insurance affiliate links, white-label and possible API development | Contact for UK suitability, licence/regulatory responsibilities and quote-data permission |
| INS-004 | **Treppy** `https://www.treppy.io/integrations/api/` | Partner API for travel insurance quote/compare/purchase | Approved access required; regulatory/UK availability and quote data handling to verify |

### Additional leads for later
- Flights: Skyscanner partner API eligibility, Travelpayouts brands; do not turn destination statistics into a bookable flight.
- Attractions/experiences: Travelpayouts partners (Viator/Tiqets/WeGoTrip depending on rights), authorised attraction feed and images.
- Car hire, airport parking, transfers, city breaks, cruises: Booking.com/Expedia where licensed and Awin joined programme Holiday Extras; check real rates and availability.
- Golf **equipment** (physical retail product) belongs in the main product comparison catalogue. Golf **holidays** need dated packages, transport and travel-specific price handling.
- Energy, broadband, SIM, breakdown and finance from Awin require plan/term comparison or verified referral, **not ordinary stock cards**.

## P1: partner outreach and access log (Control Centre; source of truth)
Per provider record: commercial type (affiliate / reseller / direct feed / quote/API), website, partner/contact URL, use-case, programme advertiser ID, contact `support@avuqo.com`, application date, status (lead/contacted/applied/approved/rejected), API docs, scope, source ID, feed ID, rights document/evidence (no secrets), image-use/hosting/caching terms, tracking permission, GBP/UK coverage, freshness SLA, renewal/next step, owner review and publication gating. eBay keeps existing registration Gmail. Do not copy private Awin signed URLs or tokens to Git.

## Immediate production acceptance protocol
1. **NO perpetual preview launch**: public editorial journeys go onto actual production pages. Keep `/preview/*` only for owner diagnostics and unsupported data, never as the primary commercial route.
2. **Release UI separately from provider data**: hero, category/seasonal assets, navigable comparison and bargain journeys can go live without fake prices or fake product discounts.
3. **Only eligible real products enter customer routes** after current authorised data, image licence, correct variant matching, stock, delivery and disclosure checks. Where none, show useful guides/empty states.
4. **Visual QA**: screenshot comparisons against supplied conceptual designs on desktop and phone; identify missing imagery/cards/spacing/contrast/nav. Do not copy fictional product prices, star scores, price histories, claims or arbitrary customer metrics shown in mockups.
5. **Operational QA**: tests, lint, security, Vercel preview, merge to main, exact Vercel production SHA READY and custom domain, desktop/mobile owner signoff.
6. **Branch cleanup**: reconcile older design PR #83 and #93 against current main; preserve useful assets and original design sources. Do not blindly merge old branches or discard unreviewed changes.

## Sources
Research checked 13 Nov 2026 at the official URLs in each provider row, especially Booking.com Demand documentation, Expedia Rapid, Travelpayouts data-feed policy, Avasam, Syncee, Golfbreaks, Seopa and HelloSafe. These demonstrate product offerings, **not acceptance of AVUQO**. Uploaded screenshots and original project design files are the visual brief. This is a versioned backlog, not live provider onboarding.
