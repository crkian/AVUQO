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

test("new canonical Git handover and machine backlog cover all live/private feed operations",()=>{
 const md=read("docs/AVUQO_ACTIVE_HANDOVER.md");
 const machine=JSON.parse(read("docs/AVUQO_ACTIVE_HANDOVER.json"));
 assert.equal(machine.project,"AVUQO");
 assert.match(machine.as_of_utc,/^\\d{4}-\\d{2}-\\d{2}$/);
 assert.ok(machine.as_of_utc>="2026-11-16", "latest snapshot must not predate 16 November");
 assert.ok(machine.unified_master_checkpoint_20261117, "full-current master handover checkpoint missing");
 assert.equal(machine.handover.current,"docs/AVUQO_ACTIVE_HANDOVER.md");
 assert.match(machine.production.ready_app_commit,/^[a-f0-9]{40}$/);
 assert.equal(machine.supabase.public_awin_offers,0);
 assert.equal(machine.supabase.products.awin_canonical,251);
 assert.equal(machine.merchants.length,6);
 assert.equal(machine.open_prs_as_checked.length,7);
 assert.ok(machine.priorities.length>=20);
 const crons=JSON.parse(read("vercel.json")).crons;
 assert.equal(machine.schedules_utc.length,crons.length);
 assert.deepEqual(new Set(machine.schedules_utc.map(x=>x.path)),new Set(crons.map(x=>x.path)));
 for(const p of ["README.md","AVUQO_START_HERE.md","AGENTS.md",
  "docs/AVUQO_LIVE_HANDOVER.md","docs/AVUQO_PROJECT_COMPASS.md",
  "docs/PROJECT_STATUS.md","docs/ROADMAP.md"])
  assert.ok(read(p).includes("AVUQO_ACTIVE_HANDOVER.md"),p);
 for(const s of ["Tooled Up","Mozillion","Cadbury","Craft Buddy",
  "Petlibro","Tyres UK","Required handover procedure","GitHub PRs"])
  assert.ok(md.includes(s),s);
 assert.match(read("scripts/check-project-register.mjs"),/docs\/AVUQO_ACTIVE_HANDOVER\.json/);
 assert.doesNotMatch(md,/Bearer\s+[a-z0-9_-]{24,}|pkce_[a-f0-9]{24,}/i);
});
