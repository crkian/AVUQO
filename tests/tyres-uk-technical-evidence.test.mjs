import test from "node:test";
import assert from "node:assert/strict";
import {candidateTyresUkTechnicalSpecs} from "../lib/awin/tyres-uk-technical-evidence.ts";
test("corroborated width/profile/rim/load/speed candidate stays unverified",()=>{
 const r=candidateTyresUkTechnicalSpecs({
  description:"235/35 ZR19 91Y",
  custom_1:"235",custom_2:"35",custom_3:"19",custom_4:"91",custom_5:"Y"
 });
 assert.equal(r.cross_checked_against_description,true);
 assert.equal(r.width_mm,235);
 assert.equal(r.load_index_candidate,"91");
 assert.equal(r.speed_rating_candidate,"Y");
 assert.equal(r.load_index_verified,false);
 assert.equal(r.fitment_verified,false);
});
test("conflicting load index, incomplete van size and multiple specs fail closed",()=>{
 const valid={description:"275/45 R20 110Y",custom_1:"275",custom_2:"45",custom_3:"20",custom_4:"110",custom_5:"Y"};
 assert.equal(candidateTyresUkTechnicalSpecs({...valid,custom_4:"109"}).load_index_candidate,null);
 assert.equal(candidateTyresUkTechnicalSpecs({...valid,description:"185 R14 102/100R"}).cross_checked_against_description,false);
 assert.equal(candidateTyresUkTechnicalSpecs({...valid,description:"275/45 R20 110Y and 275/45 R20 110Y"}).speed_rating_candidate,null);
});
