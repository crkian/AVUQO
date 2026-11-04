import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const route = readFileSync("app/control-centre/awin/page.tsx", "utf8");

test("joined programme diagnostics are gated before credentials or HTTP fetch", () => {
  const auth = route.indexOf("await requireControlCentreAccess()");
  const token = route.indexOf("process.env.AWIN_ACCESS_TOKEN");
  const request = route.indexOf("await fetch(");
  assert.ok(auth >= 0 && auth < token && token < request);
  assert.match(route, /if \(check\) \{/);
  assert.match(route, /await connection\(\)/);
});

test("diagnostic is Awin's read-only joined programme endpoint and cannot publish", () => {
  assert.match(route, /https:\/\/api\.awin\.com\/publishers\//);
  assert.match(route, /\/programmes\?relationship=joined/);
  assert.match(route, /cache: "no-store"/);
  assert.match(route, /AbortSignal\.timeout\(8000\)/);
  assert.match(route, /method: "POST"|method: "PUT"|\.from\("|\.rpc\(|\.insert\(|\.update\(/, "assertion placeholder");
});


test("pilot IDs are displayed as checked evidence, not an approval to publish", () => {
  assert.match(route, /id: 736, name: "Cadbury Gifts Direct"/);
  assert.match(route, /id: 77952, name: "Petlibro UK Affiliate Program"/);
  assert.match(route, /Not found in this API response/);
  assert.match(route, /does not verify feed, price, image or republication rights/);
});

test("Awin credentials and provider errors are not rendered in the result", () => {
  assert.match(route, /Authorization: "Bearer " \+ token/);
  assert.doesNotMatch(route, /console\.|JSON\.stringify\(payload\)|response\.text\(/);
  assert.match(route, /Awin connection failed/);
  assert.match(route, /Connection unsuccessful \(HTTP /);
  assert.match(route, /slice\(0, 100\)/);
  assert.match(route, /p\.name\.slice\(0, 150\)/);
});
