import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
test("scheduled Awin metadata monitor is explicitly opt-in and cron-authenticated",()=>{
 const s=readFileSync("app/api/internal/awin-feed-check/route.ts","utf8");
 assert.ok(s.indexOf("CRON_SECRET")<s.indexOf("AWIN_DATAFEED_API_KEY"));
 assert.match(s,/AWIN_FEED_MONITOR_ENABLED/);
 assert.match(s,/productdata\.awin\.com\/datafeed\/list\/apikey/);
 assert.match(s,/redirect:"error"/);
 assert.match(s,/readLimitedCsv/);
 assert.match(s,/AbortController/);
 assert.match(s,/joinedAwinAdvertisers/);
 assert.match(s,/inspectAwinFeedList/);
 assert.match(s,/record_awin_feed_discovery/);
 assert.match(s,/no_product_downloads:true/);
 assert.doesNotMatch(s,/console\.(log|error)/);
});
test("private update table has service role access only, without feed URLs",()=>{
 const s=readFileSync("supabase/migrations/20261104190000_awin_feed_update_discovery.sql","utf8");
 assert.match(s,/enable row level security/g);
 assert.match(s,/revoke all on public\.awin_feed_update_observations from public,anon,authenticated/);
 assert.match(s,/grant execute on function public\.record_awin_feed_discovery\(jsonb,integer\) to service_role/);
 assert.doesNotMatch(s,/download_url|signed_url|api_key|affiliate_link/);
 assert.match(s,/last_imported_source/);
 assert.match(s,/needs_private_refresh/);
});
test("cron schedule is once per day and monitor has a private viewer",()=>{
 const config=JSON.parse(readFileSync("vercel.json","utf8"));
 assert.ok(config.crons.some(c=>c.path==="/api/internal/awin-feed-check"&&c.schedule==="17 6 * * *"));
 const view=readFileSync("app/control-centre/awin-feed-updates/page.tsx","utf8");
 assert.ok(view.indexOf("requireControlCentreAccess()")<view.indexOf("createAdminClient()"));
 assert.match(view,/robots:\{index:false,follow:false\}/);
 assert.match(view,/No automatic feed checks have been recorded/);
});

test("empty Awin inventories never record a successful check and POST needs an explicit import mode",()=>{
 const monitor=readFileSync("app/api/internal/awin-feed-check/route.ts","utf8");
 assert.ok(monitor.indexOf("report.rowsInspected===0||report.feeds.length===0")>0);
 assert.ok(monitor.indexOf("report.feeds.length===0")<monitor.indexOf('admin.rpc("record_awin_feed_discovery"'));
 const importer=readFileSync("app/api/internal/awin-auto-import/route.ts","utf8");
 assert.ok(importer.indexOf('request.method==="POST"&&!preflight&&!manualStage')>0);
 assert.ok(importer.indexOf('request.method==="POST"&&!preflight&&!manualStage')<importer.indexOf("await getInventory"));
});

test("private automatic import setup can recover after a failed session insert without replacing data",()=>{
 const s=readFileSync("app/api/internal/awin-auto-import/route.ts","utf8");
 const setup=s.slice(s.indexOf("const runFields="),s.indexOf("let committed=session.committed_count"));
 assert.match(setup,/onConflict:"id",ignoreDuplicates:true/);
 assert.match(setup,/onConflict:"import_id",ignoreDuplicates:true/);
 assert.match(setup,/run\.created_by!==ownerId/);
 assert.match(setup,/run\.permission_status!=="unverified"/);
 assert.match(setup,/records\.length>0/);
 assert.ok(setup.indexOf("session.source_digest!==digest")<setup.indexOf('status:"already_staged"'));
 assert.match(setup,/session\.committed_count===rows\.length/);
 assert.doesNotMatch(setup,/\.delete\(|\.update\(\{/);
});
