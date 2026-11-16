## 16 November 2026 · eBay read-only erasure readiness preflight validated in live Supabase (NOT deletion completion)

Candidate `scripts/ebay-erasure-readiness-preflight.sql` and static test `tests/ebay-erasure-readiness-preflight.test.mjs` added, with CI gate and detailed [runbook](AVUQO_EBAY_ERASURE_READINESS_PREFLIGHT_2026-11-16.md). The exact read-only SQL was executed against production Supabase project `tfoukwcruaamrtgxzshh`: eBay source paused, sync false; both account admission guards enabled; both DBA-only purge functions unavailable to anon/authenticated/service_role; receipts, links, eBay-source offers/ingestion/matches/price history and partial-audit rows all zero. SQL explicitly outputs `false` for real two-session race proof, cross-store erasure, backup/retention, signed provider event, and production activation readiness. No production DB writes, migration, live eBay activation, webhook change or Awin work. Existing 503 unregistered callback and source quarantine preserved. This is a *database evidence snapshot only*, not a compliance certificate or full deletion workflow. Next: owner-authorised two-psql client runs on clone, then complete idempotent processor, retention/backup and provider-signed event testing. GitHub candidate branch pending CI and merge.

## 16 November 2026 · Reverse-direction eBay advisory-lock witness candidate (NOT a live race pass)

Added an opt-in independent-two-psql-process reverse advisory-lock probe (`scripts/test-ebay-reverse-lock-witness.sh`), static contract tests and GitHub CI syntax gate. It deliberately simulates the account-link advisory key rather than writing a prohibited eBay offer, so it is **not a true link-first committed transaction proof**. Neither the original receipt-first nor this reverse probe has been executed using authorised private database connections. Read-only production SQL reconfirmed eBay `paused`, `sync_enabled=false`, deletion receipts 0, account links 0, and both locking guards enabled. No Supabase writes, webhook registration, eBay activation or Awin changes. Full erasure, backup/processor policy, actual signed provider notifications and production approval remain NO-GO. Details: `docs/AVUQO_EBAY_REVERSE_RACE_AND_ERASURE_GATES_2026-11-16.md`. Candidate branch only until CI and merge. 

## 16 November 2026 · PR #244 safe two-connection race harness merged and production deployment READY (race remains unproven)

**Verified release:** [PR #244](https://github.com/crkian/AVUQO/pull/244) merged at application SHA `6b9327da9c2d6d8d495afc71116091268ded9ce5`. Exact matching Vercel production deployment `dpl_94EkJnHRRrFAJMPHgLyMa2ie1jRR` **READY**. PR head `891b94250e83c4655a00a32a0ab737f2066fe639` passed GitHub lint, build, `bash -n` and the new race-harness static test, plus committed-secret scan. No production Supabase schema or eBay source changes.

**Honest test boundary:** An attempt to coordinate two independently submitted live SQL tool requests returned `RACE_TEST_UNEXPECTED_NO_CONTENTION`, so **overlapping transactions were NOT proven**. It is neither a pass nor proof that advisory locks are incorrect. New `scripts/test-ebay-tombstone-race.sh` is a manual **two-independent-psql-process** receipt-lock contention test requiring explicit opt-in and an authorised private database URL; script requires SQLSTATE 55P03 on contender, forces synthetic holder ROLLBACK and checks no receipt/account link remains. `tests/ebay-two-session-race-harness.test.mjs` validates safety and CI syntax only, **not the actual DB race**. No independent psql run was executed because no approved connection was available. [Complete runbook](AVUQO_EBAY_TWO_SESSION_RACE_PROOF_2026-11-16.md). Next actual gate: run approved two-session test on a controlled clone, capture evidence; then inverse-order and multi-identity concurrency cases.

**NO-GO stays:** eBay production keys disabled in last owner screenshot, production OAuth/deletion credentials absent, source paused and database eBay product write quarantine enabled, deletion webhook HTTP 503 unregistered, no full account erasure/retention and backup verification, no live signed provider test or approved Browse production access. No live individual eBay priced offers. Awin existing private Petlibro, Mozillion, Cadbury, Craft Buddy, Tooled Up and tyre pipelines untouched. Continue full legal/technical erasure and supplier identity tracing before any webhook 2xx, eBay registration or source release. Maintain master handover MD+JSON, exact resume, feature tracker MD+JSON, Awin board, status and changelog at every substantive step.

## 16 November 2026 · eBay two-session race test: initial live attempt INCONCLUSIVE, repeatable opt-in test added

**Evidence:** A first attempt to demonstrate two concurrent Supabase SQL tool sessions failed to prove overlap: holder output showed zero synthetic rows, contender raised `RACE_TEST_UNEXPECTED_NO_CONTENTION`. This is **not** a test pass, nor evidence that the locking implementation is defective, because two independent overlapping client transactions were not proven. No eBay user data created or deleted. Full [race proof and limitations](AVUQO_EBAY_TWO_SESSION_RACE_PROOF_2026-11-16.md).

**New code candidate:** `scripts/test-ebay-tombstone-race.sh` uses **two independent psql processes** and a private operator-supplied `EBAY_RACE_TEST_DATABASE_URL` with `ALLOW_EBAY_RACE_TEST=true`; holder inserts an uncommitted synthetic receipt, contender requires SQLSTATE 55P03 at shared advisory lock rather than arbitrary source failure, holder rolls back and script verifies original receipt/link counts and no test markers. `tests/ebay-two-session-race-harness.test.mjs` and `.github/workflows/quality.yml` validate the harness syntax/safety, **not live DB concurrency**. Actual two-connection test requires separately authorised credentialed execution and is STILL OPEN. No production DB migration or webhook changes in this candidate.

**Continued NO-GO:** The existing account tombstone negative test and DB activation/quarantine are enforced, but cross-session race and full idempotent eBay erasure remain unverified, as do legal retention/backups, real provider signatures and eBay production API approval. Webhook still 503 and unregistered; keyset last owner screenshot disabled, priced item offers 0. Awin's Petlibro, Cadbury, Craft Buddy, Mozillion, Tooled Up and tyres private importers unchanged. Next run authorised psql test on controlled database clone, then test reverse race and full erasure before opening any eBay source or callback.

## 16 November 2026 · PR #242 eBay atomic tombstone ownership admission deployed and checked

**Exact release:** [PR #242](https://github.com/crkian/AVUQO/pull/242) merged as application SHA `1d8639f30310407cb4234160f8b6de0e77406340`, matching Vercel production deployment `dpl_FhmuWfMXY83qPhHZyXBXQmj6j3XH` **READY**. GitHub PR head `d7306f7d06bd10f9e8804ee74508dc30dfa46ce7`: build, lint, new account tombstone contract test and committed-secret scan all succeeded. Supabase migration `ebay_atomic_tombstone_admission_20261116` applied to `tfoukwcruaamrtgxzshh`. DB showed BOTH `ebay_account_item_00_tombstone_gate` and `ebay_deletion_receipt_account_lock` enabled, exact HMAC digest indexes and `postgres`-only direct EXECUTE for three new functions. Single-session rollback-only SQL negative test passed: synthetic pending deletion receipt inserted; attempting to link matching fingerprint to an existing offer failed with `Deleted eBay account cannot be relinked`; resulting receipt/link counts **0/0**. **No cross-session concurrency stress test was performed**; claims limited to observed serialized mechanism and negative single-session acceptance.

**Recovered failure:** First migration attempt failed with PostgreSQL 42601 due to SQL `as $` instead of PL/pgSQL `as $$`, and accidentally joined comment newlines. It did **not apply**; corrected delimiter/comments, strengthened CI regression and reapplied successfully. This failure and recovery are preserved in master handover, tracker and machine JSON.

**What it does:** Existing account-to-listing link table now rejects new/updated links when any exact `user_id_digest`, `username_digest` or `eias_token_digest` appears in protected deletion receipts. New receipt inserts and account-link writes take consistently keyed transaction advisory locks, and post-lock lookup uses volatile function. This is **not** a complete account deletion service or an eBay importer; receipts that arrive after existing linked rows still need audited erasure, and unrelated stores/logs/backups and retention remain unverified. Product/source DB hard-stop PR #232 remains enabled, eBay remains paused and `sync_enabled=false`. The existing deletion webhook continues HTTP **503** and is **not registered**. Production eBay keyset last owner screenshot disabled and production credentials absent; Buy/Browse production access unverified, zero individual eBay priced offers. Awin private importers and 19-programme rollout unchanged.

**Next exact work:** real two-session race test, then design complete automatically idempotent cross-store erasure, legal retention/backup/processor evidence, and an atomic source-owned importer that cannot bypass suppression. Only after full deletion, actual eBay signed-provider testing and owner approval should 2xx, registration or quarantine release be considered. Keep master MD/JSON, feature tracker MD/JSON, eBay/Awin exact resume, Awin board, status and changelog updated at every substantive step.

## 16 November 2026 · eBay tombstone admission migration acceptance and recovered syntax failure

**Verified in production Supabase:** The first migration application **failed without applying** because the third PL/pgSQL body mistakenly had `as $` rather than `as $$` (PostgreSQL syntax error at line 75). Corrected SQL body delimiter and split accidental literal newline escape comments; CI regression assertions now reject single-dollar body delimiters. Applied the fixed migration `ebay_atomic_tombstone_admission_20261116` successfully to project `tfoukwcruaamrtgxzshh`. SQL verified both `ebay_account_item_00_tombstone_gate` and `ebay_deletion_receipt_account_lock` enabled. All three new functions have `{postgres=X/postgres}` direct EXECUTE ACL; ownership-link gate uses restricted SECURITY DEFINER context to read private receipt digests, and post-lock lookup is volatile. **Rollback-only negative test passed**: inserting a synthetic pending receipt then attempting to map that same fingerprint to an existing offer was rejected with `Deleted eBay account cannot be relinked`. Final receipt count **0**, account link count **0**. This tests single-session negative behavior, **not** cross-session concurrency stress.

**Still NOT completed:** No full-store erasure or legally reviewed retention, no real eBay signed provider notification, no actual ecommerce importer, no provider approval, no enabled eBay production keyset and no 2xx deletion acknowledgement. eBay product write quarantine and paused source remain; existing webhook still returns 503 and must not be registered. Awin existing private merchant importers are unchanged. Next exact action: merge after latest green CI, verify Vercel production SHA, update proof handover MD/JSON; then build audited full erasure and future atomic importer acceptance.

## 16 November 2026 · eBay account ownership tombstone admission, atomic locking candidate

**Specific privacy bug closed in code:** Previously `ebay_account_item_links` verified only that a mapped item belonged to the eBay source. It did **not** check whether the account digest had a pending eBay deletion receipt. Versioned migration `20261116165000_ebay_atomic_tombstone_admission.sql` adds exact indexed user-ID/username/eias-token HMAC fingerprint lookups and `ebay_account_item_tombstone_gate` on account-item link INSERT/UPDATE, rejecting any previously deleted account digest. Receipt INSERT and ownership-link write both obtain the same per-digest transaction advisory lock; receipt locks ordered by hash key to reduce deadlock risk. Post-lock lookup is VOLATILE for a fresh READ COMMITTED snapshot. No direct browser/service-role RPC grant, trigger gate uses restricted owner-context read. CI test `tests/ebay-atomic-tombstone-admission.test.mjs` added. **Candidate until CI, Supabase migration and negative test verify.**

**Scope is narrow:** This prevents attaching a *new* listing ownership link to a known tombstoned eBay account. A receipt arriving after an ownership link is already committed does **not** erase existing listings; it remains pending for the previously built DBA-only partial purge plus full privacy workflow. There is still no live eBay importer, no concurrent two-session runtime test, and no verified end-to-end full-store erasure; DB quarantine PR #232 continues to prohibit eBay product writes/activation. No automated 2xx webhook acknowledgement or account deletion completion. Production keyset last screenshot disabled and production secrets absent; no live eBay offers. Awin private importers unchanged. Next verify release and test the serialized check against synthetic receipt inside a rollback-only transaction, then full identity/processor/log/backup inventory and compliant erasure.

## 16 November 2026 · PR #240 exact production eBay database/storage privacy inventory verified

**Release verified:** [PR #240](https://github.com/crkian/AVUQO/pull/240) merged at application commit `c80a090a5b136f71982c89e2a29c37fe436bd8f0`. Exact Vercel production deployment `dpl_GD1cXrGgV3so1iYsxtaWFEwocSLc` **READY** and matches that commit. GitHub build, lint, explicit `eBay private full-store privacy inventory contract tests` and committed-secret scan passed at PR head `ff2ecbd78503f00994adffcb4ba857584e5956f4`. Supabase production project `tfoukwcruaamrtgxzshh`: applied migration `ebay_privacy_inventory_counts_20261116` successfully. Verified SQL `public.ebay_privacy_inventory_counts()` SECURITY DEFINER with `{postgres=X/postgres}` only, returning aggregate counts and evidence type, no raw account data.

**Verified live rows:** exact eBay source-associated `offers`, `source_ingestion_items`, `product_matches` and `price_history` each **0**; protected eBay deletion receipts, account-item links and partial-erasure audit each **0**. Current `offers` 6 total, ingestion items 6, product matches 279, price history 6, none eBay. Marker scans showed **0** literal-eBay matches in `feed_import_records` 122,538 rows, `products` 262, `click_events` 7, `pipeline_events` 8, and the listed analytics, attribution, conversions, audit, marketing and creative asset rows (zero total in those scanned tables). Supabase Storage has **3 buckets** and **0 currently listed objects**. Source `ebay` still `paused`, `sync_enabled=false`. Read [exact audited scope and retention gaps](AVUQO_EBAY_FULL_STORE_PRIVACY_INVENTORY_2026-11-16.md). **Zero marker counts do not prove that non-labelled account IDs, past backups, provider-held data or Vercel/CDN logs are gone.**

**Compliance NO-GO:** DBA-only audited partial erasure exists (PR #238); no automatic comprehensive account erasure or documented legal retention/backup handling. Existing eBay DB quarantine blocks future item imports/activation; production eBay keyset last screenshot disabled, production OAuth/challenge/HMAC secrets absent, provider-signed production event untested, deletion webhook POST deliberately HTTP **503** and unregistered. eBay production Buy/Browse approval unverified, no live individual eBay offers. Awin 19-programme private feed work and Petlibro/Mozillion/Cadbury/Craft Buddy/Tooled Up/tyre pipelines unchanged.

**Next exact work:** reconstruct identity lineage independent of eBay text markers (including orphan and indirect JSON identifiers), establish the accountable storage, logs, backup/retention and processor inventory, then implement and verify end-to-end idempotent eBay user erasure/withdrawal with atomic suppression. Only afterward consider genuine provider signed notifications and safe 2xx/portal registration. Keep MD/JSON handover, tracker, Awin board, project status, changelog updated after each consequential step.

## 16 November 2026 · eBay full-store privacy evidence inventory, DBA-only repeatable query (candidate)

**New evidence:** [Production SQL + storage/privacy audit](AVUQO_EBAY_FULL_STORE_PRIVACY_INVENTORY_2026-11-16.md). Checked exact eBay-linked source counts: **0** offers, source ingestion, product matches, price history, receipts, account-item links and partial-erasure audit. Read-only marker scan: 0 eBay-name matches in `feed_import_records` (122,538 rows), `products` (262), `click_events` (7), `pipeline_events` (8), `affiliate_conversions`, `analytics_events`, `attribution_events`, `audit_logs`, `creative_assets`, `marketing_assets` (last six each 0 total), and storage objects (0 total). Three Storage buckets exist: Awin private snapshots, marketing-media private, marketing-media-approved public. **Zero textual eBay markers is not zero account IDs and does not prove storage backup/provider/log erasure.**

**Candidate code:** versioned DBA-only aggregate `public.ebay_privacy_inventory_counts()` in `20261116162000_ebay_privacy_inventory_counts.sql` returns only counts and classifies exact eBay source matches vs marker heuristics. Explicit SQL grants revoke PUBLIC, anon, authenticated, service_role. CI test covers data surface enumeration, no raw identity return and no writes. Verify CI, apply migration, check EXECUTE ACL and actual output before claiming installed.

**Still NO-GO:** Partial DBA-only mapped-row erasure exists (PR #238), but no automatic full-store/privacy-retention completion, no live signed provider notification, eBay production keyset disabled last screenshot and production OAuth/challenge/HMAC secrets missing, callback POST 503 unregistered, and DB eBay source/quarantine still blocking priced item offers. Do not claim legal erasure completion or enable eBay Buy/Browse. Awin's existing private merchant pipelines unchanged. Next obtain complete account identifier lineage, backup/processor retention commitments, and test end-to-end compliant erasure with suppression under review before 2xx/registration. Update Git handovers at each step.

## 16 November 2026 · Verified PR #238 DBA-only auditable partial eBay erasure production release

**Release verified:** [PR #238](https://github.com/crkian/AVUQO/pull/238) merged at application SHA `3ddab24bae8ea781113c61657e35b3819d74558a`, corresponding Vercel production deployment `dpl_6QDswzjt1ZoVeB9NrBD1DJssTMjT` **READY**. GitHub build/lint/new audited-erasure test and committed-secret scan **passed** on PR head `ed24f84b4465d6db2af60e66112dc37c131e1c12`. Supabase migration `ebay_audited_partial_erasure_20261116` successfully applied to production project `tfoukwcruaamrtgxzshh`. Verified `ebay_partial_erasure_audit` RLS **true**, **0** audit rows, `postgres` table rights only, no anon/auth/service-role rights, and both `ebay_run_audited_partial_erasure(text)` and original `ebay_purge_mapped_account_rows(text)` are SECURITY DEFINER with **postgres-only EXECUTE**. Missing-receipt negative execution failed as designed, leaving **zero** audit rows. No actual customer or seller data was deleted, and no deletion receipt was marked completed.

**Exact capability:** A DBA can now deliberately run the restricted transaction that locks a real deletion receipt, purges **only exact account-linked eBay** offers, private ingestion items and corresponding match/price rows, independently checks that no mapping remains, then logs count-only private audit evidence atomically. On any failure the deletion and audit write roll back. **Not an automatic account erasure service:** does not cover unlinked rows, analytics, remote storage, backups or all retention obligations, and is neither invoked by the webhook nor accessible to service role. [Migration and code](https://github.com/crkian/AVUQO/blob/main/supabase/migrations/20261116155500_ebay_audited_partial_erasure.sql). Protected receipt remains pending; webhook still deliberately HTTP **503** and unregistered.

**Hard blockers preserved:** eBay production keyset **disabled** in last owner screenshot, production eBay OAuth/challenge/HMAC secrets absent, no real signed provider notification test, eBay DB ingestion quarantine and source pause still active, individual eBay offers not live, Buy/Browse growth approval unverified. Awin private importer system Petlibro/Mozillion/Cadbury/Craft Buddy/Tooled Up/tyres unchanged and public Awin source still gated. **Next** fully inventory all eBay-identifier-bearing storage/analytics/backup and lawful retention, implement idempotent end-to-end erasure and future ingestion/withdrawal with atomic suppression, validate using actual signed test before 2xx, eBay callback registration or keyset enablement. Continue mandatory Git handover MD/JSON, tracker MD/JSON, Awin board, status and changelog update at every consequential step.

## 16 Nov 2026 · Audited partial eBay erasure execution (not compliance completion)

**New implementation candidate:** `supabase/migrations/20261116155500_ebay_audited_partial_erasure.sql` adds private RLS-enabled `ebay_partial_erasure_audit` with only receipt ID, row-count summaries and `partial_rows_purged` marker, no raw eBay identifiers. New **DBA-only** `ebay_run_audited_partial_erasure(text)` locks an existing signed-notification receipt, invokes the previously deployed exact-account-mapped eBay-only purge procedure in the same database transaction, checks that no linked records for any of its digests remain, then inserts count-only audit evidence. Errors roll back cleanup plus evidence. It never marks a receipt completed, cannot be called from webhook/service_role/anon/auth and does **not** cover unlinked data, backups, analytics, partner-held copies or retention. Added `tests/ebay-audited-partial-erasure.test.mjs` and GitHub CI step. This is an *operable partial cleanup with DBA intervention* once verified, not automatic entire-account deletion.

**Still NO-GO:** eBay production keyset last owner screenshot DISABLED; production eBay credentials/token/HMAC secret not configured; no real eBay signed notification, no full-store erasure or policy, eBay source quarantine remains in place, webhook POST 503, no endpoint registered, Buy/Browse permissions unverified and no priced item-level eBay offers. Awin's existing Petlibro, Mozillion, Cadbury, Craft Buddy, Tooled Up and tyre private importers unchanged; do not reactivate Awin globally.

**Next action:** CI, production migration, verify private table/DBA EXECUTE-only grants, safe negative unknown-receipt test and audit-count baseline. Implement thorough account-identity and storage inventory plus durable processing/retention evidence before allowing any 2xx webhook or eBay portal registration. Keep both handover MD/JSON and branch trackers, Awin board, project status and changelog current at every step.

## 16 Nov 2026 · PR #236 eBay deletion receipt integrity enforced and verified

**Exact verified release:** [PR #236](https://github.com/crkian/AVUQO/pull/236) merged at application SHA `7240fa1544b3eae95b9b4927229667c59deee188`, matching Vercel production deployment `dpl_3DbLghqoDubLjtLtWJnHve5ZVP9K` **READY**. GitHub build, lint, newly added eBay receipt-integrity contract test and secret scan passed at PR head `810139d358f4ba2b28a644db9065802b9c954819`. Applied versioned Supabase migration `ebay_deletion_receipt_integrity_lock_20261116` to production project `tfoukwcruaamrtgxzshh`; all **four** insert, update, delete and truncate guards are enabled on private `ebay_deletion_receipts`. A transactionally rolled-back negative test inserted a synthetic receipt, confirmed changing its state to completed and deleting it are each rejected, and checked **zero** receipt rows remained. No real user data or eBay notification created.

**Enforced policy:** eBay deletion receipt HMAC fingerprints and original timestamp are immutable, no deletion or truncation of persistent suppression tombstones, and no transition to `completed` until a separately reviewed full privacy-erasure process replaces this lock. A pending record is NOT evidence that erasure happened. Existing DB eBay product/ingestion/quarantine and paused source controls remain enforced. Webhook still intentionally returns HTTP **503** on signed deletion notices, so **do not register with eBay yet**. Last owner screenshot eBay Production keyset **disabled**; no production eBay OAuth secrets, HMAC secret, challenge token, real provider signed notification or approved Buy/Browse rights verified. No live imported item-level eBay offers, no change to Awin Petlibro/Mozillion/Cadbury/Craft Buddy/Tooled Up/tyre private importers or source permission gates.

**Next substantive engineering priority:** audited end-to-end account privacy deletion across actual stored records and retention/backup policy, durable idempotent processing and future approved atomic eBay importer. Only after this and actual production provider test should eBay webhook return a permitted 2xx, the owner register the endpoint, or eBay production keyset be described as enabled. Continue updating master MD+JSON, tracker MD+JSON, eBay/Awin exact resume, Awin board, status and changelog on every significant step.

## 16 Nov 2026 · eBay deletion receipt integrity lock (candidate; NOT compliant)

**Actual new change:** Versioned Supabase migration `20261116153000_ebay_deletion_receipt_integrity_lock.sql` creates insert/update/delete/truncate triggers for private `ebay_deletion_receipts`, permanently keeping each HMAC user identifier and original notification digest immutable and preventing receipts from being deleted/truncated, or marked `completed` until a future independently approved legal-retention/full-erasure process replaces this lock. Incoming receipts must start `pending_privacy_review`; attempts to reset blocked/processing states are restricted. This hardens the previously built signed notification journal and persistent future re-import suppression without falsely claiming any deletion. New `tests/ebay-deletion-receipt-integrity-lock.test.mjs` is wired to GitHub quality CI. **Check actual CI and migration verification before claiming installed.**

**eBay official guide clarification:** eBay accepts HTTP 200/201/202/204 on receipt and requires appropriate deletion afterward, but AVUQO's webhook deliberately responds **503** because real signed production testing, secure durable processing, legal-retention/full data deletion and controlled backlog processing are not ready. Do not register the endpoint or leave it emitting 503 to eBay; prolonged failures risk non-compliance. No real producer notifications received. This protective migration is **not** full deletion.

**Current gates unchanged:** DB quarantine PR #232 blocks eBay offer/match/history/ingestion and source activation. Production keyset last screenshot DISABLED, Vercel environment lacks production eBay OAuth and deletion/HMAC tokens, no confirmed Buy/Browse approval, 0 individual live-priced eBay offers. Existing Awin Petlibro, Mozillion, Cadbury, Craft Buddy, Tooled Up and tyre feeds are separate and preserved. Update MD/JSON handovers, tracker, Awin board, status and changelog after verified CI/Supabase/Vercel deployment.

## 16 November 2026 · PR #234 executable eBay signed-event crypto fixture verified on production deployment

**Exact release:** [PR #234](https://github.com/crkian/AVUQO/pull/234) merged at application SHA `2535b9bc5c17642ff0c0587c6f2c09b591db1f69`, corresponding Vercel production deployment `dpl_CMUH1kgzKq9GJ2YAMN6jsCAhbg6A` **READY**. GitHub build, lint and secret-scan success at PR head `3365476a099b4b175eab0d41f5808a6e6d676d33`. The new specifically named CI job `eBay signed deletion runtime crypto and network-mock acceptance` passed. No Supabase migration or source/offer changes.

**New real-execution test:** `tests/ebay-deletion-signature-runtime.test.mjs` loads and runs actual `lib/ebay/deletion-signature.ts` with synthetic EC signature, fake eBay production OAuth/public-key responses, valid 1.0 MARKETPLACE_ACCOUNT_DELETION payload and key caching. Tested positive authenticated signature and negative tampering, missing/malformed header, wrong key, invalid public key and OAuth outage. `.github/workflows/quality.yml` now runs this test on each PR. Confirmed official eBay [Node SDK validator](https://github.com/eBay/event-notification-nodejs-sdk/blob/main/lib/validator.js) and [algorithm constant](https://github.com/eBay/event-notification-nodejs-sdk/blob/main/lib/constants.js) align: `ssl3-sha1` verifies a signed JSON-serialized payload and challenge hashing uses SHA-256. **Synthetic test success does not demonstrate that an actual eBay notification was accepted or privacy deletion performed.**

**Vercel production environment names independently checked (no secret values requested):** `EBAY_SANDBOX_CLIENT_ID` and `EBAY_SANDBOX_CLIENT_SECRET` exist, but `EBAY_CLIENT_ID`, `EBAY_CLIENT_SECRET`, `EBAY_DELETION_VERIFICATION_TOKEN`, `EBAY_DELETION_ENDPOINT_URL`, `EBAY_DELETION_HMAC_SECRET` do **not** appear in the project environment inventory. Do not guess approval, use sandbox credentials against production, leak secrets or register the not-ready callback. eBay production keyset last screenshot **disabled**. DB ingestion quarantine PR #232 remains enabled, signed POST remains HTTP **503**, actual full account erasure/legal-retention review and durable completion still missing; Browse production access unverified and 0 individual eBay offers.

**Next:** complete documented full-store erasure/retention and transactional future eBay item admission before releasing 2xx or quarantine; configure production secrets privately only after eBay keyset/compliance prerequisites, run provider-signed test and portal registration. Continue Awin separately with existing Petlibro/Mozillion/Cadbury/Craft Buddy/Tooled Up/tyres private import automation and current signed-in owner feed preflight; no public Awin offers or permission state changed. Keep first-stop master handover and both JSON trackers/feature tracker/status/changelog synced after each task.

## 16 Nov 2026 · eBay signature validation: executable offline provider fixture and missing secrets audit

**Verification improvement:** New `tests/ebay-deletion-signature-runtime.test.mjs` transpiles the actual production `lib/ebay/deletion-signature.ts` and exercises it with ephemeral synthetic EC key pairs, signed `MARKETPLACE_ACCOUNT_DELETION` fixture, mocked production eBay OAuth/public key endpoints and an in-memory key cache. Negative cases cover modified signed payload, malformed/missing header, wrong EC key, malformed public key, OAuth failure and unexpected outbound URL. Linked as an explicit step of `.github/workflows/quality.yml`. Official [eBay Node Notification SDK](https://github.com/eBay/event-notification-nodejs-sdk/blob/main/lib/validator.js) uses base64 JSON signature header, Notification API public key and `ssl3-sha1` verification over `JSON.stringify` (confirmed in its constants); AVUQO's implementation uses `createVerify("sha1")` and keeps exact behavior. These are **synthetic tests**, not successful production eBay notifications or an approved subscription.

**Live Vercel environment inventory** read with values hidden: `EBAY_SANDBOX_CLIENT_ID` and `EBAY_SANDBOX_CLIENT_SECRET` exist for production deployment target, but `EBAY_CLIENT_ID`, `EBAY_CLIENT_SECRET`, `EBAY_DELETION_VERIFICATION_TOKEN`, `EBAY_DELETION_ENDPOINT_URL`, and `EBAY_DELETION_HMAC_SECRET` were **not listed**. This is stronger proof that eBay's production deletion handshake and signed provider events cannot yet run. Do not copy keys into GitHub, infer production approval or use sandbox keys as production. Prior owner's eBay Developer keyset screenshot explicitly says disabled.

**Hard NO-GO remains:** Database quarantine (PR #232) deployed on eBay offers, import rows, matches, price history and activation; owner keyset disabled; full account erasure/retention and atomic reimport suppression NOT completed, POST deliberately 503, no live item-level eBay offers, no real provider signed test, no eBay Developer endpoint registration and Buy/Browse approval unverified. Awin existing Petlibro/Mozillion/Cadbury/Craft Buddy/Tooled Up/tyres staged importers and owner preflight remain unchanged. After GitHub CI, merge and Vercel production check, update exact SHA and runbook here and in JSON trackers.

## 16 November 2026 · PR #232 eBay database ingestion quarantine verified and deployed

**Verified production release:** [PR #232](https://github.com/crkian/AVUQO/pull/232) merged, application SHA `a8e4ed201fff1d5756f55202b986a3a912ebb580`; exact Vercel deployment `dpl_7kYJ7Y1bV3AXcyi9vdveNjMT73YD` **READY**. GitHub lint, build and committed-secret scan **passed** on PR head `888436ae10fc10c89cb48e5c6f5c094f7165cd22`. Applied Supabase migration `ebay_ingestion_quarantine_20261116` successfully to production `tfoukwcruaamrtgxzshh`. Verified all **five enabled triggers**: `ebay_offers_quarantine`, `ebay_ingestion_quarantine`, `ebay_product_matches_quarantine`, `ebay_price_history_quarantine`, `ebay_source_activation_quarantine`. Controlled activation-test attempted `sync_enabled=true` for eBay inside a caught error block; the trigger rejected it and subsequent read confirmed eBay **paused, sync_enabled=false**. No production eBay offers or ingestion items observed. No source or customer data modified.

**What is enforced:** New eBay offers, ingestion rows, product matches and price history writes/updates are denied in the database while source is `ebay`; eBay cannot be unpaused, enabled or relabelled away. Awin and other sources unaffected. [Detailed quarantine runbook](AVUQO_EBAY_DB_INGESTION_QUARANTINE_2026-11-16.md). This intentionally prevents any future eBay API importer from publishing until a reviewed **atomic** account-ownership mapping, suppression and full erasure/privacy-compliant ingestion replaces this temporary hard-stop.

**Remaining blocker:** Production eBay keyset remains **disabled** per last owner screenshot, credentials/portal subscription not configured, no real provider signed test, no full account erasure and documented lawful retention, no verified Buy/Browse access. Existing signed deletion webhook remains deliberately HTTP **503** and must **not** be registered with eBay. No item-level eBay products live. The automatic Awin Petlibro/Mozillion/Cadbury/Craft Buddy/Tooled Up/tyre private pipeline is preserved, still separate and unreleased. Next: complete actual audited deletion + read/write proof and safe future eBay item importer, then provider end-to-end test and owner eBay Developer registration. Continue keeping master MD+JSON, tracker MD+JSON, Awin board, status and changelog current after every substantive step.

## 16 November 2026 · eBay DB-wide ingestion hard-stop (implementation candidate)

**New database safety design:** [eBay write quarantine and removal gates](AVUQO_EBAY_DB_INGESTION_QUARANTINE_2026-11-16.md). Prior code already has a private signed notification receipt journal, HMAC identity suppression helper and DBA-only partial mapped erasure, but the suppression helper is **not wired to an importer**. New versioned migration `20261116141000_ebay_ingestion_quarantine.sql` installs a DB-level trigger on `offers`, `source_ingestion_items`, `product_matches`, `price_history`, rejecting both INSERT and UPDATE if old/new source is eBay. A second guard rejects accidental eBay source unpause, `sync_enabled=true` or connector relabel. Unrelated merchant data remains writable. Contract test `tests/ebay-ingestion-quarantine.test.mjs`. **At this checkpoint, this is a PR candidate; verify CI, apply migration and confirm triggers before claiming it is effective in production.**

**Not completed:** No eBay data erasure, product importer, source activation, OAuth or verification tokens, signed provider test, registered deletion endpoint or production Browse approval. Live prior checks showed 0 eBay product/receipt rows; eBay Production keyset disabled per owner screenshot, webhook returns 503 even after signed receipt. **Do not remove the quarantine to go live** until future atomic importer establishes authenticated account ownership + suppression, rights, current GBP price and withdrawal and passes privacy approval.

**Awin unchanged:** already-built Petlibro/Mozillion/Cadbury/Craft Buddy/Tooled Up/tyres private automation; no new public offers. Continue owner preflight and preserve the complete 19-programme rollout. After meaningful work update active handover MD/JSON, branch tracker MD/JSON, Awin board, status and changelog.

## 16 November 2026 · PR #230 exact production release: DBA-only eBay account-scoped erasure groundwork

**Verified release:** [PR #230](https://github.com/crkian/AVUQO/pull/230) merged at application commit `15e6ea77f01dde2562cb59cc30ea752f238b7d85`, with Vercel production deployment `dpl_9Uzu8G3iAkVdFEmALeZyi8xg5zW4` **READY**. GitHub build/lint/secret scan passed for exact PR head `a6c0667ea4423f5bb83ed57794342972d6188604`. Supabase production project `tfoukwcruaamrtgxzshh`: migration `ebay_account_scoped_erasure_foundation_20261116` applied successfully, confirmed `ebay_account_item_links` RLS enabled and **0 rows**; `service_role` SELECT and INSERT only; `postgres` owner full rights, anon/auth no grants. Function `ebay_purge_mapped_account_rows(text)` is SECURITY DEFINER and ACL only `postgres=X/postgres`, not service/anon/auth. Non-destructive migration: **no user data erased**, no deletion receipts completed (0 at verification).

**Shipped scope:** HMAC-only account identity-to-exact eBay offer/private-ingestion ownership mapping, guarded by trigger proving referenced source is eBay. DBA-only transaction can partially purge exact mapped eBay offer, matching price-history, product-match and private-ingestion rows, but it has **no production webhook execute permission**, is not wired automatically and does not satisfy total account erasure, arbitrary raw JSON, analytics/storage/backup retention. [Exact limitations](AVUQO_EBAY_ACCOUNT_ERASURE_FOUNDATION_2026-11-16.md). The production eBay webhook intentionally still responds HTTP **503** to verified POSTs; production keyset remains last observed **disabled**, production OAuth/secrets and actual signed provider test not performed. Do **not** register callback, submit eBay token, mark eBay production Browse approved, enable source or claim item-level live offers.

**Next exact work:** review all account-linked tables and retention policy, implement fully idempotent real erasure and suppression across relevant stores and future importer, verify signed real eBay notification and owner portal eBay keyset status, then separately obtain Buy/Browse permission. Awin existing private importers, 19-programme rollout and paused publication remain unchanged. Continue first reading GitHub newest master handover and synchronising every result to MD/JSON/tracker/status/changelog.

## 16 Nov 2026 · eBay account-mapped partial erasure foundation (candidate, NOT completion)

**New audited foundation:** [eBay account-scoped erasure design and exact limits](AVUQO_EBAY_ACCOUNT_ERASURE_FOUNDATION_2026-11-16.md). A private HMAC-only account-to-offer/ingestion ownership table and **DBA-only** scoped erasure procedure were added in migration `20261116132000_ebay_account_scoped_erasure_foundation.sql`. Its trigger rejects links to non-eBay sources, and the procedure locks a known deletion receipt, matches all recorded HMAC aliases, deletes only exact eBay-linked price-history, product-match, offer and ingestion rows transactionally. **No service role/webhook EXECUTE grant, no state='completed', no 2xx receipt acknowledgement, and no broad row deletion.** SQL is a release candidate pending checks/migration verification. At last read there were 0 eBay item rows and 0 deletion receipts; applying DDL will not erase anything existing. Follow [privacy inventory](AVUQO_EBAY_PRIVACY_INVENTORY_2026-11-16.md) for what is and is not inspected.

**Still blocked:** Real deletion across other stores/backups/retention, future ingestion transactional ownership map + suppression, provider signature E2E, production OAuth/secrets and eBay Developer subscription. eBay production keyset last shown disabled; eBay Browse approval unverified. Existing webhook intentionally 503. Awin (Petlibro, Mozillion, Cadbury, Craft Buddy, Tooled Up, tyres) unchanged and not made live. Update active handover and machine trackers after CI, Supabase application and Vercel evidence.

## 16 November 2026 · PR #228 eBay re-import suppression deployed, **not** deletion-complete

**Release:** [PR #228](https://github.com/crkian/AVUQO/pull/228) merged at application SHA `2b98473686af18ff89886238a53b674f6f173faa`. GitHub quality and secret scan succeeded on PR head `9a336aea113629c98ad9143f933d58353a4a6ece`. Exact production Vercel deployment `dpl_5xLi7CzRVLvrGoAoG4psGJMVP25G` is **READY**.

**Code actually deployed:** Shared HMAC account identity derivation `lib/ebay/deletion-identity.ts` is used by existing private receipt journaling and new `lib/ebay/deletion-suppression.ts`. It checks all supplied signed/trusted `userId`, `username`, `eiasToken` hashes against service-only receipt records; returns suppressed on any match and unavailable on missing/invalid identifiers, missing secrets or database errors. Only an explicit all-clear permits future ingestion. Unit/contract tests added and original journaling domain separation retained. **Guard is not wired into an eBay product importer because none exists**; nothing was imported or erased. Privacy audit [detailed here](AVUQO_EBAY_PRIVACY_INVENTORY_2026-11-16.md) checked zero eBay source-linked product, import, match, history and receipt rows, plus zero eBay-marked tracked metadata; this is not complete privacy/backup assurance.

**NO-GO:** The deletion webhook still replies **503** to signed POSTs after receipt. No actual end-to-end erasure, future source ingestion integration, real eBay signed-notification test, eBay production OAuth/secrets or portal subscription. Production keyset last shown **disabled**. Do not enter endpoint into eBay Developer or claim compliance. Buy/Browse approval independent and unverified; eBay search-category EPN links (PR #219) do not represent imported individual offers. No Awin source controls, imports or public offers were changed.

**Next exact implementation:** documented retention/erasure inventory across all raw account-bearing stores, atomic deletion/suppression with verified completion and failure retries, mandatory guard on every future eBay importer, live provider signature test and then portal setup. Awin separately resumes via existing owner-only signed-in private preflight and merchant-scoped release. Keep latest Git handover MD/JSON, tracker MD/JSON, Awin board, status and changelog current at every step.

## 16 Nov 2026 · eBay privacy suppression guard: candidate, not account deletion

**Privacy audit:** Production Supabase `tfoukwcruaamrtgxzshh`: **zero** eBay source-linked offers, source-ingestion rows, product matches, price-history or deletion receipts; **zero** eBay marker matches in queried click, attribution, analytics, conversion and audit metadata. This is a limited read-only inventory, **not** assurance there is no historical eBay identity or data in backups or unrelated stores. [Exact audit scope and code](AVUQO_EBAY_PRIVACY_INVENTORY_2026-11-16.md).

**Implementation candidate:** Centralise existing `userId`/`username`/`eiasToken` domain-separated HMAC-SHA256 derivation without invalidating old receipt digests. New server-only `lib/ebay/deletion-suppression.ts` checks *every provided* identity digest against private `ebay_deletion_receipts`: any matching receipt, even pending, is **suppressed**; missing secret, unusable identity or query error is **unavailable**, never an allow. `requireUnsuppressedEbayAccount` returns true only after all lookups clear. Added tests. **Guard is a reusable contract, not wired into an eBay importer because the latter is not built or approved.** It is not a deletion processor.

**No release of privacy gate:** eBay signed POST still returns **503** even for journalled events. No erasure, atomic completion, backup/data-retention review, OAuth production access, live signed test or eBay endpoint registration was done. The owner screenshot still shows Production keyset **disabled**. No live individual eBay offers or new Awin offers. Continue all prior Awin merchant work unchanged. Next: build complete verifiable erasure across real data stores and wire mandatory suppression into future Browse/Feed import; then signed E2E test before acknowledging 2xx or registering eBay endpoint. Read the new audit file and this first-stop handover every fresh chat.

## 16 November 2026 · eBay private deletion receipts deployed: PR #226

**Verified release:** [PR #226](https://github.com/crkian/AVUQO/pull/226) merged, application SHA `fdc522e795a24e7dea5f398a8f82603c52271dd6`, production Vercel deployment `dpl_DCt1bZ98keTG9CrJ5UT7nqQ7WdQs` **READY**. GitHub build, lint and committed-secret scan passed at PR head `a3b35a6fa31792a217a21aee1e8384250bbbaf5a`. Supabase migration `ebay_private_deletion_receipt_journal_20261116` applied successfully to project `tfoukwcruaamrtgxzshh`; SQL verified `public.ebay_deletion_receipts` RLS **true**, **zero** rows, only `postgres` owner full rights and `service_role` SELECT/INSERT; anon/authenticated no grants. Source-linked `offers` and `source_ingestion_items` had **zero eBay rows** at this audit (not a complete privacy data inventory). A security-advisor check was requested.

**Implemented:** signed eBay notifications can be recorded in a private journal as keyed HMAC-SHA256 notification/user identifier digests with idempotent duplicate detection; raw identifiers and payloads are not stored in this table. Even after a valid signature and receipt, webhook still responds **503**, because irreversible account data erasure, future ingestion suppression and legal-retention handling are NOT implemented. No production `EBAY_DELETION_HMAC_SECRET`, production eBay OAuth credentials or deletion verification token was configured in this release, so real signature and journal acceptance are **not tested**. No eBay endpoint was registered with eBay, and the owner screenshot still indicates the production keyset **disabled**.

**Next exact action:** inspect remaining per-user/seller data stores and legal retention, implement idempotent privacy erasure plus preventing re-import, add signed provider fixture/end-to-end negative tests, then install secrets privately and validate with eBay BEFORE returning successful 2xx or registering webhook. Separate Buy/Browse production permission remains unverified. PR #219 EPN search links can function, but item-level eBay offers remain 0. **Awin unchanged:** 19-programme target, existing Petlibro/Mozillion/Cadbury/Craft Buddy/Tooled Up/tyres private importers and owner preflight are preserved; no live Awin offers were published in this step. Continue updating master handover and both JSON trackers plus status/changelog every step.

## 16 Nov 2026 · eBay account deletion private receipt journal PR candidate

- New RLS/private service-role-only `ebay_deletion_receipts` SQL journal, HMAC identifier hashing and duplicate detection, verified-signature-only intake. Signed POST still deliberately HTTP 503 until actual account-data erasure and suppression exists. No eBay portal registration, no live item offers; Awin pipelines unchanged. Handover details in `docs/AVUQO_ACTIVE_HANDOVER.md`.

## 16 Nov 2026 · PR #224 eBay signed-notification validation deployed, not subscribed

**Verified implementation:** [PR #224](https://github.com/crkian/AVUQO/pull/224) merged at application SHA `7a791a342d60f5dfff9326f0a8b5fb0e80250afa`. GitHub quality checks and secret scan succeeded. Exact Vercel production deployment `dpl_YJKMvcPyXzHGcrkngV4m7DDWeRuE` is **READY**. This supersedes PR #222 as the latest confirmed application code.

**What it does:** `lib/ebay/deletion-signature.ts` has strict bounded parsing of eBay `X-EBAY-SIGNATURE`, production eBay OAuth and fixed Notification API public key retrieval/cache, and signed JSON verification following eBay's official Node SDK protocol. Existing `/api/ebay/account-deletion` GET challenge is preserved; POST now rejects invalid signatures and unsupported topics, then deliberately responds HTTP 503 even to verified messages because durable idempotent deletion and suppression are not yet implemented. Synthetic crypto tests and lint/build checks passed, but **no real eBay signed notification** was tested and the live endpoint was not provider-verified. No production OAuth secrets were installed here.

**eBay NO-GO:** Owner's screenshot still shows Production keyset disabled pending Marketplace Account Deletion compliance; do NOT register the endpoint or claim the receiver is compliant. Next implementer must construct service-only durable deletion-event journal, identify all stored seller/user identifiers and implement actual erasure/suppression with idempotency and independent security acceptance. Then add production credentials/token in Vercel privately, conduct signed provider test, and register the working endpoint with eBay. Separate Buy/Browse approval remains unresolved. EPN category/search links from PR #219 are deployed but still not item-level priced eBay offers.

**Awin unchanged:** Petlibro, Mozillion, Cadbury, Craft Buddy, Tooled Up bulk and tyre private pipeline exists; 19 programme target, last 251 private canonical drafts / zero verified public Awin offers; live publication requires current merchant rights/prices, owner preflight and merchant-scoped refresh/withdrawal. No Awin source changed. Keep all Git MD/JSON handovers plus Awin board and status/changelog updated after each action.

## 16 Nov 2026 · eBay signed POST verification implemented, deletion processing still gated

**Implementation candidate:** New `lib/ebay/deletion-signature.ts` verifies eBay `X-EBAY-SIGNATURE` headers using decoded key ID, fixed production OAuth client-credentials token endpoint and eBay Notification public-key endpoint (short-lived cached), the official eBay Node SDK's JSON message verification procedure and EC/SHA-1 digest, with strict input bounds and a fixed host. Existing `/api/ebay/account-deletion` now parses bounded JSON, rejects invalid/missing signature (HTTP 412), rejects other topics and malformed notifications, and still deliberately refuses verified deletion events (HTTP 503) until durable erasure/suppression is built. Added negative-contract and synthetic EC signature tests. Do not call this receiver compliant yet.

**Critical permissions and reality:** `EBAY_CLIENT_ID` and `EBAY_CLIENT_SECRET` production OAuth values are not configured/verified; the owner screenshot still shows production keyset **disabled**. No API token call, eBay live signed message, full erasure or portal subscription was performed. Public EPN-only search links from PR #219 remain separate from API item feeds. Awin existing Petlibro/Mozillion/Cadbury/Craft Buddy/Tooled Up/tyres private infrastructure unchanged, no new public Awin offers.

**Next eBay code:** privacy inventory of all data stored against eBay seller/user identifiers; non-public deduplicated notification-event audit/queue and tamper-safe suppression/deletion across all data-bearing tables, safe repeat handling and rejection tests; provider-specific verification fixture using an actual approved eBay sandbox test before enabling the endpoint. Only after successful GitHub CI, Vercel READY and actual signed test should owner register HTTPS URL + secret in eBay Developer. Awin owner's signed-in private preflight remains next separate lane.

## 16 Nov 2026 · Verified PR #222 eBay deletion challenge release

**Merged code:** [PR #222](https://github.com/crkian/AVUQO/pull/222), production code commit `2691b5e1d7b0bf74e0f3918ee99074ec5b87275f`; exact Vercel deployment `dpl_DPzu7bNj2qGcyXkyFSeDu9zHi5m6` reported **READY**. GitHub quality checks and committed-secret scan succeeded after correcting a Next.js 16 `cacheComponents` incompatibility: the first build rejected route-level `runtime="nodejs"`, removed before merge. Live endpoint challenge-response HTTP request was **not independently tested** because network retrieval was unavailable, and runtime secrets `EBAY_DELETION_VERIFICATION_TOKEN` and `EBAY_DELETION_ENDPOINT_URL` were **not configured**. The GET route thus fails closed until properly configured.

**Critical NO-GO for eBay registration:** GET SHA-256 challenge groundwork exists, but signed POST `X-EBAY-SIGNATURE` verification, durable idempotent deletion/retention audit and negative testing are **not implemented**. POST deliberately responds 503. **Do not paste the endpoint into eBay Developer, submit a token or claim eBay production keys enabled** until full receiver is implemented and verified. eBay's production keyset remains disabled as evidenced by owner screenshot, and Buy/Browse API production approval remains unverified. No individual eBay item catalogue or Awin retailer offers were published in PR #222.

**Next engineering priority:** finish fully authenticated and durable eBay deletion notification receiver with test coverage, preserve source privacy, configure secrets directly in Vercel and verify challenge/POST before owner portal registration. Owner can separately save the eBay notification-down email, but saved state was not yet evidenced. Awin existing private import machinery continues unchanged; run signed-in owner preflight then merchant-specific publication with fresh rights/price checks.

**CI correction 16 Nov:** Initial PR #222 GitHub build failed because `export const runtime="nodejs"` is incompatible with existing Next.js 16 `cacheComponents`; removed this segment config without changing challenge or POST refusal logic. Do not mark build/production READY until rerun checks pass. No production change arose from the failed CI.

## 16 Nov 2026 · eBay account-deletion callback phase 1 implementation (PR candidate)

**Actual new code:** `app/api/ebay/account-deletion/route.ts` provides an exact canonical-URL eBay SHA-256 GET challenge, server-only `EBAY_DELETION_VERIFICATION_TOKEN` (32-80 permitted chars), server-only `EBAY_DELETION_ENDPOINT_URL` that must equal `https://www.avuqo.com/api/ebay/account-deletion`, rejects extra query parameters/malformed tokens, never caches the response, and fails closed without correct environment. `tests/ebay-deletion-challenge.test.mjs` covers URL, digest order and POST refusal.

**CRITICAL INCOMPLETE COMPLIANCE GATE:** The POST handler deliberately returns HTTP **503** and never acknowledges a deletion message until authenticated `X-EBAY-SIGNATURE` verification with eBay public key plus durable idempotent delete/retention-audit workflow have been implemented. **DO NOT enter/register this endpoint in eBay Developer. DO NOT mark production keyset enabled.** This is verified challenge groundwork, **not an operational deletion subscription**. No eBay credentials or token have been entered; no SQL/new storage/rights/source change; no imported eBay or Awin offers. eBay sandbox keys remain separate and owner screenshots prove Production keyset disabled. Next implementer task is complete signed POST verification and erasure queue after privacy/data-inventory review, with negative tests and eBay challenge verification, before any registration. Run CI/preview then merge, update exact deployed SHA and handover.

**Awin unchanged:** existing Petlibro/Mozillion/Cadbury/Craft Buddy fixed private importers, Tooled Up full snapshot + 250-row batch pipeline and specialist tyre staging. Owner should run safe preflight from `/control-centre/awin-feed-updates` and capture actual outcomes, then merchant-scoped rights/price release and withdrawal. Do not reactivate paused global Awin source or treat private drafts as public offers.

## 16 Nov 2026 · Critical latest resume: eBay production keyset **disabled**, Awin imports already built

**Always read this first in new chats, then [exact eBay/Awin resume and screenshot evidence](AVUQO_EBAY_AWIN_EXACT_RESUME_2026-11-16.md), [Awin completion board](AVUQO_AWIN_COMPLETION_BOARD_2026-11-16.md), [19-programme rollout matrix](AVUQO_ALL_AWIN_MERCHANT_STAGING_TO_LIVE_2026-11-16.md), and [branch/feature tracker](AVUQO_GIT_BRANCH_SOURCE_FEATURE_TRACKER_2026-11-16.md).** Owner requires Git handover + JSON and status/changelog updated at every meaningful action or failure, preserving all earlier history.

**NEW owner screenshots:** eBay Developer Production keyset for AVUQO Product Comparison exists but explicitly displays **"Your keyset is currently disabled"** until marketplace account-deletion compliance or qualifying exemption. Marketplace Account Deletion is selected; HTTPS endpoint and verification token blank, exemption toggle off, notification email save not verified. Never claim the production keys usable or insert a fictional endpoint. Owner next saves notification-down email; developer next safely builds and tests an account-deletion challenge and signed POST handler, deploys it before owner registers the endpoint, then verifies re-enablement and separate production Buy/Browse approval.

**Shipped eBay customer foundation:** [PR #219](https://github.com/crkian/AVUQO/pull/219) merged at `71ac99ac5d6fa0d060823d9f0c1efde1e94d8ef6`; matching Vercel production **READY**. `/partners/ebay-uk` and homepage EPN category searches are affiliate linkouts, **not live imported eBay product prices**. Prior production key observations only showed sandbox names. **Awin already built:** Petlibro, Mozillion, Cadbury and Craft Buddy fixed private import/reconcile; Tooled Up snapshot, SHA validator and resumable 250-row bulk importer; specialist tyre staging, owner run-now and six-job journal. 19 programme evidence records, 251 private Awin draft identities, last observed public Awin offers 0. Do **not rebuild**. Next owner action: current signed-in Awin preflight at `/control-centre/awin-feed-updates`; then merchant-specific verified publication and automatic withdrawal. Prior checked Supabase Awin/eBay sources paused, zero non-demo offers; no new supplier offer or production credentials activated here.

**PR reconciliation:** older PR #220 used a pre-#219 main snapshot and may conflict with eBay launch handover. This newer checkpoint preserves #219 as actual latest shipped app; do not merge stale docs over it.

## Unreleased · Public eBay UK EPN affiliate category discovery · 16 Nov 2026

- Public eBay UK partner landing and homepage shelf; six fixed EPN tracked search categories with UK rotation, active campaign, clear disclosure. No scraped images, invented product/price/stock, simulated customer offer or eBay production Browse API use.
- Connected EPN accepted-terms email and active campaign establish a general partner-link basis; developer Browse API approval and Production keys are still missing. Site price catalogue remains off; six legacy offers are demo only.
- Add official-link safety tests and full Git handover, branch/source/feature tracker, eBay onboarding, Awin board, status and changelog updates.

## Unreleased · Record full 19-programme Awin automatic staging-to-live scope · 16 Nov 2026

- Owner confirmed all eligible Awin programmes/products should stage and ultimately publish automatically, not stop at one item or six pilots. Added complete 19-programme table/JSON, 17 numeric IDs, 16 joined registry IDs, two missing IDs, 74 observed feed IDs among 11 advertisers and precise category-specific blockers. Live Awin offers remain zero; private canonical products remain 251.
- Record why the current paused single Awin source, exact advertiser env and per-price offer-review gate **do not** implement safe multi-merchant automatic publication. Next build must isolate merchant licence/price and auto refresh/withdrawal, and reuse Tooled Up 250-item importer.
- Update active handover Markdown/JSON, branch/source/feature tracker Markdown/JSON, Awin board and project status. No source status, approval, images, offers or app code changed; documentation-only production build should be ignored.

## Unreleased · Reconcile original 14 Nov index against live 25-branch / 37-feature tracker · 16 Nov 2026

- Reopened the complete 14 Nov Git/branch/idea handover and its machine index. Linked **all 29 original P0–P4 workstreams and 12 G01–G12 gaps** to current source-derived feature IDs in the active tracker Markdown+JSON. Preserve original 22-ref snapshot, 1,384 inactive taxonomy seed, original high-resolution/16 mockup source references, marketing/eBay/tyre/commission acceptance gates and original 50 category-guide ambitions. Never treat an older branch requirement as a live integration.
- Add clear current-history overlay to original old index without rewriting 14-Nov branch/deployment facts; update active handover Markdown+JSON, machine state, Awin board, ROADMAP and project status.
- Verify merged PR #216 current Awin owner-only private run-now and six-job journal at application SHA `d977cfa3a01265b1401235c728c089da377a256d`, Vercel `dpl_E5cbjLHeTA1s6CHPmtJu2UFvjeuh` READY, home and Control Centre feed update route HTTP 200, POST-only route GET 405. Owner signed-in preflight still untested, source paused, zero published Awin offers. This is **documentation-only**; avoid another Vercel app build.

## Unreleased · Owner-only Awin live preflight and private runs · 16 Nov 2026

- Add owner-authenticated same-origin fixed Awin private source preflight/staging and Tooled Up snapshot/validation using existing protected workers. Owner Control Centre feed updates show buttons and six-job safe Cron journal, without falsely marking manual runs as Cron.
- No feed URL/digest supplied by browser, no new importer, permissions bypass, source activation or public offer writes. Update complete Git feature tracker and Awin completion board with the signed-in owner acceptance gate.

## Unreleased · Live 25-branch, 14-source, 37-feature Git tracker and Awin finish board · 16 Nov 2026

- Add dated full Git branch tracker (all 25 exact refs/SHAs/compare statistics, seven open PRs, two security refs, 15 unreconciled archives), original S01–S09 plus 5 affiliate terms source hashes, 37 source-derived feature groups, historic start-up/patch script risk classification and Awin release pipeline.
- Leave all 24 divergent refs intact until current-main content/PR/protection review. Reuse existing SHA-verified GitHub merged branch cleanup; no blind deletion, mass cherry-pick or historic build reset.
- Require both branch/feature tracker documents alongside active handover Markdown/JSON, project status and changelog for each code/schema/cron PR, with a versioned JSON parity test.
- Do not copy confidential source PDFs, screenshot or terms binaries into public Git. Awin source remains paused, rights and live price gates pending, 0 offers; no new source activation.

## Unreleased · Post-release proof for Awin cron attempt journal · 16 Nov 2026

- PR #213 merged; GitHub tests and secret checks passed. Production Vercel `dpl_2isQnD9gt7AkAsboVGARCmrhhfjq` READY for `d6c94f9e`; www.avuqo.com HTTP 200 exact marker.
- Both versioned Supabase journal migrations applied and checked: RLS on; service-role SELECT/INSERT/UPDATE only; no anon/authenticated grants; journal empty as expected at first verification. Awin source remains paused and public offers zero.
- Mark scheduled six-job observability deployed, **not yet observed executing**; next cycle requires outcome journal inspection and cross-checks with actual private records. Full audit and remaining work in active Git handover Markdown and JSON. Docs-only proof avoids further Vercel application builds.

- Add second post-create migration to revoke Supabase default broad `service_role` grants and restore only SELECT/INSERT/UPDATE; verify RLS and no anon/authenticated grants.
## Unreleased · Private Awin Cron attempt journal · 16 November 2026

- Add service-role-only, RLS-enforced `awin_private_cron_attempts` for **four scheduled private feed imports plus Tooled Up snapshot/validator**, with start/finish time, sanitized fixed outcome code, HTTP status and duration. A timed-out worker remains visibly `started`.
- Record attempts after authentication and before each worker; finish categorically without raw merchant URLs, product data, credentials or untrusted error messages. Audit errors fail closed. No new daily schedules, activation or public products/offers.
- Add Node regression tests and migration; update active Markdown/JSON, historical machine state and project status in Git. Release/first actual run requires independent verification.

## Unreleased · 16 Nov 2026 existing Awin automation verification and per-task Git recording

- Read-only check of 16 Nov current Awin feed-discovery, Supabase private imports, Tooled Up storage/validation, control states, Production Vercel env-key presence and historical runtime logs. Confirmed **zero public Awin offers** and **no source/merchant rights changes**.
- Correct prior uncertainty: first Tooled Up snapshot/validator schedule went live with 16 Nov 09:47 UTC READY deployment, **after** 08:05/08:25 cron slots. The 16 Nov zero snapshot count was not a missed scheduled execution; first possible run 17 Nov. Pilot imports still need direct invocation/skip/failure verification.
- Owner requires full Git handover update **after every material action or investigation**, including no-code audits. Updated active Markdown/JSON, historical machine state, PROJECT_STATUS and CHANGELOG together. No application code, Supabase write, image, product or publication changes, so no additional production build required.

## Unreleased · Exact post-merge active-handover deployment proof · 16 Nov 2026

- PR #210 merged at `3a98b50948d16599ac46d6c8a087c323e7688e7b`, quality and secrets passed. Vercel deployment `dpl_6oMYNWsFCrUG1ZM37Zu8B6mfPGAY` READY; signed-out `www.avuqo.com` returned HTTP 200 with matching deployment identifier.
- Refresh active handover and machine-state production proof. No supplier feeds, rights, public offers or live data source settings changed. This docs-only verification commit may be skipped by the Vercel ignored-build step.

## Unreleased · Git-tracked full operational handover and mandatory updates · 16 Nov 2026

- Add [the complete active operational handover](docs/AVUQO_ACTIVE_HANDOVER.md) and machine snapshot [JSON](docs/AVUQO_ACTIVE_HANDOVER.json), covering current verified main/Vercel/Supabase, all feed and permission evidence, 13 crons, 7 open PRs, 22 outstanding priorities, deployment history and original source/branch/idea index.
- Link the living record from README, START_HERE, AGENTS, historical handover, Compass, status and roadmap. Preserve old dated material rather than rewriting original evidence.
- Require the active Markdown and JSON to change together with status/changelog on every code/schema/cron PR in the existing GitHub CI register. No supplier rights, production source switches, customer offers or raw credentials changed.
- Docs-only Git head may legitimately differ from the earlier Vercel READY **application** SHA due to the project's ignored-build command.

## Unreleased · Automate existing Tooled Up snapshot and full-feed validator

- Connect the previously implemented Tooled Up `496:89987` exact-feed snapshot uploader and full-stream integrity validator to separate 08:05 and 08:25 UTC daily Vercel Cron paths. Guard both with cron authentication, source pause, joined programme, source-ingestion switch and global emergency stop, including rechecks before private writes.
- Select only a current immutable private snapshot by exact 64-hex digest and storage creation time. Do not reinterpret 4 Nov owner's 84,284 private review records as current. Make inventory row comparison advisory against current observations, not a hardcoded stale count.
- No new import rows, public offers, images, rights flags or product activation. GBP verification and resumable 84k-row staging still block automatic catalogue release.

## Unreleased · Craft Buddy scheduled private SKU candidate reconciler

- After bounded 45747:F1356 private Awin import, add 07:57 UTC daily service-role-only transactional reconciler: exact SKU drafts, review-only candidate mappings, bounded fresh completed source digests, safe skip of excluded out-of-stock rows, global stop, source pause and idempotence.
- No public products, retailer offers, images, prices or trademark/character licences inferred. The 28 October manual import is never accepted for automatic matching. Keeps all existing feed, tyre and marketing cron paths.
- Tests and Supabase versioned migration gate release.

## Unreleased · Craft Buddy exact Google-format private import pilot

- Record Awin 45747 joined screenshot and Craft Buddy terms in private permissions registry. Stage only exact F1356 Google Awin feed through bounded reviewed parser, strict advertiser+signed URL, global stop, no publication. New 07:17 UTC private cron.
- No product drafts created from 28 Oct snapshot, and no public price/image rights inferred.

## Unreleased · Cadbury private candidate cron and validated Awin feed source

- Strict 07:47 UTC daily reconciler for Cadbury Gifts Direct 736:48599, accepting only newest completed, digest-validated private AUTO import with bounded unique supplier IDs, verified GBP, physical goods, stock and tracking. Fails closed without a current validated import; the 4 Nov historical 1,367 rows cannot seed the automatic draft matcher.
- Creates only canonical-keyed drafts and candidate matches, preserving Cadbury sales-category no-commission rules and no public images/prices/offers. Keeps existing Petlibro, Mozillion, tyre and marketing jobs and global stop.
- Records owner-uploaded Cadbury profile/terms evidence in private rights ledger; advertiser-specific public offer and image rights still require appropriate evidence.

## Unreleased · Mozillion SIM-free handset catalogue auto-candidates

- Daily 07:37 UTC private candidate reconciler reuses the 07:09 UTC Mozillion physical-phone feed. It checks 229 independently identified handsets (166 Brand New, 63 Good as New in 14 Nov snapshot), using stable merchant SKU, not missing GTIN/MPN or display-title matches.
- Atomic, idempotent service-role-only transaction stops on global controls, bad feed state, incomplete digests, unknown handset brands/types, source identity reuse, missing explicit GBP, bad tracking and ambiguous grades. All products remain private drafts; no public prices, affiliate offers, images or marketing are written.
- Add versioned Supabase migration, cron and acceptance tests. This does not grant vendor publication rights.

## Unreleased · Automatic private Petlibro SKU reconciliation after daily feed import

- Add one daily service-role-only post-import cron for advertiser 77952, feed 103580. An atomic idempotent RPC validates paired source identities, reuses existing draft products, creates only new drafts, and records candidate source links without copying unverified photos or prices.
- Preserve merchant ID, price freshness, source pause and per-offer owner release gates. No public prices, offers or publishing. Leave the other current daily Awin feeds and marketing cron unchanged.
- Include strict database grant/stop controls and CI tests. Candidate until Supabase migration, preview, main merge, exact Vercel deployment and read-only production verification.

## Unreleased · Separate daily private Awin pilot feeds and reduce AVUQO build churn

- Candidate adds three independent daily, fixed-feed private Awin cron paths for Petlibro, Mozillion and Cadbury while retaining feed-list monitor, Pneus and marketing cron. Strict existing worker checks, source pause and unverified private review remain. No public Awin product price or offer release.
- Only approved small-physical feed allowlist changes; Cadbury 736:48599 requires full current Awin schema validation before any staging rows. Service, contract, Google-format, tyre and oversized catalogue feeds stay isolated.
- Adds Vercel ignored-build filter for documentation and CI-only changes; code changes still build. One grouped Git commit reduces preview build fan-out. Complete tests and production verification required before activation.

## Unreleased · Prevent Petlibro doubled product identities in first live-data pilot

- Production private feed identity audit reveals 44 historical Petlibro rows are 22 matching pairs with separate `_feed` and `_health` source IDs. Added a read-only, bounded pair-audit module and owner screen preview of five candidate groups, without collapsing source rows or publishing products.
- Safety rules flag conflicting price, title, GTIN, currency, tracking, missing pairs and invalid review status; missing model column is explicitly informational. Counts become incomplete rather than falsely claiming full catalogue readiness beyond 500 fetched rows.
- New unit and access-control tests are required in GitHub quality CI. No merchant rights, approvals, canonical product records, price histories, public offers or deployment changed.

## Unreleased · Owner-operated Petlibro Awin preflight and private staging safety

- Candidate owner-only Control Centre at /control-centre/awin-pilot: reuse the existing secret-protected Awin worker in-process for advertiser 77952, feed 103580. Read-only preflight must pass before the UI offers a separately confirmed private staging action. No new credential distribution or public importer URL.
- The automatic Awin worker now checks the existing global ingestion and emergency-stop controls before product-row writes, between chunks and before completing an import, while still allowing read-only preflight. Paused Awin source, joined membership, snapshot fingerprint and private unverified rows remain required. An interrupted write remains resumable.
- No source activation, rights attestation, canonical product conversion, offer approval, cron change or public price is performed. Source remains paused. Requires GitHub CI, preview owner acceptance and exact production release verification. Old public Awin connector still needs a separate safe canonical product/offers bridge.

## 14 November 2026 · Live Data streamed candidate shortlist and explicit role checks LIVE

- PR #197 split the up-to-5,000-row private candidate scan from faster dashboard metrics using accessible Suspense loading. Initial unauthenticated smoke failed due to private UI markers in redirected HTML/RSC. PR #198 immediately enforced explicit owner/admin authorization in the parent page and async child before private DB queries; this **passed signed-out production RSC inspection**. Final app SHA `0f84dba3a1c9e8487c953b24c8a0ca1a4eb1838d`, Vercel `dpl_6J8N1ErH35V3GqY77rQR7xxAkowP` READY and homepage 200 matching. CI/secrets/preview passed; signed-in speed and shortlist correctness still require owner browser test. No source/merchant/cron/product publishing changes.

## Unreleased · Live Data stream access-control hotfix

- After PR #197's READY scan-streaming release, a signed-out request still received some private dashboard React payload during the layout's login redirect. Add explicit owner/admin authorization within the Live Data route and nested async candidate panel before database reads or JSX. Tests verify pre-query guards. No private rows observed in the sampled response, but anonymous RSC content must be excluded before acceptance. No DB, retailer, source or marketing changes.

## Unreleased · Stream Live Data metrics independently of private 5,000-row candidate scan

- Move the read-only pending candidate scan into a separate async server panel behind an accessible Suspense fallback. The original 200-row paging, 5,000-row maximum, dedup, permission warnings and 40-row preview remain. Failures are explicitly Unavailable, no imported products or publishing controls change. Actual owner browser latency improvement remains to be measured.

## 14 November 2026 · Control Centre editor private request boundary LIVE

- PR #195 code `08c34b2c58aa93084ed8e72d166bcba4120bf800`, Vercel `dpl_2r8GhTAvLXmMw4nbuA1EgymqdGbT` READY. The authenticated editorial page editor now opts into request-time rendering before role, parameters and DB access; tests guard server-only private observation count access in Source Atlas and Marketplace. No content was saved or published, no broad DB grant applied; owner browser acceptance pending. Added independent Work screenshot/latency audit brief. Product draft-slug HTTP 200 defect remains open.

## Unreleased · Control Centre owner editor request-bound rendering

- Explicitly mark the authenticated public page editor as request-bound under Next.js Cache Components; `connection()` precedes any role, search-param or private draft reads. Preserve owner-only publishing and existing server actions. CI guards both owner role-first Awin observation count dashboards. Existing private Awin count is 74, but signed-in owner browser and editor log checks are pending. No Supabase, source, cron or publishing changes.

## Unreleased · Public product pilot true 404

- Resolve permissioned verified product or allowlisted editorial research identity before streaming a product page; unknown/draft-only URL must be genuine HTTP 404 instead of streamed 200. Pass approved data to renderer once, preserve all price/source/media gates, add regression in CI. No supplier or marketing activation.

## Unreleased · Four editorial product model guides visible without unapproved offers

- Add public buying research for four identifiable products (MacBook Air M4 13-inch, Ninja AF300UK, Dyson V15 Detect Absolute, LG C4 65-inch family), linked from `/products`, homepage and tech/home department shelves. Their individual routes show checklist/model caveats and manufacturer info, **not** prices, stock, licensed product images, AVUQO scores or affiliate purchase links. Existing verified-offer admission takes priority, unpublished pilots stay hidden, and research detail routes are noindex. No database, import, source rights, marketing or cron activation.
- Prepared separate read-only Work QA brief for mobile/desktop product/design testing, to run only when user credits allow.

## 14 November 2026 · Complete Git/idea/handover register VERIFIED on production

- PR #189 application/docs SHA `20006d39f7ae9541f79ca39ef9966818cb0cae93`, Vercel `dpl_DrcFffyiYBCmdF9T6PcYoKfjDqd4` READY and homepage 200 exact deployment. Added consolidated human and machine-readable Git register for 22 observed branches, five active PR drafts, nine original source ideas, 29 roadmap workstreams, 12 gaps and the complete handover navigation. No code feature, Supabase, Awin, media rights, pricing, cron or marketing activation change. Original confidential source files stay outside public Git, clearly indexed by digest.

## Unreleased · Unified AVUQO all-Git, branch, idea and handover register

- Create a navigable GitHub index and JSON companion for the full observed 22-ref branch inventory, five open drafts, original 9 owner source references, 29 roadmap delivery IDs, 12 evidence gaps, current production proof, all critical handovers and cross-workstream future ideas. Preserve distinction between mapped ideas, staged/blocked source rights, verified production features and original confidential assets absent from public Git. No application code, provider, import, marketing or scheduled-job changes.

## 14 November 2026 · Three historically closed branch refs retired, production verified

- PR #187 production SHA `79e97df4761cb57010bbf874bc92440545b6709f`, Vercel READY `dpl_wWZ37buUPN9syB77c9AEYFfXQVGf`. Exact audited and content-preserved branches from closed PRs #50, #51, #85 were confirmed absent after the frozen-SHA retirement action. Branch count 25 to 22 including main, original 63 to 22. The original PR history is retained, remaining 14 divergent refs and original design/security/tyre work protected. No app features, permissions, feed source or cron activated.

## Unreleased · Three closed historic branches reconciled against main

- Record original contributions from closed-unmerged PR #50 (Awin error redaction), #51 (Cadbury/Petlibro merchant terms) and #85 (cross-provider price/eBay/Watch/SEO requirements), all already preserved in newer current-main code or documents. Add a one-time GitHub workflow limited to their frozen reviewed branch heads, with fail-closed protection checks; no deletion claimed until action logs/branch inventory prove it. No customer-facing code or source controls changed.

## 14 November 2026 · Verified GitHub branch retirement LIVE

- PR #185 merged at `a032f85a39964dff2ade6785331c399d2eccda1b`, Vercel READY `dpl_GhzjfNTsg2UYTumhPRwiPvSbwkJ3`. The main-push cleanup removes only merged, unchanged, uniquely reviewed branch refs with no open PR or archive/security protection. Verified GitHub branch count fell from 63 to 25 including main; the 25 remaining are catalogued rather than deleted blindly. No customer-facing or data-source activation changes.

## Unreleased · Ongoing verified GitHub merged-branch pruning

- Extend the existing strictly guarded merged-PR cleanup to automatically check eligible recent merged heads after each main push, not just a historical one-off PR window. Scope limited to exact frozen reviewed PR head/commit, currently present ref, unique branch association, not open/protected/security/original design. Documents path to zero **stale** branches while retaining unmerged feature and design work. Actual removals require runtime evidence.

## 14 November 2026 · Awin metadata inventory validation LIVE

- PR #183 production SHA `0727c0866ad15053955dc3b9fa6822a043122376`, Vercel `dpl_5z93DKd4sceJjCdMFDpyi5zzca5U` READY. Fail-closed validation of duplicate CSV headers, conflicting duplicate feed identities and nonnumeric product counts; harmless signed URL rotation is ignored without persisting URLs. Source remained paused and no merchant/import/publication rights changed. Private endpoint runtime response still awaits independent read-only test.

## Unreleased · Awin metadata feed inventory ambiguity protection

- Reject duplicate/empty CSV header names, missing or invalid product counts, and conflicting duplicate advertiser/feed identities. Continue allowing identical metadata entries with different credential-bearing URLs without storing or returning the links. Existing feed monitor fails closed before discovery writes on malformed inventories; no feed, import, cron, price or rights activation.

## 14 November 2026 · Marketing draft scheduler failure isolation LIVE

- PR #181 merged `a75964878b61b9ae175252e085646404dd8a5cb1`, Vercel production READY `dpl_2pc1X5UNfnSpQC9TnGSmFPf6sxJQ`. The daily editorial-only scheduling loop now isolates malformed/failed rules, validates brand/channel/owner/due/cadence before its claim and records bounded errors without overwriting newer schedules. Review-only drafts unchanged; social/AI and supplier imports remain gated.

## Unreleased · Editorial draft scheduler isolated rule failures

- Validate each due brand/channel/owner/cadence rule before its atomic claim, inside the per-rule error boundary. A corrupt rule or database claim failure no longer aborts all other due draft work; failures are recorded best-effort without overwriting another worker's newer schedule. Drafts remain private and review-only, and marketing publishing/AI remain disabled. No cron, database or affiliate changes.

## Category picker verified · 14 November 2026

PR #179 deployed `a71b9bcc25a2a65b53a2744b661dffc86c20c067` (Vercel `dpl_5vmb555PfgdUQYwE9HVSq9b8Hb3J`, READY on `www.avuqo.com`). GitHub Build, Lint and secret checks passed on `ea516cdaa4ebf2d7f86180dfcb6ca8b2adf0aa0e` and the Vercel preview succeeded. The desktop category directory now selects Books and follows its direct product link. At narrow width the picker selects Musical Instruments and opens its guide. Browser checks across the release sequence found no horizontal overflow on the 14 refreshed guides and 25 shelves at 1,348 and 449 CSS pixels. The Books shelf also passed at 337 CSS pixels. Populated public item acceptance remains pending verified external offers.

## [0.5.3] · Category directory navigation

- Keep the category directory footer below the independently scrolling department and topic panels on desktop.

## [0.5.2] · Department and item presentation

- Give all 25 product departments their own editorial photograph and update the 14 generated department guides with topic links and specific buying checks.
- Route product detail presentation and catalogue shelves through the same structured classification. Keep ambiguous items out of department shelves and use the verified catalogue on the Pets landing.

## 14 November 2026 · Private Awin retry recovery deployed

- Recover an interrupted empty import session and deduplicate concurrent starts for the same feed snapshot. Completed sessions still require a matching fingerprint and row count.

## 13 November 2026 · Marketing homepage claim integrity VERIFIED live

- PR #173 deployed app `1fcad1afd007544a2f4a2669b4d20c45d0226d19`, Vercel READY `dpl_22XM7ti5pdEDcgCnprCyfF7WMfYb` with public homepage status 200 on the same release. Withdrawn, wrong-brand, missing, invalid or expired marketing facts can no longer qualify custom homepage placements; owner-only resume rechecks evidence. No source/product/AI/social publishing/scheduler activation.

## Unreleased · Marketing homepage time-window and source-claim integrity

- Re-check each custom homepage campaign's private approved supporting claim during the server-rendered rotation; drop expired, revoked, wrong-brand or missing fact claims without exposing private fields.
- Require current fact evidence for both owner approval and resume, suppress stale dashboard actions and expose withheld state. No changes to global marketing switches, cron, external social publishing or Awin.

## 13 November 2026 · Product and My AVUQO design VERIFIED live

- PR #171 merged at `29454fd87952e66a1e02815ef26d3db46887ce5c` and deployed Vercel READY (`dpl_4vN5FNZght94Uje3YV5AX4wrV8dG`) with live homepage/products/account all HTTP 200. Refines eligible-offer comparison order, merchant image fallback and guest/signed-in account layouts. No source, approval, price, or automation activation change.

## Unreleased · Product comparison and My AVUQO

- Move verified retailer offers directly below the product overview and show an approved photo from an eligible offer when available.
- Give My AVUQO a clear sign-in path and a more compact overview. Keep preferences and planning tools together for signed-in visitors.

## 13 November 2026 · Seasonal artwork deployed

- Add original locally hosted Christmas, Easter, Valentine’s and Sales hero artwork and reuse it in the corresponding homepage themes. Refine the Christmas mobile hero and preserve gift planning tools.

## 13 November 2026 · Editorial hero refresh deployed

PR #167, production `50a3e9d3a1fdc2b7457683f2688667b6df0cb2a6`.

## Unreleased · Editorial hero refresh

- Add locally hosted editorial photographs for the Black Friday campaign and the Electronics, Home & Living and Beauty departments. Align seasonal headlines to the content grid and keep mobile copy legible below the photographs.

## Unreleased · Saved offer destinations

- Reopen eligible saved offers from Saved Items, Watches and shared lists through the live offer route. Historical demo slugs still resolve to their labelled examples.

## Unreleased · Mobile search and visual audit coverage

- Make global search visible at phone and tablet widths. Extend the public screenshot audit to search, Wishlist and Comparison Basket, and to 768px and 360px widths.
- Preserve historical Awin diagnostic evidence and the shared offer, Watches and SEO acceptance requirements from PRs #48 and #85.

## Unreleased · Campaign timing and Awin monitoring

- Fix anonymous homepage campaign ordering under the existing column grants, show scheduled/live/ended placements in the Control Centre, and link the UK seasonal calendar.
- Reject empty Awin inventories, require an explicit mode on manual import requests, and show full refresh counts, last-seen dates and stale-check status in the private monitor.

## Unreleased · Warm-premium storefront and mobile shortcuts

- Restore the faceted gradient AVUQO mark in the shared header and footer, move categories and shopping tools directly below the homepage hero, and add Saved and Lists to the mobile dock. The full-site tour remains linked from the homepage.

## Unreleased · Dormant private Tyres UK snapshot-job schema foundation

- Stage additive service-role-only, RLS-enabled `awin_tyres_spec_enrichment_jobs` journal with `blocked` default, explicitly provided feed ID, content-addressed source digest/path and no old-93988 auto approval.
- Add migration security contract tests and controlled live RLS/grant/empty-table verification checklist.
- No worker RPCs, cron, supplier snapshots, price mutations or publication; PR #117 stays open until further runtime safety acceptance.

## 13 November 2026 · Tyres UK owner-only read-only worker preflight deployed

- PR #155 merged and Vercel production READY app SHA `5954beb29fc849dc9368991fdce6ba2db5a3b063` at `www.avuqo.com`; quality/security tests passed.
- Added owner-only read-only `automation_preflight` with private job-table/bucket checks, readiness blockers and permanent `ready_to_enable:false` pending independent acceptance.
- Live DB confirms existing private bucket but absent V2 job table/RPCs; Awin remains paused/sync off. No migration, scheduled worker, provider feed download, historical price updates, source rights or public publication changed.
- Historical PR #117 remains open pending controlled migration, lease/retry, feed identity and storage-retention validation.

## Unreleased · Read-only Tyres UK automatic worker readiness preflight

- Add owner-only `automation_preflight` action to existing private tyre-spec API and Control Centre to show whether snapshot-job table and bucket are available, without invoking any worker, querying private feed URL or changing data.
- Direct Supabase audit confirms private snapshot bucket, missing job table/functions and paused sync-off Awin source; record blocking migration, feed proof, runtime/lease and retention tasks.
- Keep PR #117 worker intentionally unmerged/off, no automatic cron, migration, environment change, price/fitment/publication changes.

## 13 November 2026 · Tyres UK private candidate validator deployed

- PR #153 merged and Vercel production READY SHA `7c8619352d5458a1c1ce69c3dc5f4960a813a3d2`, domain `www.avuqo.com`.
- Strict source schema and description-matched technical candidate extraction, returning no price or publication approval; owner tyre Control Centre states automatic worker not enabled.
- Full old PR #117 migration/worker remains unmerged/disabled; Awin source paused, no cron added, existing Pneus schedule unchanged. No new public products or feed/photo rights.

## Unreleased · Private Tyres UK current-snapshot candidate validation

- Selectively port the safe, pure current-feed schema and description-cross-checked technical candidate logic from old PR #117 to current main; candidate output excludes prices and all fitment/publication approvals.
- Make the owner-only tyre Control Centre show automatic enrichment as **not enabled** and retain original exact-file manual recovery.
- Add tests for invalid/cross-advertiser rows, conflicting load/speed, wrong currencies, no returned price and absence of automatic cron.
- Do NOT port/enable old worker or migration until live Supabase job tables, storage leases and existing Pneus cron can be safely reconciled. Old PR #117 stays open.

## 13 November 2026 · Tooled-Up Awin joined-programme currency diagnostic deployed

- PR #151 merged; protected, read-only `/api/internal/awin-tooled-up-currency` with Awin source paused/joined guard and exact advertiser 496 `currencyCode`; Vercel READY `36b2840a159db2d274c38837dcdef9dc02333aac` on `www.avuqo.com`.
- Old PR #102 closed as superseded; historic 496:89987 feed ID not assumed current, and **no live Awin currency response has been observed**.
- All product, image and feed rights remain unverified and publication disabled; no DB writes, source changes or importer activation. Tests/secret scan passed.

## Unreleased · Tooled-Up Awin GBP programme currency verification

- Port old PR #102's protected, read-only joined-programme `currencyCode` inspection to current main without reactivating deleted historical Tooled-Up feed IDs.
- Return strictly programme-only GBP evidence; hard-code no feed activation, price confirmation, product staging, image rights, public offer publishing or database writes.
- Use 15s timeout, bounded provider response, fail-closed ambiguous/missing currency handling; test source gating, non-GBP outcomes and no-write invariants.
- Actual Awin API invocation with live credentials and current replacement-feed permission remain unverified.

## 13 November 2026 · Cadbury and Petlibro terms visible in production

- PR #149 merged, Vercel READY `b6b6a93f7da3837f02d004cade0ec1fee52715a8` on `www.avuqo.com`, old PR #51 closed as superseded.
- Private owner retailer Control Centre now explains documented sale/PPC/territory/commission restrictions and outlines evidence required before using Awin data or photographs.
- Preserve historical source-provenance and current permissions uncertainty. Rights gates unchanged, no merchant feeds activated or public images/offers released.

## Unreleased · Cadbury and Petlibro merchant terms visibility

- Preserve historical owner-supplied Awin Cadbury/Petlibro programme terms summary from stale PR #51 in current repo with explicit provenance limitation.
- Surface commercial restrictions and evidence checklist inside private Retailers Control Centre, including Cadbury sale-category exclusion and branded PPC, Petlibro GB delivery exclusions, PPC/CSS and disputed rates.
- Add source-rights and private-owner-view regression tests. **No image/feed republication approval, source activation, imports or public offer release.**

## 13 November 2026 · Awin numbered private CSV importing deployed

- PR #147 merged with Vercel READY app SHA `ba25af858c203df11713c4496276b2d38d4caa22` on `www.avuqo.com`. Historical PR #58 closed as superseded.
- Handle Chrome/Windows duplicate-numbered Craft Buddy Google-format Awin CSV names for parser selection without guessing advertiser identity from filename.
- Show distinct errors for invalid `.csv`/`.csv.gz` extension, upload over 8 MB, empty file.
- Retain owner/admin and verified joined-advertiser selection, row-by-row merchant identity, private-only import and unverified publication status; no feed imported or products published.

## Unreleased · Awin numbered CSV owner-upload safety and clarity

- Support Chrome/Windows ` (1)`, ` (2)`, ` (10)` duplicate suffixes for correctly selecting the Craft Buddy Google-format Awin parser; general extension acceptance already covered numbered Cadbury/Petlibro filenames.
- Return precise file-extension, 8MB-size and empty-upload errors rather than one misleading combined error.
- Retain newer owner-selected joined advertiser, private staging and row-by-row identity checks; never infer merchant rights from filename. Reconcile conflicting historical PR #58 rather than merging it wholesale.
- Add tests for malicious filename variations, exact format selection, private merchant validation and error messages.

## Unreleased · Awin HTTP provider error redaction
- Replace raw failed Awin provider response snippets/status text in thrown feed connector errors with numeric HTTP status only, carrying forward security intent from old PR #50.
- Add CI regression test; leave credentials, importer, publication, image rights and feed status untouched.
## 13 November 2026 · 119 historical branches safely removed
- Verified PR #143 deleted 16 merged PR #127–142 branch refs.
- Verified PR #144 deleted 103 older branches after exact frozen merged-PR last-commit and head SHA comparisons. Count now 26 including main and 2 cleanup branches, down from 143 before task (plus task-created branches).
- Preserved all 11 open PRs, original AVUQO design assets, security references and unmatched code. Final cleanup PR #145 will prune merged housekeeping branch heads if unchanged; verify final count.

## 13 November 2026 · First merged branch cleanup completed, second staged
- PR #143 merged; GitHub verified 16 safe merged PR #127–142 branch heads deleted. 144 branches including cleanup branch fell to 128; open PR heads and original warm-premium sources retained.
- Add narrowly validated historical PR #1–126 cleanup workflow with frozen final PR commit verification, no-open-PR, no branch reuse and protected/reference branch exclusions. Candidate must pass tests and confirm deletion before claiming its outcome.

## Unreleased · GitHub safe merged-branch clean-up
- Inventory all 143 pre-task GitHub branches and map 11 open PR branch heads to protected/unresolved work.
- Add guarded GitHub Actions cleanup of 16 recent merged PR #127–142 branches only if branch HEAD SHA exactly matches frozen merged PR, no other open PR uses it and branch is not protected; provide manual dry-run mode and GitHub summary.
- Preserve original visual reference and source branches plus all unreviewed Awin, eBay and tyre safety changes. Deletion status requires subsequent verification.

## Unreleased · Remove generic homepage flash before correct seasonal page
- Replace old `HeroPlaceholder` in streamed Suspense fallback with neutral accessible responsive loading shell; correct UK date-specific hero remains determined by `editorialSpotlight(new Date())` per request.
- Add regression test guarding against ever displaying the obsolete living-room hero as a loading state.


## 13 November 2026 · Screenshot-driven homepage fix deployed
- PR #140 deployed READY as app commit `e310af5a6ac49b00a01f7742c8d6a3664ebb5cf5` to `www.avuqo.com`.
- Replaced nonexistent department sprite URL with editorial photo tiles, simplified to one automatic seasonal hero, corrected hero scale/alignment, removed owner private CTA from homepage while preserving role-gated navigation.
- Live HTTP markup reconfirmed; post-deploy image render/mobile browser signoff remains pending. No Awin/eBay/tyre source permissions changed.


## Unreleased · Homepage screenshot corrections
- Correct blank department image tiles caused by an absent sprite asset: use editorial category photography rather than licensed merchant products.
- Remove duplicate seasonal homepage banner while keeping the automatic UK-date Black Friday/Christmas/Easter main hero.
- Adjust hero headline scale, content alignment and responsive layout; keep existing evidence-first panel and CTAs.
- Remove private storefront CTA from the public homepage composition; owner-only navigation/control-centre access remains.

## 13 November 2026 · Production screenshot QA mechanism deployed
- PR #138 merged with production READY commit `08459b492fa8c9497b94cee933d9fa08dec0f01c`, alias `www.avuqo.com`.
- Public desktop/mobile screenshot audit for 28 production routes enabled via GitHub Actions; no customer code, data or permissions modified.
- Actual screenshot report/artifact review and human visual acceptance still pending; investigate the workflow run before marking visual design complete.


## Unreleased · Automated public production screenshot audit
- Add read-only headless Chrome checks and desktop/mobile screenshots for 28 real public production routes, rather than relying on HTTP-only verification.
- Add a GitHub Actions on-demand/weekly workflow, triggered on first merge, with downloadable screenshots and Markdown/JSON evidence report; measure horizontal overflow, missing H1, broken HTML images and page errors.
- Keep Control Centre, private previews and signed-in personal data out of screenshot automation. Original design boards remain reference-only; no fake product evidence added.
## 13 November 2026 · Automatic seasonal homepage deployed
- PR #136 merged: UK-year-round editorial calendar selects real homepage photographic hero, copy and CTA at the correct UK date per request, plus companion seasonal editorial module.
- Christmas, Black Friday, Easter, Valentine's, Mothering Sunday, Father's Day, Halloween, back to school, spring/summer/autumn and winter sales; dynamic yearly date calculations and DST regression tests.
- Owner-only `/control-centre/seasonal-calendar` shows current and future year dates, read-only with existing access gate.
- Application deployment `da22e97c6fdad31d23e6c972e0a39239e689d8fb` READY on `www.avuqo.com`, November Black Friday hero independently verified. 28 public URLs HTTP 200/shared branding. Full browser screenshot QA remains pending; no live retail promotions/image licences inferred.


## Unreleased · Automatic UK homepage seasonal calendar
- Extend seasonal editorial schedule into a year-round Europe/London calendar including Christmas, Black Friday, Valentine's, Easter, Mother's Day, Father's Day, Halloween, school season, spring, summer and autumn.
- Change real `/` homepage photo, headline and primary CTA to current UK theme on request. Keep existing sponsored placements and verified product admission separate.
- Add `/control-centre/seasonal-calendar` owner-only current/next-year read-only calendar, linked from Control Centre.
- Remove hard-coded 2026 Black Friday editorial copy; introduce DST, Easter and multi-year regression tests.
- Audit 28 customer routes through authenticated production HTTP fetch (status 200; visual screenshot acceptance not implied).
## 13 November 2026 · Sitewide warm-premium design verified on production
- PR #134 merged; Vercel application release `45da7456b66f6fa21d25753c39e497203f26c7ed` READY on `www.avuqo.com`, deployment `dpl_9fAgyrGS1Nz2Fh8Q7nyFjmVpEvG5`.
- Shared branded A-lockup and tagline, navigation/mobile/footer, category, public product index/detail, seasonal and travel/lifestyle presentation updated on real routes. Existing public offer and image-rights checks remain unchanged.
- Owner reference screenshot acceptance remains a distinct uncompleted check; no Awin/eBay/tyre live-price/source publication is asserted. The final exact Vercel SHA may change when this handover-only record deploys.


## Unreleased · Live website visual completion pass
- Complete warm-premium AVUQO shared header, mobile navigation and footer brand lockup without altering auth, search or Control Centre access.
- Bring real category, product index/detail, seasonal and travel/lifestyle page presentation into consistent premium responsive styling.
- In `/products`, show only independently approved `published.image_url` from the verified-source product index and retain a neutral placeholder for all other products.
- Register pixel-fidelity/manual desktop/mobile QA as a separate acceptance gate. No private Awin/eBay/tyre offers or photographs become public via this style change.

## 13 November 2026 · Verified live code and restart handover
- Reconciled PRs #129–#132 as merged; latest live Vercel READY deployment at `ab055f73acce9a478075c61aecb0b7b248d101d3` on `www.avuqo.com` (as-of observation, must be refreshed on every new release).
- Added canonical root `AVUQO_START_HERE.md`, readable `docs/AVUQO_LIVE_HANDOVER.md` and structured `docs/AVUQO_CURRENT_STATE.json` so new connected chats can read the real GitHub project state without relying on conversation text.
- Added mandatory check of current GitHub/Vercel/Supabase, open PRs and live-vs-private gates to contributor/assistant instructions.

## Unreleased · Restore photographic homepage hero in production
- Reconstruct original full-bleed photo-led warm premium storefront with readable overlay, hero Compare/Sales CTAs and evidence-first shopping panel on actual homepage.
- Keep current approved product, navigation and editorial source controls. Add responsive and no-fabricated-score CI test.

## Unreleased · Restore full original premium storefront to live homepage
- Recover `StorefrontQuickLinks` and `HomeShoppingDashboard` with responsive original CSS from `feature/warm-premium-experience-v1-20261105` and render on public homepage, not a preview.
- Keep existing new sections, verified-only product index and honest editorial fallback when retailer offers are not approved.
- Record precise mockup PNG source branch and release safety checklist; add CI regression tests.

## Unreleased · LIVE production shopping journeys and partner roadmap
- Add a photo-led Compare and Discover bargains section directly to the real public homepage, linking to existing real production destinations. No fictional offers or score data.
- Record versioned provider leads and API/access conditions for UK supplier/dropshipping platforms, holiday and activity search, golf trips, travel insurance and regulated UK comparison.
- Locate the original warm-premium mockup reference paths in Git and define production, mobile, image-rights and data-integrity acceptance gates. Add CI regression coverage.

## Unreleased · Awin inventory and image evidence
- Extend owner-only retailer onboarding with stored private image URL coverage, without loading or publishing retailer photos.
- Reconcile Awin feed export and newly observed PlayPress Toys UK programme and feed IDs without committing private download URLs.
- Document AVUQO's single-catalogue Compare + Bargain Discovery strategy and rights-first launch sequence. Existing `/preview/products` remains the production-hosted owner view for layout testing.
# AVUQO software changelog

## [0.5.1] - 2026-11-13 (verified production, eBay Sandbox and Awin retailer onboarding)

- Fixed the pre-existing owner-only eBay UK Browse pilot to use environment-specific Sandbox App ID/Cert ID instead of always calling Production endpoints. Default remains Sandbox, with real UK production Browse gated behind a separate keyset and explicitly recorded restricted API approval.
- Added owner-only `/control-centre/retailers`: real Awin joined-programme observations, private imported rows, feed freshness and independent permission flags, plus eBay private preview setup and keyset/partner approval guidance.
- Preserved original eBay seller/private-product review, hidden image choice, no automatic eBay imports, no public eBay checkout, no source activation, and unchanged canonical source/offer publication gating.
- Added regression tests for keyset isolation, limited production permissions, safe eBay affiliate URL detection and admin-only read-only retailer onboarding.
- Onboarding reference: `docs/AVUQO_V051_AWIN_EBAY_ONBOARDING.md`; Vercel credentials required from owner before real Sandbox API testing. No secret or production feed permission granted by this code change.
- **Production verified:** PR #127 merged as `f8c0eb92`, Vercel `dpl_DaokykruBiQBXm7E3SYqF1L2dXfu` READY, release route smoke tests and private page safeguards verified. eBay OAuth cannot be exercised until owner creates and installs Sandbox keys.
- Source audit: 16 historically joined Awin programmes with advertiser-level `feed_permission_confirmed=false`, 122,309 existing private feed rows, and no eBay credential env vars. Old Tooled-Up feeds replaced by `awinnew`, and mytyres.co.uk application rejected. New live goods are therefore **not** represented as imported or approved.


**Production verified 13 November 2026:** PR #125, SHA `4b9231f173db8d3d42cc150cc0d16e0c96092259`, Vercel `dpl_tCLBPtevXFWNGHr65sZo8kvSVNrN` READY, all live smoke routes HTTP 200, both owner dashboards gated while signed out. Real licensed supplier goods and social/advertiser publication remain disabled pending external approvals.

## [0.5.0] - 2026-11-10 (marketing, tyre and all-category product readiness release candidate)

- Complete 25 distinctive warm-premium category-specific product shopfronts at `/categories/[department]/products`, opening safely without fake offers and automatically admitting real approved products through the unchanged public supplier-rights/freshness gate. Link them from Marketplace Shop and the main /products directory.
- Add departmental buying-guidance panels to existing canonical individual product pages, with exact source-category assignment and truthful instructions for 25 product families.
- Complete the plum tyre customer system with `/tyres/find` exact size/manufacturer finder, `/tyres/compare` two-model comparator, `/tyres/products/[slug]` exact product page and 1/2/4 tyre unit-price subtotals with no fabricated fitter/fitment quote. Integrate these destinations into the existing showroom, brand, type and size guides.
- Add protected read-only `/control-centre/tyres` for source, private import, technical verification, product admission and retailer-release review.
- Reuse four-brand marketing studio, AI-reviewed creative, draft automation, owner approvals and Buffer delivery gates; create `/control-centre/marketing/readiness` for explicit live per-brand facts, channels, emergency stop, provider reconciliation and Pinterest/email integration gaps. No new social account connection or unattended publication.
- Add `/advertise` premium enquiry/integrity guide with no rate card, payment or delivery implication; connect to existing private site-advertising owner workflow.
- Add new source/variant/independence safety tests, preserve original v0.4.1 warm-premium design and the permanent GitHub Compass, and document remaining source/rights/provider dependencies in `docs/AVUQO_V050_MARKETING_TYRES_ALL_CATEGORY_RELEASE.md`.
- **Safety:** no migrations, database writes, commercial source activation, fake product prices/scores/reviews, ad serving, automatic email, Pinterest/social publishing or vehicle-fitment approvals. CI/preview/production validation still required before claiming a live release.


## [0.4.1] - 2026-11-10 (production verified; manual signed-in visual acceptance pending)

- Bring original approved Warm Premium AVUQO design identity, page blueprints, full token file, image register and screenshot manifest from its unmerged design branch into the current source of truth. Index all ten new user screenshots and other uploaded design/source files.
- Create permanent root `AGENTS.md` guidance, `docs/AVUQO_PROJECT_COMPASS.md` and README start-here links so future GitHub-connected chats can inspect context and branch/release state before coding.
- Restore a full photographic seasonal editorial system and missing Easter/Valentine's pages, retain current Christmas gift-finder plus privately approved Crafts products, and reintroduce festive discovery/planning panels.
- Add automated UK-calendar seasonal homepage inspiration (Black Friday, Christmas, Valentine's, Easter and January sales). This updates only editorial stories and links, **never public product offers or advertising**.
- Add warm user-first My AVUQO account overview with real signed-in Saved/Watches/Lists counts, never fictional screenshot numbers. Preserve existing preferences update functionality.
- Restore original warm-premium Saved, Watches and Lists layouts using existing RLS-scoped account records. Show saved prices as historic snapshots; Watches do not promise unverified automated email or price-drop alerts.
- Add owner seasonal status and read-only Design System reference page, both in the existing Control Centre, with links to current site-advertising, marketing, source and approval workspaces.
- Add GitHub CI regression tests and sitemap/footer links; no new migrations, source activation, retailer-image rights, ads, social post scheduling, pricing claims or account surveillance.
- **Verified production:** GitHub PR #123 merged at `36c8a6f4`, Vercel `dpl_29DGCrLWzMAbT7FRimMBLWFx4U9k` READY and aliased to www.avuqo.com; public route HTTP checks successful and signed-out admin access-guard verified. **Still open:** authenticated owner-browser and physical mobile/desktop visual QA and full screenshot-to-implementation parity.


## [0.4.0] - 2026-11-09 (unified marketplace + Source Atlas release candidate)

- Unify public AVUQO Explore, Shop, Compare and Who's Who journeys across the homepage, all 25 editorial category families, existing specialist category pages and mobile navigation.
- Build premium Marketplace homepage, Who's Who business discovery with approved-public-offer gate, sector-specific comparison hub and missing editorial category detail routes.
- Add owner-only read-only Marketplace Operations and Source Atlas dashboards covering 25 taxonomy roots, all source connectors, supplier private imports, catalogue/evidence states, grocery and travel records, system controls and content publication state.
- Preserve source-rights, private-feed and live offer verification gates, existing Control Centre management actions, legal rules and pricing independence. No data migrations or new feed activation.
- See docs/AVUQO_UNIFIED_MARKETPLACE_SOURCE_ATLAS_V0_4_0.md for complete 9 November source audit, acceptance checklist and unimplemented dependencies.


- **Unreleased draft: Pneus Online UK second-tyre private importer (9 Nov 2026):** Secret-authenticated, daily rights-gated Awin feed snapshot worker and owner phone-facing status page, reusing private storage and resumable 250-row checkpoints; CI source-gate and merchant-identity tests. Disabled by default and blocked by missing actual feed permission evidence. No Awin products or offers imported, no publication rights granted.


- **Unreleased draft: AVUQO Tyres V1 comparison contract (9 Nov 2026):** Freeze premium tyre design palette and page rules, document safe second tyre supplier (Tyres Pneus Online UK) private-first onboarding, exact variant identity, provenance, marketplace deduplication, and full-cost delivery/fitting comparisons. Add pure TypeScript admission helpers and negative evidence tests only; no feed imports, public prices or activation.



## [0.3.1] - 2026-11-09 (production deployment READY; manual mobile acceptance pending)

- Launch an editorial premium AVUQO Tyres showroom using original first-party vector artwork, refined plum/coral branding, responsive design and accessible native tyre size controls.
- Add an educational tyre size journey, noindex manufacturer directory and tyre-type buying guides. The size tool explains dimensions; it does not claim vehicle-fitment or live tyre prices.
- Build an owner-only real-feed tyre showroom with full private manufacturer and size search, tyre-specific product evidence and image opt-in; protect all staged supplier records behind the existing owner/admin gate.
- Extend only the existing verified-offer product pipeline with a tyre-specific template. Safety-critical technical specifications are hidden unless an explicit canonical verification flag is present.
- Keep all historical supplier tyre offers, images, rights decisions, prices, registration lookup and fitment approval private or deferred. No supplier source activated, no database migration, and no automatic feed import enabled.
- Include responsive, public/private isolation and technical-candidate regression tests. GitHub CI and Vercel preview passed. Production deployment `dpl_Dank3dPU1mk8kudb83BAq3wpAb9R` on main merge `b15a0209` is READY and aliased to www.avuqo.com. Manual signed-in/mobile acceptance is still pending.

## Unreleased


- **Approved-product tyre template (draft):** Public canonical `/products/[slug]` chooses a tyre-specific buying experience only for a product classified in a verified tyre category; specification fields remain hidden unless an explicit `tyre_specs_verified` flag is recorded. No staged tyre data becomes a public offer.

- **Draft tyre showroom and manufacturer/category pages (9 Nov):** Create responsible public tyre buying hub plus noindex manufacturer/tyre-type guides; build owner-only exact-size and full brand browse, tyre-specific product panels, historical price labels and private images behind opt-in. No public feed products, fitment, fresh offers or merchant permissions activated.


- **Unreleased Awin feed discovery matrix:** Owner feed inventory displays all 16 joined programmes, format-group counts and zero-feed programmes, plus a filtered credential-free metadata CSV copy. Does not download feeds or merge overlapping records.

- **Awin import hardening:** Add before-upload feed dialect and row-inspection diagnostics, align TSV server acceptance, live joined-programme revalidation on resume, strong source feed-ID binding at DB layer, and service/contract feed quarantine. Existing physical Awin private imports unaffected. No public or automatic activation.

- **Unreleased general Awin resumable importer:** Owner-only cross-merchant CSV/TSV gzip streaming and safe Awin / Google-retail format detection; 250-row atomic receipts, SHA256 resume matching, row advertiser and tracking checks, source attributes retained in private review. Deliberately rejects unsupported file dialects. No public release or automatic feed download.

- **Unreleased all-joined Awin programme register:** Owner-only dashboard of all 16 accepted advertisers, recent private imports, safely redacted metadata feed listings and known large catalogue references. Distinguishes no recorded feed from no available feed; explicitly flags full-range tyre and mobile imports as requiring a general large-file importer. No public activation.

- **Unreleased live shopping layout review:** Compact homepage/category shopping cards now genuinely compact on narrow browsers, full Shopping page adds editorial Technology and Motoring departments; owner Control Centre presents verified next Awin feed IDs, product counts and safe private import instructions, with large feeds flagged separately. No product-rights/publication changes.

- **Unreleased eBay private UK pilot:** Owner-only OAuth Browse UK search in existing AVUQO responsive shopping design; real seller, brand, condition, shipping and GBP observations, manual image opt-in and zero public checkout. Source keys remain server-only, no import enabled. Private product pages show import date and clearer identity/stock provenance.

- **Unreleased live-site shopping integration:** Responsive AVUQO-style editorial shopping departments on homepage, Shopping and Categories. Existing public destinations only, with role-verified owner links into imported-product previews. Private staging look aligned to existing warm lifestyle design; no merchant product publication or rights changes.

- **Unreleased private responsive storefront:** Owner-only homepage and navigation entry, real staged departments across four Awin retailers, category-specific source-backed product pages, and refined responsive layouts. No public product, image-rights or live-price activation.

- **Unreleased Awin feed metadata checker:** Daily cron is disabled by default, uses only server-side credential and bearer auth, and records changes to joined feed IDs without downloading products or enabling offers.

- **Unreleased private Tooled-Up catalogue:** Full 84k product brand/department/search/pagination with private opt-in images and RLS-invoker PostgreSQL discovery functions.

- **Unreleased Tooled-Up private image preview:** Add `www.tooled-up.com` to exact HTTPS owner-only opt-in image hosts and lift the 100-page cap on private merchant pagination. No public image rights or live price claims.

- **Unreleased private large-feed importer:** Resumable owner-only Tooled-Up 84k-product CSV.GZ staging with streamed decompression, 250-record atomic chunks, immutable file fingerprint, explicit retailer brand/manufacturer-source distinction and model/GTIN/EAN/MPN metadata. No automatic Awin fetch, public offers or images, and no guessed manufacturer legal identity. Requires accompanying SQL migration.

- **Unreleased private category product pages:** Premium owner-only individual product detail pages with category-tailored attributes and review prompts; no public affiliate URLs, image licence assumptions, or live price claims.

- **Unreleased safe feed catalogue:** Owner/admin-only in-memory Awin feed-list CSV audit with joined advertiser filtering, credential URL redaction and strict Tooled-Up `awinnew` filename validation helper. No live connector activation or public product changes.

- **Unreleased private Awin importer expansion:** Add exact advertiser selector for 16 owner-observed joined Awin programmes and verify live source-registry joined status and every feed row advertiser ID before storing as private unverified review. No extra programme approvals, automatic fetching, fresh-price attestation, published offers or image rights. Record official Awin feed-list and second-source eBay Browse API integration research.

- **Unreleased owner image/category review:** opt-in owner-only loading of existing allowlisted HTTPS feed image URLs, and provisional department suggestions recorded in metadata during new private file imports, with missing classifications flagged for review. Original merchant categories are preserved; no canonical category approval, public product imagery, Awin activation or automatic feed sync is granted. All 16 joined advertisers remain paused.

- **Unreleased owner catalogue browsing:** 48-item pages for private staged review candidates by retailer, plus accurately labelled Tyres UK and Tyres Pneus Online UK feed-pending notice. No public release, image publication, or live tyre import. Existing v0.3.0 unchanged.

- **Unreleased premium storefront preview:** Owner-only design candidate adds provisional departments, text search, merchant/category filters, price/name sorting and local side-by-side comparison to staged samples using premium AVUQO styling. Historical prices are never described as live, merchant images remain hidden, and no customer links, publishing rights, feed jobs or canonical category IDs are introduced. Software version remains `0.3.0` until separately released.

- PR #52 proposes an owner-only `/preview/products` page that displays already-staged private feed records using the existing public catalogue styling and site Header/Footer. Merchant imagery stays hidden, historical prices are labelled, customer links remain disabled, and no Awin source, offer, permission or scheduled fetch is activated. This is a **preview candidate**, not a deployed catalogue release.

## [0.3.0] - Awin advertiser onboarding and manual release (database acceptance pending)
- PR #45 corrects the SQL PL/pgSQL terminator in the unapplied owner-release migration; migration must pass final review and production checks before applying. No provider approvals or offers were activated by this correction.
- Owner-only Control Centre workflow: advertiser ID registration, private draft, evidence/expiry attestation, restricted read-only Awin feed test, explicit source activation and pilot import, price-evidence review and one-offer publication/pausing.
- Awin pipeline now **always holds** externally ingested offers for individual owner approval and rejects mixed programme IDs. No auto-publish on source flags.
- Public Awin admission requires private per-offer approval, exact advertiser, unchanged reviewed GBP price, offer timestamp, independent AVUQO Score and a safe affiliate link, even when `published_deals` says published.
- Add private RLS-enabled `awin_offer_release_reviews` and `awin_release_audit` plus service-role-only transactional release function. No advertisers created or offers published by the migration.
- CI regression tests and owner acceptance checklist in [Awin advertiser runbook](docs/AWIN_ADVERTISER_ONBOARDING_RELEASE.md). **Still requires** CI success, Vercel READY, migration, real Awin publisher/advertiser rights and licensed live acceptance. Historic 4,588 staged rows remain private.


## [0.2.3] - P0-03 release candidate (not deployed)
- Replace browser-supplied wishlist/basket merchant, price, title and timestamps with authenticated server capture from current, rights-verified product/offer records.
- Make one private basket and wishlist per account, deduplicate items at database level, and deny browser-side inserts/updates into personal planning lists using restrictive RLS.
- Copy named baskets from the authenticated user's server-stored records, with complete-copy rollback on errors. Preserve ordinary collaborative lists and the separate Saved/Watches areas.
- Strengthen historical snapshot validation, internal-only links, email text sanitization, and the 18-item email-draft overflow explanation. No automated email or merchant checkout.
- Add P0-03 negative regression tests and two-account acceptance runbook. **Outstanding:** CI, production SHA, reviewed migration, actual signed-in cross-account/mobile/browser tests and licensed product fixtures.


## Unreleased documentation / audit addendum (2 November 2026)
- Indexed nine original owner-provided source files using SHA-256, without publishing the confidential source documents or concept art to the GitHub repository.
- Traced 12 granular requirements not obvious from broad feature rows, particularly real natural-language search, explainable Preference Graph, scheduled seasonal campaigns, and PWA/push/native differences.
- Updated roadmap with P1-07, P2-06, P3-06, P4-05, and snapshot-integrity acceptance in P0-03. Read-only database checks reconfirmed baseline; no schema, product, feed or app code changed.
- **Documentation only:** software version remains v0.2.0.

## Original source-to-code audit (2 November 2026)
- Reviewed original master product and grocery PDFs, affiliate, content/Control Centre, analytics, unified source-of-truth and catalogue handovers and brand visual reference against current main, Vercel and read-only Supabase.
- Added `docs/SOURCE_TO_CODE_AUDIT_2026-11-02.md` with source provenance, 25 workstream maturity assessments and data/rights caveats.
- Added `docs/ROADMAP.md` with prioritised P0–P4 work, explicit acceptance gates and preservation of PR #21/#25 dependencies.
- Updated the living status, README and coding-agent entry point. **Documentation only: software remains v0.2.0; no migration, feed, credential or publication state changed.**

## [0.2.1] - 2026-11-02 (PR #38 deployed; database event-write restriction verified)
- Prevent direct client writes to `analytics_events` and `click_events` by withdrawing `anon`/`authenticated` grants and permissive INSERT policies in the reviewed migration.
- Preserve verified outbound merchant redirects but pause recording new clicks until a purpose-specific consent-reviewed server intake exists.
- Add negative regression tests and owner runbook; retain historical records and keep commission separate from clicks.
- CI (lint, build, tests, secret scanning) passed; Vercel production READY at `f81b34f99bf5f95e59aa18efa877ce0292996d7c`. Supabase migration `20261102162756_p0_01_event_write_integrity` applied successfully; effective anon/auth INSERT grants false, old INSERT policies absent, service role maintained. Historical seven clicks remain.
- **Still requires:** direct REST negative test with real anon/auth roles and real authorised merchant-redirect smoke test; visitor analytics is still OFF.

## [0.2.2] - 2026-11-02 (P0-02 source-safety release, deployed)
- Require current source usage, feed, GB territory and source-specific Awin advertiser approval evidence before external ingestion; recheck permissions and emergency controls during the run.
- Fail closed on missing or failed global control reads; require current controls and rights for any eligible public offer, including already-published rows.
- Show reasons for denied Awin runs and blocked source resumes in private Control Centre.
- Include conditional data migration to pause the unapproved Awin registry row while preserving all 4,588 private staged records.
- Add fail-closed rights, advertiser expiry, controls and integrity regression tests.
- CI build, lint, regression tests and secret scanning passed. PR #40 merged at `f7dc24ccf0e3b3101570419d43b7d9b647707361`; Vercel production READY. Supabase migration `20261102170256_p0_02_pause_unapproved_awin` applied: Awin now paused/sync off with 4,588 staged rows intact, five unverified import runs and zero public Awin offers.
- **Still awaiting:** actual advertiser/feed/image permission evidence and real negative/positive provider/owner acceptance checks; no Awin integration activated.

Versions below refer to the Next.js application in `package.json`, not historical v0.8 planning documents. GitHub tags and production SHA are the definitive release record.

## [0.2.0] - 2026-11-02 (main, deployment READY; signed-in customer acceptance pending)
- Merged through PR #34 at commit `79064ac4f24a73459c0506c4a18a4eeb9c07b2b4`, deployed to Vercel production with READY status.\n- Establish a living, versioned feature register and a mandatory check that future change PRs update the changelog/status.
- Add personal wishlist and a single grouped planning basket for approved affiliate offers, using existing private Supabase list tables.
- Allow the customer to save a basket into a named private list, copy the summary and launch an email draft in their own email application.
- Explicitly keep checkout with retailers and label saved prices as captured snapshots. No automated email service or source feeds activated.

## [0.1.0] - Existing baseline (through 2026-11-01)
- Version previously recorded in the application's package metadata.
- Main already includes private Awin staged imports, a Control Centre, eight-network affiliate-readiness planning (PR #33), and promotion approval improvements (PR #20).
- Production baseline verified at `17a73a6fc20ecad2c892d45f2e2c95b82a6087ef`. Earlier project documentation may call the product v0.8; that is a separate historical planning label.


### 2026-11-13 — Whole-site public AVUQO tour (candidate)
- Added a customer-facing `/explore-avuqo` tour linked directly from the homepage, pointing to existing shopping, comparisons, deals, groceries, motoring, travel and My AVUQO routes.
- Included in sitemap and quality regression tests; no external offer/source rights, private owner data or automation changed. Production release pending checks.


### 2026-11-13 — Whole-site public AVUQO tour verified live
- PR #159 merged, code `58355149ef69e82924a00c6866b0859a7483234a`, Vercel production READY `dpl_GVkTsnRpkWTc2p79DwUXD4EvhUEX` with `www.avuqo.com` alias. Public tour, homepage entry and sitemap HTTP 200 verified. No source activation or publication changes. Desktop/mobile screenshot sign-off pending.
