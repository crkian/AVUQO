#!/usr/bin/env bash
# Local synthetic rehearsal: four existing foundation equivalents + NINE later migrations.
# Never connects to production, never installs a production migration.
set -Eeuo pipefail
[[ "$(id -un)" == postgres ]] || { echo "FAIL: local postgres OS user required"; exit 1; }
[[ "${PGHOST:-}" == /var/run/postgresql && "${PGDATABASE:-}" == avuqo_ebay_ci_synthetic ]] || {
 echo "FAIL: dedicated local synthetic socket environment required"; exit 1;
}
[[ -z "${PGHOSTADDR:-}" && -z "${DATABASE_URL:-}" &&
   -z "${SUPABASE_DB_URL:-}" && -z "${PGPASSWORD:-}" ]] || {
 echo "FAIL: remote connection configuration forbidden"; exit 1;
}
db=avuqo_ebay_nine_only_ci_synthetic
manifest=tests/fixtures/ebay-nine-only-migration-manifest.txt
full=tests/fixtures/ebay-migration-replay-manifest.txt
[[ -f "$manifest" && -f "$full" ]] || { echo "FAIL: migration manifests missing"; exit 1; }

# Verify exact nine-only suffix of the original ordered THIRTEEN-file manifest.
mapfile -t all < <(grep '^supabase/migrations/' "$full")
mapfile -t nine < <(grep '^supabase/migrations/' "$manifest")
[[ "${#all[@]}" == 13 && "${#nine[@]}" == 9 ]] || {
 echo "FAIL: expected 13 canonical and nine pending migration paths"; exit 1;
}
for i in "${!nine[@]}"; do
 [[ "${all[$((i+4))]}" == "${nine[$i]}" ]] || {
  echo "FAIL: nine-only list must be exact suffix of reviewed chronological manifest"; exit 1;
 }
 [[ "${nine[$i]}" =~ ^supabase/migrations/[0-9]{14}_ebay_[a-z0-9_]+\.sql$ ]] || {
  echo "FAIL: unexpected migration path"; exit 1;
 }
 [[ -f "${nine[$i]}" ]] || { echo "FAIL: pending SQL absent"; exit 1; }
done

created=false
cleanup(){
 if [[ "$created" == true ]]; then
  dropdb -h /var/run/postgresql -U postgres --if-exists "$db" ||
   echo "FAIL: local-only replay cleanup failed" >&2
 fi
}
trap cleanup EXIT
# Never drop or overwrite a database created by someone else.
createdb -h /var/run/postgresql -U postgres "$db"
created=true

# Real candidate foundation SQL is installed exactly once, to a fresh, throwaway
# local database; migration history uses the four ACTUAL production-like versions.
# These same foundation migration files are deliberately never re-run below.
foundation=(
 tests/fixtures/ebay-local-schema.sql
 tests/fixtures/ebay-local-secondary-reference-schema.sql
 tests/fixtures/ebay-local-cascade-reference-schema.sql
 "${all[0]}" "${all[1]}" "${all[2]}" "${all[3]}"
 tests/fixtures/ebay-local-migration-history.sql
)
foundation_args=()
for path in "${foundation[@]}"; do foundation_args+=(-f "$path"); done
psql -X -v ON_ERROR_STOP=1 -1 -h /var/run/postgresql -U postgres -d "$db" "${foundation_args[@]}" >/dev/null

before="$(psql -X -v ON_ERROR_STOP=1 -At -F'|' -h /var/run/postgresql -U postgres -d "$db" -f scripts/ebay-migration-history-readonly-preflight.sql)"
[[ "$(printf '%s\n' "$before" | awk -F'|' '$2=="EXISTING_EQUIVALENT_REVIEW"{n++} END{print n+0}')" == 4 ]] || {
 echo "FAIL: four historical foundation versions not reconciled"; exit 1;
}
[[ "$(printf '%s\n' "$before" | awk -F'|' '$2=="NEW_CANDIDATE_UNAPPLIED"{n++} END{print n+0}')" == 9 ]] || {
 echo "FAIL: pending nine-migration history not clean"; exit 1;
}

# Exactly NINE actual candidate SQL files, in one rollback-on-error transaction.
args=()
for path in "${nine[@]}"; do args+=(-f "$path"); done
psql -X -v ON_ERROR_STOP=1 -1 -h /var/run/postgresql -U postgres -d "$db" "${args[@]}" >/dev/null

# Reuse production-compatible schema and privilege checks. Final provider gate
# deliberately remains BLOCK, even after all local structural passes.
rows="$(psql -X -v ON_ERROR_STOP=1 -At -F'|' -h /var/run/postgresql -U postgres -d "$db" -f scripts/ebay-full-schema-readonly-preflight.sql)"
printf '%s\n' "$rows"
[[ "$(printf '%s\n' "$rows" | wc -l)" -eq 12 &&
   "$(printf '%s\n' "$rows" | awk -F'|' '$2=="PASS"{n++} END{print n+0}')" -eq 11 &&
   "$(printf '%s\n' "$rows" | awk -F'|' '$1=="provider_release_authorised"{print $2}')" == BLOCK ]] || {
 echo "FAIL: nine-only structural or provider release invariants"; exit 1;
}
psql -X -v ON_ERROR_STOP=1 -h /var/run/postgresql -U postgres -d "$db" -f tests/fixtures/ebay-ordered-replay-invariants.sql >/dev/null

# The four historically recorded names and versions remain intact; no duplicate
# foundation candidate versions were recorded by this local SQL rehearsal.
psql -X -v ON_ERROR_STOP=1 -h /var/run/postgresql -U postgres -d "$db" -c "
do \$reconcile\$ begin
 if (select count(*) from supabase_migrations.schema_migrations) <> 4
  or exists(select 1 from supabase_migrations.schema_migrations
   where version in ('20261116132000','20261116153000','20261116155500','20261116165000'))
 then raise exception 'Historical migration versions were changed'; end if;
end \$reconcile\$;" >/dev/null
echo 'EBAY_NINE_ONLY_REPLAY_PASS (synthetic four-installed-foundation baseline; provider NO-GO)'
