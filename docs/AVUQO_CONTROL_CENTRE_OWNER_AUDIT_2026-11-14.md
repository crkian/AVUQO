# AVUQO Control Centre owner audit · 14 November 2026

Production audit baseline: GitHub `1cc6ea8ba6db79f8ebbcdcb175312fb1a8f3d8d2`, Vercel READY `dpl_EZTuuNr4UXg4FsHFQZknj6N2Vx5h`, `www.avuqo.com`. Owner role confirmed in the live browser.

## Coverage

The owner browser rendered all 43 fixed routes plus all five brand preview and eight pilot-product detail pages, for 56 pages in total. Fourteen linked query variants also rendered across the legal editor, public page editor and marketing workspaces. Read-only backend queries and Vercel runtime logs provided separate evidence. Imports, changes to settings, save, publish, retry and other state-changing actions were left unexercised. The audit made no production writes.

| Route | Owner browser result |
|---|---|
| `/control-centre` | Rendered in owner session. |
| `/control-centre/affiliate-networks` | Rendered in owner session. |
| `/control-centre/analytics` | Rendered in owner session. |
| `/control-centre/automation` | Rendered in owner session. |
| `/control-centre/awin-advertisers` | Rendered in owner session. |
| `/control-centre/awin-feed-updates` | Rendered in owner session. |
| `/control-centre/awin-programmes` | Rendered in owner session. |
| `/control-centre/brand-previews` | Rendered in owner session. |
| `/control-centre/brand-previews/[brand]` | All five linked brand pages rendered. |
| `/control-centre/content` | Rendered in owner session. |
| `/control-centre/content/legal` | Rendered in owner session. |
| `/control-centre/content/navigation` | Rendered in owner session. |
| `/control-centre/content/pages` | Rendered. Vercel logs reported a request-time clock used during prerendering. |
| `/control-centre/coverage` | Rendered in owner session. |
| `/control-centre/design-system` | Rendered in owner session. |
| `/control-centre/exceptions` | Rendered in owner session. |
| `/control-centre/feed-imports` | Rendered in owner session. |
| `/control-centre/feed-list-audit` | Rendered in owner session. |
| `/control-centre/general-feed-import` | Rendered in owner session. |
| `/control-centre/groceries` | Rendered in owner session. |
| `/control-centre/groceries/price-evidence` | Rendered in owner session. |
| `/control-centre/large-feed-import` | Rendered in owner session. |
| `/control-centre/live-data` | Rendered after a prolonged wait. Endpoint diagnostic has no configured targets. Open Food Facts returned HTTP 503. |
| `/control-centre/marketing` | Rendered in owner session. |
| `/control-centre/marketing/readiness` | Rendered in owner session. |
| `/control-centre/marketplace` | Rendered. Awin observation metric was unknown. |
| `/control-centre/pilot-products` | Rendered in owner session. |
| `/control-centre/pilot-products/[slug]` | All eight linked draft product pages rendered. |
| `/control-centre/pipeline` | Rendered in owner session. |
| `/control-centre/product-previews` | Rendered in owner session. |
| `/control-centre/product-readiness` | Rendered in owner session. |
| `/control-centre/promotions` | Rendered in owner session. |
| `/control-centre/release-readiness` | Rendered in owner session. |
| `/control-centre/retailers` | Rendered in owner session. |
| `/control-centre/revenue` | Rendered in owner session. |
| `/control-centre/seasonal` | Rendered in owner session. |
| `/control-centre/seasonal-calendar` | Rendered in owner session. |
| `/control-centre/site-advertising` | Rendered in owner session. |
| `/control-centre/source-atlas` | Rendered. Awin observation metric was unavailable. |
| `/control-centre/source-readiness` | Rendered in owner session. |
| `/control-centre/sources` | Rendered in owner session. |
| `/control-centre/trust` | Rendered in owner session. |
| `/control-centre/tyre-spec-enrichment` | Rendered in owner session. |
| `/control-centre/tyre-supplier-onboarding` | Rendered in owner session. |
| `/control-centre/tyres` | Rendered in owner session. |

## Follow-up

- Marketplace and Source Atlas read a private Awin observation table using a session client whose database role lacks SELECT. The dedicated Awin Feed Update Monitor uses an access-checked server client and can read the records. Reuse that access pattern for the two dashboard counts without broadening database grants.
- Live Data Monitor makes sequential paginated reads of a large private queue before rendering. Measure its timing and give the bounded candidate scan an independent loading state. Its endpoint checker returned the expected unconfigured result, and the Open Food Facts request surfaced an upstream 503.
- Trace the page editor's Next.js current-time prerender warning. The editor rendered in the owner session. Its draft and publish operations still need controlled acceptance.
- The editorial calendar and marketing pages render. Production has no enabled marketing draft rules. The marketing emergency stop is on and publishing and AI are disabled. Keep provider and paid-campaign operations gated. The Awin registry remains paused and its daily observation job has a successful run recorded. The Pneus schedule was preserved.
- Repeat write-path acceptance using disposable data in a controlled environment. Exercise owner and admin permissions separately before making claims about all operations.
