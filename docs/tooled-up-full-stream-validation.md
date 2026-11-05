# Tooled Up full-stream validation engine

This change adds a **library only**, not a live endpoint. The 25-row production sample is the only Tooled Up row-level check executed against the Awin source to date.

`validateTooledUpGzipStream(source)` consumes an externally provided gzip byte stream using Web Streams and streaming CSV parsing. It requires the exact previously observed 29-column master-feed schema and checks every parsed record, capped at 500,000 rows, for advertiser 496, feed 89987, unique nonempty product identity, numeric positive search_price, tracking-link ownership, and product title. It counts out-of-stock rows separately.

The compressed bytes are hashed in-stream (SHA-256), with a hard cap of 250 MiB; decompressed bytes are bounded at 1 GiB. The returned report includes actual row count, estimated 250-row chunks, counters, input byte sizes, source digest and source-versus-inventory count comparison. No raw products, affiliate links, URLs or other row values are returned.

**No GBP or rights approval:** `currency_verified=false`, `rights_verified=false`, `ready_to_stage=false` regardless of successful validation. All output is private diagnostic metadata. No DB writes, uploads, feed downloads or publication are performed by this library.

## Still needed before any live 84,245-row pass

- Add a guarded, streaming feed-fetch path with timeouts, full compressed-body capture and safe upload to the existing private immutable snapshot bucket; do not assume Vercel single-request runtime can accommodate a giant stream.
- Verify source attribution and UK GBP currency evidence through independent trusted review.
- Verify immutable object bytes against SHA-256 and ensure the report corresponds to precisely that object.
- Persist the aggregate validation report only after object verification, then implement the chunk worker and non-public staging, with crash and concurrency tests.
- Address scale issues in long-lived validation, including process runtime limits and exact handling of unusual quoting/compression.
- No owner approval has been given for unattended import or any publication. Keep flags disabled.

Tests cover successful synthetic gzip streams and duplicate/invalid data handling. A successful build does not prove execution of tests unless a test command is separately observed.
