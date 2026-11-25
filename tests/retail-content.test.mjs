import test from "node:test";
import assert from "node:assert/strict";
import {exactRetailContent} from "../lib/products/retail-content.ts";
const digest="a".repeat(64);
const programme={product_description_rights_verified:true,publication_approved:true,owner_joined_accepted_attestation:{membership_status:"accepted"}};
const metadata={live_feed_digest:digest,live_feed_verification:"exact_authenticated_feed_digest_rechecked",source_description_rights_confirmed:true,source_description_verified_digest:digest,source_description:"A supplier description of this exact toy with its included parts.",source_catalogue_verified_digest:digest,source_catalogue_rights_confirmed:true,source_catalogue_fields:{colour:"Blue",size:"Small",delivery_cost:"0",sale_price:"5",product_detail:"https://example.com/secret",custom_1:"Unknown"}};
test("exact source content retains only authorised factual fields",()=>{
 const c=exactRetailContent(metadata,digest,programme);
 assert.ok(c.description);assert.deepEqual(c.specifications,[["Colour","Blue"],["Size","Small"]]);
 assert.deepEqual(exactRetailContent(metadata,digest,{...programme,product_description_rights_verified:false}),{description:null,specifications:[]});
 assert.deepEqual(exactRetailContent(metadata,"b".repeat(64),programme),{description:null,specifications:[]});
 assert.deepEqual(exactRetailContent({...metadata,source_catalogue_rights_confirmed:false},digest,programme).specifications,[]);
});
