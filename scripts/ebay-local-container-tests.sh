#!/usr/bin/env bash
# Runs ONLY within disposable local isolated postgres container.
set -Eeuo pipefail
export PGHOST=/var/run/postgresql PGUSER=postgres PGDATABASE=postgres
psql -X -v ON_ERROR_STOP=1 -f /tmp/avuqo/fixture.sql
psql -X -v ON_ERROR_STOP=1 -f /tmp/avuqo/receipt-integrity.sql
psql -X -v ON_ERROR_STOP=1 -f /tmp/avuqo/atomic-lock.sql
psql -X -v ON_ERROR_STOP=1 -f /tmp/avuqo/work-journal.sql
psql -X -v ON_ERROR_STOP=1 -f /tmp/avuqo/acceptance.sql
export ALLOW_EBAY_RACE_TEST=true
export EBAY_RACE_TEST_DATABASE_URL='host=/var/run/postgresql user=postgres dbname=postgres'
bash /tmp/avuqo/test-ebay-tombstone-race.sh
bash /tmp/avuqo/test-ebay-reverse-lock-witness.sh
echo 'LOCAL_POSTGRES_CHECKS_PASS (not full erasure or provider verification)'
