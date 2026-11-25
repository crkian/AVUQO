import test from "node:test";
import assert from "node:assert/strict";
import {safePrivateCronOutcome} from "../lib/awin/private-cron-outcome.ts";
test("portfolio keeps safe batch rejection reason",()=>assert.deepEqual(safePrivateCronOutcome(503,{status:"private_rotation_failed",importer_error:"private_batch_rejected"}),{state:"rejected",code:"portfolio_private_batch_rejected"}));
test("portfolio keeps exact upstream HTTP status",()=>assert.equal(safePrivateCronOutcome(422,{status:"private_rotation_failed",importer_error:"awin_product_download_failed",failure_kind:"upstream_http_406"}).code,"portfolio_upstream_http_406"));
test("portfolio refuses untrusted diagnostic content",()=>assert.equal(safePrivateCronOutcome(503,{status:"private_rotation_failed",importer_error:"https://private.example/token"}).code,"portfolio_import_failed"));

test("portfolio preserves known preflight causes only",()=>{for(const reason of ["unsupported_columns","csv_column_limit","petlibro_feed_identity_mismatch","duplicate_identity_across_batches"]){const r=safePrivateCronOutcome(422,{status:"private_rotation_failed",importer_error:"feed_preflight_failed",reason});assert.equal(r.code,"portfolio_feed_preflight_"+reason);assert.ok(r.code.length<=80)}assert.equal(safePrivateCronOutcome(422,{status:"private_rotation_failed",importer_error:"feed_preflight_failed",reason:"https://private.example/token"}).code,"portfolio_feed_preflight_failed")});
test("successful private staging is not successful live validation",()=>{assert.equal(safePrivateCronOutcome(200,{status:"private_rotation_checked",live_verified_rows:0}).code,"portfolio_no_live_verified_rows");assert.equal(safePrivateCronOutcome(200,{status:"private_rotation_checked",live_verified_rows:20}).code,"private_rotation_checked")});
