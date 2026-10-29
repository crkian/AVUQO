import test from "node:test";
import assert from "node:assert/strict";
import {publishingGate,stateAfterBuffer} from "../lib/marketing/gates.ts";
import {buildBufferVariables} from "../lib/marketing/buffer.ts";
import {marketingPrompt} from "../lib/marketing/creative.ts";
const safe={globalEnabled:true,brandEnabled:true,channelEnabled:true,channelVerified:true,
  approved:true,factApproved:true,factCurrent:true,brandMatches:true,channelMatches:true,
  platform:"facebook",hasApprovedImage:false,withinCap:true,duplicate:false,
  dueAt:"2030-03-15T10:00:00Z"};
test("live flag defaults fail closed",()=>assert.equal(publishingGate(safe,undefined,new Date("2026-10-29")).ok,false));
test("all gates permit an eligible future post when explicitly enabled",()=>assert.equal(publishingGate(safe,"YES",new Date("2026-10-29")).ok,true));
test("cross-brand channel mapping is blocked",()=>assert.equal(publishingGate({...safe,brandMatches:false},"YES",new Date("2026-10-29")).ok,false));
test("disabled channel never dispatches",()=>assert.equal(publishingGate({...safe,channelEnabled:false},"YES",new Date("2026-10-29")).ok,false));
test("Instagram requires approved image",()=>assert.equal(publishingGate({...safe,platform:"instagram"},"YES",new Date("2026-10-29")).ok,false));
test("evidence and duplicate checks are mandatory",()=>assert.equal(publishingGate({...safe,duplicate:true,factApproved:false},"YES",new Date("2026-10-29")).ok,false));
test("scheduled is NOT published",()=>assert.equal(stateAfterBuffer("scheduled"),"scheduled"));
test("only provider sent state is published",()=>assert.equal(stateAfterBuffer("sent"),"published"));
test("unknown provider state needs reconciliation",()=>assert.equal(stateAfterBuffer("unexpected"),"needs_reconciliation"));
test("Buffer variables preserve channel, time and image",()=>{
 const {input}=buildBufferVariables({text:"Example",channelId:"chan-1",dueAt:safe.dueAt,imageUrl:"https://cdn.example.com/approved.png"});
 assert.equal(input.channelId,"chan-1");assert.equal(input.mode,"customScheduled");
 assert.equal(input.assets[0].image.url,"https://cdn.example.com/approved.png");
});
test("creative prompt explicitly prohibits invented claims",()=> {
 const prompt=marketingPrompt({brand:"AVUQO",fact:"Approved",platform:"facebook",tone:"clear",audience:"everyone"});
 assert.match(prompt.instructions,/Do not invent/);
});
