import test from "node:test";
import assert from "node:assert/strict";
import {awinRecheckLimit,awinCanonicalLimit} from "../lib/awin/recheck-budget.ts";
test("default cost stays unchanged",()=>{for(const v of [undefined,"","0","51","2.5","bad"])assert.equal(awinRecheckLimit(v),20);});
test("explicit bounded cohort",()=>{assert.equal(awinRecheckLimit("50"),50);assert.equal(awinRecheckLimit("1"),1);assert.equal(awinCanonicalLimit(50),50);assert.equal(awinCanonicalLimit(100),50);});
test("invalid canonical requests fail to normal budget",()=>{for(const n of [NaN,Infinity,-1,0,1.5,undefined])assert.equal(awinCanonicalLimit(n),20);});
