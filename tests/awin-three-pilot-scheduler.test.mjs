import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");
const scheduler=read("app/api/internal/awin-pilot-schedule/[pilot]/route.ts");
const worker=read("app/api/internal/awin-auto-import/route.ts");
const vercel=JSON.parse(read("vercel.json"));

test("daily cron has independently scheduled physical-only private pilots",()=>{
 for(const [slug,minute] of [["petlibro","5"],["mozillion","9"],["cadbury","13"],["craftbuddy","17"]]){
  const path="/api/internal/awin-pilot-schedule/"+slug;
  assert.deepEqual(vercel.crons.filter(c=>c.path===path),[{path,schedule:minute+" 7 * * *"}]);
 }
 assert.equal(vercel.crons.filter(c=>c.path==="/api/internal/awin-auto-import").length,0);
 assert.ok(vercel.crons.some(c=>c.path==="/api/internal/awin-feed-check"&&c.schedule==="17 6 * * *"));
 assert.ok(vercel.crons.some(c=>c.path==="/api/internal/awin-pneus-private-import"));
 assert.ok(vercel.crons.some(c=>c.path==="/api/internal/marketing"));
});
test("the scheduler never permits an arbitrary merchant, URL, credential, or source activation",()=>{
 assert.match(scheduler,/request.headers.get\("authorization"\)/);
 assert.ok(scheduler.indexOf("request.headers.get")<scheduler.indexOf("await context.params"));
 assert.match(scheduler,/AWIN_AUTO_IMPORT_ENABLED/);
 assert.match(scheduler,/Object\.prototype\.hasOwnProperty\.call\(PILOTS,pilot\)/);
 assert.match(scheduler,/petlibro:\["77952","103580"\]/);
 assert.match(scheduler,/mozillion:\["31539","74135"\]/);
 assert.match(scheduler,/cadbury:\["736","48599"\]/);
 assert.match(scheduler,/craftbuddy:\["45747","F1356"\]/);
 assert.match(scheduler,/privateImport\(new NextRequest/);
 assert.doesNotMatch(scheduler,/\.from\(|\.upsert\(|\.insert\(|\.update\(|fetch\(/);
});
test("existing importer accepts only three fixed SKU feeds and continues all private rights/size/stop gates",()=>{
 for(const pair of ['"77952:103580"','"31539:74135"','"736:48599"','"45747:F1356"'])
  assert.ok(worker.includes(pair));
 assert.match(worker,/const safelyPaused=source\.status==="paused"&&source\.sync_enabled===false/);
 assert.match(worker,/const safelyActive=source\.status==="active"&&source\.sync_enabled===true/);
 assert.match(worker,/sourceIngestionFailures\(source/);
 assert.match(worker,/permission_status:"unverified"/);
 assert.match(worker,/status:"private_review"/);
 assert.match(worker,/if\(!preflight&&!?\(await privateStagingAllowed\(db\)\)\)/);
 assert.match(worker,/duplicate_identity_across_batches/);
 assert.match(worker,/downloadUrl=approvedAwinDownloadUrl/);
 assert.doesNotMatch(scheduler,/record_awin_owner_release|published_deals|setSourceStatus/);
});
test("ignore build delegates to conservative deployment filter",()=>{
 assert.equal(vercel.ignoreCommand,"node scripts/vercel-ignore-build.mjs");
 const filter=read("scripts/vercel-ignore-build.mjs");
 assert.match(filter,/VERCEL_GIT_PREVIOUS_SHA/);
 assert.match(filter,/merge-base/);
 assert.match(filter,/--no-renames/);
});
