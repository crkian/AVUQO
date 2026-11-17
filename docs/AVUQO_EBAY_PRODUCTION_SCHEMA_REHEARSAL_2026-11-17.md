# eBay production-derived schema-only rehearsal: release checkpoint (17 November 2026)

**Result of live read-only production check:** 4 structural/quarantine PASS, 1 intentional installation BLOCK. **No production DDL, DML, customer data retrieval, eBay activation, checkout activation, or new spend.**

## Why this is necessary

The native PostgreSQL nine-only rehearsal introduced by PR #271 uses simplified synthetic tables. Those synthetic tests validate important behaviour, including exact link ownership and a 14th-FK safety interlock, but they do **not** recreate production's entire offers/deals/Awin/customer/reference schema. The four foundation equivalent migrations are already installed in production under different version numbers. The nine subsequent privacy migrations remain uninstalled.

PR #280 verified 22 original foundation columns, privileges, sequences and three core FK rules. This step records the **complete live production offer-FK topology** and adds a strictly isolated real-schema-only rehearsal path. These are prerequisites to, not a substitute for, reviewed production installation.

## Real production evidence, no customer records

`scripts/ebay-live-offer-fk-topology-readonly.sql` is a read-only contract run against live Supabase on 17 November 2026:

| Gate | Live result |
| --- | --- |
| Exactly 13 direct FK relationships referencing `public.offers.id` | PASS |
| All 13 exact names, FK columns, validation, nondeferrability and deletion actions | PASS |
| One paused eBay connector, sync disabled | PASS |
| All nine pending candidate migration versions absent from history | PASS |
| Production installation authorisation | BLOCK, deliberately |

**Four ON DELETE SET NULL tables:** `analytics_events`, `attribution_events`, `user_feedback`, `watch_events`.

**Seven sensitive ON DELETE CASCADE tables:** `availability`, `awin_offer_release_reviews`, `awin_release_audit`, `click_events`, `deal_scores`, `promotion_candidates`, `published_deals`.

**Two intended ON DELETE CASCADE tables:** `ebay_account_item_links` and `price_history`.

The check rejects an unexpected 14th FK, renamed columns or unexpected CASCADE/SET NULL change. It confirms schema evidence only, not that the seven related stores contain zero data or that a purge is lawful.

## True schema-only rehearsal path, prepared but not yet executed on a production export

New `scripts/test-ebay-nine-only-production-schema-dump.sh` accepts **only an operator-supplied custom-format schema-only PostgreSQL archive** through `AVUQO_EBAY_SCHEMA_ONLY_DUMP`. The archive must be independently reviewed and stay **out of GitHub**, because DDL can contain business-sensitive names, rules or function bodies even without user rows.

Rehearsal properties:

1. Refuses operation except under the local `postgres` OS user, `PGHOST=/var/run/postgresql` and `PGDATABASE=avuqo_ebay_ci_synthetic`. Rejects known remote URL/password/service environment inputs.
2. Refuses missing, symlinked, or non-`.dump` archives and any archive TOC that contains TABLE DATA, BLOBS, or materialised-view data.
3. Creates a **new disposable local database**, never drops a pre-existing one, restores schema only, never loads customer rows, and cleans up only its own database.
4. Rejects mismatched seven installed foundation function-body hashes and mismatched 13/9/4 foreign-key topology before running any pending SQL.
5. Reads the **exact nine-only suffix** of the reviewed thirteen-file manifest and applies **only those nine candidate SQL files** in a single rollback-on-error local transaction.
6. Checks the seven-surface queue, restricted boolean receipt witness, independent offer-cascade trigger and privileged RPC restrictions after the local rehearsal.
7. Reports pass **only** if every check succeeds. The final eBay provider release is still NO-GO.

**Critical limitation:** this script has not been run against a true production-derived archive in this PR. CI runs its **syntax/safety contract tests**, while the existing synthetic native PostgreSQL nine-only replay remains part of regular CI. A real archive can include extensions, grants or dependent schemas unsupported by the local machine; any such failure is an actionable release blocker, not permission to ignore it.

## Review gate for a production-derived archive

An authorised operator must create a strictly schema-only `pg_dump` custom archive from the actual production database using their approved secure connection, include the dependent schemas required by the public objects, check that its TOC contains no TABLE DATA, and transfer it to a secure transient environment with no secrets in CI logs or public Git history. **Never supply a live database URL or credentials to the local rehearsal runner**. The runner is designed to work with an existing offline archive only.

After successfully replaying, review detailed production-only object/extension/ownership drift, database backup and restore evidence, migration locks, whether existing stored rows block triggers or constraints, and a transaction-safe additive-only install plan. Schema-only tests cannot prove compatibility with live data and do not replace backup/rollback review.

## Release roadmap

- **Completed in code and deployed before this PR:** signed webhook check, private HMAC receipt, default-OFF seven-surface HTTP 202 acceptance path, existing owner Control Tower and native PostgreSQL synthetic replay.
- **This PR:** production 13-FK read-only exact check, safe offline real-schema replay entrypoint, contract tests, CI wiring, master handover updates. No production eBay SQL application.
- **Still blocked:** true production-schema archive rehearsal; full database release authorisation and nine-migration installation; data/retention-specific seven-surface operational review, logs/media/backups/processors, signed provider notification tests, eBay Production keyset and Browse/EPN commercial permissions, authorised real offer publication and any additional Buy API checkout approvals.

**Safety unchanged:** eBay remains paused with HTTP 503, Awin isolated/untouched. Existing warm-premium AVUQO shopping experience and `/control-centre/ebay-privacy` remain intact. No Docker, £0 additional spend.

## Source references

- `docs/AVUQO_ACTIVE_HANDOVER.md` and matching `.json`: central full-platform resume point
- `scripts/test-ebay-nine-only-migration-replay.sh`: earlier synthetic rehearsal
- `scripts/ebay-foundation-objects-release-readonly.sql`: exact foundation check
- `scripts/ebay-live-offer-fk-topology-readonly.sql`: new live graph check
- `scripts/test-ebay-nine-only-production-schema-dump.sh`: local offline real-schema rehearsal path
- `tests/ebay-schema-only-production-replay.test.mjs`: safety and topology regression contract
