import test from "node:test";
import assert from "node:assert/strict";
import {
  AFFILIATE_NETWORKS,
  AFFILIATE_PUBLICATION_GATES,
  missingAffiliateReadinessEvidence,
} from "../lib/affiliate-networks/catalogue.ts";

test("there are exactly eight unique UK-first partner plans with deliberate priority order", () => {
  assert.equal(AFFILIATE_NETWORKS.length, 8);
  assert.deepEqual(AFFILIATE_NETWORKS.map((network) => network.order), [1,2,3,4,5,6,7,8]);
  assert.equal(new Set(AFFILIATE_NETWORKS.map((network) => network.id)).size, 8);
  assert.deepEqual(AFFILIATE_NETWORKS.slice(0, 2).map((network) => network.id), ["awin", "ebay"]);
});

test("planning entries do not pretend there are eight production adapters", () => {
  assert.deepEqual(
    AFFILIATE_NETWORKS.filter((network) => network.currentCode === "awin_adapter_exists").map((network) => network.id),
    ["awin"],
  );
  for (const network of AFFILIATE_NETWORKS) {
    assert.equal(new URL(network.applicationUrl).protocol, "https:");
    assert.equal(new URL(network.developerUrl).protocol, "https:");
    assert.ok(network.providerChecks.length > 20);
  }
});

test("unknown and partial permission evidence always remains incomplete", () => {
  assert.deepEqual(missingAffiliateReadinessEvidence(), [...AFFILIATE_PUBLICATION_GATES]);
  assert.ok(missingAffiliateReadinessEvidence({publisher_approved:true}).includes("merchant_approved"));
  assert.ok(missingAffiliateReadinessEvidence({merchant_approved:true}).includes("product_feed_rights_confirmed"));
  assert.equal(missingAffiliateReadinessEvidence(
    Object.fromEntries(AFFILIATE_PUBLICATION_GATES.map((gate) => [gate, true])),
  ).length, 0);
});
