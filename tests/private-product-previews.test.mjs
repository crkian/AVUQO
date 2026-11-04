import test from "node:test";
import assert from "node:assert/strict";
import {safePreviewSelection,stagedPrice} from "../lib/feed-imports/preview-selection.ts";
import {suggestedDepartment} from "../lib/feed-imports/preview-departments.ts";
import {readFileSync} from "node:fs";
const row=(id,title,status="review",merchant_product_id=id)=>({
 id,merchant_product_id,title,status,price:20,currency:"GBP",brand:"Test",
 category:"Test category",review_decision:"pending",image_url:null
});
test("samples varied title lengths and an excluded example without publication",()=>{
 const records=[row("1","Regular product"),row("2","Second product"),
  row("3","Very long imported product title with packaging information and options"),
  row("4","X"),row("5","Legacy duplicate"),row("6","Excluded for bad data","excluded")];
 const selected=safePreviewSelection(records);
 assert.equal(selected.length,6);
 assert.equal(selected.some(r=>r.id==="3"),true);
 assert.equal(selected.some(r=>r.id==="4"),true);
 assert.equal(selected.some(r=>r.status==="excluded"),true);
});
test("identical merchant identities remain one product preview",()=>{
 const rows=[row("import-1","Original","review","sku-7"),row("import-2","Duplicate upload","review","sku-7"),row("unique","Other")];
 assert.equal(safePreviewSelection(rows).length,2);
});
test("price represents staged data with explicit missing state",()=>{
 assert.equal(stagedPrice(null,"GBP"),"Price unavailable");
 assert.equal(stagedPrice("12.50","GBP"),"£12.50");
 assert.equal(stagedPrice(-1,"GBP"),"Price unavailable");
});

test("new imports annotate provisional categories without altering original merchant category",()=>{
 const route=readFileSync("app/api/control-centre/feed-imports/route.ts","utf8");
 assert.match(route,/category_candidate: proposed/);
 assert.match(route,/source_merchant_category: r.category/);
 assert.match(route,/canonical_category_approved: false/);
 assert.equal(suggestedDepartment("Petlibro UK Affiliate Program","Smart Water Fountain",""),"Pet hydration");
 assert.equal(suggestedDepartment("Petlibro UK Affiliate Program","Unknown Thing",""),"Needs classification");
});
test("owner image display is opt-in and only for known HTTPS hosts",()=>{
 const page=readFileSync("app/preview/products/PremiumDiscovery.tsx","utf8");
 assert.match(page,/useState\(false\)/);
 assert.match(page,/approvedPrivateHosts/);
 assert.match(page,/showImages\?safePrivateImage/);
 assert.match(page,/u.protocol==="https:"/);
});
