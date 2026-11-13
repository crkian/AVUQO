import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("read-only preflight is owner-authenticated and checks live private dependencies",()=>{
 const api=read("app/api/control-centre/tyre-spec-enrichment/route.ts");
 assert.ok(api.indexOf('role?.role!=="owner"')>=0);
 assert.ok(api.indexOf('role?.role!=="owner"')<api.indexOf('action==="automation_preflight"'));
 assert.match(api,/action==="automation_preflight"/);
 assert.match(api,/from\("awin_tyres_spec_enrichment_jobs"\)/);
 assert.match(api,/\.select\("id",\{head:true,count:"exact"\}\)/);
 assert.match(api,/storage\.getBucket\("awin-bulk-private-snapshots"\)/);
 assert.match(api,/bucket\.public===false/);
 assert.match(api,/source\.status!=="paused"/);
 assert.match(api,/source\.sync_enabled!==false/);
 assert.match(api,/joinedInSource\(source\.metadata,"12715"\)/);
 assert.match(api,/ready_to_enable:false/);
 assert.match(api,/no_database_writes:true/);
 assert.match(api,/merchant_publication_rights_verified:false/);
 const section=api.slice(api.indexOf('if(action==="automation_preflight")'),api.indexOf('if(action==="status")'));
 for(const operation of [".insert(",".update(",".upsert(",".delete(",".rpc(","fetch(",".upload(",".download("])
  assert.equal(section.includes(operation),false,"Preflight must not perform "+operation);
});
test("owner UI makes preflight visible without enabling automatic mode",()=>{
 const form=read("app/control-centre/tyre-spec-enrichment/TyreEnrichmentForm.tsx");
 assert.match(form,/action:"automation_preflight"/);
 assert.match(form,/Check automatic worker prerequisites \(read-only\)/);
 assert.match(form,/Not approved to enable/);
 assert.match(form,/preflight\.blockers\.map/);
 const vercel=read("vercel.json");
 assert.doesNotMatch(vercel,/awin-tyre-auto-enrich/);
});
