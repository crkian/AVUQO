#!/usr/bin/env bash
# Real independent PostgreSQL sessions test SKIP LOCKED on ONE eligible queue item.
# Local native Github Actions synthetic DB only. This file never contacts Supabase.
set -Eeuo pipefail
[[ "${ALLOW_EBAY_RACE_TEST:-}" == true ]] || { echo 'FAIL: explicit test opt-in required'; exit 1; }
[[ "${EBAY_RACE_TEST_DATABASE_URL:-}" == 'host=/var/run/postgresql user=postgres dbname=avuqo_ebay_ci_synthetic' ]] || {
 echo 'FAIL: only dedicated Unix-socket synthetic DB is permitted'; exit 1;
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

# The runner drops this whole synthetic DB. Keep committed fixture to allow
# two concurrent sessions to see one eligible queue row. Digests are random.
digest="$(openssl rand -hex 32)"
identity="$(openssl rand -hex 32)"
receipt_id="$(sql -c "insert into public.ebay_deletion_receipts(notification_digest,user_id_digest)
 values('$digest','$identity') returning id")"
[[ "$receipt_id" =~ ^[0-9]+$ ]] || { echo 'FAIL: synthetic receipt setup failed'; exit 1; }
sql -c "update public.ebay_erasure_work_items set state='blocked'
 where receipt_id=$receipt_id and surface<>'mapped_catalogue'" >/dev/null
[[ "$(sql -c "select count(*) from public.ebay_erasure_work_items where receipt_id=$receipt_id and state='pending'")" == 1 ]] || {
 echo 'FAIL: exactly one eligible queue item is required'; exit 1;
}
[[ "$(sql -c "select count(*) from public.ebay_erasure_work_items where receipt_id=$receipt_id and state='blocked'")" == 6 ]] || {
 echo 'FAIL: six non-test work surfaces must be blocked'; exit 1;
}
# An advisory key serves ONLY as a reliable readiness signal after the real
# row claim. The contested resource is the real queue row, not the advisory key.
signal_key="avuqo-ebay-lease-test:$receipt_id"
(
 sql >"$tmp/holder.out" 2>"$tmp/holder.err" <<SQL
begin;
set local lock_timeout='5s';
select receipt_id::text||':'||surface||':'||attempt::text
from public.ebay_claim_erasure_work(90);
select pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('$signal_key',0));
select pg_sleep(8);
rollback;
SQL
) &
holder_pid=$!
ready=0
for ((i=0;i<90;i++)); do
 if [[ "$(sql -c "select not pg_catalog.pg_try_advisory_xact_lock(pg_catalog.hashtextextended('$signal_key',0))")" == t ]]; then ready=1; break; fi
 if ! kill -0 "$holder_pid" 2>/dev/null; then break; fi
 sleep 0.1
done
if [[ "$ready" != 1 ]]; then echo 'INCONCLUSIVE: queue holder not observed' >&2; cat "$tmp/holder.err" >&2; exit 1; fi

# A second real session must skip the held row without blocking or claiming it.
contender="$(sql -c "select count(*) from public.ebay_claim_erasure_work(90)")"
[[ "$contender" == 0 ]] || { echo "FAIL: concurrent worker incorrectly claimed $contender items" >&2; exit 1; }
wait "$holder_pid"
holder_pid=""
grep -Fxq "$receipt_id:mapped_catalogue:1" "$tmp/holder.out" || {
 echo 'FAIL: first worker never claimed intended row' >&2; cat "$tmp/holder.err" >&2; exit 1;
}

# Holder rolled back, so a subsequent fresh claim must be permitted.
replay="$(sql <<SQL
begin;
select receipt_id::text||':'||surface||':'||attempt::text
from public.ebay_claim_erasure_work(90);
rollback;
SQL
)"
[[ "$replay" == "$receipt_id:mapped_catalogue:1" ]] || {
 echo "FAIL: rolled-back worker work not replayable" >&2; exit 1;
}
[[ "$(sql -c "select count(*) from public.ebay_erasure_work_items where receipt_id=$receipt_id and surface='mapped_catalogue' and state='pending' and attempts=0")" == 1 ]] || {
 echo 'FAIL: queue lease/attempt changed after rollback' >&2; exit 1;
}
[[ "$(sql -c "select count(*) from public.ebay_deletion_receipts where id=$receipt_id and state='pending_privacy_review' and completed_at is null")" == 1 ]] || {
 echo 'FAIL: receipt no longer pending'; exit 1;
}
echo 'PASS: real concurrent queue claim exclusion and crash rollback replay; synthetic receipt remains pending.'
