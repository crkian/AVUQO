# Awin immutable private snapshots: storage foundation

## Status
Storage foundation only. **No downloader, snapshot uploader endpoint, bulk worker, scheduler or public publisher** has been enabled.

- Bucket: `awin-bulk-private-snapshots`, `public=false`, maximum 250 MiB per object.
- No Storage `objects` RLS access policies were present at deployment; normal `anon`/`authenticated` API access is denied by RLS. Never add a broad wildcard policy.
- Allowed source object media types: CSV, TSV, gzip and generic octet-stream. A subsequent worker must use explicit content and format sniffing; media type alone is not proof.
- Object keys: `awin/{advertiser_id}/{feed_id}/{sha256}.{csv|tsv|csv.gz|tsv.gz}`.
- `privateAwinSnapshotKey` validates a deterministic content-addressed key; `digestBoundedAwinSnapshot` computes SHA-256 incrementally with a 250 MiB cap.
- Future service-role-only uploader **must** use `upsert:false`, verify full bytes digest before attaching a journal job, and verify object content on read.
- Existing `awin_bulk_import_jobs` stores only the key and digest, never signed Awin URLs or credentials.

## Essential remaining work before live Tooled Up snapshots
1. Joined-source and explicit feed allowlist; validate Tooled Up master-feed dialect and advertiser identity.
2. Secure download from a validated Awin host with network limits, stream backpressure, decompression-bomb bounds, timeouts, and private object upload without buffering entire feed.
3. Fully validate rows before staging; never blindly process services/contract feeds.
4. Transactional snapshot-job registration with permission-unverified private run linkage; immutable snapshot integrity and race checks.
5. Worker that claims a bounded lease, fetches one validated chunk and reconciles authoritative 250-row private session checkpoints; abort on cancelled membership or failed rights gates.
6. Integration tests for concurrent claims, expired leases, partial appends, invalid digests, duplicate object names, source revocation and zero public offers.
7. Explicit owner approval before unattended imports or any publication.

The bucket is empty at foundation deployment. Current Awin auto-import switch remains off.
