# AVUQO search discovery and first-party analytics continuation
20–21 November 2026. PR #337 merged 21 November at `5bc57b908f4daad2d8a53c0f4bc18479719d8ae5`. Vercel production `dpl_9Rpe9CyRhP7Y5XMRaJfk5kBQtXB1` READY with `www.avuqo.com` and `avuqo.com` aliases. GitHub Build/Lint/native PostgreSQL/secret checks passed. Runtime-error scan found no errors. Direct production HTTP body and Google/Bing indexing checks remain unverified.

## Source and current-state reconciliation
The original First-Party Analytics & Intelligence Master Specification requires consent gates, typed validated events, owner-only reporting, idempotency, bot/test suppression, source freshness, verified conversions and separate commission lifecycle. The current repository already has `/control-centre/analytics` with read-only observed database counts and a versioned `lib/analytics/contracts.ts`. Browser tracking, advertising measurement and revenue inference are deliberately disabled. This build **does not falsely claim to finish analytics ingestion** or enable collection without legal, RLS, deduplication and consent acceptance.

## This build
- Unique canonical, OpenGraph, X and Googlebot metadata for the existing verified product pages, 21 partner editorial studios and the 25-department browsing system.
- Safe first-party WebSite and Organization JSON-LD. Individual editorial CollectionPage and BreadcrumbList schemas. Verified non-tyre Product and GBP Offer schema only for source-admitted actual offers. No fabricated ratings, reviews, products, prices, merchant ownership or authorisations.
- Reconciled editorial sitemap plus a bounded live `/products/sitemap.xml` (up to 60 current source-verified product pages, not exhaustive). All original departments with real canonical landing URLs, selected partner pages; excludes private routes, internal search, research-only/noindex product fixtures, filtered query strings and synthetic deals.
- Production robots policy excludes admin, previews, internal APIs, account and search-result variants; preview/development Vercel deployments disallow all crawling.
- Owner-only `/control-centre/seo` readiness inventory with live crawler route links, actual code-sourced coverage counts, analytics status and external acceptance checklist.
- Regression tests wired into mandatory CI, with existing source, offer, affiliate and owner gates untouched.

## Outstanding massive analytics and search roadmap
1. **Search Console and Bing Webmaster Tools:** Domain verification, sitemap submission, canonical/coverage inspection, URL inspection, indexing and Core Web Vitals require owner-controlled verified provider accounts. Do not claim Google approval or indexation based on tags.
2. **Crawl QA:** Verify all canonical URLs return expected status, HTML title/description/JSON-LD, mobile layout, accessible headings, robots directives, sitemap count and production domain; inspect stale/duplicate/redirected routes.
3. **Product sitemap expansion:** Scale the initial bounded 60-product live sitemap to paginated shards for all current, rights-cleared, independently released products only, with lastmod from verified update evidence, bounded source queries and explicit stale/withdrawal handling.
4. **SEO content governance:** Per-page content editing and review, canonical override approvals, real supplier-provided imagery and descriptions, redirects and content-quality monitoring, internal link health, structured data eligibility, independent editorial policy.
5. **Analytics intake:** Versioned, consent-aware first-party browser SDK and server-only ingest with strict schema, bot/test suppression, rate limits, deduplication, retention/deletion, RLS and privacy review before enabling collection.
6. **Analytics intelligence:** Daily aggregates, source and page reporting, search and merchant funnels, event freshness/quality, privacy-preserving cohort reporting, verified conversion/reversal and campaign cost reconciliation, controlled exports and alerts. Never treat clicks as purchases.
7. **Production acceptance:** Full CI, owner access negative tests, preview and exact production deployment, actual crawler content, external search console evidence, consent opt-out negative tests and raw-to-dashboard reconciliation.

Preserve all original handovers, 25 departments, 21 supplier routes, comparison independence, permission gates and no-invented-data policy.
