import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {compareLegacyPneusRow} from "../lib/awin/pneus-compact-shadow.mjs";
import {preparePneusPrivateBatch} from "../lib/awin/pneus-online-private.ts";
const header=["merchant_id","merchant_product_id","product_name","search_price","in_stock","aw_deep_link"];
const [row]=preparePneusPrivateBatch("15236","26513",header,[["15236","001","Synthetic tyre","89.90","1","https://www.awin1.com/pclick.php?m=15236&a=3135746&p=123"]]);
test("legacy parity tolerates only decimal transport differences and JSON key order",()=>{
 assert.equal(compareLegacyPneusRow(row,{...row,price:89.9}),true);
 assert.equal(compareLegacyPneusRow(row,{...row,price:89.91}),false);
 assert.equal(compareLegacyPneusRow(row,{...row,currency:"GBP"}),false);
 assert.equal(compareLegacyPneusRow(row,{...row,metadata:{...row.metadata,release_approved:true}}),false);
 assert.equal(compareLegacyPneusRow(row,{...row,metadata:{...row.metadata,extra:"historical drift"}}),false);
});
test("owner replay route is fixed scope, bounded, read only and rights gated",()=>{
 const owner=readFileSync("app/api/control-centre/pneus-snapshot-recovery/route.ts","utf8");
 const s=readFileSync("lib/awin/pneus-snapshot-recovery.ts","utf8");
 assert.match(owner,/role\?\.role!=="owner"/);
 assert.ok(owner.indexOf("role?.role!==")<owner.indexOf("return await recoverPneusSnapshot(slot)"));
 assert.match(owner,/request\.headers\.get\("origin"\)!==url\.origin/);
 assert.match(s,/\.eq\("advertiser_id","15236"\)\.eq\("feed_id","26513"\)\.eq\("state","completed"\)/);
 assert.match(s,/job\.snapshot_object_key!==pneusPrivateObjectKey/);
 assert.match(s,/journal\.source_digest!==job\.snapshot_sha256/);
 assert.match(s,/job\.validated_total>25000/);
 assert.match(s,/await permitted\(db\)/);
 assert.match(s,/compareLegacyPneusRow\(restorePneusRow/);
 assert.match(s,/retention_authorized:false/);
 assert.doesNotMatch(s,/\.(insert|update|delete|upsert|upload|rpc)\(/);
 assert.doesNotMatch(owner,/export async function GET/);
});

test("scheduled recovery is fixed scope, authenticated, read-only and daily",()=>{
 const cron=readFileSync("app/api/internal/awin-pneus-archive-audit/route.ts","utf8");
 assert.match(cron,/CRON_SECRET/);
 assert.match(cron,/AWIN_AUTO_IMPORT_ENABLED/);
 assert.ok(cron.indexOf('request.headers.get("authorization")')<cron.indexOf('recoverPneusSnapshot("latest")'));
 assert.doesNotMatch(cron,/\.from\(|\.rpc\(|\.upload\(/);
 const config=JSON.parse(readFileSync("vercel.json","utf8"));
 assert.deepEqual(config.crons.filter(x=>x.path==="/api/internal/awin-pneus-archive-audit"),[{path:"/api/internal/awin-pneus-archive-audit",schedule:"23 14 * * *"}]);
});
