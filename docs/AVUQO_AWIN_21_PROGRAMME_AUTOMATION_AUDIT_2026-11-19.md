# 21-advertiser automatic shopping coverage: production audit and private bulk repair
**Observed:** 19 November 2026, at around 15:00 UTC from AVUQO production Supabase. Branch: `fix/awin-all-advertiser-automation-20261119`.

## Facts, separated correctly
- **21 of 21 accepted** Awin programme records have owner-confirmed membership and publication declarations. Internal `affiliate_programs.status=pending` is a separate status, not evidence an Awin membership is awaiting network approval.
- **74 active observed Awin feeds** exist for **12** of those 21 advertisers. Nine have no active feed in this snapshot; some offer contract, parking, insurance, travel, energy or locally quoted services rather than an ordinary shippable-product catalogue.
- **Seven of 21** have nonzero imported private product rows: Tooled Up (84,284), Tyres UK (31,372), Cadbury Gifts Direct (4,111), Craft Buddy (2,619), Mozillion (883), Petlibro (142), PlayPress Toys (40). Private inventory is not live consumer inventory.
- **Five of 21** have independently approved canonical offers: Tooled Up (721), Petlibro (33), PlayPress Toys (33), Cadbury Gifts Direct (31), Mozillion (15) at query time. Confirm consumer-visible offer status and public selection separately.
- **Pneus Online** Awin advertiser 15236, feed 26513: 19,890 authenticated rows are validated and stored in a private snapshot but **zero committed product rows**. The worker's hourly attempt misleadingly recorded `already_claimed_or_not_ready`, because the database `claim_private_awin_bulk_job` function required `sources.status=paused` while the owner-approved Awin source is now `active` with `sync_enabled=true`. No claim/lease attempts occurred.

## Code and database correction
- `supabase/migrations/20261119153000_active_awin_private_bulk_claim.sql`: permit private job claims while Awin remains legitimately paused **or** when the current source is active/credential-ready and owner-attested, its exact advertiser is accepted and approved, ingestion is enabled, and the global stop is off. Keep existing locked 250-row resumable session and source-digest checks, owner attribution, attempt ceiling, snapshot integrity and service-role-only EXECUTE permissions.
- `app/api/internal/awin-pneus-private-import/route.ts`: a failed RPC is now a failed job with a stable safe error category, not a misleading successful `already_claimed_or_not_ready`.
- Private cron journal records `portfolio_rotation` attempts and outcomes; owner dashboard shows all 21 with the actual observed feeds, private rows, live rechecks and approved canonical offer records. New required regression test protects this migration.
- **Private only**: the Pneus feed has historically lacked an explicit currency column, so its rows remain excluded/quarantined. Neither the migration nor the worker infers GBP, tyre load/speed or fitment. No direct public release or bypass of existing scoring/offer gates.
- Use production migration tool only after reviewed CI; independently check SQL, grants, job progress and recent crons. A CRON runs on its existing schedule, and the release must not claim products committed until the checkpoint confirms them.

## Per-programme coverage and remaining work
| Advertiser | Awin ID | Observed active feeds | Private product rows | Public offer approval | Next correct work |
|---|---|---|---:|---|---|
| 1pMobile | 37738 | 1 | 0 | None | SIM tariff/contract adapter, totals and terms |
| AutoAid Breakdown | 36276 | 0 | 0 | None | Discover current breakdown-service link or provider quote |
| Broadband Genie | ID missing | 0 | 0 | None | Map true programme identity and comparison referral |
| BroadbandCoop & MobileCoop | ID missing | 0 | 0 | None | Map programme identity and broadband/mobile term adapter |
| Cadbury Gifts Direct | 736 | 1 | 4,111 | Yes | Continue strict private physical-feed refresh and live release |
| Chattr Sim Only | 115559 | 0 | 0 | None | Source/contract terms connector, not an ordinary product importer |
| Christmas Letters from Santa | 35299 | 0 | 0 | None | Establish active seasonal feed or permitted campaign deep links |
| Compare Parking Prices UK | 118401 | 2 | 0 | None | Booking/date/location quote adapter |
| Craft Buddy Shop | 45747 | 2 | 2,619 | None | Licensed-creative and category/stock checks before public release |
| EPCs, Gas Safety Certificates and Electrical Check | 25022 | 1 | 0 | None | Postcode/service and qualification-specific pricing |
| Holiday Extras | 3496 | 0 | 0 | None | Referral/booking quote API and cancellation conditions |
| Lyca Mobile UK | 128157 | 2 | 0 | None | Contract/allowance and minimum-term adapter |
| Mozillion | 31539 | 5 | 883 | Yes | Continue physical 74135 handset feed; keep travel eSIM/plan feeds separate |
| Onestream | 23296 | 0 | 0 | None | Broadband service terms and coverage adapter |
| Petlibro UK Affiliate Program | 77952 | 5 | 142 | Yes | Continue observed UK retail feed rotation with image/sale terms |
| PlayPress Toys UK | 101445 | 2 | 40 | Yes | Continue approved physical feeds |
| Simply MOT (UK) | ID missing | 0 | 0 | None | Map programme identity and local service/appointment connector |
| Tooled Up | 496 | 53 | 84,284 | Yes | Continue specialised full master-feed stream, observed-price refresh |
| Tyres Pneus Online UK | 15236 | 1 | 0 | None | Resume 19,890-row **private** snapshot; currency quarantined |
| Tyres UK | 12715 | 1 | 31,372 | None | Continue live rechecks; exact load/speed/fitment verification |
| Your Co-op Energy | ID missing | 0 | 0 | None | Map programme, current tariff coverage and service adapter |

## What cannot be truthfully marked complete
Network approval, automatic feed discovery, private imported SKUs, fresh verified rows, published canonical offers, and customer-visible product pages are separate deliverables. The site does not automatically stock every accepted service advertiser. A 21-programme automation goal requires a merchant-specific physical-products, service-price, booking/quote, or referral workflow for each relevant programme. No invented feed IDs, product rows, terms or GBP prices.
