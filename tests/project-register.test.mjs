import test from "node:test";import assert from "node:assert/strict";import{readFileSync}from"node:fs";
test("software version matches the lockfile and living GitHub register",()=>{
const pkg=JSON.parse(readFileSync("package.json","utf8"));const lock=JSON.parse(readFileSync("package-lock.json","utf8"));
const status=readFileSync("docs/PROJECT_STATUS.md","utf8");const log=readFileSync("CHANGELOG.md","utf8");
assert.equal(pkg.version,lock.version);assert.equal(pkg.version,lock.packages[""].version);
assert.ok(status.includes("`"+pkg.version+"`"));assert.ok(log.includes("## ["+pkg.version+"]"));
});
