# Public products: genuine HTTP 404 before Next.js streaming

**14 November 2026 | Candidate before merge.**

## Why the previous fix did not change HTTP status

On production SHA `0e401beb351ebd73cef4e4def93ba966b4594e51` (Vercel `dpl_Abjdy7YJGrGDmyR4jNbEYvH1hpbz`, READY), an ordinary GET to `/products/no-such-avuqo-model-1234567` returned **HTTP 200** while the streamed React payload carried a not-found interruption. The previous PR #194 already resolved the product identity at the top of the page and called `notFound()`; under **Next.js 16.4.2 Cache Components**, the shell can be committed before that request-time decision, so its headers/status cannot become 404. This is a framework streaming boundary, not evidence that any draft product was approved. The page's `noindex` fallback remains useful but cannot meet the exact HTTP contract alone.

Next.js official guidance supports returning a direct HTTP 404 from `proxy.ts` when the request must be rejected before streaming. AVUQO already uses that proxy for Supabase session refresh, which this patch preserves for admitted requests.

## Candidate code change

`proxy.ts` checks only direct GET/HEAD documents with the exact `/products/:slug` shape (not `/products` or other site routes). It permits:

1. An explicitly allowlisted editorial research identity in `lib/products/research-guides.ts`. Those **four** real model guides show no unverified retailer prices or affiliate images.
2. Otherwise, a product returned by the existing `verifiedProduct(slug)` **full publication admission**, which requires active product, fresh permissioned source, eligible offer, score/rights checks and Awin-specific reviewed release when applicable. This preserves future genuinely approved products without a hardcoded four-product-only rule.

Anything else, including invalid slugs and draft-only demo rows, receives a **real 404 response before Next page or metadata streams**. The static accessible AVUQO-branded response includes links to products and home, `noindex,nofollow`, `private, no-store`, no user-supplied slug text and no merchant information. HEAD omits the body. Read-only checks only, no DB rights changes, sources resume or publishing.

For **Next.js client-side RSC navigation/prefetch**, the proxy deliberately keeps Next's native protocol and the page's `notFound()`/noindex fallback. The specific release acceptance target is a genuine **direct document HTTP 404**. A separate browser test must verify soft client navigation displays a correct unavailable state. Do not represent this as all RSC fetch statuses being 404.

## Risks and release gates

- The proxy performs a **second** rights-gated database lookup on direct document requests for non-editorial slugs, ahead of the page's usual fetch. This is intentional to preserve the same source rights semantics rather than maintaining an unsafe duplicate approximation. Measure production latency and guard high-cardinality requests/DoS before scaling.
- The code must compile in Next 16's Node.js proxy runtime despite importing existing server-only source admission. Do not merge if the build complains or if session-cookie refresh breaks elsewhere.
- Run GitHub build/lint/contract tests, secret scan and Vercel preview.
- On exact preview then production READY, test:
  - `/products` HTTP 200
  - all four research model slugs HTTP 200 with correct identity and **no live retailer price claim**
  - `/products/pilot-cadbury-heroes-pouch-300g` HTTP **404**
  - `/products/no-such-avuqo-model-1234567` HTTP **404**
  - optional invalid slug and HEAD, and the homepage
  - content type, noindex/no-store headers if the fetch tool exposes them
  - check client-side navigation in an independent browser
- Should any missing product remain HTTP 200, **do not mark the true-404 acceptance completed**.
- Awin paused/sync disabled and 0 approved Awin releases must remain unchanged. Current real retailer prices/stock/permissioned images are still needed for commercial product comparisons.

**Source references:** [START_HERE](../AVUQO_START_HERE.md), [live handover](./AVUQO_LIVE_HANDOVER.md), [research guide release](./AVUQO_PUBLIC_RESEARCH_PRODUCT_GUIDES_RELEASE_2026-11-14.md) if present, Next.js streaming/Proxy official docs (source documentation can change).
