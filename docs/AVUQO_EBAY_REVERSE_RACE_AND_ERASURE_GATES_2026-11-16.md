# eBay reverse-order concurrency witness and remaining release gates

**Date:** 16 November 2026. **Status:** candidate manual probe, **not executed**, no live race pass.

## Purpose and precise limit

The existing `scripts/test-ebay-tombstone-race.sh` tests whether an uncommitted receipt blocks a competing account-link INSERT at the actual link gate. Its live two-client run remains open. This companion script witnesses the opposite **advisory lock direction**: a separate PostgreSQL session acquires exactly the key used by `ebay_reject_tombstoned_account_item_link`, and an incoming receipt INSERT must time out on that same key with SQLSTATE `55P03`. The holder rolls back; the receipt contender also rolls back on success path. Pre/post row totals and synthetic receipt absence are asserted.

**This is not a true reverse link-first end-to-end race.** The holder does not create an eBay account-item link, because production eBay source/quarantine prohibits suitable synthetic eBay offers. A true reverse test requires an isolated, authorised fixture/clone with an eligible eBay offer and the actual link trigger, then a receipt contender and an observed committed-link-to-receipt erasure transition. It must also test alias identities and failures.

## Run (authorised clone only)

```bash
ALLOW_EBAY_RACE_TEST=true \
EBAY_RACE_TEST_DATABASE_URL="<private authorised connection URL>" \
bash scripts/test-ebay-reverse-lock-witness.sh
```

Do not paste a connection URL into GitHub, shell transcripts or chat. Requires `psql` and `openssl`. Missing credentials, missing overlap, an unexpected SQLSTATE or any remaining synthetic record is not a pass. CI tests only syntax and static safeguards, **not runtime concurrency**.

## Full erasure and compliance acceptance plan (still OPEN)

1. Establish authoritative identity lineage of all eBay user/seller identifiers, not text-marker matches alone. Include historical orphaned mappings, product ingestion, offers, price observations, matches, affiliate/click analytics, internal audit and remote media/log stores.
2. Record per-store classification: controller/processor, legal basis, deletion versus minimum-necessary restricted retention, owner, retention duration, backup purge/expiry, restoration re-suppression, evidence and verification strategy. This needs legal and processor evidence, not a made-up retention interval.
3. Design durable idempotent receipt processing with retries and explicit failures; preserve permanent/appropriate suppression tombstones and never mark complete based on a partial database purge.
4. Prove with controlled fixtures: both actual transaction orders, multi-identity alias collision, committed pre-existing links, retries, mid-workflow errors, crash/replay, non-eBay isolation, no unexpected residuals, backup restoration guard and downstream purge acknowledgments.
5. Only after independent full-store/processor and legal approval: validate actual provider signature and replay controls, credentials, notification contract, test notification, permitted callback acknowledgement, registration and production Browse rights.

**Current safeguards unchanged:** eBay paused, sync off, product imports quarantined, POST webhook 503/unregistered, no production eBay approval claimed. Awin private merchant pipelines unchanged. No production SQL/schema mutation in this work.

**Evidence boundary:** GitHub scripts are runbooks; green build/lint/static CI is not a real psql concurrency pass or GDPR compliance certificate.
