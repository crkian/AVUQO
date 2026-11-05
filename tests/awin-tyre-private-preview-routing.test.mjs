import test from "node:test";
import assert from "node:assert/strict";
import {suggestedDepartment} from "../lib/feed-imports/preview-departments.ts";

test("private tyre retailers route to Tyres & wheels",()=>{
 assert.equal(suggestedDepartment("Tyres UK","Tyre","Motoring > Tyres"),"Tyres & wheels");
 assert.equal(suggestedDepartment("Tyres Pneus Online UK","Car tyre","Car tyres"),"Tyres & wheels");
 assert.equal(suggestedDepartment("Tooled Up","Wrench","Hand Tools"),"Hand tools");
});
