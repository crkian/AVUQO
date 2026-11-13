import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const state=JSON.parse(read("docs/AVUQO_CURRENT_STATE.json"));
test("restart entrypoint and agent instructions point to live and machine-readable handovers",()=>{
 for(const p of ["AVUQO_START_HERE.md","README.md","AGENTS.md"]){
  const source=read(p);
  assert.match(source,/AVUQO_LIVE_HANDOVER\.md/);
  assert.match(source,/AVUQO_CURRENT_STATE\.json/);
  assert.match(source,/Vercel/i);
 }
});
test("machine-readable status is explicitly a dated snapshot and requires live verification",()=>{
 assert.equal(state.repo,"crkian/AVUQO");
 assert.equal(state.production.url,"https://www.avuqo.com");
 assert.equal(state.production.status,"verified_at_snapshot_not_live_poll");
 assert.equal(state.production.verified_ready_sha.length,40);
 assert.equal(state.production.platform,"Vercel");
 assert.ok(state.required_reverification.length>=4);
 assert.ok(state.open_prs_at_snapshot.includes(117));
 assert.ok(state.integrations.some(s=>s.id==="awin"&&/gated/i.test(s.commercial_status)));
 assert.ok(state.integrations.some(s=>s.id==="ebay"&&/unconfirmed/i.test(s.commercial_status)));
});
test("handover uses safe product and image publication boundaries",()=>{
 const text=read("docs/AVUQO_LIVE_HANDOVER.md");
 assert.match(text,/not a real-time status/i);
 assert.match(text,/image|licensed|rights/i);
 assert.match(text,/private/i);
 assert.match(text,/www\.avuqo\.com/);
 assert.match(text,/open PRs/i);
 assert.doesNotMatch(text,/pkce_[a-f0-9]{24,}|Bearer\s+[a-z0-9_-]{24,}/i);
});
