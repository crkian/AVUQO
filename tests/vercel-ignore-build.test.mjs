import test from "node:test";
import assert from "node:assert/strict";
import {canSkip,decision} from "../scripts/vercel-ignore-build.mjs";
const base="a".repeat(40);
test("explicit handover and workflow only",()=>assert.equal(canSkip(["docs/AVUQO_ACTIVE_HANDOVER.md",".github/workflows/quality.yml"]),true));
test("runtime register inputs never skipped",()=>{for(const p of ["docs/AVUQO_ACTIVE_HANDOVER.json","docs/AVUQO_GIT_BRANCH_SOURCE_FEATURE_TRACKER_2026-11-16.json","app/control-centre/development-register/page.tsx","vercel.json","package-lock.json","supabase/migrations/example.sql","unknown.md"])assert.equal(canSkip(["README.md",p]),false)});
test("unknown baseline and git errors build",()=>{assert.equal(decision(undefined),1);assert.equal(decision("HEAD^"),1);assert.equal(decision(base,()=>({status:1})),1);assert.equal(decision(base,()=>{throw Error("missing")}),1)});
test("full baseline range and rename sides",()=>{const calls=[];const run=args=>{calls.push(args);return {status:0,stdout:args[0]==="diff"?"README.md\0app/page.tsx\0":""}};assert.equal(decision(base,run),1);assert.deepEqual(calls[1],["diff","--name-only","--no-renames","-z",base,"HEAD","--"]);});
test("successful documentation diff skips",()=>assert.equal(decision(base,args=>({status:0,stdout:args[0]==="diff"?"README.md\0":""})),0));

test("same-commit configuration redeploy must build even without a Git diff",()=>{assert.equal(canSkip([]),false);assert.equal(decision(base,()=>({status:0,stdout:""})),1);});
