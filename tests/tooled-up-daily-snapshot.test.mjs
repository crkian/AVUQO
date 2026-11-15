import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {newestRecentTooledUpSnapshot} from "../lib/awin/tooled-up-recent-snapshot.ts";
const read=p=>readFileSync(p,"utf8");
const source=read("app/api/internal/awin-tooled-up-snapshot/route.ts");
const validation=read("app/api/internal/awin-snapshot-validate/route.ts");
const cron=read("app/api/internal/awin-tooled-up-daily-validation/route.ts");
const guard=read("lib/awin/tooled-up-private-automation.ts");
const validator=read("lib/awin/tooled-up-full-stream-validator.ts");
const v=JSON.parse(read("vercel.json"));
const sha="a".repeat(64);
const ref=(name,created_at,id="uuid")=>({name,id,created_at});
const now=Date.parse("2026-11-16T08:25:00Z");
test("select only recent real immutable snapshots and prefer the newest digest",()=>{
 assert.equal(newestRecentTooledUpSnapshot([],now),null);
 assert.equal(newestRecentTooledUpSnapshot([
  ref(sha+".csv.gz","2026-11-16T08:06:00Z"),
  ref("b".repeat(64)+".csv.gz","2026-11-16T08:12:00Z")
 ],now)?.snapshot_sha256,"b".repeat(64));
 assert.equal(newestRecentTooledUpSnapshot([ref(sha+".csv.gz","2026-11-15T08:06:00Z")],now),null);
 assert.equal(newestRecentTooledUpSnapshot([ref(sha+".csv.gz","2026-11-16T08:30:00Z")],now),null);
 assert.equal(newestRecentTooledUpSnapshot([ref(sha+".csv.gz","bad-date")],now),null);
 assert.equal(newestRecentTooledUpSnapshot([ref(sha+".csv.gz","2026-11-16T08:06:00Z",null)],now),null);
});
test("reject arbitrary file types and malformed digests/paths and excessive lists",()=>{
 for(const name of ["../../"+sha+".csv.gz",sha+".csv",sha+".csv.gz.txt",
  "x".repeat(64)+".csv.gz",sha.toUpperCase()+".csv.gz",
  "other-"+sha+".csv.gz","https://example.com/"+sha+".csv.gz"])
  assert.equal(newestRecentTooledUpSnapshot([ref(name,"2026-11-16T08:06:00Z")],now),null,name);
 assert.equal(newestRecentTooledUpSnapshot(
  Array.from({length:101},()=>ref(sha+".csv.gz","2026-11-16T08:06:00Z")),now),null);
});
test("daily jobs reuse existing authenticated snapshot uploader and full stream validator",()=>{
 const snap=v.crons.filter(x=>x.path==="/api/internal/awin-tooled-up-snapshot");
 const valid=v.crons.filter(x=>x.path==="/api/internal/awin-tooled-up-daily-validation");
 assert.deepEqual(snap,[{path:"/api/internal/awin-tooled-up-snapshot",schedule:"5 8 * * *"}]);
 assert.deepEqual(valid,[{path:"/api/internal/awin-tooled-up-daily-validation",schedule:"25 8 * * *"}]);
 for(const p of [
  "/api/internal/awin-feed-check","/api/internal/marketing",
  "/api/internal/awin-pilot-schedule/petlibro",
  "/api/internal/awin-pilot-schedule/mozillion",
  "/api/internal/awin-pilot-schedule/cadbury",
  "/api/internal/awin-pilot-schedule/craftbuddy",
  "/api/internal/awin-pneus-private-import"
 ])assert.ok(v.crons.some(x=>x.path===p),p);
 assert.match(source,/export async function GET\(request:NextRequest\)/);
 assert.match(source,/return POST\(request\)/);
 assert.match(cron,/POST as validateSnapshot/);
 assert.match(cron,/return validateSnapshot\(new NextRequest/);
 assert.match(cron,/\.list\("awin\/496\/89987"/);
 assert.match(cron,/No feed, object or digest override/);
 assert.match(cron,/process\.env\.CRON_SECRET/);
 assert.match(cron,/AWIN_AUTO_IMPORT_ENABLED/);
 assert.doesNotMatch(cron,/\.insert\(|\.update\(|\.upsert\(|\.delete\(|fetch\(/);
});
test("fail closed on emergency stop before/between private writes and never activate public prices",()=>{
 assert.match(guard,/evaluateSourceControls/);
 assert.match(guard,/global_emergency_stop/);
 assert.match(guard,/source_ingestion/);
 assert.match(guard,/status==="paused"/);
 assert.match(guard,/sync_enabled===false/);
 assert.match(guard,/joinedInSource\(source\.data\.metadata,"496"\)/);
 assert.ok((source.match(/await tooledUpPrivateAutomationAllowed\(db\)/g)||[]).length>=3);
 assert.ok((validation.match(/await tooledUpPrivateAutomationAllowed\(db\)/g)||[]).length>=2);
 assert.match(source,/MAX_SNAPSHOT=48\*1024\*1024/);
 assert.match(source,/readBackDigest/);
 assert.match(source,/uploadPrivateAwinTus/);
 assert.match(validation,/privateTooledUpValidationRow/);
 assert.match(validation,/source_digest/);
 assert.doesNotMatch(source,/\.from\("offers"\)|\.from\("products"\)|published_deals/);
 assert.doesNotMatch(validation,/\.from\("offers"\)|\.from\("products"\)|published_deals/);
 assert.match(validator,/expected_inventory_rows:Number\.isSafeInteger/);
 assert.doesNotMatch(validator,/expected_inventory_rows:84245/);
});
