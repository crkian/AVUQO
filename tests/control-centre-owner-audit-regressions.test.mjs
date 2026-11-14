import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const route=readFileSync(new URL("../app/control-centre/content/pages/page.tsx",import.meta.url),"utf8");
const atlas=readFileSync(new URL("../app/control-centre/source-atlas/page.tsx",import.meta.url),"utf8");
const marketplace=readFileSync(new URL("../app/control-centre/marketplace/page.tsx",import.meta.url),"utf8");
const feedUpdates=readFileSync(new URL("../app/control-centre/awin-feed-updates/page.tsx",import.meta.url),"utf8");

test("public editor renders only after dynamic request boundary and verified role",()=>{
 assert.match(route,/import\s*\{connection\}\s*from\s*"next\/server"/);
 assert.match(route,/export const instant=false/);
 const start=route.indexOf("export default async function Editor");
 const content=route.slice(start);
 const indices=["await connection()","await requireControlCentreAccess()","await searchParams","await createClient()"];
 let last=-1;
 for(const item of indices){
  const i=content.indexOf(item);
  assert.ok(i>last,`Expected ${item} after prior request gate`);
  last=i;
 }
 assert.match(route,/role==="owner"&&<form action=\{publishEditorial\}/);
 assert.match(route,/form action=\{saveEditorial\}/);
});

test("Awin observation counts use role-checked server admin client after owner/admin guard",()=>{
 for(const [name,source] of [["Marketplace",marketplace],["Source Atlas",atlas]]){
  assert.match(source,/requireControlCentreAccess/,`${name}: role gate`);
  assert.match(source,/createAdminClient/,`${name}: server-only private data`);
  assert.match(source,/\.from\("awin_feed_update_observations"\)/,`${name}: observation source`);
  const guard=source.indexOf("await requireControlCentreAccess()");
  const admin=source.indexOf("createAdminClient()",guard);
  assert.ok(guard>=0&&admin>guard,`${name}: privileged query must be after auth`);
  assert.doesNotMatch(source,/grant\s+select|create policy|service_role.*NEXT_PUBLIC_/i);
 }
 assert.match(feedUpdates,/await requireControlCentreAccess\(\)/);
 assert.match(feedUpdates,/createAdminClient/);
});

test("editor changes neither roles nor publishing workflow implementation",()=>{
 assert.doesNotMatch(route,/service_role|NEXT_PUBLIC_SUPABASE_SERVICE/);
 assert.doesNotMatch(route,/\.rpc\("publish_editorial"/);
 assert.doesNotMatch(route,/Date\.now\(/);
});
