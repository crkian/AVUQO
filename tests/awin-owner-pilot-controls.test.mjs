import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=p=>readFileSync(p,"utf8");
const api=read("app/api/control-centre/awin-pilot/route.ts");
const worker=read("app/api/internal/awin-auto-import/route.ts");
const page=read("app/control-centre/awin-pilot/page.tsx");
const ui=read("app/control-centre/awin-pilot/PetlibroPilotControls.tsx");

test("Petlibro owner API authorizes a server-verified user and exact owner role before using cron secret",()=>{
 assert.ok(api.indexOf("db.auth.getUser()")>=0);
 assert.ok(api.indexOf('role?.role!=="owner"')>api.indexOf("db.auth.getUser()"));
 assert.ok(api.indexOf("process.env.CRON_SECRET")>api.indexOf('role?.role!=="owner"'));
 assert.match(api,/new URL\(origin\)\.origin!==new URL\(request\.url\)\.origin/);
 assert.match(api,/JSON request required/);
 assert.match(api,/Request too large/);
});

test("owner route only accepts exact Petlibro pilot feed and explicit private-stage confirmation",()=>{
 assert.match(api,/workerUrl\.searchParams\.set\("advertiser_id","77952"\)/);
 assert.match(api,/workerUrl\.searchParams\.set\("feed_id","103580"\)/);
 assert.match(api,/body\.confirm!=="stage-privately-77952-103580"/);
 assert.match(api,/mode!=="preflight"&&mode!=="stage"/);
 assert.match(api,/runPrivateAwinPilot\(workerRequest\)/);
 assert.doesNotMatch(api,/\.from\("offers"\)|\.from\("published_deals"\)|AWIN_AUTO_IMPORT_ENABLED\s*=/);
 assert.doesNotMatch(api,/fetch\(/);
});

test("global emergency stop and ingestion off halt private Awin staging, including mid-import",()=>{
 assert.match(worker,/activeOwnerAwinAttestation,evaluateSourceControls,sourceIngestionFailures/);
 assert.match(worker,/async function privateStagingAllowed/);
 assert.match(worker,/evaluateSourceControls\(data,!!error\)\.ingestion/);
 assert.match(worker,/if\(!preflight&&!?\(await privateStagingAllowed\(db\)\)\)/);
 const preflightReturn=worker.indexOf('if(preflight)return reply({status:"preflight_passed"');
 const writeGate=worker.indexOf('Private import stopped before database writes');
 const writeStart=worker.indexOf("const runFilename=");
 assert.ok(preflightReturn>=0&&writeGate>preflightReturn&&writeStart>writeGate);
 const chunkGate=worker.indexOf('Private import paused by global controls');
 const append=worker.indexOf('db.rpc("append_general_awin_feed_chunk"');
 const finishGate=worker.indexOf('Private import stopped before completion');
 const finish=worker.indexOf('db.rpc("finish_general_awin_feed_import"');
 assert.ok(chunkGate>writeStart&&chunkGate<append);
 assert.ok(finishGate>append&&finishGate<finish);
 assert.match(worker,/const safelyPaused=source\.status==="paused"&&source\.sync_enabled===false/);
 assert.match(worker,/const safelyActive=source\.status==="active"&&source\.sync_enabled===true/);
 assert.match(worker,/sourceIngestionFailures\(source/);
});

test("private pilot UI is request-bound and access-controlled before service-role reads",()=>{
 assert.match(page,/await connection\(\)/);
 assert.ok(page.indexOf("await requireControlCentreAccess()")<page.indexOf("createAdminClient()"));
 assert.match(page,/robots:\{index:false,follow:false\}/);
 assert.match(page,/\.eq\("merchant_id","77952"\)/);
 assert.match(page,/\.eq\("advertiser_id","77952"\)/);
 assert.match(page,/role==="owner"&&!dataError/);
 assert.doesNotMatch(page,/affiliate_url|published_deals/);
});

test("UI requires confirmed successful preflight before staging and never claims public release",()=>{
 assert.match(ui,/preflightPassed&&confirmed|!preflightPassed\|\|!confirmed/);
 assert.match(ui,/mode==="stage"/);
 assert.match(ui,/status==="preflight_passed"/);
 assert.match(ui,/does not approve or publish any offer/);
 assert.match(ui,/cache:"no-store"/);
 assert.match(read("app/control-centre/feed-imports/page.tsx"),/href="\/control-centre\/awin-pilot"/);
});
