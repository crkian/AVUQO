# Parallel Work mode task: independent product + warm-premium website QA

Prepared 14 November 2026. **Use in Work mode when credits are available; not started by this GitHub release.**

## Goal
Independently inspect the production AVUQO site and its approved original warm-premium design references. Produce a screenshot-driven mobile/desktop acceptance ledger with concrete changes to build, so the main coding workflow can finish them in focused PRs.

## Start with sources
Read current GitHub `crkian/AVUQO` **main**, `AVUQO_START_HERE.md`, `AGENTS.md`, `docs/AVUQO_COMPLETE_GIT_BRANCH_IDEA_HANDOVER_INDEX_2026-11-14.md`, `docs/design/AVUQO_VISUAL_REFERENCE_INDEX_2026-11-10.md`, `docs/design/AVUQO_WARM_PREMIUM_VISUAL_IDENTITY_2026-11-05.md`, and `docs/PUBLIC_MODEL_RESEARCH_GUIDES_RELEASE_2026-11-14.md`. Confirm the **current** production SHA and Vercel READY aliases; do not assume this dated feature is live.

## Read-only browser checks
- Desktop 1440px; mobile 390px and 360px; use production `https://www.avuqo.com`.
- Check `/`, `/products`, all four research model slugs in `lib/products/research-guides.ts`, `/categories/tech/products`, `/categories/home/products`, `/categories`, `/search`, `/groceries`, `/saved`, `/watches`, `/lists`, `/sales`, `/christmas`, `/black-friday`, `/easter`, `/valentines`.
- Verify real on-page name, no horizontal overflow, focus-visible/keyboard navigation, responsive cards, images and navigation working, links/canonical semantics, no fake price/stock/discount/review/score claims, and no outbound retailer purchase link for the four research-only pages.
- Check unknown and unapproved pilot slugs do not become public product-detail pages.
- Compare the header, homepage, product research guides, account/navigation and seasonal hero against the original owner mockups only where the original assets are actually available. Distinguish design references from approved current merchant photography.
- Do not invent a screen grab if browser access fails or the route requires a login; record exactly what was observable. Do not authenticate as an owner or access customer records without explicit user action.

## Return to the owner
Produce one consolidated table: `route | viewport | observed behaviour | reference target | defect | P0/P1/P2 priority | exact implementation file(s) | screenshot evidence link | acceptance condition`. Group duplicate UI defects. Note which parts were not independently verified. End with the top five small, testable PRs for the main coding workflow. No changes or merges needed to deliver this review.

## Safety
This is **read-only**. Do not change Git branches, source-rights toggles, Supabase data, prices, Awin/Pneus/tyre workers, campaigns, social posting, paid advertising, images or account records. Do not treat preview/test content or sample manufacturer web prices as current AVUQO retailer offers. No screenshots of private data.
