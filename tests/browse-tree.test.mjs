import test from "node:test";
import assert from "node:assert/strict";
import {BROWSE_DEPARTMENTS,DEPARTMENT_GROUPS,departmentBySlug,departmentHref,topicHref} from "../lib/categories/browse-tree.ts";
test("every real taxonomy root has a curated department and unique route",()=>{
 assert.equal(BROWSE_DEPARTMENTS.length,25);
 const slugs=BROWSE_DEPARTMENTS.map(d=>d.slug);
 assert.equal(new Set(slugs).size,25);
 const hrefs=BROWSE_DEPARTMENTS.map(d=>departmentHref(d));
 assert.equal(new Set(hrefs).size,25);
 assert.equal(hrefs.every(h=>h.startsWith("/")&&!h.startsWith("//")),true);
});
test("groups cover departments exactly once and topic prompts are safe",()=>{
 const ids=DEPARTMENT_GROUPS.flatMap(g=>[...g.slugs]);
 assert.equal(ids.length,25);
 assert.equal(new Set(ids).size,25);
 for(const slug of ids)assert.ok(departmentBySlug(slug),slug);
 const topics=BROWSE_DEPARTMENTS.flatMap(d=>d.topics);
 assert.ok(topics.length>=120);
 for(const topic of topics){
  assert.ok(topic.length>=3);
  assert.match(topicHref(topic),/^\/search\?q=/);
 }
});
test("curated browse routes never promise availability or discounts",()=>{
 for(const d of BROWSE_DEPARTMENTS){
  assert.equal(/in stock now|guaranteed cheapest|save \d+%/i.test(d.intro),false);
  assert.ok(d.advice.length>=20);
 }
});
