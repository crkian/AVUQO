#!/usr/bin/env bash
# AVUQO eBay: faithful production-schema-only rehearsal, NO DATA.
# Requires a separately obtained PostgreSQL custom-format SCHEMA-ONLY archive.
# Not invoked by CI without a reviewed production-schema export.
# Never connects to production. Never loads data. Never installs production SQL.
set -Eeuo pipefail
[[ "$(id -un)" == postgres ]] || { echo "FAIL: dedicated local postgres OS user required"; exit 1; }
[[ "${PGHOST:-}" == /var/run/postgresql && "${PGDATABASE:-}" == avuqo_ebay_ci_synthetic ]] || {
 echo "FAIL: local socket and synthetic PGDATABASE required"; exit 1;
}
for v in PGHOSTADDR DATABASE_URL SUPABASE_DB_URL PGPASSWORD PGSERVICE PGSERVICEFILE; do
 [[ -z "${!v:-}" ]] || { echo "FAIL: remote/secret connection environment rejected: $v"; exit 1; }
done
dump="${AVUQO_EBAY_SCHEMA_ONLY_DUMP:-}"
[[ -n "$dump" && -f "$dump" && ! -L "$dump" && "$dump" == *.dump ]] || {
 echo "FAIL: an existing, non-symlink, reviewed schema-only .dump archive is required"; exit 1;
}
for bin in pg_restore psql createdb dropdb; do command -v "$bin" >/dev/null || {
 echo "FAIL: missing $bin"; exit 1;
}; done

# A custom archive may be called 'schema-only' but still contain account data.
# Refuse archives containing any data-bearing TOC member, even though restore
# separately passes --schema-only. No archive content is committed to Git.
toc="$(pg_restore --list "$dump")" || { echo "FAIL: invalid PostgreSQL archive"; exit 1; }
if printf '%s\n' "$toc" | grep -E '^[0-9]+; .* (TABLE DATA|BLOBS|BLOB|MATERIALIZED VIEW DATA) '; then
 echo "FAIL: archive includes data-bearing objects"; exit 1;
fi
printf '%s\n' "$toc" | grep -q ' TABLE public ' || {
 echo "FAIL: archive lacks public table definitions"; exit 1;
}
printf '%s\n' "$toc" | grep -q ' FUNCTION public ebay_' || {
 echo "FAIL: archive lacks installed eBay function definitions"; exit 1;
}

db=avuqo_ebay_prod_schema_only_ci_synthetic
created=false
cleanup(){
 if [[ "$created" == true ]]; then
  dropdb -h /var/run/postgresql -U postgres --if-exists "$db" ||
   echo "FAIL: isolated schema rehearsal cleanup failed" >&2
 fi
}
trap cleanup EXIT
# Never overwrite/clean up a pre-existing database.
createdb -h /var/run/postgresql -U postgres "$db"
created=true

# Supabase system roles may be referenced in production ACL/policy DDL.
psql -X -v ON_ERROR_STOP=1 -h /var/run/postgresql -U postgres -d "$db" <<'SQL' >/dev/null
do $roles$ begin
 if not exists(select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
 if not exists(select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
 if not exists(select 1 from pg_roles where rolname='service_role') then create role service_role nologin; end if;
end $roles$;
SQL

# Restore *schema only* with no owner, grant, or actual row data, into LOCAL db.
# The archive must be freshly exported with pg_dump -Fc --schema-only -n public,
# and any required dependent schemas must be included. Restore failures BLOCK.
pg_restore --schema-only --exit-on-error --single-transaction \
  --no-owner --no-privileges -h /var/run/postgresql -U postgres -d "$db" "$dump" >/dev/null

# Production-derived definition must contain seven bodies that correspond to
# our four known installed foundations, not just similarly named placeholders.
hash_rows="$(psql -X -v ON_ERROR_STOP=1 -At -F '|' -h /var/run/postgresql -U postgres \
  -d "$db" -f scripts/ebay-seven-foundation-body-hash-readonly.sql)"
[[ "$(printf '%s\n' "$hash_rows" | awk -F'|' '$2=="MATCH"{n++} END{print n+0}')" == 7 ]] || {
 echo "FAIL: existing four-foundation function definitions differ"; exit 1;
}
[[ "$(printf '%s\n' "$hash_rows" | awk -F'|' '$1=="production_installation_authorised"{print $2}')" == BLOCK ]] || {
 echo "FAIL: production authorisation gate invalid"; exit 1;
}

# Ensure exact 13 FK dependency topology in restored schema. Data checks are
# inapplicable because the schema-only restore intentionally has zero rows.
fk_rows="$(psql -X -v ON_ERROR_STOP=1 -At -F '|' -h /var/run/postgresql -U postgres \
 -d "$db" -c "
 select count(*),count(*) filter(where confdeltype='c'),
 count(*) filter(where confdeltype='n'),bool_and(convalidated and not condeferrable)
 from pg_constraint where contype='f' and confrelid=to_regclass('public.offers');")"
[[ "$fk_rows" == '13|9|4|t' ]] || {
 echo "FAIL: production-derived offer dependency graph is not 13/9/4"; exit 1;
}

# Source 9-file list is pinned to the exact suffix of reviewed 13-file manifest.
mapfile -t all < <(grep '^supabase/migrations/' tests/fixtures/ebay-migration-replay-manifest.txt)
mapfile -t nine < <(grep '^supabase/migrations/' tests/fixtures/ebay-nine-only-migration-manifest.txt)
[[ "${#all[@]}" -eq 13 && "${#nine[@]}" -eq 9 ]] || exit 1
args=()
for i in "${!nine[@]}"; do
 [[ "${all[$((i+4))]}" == "${nine[$i]}" && -f "${nine[$i]}" ]] || {
 echo "FAIL: nine-only migration manifest drift"; exit 1;
 }
 args+=(-f "${nine[$i]}")
done

# No pending candidate touches the actual production database. This is a
# disposable local-only replay. All nine changes roll back together on error.
psql -X -v ON_ERROR_STOP=1 -1 -h /var/run/postgresql -U postgres \
 -d "$db" "${args[@]}" >/dev/null

# Validate core privacy guards, queue and least-privilege after nine-only replay.
result="$(psql -X -v ON_ERROR_STOP=1 -At -F '|' -h /var/run/postgresql -U postgres \
 -d "$db" -c "
select
 to_regclass('public.ebay_erasure_work_items') is not null,
 to_regprocedure('public.ebay_receipt_queue_ready(text)') is not null,
 exists(select 1 from pg_trigger
  where tgrelid=to_regclass('public.offers') and
   tgname='ebay_offer_02_unreviewed_cascade_gate' and tgenabled='O'),
 not has_function_privilege('anon','public.ebay_receipt_queue_ready(text)','EXECUTE'),
 not has_function_privilege('authenticated','public.ebay_receipt_queue_ready(text)','EXECUTE'),
 not has_function_privilege('service_role','public.ebay_run_next_mapped_catalogue_erasure()','EXECUTE');")"
[[ "$result" == 't|t|t|t|t|t' ]] || {
 echo "FAIL: private journal, guard or privilege checks failed"; exit 1;
}
echo "EBAY_PRODUCTION_SCHEMA_ONLY_NINE_REPLAY_PASS (local, no rows, provider NO-GO)"
