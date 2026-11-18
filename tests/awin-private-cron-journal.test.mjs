import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {safePrivateCronOutcome} from "../lib/awin/private-cron-outcome.ts";
const read=p=>readFileSync(p,"utf8");
const sql=read("supabase/migrations/20261116190000_awin_private_cron_attempts.sql");
const grants=read("supabase/migrations/20261116191500_awin_private_cron_minimal_service_grants.sql");
const record=read("lib/awin/private-cron-recorder.ts");
const pilot=read("app/api/internal/awin-pilot-schedule/[pilot]/route.ts");
const snapshot=read("app/api/internal/awin-tooled-up-snapshot/route.ts");
const validation=read("app/api/internal/awin-tooled-up-daily-validation/route.ts");
const schedule=JSON.parse(read("vercel.json"));
test("sanitize existing Awin worker outcomes, no arbitrary signed links or text",()=>{
 assert.deepEqual(safePrivateCronOutcome(200,{status:"private_review",records:900,source_url:"secret"}),{state:"completed",code:"private_review"});
 assert.deepEqual(safePrivateCronOutcome(200,{status:"already_staged"}),{state:"completed",code:"already_staged"});
 assert.deepEqual(safePrivateCronOutcome(200,{status:"disabled"}),{state:"disabled",code:"disabled"});
 assert.deepEqual(safePrivateCronOutcome(200,{status:"no_recent_private_snapshot"}),{state:"completed",code:"no_recent_private_snapshot"});
 assert.deepEqual(safePrivateCronOutcome(422,{error:"Feed preflight failed; nothing imported",failure_kind:"other",secret:"none"}),{state:"rejected",code:"feed_validation"});
 assert.deepEqual(safePrivateCronOutcome(502,{error:"Awin product download failed",provider_url:"https://secret.example.com"}),{state:"rejected",code:"product_download"});
 assert.deepEqual(safePrivateCronOutcome(503,{error:"https://secret.example.com/apikey/test"}),{state:"rejected",code:"http_503"});
 assert.deepEqual(safePrivateCronOutcome(200,{status:"https://secret.example.com"}),{state:"completed",code:"ok"});
});
test("persistent journal is private service-role only and rejects arbitrary jobs/data",()=>{
 for(const needle of ["ENABLE ROW LEVEL SECURITY","REVOKE ALL ON TABLE public.awin_private_cron_attempts FROM PUBLIC, anon, authenticated","GRANT SELECT,INSERT,UPDATE ON TABLE public.awin_private_cron_attempts TO service_role","CHECK (job_key IN","state IN ('started','completed','disabled','rejected','exception')","finished_at IS NULL","duration_ms"])assert.ok(sql.includes(needle),needle);
 for(const job of ["pilot_petlibro","pilot_mozillion","pilot_cadbury","pilot_craftbuddy","tooled_up_snapshot","tooled_up_validation"])assert.ok(sql.includes("'"+job+"'"),job);
 assert.doesNotMatch(sql,/GRANT .* (anon|authenticated)/);
 assert.match(grants,/REVOKE ALL ON TABLE public\.awin_private_cron_attempts FROM service_role/);
 assert.match(grants,/GRANT SELECT, INSERT, UPDATE ON TABLE public\.awin_private_cron_attempts TO service_role/);
 assert.doesNotMatch(grants,/GRANT (DELETE|TRUNCATE|TRIGGER|REFERENCES|ALL)\b/);
 assert.doesNotMatch(sql.split("CREATE TABLE IF NOT EXISTS")[1].split(");")[0],/affiliate_tracking_url|credential|raw_product|signed_url/i);
 assert.match(record,/insert\(\{job_key:job,state:"started"\}\)/);
 assert.match(record,/\.eq\("id",attemptId\)\.eq\("state","started"\)/);
 assert.match(record,/response\.clone\(\)\.json\(\)/);
 assert.match(record,/if\(insertError\|\|!attempt\?\.id\)return problem/);
 assert.match(record,/if\(!\(await finish\(/);
 assert.doesNotMatch(record,/console\.(log|error|warn)\(.*(body|error|response)/);
});
test("all six existing daily private cron jobs are journaled after authorization",()=>{
 assert.ok(pilot.indexOf("request.headers.get")<pilot.indexOf("recordPrivateCronAttempt(job"));
 assert.ok(snapshot.lastIndexOf("request.headers.get")<snapshot.lastIndexOf('recordPrivateCronAttempt("tooled_up_snapshot"'));
 assert.ok(validation.indexOf("request.headers.get")<validation.indexOf('recordPrivateCronAttempt("tooled_up_validation"'));
 assert.match(pilot,/recordPrivateCronAttempt\(job,async\(\)=>/);
 assert.match(snapshot,/recordPrivateCronAttempt\("tooled_up_snapshot",async\(\)=>/);
 assert.match(validation,/recordPrivateCronAttempt\("tooled_up_validation",async\(\)=>/);
 assert.match(pilot,/privateImport\(new NextRequest/);
 assert.match(snapshot,/return POST\(request\)/);
 assert.match(validation,/return validateSnapshot\(new NextRequest/);
 for(const job of ["petlibro","mozillion","cadbury","craftbuddy"])assert.ok(schedule.crons.some(c=>c.path.endsWith("/"+job)),job);
 for(const tail of ["awin-tooled-up-snapshot","awin-tooled-up-daily-validation"])assert.ok(schedule.crons.some(c=>c.path.endsWith("/"+tail)),tail);
 assert.ok(new Set(schedule.crons.map(c=>c.path)).size>=15);
});

test("daily Awin failures retain only allowlisted actionable diagnostics",()=>{
 assert.deepEqual(safePrivateCronOutcome(422,{error:"Feed preflight failed; nothing imported",
  reason:"cadbury_uk_schema_mismatch"}),{
   state:"rejected",code:"feed_validation_cadbury_uk_schema_mismatch"
 });
 assert.deepEqual(safePrivateCronOutcome(422,{error:"Feed preflight failed; nothing imported",
  reason:"cadbury_uk_feed_identity_mismatch"}),{
   state:"rejected",code:"feed_validation_cadbury_uk_feed_identity_mismatch"
 });
 assert.deepEqual(safePrivateCronOutcome(502,{error:"Awin product download failed",
  failure_kind:"feed_binding_mismatch"}),{
   state:"rejected",code:"product_download_feed_binding_mismatch"
 });
 assert.deepEqual(safePrivateCronOutcome(502,{error:"Awin product download failed",
  failure_kind:"upstream_http_403"}),{
   state:"rejected",code:"product_download_upstream_http"
 });
 for(const field of [
  {reason:"https://example.test/secret"},
  {failure_kind:"https://example.test/secret"},
  {reason:"not_whitelisted_code"}
 ]) {
  const pre=field.reason!==undefined;
  const code=pre?"Feed preflight failed; nothing imported":"Awin product download failed";
  const x=safePrivateCronOutcome(pre?422:502,{error:code,...field,token:"never_log"});
  assert.equal(x.code,pre?"feed_validation":"product_download");
  assert.doesNotMatch(JSON.stringify(x),/secret|token|example/);
 }
 const worker=read("app/api/internal/awin-auto-import/route.ts");
 const owner=read("app/api/control-centre/awin-run-now/route.ts");
 const ui=read("app/control-centre/awin-feed-updates/OwnerAwinRunNow.tsx");
 for(const value of ["cadbury_uk_schema_mismatch","cadbury_uk_feed_identity_mismatch",
  "feed_binding_mismatch","unsafe_feed_url","source_size_limit"])
  assert.ok(worker.includes(value));
 assert.match(owner,/"failure_kind","diagnostic_stage","detected_delimiter","columns","parsed_rows"/);
 assert.match(ui,/o\.failure_kind/);
 assert.doesNotMatch(worker,/console\.log\(.*(downloadUrl|key|feedRow)/);
});
