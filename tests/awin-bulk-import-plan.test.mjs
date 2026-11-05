import test from "node:test";
import assert from "node:assert/strict";
import {planPrivateAwinChunks} from "../lib/awin/bulk-import-plan.ts";
test("Tooled Up 84,245 rows need 337 private 250-row chunks",()=>{
 const p=planPrivateAwinChunks(84245);
 assert.equal(p.estimated_chunks,337);
 assert.equal(p.last_chunk_rows,245);
 assert.equal(p.runnable_unattended,false);
 assert.equal(p.no_database_writes,true);
});
test("pilot records still use one chunk and are not automatically authorised",()=>{
 const p=planPrivateAwinChunks(219);
 assert.equal(p.estimated_chunks,1);
 assert.equal(p.runnable_unattended,false);
 assert.equal(p.within_current_worker_row_limit,true);
});
test("boundary rows are planned correctly",()=>{
 assert.equal(planPrivateAwinChunks(5000).estimated_chunks,20);
 assert.equal(planPrivateAwinChunks(5001).estimated_chunks,21);
 assert.equal(planPrivateAwinChunks(500000).estimated_chunks,2000);
});
test("invalid and excessive counts fail closed",()=>{
 for(const n of [0,-1,0.5,500001,Infinity,NaN])
  assert.throws(()=>planPrivateAwinChunks(n));
});
