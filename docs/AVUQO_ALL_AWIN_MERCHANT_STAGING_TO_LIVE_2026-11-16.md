# AVUQO · All Awin merchants: automatic staging to genuine live offers

**Observed 16 November 2026, Europe/London.** This is the complete **19-programme evidence register** joined to the **16-programme numeric joined ID allowlist** and the **74 current monitored feed IDs across 11 advertisers**. The extra PlayPress numeric ID 101445 appears in the programme ledger but **not** in the 16-ID joined allowlist; two records have no numeric ID. Programme membership and feed-list row counts do not establish licence or live offer availability.

## Owner instruction and definition of "all live"

**Target:** every supported Awin programme should stage eligible supplier content automatically, validate offers, then publish **every genuinely eligible current offer live** and withdraw it when price, stock, licence, feed or validity changes. This is **not** a perpetual manual one-product pilot and not a blanket approval of unknown licence/price data. Manage independent lanes per merchant and category so one pending advertiser doesn't freeze all others.

- **Observed feed**: Awin metadata lists a feed ID and row estimate. No product price proof.
- **Privately staged**: full validated snapshot / import, not accessible to shoppers; source may remain paused.
- **Draft matched**: canonical products identified and deduplicated, still no customer offer.
- **Release-eligible**: fresh GBP, stock, landed price, exact variant, compliant tracking, advertiser & third-party rights, relevant contract or fitted-price rules, source gates.
- **Live offer**: real signed-out customer page visible, all admission checks pass, available referral and independent value scoring, with reliable automated refresh, expiry and withdrawal.

**Verification today:** 251 Awin-keyed draft products (Petlibro 22 and Mozillion 229), **zero public Awin offers**, **zero approved Awin offer-release records**, global Awin source **paused** / sync off / permission pending, and **zero recorded private cron attempts** at latest 16 Nov check. The four existing small-feed import routes and Tooled Up private snapshot/validation are **deployed**, but a route existing does not mean a fresh feed completed. Owner Control Centre run-now controls are live in production [PR #216](https://github.com/crkian/AVUQO/pull/216) but no authenticated owner test was witnessed.

## The complete 19-programme rollout matrix

| Programme | Awin ID | Lane | 16 Nov observed feed inventory | Current private infrastructure | Specific blocker |
|---|---|---|---|---|---|
| Cadbury Gifts Direct | 736 | physical | 1 feed | small feed private import+candidate reconcile | current auto feed currency tracking stock and sale exclusion |
| Petlibro UK Affiliate Program | 77952 | physical | 5 feeds | small feed private import+candidate reconcile | fresh auto data and advertiser id 77952 vs 77942 evidence |
| Craft Buddy Shop | 45747 | physical | 2 feeds | google private import+candidate reconcile | fresh google auto and third party ip |
| Tooled Up | 496 | physical large | 53 feeds | immutable master snapshot+full file validation | first snapshot sha validation GBP then resumable 250 row stage |
| Mozillion | 31539 | mixed handset contracts | 5 feeds | SIM free handsets private import+candidate reconcile | fresh exact grade and separate contract efeed models |
| Tyres UK | 12715 | specialist tyre | 1 feed | historical private staging | exact fitment stock delivered or fitted total and rights |
| Tyres Pneus Online UK | 15236 | specialist tyre | 1 feed | dedicated private schedule | fitment land price and advertiser evidence |
| Holiday Extras | 3496 | travel services | Not observed | feed discovery only | session quote booking terms and comparison model |
| Onestream | 23296 | broadband services | Not observed | feed discovery only | postcode eligibility contract term and total cost |
| EPCs, Gas Safety Certificates and Electrical Check | 25022 | certification service | 1 feed | feed discovery only | geographic price scope and booking model |
| Christmas Letters from Santa | 35299 | personalised merchandise | Not observed | feed discovery only | product or service eligibility refund and delivery |
| AutoAid Breakdown | 36276 | breakdown cover | Not observed | feed discovery only | coverage exclusions eligibility and service model |
| 1pMobile | 37738 | mobile sim | 1 feed | feed discovery only | plan duration usage bands and total cost |
| Chattr Sim Only | 115559 | mobile sim | Not observed | feed discovery only | monthly price data allowance contract and terms |
| Compare Parking Prices UK | 118401 | parking service | 2 feeds | feed discovery only | dated location quote referrals and complete cost |
| Lyca Mobile UK | 128157 | mobile sim | 2 feeds | feed discovery only | plan country data and monthly terms |
| PlayPress Toys UK | 101445 | physical unverified join | Not observed | not in 16 joined registry | verify joined account profile and exact feed rights |
| Your Co-op Energy | ID not confirmed | energy services | Not observed | programme record no id | resolve numeric advertiser id and supplier tariff quote |
| BroadbandCoop & MobileCoop | ID not confirmed | broadband mobile services | Not observed | programme record no id | resolve numeric advertiser id and service data contracts |

**Inventory maths:** 74 **feed IDs** among 11 observed advertisers, not 74 unique merchants. Tooled Up alone has **53 feeds**, many brand/category overlaps with the 84,256-row master; its 208,678 summed listed rows **are not 208,678 unique products**. Petlibro has five listed feeds beyond the single 103580 pilot; Mozillion has five including contracts/other types and cannot all use the handset adapter. 19 programme evidence rows comprise 17 numeric IDs and two currently unidentified IDs. Of those 17 numeric, 16 are in current joined-programme code; PlayPress needs independent joined-profile verification.

## Why simply switching the source to live would be incorrect

The existing public admission in `lib/products/public-catalog.ts` requires an **active/sync-ready source with verified publication and price evidence**, `AWIN_ADVERTISER_ID` matching a released offer, a current approved `awin_offer_release_reviews` record tied to **the exact observed price and score timestamps**, and a freshly matched active `offers` row. Right now Awin uses one globally paused source. Changing only that source would be **overbroad** and would not create compliant prices, licence proofs or releases. The current review model also cannot automatically accept every daily price change without an explicit new merchant-scoped policy.

The correct next architecture is **merchant-scoped admission** with recorded current advertiser image/price rights, source/stock/price and seller/condition evidence, permitted feed types, independent scoring, controlled first release, then deterministic automatically audited subsequent updates and withdrawals. The owner's broad intent drives this automation; retailer/trademark/IP licences are still separate. Unknown or image-restricted items may stage privately and can be considered for **image-free** public display where all other rights are verified.

## Priority to finish Awin, in order

1. Inspect the 17 Nov private six-job journal and current owner-run preflight to diagnose why no new 16 Nov four-pilot imports appeared. Record exact categorical outcomes, not guesses.
2. Confirm current Petlibro and Mozillion prices/stock and feed rights; complete modern AUTO staging for Cadbury and Craft Buddy. Do not populate from 4 Nov manual review rows.
3. Capture and fully validate Tooled Up master; connect the **existing** 250-row resumable bulk importer after documented GBP evidence, without rewriting importer code or duplicating 53 overlapping feeds.
4. Add tyre specialist landed/fitted total/fitment and separately onboard other verified physical suppliers such as PlayPress **after** joined evidence.
5. Build full quote/contract adapters for SIM, broadband, parking, holiday, energy and breakdown services; these are not physical SKU feeds.
6. Implement safe **per-merchant** activation and automatic latest-price offer updates/withdrawals, then run true signed-out public page and tracked-link acceptance. Never present historic feed row counts as live offers.
7. Update [active handover](AVUQO_ACTIVE_HANDOVER.md), [Awin board](AVUQO_AWIN_COMPLETION_BOARD_2026-11-16.md), [branch/feature tracker](AVUQO_GIT_BRANCH_SOURCE_FEATURE_TRACKER_2026-11-16.md), status and changelog **after every material investigation, action or failure**, keeping this matrix current.

**No source flags, merchant approvals, offers, privacy controls or suppliers were changed by producing this matrix.**
