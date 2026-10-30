import test from "node:test";
import assert from "node:assert/strict";
import {CATEGORY_STORIES,publicLifestyleSlugs,storySearchHref} from "../lib/lifestyle/category-story.ts";
test("ten routed lifestyle categories have distinctive, meaningful edits",()=>{
 assert.equal(publicLifestyleSlugs.length,10);
 assert.equal(new Set(Object.values(CATEGORY_STORIES).map(s=>s.featuredTitle)).size,10);
 assert.equal(new Set(Object.values(CATEGORY_STORIES).map(s=>s.searchPlaceholder)).size,10);
});
test("each destination has three distinct, safe search prompts",()=>{
 for(const [slug,story] of Object.entries(CATEGORY_STORIES)){
  assert.equal(slug,story.slug);
  assert.equal(story.moments.length,3);
  for(const moment of story.moments){
   assert.ok(moment.title.length>=7);
   assert.match(storySearchHref(moment.query),/^\/search\?q=/);
   assert.ok(!moment.query.startsWith("https:"));
  }
 }
});
test("category content does not invent discounts or merchant availability",()=>{
 for(const story of Object.values(CATEGORY_STORIES)){
  assert.equal(/save\s+\d+%|in stock now|free delivery|guaranteed cheapest/i.test(story.featuredCopy),false);
 }
});
