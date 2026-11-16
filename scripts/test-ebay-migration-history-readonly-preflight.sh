#!/usr/bin/env bash
# Called only inside fresh local ordered migration replay database.
# Do not run on production. Parses only version/status, never account data.
set -Eeuo pipefail
[[ "$(id -un)" == postgres ]] || exit 1
[[ "${PGHOST:-}" == /var/run/postgresql &&
   "${PGDATABASE:-}" == avuqo_ebay_ci_synthetic ]] || exit 1
[[ -z "${DATABASE_URL:-}" && -z "${SUPABASE_DB_URL:-}" && -z "${PGHOSTADDR:-}" ]] || exit 1
db=avuqo_ebay_ordered_replay_ci_synthetic
psql -X -v ON_ERROR_STOP=1 -h /var/run/postgresql -U postgres -d "$db" \
 -f tests/fixtures/ebay-local-migration-history.sql
rows="$(psql -X -v ON_ERROR_STOP=1 -At -F'|' \
 -h /var/run/postgresql -U postgres -d "$db" \
 -f scripts/ebay-migration-history-readonly-preflight.sql)"
printf '%s\n' "$rows"
[[ "$(printf '%s\n' "$rows" | wc -l)" -eq 13 ]] || {
 echo 'FAIL: wrong migration-history row count'; exit 1; }
[[ "$(printf '%s\n' "$rows" | awk -F'|' '$2=="EXISTING_EQUIVALENT_REVIEW"{n++} END{print n+0}')" -eq 4 ]] || {
 echo 'FAIL: expected four already-applied foundation equivalents'; exit 1; }
[[ "$(printf '%s\n' "$rows" | awk -F'|' '$2=="NEW_CANDIDATE_UNAPPLIED"{n++} END{print n+0}')" -eq 9 ]] || {
 echo 'FAIL: expected nine unapplied candidate migrations'; exit 1; }
[[ "$(printf '%s\n' "$rows" | cut -d'|' -f1 | sort -u | wc -l)" -eq 13 ]] || {
 echo 'FAIL: duplicate candidate migration version'; exit 1; }
echo 'EBAY_MIGRATION_HISTORY_RECONCILIATION_PASS (synthetic four legacy equivalent versions)'
