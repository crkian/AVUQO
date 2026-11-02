import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { safeMerchantDestination } from "../lib/analytics/outbound.ts";
import { MEASUREMENT_GATES } from "../lib/analytics/contracts.ts";

test("untrusted destination URLs cannot become merchant redirects", () => {
  for (const unsafe of [
    null, "", "http://shop.example/items", "javascript:alert(1)",
    "https://username:password@shop.example/item", "/products/test",
    "https://a/item", "data:text/plain,hi",
  ]) assert.equal(safeMerchantDestination(unsafe), null);
  assert.equal(safeMerchantDestination("https://shop.example/items?ref=test")?.hostname, "shop.example");
});

test("event intake remains disabled while consent purpose and collection are unapproved", () => {
  assert.equal(MEASUREMENT_GATES.clientCollectionEnabled, false);
  assert.equal(MEASUREMENT_GATES.merchantClickRecordingEnabled, false);
  assert.equal(MEASUREMENT_GATES.serverOnlyEventWrites, true);
  assert.equal(MEASUREMENT_GATES.revenueFromClicks, false);
});

test("merchant redirects still require verified offers and never write tracking rows", () => {
  const route = readFileSync("app/go/[offerId]/route.ts", "utf8");
  assert.match(route, /verifiedOffers\(/);
  assert.match(route, /NextResponse\.redirect\(url,302\)/);
  assert.doesNotMatch(route, /\.from\(["'](?:click_events|analytics_events)["']\)/);
  assert.doesNotMatch(route, /createAdminClient|createClient/);
});

test("migration blocks both anonymous and signed-in direct event inserts", () => {
  const sql = readFileSync("supabase/migrations/20261102153000_event_write_integrity.sql", "utf8").toLowerCase();
  assert.match(sql, /revoke insert, update, delete on table public\.analytics_events, public\.click_events/);
  assert.match(sql, /from anon, authenticated, public/);
  assert.match(sql, /drop policy if exists "analytics event insert"/);
  assert.match(sql, /drop policy if exists "click event insert"/);
  assert.doesNotMatch(sql, /truncate|drop table|delete from/);
});
