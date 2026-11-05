# Private Awin snapshot validation audit foundation

This change adds an **append-only diagnostic register** for the Tooled Up master feed 496:89987. The existing full gzip stream validator is a library, not a running downloader. The storage bucket is private and empty at the point this change was applied.

- Table: `public.awin_private_snapshot_validations`.
- Only `service_role` may insert/read via API. RLS is enabled; anon and authenticated grants are revoked. An enabled BEFORE UPDATE/DELETE trigger rejects mutation even when the service role has effective modification permissions.
- Rows record advertiser/feed ID, expected storage bucket and content-derived object key, SHA-256 compressed snapshot fingerprint, original/expanded byte totals, actual row count, validation counters and timestamps.
- Database CHECK constraints bind the object key to the digest, prevent nonsensical sizes/counters, and force `currency_verified=false`, `rights_verified=false`, and `ready_to_stage=false`.
- `privateTooledUpValidationRow` builds a strictly bounded report shape from a completed `validateTooledUpGzipStream` diagnostic. Invalid hashes/keys/counts fail closed.
- No product data, signed Awin URLs or API tokens are saved in the report table.

**Important limitation:** This change does NOT yet upload a snapshot, verify an object retrieved from Supabase Storage, or insert a live report. The helper is not an authorised production entrypoint; any future writer must fetch and hash the actual private object itself under the service role, verify its exact key and immutable contents, and only then insert. A caller-provided report is not sufficient evidence.

Future work: bounded authenticated Awin download and resumable/upload verification, one-way content-addressed storage, in-process or job-based validation against stored bytes, safe report insertion and integration tests; then consider a private chunk worker. Currency and image rights must still be separately approved. Scheduled imports and publishing must remain OFF.
