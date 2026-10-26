# AVUQO v0.8 Legal page prerender fix

This patch corrects four routes introduced in Phase 2 Legal Content Editor when `cacheComponents` is enabled:
- `/affiliate-disclosure`
- `/privacy`
- `/terms`
- `/cookies`

## Why
`ManagedLegalPage` queries Supabase through `getPublishedLegal()`, which accesses request cookies via `next/headers`. This is uncached request-time work; the page previously rendered it outside any `<Suspense>` boundary, so Next.js rejects prerendering.

## Fix
Each route now wraps `<ManagedLegalPage>` in `<Suspense>` with a neutral loading placeholder. Published content still comes from Supabase; if no published content exists, the existing legacy legal text is shown after the request completes. This patch does not change admin permissions, any SQL migration, the legal editor or the affiliate text itself.

## Apply
Copy the `app` directory onto the matching paths in `C:\avuqo` and review any local customizations before overwrite. Run `npm run build`. If it succeeds, verify these four routes in a **preview deployment**, both without a published database record and after publishing a test document. Ensure unpublished drafts are never public.

No database migration required. Keep `cacheComponents` enabled and do not use `dynamic = "force-dynamic"`.

## Caveat
This corrects the four Phase 2 pages. Other uncached work in different routes could cause similar build errors, so a clean production build and preview testing remain required.
