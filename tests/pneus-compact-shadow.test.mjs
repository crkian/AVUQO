import test from "node:test";
import assert from "node:assert/strict";
import {gzipSync} from "node:zlib";
import {createHash} from "node:crypto";
import {replayPneusSnapshot,restorePneusRow,comparePneusSnapshots} from "../lib/awin/pneus-compact-shadow.mjs";
import {preparePneusPrivateBatch} from "../lib/awin/pneus-online-private.ts";
const header=["merchant_id","merchant_product_id","product_name","search_price","in_stock",
 "last_updated","description","delivery_cost","aw_deep_link"];
const row=(sku,price="89.99",title="Synthetic tyre",updated="2026-11-24",stock="1",delivery="5.00")=>
 ["15236",sku,title,price,stock,updated,"Synthetic description",delivery,
  "https://www.awin1.com/pclick.php?m=15236&a=3135746&p=123"];
const csv=rows=>[header,...rows].map(cells=>cells.map(x=>'"'+x.replaceAll('"','""')+'"').join(",")).join("\n")+"\n";
function input(rows,observedAt="2026-11-25T08:46:00Z"){
 const bytes=Buffer.from(csv(rows));
 return {compressed:gzipSync(bytes),sha256:createHash("sha256").update(bytes).digest("hex"),
  expectedRows:rows.length,observedAt};
}
test("decompressed digest, row count, normalized replay and missing currency quarantine",async()=>{
 const rows=[row("001"),row("002","90.10",'Tyre, "test"\nvariant')];
 const snapshot=await replayPneusSnapshot(input(rows));
 assert.equal(snapshot.members.size,2);
 assert.equal(snapshot.excluded,2);
 assert.equal(snapshot.privateOnly,true);
 assert.equal(snapshot.noPublication,true);
 const expected=preparePneusPrivateBatch("15236","26513",header,rows);
 for(const r of expected){
  const restored=restorePneusRow(snapshot,r.merchant_product_id);
  assert.deepEqual(restored,r);
  assert.equal(restored.currency,"");
  assert.equal(restored.metadata.release_approved,false);
  assert.equal(restored.metadata.tyre_fitment_verified,false);
 }
});
test("classifies membership and separate content, terms, stock and timestamp changes",async()=>{
 const a=await replayPneusSnapshot(input([row("same"),row("gone"),row("price"),row("title"),row("both"),row("timestamp"),row("delivery"),row("stock")]));
 const b=await replayPneusSnapshot(input([row("same"),row("new"),row("price","90.00"),row("title","89.99","Other title"),
  row("both","90.00","Other title"),row("timestamp","89.99","Synthetic tyre","2026-11-25"),
  row("delivery","89.99","Synthetic tyre","2026-11-24","1","7.00"),
  row("stock","89.99","Synthetic tyre","2026-11-24","0")],"2026-11-25T12:46:00Z"));
 assert.deepEqual(comparePneusSnapshots(a,b),{added:1,absent:1,unchanged:1,contentChanged:1,
  observationChanged:3,bothChanged:1,sourceTimestampOnly:1,privateOnly:true,noPublication:true});
 assert.equal(a.members.size,8);
 assert.throws(()=>comparePneusSnapshots(b,a),/shadow_snapshot_order/);
});
test("replay is deterministic and repeated payloads can share hash entries",async()=>{
 const i=input([row("a"),row("b")]);
 const a=await replayPneusSnapshot(i),b=await replayPneusSnapshot(i);
 assert.deepEqual(a,b);
 assert.equal(a.contents.size,1);
 assert.equal(a.observations.size,1);
});
test("refuses incorrect digest, incomplete and excessive counts, malformed gzip and zero rows",async()=>{
 const i=input([row("a")]);
 await assert.rejects(replayPneusSnapshot({...i,sha256:"0".repeat(64)}),/shadow_digest_mismatch/);
 await assert.rejects(replayPneusSnapshot({...i,expectedRows:2}),/shadow_count_mismatch/);
 await assert.rejects(replayPneusSnapshot({...i,expectedRows:0}),/invalid_shadow_input/);
 await assert.rejects(replayPneusSnapshot({...i,expectedRows:100001}),/invalid_shadow_input/);
 await assert.rejects(replayPneusSnapshot({...i,compressed:Buffer.from("bad")}),/invalid_shadow_input/);
});
test("duplicate across 250-row boundary and cross-advertiser rows fail closed",async()=>{
 const rows=Array.from({length:250},(_,i)=>row("sku-"+i));
 await assert.rejects(replayPneusSnapshot(input([...rows,rows[0]])),/invalid_or_duplicate_product_id/);
 const bad=row("x");bad[0]="9999";
 await assert.rejects(replayPneusSnapshot(input([bad])),/cross_advertiser_product/);
});
test("changed normalized payload hash is rejected on restore",async()=>{
 const s=await replayPneusSnapshot(input([row("a")]));
 const member=s.members.get("a");
 s.observations.get(member.observationHash).price="1.00";
 assert.throws(()=>restorePneusRow(s,"a"),/shadow_payload_mismatch/);
});
test("incomplete manifest cannot mark other SKUs absent",async()=>{
 const a=await replayPneusSnapshot(input([row("a"),row("b")]));
 const b=await replayPneusSnapshot(input([row("a")],"2026-11-25T12:46:00Z"));
 b.expectedRows=2;
 assert.throws(()=>comparePneusSnapshots(a,b),/invalid_shadow_manifest/);
});
