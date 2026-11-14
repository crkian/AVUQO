import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const page=readFileSync(new URL("../app/control-centre/live-data/page.tsx",import.meta.url),"utf8");
const candidate=readFileSync(new URL("../app/control-centre/live-data/CandidateReviewPanel.tsx",import.meta.url),"utf8");

test("Live Data fast metrics and source health no longer wait on serial candidate paging",()=>{
 assert.match(page,/import \{Suspense\} from "react"/);
 assert.match(page,/await connection\(\)/);
 assert.match(page,/<Suspense fallback=\{<section[^>]+role="status" aria-live="polite"/);
 assert.match(page,/<CandidateReviewPanel restrictedMerchantIds=\{\[\.\.\.restrictedMerchants\]\} permissionsUnavailable=\{Boolean\(importRuns\.error\)\}/);
 assert.ok(page.indexOf("<div className={styles.metrics}>")<page.indexOf("<Suspense fallback="));
 assert.ok(page.indexOf("Registered source health")<page.indexOf("<Suspense fallback="));
 assert.doesNotMatch(page,/while \(!candidateError/);
 assert.doesNotMatch(page,/const allCandidates/);
 assert.doesNotMatch(page,/const candidates=await/);
 assert.match(page,/No products will be published/);
});

test("candidate server component alone owns a bounded, private, read-only 5000-row scan",()=>{
 assert.match(candidate,/createClient\(\)/);
 assert.match(candidate,/\.limit\(200\)/);
 assert.match(candidate,/while \(!candidateError && !finalPage && cursor < 5000\)/);
 assert.match(candidate,/\.range\(cursor, cursor \+ 199\)/);
 assert.match(candidate,/cursor \+= 200/);
 assert.match(candidate,/if \(batch\.error\)/);
 assert.match(candidate,/candidateError \? \[\] : allCandidates/);
 assert.match(candidate,/allUniqueCandidates = candidateRows\.filter/);
 assert.match(candidate,/uniqueCandidates = allUniqueCandidates\.slice\(0, 40\)/);
 assert.match(candidate,/queuePartial = !candidateError && !finalPage/);
 assert.doesNotMatch(candidate,/\.insert\(|\.upsert\(|\.update\(|\.delete\(|\.rpc\(|fetch\(/);
});

test("partial scans, failed permissions and source evidence remain safe and accurately labelled",()=>{
 assert.match(candidate,/candidateError && <div role="alert"/);
 assert.match(candidate,/candidate counts are unavailable/);
 assert.match(candidate,/permissionsUnavailable/);
 assert.match(candidate,/No approval can be inferred/);
 assert.match(candidate,/Permission checks here cover the latest 10 import batches/);
 assert.match(candidate,/not a verified deal ranking/);
 assert.match(candidate,/live URL, stock and rights must still be checked/);
 assert.match(candidate,/merchant_id/);
 assert.match(page,/\(importRuns\.data \?\? \[\]\)\.filter\(r => r\.permission_status !== "verified"\)/);
 assert.match(page,/const errors = \[importRuns\.error/);
});
