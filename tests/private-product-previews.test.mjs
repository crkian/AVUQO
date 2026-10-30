import test from "node:test";
import assert from "node:assert/strict";
import {safePreviewSelection,stagedPrice} from "../lib/feed-imports/preview-selection.ts";
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
