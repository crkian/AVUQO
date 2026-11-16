# AVUQO eBay: complete offer-dependency containment and migration-history reconciliation

**16 November 2026. Candidate implementation, not a production database migration. No Docker. No additional spend.**

## Significant live production findings

Read-only PostgreSQL catalog inspection found **13 validated direct foreign keys referencing `public.offers.id`**:

| Dependency | Actual ON DELETE | Privacy handling |
| --- | --- | --- |
| `analytics_events.offer_id` | SET NULL | Existing separate account-history orphan guard |
| `attribution_events.offer_id` | SET NULL | Existing separate account-history orphan guard |
| `user_feedback.offer_id` | SET NULL | Existing separate account-history orphan guard |
| `watch_events.offer_id` | SET NULL | Existing separate account-history orphan guard |
| `availability.offer_id` | CASCADE | **NEW** conservative dependent-record guard |
| `awin_offer_release_reviews.offer_id` | CASCADE | **NEW** conservative release-evidence guard |
| `awin_release_audit.offer_id` | CASCADE | **NEW** conservative audit-evidence guard |
| `click_events.offer_id` | CASCADE | **NEW** conservative click-history guard |
| `deal_scores.offer_id` | CASCADE | **NEW** conservative deal-data guard |
| `promotion_candidates.offer_id` | CASCADE | **NEW** conservative editorial-data guard |
| `published_deals.offer_id` | CASCADE | **NEW** conservative published-deal guard |
| `ebay_account_item_links.offer_id` | CASCADE | Existing intentional exact eBay ownership purge |
| `price_history.offer_id` | CASCADE | Existing explicit source-scoped price-history purge |

The prior eBay privacy guards focused on the four **SET NULL** relationships. Even when they passed, a mapped eBay offer deletion could still cascade into seven other, potentially independently retained records. This is particularly sensitive for visitor click events and Awin release/audit evidence. The existence of an FK does **not** prove the related data is owned by the eBay seller or should be erased. AVUQO does not fulfil orders or supply goods; Awin is independent.

## Implemented staged safety control

`supabase/migrations/20261116230000_ebay_unreviewed_offer_cascade_guard.sql` adds `public.ebay_guard_unreviewed_cascading_offer_records()` and `ebay_offer_02_unreviewed_cascade_gate`. For an **eBay-source offer only**, the trigger checks:

1. All seven enumerated cascading foreign keys still use the exact `offer_id → offers.id` column pair, `ON DELETE CASCADE`, and are validated.
2. **Exactly 13 direct FKs** reference `offers.id`. A newly introduced 14th FK is unknown until reviewed, so the deletion must fail closed.
3. No records in those seven secondary tables currently reference the offer being deleted. Otherwise, raise an exception rather than allowing an automatic cascade.

The original DBA-only mapped purge, audit and work claim execute in a transaction. A rejected delete rolls back all of them, preserving source-matched eBay data, linked shopper history, any Awin release evidence and the work item attempt. A valid mapped offer without these seven links may still be partially erased, ending **only** in `awaiting_evidence`, not a completed receipt. The other pre-existing four-table SET NULL safeguards are unchanged.

The guard does **not** delete any secondary data, decide retention law, approve eBay registration, enable a worker, reconfigure a webhook or grant an application role permission. It must not be installed without full-schema compatibility and legal/operations review.

### Real PostgreSQL, synthetic-data acceptance

The existing free GitHub native PostgreSQL job applies **all 13 candidate privacy migrations in chronological order** to a new isolated local Unix-socket database, plus synthetic fixtures matching the 13 observed direct relationships. The original source-scoped audited purge is executed against a fixture with one record in **each of the seven** guarded cascading tables, independently. Each test requires rejection, unchanged related rows, no audit, no consumed work attempt, pending receipt and full rollback. Tests separately add a 14th unknown FK, remove an existing cascade FK, verify that unrelated non-eBay retailer deletion still works, and prove a clean partial eBay purge ends awaiting evidence. The local only read-only cascade preflight requires all seven FK shapes, exactly 13 total links and the new trigger enabled.

**These are original production SQL functions running on a minimal synthetic schema, not a full production clone.**

## Critical migration-history collision discovered

Live `supabase_migrations.schema_migrations` inspection confirmed **four foundations are already recorded in production under different timestamps from their candidate repository filenames**:

| Candidate file timestamp | Existing production equivalent version | Name |
| --- | --- | --- |
| `20261116132000` | `20261116131949` | `ebay_account_scoped_erasure_foundation_20261116` |
| `20261116153000` | `20261116140013` | `ebay_deletion_receipt_integrity_lock_20261116` |
| `20261116155500` | `20261116141927` | `ebay_audited_partial_erasure_20261116` |
| `20261116165000` | `20261116160011` | `ebay_atomic_tombstone_admission_20261116` |

Nine later candidate migrations, including the new cascade guard, are **not recorded as applied**. Re-running all thirteen original SQL files on production risks duplicate-object errors or unintended changes. **Do not blindly apply the synthetic replay bundle to production.** Version equivalence by *name alone* is not proof that function bodies or grants are identical; actual installed definitions and migration history must be reviewed before developing a reconciled, additive-only production rollout.

`scripts/ebay-migration-history-readonly-preflight.sql` enumerates all 13 candidate timestamps and compares exact recorded versions with known production equivalent names. Its production read-only result on 16 November 2026 was **4 `EXISTING_EQUIVALENT_REVIEW` + 9 `NEW_CANDIDATE_UNAPPLIED`**. It is not a release-authorisation tool. The native PostgreSQL ordered-replay test adds a synthetic migration history with the four different versions and verifies precisely those 13 results, alongside the existing 12-check release preflight with permanent `provider_release_authorised=BLOCK`.

`scripts/ebay-cascade-readonly-preflight.sql` was also run read-only on production: seven FK shapes **PASS**, total 13 FKs **PASS**, new guard installed **BLOCK**. No private receipt, account identifier, session, event or seller row was exported.

## Before a production migration is considered

1. Compare the *actual installed SQL definitions and grants* for the four production equivalents against the candidate versions. Separate already-applied foundations from new migrations.
2. Inventory all live table relationships, triggers, RLS and business-specific retention. Establish lawful per-account treatment for shopper and Awin records before removing any protected references.
3. Approve a minimal, ordered additive installation plan with explicit rollback, backup and a dedicated maintenance window. No live DDL without explicit authorisation.
4. Independently cover stored media, logs, backups, restoration and external processors; validate genuine signed eBay notifications, durable accepted processing and correct 2xx semantics.
5. Only after legal, security and operational evidence, configure the production token and subscribe in the eBay Developer Portal.

**Live eBay remains paused, synchronisation disabled, imports quarantined, and the deletion webhook intentionally HTTP 503/unregistered. Awin is untouched.**
