# Manual Tooled Up private snapshot capture

`POST /api/internal/awin-tooled-up-snapshot` is restricted to the existing `CRON_SECRET` bearer token, with no request body and no feed override arguments. It downloads **only** joined advertiser `496`, master feed `89987`, after verifying the Awin source is paused with syncing disabled and the feed inventory has exactly one active matching record. The feed URL is validated by `approvedAwinDownloadUrl`; redirects are refused.

**First-phase bounded transport:** maximum **48 MiB** total compressed download and 150-second network timeout. An over-limit file fails without uploading; larger Awin snapshots need an external/resumable streaming uploader, not raising Vercel memory limits. This implementation buffers the bounded compressed payload before upload; it does not claim constant-memory upload. It only accepts gzip magic bytes and hashes the original compressed bytes.

The server derives the storage key `awin/496/89987/<sha256>.csv.gz`, uploads to `awin-bulk-private-snapshots` with `upsert:false`, then privately reads back the stored object and recomputes its SHA-256 and byte count. Duplicate uploads are accepted only if the existing stored bytes match exactly. It does not reveal source URLs, credentials, product contents or signed Storage URLs in responses.

**No product or validation writes:** this endpoint only creates a private snapshot object when manually invoked. It does not launch the validator, populate the audit table, create jobs/import runs, enable schedules or publish offers.

After the upload is independently verified, use the existing authenticated `POST /api/internal/awin-snapshot-validate` with `{"snapshot_sha256":"..."}` to run the exhaustive private diagnostics. Currency and rights approvals remain false regardless of validation outcome.

Before approving unattended operation, exercise an isolated synthetic snapshot, confirm Storage standard-upload limits for actual file size, assess timeouts and memory, add a resumable upload worker for larger files, and test concurrent duplicate attempts and source revocation.

### PowerShell manual invocation

```powershell
$r = Invoke-RestMethod -Uri "https://www.avuqo.com/api/internal/awin-tooled-up-snapshot" -Method POST -Headers @{ Authorization = "Bearer $secret" } -TimeoutSec 240
$r | ConvertTo-Json -Depth 5
```

Run only when intentionally authorising a private feed snapshot; the endpoint does not execute on cron.
