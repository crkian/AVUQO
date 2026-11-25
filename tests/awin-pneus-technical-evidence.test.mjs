import test from "node:test";
import assert from "node:assert/strict";
import {pneusTechnicalEvidence} from "../lib/awin/pneus-technical-evidence.mjs";
test("explicit tyre dimensions are observations, ambiguous and malformed sizes are not",()=>{
 assert.deepEqual(pneusTechnicalEvidence("Example 205/55 R16 91V","4006381333931"),{size:{width:205,profile:55,rim:16},ambiguousSize:false,gtinChecksumValid:true});
 assert.equal(pneusTechnicalEvidence("225/45 ZR17","4006381333932").gtinChecksumValid,false);
 assert.equal(pneusTechnicalEvidence("205/55 R16 or 225/45 R17","").ambiguousSize,true);
 assert.equal(pneusTechnicalEvidence("205/55 R16 or 225/45 R17","").size,null);
 for(const title of ["size 205 55 16","999/55 R16","205/55 R160",""])assert.equal(pneusTechnicalEvidence(title,"").size,null);
 assert.equal(pneusTechnicalEvidence("","0000000000000").gtinChecksumValid,false);
});
