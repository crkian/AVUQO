import test from "node:test";
import assert from "node:assert/strict";
import { COLLECTIONS, safeProductUrl, isSafeSnapshot, basketEmailBody } from "../lib/collections/planning.ts";

test("wishlist and basket are separate private groupings", () => {
  assert.deepEqual(Object.keys(COLLECTIONS), ["wishlist", "basket"]);
  assert.notEqual(COLLECTIONS.wishlist.name, COLLECTIONS.basket.name);
});
test("external links or unverified slugs are not made clickable from stored snapshots", () => {
  for (const unsafe of ["https://merchant.example", "//evil.test", "../admin", "/go/123", "ABC XYZ", "", "a".repeat(180)]) {
    assert.equal(safeProductUrl(unsafe), null);
  }
  assert.equal(safeProductUrl("some-product-123"), "/products/some-product-123");
});
test("basket snapshots cannot pass without a product URL and timestamp", () => {
  const valid = {kind:"basket",product_slug:"ninja-airfryer",merchant:"Test",price_gbp:90,captured_at:"2026-11-02T12:00:00Z"};
  assert.equal(isSafeSnapshot(valid), true);
  assert.equal(isSafeSnapshot({...valid,product_slug:"https://bad.test"}), false);
  assert.equal(isSafeSnapshot({...valid,price_gbp:-1}), false);
});
test("email draft uses only internal product destinations and labels snapshots", () => {
  const body = basketEmailBody([{title:"Keyboard",merchant:"Example merchant",price:25.50,url:"/products/keyboard-123"}, {title:"Unsafe",merchant:"Other",price:null,url:"https://external.invalid"}], "https://www.avuqo.com");
  assert.match(body, /historical snapshots/);
  assert.match(body, /www\.avuqo\.com\/products\/keyboard-123/);
  assert.doesNotMatch(body, /external\.invalid/);
  assert.match(body, /Each retailer handles its own checkout/);
});
