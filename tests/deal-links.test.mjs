import test from "node:test";
import assert from "node:assert/strict";
import { dealDestination, savedDealDestination } from "../lib/avuqo/deal-links.ts";

const offerId = "d42a5e74-34bf-4dcc-aebc-df72782e72e5";
test("verified UUID offer resolves to its live deal page", () => {
  assert.equal(dealDestination(offerId), `/live/${offerId}`);
  assert.equal(savedDealDestination(`deal:${offerId}`), `/live/${offerId}`);
});
test("old demonstration deal bookmarks remain valid", () => {
  assert.equal(dealDestination("lg-oled"), "/deal/lg-oled");
  assert.equal(savedDealDestination("deal:car-lease"), "/deal/car-lease");
});
test("unknown item types cannot be treated as deals", () => {
  assert.equal(savedDealDestination("product:abc"), null);
  assert.equal(savedDealDestination(null), null);
  assert.equal(dealDestination(null), null);
});
test("unsafe, malformed and external destinations are rejected", () => {
  for (const candidate of ["", "../admin", "//evil.example", "https://evil.example", "x?redirect=evil", "foo/bar", "%2f", "a--b/../x", "", "a".repeat(90)]) {
    assert.equal(dealDestination(candidate), null, candidate);
    assert.equal(savedDealDestination(`deal:${candidate}`), null, candidate);
  }
});
