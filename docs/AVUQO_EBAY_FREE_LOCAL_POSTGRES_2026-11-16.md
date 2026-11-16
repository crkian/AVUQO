# Free local eBay PostgreSQL test route

**Date:** 16 November 2026. **Cost:** no new cloud project or subscription. The script uses an existing local Docker installation and the public PostgreSQL 17 image. If Docker is not installed, it exits rather than installing anything or creating paid infrastructure. Image download may use internet bandwidth, but no paid cloud resources are provisioned.

## Windows PowerShell

In the checked-out AVUQO repository at `C:\avuqo`, with Docker Desktop / Docker Engine already running:

```powershell
cd C:\avuqo
git pull --ff-only
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\run-ebay-local-postgres-tests.ps1
```

This launches a uniquely named, **network-isolated** (`--network none`) PostgreSQL 17 container with ephemeral database storage (`--tmpfs`). It copies only the synthetic fixture and the actual versioned receipt-lock, atomic tombstone and work-journal migrations. It runs the SQL transactional work-journal acceptance, the receipt-first two-process race and the reverse advisory-lock witness. All synthetic receipts are rolled back; the entire container is forcibly removed even on failure. No port is published. No secrets, production exports, Supabase URLs or customer data are required.

A passing local test proves that these *selected source migrations* operate as expected against this purpose-built fixture. It is **not** a test of the entire live schema or the cross-store deletion process. The reverse witness still uses an advisory-key holder rather than a committed eBay link, so real link-first end-to-end proof remains outstanding. Neither test certifies all backups, processor retention, legal compliance or signed eBay notification behaviour.

## Why the original race probes changed

The previous holder synchronisation polled a marker written by `psql` to a redirected output file. Buffered output could be observed late or not at all, yielding a false inconclusive timeout. Both scripts now check `pg_try_advisory_xact_lock` using a separate PostgreSQL session on the exact same hashed account key: only failure to acquire the key establishes that the holder really holds the transactional advisory lock. The scripts still require SQLSTATE 55P03 and rolled-back synthetic records.

## Current production restrictions

The work-journal SQL stays **unapplied on production**. eBay stays `paused`, sync disabled, source quarantine in place, deletion webhook HTTP 503/unregistered. No Awin changes. Do not run fixture SQL against AVUQO production. Do not infer deletion completion from a green static unit test.

## Next independent release gates

1. Run the offline acceptance on a local computer that already has Docker.
2. Establish true inverse-order committed-link and multi-identity race evidence against a faithful local/authorised clone, not just the advisory-key witness.
3. Implement actual erasure across independently identified data surfaces, idempotent retries, exceptions and processor/backup retention under owner/legal approval.
4. Test the genuine provider-signed notification and production permissions before any live eBay acknowledgment or activation.
