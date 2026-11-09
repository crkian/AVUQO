# AVUQO v0.4.0: Unified Marketplace + Source Atlas
**9 November 2026 · Draft PR implementation, not yet approved for live release**

## Source-of-truth reconciliation

Reviewed original AVUQO Master Product Build PDF, 2026-10-28 Unified Source of Truth, first-party analytics specification, supermarket master specification, v0.8 Control Centre content/backend plan, and latest GitHub main plus live Supabase read-only registry. The site remains one platform, not a separate affiliate marketplace.

### Live source audit at 9 November 2026

- Eight connectors: Awin, Booking.com, CJ Affiliate, AVUQO Demo Feed, Direct Merchant Feed, eBay Partner Network, impact.com, Skyscanner. Seven paused with sync disabled; **only the demo connector active**. Active demo is not public commercial approval.
- Awin feed observations: 72 rows, **observations are not permissioned downloads or live offers**.
- Private review import runs: 11, across suppliers such as Tooled Up, Tyres UK, Cadbury Gifts Direct, Craft Buddy, Petlibro, Mozillion and AKKO UK; repeated runs are not independent retailers.
- Product records: 4 active, 8 draft. Active offers: 6. Published-deal records: 6. These database statuses **do not guarantee customer eligibility**; the existing `verifiedOffers` source/rights/freshness/release gateway remains the sole public admissions source.
- Supermarket directory: 9 stores. Public-published grocery price records must pass independent rights, freshness, availability and basket completeness checks; store directory is not a feed.
- Travel offers: 0, so travel remains editorial guidance, not a bookable live comparison.
- Taxonomy: 25 top-level families, 8 root categories active and 17 inactive. A public editorial category route does not activate a database taxonomy record.
- Published site content currently has footer; menu publication not recorded, so vetted built-in navigation remains the fallback.
- Awin tyre permissions still unconfirmed; Pneus Online second supplier and Tyres UK enrichment automation are separately gated. Do not activate them as part of v0.4.0.

## Permanent customer experience

Four universal routes shown across every category page:
1. **Explore** at `/marketplace`: premium identity, 25 browsing departments, all curated topics and specialist destination routing.
2. **Shop** at `/products`: existing approved offer/product catalogue, never unverified private imports.
3. **Compare** at `/marketplace/compare`: correct sector-specific tools, not a fabricated universal ranking. Products, groceries, tyres, contract calculator, travel and insurance each disclose their current evidence limitations.
4. **Who's Who** at `/whos-who`: educational department/manufacturer directory, and verified retailer/brand records only if already present in the eligible public product pipeline. Never imply affiliation from an editorial profile or source name.

All existing category landings share the four-journey component and original Header/Footer. The existing `/categories/[department]` pages serve families without bespoke landing pages, now with the common marketplace journey; unknown slugs fail with 404. Existing department routes retain their established SEO behaviour pending a separate owner-approved metadata review, and only link to existing specialist tools or searches. Existing Tyres, Groceries, Watches, Saved, Lists, Travel, Search, Deal and Contract work is preserved.

Navigation is updated in safe built-in defaults plus a globally visible marketplace ribbon. Site content editor remains the only write pathway for published navigation/footer changes. No silent CMS data overwrite.

Design system: AVUQO deep plum/ivory/coral/lavender, generous breathing space, polished layouts, 320-390px mobile first, useful prominent actions, keyboard focus, reduced motion. Specific category brands can preserve their established accent and imagery while using the shared journeys.

## Owner Control Centre

- `/control-centre/marketplace`: complete 25-department taxonomy/editorial audit, four public journey destinations, roots active/inactive and raw catalogue record counts (not eligible public claim).
- `/control-centre/source-atlas`: live eight-connector source registry and health/credentials status (without secrets), last recorded successful sync, latest private import runs by supplier, Awin feed observations, live system-control switches, canonical product/offer/deal counts, grocery and travel records and publication-state links.
- All database queries read-only through the existing service-side admin client **after** server-side owner/admin role verification in the protected Control Centre layout/page. No new API endpoint, public table grant, schema migration or source mutation.
- Existing workspace actions remain in their current approval-gated modules. The Atlas must not grant rights, import supplier files, enable publishing, alter prices or treat 11 imported runs as 11 partners.
- Partnership outreach email statuses are **not automatically synced** to the website. A separate consented Gmail/reporting integration would be needed to show live replies; no fabricated CRM status is displayed.

## Checks and release gates

- Run tests for 25 unique department slugs, route safety, all four customer journeys, default navigation validity, no private source leakage, owner-only read-only Atlas, no fake public pricing, mobile and keyboard states.
- Run full GitHub CI and Vercel preview before merge; inspect any incompatible Next.js route prerender rules, footer CMS link limits and potential admin type errors.
- Keep provider price, merchant permission, privacy, legal and source rights gates untouched. This release changes public discovery/navigation and private read-only operations, not the truthfulness of underlying supplier data.
- Verify exact production deployment SHA and custom-domain alias after merge. Physical mobile/browser/owner sign-in visual acceptance remains a separate open gate.

**Not completed by this release:** new provider integrations, source approvals, 25 live commercial catalogues, live travel quotes, intelligent universal matching/ranking, marketplace payments, retailer CRM integration, licensed vehicle fitment or all integrations in the original 26-page master PDF. These require independent evidence, infrastructure and acceptance. Do not describe them as live.
