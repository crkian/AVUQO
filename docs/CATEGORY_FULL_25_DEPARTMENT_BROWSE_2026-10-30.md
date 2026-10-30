# AVUQO full 25-department browse rollout, 30 October 2026

## Why this exists
The first public category atlas showed ten individually themed lifestyle destinations plus four specialist journeys. The owner's retail menu references show a need for a much deeper hierarchy, not ten categories masquerading as a whole marketplace.

Actual Supabase public.categories audit on 30 October 2026:
- 25 top-level families, including Baby, Crafts, DIY, Books & Media, Business & Industrial, Musical Instruments, Sports, etc.
- 1,384 total rows. The vast majority of nodes remain inactive until source and merchant review. This change does not edit that state.
- Names and starter subtopics were derived from the existing root/child taxonomy, then curated in the code to remove unsupported live-shopping claims.

## Built
1. A browse-tree registry for all 25 high-level departments and their known subtopic labels.
2. An accessible filtered menu for 25 departments, with four logical groups and expandable topic panel, linked in the global Categories mega menu and full /categories atlas.
3. Distinct editorial pages for departments that do not already have specialist landing routes, using per-department copy, palette, decision advice, and topic searches.
4. Existing bespoke Tech, Home, Travel, Beauty, Fashion, Gifts, Toys, Pets, Motoring, Groceries and other working routes remain unchanged.
5. Inactive taxonomy records remain inactive; no merchant image is requested, no unverified product published, no stock promise, no promotion/AI spend enabled.

## Important distinctions
- A 'browse topic' is a suggested search term. It does not signify a verified offer, available inventory, source permission, live product count or fully functioning comparison.
- Currently active category DB rows do not equal the 25 navigable editorial departments. Directory expansion is editorial, not a database activation.
- Search results are limited to eligible verified products and may be empty; the interface must be transparent about this.
- User's general retailer menu images are UX references, not licensed design or artwork.

## Next gates
- Confirm authenticated owner menu editor still supports public top-level label, order and visibility. Expanded editorial department topics are code-curated in this phase; a later owner-controlled taxonomy publishing workflow needs approval and versioned revision history.
- Visual QA: keyboard, 375px/768px/1024px/1440px, high zoom, VoiceOver/NVDA, focus trap/escapes for nested menus and mobile filtering.
- Product matching, image rights, canonical taxonomy mapping, product counts and category-specific search filters must be validated before displaying real inventories.
