import test from "node:test";
import assert from "node:assert/strict";
import {privateImportProvenance,currentCurrencyEvidence,recheckedImageEvidence} from "../lib/awin/private-import-provenance.ts";
test("new imports comply with RPC private rights contract",()=>{
 const p=privateImportProvenance("feed_column","GBP");
 assert.equal(p.source_image_rights_confirmed,false);
 assert.equal(p.source_description_rights_confirmed,false);
 assert.equal(p.permission_status,"unverified");
 assert.equal(p.source_currency_explicit,true);
});
test("inferred GBP never becomes explicit evidence",()=>{
 for(const source of ["petlibro_uk_programme_gbp","cadbury_uk_programme_gbp"])
  assert.equal(currentCurrencyEvidence(source,"GBP").source_currency_explicit,false);
 assert.equal(currentCurrencyEvidence("feed_column","EUR").source_currency_explicit,false);
});
test("current image permission replaces stale rights and gallery",()=>{
 assert.deepEqual(recheckedImageEvidence(false,undefined),{source_image_rights_confirmed:false,image_permission_basis:null,supplied_image_gallery:[]});
 assert.equal(recheckedImageEvidence(true,[]).source_image_rights_confirmed,true);
});
