#!/usr/bin/env bash
# Native synthetic database only; never connect to Supabase or production.
set -Eeuo pipefail
[[ "$(id -un)" == postgres ]] || { echo "FAIL: postgres Unix user only"; exit 1; }
[[ "${PGHOST:-}" == "/var/run/postgresql" &&
   "${PGDATABASE:-}" == "avuqo_ebay_ci_synthetic" ]] || {
 echo "FAIL: local synthetic database only"; exit 1;
}
[[ -z "${PGHOSTADDR:-}" && -z "${DATABASE_URL:-}" && -z "${SUPABASE_DB_URL:-}" ]] || {
 echo "FAIL: external database forbidden"; exit 1;
}
report="$(psql -X -v ON_ERROR_STOP=1 -At -F'|' -h /var/run/postgresql \
 -U postgres -d avuqo_ebay_ci_synthetic -f scripts/ebay-cascade-readonly-preflight.sql)"
printf '%s\n' "$report"
[[ "$(printf '%s\n' "$report" | wc -l)" -eq 3 ]] || {
 echo "FAIL: incomplete cascade preflight"; exit 1;
}
for check in seven_validated_cascade_fks exact_thirteen_offer_fks cascade_containment_guard_enabled; do
 [[ "$(printf '%s\n' "$report" | awk -F'|' -v id="$check" '$1==id{print $2}')" == PASS ]] || {
  echo "FAIL: $check not PASS"; exit 1;
 }
done
echo 'EBAY_SEVEN_CASCADE_READONLY_PREFLIGHT_PASS'
