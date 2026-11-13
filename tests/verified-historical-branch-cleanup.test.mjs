import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const y=readFileSync(new URL("../.github/workflows/verified-historical-branch-cleanup.yml",import.meta.url),"utf8");
test("historical branch cleanup is bounded to verified merged PRs #1-126",()=>{
 for(const token of ["pr.number<=126","pr.merged_at","pr.base.ref==='main'","actualSha!==pr.head.sha","pulls.listCommits","commits.at(-1).sha!==actualSha","openNames.has(name)","prs.length!==1","info.data.protected","git.deleteRef"]){
  assert.ok(y.includes(token),"Missing hard safety gate: "+token);
 }
});
test("run only from trusted main and preserve original design and security sources",()=>{
 for(const token of ["branches: [main]","workflow_dispatch:","default: false","design/warm-premium-visual-system-20261105","feature/warm-premium-experience-v1-20261105","name.startsWith('security/')"])assert.ok(y.includes(token),token);
 assert.doesNotMatch(y,/pull_request:\s*\n/);
});
