import test from "node:test";
import assert from "node:assert/strict";
import {csvRowsFromChunks} from "../lib/feed-imports/stream-csv.ts";
async function collect(text){
 const rows=[];
 for await(const row of csvRowsFromChunks((async function*(){yield text;})()))rows.push(row);
 return rows;
}
test("reports column-limit distinct from field-limit",async()=>{
 await assert.rejects(collect(Array.from({length:122},(_,i)=>"c"+i).join(",")+"\n"),/CSV column count exceeds 120/);
});
test("reports long unquoted field explicitly",async()=>{
 await assert.rejects(collect("x".repeat(10001)+"\n"),/CSV field exceeds 10,000 characters/);
});
test("retains ordinary quoted CSV behaviour",async()=>{
 assert.deepEqual(await collect('id,title\n1,"Phone, unlocked"\n'),[["id","title"],["1","Phone, unlocked"]]);
});
