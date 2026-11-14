import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const json=JSON.parse(read("docs/AVUQO_COMPLETE_GIT_BRANCH_IDEA_HANDOVER_INDEX_2026-11-14.json"));
const md=read("docs/AVUQO_COMPLETE_GIT_BRANCH_IDEA_HANDOVER_INDEX_2026-11-14.md");
const manifest=read("docs/SOURCE_MANIFEST_2026-11-02.md");
const branchGroups=json.branch_inventory.groups;
const allBranches=Object.values(branchGroups).flat();

test("source register retains original nine SHA-256 records without committing confidential source assets",()=>{
 assert.equal(json.repository,"crkian/AVUQO");
 assert.equal(json.repository_visibility,"public");
 assert.equal(json.source_manifest.length,9);
 for(const s of json.source_manifest){
  assert.match(s.sha256,/^[a-f0-9]{64}$/);
  assert.ok(manifest.includes(s.sha256),"Owner source hash missing from original manifest: "+s.id);
  assert.ok(md.includes("**"+s.id+"**"),"Source absent in navigable index: "+s.id);
  assert.equal(s.original_file_in_public_git,false);
 }
 assert.match(md,/confidential/i);
 assert.match(md,/not automatically copied/i);
});
test("all 22 observed branch names are unique, classified and discoverable, without claiming they are merged",()=>{
 assert.equal(json.branch_inventory.counts.total,22);
 assert.deepEqual(Object.fromEntries(Object.entries(branchGroups).map(([k,v])=>[k,v.length])),
  {main:1,open_pr:5,security_reference:2,historical_divergent:14});
 assert.equal(new Set(allBranches).size,22);
 assert.deepEqual(branchGroups.main,["main"]);
 for(const name of allBranches)assert.ok(md.includes(name),"Missing historical branch: "+name);
 assert.deepEqual(json.branch_inventory.open_prs,[25,83,93,117,158]);
 for(const pr of json.branch_inventory.open_prs)assert.ok(md.includes("[#"+pr+"]"));
 assert.match(md,/DO NOT MERGE WHOLESALE/);
 assert.match(md,/not applied/);
});
test("all 29 P0-P4 roadmap ideas and 12 detailed gaps remain discoverable",()=>{
 assert.equal(json.roadmap_workstreams.length,29);
 assert.equal(new Set(json.roadmap_workstreams.map(w=>w.id)).size,29);
 for(const item of json.roadmap_workstreams){
  assert.ok(md.includes(item.id),"Workstream missing from master index: "+item.id);
  assert.ok(read("docs/ROADMAP.md").includes(item.id),"Workstream missing from living roadmap: "+item.id);
  assert.equal(item.liveness,"requires_current_evidence");
 }
 assert.equal(json.granular_requirement_gaps.length,12);
 const gapDocument=read("docs/SOURCE_REQUIREMENT_GAPS_2026-11-02.md");
 for(const id of json.granular_requirement_gaps){
  assert.ok(md.includes(id),id);
  assert.ok(gapDocument.includes(id),id);
 }
});
test("new agents find source authority and honest release boundaries",()=>{
 const link="AVUQO_COMPLETE_GIT_BRANCH_IDEA_HANDOVER_INDEX_2026-11-14.md";
 for(const path of ["README.md","AVUQO_START_HERE.md","AGENTS.md","docs/AVUQO_LIVE_HANDOVER.md",
                    "docs/PROJECT_STATUS.md","docs/ROADMAP.md","docs/AVUQO_PROJECT_COMPASS.md"]){
  assert.ok(read(path).includes(link),"Missing index link in "+path);
 }
 for(const text of ["Awin source","Tyres UK","Groceries","Original","public repository"]){
  assert.ok(md.toLowerCase().includes(text.toLowerCase()),"Missing key safeguarding dimension "+text);
 }
 assert.match(md,/not.*proof.*(completed|running|live)/is);
});
