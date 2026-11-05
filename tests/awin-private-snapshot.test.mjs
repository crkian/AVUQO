import test from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {privateAwinSnapshotKey,validatePrivateAwinSnapshotKey,digestBoundedAwinSnapshot} from "../lib/awin/private-snapshot.ts";

test("snapshot key binds joined advertiser, feed, content digest and format",()=>{
 const sha="a".repeat(64);
 const key=privateAwinSnapshotKey("496","89987",sha,"csv.gz");
 assert.equal(key,`awin/496/89987/${sha}.csv.gz`);
 assert.equal(validatePrivateAwinSnapshotKey(key,"496","89987",sha),true);
 assert.equal(validatePrivateAwinSnapshotKey(key,"496","89988",sha),false);
 assert.equal(validatePrivateAwinSnapshotKey(key,"31539","89987",sha),false);
 for(const bad of ["../496","496/../","foo",""])
  assert.throws(()=>privateAwinSnapshotKey(bad,"89987",sha,"csv.gz"));
 assert.throws(()=>privateAwinSnapshotKey("496","89987","a".repeat(63),"csv.gz"));
});

test("bounded stream hash is stable across arbitrary chunk boundaries",async()=>{
 async function* chunks(){yield Buffer.from("ab");yield Buffer.from("c");}
 const actual=await digestBoundedAwinSnapshot(chunks());
 assert.equal(actual.bytes,3);
 assert.equal(actual.sha256,createHash("sha256").update("abc").digest("hex"));
});
test("rejects over-limit and empty snapshots",async()=>{
 async function* tooLarge(){yield Buffer.from("abcd");}
 await assert.rejects(()=>digestBoundedAwinSnapshot(tooLarge(),3),/exceeds/);
 async function* empty(){}
 await assert.rejects(()=>digestBoundedAwinSnapshot(empty()),/Empty/);
});
