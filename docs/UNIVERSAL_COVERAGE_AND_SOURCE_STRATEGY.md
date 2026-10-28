# AVUQO Universal Comparison Coverage and Source Strategy

**Decision, 28 October 2026:** AVUQO is a universal UK value and savings comparison platform, not only a retail, deals or grocery site. "Find what's worth it" applies to recurring bills, service contracts, travel, motoring, insurance and household spending.

This document extends the existing source of truth; it does not supersede the original product and grocery specifications.

## Coverage map and first-wave priorities

| Sector | Compare fairly using | Likely source route | Current verified connection |
|---|---|---|---|
| Mobile and SIM-only | Total contract cost, data, speed, roaming, annual rises, upfront costs | Approved telecom affiliate feeds and direct network partnerships | None |
| Broadband and fibre | Address availability, minimum speeds, upfront/installation fees, term, annual rises, total cost | Approved provider/affiliate APIs | None |
| TV, Sky and streaming | Channel/sport inclusions, bundle terms, price changes, activation, contract and total cost | Provider-approved partnerships | None |
| Energy and household bills | Region, meter/tariff, standing charges, consumption, exit fees, eligibility | Licensed/approved energy tariff integrations | None |
| Insurance | Coverage/excess, limits, exclusions, personalised regulated quotes | FCA-compliant partners/authorised journeys | None |
| MOT, servicing and repairs | Real garage, permitted services, location, booking slots and all-in price | Authorised garage/booking partners | None |
| Breakdown, tyres, leasing and EV charging | Total payable cost, availability, excess/mileage/term | Direct data feeds and approved partners | None |
| Groceries | Exact pack/brand, units, complete baskets, store and delivery conditions | Permissioned retailers plus product metadata | No live supermarket price feeds |
| Retail and consumer goods | Exact product/variant, retailer stock, delivery cost, observed prices | Awin, CJ, impact, eBay, direct merchant feeds | Awin connector coded; not configured. Private AKKO import pilot only |
| Flights, accommodation and travel | Date, route, availability, taxes, baggage, cancellation, total price | Approved travel partners | Booking.com and Skyscanner registered, not connected |
| Home services and utilities | Region, service scope, contract, termination fees and all-in price | Authorised referral/provider feeds | None |
| Finance and lending | Representative vs personalised terms, fees, suitability and regulated disclosure | Authorised partners and consented journeys | None |

Other future categories: childcare, parking, public transport, pets, dental, gyms, subscriptions, business services, home improvements, waste collection, solar and heat pumps. Discovery does not imply connection or coverage.

## Connector states must remain distinct

**Registered → Credentials configured → Contract/permission verified → API/approved feed reachable → Ingestion tested → Evidence checked → Approved for publication.**

A dashboard button marking a source active does not mean it is connected. A response from an HTTP endpoint is not a current price. A feed record or historical import is not an approved offer. Never describe the first six as the seventh.

## Shared canonical data model

Preserve common provenance, operator permissions, evidence timestamps, geography, currency, terms and audit trail. Build **category adapters** for:
- **Product offer:** item and variant, unit, delivery, stock and historic price.
- **Contract offer:** recurring cost, term, introductory and later prices, annual increases, upfront fees and eligibility.
- **Utility tariff:** region, usage assumptions, standing charges, unit prices, exit fees and tariff dates.
- **Insurance quote:** user-specific assumptions, excess, cover, regulatory disclosure, validity and consent.
- **Booking:** dates, location, availability, fees, cancellation terms and confirmed partner inventory.
- **Service quote:** postcode/service coverage, inclusions, appointment slot and total cost.

The AVUQO Score must never collapse unlike offers into a misleading comparable number. Affiliate commission never affects organic value ranking. Treat unknown facts as unavailable, not zero.

## Recommended delivery sequence

1. Finish the private Live Data Monitor and enforce fail-closed publication rules.
2. Implement a **Coverage Matrix** in the existing Control Centre, making source status explicit per category.
3. Obtain authorised credentials and agreements for Awin, then telecoms/broadband/TV partners. Keep other connectors as not connected until verified.
4. Create telecom contract comparison schema, total-contract-cost calculator and tests with labelled fixtures, then add approved real providers.
5. Add insurance, energy and automotive through specialist data models, partner/legal checks, and human review.
6. Expand all categories without auto-publishing unverified offers, duplicating incompatible datasets or buying new resources without approval.

### Current evidence and blockers

As checked 28 October 2026: Vercel has no configured third-party affiliate network credentials; Awin has a coded connector but never synced; one 910-product AKKO UK feed was imported twice (1,820 rows), permission status unverified. Other source registry entries are paused and unconfigured. Open Food Facts research preview is coded but is not a supermarket-price feed. These are implementation facts, not guaranteed current external provider permissions.

**Production safeguard:** no fake price, coverage, authorised partnership, comparison quote or offer is exposed to consumers. Preview and production currently use the same Supabase project, so do not run synthetic imports or destructive tests.
