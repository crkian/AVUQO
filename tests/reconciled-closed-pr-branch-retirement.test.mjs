import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";

const read=path=>readFileSync(new URL("../"+path,import.meta.url));
const script=read(".github/workflows/reconciled-closed-pr-branch-retirement.yml").toString();
const ledger=read("docs/CLOSED_LEGACY_BRANCH_RECONCILIATION_2026-11-14.md").toString();
const blobHash=buffer=>createHash("sha1").update(
 Buffer.concat([Buffer.from("blob "+buffer.length+"\0"),buffer])
).digest("hex");

test("manual dispatch defaults to dry run, auto attempt only on checked-in main workflow change",()=>{
 assert.match(script,/branches: \[main\]/);
 assert.match(script,/reconciled-closed-pr-branch-retirement\.yml/);
 assert.match(script,/workflow_dispatch:/);
 assert.match(script,/default: false/);
 assert.match(script,/context\.eventName==='push'/);
 assert.doesNotMatch(script,/pull_request:\s*\n/);
});

test("only three individually reviewed closed but NOT merged PR heads are in retirement allowlist",()=>{
 for(const [num,branch,sha] of [
  [50,"fix/awin-cadbury-feed-error-safety-20261104","a5e7e7b11c0bcb93275da0374b940dc7ed24884c"],
  [51,"docs/awin-cadbury-petlibro-terms-review-20261104","845dcee1c3b91007a02d915a36367253c9e14d5f"],
  [85,"docs/price-availability-ebay-seo-20261105","d513679c2ac41300f934e0624b8e2285546b4245"]
 ]){
  assert.ok(script.includes("number:"+num));
  assert.ok(script.includes("name:'"+branch+"'"));
  assert.ok(script.includes("expectedHead:'"+sha+"'"));
  assert.ok(ledger.includes(branch));
 }
 assert.equal((script.match(/expectedHead:'[a-f0-9]{40}'/g)||[]).length,3);
 assert.match(script,/pr\.state!=='closed'/);
 assert.match(script,/pr\.merged\|\|pr\.merged_at/);
 assert.match(script,/pr\.head\.sha!==expectedHead/);
 assert.match(script,/commits\.at\(-1\)\.sha!==expectedHead/);
});

test("current preserved files match frozen reviewed blobs and include critical safety content",()=>{
 for(const [path,sha] of [
  ["lib/connectors/awin.ts","b04751fd8bdc0afbcbc1e7a2120f274c81a4d910"],
  ["docs/AWIN_CADBURY_PETLIBRO_TERMS_REVIEW_2026-11-04.md","711273ba18f911f437c3257fa91c697731488781"],
  ["docs/PRICE_AVAILABILITY_EBAY_SEO_REQUIREMENTS_2026-11-05.md","677e9daaf46dcf791e8fc4adc389cfec23b94411"]
 ]){
  assert.equal(blobHash(read(path)),sha,path);
  assert.ok(script.includes("preservedBlob:'"+sha+"'"));
 }
 assert.match(read("lib/connectors/awin.ts").toString(),/Awin feed request failed \(HTTP \$/);
 assert.match(ledger,/publication rights still NOT confirmed/i);
 assert.match(ledger,/documentation only/i);
});

test("all ambiguous or moved refs remain untouched and all failures are logged",()=>{
 for(const part of [
  "sharedNameCounts","allPRs.filter","opened.some","pr.base.ref!=='main'",
  "headSha!==expectedHead","branch moved since review",
  "reviewed commit verification unavailable",
  "preservedBlob","ledger.data.content",
  "info.data.protected","name.startsWith('security/')",
  "name.startsWith('design/')","recheck.data.object.sha!==expectedHead",
  "github.rest.git.deleteRef","default: false"
 ]) assert.ok(script.includes(part),part);
 assert.doesNotMatch(script,/deleteRef\(\{[^}]*ref:'heads\/main'/);
});
