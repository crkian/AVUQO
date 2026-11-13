import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("production audit covers actual public shopping, seasonal, tyre and account routes on desktop/mobile",()=>{
 const js=read("scripts/production-visual-audit.mjs");
 for(const p of ["/","/categories","/products","/sales","/black-friday","/easter","/valentines","/christmas","/travel","/groceries","/tyres","/tyres/find","/tyres/compare","/saved","/watches","/lists","/account"])
   assert.ok(js.includes('"' +p+'"'),"Missing route "+p);
 assert.match(js,/width:1440,height:900/);
 assert.match(js,/width:390,height:844/);
 assert.match(js,/overflowPx/);
 assert.match(js,/brokenImages/);
 assert.match(js,/report\.json/);
 assert.match(js,/report\.md/);
 assert.doesNotMatch(js,/\/control-centre\/|\/preview\/|cookies|Authorization|bearer/i);
});
test("audit is an isolated read-only weekly and on-demand CI capture",()=>{
 const yaml=read(".github/workflows/production-visual-audit.yml");
 assert.match(yaml,/workflow_dispatch:/);
 assert.match(yaml,/schedule:/);
 assert.match(yaml,/upload-artifact@/);
 assert.match(yaml,/npm install --no-save --no-package-lock --ignore-scripts puppeteer-core@/);
 assert.doesNotMatch(yaml,/secrets\.|VERCEL_TOKEN|supabase|deployment\s*:/i);
});
