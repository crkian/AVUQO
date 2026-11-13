import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {currentAvuqoHomeFact,homeCampaignsWithCurrentFacts} from "../lib/marketing/homepage-policy.ts";

const clock=new Date("2026-11-13T20:00:00.000Z");
const goodFact={id:"fact-1",brand_slug:"avuqo",status:"approved",expires_at:"2026-12-01T00:00:00.000Z"};
const placement={
 id:"placement-1",title:"Explore independently verified value",
 summary:"Useful, transparent guides for thoughtful everyday shopping.",
 cta_label:"Explore guides",href:"/discover",sponsored:false
};
const link={id:"placement-1",fact_id:"fact-1"};

test("homepage fact admission accepts only current, approved, AVUQO-specific evidence",()=>{
 assert.equal(currentAvuqoHomeFact(goodFact,clock),true);
 assert.equal(currentAvuqoHomeFact({...goodFact,expires_at:null},clock),true);
 for(const fact of [
  null,undefined,{...goodFact,status:"draft"},{...goodFact,status:"revoked"},
  {...goodFact,brand_slug:"cluedoku"},{...goodFact,expires_at:"garbage"},
  {...goodFact,expires_at:"2026-11-13T20:00:00.000Z"},
  {...goodFact,expires_at:"2026-11-12T00:00:00.000Z"}
 ])assert.equal(currentAvuqoHomeFact(fact,clock),false,JSON.stringify(fact));
});
test("public homepage drops orphaned, revoked, expired and cross-brand campaigns",()=>{
 const valid=homeCampaignsWithCurrentFacts([placement],[link],[goodFact],clock);
 assert.equal(valid.length,1);
 assert.deepEqual(valid[0],{
  id:"placement-1",title:placement.title,summary:placement.summary,
  ctaLabel:placement.cta_label,href:"/discover",sponsored:false
 });
 for(const links of [[],[{id:link.id,fact_id:"other"}]]) {
  assert.deepEqual(homeCampaignsWithCurrentFacts([placement],links,[goodFact],clock),[]);
 }
 for(const fact of [{...goodFact,status:"revoked"},{...goodFact,expires_at:clock.toISOString()},
                    {...goodFact,brand_slug:"fantasy-lockr"}]) {
  assert.deepEqual(homeCampaignsWithCurrentFacts([placement],[link],[fact],clock),[]);
 }
 assert.deepEqual(homeCampaignsWithCurrentFacts([placement],[link],[],clock),[]);
});
test("public homepage rejects unsafe links even with approved evidence",()=>{
 assert.deepEqual(homeCampaignsWithCurrentFacts(
  [{...placement,href:"https://bad.example"}],[link],[goodFact],clock),[]);
 assert.deepEqual(homeCampaignsWithCurrentFacts(
  [{...placement,href:"//bad.example"}],[link],[goodFact],clock),[]);
 assert.deepEqual(homeCampaignsWithCurrentFacts(
  [{...placement,id:null}],[link],[goodFact],clock),[]);
});
test("public display retains anonymous column-limited RLS and checks private evidence only server-side",()=>{
 const src=readFileSync(new URL("../lib/marketing/homepage.ts",import.meta.url),"utf8");
 const migration=readFileSync(new URL("../supabase/migrations/20261029220000_marketing_homepage_public_column_least_privilege.sql",import.meta.url),"utf8");
 assert.match(src,/createClient\(\)/);
 assert.match(src,/createAdminClient\(\)/);
 assert.match(src,/\.select\("id,title,summary,cta_label,href,sponsored"\)/);
 assert.match(src,/\.select\("id,fact_id"\)/);
 assert.match(src,/\.select\("id,brand_slug,status,expires_at"\)/);
 assert.match(src,/homeCampaignsWithCurrentFacts\(data,links,facts,new Date\(now\)\)/);
 const publicPart=src.slice(0,src.indexOf("const admin=createAdminClient()"));
 assert.doesNotMatch(publicPart,/\.select\("[^"]*fact_id/);
 assert.doesNotMatch(migration,/grant select \([^)]*fact_id/i);
 assert.doesNotMatch(src,/\.insert\(|\.update\(|\.delete\(/);
});
test("owner approval and resumption both recheck current source claims",()=>{
 const actions=readFileSync(new URL("../app/control-centre/marketing/campaign-actions.ts",import.meta.url),"utf8");
 const page=readFileSync(new URL("../app/control-centre/marketing/page.tsx",import.meta.url),"utf8");
 assert.match(actions,/approving=action==="approve"&&place\.status==="draft"/);
 assert.match(actions,/resuming=action==="resume"&&place\.status==="paused"/);
 assert.match(actions,/if\(approving\|\|resuming\)/);
 assert.match(actions,/currentAvuqoHomeFact\(fact,new Date\(\)\)/);
 assert.match(page,/currentHomepageFacts=approvedFacts\.filter/);
 assert.match(page,/disabled=\{!isOwner\|\|!currentHomepageFacts.length\}/);
});
