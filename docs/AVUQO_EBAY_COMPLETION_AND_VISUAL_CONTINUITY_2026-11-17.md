# AVUQO eBay completion: production release gates and design continuity

**17 November 2026 | Read-only production verification | £0 additional spend | No Docker | eBay remains NO-GO**

## Goal and brand continuity

Finish eBay as an authorised multi-retailer product and offer source feeding AVUQO's premium comparison, deal, search and category journeys, not as a separate eBay shop or AVUQO-owned fulfilment operation. The owner also re-confirmed the visual direction using a three-option AVUQO identity concept image: (1) modern/confident deep navy with violet-blue accents, (2) premium/discovery dark-plum with pink/orange accents, (3) fresh/energetic dark-navy with green/cyan accents. Each depicts AVUQO logotype and icon, **Find what's worth it**, prominent search, travel/shopping/cars/hire/experiences navigation, a hero image, AVUQO Score badges and mobile-friendly premium category cards. **Design concepts are not evidence of completed UI or live product scores.** No option was selected in this conversation; preserve the current live branding until owner choice/review. Real score values must be computed from evidence, not copied from mock-ups.

## Live eBay release diagnostic

Read-only `scripts/ebay-production-release-gate-readonly.sql` ran against live Supabase and recorded **4 PASS / 7 BLOCK**:
- PASS: four historical foundation migration records exist; eBay source paused/sync disabled; thirteen offer FKs with seven known additional cascading dependencies; baseline destructive routines remain outside app-role EXECUTE privilege.
- BLOCK: nine later privacy migrations not installed; seven-surface erasure work journal missing; new independent cascade guard missing; account-specific storage/CDN/logs/backup evidence; lawful retention and external processor evidence; signed provider-notification acceptance and verified end-to-end callback; final provider approval (hard blocked).
- The matching foundation names have differing repository timestamps; their actual definitions, constraints, grants, RLS and trigger details require precise verification before any nine-only additive install.
- A storage bucket-name inventory found no eBay-named bucket; that **does not** establish absence of eBay data in shared buckets, logs, caches, backups or third parties.
- This scan did not read or alter seller receipts, tokens, or private user rows.

## Engineering sequence before launch

1. Machine-reconcile the four already-installed foundations and all roles/permissions/FK/trigger definitions.
2. Prepare and test a nine-only, additive, reversible production installation against a faithful schema; do not replay the thirteen candidate SQL files blindly. Obtain independent production DDL review.
3. Complete each seven-surface per-account retention/erasure disposition, storage and processor evidence; never erase independently owned shopper/Awin records by an unreviewed cascade.
4. Implement bounded idempotent erasure handling and honest durable notification acceptance with signed payload, retries and no false 2xx; review eBay's current provider requirements.
5. Only after separate operational/legal owner approval, configure production eBay credentials, portal webhook registration and enable verified private feeds. Publish fresh, authorised products through canonical identity, rights checks, transparent AVUQO Score and owner release controls.
6. Verify the public AVUQO search, hero/category page, product detail, genuine prices, affiliate disclosures, Watch/Saved handoff and responsive design using owner-approved brand direction.

## Changes in this draft PR

- `scripts/ebay-production-release-gate-readonly.sql`: non-mutating 11-gate audit.
- `tests/ebay-production-release-gate.test.mjs`: gate and no-write safety contracts.
- `.github/workflows/quality.yml`: CI test step.
- Updated `docs/AVUQO_ACTIVE_HANDOVER.md`, `docs/PROJECT_STATUS.md`, and this runbook.

**No live eBay activation, provider notification acknowledgement, database migration, product publication or production deployment was performed. Awin remains unchanged.**