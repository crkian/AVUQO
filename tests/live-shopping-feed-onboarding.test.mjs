import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");
test("live shopping retains compact home/category sections and full Shopping departments",()=>{
 const shelf=read("components/shopping/ShoppingDepartmentShelf.tsx");
 const css=read("components/shopping/ShoppingDepartmentShelf.module.css");
 assert.match(shelf,/compact\?collections\.slice\(0,4\):collections/);
 assert.match(shelf,/styles\.compact/);
 assert.match(shelf,/Technology & phones/);
 assert.match(shelf,/Motoring & services/);
 assert.match(shelf,/href:"\/tech"/);
 assert.match(shelf,/href:"\/motoring"/);
 assert.match(css,/\.compact\{padding:/);
 assert.match(css,/@media\(max-width:700px\)/);
 assert.match(css,/@media\(max-width:480px\)/);
 assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
});
test("joined feed onboarding appears only inside owner-checked Control Centre",()=>{
 const page=read("app/control-centre/feed-imports/page.tsx");
 assert.ok(page.indexOf("supabase.auth.getUser()")<page.indexOf("next-merchant-feeds"));
 assert.ok(page.indexOf("['admin', 'owner']")<page.indexOf("next-merchant-feeds"));
 for(const id of ["74135","81201","109353","116573","97136","119009"])assert.ok(page.includes(id));
 for(const id of ["93988","26513","97090"])assert.ok(page.includes(id));
 assert.match(page,/2,500-row importer/);
 assert.match(page,/image rights/);
 const form=read("app/control-centre/feed-imports/UploadForm.tsx");
 assert.match(form,/id="standard-awin-upload"/);
 assert.match(page,/href="#standard-awin-upload"/);
});
test("new public departments point only to existing editorial routes",()=>{
 const shelf=read("components/shopping/ShoppingDepartmentShelf.tsx");
 assert.match(shelf,/OwnerCollectionLink/);
 assert.doesNotMatch(shelf,/feed_import_records|image_url|itemAffiliateWebUrl/);
 assert.match(shelf,/Images are illustrative/);
});
