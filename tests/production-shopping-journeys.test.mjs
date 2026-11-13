import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const page=readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");
const styles=readFileSync(new URL("../app/homepage-warm.module.css",import.meta.url),"utf8");
const backlog=readFileSync(new URL("../docs/AVUQO_LIVE_PRODUCTION_PARTNER_AND_DESIGN_BACKLOG_2026-11-13.md",import.meta.url),"utf8");

test("public production homepage offers both compare and bargain discovery",()=>{
  assert.match(page,/Two ways to find what is worth it/);
  assert.match(page,/href="\/marketplace\/compare"/);
  assert.match(page,/href="\/sales"/);
  assert.match(page,/shopJourneyGrid/);
  assert.match(page,/backgroundImage/);
  assert.match(styles,/@media\(max-width:480px\)/);
  assert.doesNotMatch(page,/href="\/preview\/(?:products|storefront)"/);
});

test("production backlog preserves image rights, live routes and partner access boundaries",()=>{
  for(const text of ["LIVE Production Delivery","UI-001","Golfbreaks","Booking.com Demand API","Avasam","Syncee","Seopa","AVUQO_ASSET_REGISTER","not a collection of permanent /preview routes"]){
    assert.ok(backlog.includes(text),"Backlog missing "+text);
  }
  assert.match(backlog,/No merchant photo may be republished/);
  assert.match(backlog,/No perpetual preview launch/i);
});
