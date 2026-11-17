# AVUQO | Same-day real-product launch acceleration, 17 November 2026

**Release decision: public Awin imports BLOCKED pending verified merchant/product rights, current valid price, authorised links and owner release; eBay HARD NO-GO pending independent privacy gates.**

This is a release-readiness record based on actual read-only production Supabase SQL on 17 November 2026, not a claim that the staged catalogue is public. No production writes, no spend, no Docker, no source activation and no eBay webhook changes.

## Live inventory, carefully distinguished

Seven merchant names are represented by **122,538 private `feed_import_records` rows** across **13 import runs**. Of these, 119,843 have `status='review'` and 2,695 `status='excluded'`. Repeated imports can contain the same products; record counts are **not distinct offer counts**. All underlying import runs currently report `permission_status='unverified'` and `status='private_review'`.

| Merchant | Runs | Private records | Review | Excluded | Import rights |
| --- | ---: | ---: | ---: | ---: | --- |
| Tooled Up | 1 | 84,284 | 84,284 | 0 | unverified |
| Tyres UK | 1 | 31,372 | 28,990 | 2,382 | unverified |
| Cadbury Gifts Direct | 2 | 2,738 | 2,738 | 0 | unverified |
| AKKO UK | 2 | 1,820 | 1,622 | 198 | unverified |
| Craft Buddy Shop | 1 | 1,299 | 1,233 | 66 | unverified |
| Mozillion | 4 | 883 | 883 | 0 | unverified |
| Petlibro UK Affiliate Program | 2 | 142 | 93 | 49 | unverified |

**Other live facts:** 19 `affiliate_programs` entries have provider `awin`, all `pending`. Both `sources` connector records `awin` and `ebay` are `paused`, `sync_enabled=false`, `credential_status=not_configured`. There are six `active` offers, all sourced from `demo`, with none observed in the last seven days; do not advertise these as today's authorised real Awin products. There are four active product rows and 258 draft product rows in the product table; joins of active offers to active products need not equal the number of unique products.

## Zero-shortcut launch plan

1. **Awin first, controlled small batch:** reconcile evidence of approved Awin advertiser membership with internal programme and import rights. Verify permitted feed, image, price, link and public-republication usage for an individual merchant, without assuming programme membership alone grants all rights.
2. **Refresh and validate one feed:** use authorised access, verify currency, current price/availability, duplicates, exact variant identity, permitted images and affiliate destinations. Keep legacy private snapshots private until their currency and licences are proved.
3. **Owner review and explicit publication:** use the existing merchant/offer release controls, server-side checks and audit; publish a small product cohort only after actual rights, link and data checks pass. Never directly flip thousands of records to active with ad-hoc SQL.
4. **Verify the actual public customer journey:** discover/search/category, detail and merchant handoff, correct affiliate disclosure, click integrity, SEO/noindex treatment of thin or unverified pages, mobile rendering and rollback/unpublish controls.
5. **Expand in measured batches:** check links, stale data, errors, merchant rights and visitor experience before increasing volume.
6. **eBay is a separate critical path:** keep the connector paused and callback at HTTP 503 until full privacy/migration reconciliation, lawful erasure/storage/retention workflow, provider notification and an approved release. Do not trade those gates for same-day product volume.

## Immediate blockers and completion gates

- **Hard commercial gate:** 0 of 19 Awin programme records currently approved in AVUQO; every examined import is unverified. External approvals may exist but are not reflected in this table. Do not infer approval.
- **Technical gate:** source `awin` is paused and no credentials configured according to database metadata. Credential truth and approved merchant feed access must be verified server-side, without exposing secrets.
- **Quality gate:** private import count is not unique products, current prices, public feed rights or merchant authorisation. No bulk activation from review-only records.
- **eBay legal/security gate:** 13 offer FKs identified; four historical production-equivalent migrations need exact reconciliation; nine later candidates are uninstalled. eBay remains blocked until the independent provider privacy acceptance requirements are met.
- **Cost gate:** no paid services or new subscriptions authorised in this work.

## Evidence and repeatable check

`scripts/affiliate-launch-readiness-readonly.sql` contains aggregate-only queries for importer permission, staged counts, offer freshness, source status and programme state. All are SELECT statements. They do not approve products. A read-only live run verified the final provider breakdown as `awin / pending / 19`; the other aggregates were queried individually in this chat against the same live project.

## Current outcome

**Delivered:** new read-only audit script, production inventory analysis, and reviewable documented launch sequence.

**Not delivered:** live Awin product publication, live eBay import, provider approvals, credentials, revised owner rights or production deployment. Until evidence changes, describing those products as live would be false.

**Next action:** secure one merchant's verifiable authorisation and feed rights, refresh it, and safely progress the first fresh eligible Awin cohort through existing owner-reviewed publication. Separately continue the eBay privacy reconciliation.
