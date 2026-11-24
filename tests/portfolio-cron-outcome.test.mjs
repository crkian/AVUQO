import test from "node:test";
import assert from "node:assert/strict";
import {safePrivateCronOutcome} from "../lib/awin/private-cron-outcome.ts";
test("portfolio keeps safe batch rejection reason",()=>assert.deepEqual(safePrivateCronOutcome(503,{status:"private_rotation_failed",importer_error:"private_batch_rejected"}),{state:"rejected",code:"portfolio_private_batch_rejected"}));
test("portfolio keeps exact upstream HTTP status",()=>assert.equal(safePrivateCronOutcome(422,{status:"private_rotation_failed",importer_error:"awin_product_download_failed",failure_kind:"upstream_http_406"}).code,"portfolio_upstream_http_406"));
test("portfolio refuses untrusted diagnostic content",()=>assert.equal(safePrivateCronOutcome(503,{status:"private_rotation_failed",importer_error:"https://private.example/token"}).code,"portfolio_import_failed"));
