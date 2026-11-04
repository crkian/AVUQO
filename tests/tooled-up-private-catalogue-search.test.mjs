import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
test("Tooled-Up category search and facets preserve existing owner-only RLS",()=>{
 const sql=readFileSync("supabase/migrations/20261104181500_private_tooled_up_discovery.sql","utf8");
 assert.match(sql,/security invoker/);
 assert.match(sql,/private_tooled_up_facets/);
 assert.match(sql,/private_tooled_up_search/);
 assert.match(sql,/merchant_category_path/);
 assert.match(sql,/p_brand/);
 assert.match(sql,/p_department/);
 assert.match(sql,/p_query/);
 assert.match(sql,/limit 48 offset/);
 assert.match(sql,/revoke all on function .* from public,anon/);
 assert.ok(!sql.includes("security definer"));
});
test("Tooled-Up catalogue requires owner access before querying staged rows",()=>{
 const page=readFileSync("app/preview/products/tooled-up/page.tsx","utf8");
 assert.ok(page.indexOf("requireControlCentreAccess()")<page.indexOf('db.from("feed_import_runs")'));
 assert.match(page,/robots:\{index:false,follow:false\}/);
 assert.match(page,/private_tooled_up_search/);
 assert.match(page,/private_tooled_up_facets/);
 assert.match(page,/owner|OWNER/);
 assert.match(page,/price_asc/);
 assert.match(page,/p_page:page/);
});
test("Tooled-Up catalogue image is private opt-in with exact HTTPS host only",()=>{
 const ui=readFileSync("app/preview/products/tooled-up/TooledUpCards.tsx","utf8");
 assert.match(ui,/useState\(false\)/);
 assert.match(ui,/u\.protocol==="https:"/);
 assert.match(ui,/u\.hostname==="www\.tooled-up\.com"/);
 assert.match(ui,/!u\.username&&!u\.password/);
 assert.match(ui,/!broken\.includes\(item.id\)/);
 assert.match(ui,/Historical feed price/);
 assert.match(ui,/image reuse rights|Publication rights/);
});
