#!/usr/bin/env bash
# Genuine link-first ownership INSERT vs later receipt INSERT.
# ONLY on dedicated native CI synthetic DB; all inserts are rolled back.
set -Eeuo pipefail
[[ "${ALLOW_EBAY_RACE_TEST:-}" == true ]] || { echo 'FAIL: opt-in required'; exit 1; }
[[ "${EBAY_RACE_TEST_DATABASE_URL:-}" == 'host=/var/run/postgresql user=postgres dbname=avuqo_ebay_ci_synthetic' ]] || {
 echo 'FAIL: refusing non-local test database'; exit 1;
}
command -v psql >/dev/null
command -v openssl >/dev/null
tmp="$(mktemp -d)"
holder_pid=""
cleanup(){ if [[ -n "$holder_pid" ]]; then kill "$holder_pid" 2>/dev/null || true; wait "$holder_pid" 2>/dev/null || true; fi; rm -rf "$tmp"; }
trap cleanup EXIT
export PGCONNECT_TIMEOUT=8
export PGOPTIONS="-c statement_timeout=20000 -c idle_in_transaction_session_timeout=16000"
sql(){ psql -X -q -A -t -v ON_ERROR_STOP=1 -d "$EBAY_RACE_TEST_DATABASE_URL" "$@"; }
offer_id="$(sql -c "select o.id from public.offers o join public.sources s on s.id=o.source_id where s.connector_key='ebay' limit 1")"
[[ "$offer_id" =~ ^[0-9a-fA-F-]{36}$ ]] || { echo 'FAIL: synthetic eBay offer absent'; exit 1; }
receipt_digest="$(openssl rand -hex 32)"
identity_digest="$(openssl rand -hex 32)"
before="$(sql -c "select (select count(*) from public.ebay_deletion_receipts)::text||':'||(select count(*) from public.ebay_account_item_links)::text")"
(
 sql >"$tmp/holder.out" 2>"$tmp/holder.err" <<SQL
begin;
set local lock_timeout='5s';
insert into public.ebay_account_item_links(identity_kind,identity_digest,offer_id)
values('user_id_digest','$identity_digest','$offer_id');
select 'EBAY_LINK_FIRST_HELD';
select pg_sleep(8);
rollback;
SQL
) &
holder_pid=$!
ready=0
for ((i=0;i<80;i++)); do
 if [[ "$(sql -c "select not pg_catalog.pg_try_advisory_xact_lock(pg_catalog.hashtextextended('avuqo-ebay-account:user_id_digest:$identity_digest',0))")" == t ]]; then ready=1; break; fi
 if ! kill -0 "$holder_pid" 2>/dev/null; then break; fi
 sleep 0.1
done
[[ "$ready" == 1 ]] || { echo 'INCONCLUSIVE: actual link-first advisory key not held' >&2; cat "$tmp/holder.err" >&2; exit 1; }
set +e
sql >"$tmp/contender.out" 2>"$tmp/contender.err" <<SQL
\set VERBOSITY verbose
begin;
set local lock_timeout='1200ms';
insert into public.ebay_deletion_receipts(notification_digest,user_id_digest)
values('$receipt_digest','$identity_digest');
rollback;
SQL
rc=$?
set -e
if [[ "$rc" -eq 0 ]] || ! grep -Eq '55P03|canceling statement due to lock timeout' "$tmp/contender.err"; then
 echo 'FAIL: receipt did not block behind real link-first INSERT' >&2; cat "$tmp/contender.err" >&2; exit 1
fi
wait "$holder_pid"
holder_pid=""
after="$(sql -c "select (select count(*) from public.ebay_deletion_receipts)::text||':'||(select count(*) from public.ebay_account_item_links)::text")"
[[ "$before" == "$after" ]] || { echo 'FAIL: baseline counts changed'; exit 1; }
[[ "$(sql -c "select count(*) from public.ebay_account_item_links where identity_digest='$identity_digest'")" == 0 ]] || { echo 'FAIL: link fixture residue'; exit 1; }
[[ "$(sql -c "select count(*) from public.ebay_deletion_receipts where notification_digest='$receipt_digest'")" == 0 ]] || { echo 'FAIL: receipt fixture residue'; exit 1; }
echo 'PASS: real link-first INSERT locks out receipt INSERT; both transactions rolled back.'
