import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");
const api=read("app/api/control-centre/awin-run-now/route.ts");
const page=read("app/control-centre/awin-feed-updates/page.tsx");
const ui=read("app/control-centre/awin-feed-updates/OwnerAwinRunNow.tsx");
const worker=read("app/api/internal/awin-auto-import/route.ts");
test("run now checks signed-in unique owner and same origin before server cron secret",()=>{
 assert.ok(api.indexOf("db.auth.getUser()")>=0);
 assert.ok(api.indexOf('role?.role!=="owner"')>api.indexOf("db.auth.getUser()"));
 assert.ok(api.indexOf("process.env.CRON_SECRET")>api.indexOf('role?.role!=="owner"'));
 assert.match(api,/!origin\|\|new URL\(origin\)\.origin!==new URL\(request\.url\)\.origin/);
 assert.match(api,/Object\.keys\(body\)\.some\(key=>!\["task","confirm"\]/);
 assert.match(api,/"private-only-"\+task/);
});
test("allowlist of four exact physical feeds and Tooled Up immutable digest",()=>{
 for(const pair of ['petlibro:["77952","103580"]','mozillion:["31539","74135"]','cadbury:["736","48599"]','craftbuddy:["45747","F1356"]'])assert.ok(api.includes(pair));
 assert.match(api,/newestRecentTooledUpSnapshot\(data\)/);
 assert.match(api,/snapshot_sha256:latest\.snapshot_sha256/);
 assert.match(api,/private-only-/);
 assert.match(api,/captureMaster\(new NextRequest/);
 assert.match(api,/validateMaster\(new NextRequest/);
 assert.doesNotMatch(api,/\.from\("offers"\)|\.from\("products"\)|recordPrivateCronAttempt/);
});
test("owner UI shows scheduled journal but does not activate public sources or record manual as cron",()=>{
 assert.match(page,/role==="owner"&&<OwnerAwinRunNow/);
 assert.match(page,/awin_private_cron_attempts/);
 assert.match(ui,/Stage privately/);
 assert.match(worker,/source\.status!=="paused"\|\|source\.sync_enabled!==false/);
 assert.match(worker,/privateStagingAllowed\(db\)/);
 assert.doesNotMatch(api,/\b(setSourceStatus|activateOffer|publishOffer)\b/);
});
