#!/usr/bin/env bash
# Native local PostgreSQL ONLY. Never use on a remote or production database.
set -Eeuo pipefail
[[ "$(id -un)" == "postgres" ]] || { echo "FAIL: postgres OS user required"; exit 1; }
[[ "${PGHOST:-}" == "/var/run/postgresql" && "${PGDATABASE:-}" == "avuqo_ebay_ci_synthetic" ]] || {
 echo "FAIL: synthetic socket database required"; exit 1;
}
[[ -z "${PGHOSTADDR:-}" && -z "${DATABASE_URL:-}" && -z "${SUPABASE_DB_URL:-}" ]] || {
 echo "FAIL: no remote database variables permitted"; exit 1;
}
input=scripts/ebay-full-schema-readonly-preflight.sql
[[ -f "$input" ]] || { echo "FAIL: preflight SQL missing"; exit 1; }
rows="$(psql -X -v ON_ERROR_STOP=1 -At -F'|' -h /var/run/postgresql -U postgres -d avuqo_ebay_ci_synthetic -f "$input")"
printf '%s\n' "$rows"
expected=(
 dba_executor_private eleven_core_relations four_validated_secondary_fks
 independent_drift_guard_enabled private_partial_audit_installed
 provider_release_authorised queue_private_roles queue_rls_enabled
 secondary_orphan_guard_enabled six_required_dba_rpcs source_quarantine
 work_journal_installed
)
[[ "$(printf '%s\n' "$rows" | wc -l)" -eq "${#expected[@]}" ]] || {
 echo "FAIL: unexpected number of read-only checks"; exit 1;
}
for key in "${expected[@]}"; do
 wanted=PASS
 [[ "$key" == provider_release_authorised ]] && wanted=BLOCK
 line="$(printf '%s\n' "$rows" | awk -F'|' -v id="$key" '$1==id {print $2}')"
 [[ "$line" == "$wanted" ]] || {
  echo "FAIL: $key expected $wanted, observed ${line:-MISSING}"; exit 1;
 }
done
[[ "$(printf '%s\n' "$rows" | cut -d'|' -f1 | sort -u | wc -l)" -eq "${#expected[@]}" ]] || {
 echo "FAIL: duplicate or missing check ids"; exit 1;
}
echo "EBAY_FULL_SCHEMA_RELEASE_PREFLIGHT_PASS (synthetic DB; provider approval must remain BLOCK)"
