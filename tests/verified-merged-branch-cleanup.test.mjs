import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const y=readFileSync(new URL("../.github/workflows/verified-merged-branch-cleanup.yml",import.meta.url),"utf8");
test("cleanup is a strictly bounded batch of already merged PRs",()=>{
 assert.match(y,/Array\.from\(\{length: 16\}, \(_,i\) => i \+ 127\)/);
 assert.match(y,/pr\.merged/);
 assert.match(y,/pr\.head\.sha/);
 assert.match(y,/sha !== pr\.head\.sha/);
 assert.match(y,/opened\.some/);
 assert.match(y,/info\.protected/);
 assert.match(y,/pr\.base\.ref !== 'main'/);
 assert.match(y,/head\.repo\?\.full_name/);
 assert.match(y,/github\.rest\.git\.deleteRef/);
});
test("cleanup never operates on pull request code or the design archives",()=>{
 assert.match(y,/branches: \[main\]/);
 assert.match(y,/workflow_dispatch:/);
 assert.match(y,/default: false/);
 assert.match(y,/name === 'main'/);
 assert.match(y,/design\/warm-premium-visual-system/);
 assert.match(y,/feature\/warm-premium-experience/);
 assert.doesNotMatch(y,/pull_request:\s*\n/);
 assert.doesNotMatch(y,/deleteRef\(\{[^}]*ref:'heads\/main'/);
});
