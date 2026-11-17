import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const worker=readFileSync("app/api/internal/awin-portfolio-private-rotation/route.ts","utf8");
const owner=readFileSync("app/api/control-centre/awin-run-now/route.ts","utf8");
const ui=readFileSync("app/control-centre/awin-feed-updates/OwnerAwinRunNow.tsx","utf8");
const cron=JSON.parse(readFileSync("vercel.json","utf8"));
test("scheduled private cohort only selects observed accepted physical retail feeds",()=>{
 assert.match(worker,/process\.env\.CRON_SECRET/);
 assert.match(worker,/authorization/);
 assert.match(worker,/\.from\("affiliate_programs"\)/);
 assert.match(worker,/membership_status==="accepted"/);
 assert.match(worker,/\.from\("awin_feed_update_observations"\)/);
 assert.match(worker,/freshCutoff=now-48\*3600_000/);
 assert.match(worker,/Number\(o\.listed_products\)<=5000/);
 for(const pair of ["101445","77952","45747","736","31539"])assert.ok(worker.includes(pair));
 for(const restricted of ["12715","15236","3496","128157","118401"])
  assert.doesNotMatch(worker,new RegExp('advertiser:"'+restricted+'"'));
 assert.match(worker,/source\.status!=="paused"/);
 assert.match(worker,/source\.sync_enabled!==false/);
 assert.match(worker,/global_emergency_stop/);
 assert.match(worker,/source_ingestion/);
});
test("rotator delegates to strict existing importer and cannot claim first publication",()=>{
 assert.match(worker,/POST as runPrivateImport/);
 assert.match(worker,/url\.searchParams\.set\("mode","stage"\)/);
 assert.match(worker,/runPrivateImport\(new NextRequest/);
 assert.match(worker,/Math\.floor\(now\/86400000\)\+offset\)\%available\.length/);
 assert.match(worker,/offsetString!==null/);
 assert.match(worker,/Invalid rotation offset/);
 assert.match(worker,/private_only:true,no_publication:true/);
 assert.doesNotMatch(worker,/\.from\("offers"\)|\.from\("published_deals"\)|\.update\(\{/);
});
test("existing owner-protected Run Now can invoke rotation without accepting raw signed feed URLs",()=>{
 assert.match(owner,/isPortfolio=task==="portfolio_stage_next"/);
 assert.match(owner,/return sanitized\(runPortfolioRotation/);
 assert.match(owner,/role\?\.role!=="owner"/);
 assert.match(owner,/Same origin required/);
 assert.match(ui,/Try another accepted retail feed/);
 assert.match(ui,/setRotationStep\(v=>\(v\+1\)%9\)/);
 assert.match(owner,/url\.searchParams\.set\("offset",String\(step\)\)/);
 assert.match(owner,/Number\.isSafeInteger\(step\)/);
 assert.match(ui,/advertiser .* \/ feed /);
 assert.match(ui,/private-only-/);
 assert.match(ui,/control-centre\/tyres/);
 assert.ok(cron.crons.some(x=>x.path==="/api/internal/awin-portfolio-private-rotation"&&x.schedule==="53 10 * * *"));
});
