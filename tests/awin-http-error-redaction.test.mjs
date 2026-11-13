import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const source=readFileSync(new URL("../lib/connectors/awin.ts",import.meta.url),"utf8");
test("Awin failed response exposes numeric HTTP status only",()=>{
 assert.match(source,/Awin feed request failed \(HTTP \$\{response\.status\}\)/);
 assert.doesNotMatch(source,/await response\.text\(\)/);
 assert.doesNotMatch(source,/response\.statusText/);
 assert.doesNotMatch(source,/\$\{body\}/);
});
test("Awin connector keeps existing authentication, limits, data and fail-closed publication",()=>{
 assert.match(source,/process\.env\.AWIN_ACCESS_TOKEN/);
 assert.match(source,/Authorization: `Bearer \$\{token\}`/);
 assert.match(source,/AbortSignal\.timeout\(25_000\)/);
 assert.match(source,/Math\.max\(1, Math\.min\(limit, 250\)\)/);
 assert.match(source,/return readJsonLines\(response,/);
});
