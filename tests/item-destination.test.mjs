import assert from "node:assert/strict";
import test from "node:test";
import { dealDestination, savedDestination } from "../lib/avuqo/item-destination.ts";

const realOffer = "550e8400-e29b-41d4-a716-446655440000";

test("saved verified offers route to source-gated live pages", () => {
  assert.equal(savedDestination("deal:" + realOffer), "/live/" + realOffer);
  assert.equal(dealDestination(realOffer), "/live/" + realOffer);
});

test("existing demonstration cards keep their original destinations", () => {
  assert.equal(savedDestination("deal:demo-kettle"), "/deal/demo-kettle");
  assert.equal(dealDestination("demo-kettle"), "/deal/demo-kettle");
});

test("missing, unknown or non-deal keys never produce destinations", () => {
  assert.equal(savedDestination(null), null);
  assert.equal(savedDestination("product:demo-kettle"), null);
  assert.equal(savedDestination(""), null);
});

test("unsafe stored identifiers never become navigable URLs", () => {
  for (const id of ["https://merchant.test", "//merchant.test", "../account", "", "a?x=1", "a#hash", "a/b", "a%2Fb", " a", "a ".repeat(100)]) {
    assert.equal(dealDestination(id), null);
    assert.equal(savedDestination("deal:" + id), null);
  }
});
