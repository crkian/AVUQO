import test from "node:test";
import assert from "node:assert/strict";
import {retailGallery,retailDepartment,retailText} from "../lib/products/shopping-presentation.ts";
const image={feed_id:"89987",url:"https://images.example.com/a.jpg"};
const raw={feed_id:"89987",source_image_rights_confirmed:true,permitted_image_gallery:[image,image,{...image,feed_id:"other"},{...image,url:"https://127.0.0.1/a"},{...image,url:"https://images.example.com/a?token=secret"}]};
test("images must be exact feed and rights gated, deduplicated and public",()=>{
 assert.deepEqual(retailGallery(raw,{image_rights_confirmed:true}),[image.url]);
 assert.deepEqual(retailGallery(raw,{image_rights_confirmed:false}),[]);
 assert.deepEqual(retailGallery({...raw,source_image_rights_confirmed:false},{image_rights_confirmed:true}),[]);
});
test("classification and text are bounded",()=>{
 assert.equal(retailDepartment({catalogue_classification:{status:"classified",department:"diy-building"}}),"diy-building");
 assert.equal(retailDepartment({catalogue_classification:{status:"unknown",department:"diy-building"}}),"");
 assert.equal(retailText("x\ninvalid"),null);
});
