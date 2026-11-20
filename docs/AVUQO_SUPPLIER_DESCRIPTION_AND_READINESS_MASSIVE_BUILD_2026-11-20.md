# AVUQO supplier, description and coverage build
**Date:** 20 November 2026 · **Status:** Candidate, not verified live until CI, merge, exact production deployment and service-only migration check.

## Purpose and preserved project requirements
AVUQO remains an independent, evidence-led online retail park, comparison platform and value-intelligence layer. Preserve the master product specification's three rules: automation by default, complete Control Centre visibility, human override; and the independent Score/ranking firewall. Preserve all 25 departments, 21 advertiser storefronts, existing /shop, /catalogue, tyre private compare, original design, editorial, watches, analytics, 29-workstream / 12-gap backlog and historic release handovers. Do not replace historical files with a shortened summary.

The root problem in the live shopping pipeline is not only that descriptions are missing in supplier feeds:
- Five observed source headers (Petlibro, PlayPress, Cadbury, Craft Buddy, Mozillion) have `description` columns. This is *schema evidence*, not proof of populated licensed prose.
- Several pilot normalisers dropped those columns. The Awin-to-canonical bridge set `description:null`, and the core product mapper only wrote a description on first insert, leaving earlier auto-created canonical records empty.
- Tooled Up's huge private importer also previously discarded optional description text. A supplier with 84k staged product IDs is not the same as 84k public eligible products.
- Seven wider feed statuses need distinguishing: **accepted programme**, **observed feed**, **private import**, **description source**, **licensed text**, **canonical held/product**, and **published-and-current customer offer**. A service provider without a retail CSV needs a quote/tariff adapter, not a fake SKU importer.

## Code introduced
1. `lib/awin/product-description-evidence.ts`: bounded, sanitised description extraction from explicit supplier fields. Reject short placeholders, scripts/styles/markup, unreasonably large fields and URL-only content. The source prose remains commercial data.
2. Pilot feed normalisers now retain `description`, `structured_description`, and `product_short_description` where the reviewed source schema contains them. Manual, large general-Awin and Tooled Up parsers retain optional clean source description in PRIVATE staging metadata.
3. Live recheck binds the description to the exact authenticated fresh feed digest. Publication of text separately requires `affiliate_programs.metadata.product_description_rights_verified === true` **and** existing current owner/source attestation. All existing feed/image/GBP/stock/tracking and per-offer first-release checks remain; the new work does not set that right flag.
4. Canonical products' existing `NULL` descriptions can be filled only when a non-private current source provides text with the separate permission and digest verified. It cannot overwrite existing editorial copy, change an existing price, or force a product to become public.
5. `owner_avuqo_supplier_readiness_v1()`: service-role-only, SECURITY INVOKER, read-only SQL aggregate covering all 21 current owner-attested accepted Awin programmes. Counts observed feeds, flagged refresh, description headers, bounded descriptions sampled from the latest private import, historical private import rows (including repeats), active described canonical products, and published/held offer records. It never returns raw feed text, prices, private campaign emails, signed URLs or keys.
6. `/control-centre/supplier-readiness`: owner/admin login-required source-readiness cockpit, reachable from existing Control Centre home, workspaces and Awin feed monitor. Explains per-programme specific next steps, type-specific service adapters, and evidence/rights distinctions.
7. `tests/awin-supplier-description-readiness.test.mjs` is a mandatory GitHub CI regression covering projection, sanitisation, digest and licence gating, staging, supplier type and SQL privilege, plus retained page links.

## Correctness and rights gates
- **No blanket permission** is inferred from programme acceptance or feed availability. Current programme metadata contains no explicit `product_description_rights_verified: true`; the default is fail closed. Historical Petlibro feed/imagery consent is affirmative but the advertiser ID discrepancy must be reconciled before any automatic flag is changed.
- New private descriptions appear only in **future authorised imports/rechecks**, not automatically in already staged rows. The owner can inspect them privately; no automated bulk product publication or private data exposure is introduced.
- Individual source adapters remain necessary for exact mobile tariffs, broadband, energy, insurance, EPCs, MOT and airport bookings; do not represent service leads as physical inventory.
- Tyres UK and Pneus Online remain gated on explicit GBP, full technical fitment, shipping/fitting and per-source rights; private EAN overlaps do not publish comparisons.
- Awin rejection recovery is a separate active workstream. Confirm the actual Awin promotional classification, public merchant auditability, and programme-specific advertising policy before reapplying. Do not publish sensitive rejection correspondence in the public repo.
- A source feed header does not establish useful populated descriptions or permission to republish text. Normalisers do not fabricate specifications.

## Release and operator acceptance
- Required GitHub CI: lint, build, full existing tests, new description/readiness tests, secret scan, native PostgreSQL tests.
- Merge only on green checks, then verify Vercel production SHA and HTTP body. A response status 200 alone is insufficient if a streamed React component fails.
- Apply versioned `supabase/migrations/20261120201000_owner_avuqo_supplier_readiness.sql` using reviewed privileged migration flow, **separately** from app deployment. Verify `has_function_privilege('anon'/'authenticated' ... EXECUTE)=false`, `service_role=true` and call the RPC to check 21 programme rows and latest counts.
- The new authenticated dashboard must gracefully report unavailable data if its migration is not yet installed. Check it as the owner, verify all 21 programmes and descriptive next actions, and confirm `/shop` still renders unchanged already approved products.
- No new merchant credentials, new Awin classifications, uploaded emails, programme approvals, import scheduler activations, override rights, held-offer releases or automatic description-licence grants occur here.
- Preserve and date all release evidence in the active handover after real verification.

## Next follow-up work after the release
1. Inspect sample rows from each of the five known description-column feeds, checking substantive quality, variation, licence, brand/variant identity and XSS/markup.
2. Confirm and record exact merchant text-use permission (Petlibro ID discrepancy first), then run bounded authenticated refreshes to verify source descriptions without reactivating unapproved feeds.
3. Compare before/after supplier readiness: private source descriptions, publicly eligible canonical descriptions, stock/GBP/image/score/approval failure reasons. No expectation that all 84k Tooled Up rows should publish.
4. Implement private advertiser-compatibility and rejection tracking, with recovery outreach only to eligible merchants.
5. Add specialist tariff/quote and grocery/tyre adapters only with lawful source-rights evidence.
