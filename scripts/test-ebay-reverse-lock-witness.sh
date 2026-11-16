#!/usr/bin/env bash
# Reverse-direction advisory-lock witness on an authorised clone.
# This does NOT construct a real eBay ownership link or prove full erasure.
set -Eeuo pipefail
if [[ "${ALLOW_EBAY_RACE_TEST:-}" != "true" || -z "${EBAY_RACE_TEST_DATABASE_URL:-}" ]]; then
  echo "SKIP: explicit opt-in and private test database URL required"; exit 2
fi
command -v psql >/dev/null || { echo "SKIP: psql required"; exit 2; }
command -v openssl >/dev/null || { echo "SKIP: openssl required"; exit 2; }
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
receipt_digest="$(openssl rand -hex 32)"
identity_digest="$(openssl rand -hex 32)"
pre="$(sql -c "select (select count(*) from public.ebay_deletion_receipts)::text || ':' || (select count(*) from public.ebay_account_item_links)::text")"
[[ "$(sql -c "select count(*) from public.ebay_deletion_receipts where notification_digest='$receipt_digest' or user_id_digest='$identity_digest'")" == "0" ]] || { echo "FAIL: fingerprint collision"; exit 1; }
# Mirror the exact lock expression in ebay_reject_tombstoned_account_item_link.
# A real link-first race also needs an eligible eBay offer on a controlled
# fixture, which production quarantine intentionally prevents.
(
  sql >"$tmp/holder.out" 2>"$tmp/holder.err" <<SQL
begin;
set local lock_timeout='5s';
select pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('avuqo-ebay-account:user_id_digest:$identity_digest',0));
select 'EBAY_REVERSE_LOCK_HELD';
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
  echo "INCONCLUSIVE: independently held advisory lock not observed" >&2; exit 1
fi
set +e
sql >"$tmp/contender.out" 2>"$tmp/contender.err" <<SQL
\set VERBOSITY verbose
begin;
set local lock_timeout='1200ms';
insert into public.ebay_deletion_receipts(notification_digest,user_id_digest)
 values('$receipt_digest','$identity_digest');
rollback;
SQL
contender_rc=$?
set -e
if [[ "$contender_rc" -eq 0 ]] || ! grep -Eq '55P03|canceling statement due to lock timeout' "$tmp/contender.err"; then
  echo "FAIL: reverse receipt lock contention NOT demonstrated" >&2; exit 1
fi
wait "$holder_pid"
holder_pid=""
post="$(sql -c "select (select count(*) from public.ebay_deletion_receipts)::text || ':' || (select count(*) from public.ebay_account_item_links)::text")"
[[ "$pre" == "$post" ]] || { echo "FAIL: baseline receipt/link counts changed"; exit 1; }
[[ "$(sql -c "select count(*) from public.ebay_deletion_receipts where notification_digest='$receipt_digest' or user_id_digest='$identity_digest'")" == "0" ]] || { echo "FAIL: synthetic receipt remains"; exit 1; }
echo "PASS: reverse-direction advisory lock contention witnessed; zero synthetic receipt rows. NOT a real link-first transaction proof."
