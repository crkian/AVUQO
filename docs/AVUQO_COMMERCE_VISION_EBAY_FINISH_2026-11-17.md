# AVUQO commercial vision and eBay completion checkpoint | 17 November 2026

## Owner intent, superseding overly narrow historic business language

AVUQO is a hands-off, automation-led shopping, bargains, comparison and commerce platform. It sources permissioned links, feeds and offers from Awin, eBay, affiliate networks, direct merchants, authorised wholesalers, potential dropshipping suppliers, travel and specialist APIs. It identifies matching variants and landed prices, rates genuinely evidenced bargains with a commission-independent AVUQO Score, provides Saved/Watches and a premium shopping journey, and can automatically market its own approved deals subject to owner controls, licences, consent and platform permissions.

Purchase modes remain **distinct**, not interchangeable: (1) affiliate referral to retailer checkout; (2) partner/API-authorised checkout initiated or completed in AVUQO, only if expressly permitted, with seller/payment roles disclosed; (3) prospective AVUQO seller-of-record resale or dropshipping with corresponding supplier, payments, tax, safety, delivery, returns and customer obligations. The owner **wants the option of all three**. The 16 Nov historical phrase 'does not directly supply, dropship or fulfil' describes the then-current operating system and cannot be treated as a permanent strategic prohibition. Equally this correction does not assert that ecommerce checkout or dropshipping is currently implemented, contracted or permitted under eBay APIs.

Preserve the existing warm-premium, photographic live design, category routes, search, AVUQO Score, account journey and premium colour treatment; refer to `docs/design`, the original visual index and selectively reconciled old design branches. Owner-supplied screenshots are continuity references, not permission for wholesale theme replacement.

## Verified same-session stack, not prior-chat inference

**Production deployment separately verified:** Vercel deployment `dpl_5GUcUbCtLYWxMpvdY2evEwBzpbdj` is `READY`, target `production`, Git branch `main`, SHA `cc4e9a99e3c2874407e7ac3c5b893adac333d6d4`, matching GitHub current main. This confirms deployed commit provenance, not successful eBay onboarding or current customer purchase flows.\n\n

- GitHub **main** remains `cc4e9a99e3c2874407e7ac3c5b893adac333d6d4` (PR #266). PRs #267 (foundation read-only check), #268 (Awin private launch audit), #269 (eBay 11-gate diagnostic) are DRAFT and not merged. Avoid calling them live production work.
- Vercel `avuqo` project and domains `www.avuqo.com`, `avuqo.com` found; recent **preview** deployment results for PR #269 include canceled attempts and one READY preview, **not proof of production release**. Do not mistake project `live:false` metadata or latest canceled preview for public domain state. Production READY+alias+SHA needs separate confirmation.
- Live Supabase source registry: both `awin` and `ebay` `paused`, `sync_enabled=false`, `credential_status=not_configured`, `health_status=unknown`. Secrets may be managed outside DB; do not print/decode them.
- Four historic eBay foundation migration records use different timestamps from repository candidates. Nine later privacy migrations remain unapplied according to 17 Nov live migration history. Offer FK inventory=13, seven unreviewed ON DELETE CASCADE dependencies. No blind 13-migration production replay.
- Existing `app/api/ebay/account-deletion/route.ts` GET challenge responds only when configured; POST verifies signature and attempts HMAC-only receipt journaling, but deliberately responds HTTP 503 to any properly signed notice pending durable full privacy operational controls. Production portal screenshot: alert email saved, endpoint and verification token empty.
- Earlier owner's Awin snapshots are private stage, not public permissions. No source activation or product publication through this documentation change.

## Critical technical distinction: durable acceptance versus deletion completed

A **successful HTTP 2xx notification response is acknowledgement of receipt/acceptance**, not necessarily proof that every downstream deletion action finished synchronously. A finished implementation must authenticate the notification and commit an idempotent durable receipt and all seven corresponding work items atomically, then only respond success in the precise semantics eBay expects and the approved processing policy supports. A 503 is correct if durable acceptance and compliance readiness cannot be guaranteed. Avoid both unconditional 2xx and an endless 503 after a later proven durable queue. Test duplicate deliveries, signature verification, failures/rollbacks, replay, retry, concurrent account-link insertion and one receipt's aliases without persisting raw identifiers. Independent legal/privacy retention, backups, shared storage, logs and external processor processing still need verified dispositions and monitoring.

## Ordered eBay finish plan, without shortcuts

1. Audit the four installed production foundations against exact repository object definitions, RLS, constraints, triggers, privileges, indexes, owner and migration history, ideally machine-comparable. Identify any drift.
2. Build and rehearse a **nine-only additive** migration plan on a faithful isolated schema with the actual installed foundation equivalents, with deterministic blockers, safe backup/recovery and locks. Require separate review before production DDL.
3. Complete seven-surface privacy work: mapped eBay catalogue, indirect identifiers, AVUQO shopper analytics/attribution (not automatically seller-owned), storage/media, CDN/app logs, backups/restoration, external processors. Evidence, legal retention and exception handling cannot be guessed from zero database counts.
4. Build bounded, idempotent background workflows and proper durable receipt+queue acceptance. Verify actual signed production notification tests before enabling POST 2xx. Register endpoint/token in eBay portal only after accepted privacy/operational release.
5. Independently confirm production Browse/API/EPN commerce rights and exact permitted content/link/image/checkout usage. Private read-only catalogue pilot first, then authoritative prices, stock, condition, variant, fees/delivery and release-reviewed public comparison offers. Do not treat eBay affiliate partner links as permission to perform eBay-hosted checkout within AVUQO.
6. Integrate into the existing AVUQO storefront and autonomous marketing with honest scores and paid-link disclosure. Any future AVUQO dropshipping/merchant checkout is a separate contractual and technical launch gate.

## Source authority and handover rule

Read `AVUQO_START_HERE.md`, `AGENTS.md`, `docs/AVUQO_ACTIVE_HANDOVER.{md,json}`, `docs/AVUQO_GIT_BRANCH_SOURCE_FEATURE_TRACKER_2026-11-16.{md,json}`, `docs/AVUQO_COMPLETE_GIT_BRANCH_IDEA_HANDOVER_INDEX_2026-11-14.md`, `docs/AVUQO_PROJECT_COMPASS.md`, `docs/AVUQO_COMPARE_AND_BARGAINS_RELEASE_STRATEGY_2026-11-13.md`, relevant eBay runbooks, original project spec and design references. The Git repo is **public**: no provider secrets, screenshot secrets, or private source PDFs. Read-only live services outrank stale snapshot claims. Separate chats in the project are not automatically a browsable transcript; the Git handovers and Project files are the durable cross-chat evidence.

**Execution status: this is a draft reconciliation, not an eBay launch, contract approval, new production SQL, or completed legal review.**
