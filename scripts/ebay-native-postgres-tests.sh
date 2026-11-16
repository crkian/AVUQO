#!/usr/bin/env bash
# Native Ubuntu 24.04 GitHub runner ONLY. No Docker and no external database.
# The caller must be the local postgres Unix user. This script never installs packages.
set -Eeuo pipefail
[[ "$(id -un)" == "postgres" ]] || { echo 'FAIL: only local postgres OS user allowed'; exit 1; }
[[ "${PGHOST:-}" == "/var/run/postgresql" && "${PGDATABASE:-}" == "avuqo_ebay_ci_synthetic" ]] || {
 echo 'FAIL: requires dedicated Unix-socket local synthetic DB'; exit 1;
}
[[ -z "${PGHOSTADDR:-}" && -z "${DATABASE_URL:-}" && -z "${SUPABASE_DB_URL:-}" ]] || {
 echo 'FAIL: remote DB configuration not permitted'; exit 1;
}
psql_local(){ psql -X -v ON_ERROR_STOP=1 -h /var/run/postgresql -U postgres -d avuqo_ebay_ci_synthetic "$@"; }
psql_local -f tests/fixtures/ebay-local-schema.sql
psql_local -f supabase/migrations/20261116132000_ebay_account_scoped_erasure_foundation.sql
psql_local -f supabase/migrations/20261116153000_ebay_deletion_receipt_integrity_lock.sql
psql_local -f supabase/migrations/20261116165000_ebay_atomic_tombstone_admission.sql
psql_local -f supabase/migrations/20261116181000_ebay_erasure_work_journal.sql
psql_local -f tests/fixtures/ebay-local-erasure-acceptance.sql
psql_local -f tests/fixtures/ebay-local-permissions-integrity.sql
export ALLOW_EBAY_RACE_TEST=true
export EBAY_RACE_TEST_DATABASE_URL='host=/var/run/postgresql user=postgres dbname=avuqo_ebay_ci_synthetic'
bash scripts/test-ebay-tombstone-race.sh
bash scripts/test-ebay-reverse-lock-witness.sh
bash scripts/test-ebay-committed-link-first-race.sh
# Both the original source-scoped purge and count-only audited wrapper below
# are now EXACT versioned production SQL, not a synthetic test double.
psql_local -f supabase/migrations/20261116155500_ebay_audited_partial_erasure.sql
psql_local -f supabase/migrations/20261116192000_ebay_leased_mapped_catalogue_executor.sql
psql_local -f tests/fixtures/ebay-local-mapped-executor-acceptance.sql
bash scripts/test-ebay-native-queue-lease-race.sh
echo 'NATIVE_POSTGRES_CONCURRENCY_AND_QUEUE_LEASE_PASS (synthetic subset only; no production approval)'
