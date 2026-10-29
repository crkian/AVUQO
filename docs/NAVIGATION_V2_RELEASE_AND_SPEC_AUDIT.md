# AVUQO Navigation v2: release and specification audit
Date: 2026-10-29
Status: feature branch until CI, migration, preview and production checks complete.

## Source requirements and rationale
- Master Product Build Specification: consumer UX, homepage, Discover, mobile navigation and independence.
- Unified Product Vision, 2026-10-28: make Compare, Deals, Groceries, Budgeting, Travel, Watches and Saved/Lists discoverable without disconnected sites.
- Supermarket Comparison addendum: /groceries readily discoverable; never imply missing prices or unauthorised feeds are live.
- v0.8 Control Centre plan: owner-managed nav via draft, publish, revision history and permissions.

The old six-group menu hid core journeys and could squeeze authenticated account controls. The replacement makes Discover, Deals, Compare, Groceries, Categories, Travel and More direct routes with accessible submenus. Site Advertising for other businesses stays separate from four-brand Brand Social Marketing.

## Implemented
- Seven directly clickable headings with separate accessible submenu toggles; existing internal routes only.
- Explanatory labels and descriptions, keyboard Escape, outside pointer and blur closes; no hover-only opening.
- Desktop global search using /search?q=, with simple browser suggestions and no unsupported live autosuggest claim.
- Mobile dock Home/Search/Discover/Watches/Account with sign-in routing for visitors.
- Quick customer journeys beneath homepage search and cautious wording about verification.
- Additive migration extending existing site_content draft/published/revision keys with navigation.
- Owner/admin draft editing, owner-only application publish and revision restoration; safe links, fixed allowlist, min five essential groups, published fallback.
- Saved-draft preview and unit tests for route whitelist, sorting and essential destinations.

## Still planned, not live
- Budgeting & Savings lacks a verified working consumer route and is intentionally not linked.
- No real-time AI product autocomplete; /search results depend on authorised source evidence.
- Supermarket feeds remain subject to data permissions and full-basket verification.
- Site Advertising booking/billing for third-party advertisers is a separate, unbuilt backend.
- Verified-deal-led homepage hero should follow only after sufficient real approved inventory.
- Consent-aware menu interaction analytics and A/B tests require separate approval.
- Visual browser acceptance remains needed for logged-in desktop, zoom and mobile devices.

## Release gates
1. Verify full tests, ESLint, Next.js, secret scan and preview deployment.
2. Confirm content key checks apply only to footer, then apply additive migration.
3. Verify published footer unchanged, navigation defaults while unconfigured, and RLS.
4. Test owner/admin/anonymous permissions: drafts private, only reviewed menu published.
5. Test desktop at 100%/125%/150% zoom, mobile at 320–760px and tablet nav behavior.
6. Keep AI spend, social publishing and advertiser bookings disabled.
7. Roll back the deployment if necessary. Added content-key constraints are harmless without published navigation data.
