import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const y=readFileSync(new URL("../.github/workflows/verified-merged-branch-cleanup.yml",import.meta.url),"utf8");

test("cleanup automatically considers only currently existing, merged PR heads since #127",()=>{
 assert.match(y,/branches: \[main\]/);
 assert.match(y,/workflow_dispatch:/);
 assert.match(y,/default: false/);
 assert.match(y,/context\.eventName === 'push'/);
 assert.match(y,/github\.rest\.repos\.listBranches/);
 assert.match(y,/liveNames\.has\(pr\.head\.ref\)/);
 assert.match(y,/pr\.number>=127 && pr\.merged_at/);
 assert.match(y,/pr\.base\.ref==='main'/);
 assert.match(y,/pr\.merged/);
});

test("pruning requires frozen head SHA and final reviewed commit, no reused or open PR branch",()=>{
 for(const pattern of [
  /sha !== pr\.head\.sha/,
  /pulls\.listCommits/,
  /commits\.at\(-1\)\.sha !== sha/,
  /sharedNameCounts\.get\(name\)/,
  /opened\.some/,
  /info\.protected/,
  /github\.rest\.git\.deleteRef/
 ])assert.match(y,pattern);
});
test("never prune main, original design sources, security refs or unverified changes",()=>{
 for(const pattern of [
  /name === 'main'/,
  /name === 'master'/,
  /name\.startsWith\('security\/'\)/,
  /design\/warm-premium-visual-system/,
  /feature\/warm-premium-experience/,
  /branch moved since merge/,
  /PR commit verification unavailable/,
  /branch protection check failed/
 ])assert.match(y,pattern);
 assert.doesNotMatch(y,/pull_request:\s*\n/);
 assert.doesNotMatch(y,/deleteRef\(\{[^}]*ref:'heads\/main'/);
});
