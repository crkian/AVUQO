#!/usr/bin/env bash
# Independent, local-only, zero-cost replay of every eBay privacy migration
# in actual filename order. Never call on Supabase or a remote database.
set -Eeuo pipefail
[[ "$(id -un)" == postgres ]] || { echo "FAIL: postgres OS user only"; exit 1; }
[[ "${PGHOST:-}" == /var/run/postgresql && "${PGDATABASE:-}" == avuqo_ebay_ci_synthetic ]] || {
 echo "FAIL: dedicated existing synthetic Unix-socket DB required"; exit 1;
}
[[ -z "${PGHOSTADDR:-}" && -z "${DATABASE_URL:-}" && -z "${SUPABASE_DB_URL:-}" ]] || {
 echo "FAIL: remote DB configuration not permitted"; exit 1;
}
db="avuqo_ebay_ordered_replay_ci_synthetic"
manifest="tests/fixtures/ebay-migration-replay-manifest.txt"
[[ -f "$manifest" ]] || { echo "FAIL: migration manifest absent"; exit 1; }
args=(-f tests/fixtures/ebay-local-schema.sql -f tests/fixtures/ebay-local-secondary-reference-schema.sql -f tests/fixtures/ebay-local-cascade-reference-schema.sql)
previous=""
count=0
while IFS= read -r path || [[ -n "$path" ]]; do
 [[ -z "$path" || "$path" == \#* ]] && continue
 [[ "$path" =~ ^supabase/migrations/[0-9]{14}_ebay_[a-z0-9_]+\.sql$ ]] || {
  echo "FAIL: non-versioned or non-eBay migration"; exit 1;
 }
 [[ -z "$previous" || "$path" > "$previous" ]] || {
  echo "FAIL: manifest not in strict migration order"; exit 1;
 }
 [[ -f "$path" ]] || { echo "FAIL: missing migration file"; exit 1; }
 previous="$path"
 args+=(-f "$path")
 ((count+=1))
done < "$manifest"
[[ "$count" -eq 12 ]] || { echo "FAIL: expected exactly twelve eBay privacy migrations"; exit 1; }
# NEVER drop a pre-existing DB: createdb must fail if the name exists.
# Only delete a database successfully created by this invocation.
created=false
cleanup(){
 if [[ "$created" == true ]]; then
  dropdb -h /var/run/postgresql -U postgres --if-exists "$db" || echo "FAIL: local replay cleanup failed" >&2
 fi
}
trap cleanup EXIT
createdb -h /var/run/postgresql -U postgres "$db"
created=true
# One transaction across local synthetic fixture + exact versioned migrations.
# Any error must roll back all DDL rather than leaving a partly installed set.
psql -X -v ON_ERROR_STOP=1 -1 -h /var/run/postgresql -U postgres -d "$db" "${args[@]}"
# The exact production-compatible read-only preflight must be structural PASS,
# provider release BLOCK, including true grants/RLS and two enabled guards.
rows="$(psql -X -v ON_ERROR_STOP=1 -At -F'|' -h /var/run/postgresql -U postgres -d "$db" -f scripts/ebay-full-schema-readonly-preflight.sql)"
printf '%s\n' "$rows"
[[ "$(printf '%s\n' "$rows" | wc -l)" -eq 12 ]] || {
 echo "FAIL: incomplete ordered-replay preflight"; exit 1;
}
[[ "$(printf '%s\n' "$rows" | awk -F'|' '$2=="PASS"{n++} END{print n+0}')" -eq 11 ]] || {
 echo "FAIL: structural preflight did not fully pass"; exit 1;
}
[[ "$(printf '%s\n' "$rows" | awk -F'|' '$1=="provider_release_authorised"{print $2}')" == BLOCK ]] || {
 echo "FAIL: provider-release gate must always remain BLOCK"; exit 1;
}
[[ "$(printf '%s\n' "$rows" | cut -d'|' -f1 | sort -u | wc -l)" -eq 12 ]] || {
 echo "FAIL: duplicate ordered-replay preflight check"; exit 1;
}
# No receipt, account mapping, work item or audit is created as a side effect.
psql -X -v ON_ERROR_STOP=1 -h /var/run/postgresql -U postgres -d "$db" \
 -f tests/fixtures/ebay-ordered-replay-invariants.sql
echo 'EBAY_ORDERED_MIGRATION_REPLAY_PASS (isolated local synthetic; eBay activation remains NO-GO)'
