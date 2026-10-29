import assert from "node:assert/strict";
import test from "node:test";
import { isBrandSlug, reviewDraft, normaliseCaption, evergreenCaption } from "../lib/marketing/policy.ts";

const post = {
  brand_slug: "avuqo", kind: "social", platform: "facebook",
  caption: "Find genuine product savings with approved comparisons.",
  source_fact_id: "fact-a"
};
const fact = {
  id: "fact-a", brand_slug: "avuqo", status: "approved",
  claim: "AVUQO compares products.", expires_at: null
};
test("only the four approved workspaces exist", () => {
  assert.equal(isBrandSlug("avuqo"), true);
  assert.equal(isBrandSlug("cluedoku"), true);
  assert.equal(isBrandSlug("other"), false);
});
test("approved same-brand evidence passes content review, never authorizes publication", () => {
  assert.deepEqual(reviewDraft(post, fact, []), {ok:true,reasons:[]});
});
test("cross-brand facts are not accepted", () => {
  assert.equal(reviewDraft(post, {...fact,brand_slug:"cluedoku"}, []).ok,false);
});
test("missing and unapproved facts are blocked", () => {
  assert.equal(reviewDraft(post, null, []).ok,false);
  assert.equal(reviewDraft(post, {...fact,status:"draft"}, []).ok,false);
});
test("expired fact is blocked", () => {
  assert.equal(reviewDraft(post, {...fact,expires_at:"2020-01-01T00:00:00Z"}, []).ok,false);
});
test("Fantasy Lockr result and deadline claims are prohibited", () => {
  const p = {...post,brand_slug:"fantasy-lockr",caption:"Today's fixture results are now live"};
  assert.equal(reviewDraft(p, {...fact,brand_slug:"fantasy-lockr"}, []).ok,false);
});
test("duplicate captions with changed punctuation are blocked", () => {
  assert.equal(reviewDraft(post, fact, ["Find genuine product savings with approved comparisons!"]).ok,false);
  assert.equal(normaliseCaption(" Great - Deal!"),"great deal");
});
test("website articles cannot be social posts", () => {
  assert.equal(reviewDraft({...post,kind:"website_article"}, fact, []).ok,false);
});
test("evergreen template only restates approved brand fact", () => {
  assert.match(evergreenCaption(fact, "AVUQO"), /AVUQO compares products/);
});
