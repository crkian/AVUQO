import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("conversion queue is bounded and evidence gated",()=>{
 const sql=read("supabase/migrations/20261124210939_awin_full_inventory_conversion_queue.sql");
 for(const x of ["p_limit between 1 and 20","exact_authenticated_feed_digest_rechecked","14 minutes","private_review","canonical_observed<e.observed","global_emergency_stop","to service_role"])assert.ok(sql.includes(x),x);
});
test("conversion cron uses lease and existing canonical pipeline",()=>{
 const route=read("app/api/internal/awin-catalogue-conversion/route.ts");
 for(const x of ["claim_awin_catalogue_conversion","stageLiveAwinCanonicalCandidates(db","p_limit:20","Bearer ","canonical_accepted"])assert.ok(route.includes(x),x);
 assert.ok(!route.includes('.from("products")'));
});
