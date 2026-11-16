#!/usr/bin/env bash
# Owner-approved, two-connection transaction-lock probe. NEVER commits synthetic data.
# ALLOW_EBAY_RACE_TEST=true EBAY_RACE_TEST_DATABASE_URL=<private connection URL> bash scripts/test-ebay-tombstone-race.sh
set -Eeuo pipefail
if [[ "$(printenv ALLOW_EBAY_RACE_TEST || true)" != "true" || -z "$(printenv EBAY_RACE_TEST_DATABASE_URL || true)" ]]; then
 echo "SKIP: explicit opt-in and a private database connection URL required"; exit 2
fi
command -v psql >/dev/null || { echo "psql required"; exit 2; }
command -v openssl >/dev/null || { echo "openssl required"; exit 2; }
tmp="$(mktemp -d)"
holder_pid=""
cleanup() {
 if [[ -n "$holder_pid" ]]; then
  kill "$holder_pid" 2>/dev/null || true
  wait "$holder_pid" 2>/dev/null || true
 fi
 rm -rf "$tmp"
}
trap cleanup EXIT
export PGCONNECT_TIMEOUT=8
export PGOPTIONS="-c statement_timeout=20000 -c idle_in_transaction_session_timeout=16000"
sql() { psql -X -q -A -t -v ON_ERROR_STOP=1 -d "$EBAY_RACE_TEST_DATABASE_URL" "$@"; }
offer_id="$(sql -c "select o.id from public.offers o join public.sources s on s.id=o.source_id where s.connector_key <> 'ebay' order by o.id limit 1")"
[[ "$offer_id" =~ ^[0-9a-fA-F-]{36}$ ]] || { echo "SKIP: non-eBay offer unavailable"; exit 2; }
receipt_digest="$(openssl rand -hex 32)"
identity_digest="$(openssl rand -hex 32)"
pre="$(sql -c "select (select count(*) from public.ebay_deletion_receipts)::text || ':' || (select count(*) from public.ebay_account_item_links)::text")"
[[ "$(sql -c "select count(*) from public.ebay_deletion_receipts where notification_digest='$receipt_digest' or user_id_digest='$identity_digest'")" == "0" ]] || exit 1
(
 sql >"$tmp/holder.out" 2>"$tmp/holder.err" <<SQL
begin;
set local lock_timeout='5s';
insert into public.ebay_deletion_receipts(notification_digest,user_id_digest)
 values('$receipt_digest','$identity_digest');
select 'EBAY_LOCK_HELD';
select pg_sleep(8);
rollback;
SQL
) &
holder_pid=$!
ready=0
for ((i=0;i<75;i++)); do
 if [[ "$(sql -c "select not pg_catalog.pg_try_advisory_xact_lock(pg_catalog.hashtextextended('avuqo-ebay-account:user_id_digest:$identity_digest',0))")" == "t" ]]; then ready=1; break; fi
 if ! kill -0 "$holder_pid" 2>/dev/null; then break; fi
 sleep 0.1
done
if [[ "$ready" != "1" ]]; then
 echo "INCONCLUSIVE: holder transaction not observed" >&2; exit 1
fi
set +e
sql >"$tmp/contender.out" 2>"$tmp/contender.err" <<SQL
\set VERBOSITY verbose
begin;
set local lock_timeout='1200ms';
insert into public.ebay_account_item_links(identity_kind,identity_digest,offer_id)
 values('user_id_digest','$identity_digest','$offer_id');
rollback;
SQL
contender_rc=$?
set -e
if [[ "$contender_rc" -eq 0 ]] || ! grep -Eq '55P03|canceling statement due to lock timeout' "$tmp/contender.err"; then
 echo "FAIL: two-session lock contention was NOT proven" >&2; exit 1
fi
wait "$holder_pid"
holder_pid=""
post="$(sql -c "select (select count(*) from public.ebay_deletion_receipts)::text || ':' || (select count(*) from public.ebay_account_item_links)::text")"
[[ "$pre" == "$post" ]] || { echo "FAIL: receipt/link counts changed"; exit 1; }
[[ "$(sql -c "select count(*) from public.ebay_deletion_receipts where notification_digest='$receipt_digest' or user_id_digest='$identity_digest'")" == "0" ]] || {
 echo "FAIL: synthetic receipt remains"; exit 1;
}
[[ "$(sql -c "select count(*) from public.ebay_account_item_links where identity_digest='$identity_digest'")" == "0" ]] || {
 echo "FAIL: synthetic link remains"; exit 1;
}
echo "PASS: real two-process contention; synthetic receipt rolled back; no test rows remain."
