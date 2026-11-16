import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");
const m=JSON.parse(read("docs/AVUQO_GIT_BRANCH_SOURCE_FEATURE_TRACKER_2026-11-16.json"));
const text=read("docs/AVUQO_GIT_BRANCH_SOURCE_FEATURE_TRACKER_2026-11-16.md");
test("dated live branch inventory is exhaustive, non-destructive and open PR aware",()=>{
 assert.equal(m.repo,"crkian/AVUQO");
 assert.equal(m.branch_inventory.total,25);
 assert.equal(m.branch_inventory.branches.length,25);
 const all=new Set(m.branch_inventory.branches.map(b=>b.name));
 assert.equal(all.size,25);
 assert.ok(all.has("main"));
 assert.equal(m.branch_inventory.branches.filter(b=>b.group==="open_pr").length,7);
 assert.equal(m.branch_inventory.branches.filter(b=>b.group==="security").length,2);
 assert.equal(m.branch_inventory.branches.filter(b=>b.group==="historical").length,15);
 assert.ok(m.branch_inventory.branches.every(b=>b.deleted===false));
 assert.ok(m.branch_inventory.branches.filter(b=>b.name!=="main").every(b=>b.ahead>0&&b.behind>0));
 assert.ok(text.includes("No branch was deleted"));
 for(const name of all)assert.ok(text.includes(name),name);
});
test("actual source file hashes and all feature groups are preserved separately from code status",()=>{
 assert.equal(m.sources.length,14);
 assert.equal(m.feature_requirements.length,37);
 const ids=new Set(m.sources.map(s=>s.id));
 for(const s of m.sources){
  assert.match(s.sha256,/^[a-f0-9]{64}$/);
  assert.ok(s.source_inspected_2026_11_16);
  assert.equal(s.raw_source_in_public_git,false);
 }
 for(const f of m.feature_requirements){
  assert.match(f.id,/^F\d\d$/);
  assert.ok(f.source.every(id=>ids.has(id)));
  assert.ok(f.status!=="live_complete");
 }
 assert.ok(m.startup_artifacts.some(x=>x.path==="AVUQO_SUPABASE_RESET_AND_SETUP.sql"&&x.action==="NEVER_RUN_ON_PRODUCTION"));
 assert.equal(m.awin_finish.private_canonical_awin_products,251);
 assert.match(read("docs/AVUQO_AWIN_COMPLETION_BOARD_2026-11-16.md"),/public Awin offers/);
 assert.match(read("scripts/check-project-register.mjs"),/docs\/AVUQO_GIT_BRANCH_SOURCE_FEATURE_TRACKER_2026-11-16\.json/);
});
