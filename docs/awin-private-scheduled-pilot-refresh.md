# Awin daily private pilot refresh activation

Owner explicitly requested automatic updating on 2026-11-05. Scope this automatic **private** refresh to the two tested physical-product feeds only:

- Petlibro UK advertiser 77952, feed 103580.
- Mozillion SIM-free phones advertiser 31539, feed 74135.

Scheduled GET `/api/internal/awin-auto-import` is already listed in `vercel.json` for **07:05 UTC daily**. It rotates the two feeds by UTC date, so each feed is checked approximately every second day. The environment flag `AWIN_AUTO_IMPORT_ENABLED=true` is required; setting it does not permit any other advertiser or feed. Existing digest-based idempotency prevents re-staging unchanged completed snapshots.

**Mandatory hard gates:** every scheduled or manually requested private import refuses to proceed unless the Awin source remains `paused` and `sync_enabled=false`. The importer only creates or updates `feed_import_runs`, private session chunks and private-review records with `permission_status=unverified`; it never creates public offers, product publication, or overrides rights controls.

The metadata-only `AWIN_FEED_MONITOR_ENABLED` is already true and daily feed inventory monitoring runs at 06:17 UTC. It is separate from private product auto-stage.

Tooled Up 496:89987 (84,284 records already privately staged in a completed 338-chunk upload) **must not** be run by this small-feed worker. Its manual snapshot path, full-scale validation and future refresh worker remain separate. Likewise service, travel, tyre-fitting and contract feeds are excluded pending dedicated adapters and explicit usage rights.

**Important:** Awin merchant feed publication permissions are currently unverified in the source registry for all joined advertisers. Neither this flag nor a successful import grants publication rights. Do not set Awin source `active` or sync_enabled=true until licensing and AVUQO's manual release-review gates are satisfied. The public Awin offer count must remain zero until then.
