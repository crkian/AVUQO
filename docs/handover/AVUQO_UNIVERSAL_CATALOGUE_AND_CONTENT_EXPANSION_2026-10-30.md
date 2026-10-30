# AVUQO — Complete Product Content, Data Sources & Million-Listing Expansion Handover

**Date:** 30 October 2026  
**Project:** AVUQO  
**Website:** https://www.avuqo.com  
**Core principle:** Find what's worth it.  
**Document purpose:** Transfer all decisions, research, recommendations and development intentions from this conversation into another AVUQO development chat.

---

## 1. IMPORTANT: What has actually been done in this conversation?

This conversation concentrated on planning AVUQO's expansion into a comprehensive product, deal, service and comparison platform capable of managing hundreds of thousands and eventually millions of listings.

We discussed:

- Which affiliate networks and commercial data providers AVUQO should use.
- How to connect eBay, Amazon and other retail networks.
- How to cover all existing and planned AVUQO categories.
- How to import products automatically.
- How to grow from hundreds to millions of listings.
- How to prevent duplicated products.
- How to maintain trustworthy prices and comparisons.
- How to manage the complete system from AVUQO's existing Control Centre.
- How to use product information to generate useful website content and promotional campaigns.
- What should be developed first and how later integrations should be added.

**Important implementation clarification:**

No new connector was programmed, installed, activated or deployed during this conversation.

No database migrations were run, no source code was changed, and no merchant/API credentials were connected.

The work completed here was the architecture proposal, provider identification, coverage planning, integration strategy and recommended development sequence.

All new capabilities described below should therefore be treated as **proposed additions**, unless the current repository or live application independently confirms implementation.

---

## 2. Existing AVUQO project position

AVUQO is being developed as an independent, evidence-led, all-in-one comparison, shopping, deals, reductions and savings platform.

The intention is for customers to check AVUQO before spending money.

Its established product pillars include:

1. Universal product search and comparison.
2. Genuine deals, offers and price reductions.
3. Supermarket comparison and intelligent grocery baskets.
4. Budgeting, spending management and savings.
5. Price Watches and customer notifications.
6. Saved products and Shared Lists.
7. Travel, accommodation and holidays.
8. Experiences, activities and events.
9. Cars, car hire and related services.
10. Product recommendations and personalised intelligence.
11. Affiliate marketing and automated promotion.
12. First-party analytics and business intelligence.
13. An integrated owner-facing Control Centre.

The objective is one unified platform, not several disconnected websites.

### Previously documented technical foundation

The project uses:

- Next.js and React.
- TypeScript.
- Supabase/PostgreSQL.
- Supabase authentication and row-level security.
- Vercel hosting.
- An existing owner Control Centre.
- Source/feed integration infrastructure.
- Commercial and affiliate management concepts.

The owner's working development directory is:

`C:\avuqo`

The live website is:

`https://www.avuqo.com`

### Previously established project progress

The consolidated project source-of-truth document dated 28 October 2026 recorded the following:

- AVUQO's website was live on Vercel.
- Supabase authentication and custom emails had been tested.
- The Control Centre was operational in demonstrated areas.
- Website footer editing and publishing had been demonstrated.
- An Awin importer existed.
- An AKKO UK feed pilot processed 910 records.
- Of those, 811 were review candidates and 99 were excluded.
- Feed usage rights remained unverified.
- The public `/groceries` route was demonstrated.
- The owner `/control-centre/groceries` route was demonstrated.
- Nine UK supermarkets were listed in the grocery directory.
- No authorised operational supermarket price feeds had been evidenced.
- Additional price-history and product-matching work had been prepared in earlier development work, but its live deployment was not confirmed.

These are historical project observations, not a fresh verification of the current production application.

**The development chat must inspect the latest actual source code before assuming that any earlier ZIP represents the current project.**

---

## 3. Main strategic decision from this conversation

AVUQO should be designed to manage **millions of products, offers and service listings**, sourced from many authorised providers.

It should not rely on Awin alone.

It should not be limited to Amazon or eBay.

It should not require manually entering every product.

It should not build a separate data-import system for every retailer.

### Agreed architectural direction

Create one central:

**AVUQO Universal Catalogue & Content Engine**

Its responsibility is to receive authorised data from multiple networks, marketplaces, merchants and specialist service providers.

The shared pipeline should be:

**Source discovery → Permission verification → Data retrieval → Normalisation → Product identity matching → Validation → Price observations → Publication → Search and comparison → Monitoring → Refresh and expiry**

This central engine will supply the existing AVUQO consumer features.

A single verified product may then appear in:

- Universal Search.
- Compare.
- Deals.
- Category pages.
- Price-history views.
- Watches.
- Saved products.
- Personal recommendations.
- Relevant guides and collections.
- Affiliate promotional campaigns.

All these experiences should use the same reliable underlying product and offer records.

---

## 4. Retail and affiliate networks to add

The following networks were identified as important expansion candidates.

### A. Awin

**Priority:** Existing foundation to strengthen first.

Awin is already represented in the project and should be expanded beyond the initial importer pilot.

Required capabilities:

- Review existing Awin integration.
- Confirm approved advertiser memberships.
- Verify data and image usage rights.
- Retrieve authorised product feeds.
- Support large CSV, XML and other permitted feed formats.
- Automate scheduled imports.
- Track feed health and processing errors.
- Support affiliate links where authorised.
- Preserve merchant/product identity and price history.

The initial AKKO import does not prove that the catalogue may be published publicly.

### B. eBay Partner Network

**Priority:** Major next network.

eBay is particularly valuable because it covers:

- New products.
- Used products.
- Refurbished products.
- Clearance stock.
- Collectibles.
- Electronics.
- Home and garden.
- Fashion.
- Vehicle parts.
- Specialist marketplace items.

Connection process:

1. Register or verify AVUQO's eBay Partner Network account.
2. Register or verify eBay Developer access.
3. Obtain the relevant API credentials.
4. Build an authorised eBay Browse API connector.
5. Map product and listing identifiers.
6. Import price, condition, availability, shipping and seller information where permitted.
7. Track listing changes and expiration.
8. Apply for eligible eBay bulk Data Feed access.
9. Support high-volume processing if approved.

Large eBay data feeds can support millions of listings, but access is restricted and may require a business-case review and approval.

eBay marketplace listings must retain appropriate condition information and cannot be blindly matched as equivalent to brand-new retail products.

Official provider starting points:

https://partnernetwork.ebay.com

https://developer.ebay.com

### C. Amazon UK Associates

Amazon is another important candidate.

Potential coverage:

- Electronics.
- Home.
- Kitchen.
- Fashion.
- Beauty.
- Books.
- Toys.
- Garden.
- Everyday retail.

AVUQO should review current Amazon Associates API eligibility and supported access routes, including the Creators API.

Product information, images, prices, tracking links, caching and display must follow current Amazon programme permissions.

Do not assume that Amazon permits permanently copying its entire catalogue into AVUQO.

### D. CJ Affiliate

A network for additional approved retailers and product catalogues.

Required work:

- Obtain publisher approval.
- Join suitable advertisers.
- Enable authorised product-feed access.
- Build the CJ ingestion connector.
- Map merchant-specific products into AVUQO's canonical catalogue.

### E. impact.com

Useful for direct brand partnerships and merchant catalogues.

Plan to use approved product catalogues and supported APIs or secure feed delivery.

### F. Webgains

Important candidate for UK and European merchant coverage.

Plan to integrate authorised product-feed URLs and available API capabilities.

### G. Tradedoubler

Additional European affiliate network.

Potential connection through authorised product feeds and platform APIs.

### H. Rakuten Advertising

Another network for approved brand and merchant product catalogues.

### I. Direct merchant integrations

AVUQO should also support direct merchant feeds independently of affiliate networks.

Potential formats include:

- CSV.
- XML.
- JSON.
- Secure file transfer.
- Approved REST APIs.
- Scheduled merchant exports.

This creates flexibility for retailers that use direct commercial agreements rather than standard affiliate networks.

**No network or merchant should be marked as active or authorised simply because its name appears in the connector directory.**

---

## 5. AVUQO needs coverage beyond retail shopping

One major point established in this discussion is that the expansion must support **everything AVUQO does**, not only traditional affiliate products.

The source architecture should therefore be organised by both provider and business category.

### Consumer retail

Categories:

- Electronics.
- Computers.
- Gaming.
- Televisions.
- Phones.
- Appliances.
- Furniture.
- Home and garden.
- DIY.
- Fashion.
- Footwear.
- Jewellery.
- Health and beauty products.
- Toys.
- Gifts.
- Baby products.
- Pet supplies.
- Kitchen equipment.
- Sports and fitness.
- Hobbies.
- Seasonal products.

Sources include Awin, eBay, Amazon and other approved retailer networks.

### Groceries and household shopping

The established nine-store directory includes:

- Tesco.
- Asda.
- Sainsbury's.
- Morrisons.
- Aldi.
- Lidl.
- Waitrose.
- Iceland.
- Ocado.

AVUQO needs authorised supermarket product data and reliable prices.

The grocery engine must:

- Recognise exact products and pack sizes.
- Compare the same product across retailers.
- Calculate complete shopping baskets.
- Identify the cheapest complete eligible basket.
- Show missing prices.
- Never count missing items as free.
- Display freshness and source information.
- Distinguish verified prices from customer-entered prices.
- Support alternatives only when explicitly labelled.
- Avoid inventing stock or price information.

Listing a supermarket in the directory is not evidence of a live feed or partnership.

### Travel and accommodation

Candidate providers discussed:

- Booking.com.
- Expedia.
- Skyscanner.
- Other approved accommodation and travel operators.

Potential coverage:

- Hotels.
- Holiday accommodation.
- Flights.
- Package holidays.
- Car hire.
- Transfers.
- Other travel services.

These require specialised integrations.

Unlike a television or kitchen appliance, hotel and flight prices depend on dates, occupants, routes, availability, booking conditions and fees.

The universal engine must support specialist comparison rules rather than treating every item as a conventional retail product.

Some travel APIs impose substantial eligibility or traffic requirements. Those should be confirmed before including them in development commitments.

### Experiences, attractions and events

Potential providers:

- Viator.
- GetYourGuide.
- Ticketmaster.
- Authorised attraction and event operators.

Categories:

- Tours.
- Attractions.
- Days out.
- Activities.
- Concerts.
- Sporting events.
- Theatre.
- Experiences.
- Tickets.

Access, availability and monetisation permissions must be verified separately.

### Cars and motoring

Potential coverage:

- Vehicle sales.
- Used cars.
- Leasing.
- Car hire.
- Vehicle accessories.
- Replacement parts.
- Specialist motoring services.

Candidate sources include authorised vehicle/dealer inventory feeds, rental operators and retail affiliate merchants.

Vehicle inventory requires additional information such as condition, mileage, location, specification and financing terms where relevant.

### Hire and services

Potential future coverage:

- Equipment hire.
- Vehicle rental.
- Local services.
- Specialist rentals.
- Other comparable services.

These should be added through approved providers with category-specific prices, conditions and availability rules.

---

## 6. The critical difference between products and offers

The architecture must not assume that every imported listing represents a different product.

Example:

The same television could appear at:

- Amazon.
- eBay.
- Currys.
- Argos.
- Another approved retailer.

AVUQO should identify the shared product and attach the separate merchant offers to it.

**One canonical product → Multiple retailer offers**

This is essential for genuine comparison.

### Product identity information

Where applicable:

- GTIN.
- EAN.
- UPC.
- Manufacturer.
- Brand.
- Model number.
- Variant.
- Colour.
- Storage capacity.
- Pack size.
- Other relevant specifications.

Matching must distinguish genuinely different products.

For example:

- A 128GB phone is not automatically identical to the 256GB version.
- A used phone is not identical in condition to a new phone.
- A 400g grocery product is not the same package as a 500g one.
- A marketplace seller ID is not a universal product identity.

Low-confidence matches should go to the Control Centre's Exception Queue.

Duplicate records must not be silently merged based only on similar names.

---

## 7. How the platform should scale

The growth milestones discussed were:

**Stage 1:** 10,000 validated offers.

**Stage 2:** 100,000 validated offers.

**Stage 3:** 1,000,000 or more validated offers.

These are proposed scale targets, not live catalogue totals.

There is also an important distinction between:

- Unique canonical products.
- Merchant offers.
- Marketplace listings.
- Service records.
- Historical price observations.
- Publicly published pages.

A million offer records does not necessarily mean a million distinct products.

### Technical requirements for scale

The proposed architecture includes:

- Reusable provider connectors.
- Batch data ingestion.
- Streaming large feed files.
- Scheduled refresh workers.
- Import checkpoints and retries.
- Idempotent database upserts.
- Canonical identity matching.
- Search indexes.
- Source provenance.
- Price history.
- Feed health monitoring.
- Rate-limit management.
- Expiry handling.
- Error logging.
- Permissions validation.
- Exception handling.
- Scalable analytics aggregation.

The system should not load million-record feeds into a single browser request or serverless execution.

Larger jobs should process manageable batches, recover from failures and avoid overwriting valid records with incomplete data.

An expired listing must stop being promoted as available.

Price history must only reflect genuine observations, never manufactured historical data.

---

## 8. Proposed Control Centre expansion

AVUQO already has an existing Control Centre, and all new functionality must be integrated there.

Do not build another independent administration application.

The existing `/control-centre/sources` infrastructure should be audited and extended.

### Proposed source-management capabilities

**Connected sources**

Show every network, marketplace and direct merchant integration.

**Product and offer counts**

Show imported records, canonical products, current eligible offers and excluded items.

**Feed health**

Show successful imports, failures, last successful update and next scheduled sync.

**Price freshness**

Show stale prices, unavailable offers and verification status.

**Matching exceptions**

Show duplicates, mismatches, ambiguous identities and rejected products.

**Rights and approvals**

Show network membership, merchant approval, feed rights and publication eligibility.

**Category coverage**

Show which categories have useful product coverage and where data is missing.

**Revenue attribution**

Show affiliate traffic, conversions and revenue only where measurable and authorised.

### Owner controls

The owner should be able to:

- Register a source.
- Enable or disable connectors.
- Pause imports.
- Set refresh intervals.
- Exclude merchants.
- Inspect raw import evidence.
- Review product matches.
- Correct cataloguing errors.
- Approve or reject publication.
- Monitor source quality.
- View failures.
- Stop unsafe automated activity.

All privileged actions require server-side security and audit logging.

API keys and merchant credentials must not be exposed in client-side code.

---

## 9. Product data and website content are different things

Another important discussion was how to turn catalogue coverage into useful AVUQO website content.

A large catalogue supplies the underlying information.

But AVUQO also needs original customer-facing content that helps people make decisions.

Potential content includes:

- Product comparison pages.
- Category guides.
- Buying guides.
- Best-value recommendations.
- Real deal roundups.
- Verified reduction pages.
- Price-history explanations.
- Buy-now-or-wait insights.
- Seasonal shopping guides.
- Grocery shopping advice.
- Travel information.
- Budgeting and savings guidance.
- Product alternatives.
- Shopping collections.

A single verified product can contribute to several of these experiences.

However, AVUQO should not automatically generate millions of thin, duplicate affiliate pages.

SEO content must offer genuine value beyond simply copying merchant feeds.

No product specifications, savings, reviews or price claims should be fabricated.

---

## 10. Integration with the Affiliate Marketing & Promotion Engine

The existing affiliate promotion specification includes an intelligent marketing system.

The universal catalogue should supply eligible, verified products into this engine.

The proposed workflow is:

**Product discovery → Price verification → AVUQO Score → Promotion Score → Affiliate eligibility → Creative generation → Compliance review → Approval → Scheduling → Publishing → Analytics → Revenue reconciliation → Optimisation**

Potential marketing platforms include:

- Pinterest.
- Facebook.
- Instagram.
- TikTok.
- X.
- Email.

The proposed initial rollout remains one approved affiliate programme and Pinterest.

Creative automation can produce original graphics, captions, product collections and promotional content where the necessary rights and platform permissions exist.

A product should be promoted because it represents genuine customer value, not simply because the retailer pays a higher commission.

The **Promotion Score** must remain independent of the organic **AVUQO Score**.

All affiliate and sponsored placements require suitable disclosure.

---

## 11. Connection to AVUQO Analytics

This work should also integrate with the separate **AVUQO First-Party Analytics & Business Intelligence Engine** specification dated 30 October 2026.

That analytics system is currently documented as a proposed capability, not a verified live implementation.

The source engine should eventually report:

- Active sources.
- Import success and failure.
- Number of published products.
- Valid current offers.
- Source freshness.
- Price matching issues.
- Product search demand.
- Zero-result searches.
- Product views.
- Merchant clicks.
- Affiliate conversions.
- Confirmed revenue.
- Category coverage.
- Feed failures.
- Data-quality exceptions.
- Commercial performance.

Analytics should help identify which sources and categories are worth expanding.

The future Control Centre analytics route is proposed as:

`/control-centre/analytics`

Revenue should distinguish clicks, network-reported conversions, pending commission, approved commission and paid commission.

A merchant click must never automatically be counted as a sale.

---

## 12. Security, trust and commercial safeguards

These are mandatory rules across the entire expansion:

1. Only use authorised data sources.
2. Do not assume an affiliate relationship provides unlimited product-data rights.
3. Do not bypass provider access restrictions.
4. Store credentials securely on the server.
5. Preserve source and verification evidence.
6. Never invent prices or discounts.
7. Never manufacture historical prices.
8. Never silently substitute different products.
9. Never describe unavailable stock as confirmed.
10. Do not rank expired offers as active deals.
11. Keep commission and sponsorship separate from organic recommendations.
12. Respect affiliate disclosures, UK privacy requirements and platform rules.
13. Require appropriate approval for high-risk publication.
14. Keep audit logs and emergency pause controls.
15. Do not call a connector live until its operation and permissions are verified.

These safeguards are part of AVUQO's product identity and should not be sacrificed for catalogue volume.

---

## 13. Recommended development order

### Phase 0: Audit the actual current project

Before writing code:

- Inspect the latest `C:\avuqo` source.
- Inspect Git status and recent commits.
- Review current Supabase tables and migrations.
- Review source connectors.
- Review existing importers.
- Identify product/offer/price schemas.
- Review current Control Centre routes.
- Review authentication and RLS.
- Identify existing worker and scheduling infrastructure.
- Run the current production build and relevant tests.

Do not overwrite working code with an old uploaded ZIP.

### Phase 1: Strengthen the existing Awin system

- Confirm merchant permissions.
- Improve current import quality.
- Introduce or extend canonical product matching.
- Preserve accurate offer histories.
- Implement reliable batch imports.
- Add data freshness and expiry handling.
- Improve owner-facing feed monitoring.

### Phase 2: Add eBay

- Implement approved eBay Browse API functionality.
- Handle seller and condition data correctly.
- Support affiliate tracking where authorised.
- Request eligible bulk-feed access.
- Integrate eBay into the shared catalogue rather than creating a separate product database.

### Phase 3: Expand retail networks

Prioritise additional approved integrations:

- impact.com.
- CJ Affiliate.
- Webgains.
- Tradedoubler.
- Rakuten Advertising.
- Amazon Associates.
- Direct retailer feeds.

The precise order should depend on approval, quality, permitted data use, cost and expected customer value.

### Phase 4: Expand grocery coverage

Add authorised supermarket price sources.

Strengthen exact-product matching, data freshness and complete-basket calculations.

Never report false complete-basket savings when prices are missing.

### Phase 5: Travel, cars, hire and experiences

Introduce specialist provider connectors for date-specific travel, rentals, ticketing, vehicles and services.

Do not use generic retail-product comparison rules for services with different terms and inclusions.

### Phase 6: Content generation and automation

Build helpful, trustworthy page generation and editorial workflows.

Integrate the approved affiliate promotion engine.

Add analytics-driven content and source-coverage improvements.

### Phase 7: Scale

Optimise ingestion, database performance, search and worker throughput towards hundreds of thousands and millions of eligible records.

Measure progress using real operational metrics, not imported row count alone.

---

## 14. What was added to the plan in this chat?

The following strategic additions and recommendations emerged from this conversation:

**1. Multi-million-listing scale as an explicit architectural target.**

**2. eBay Partner Network and Browse API as a major priority, with bulk feeds as a potential later expansion.**

**3. A broader affiliate network strategy beyond Awin.**

**4. A universal data-ingestion framework rather than separate merchant-specific catalogue systems.**

**5. A coverage map across all AVUQO business categories, not only shopping products.**

**6. Clear separation between canonical products, merchant offers and marketplace listings.**

**7. Batch processing, scheduled workers, deduplication, freshness controls and safe scaling.**

**8. Expanded source management and coverage monitoring through the existing Control Centre.**

**9. A reusable content engine producing useful customer-facing guides, comparisons and promotional content from verified data.**

**10. A staged development roadmap to reach large-scale catalogue coverage without sacrificing trust.**

These additions are **planned architectural requirements and recommendations**, not claims that working code was added during this conversation.

---

## 15. What has not yet been demonstrated or completed?

As far as this conversation establishes:

- No new eBay connector was implemented.
- No eBay bulk feed was approved or imported.
- No new Amazon connector was implemented.
- No CJ, impact.com, Webgains, Tradedoubler or Rakuten integration was installed here.
- No direct retailer feed was newly activated.
- No newly authorised supermarket price feed was connected.
- No travel or ticketing connector was added here.
- No million-record import was performed.
- No universal catalogue migration was written or applied here.
- No universal content engine was programmed here.
- No source dashboard expansion was deployed here.
- No new automated SEO publishing system was implemented here.
- No source-to-promotion automation was newly deployed here.
- No new live catalogue volume was verified.

Some supporting capabilities may exist in the current project, but that requires a current-code and production audit.

---

## 16. Important development preferences

The owner develops on Windows.

Primary working directory:

`C:\avuqo`

Any code implementation should:

- Preserve existing working functionality.
- Make additive, versioned changes.
- Avoid destructive replacement of the repository.
- Provide versioned ZIP patches when appropriate.
- Supply exact Windows PowerShell instructions.
- Clearly separate Supabase SQL migrations from PowerShell commands.
- Verify TypeScript, unit tests and `npm run build`.
- Explain required credentials and merchant approvals.
- Identify features that are prepared but not deployed.
- Confirm production deployment separately through Vercel and browser checks.
- Never invent successful builds, approvals or installations.

---

## 17. Required instructions for the next development chat

The next development chat should treat this handover as part of the AVUQO project requirements.

It should also consult the existing master specifications, especially:

- `AVUQO_MASTER_SOURCE_OF_TRUTH_2026-10-28.md`
- `AVUQO_Master_Product_Build_Specification.pdf`
- `AVUQO_Intelligent_Supermarket_Comparison_Master_Specification.pdf`
- `AVUQO_v0.8_Control_Centre_Content_Backend_Plan.md`
- `# AVUQO Intelligent Affiliate Marke.txt`
- `AVUQO_First_Party_Analytics_Intelligence_Master_Specification.md`

These documents remain authoritative for their respective feature requirements.

This handover adds a more explicit universal catalogue, provider-coverage and scaling strategy. It does not replace the original master specifications.

### Next practical development objective

Begin by auditing the current AVUQO source and database to determine how much of the proposed universal catalogue infrastructure already exists.

Then develop an implementation plan for:

1. A scalable Universal Source Connector Registry.
2. A canonical product and offer data model.
3. Reliable high-volume feed ingestion and update workers.
4. Merchant approval and content-rights controls.
5. Product matching, deduplication and price-history integrity.
6. Expanded Source Management in the existing Control Centre.
7. A production-oriented eBay connector framework.
8. A reusable architecture for future retailer, grocery, travel and service providers.

Do not immediately replace existing source tables or duplicate the current importer infrastructure.

Use the current implementation as the starting point, then extend it safely.

---

## 18. Final strategic direction

AVUQO is not intended to become merely a large affiliate directory.

It should become a comprehensive place where consumers can check products, prices, services, travel, groceries, offers and spending decisions.

The long-term ambition is substantial breadth of coverage, supported by reliable data and understandable comparisons.

The system must be able to grow towards millions of eligible offers while retaining:

- Reliable product identity.
- Genuine price comparisons.
- Evidence-based scoring.
- Transparent merchant relationships.
- Current availability and price information.
- Strong source permissions.
- Useful search and discovery.
- Personal savings intelligence.
- Owner control.
- Responsible automated growth.

**AVUQO: Find what's worth it.**

**End of handover.**