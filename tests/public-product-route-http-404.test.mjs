import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const productPath=new URL("../app/products/[slug]/page.tsx",import.meta.url);
const source=readFileSync(productPath,"utf8");

test("unknown and unapproved product slugs are denied before HTML streams",()=>{
 const start=source.indexOf("export default async function Page");
 assert.ok(start>=0,"Page must resolve access before streaming");
 const page=source.slice(start);
 const access=page.indexOf("const entry=await verifiedProduct(slug)");
 const fallback=page.indexOf("researchGuideBySlug(slug)");
 const deny=page.indexOf("if(!entry&&!guide)notFound()");
 const header=page.indexOf("<Header/>");
 assert.ok(access>=0&&fallback>access&&deny>fallback&&header>deny,
  "Unapproved identity must fail before the Header or Suspense begins streaming");
 assert.match(page,/const guide=entry\?undefined:researchGuideBySlug\(slug\)/);
 assert.match(page,/ProductDetails entry=\{entry\} guide=\{guide\}/);
 assert.doesNotMatch(page,/<ProductDetails \{\.\.\.props\}/);
});
test("only approved offer evidence or four explicit research guides admit a product",()=>{
 const catalog=readFileSync(new URL("../lib/products/public-catalog.ts",import.meta.url),"utf8");
 const research=readFileSync(new URL("../lib/products/research-guides.ts",import.meta.url),"utf8");
 assert.match(catalog,/if\(!offers\.length\)return null/);
 assert.match(research,/export function researchGuideBySlug/);
 assert.match(research,/RESEARCH_PRODUCT_GUIDES\.find/);
 assert.match(source,/if\(!entry\)/);
 assert.match(source,/if\(!guide\)notFound\(\)/);
 assert.match(source,/robots:\{index:false,follow:false\}/);
});
test("a verified product is retrieved once and reused for the body",()=>{
 const page=source.slice(source.indexOf("export default async function Page"));
 const body=source.slice(source.indexOf("function ProductDetails"),source.indexOf("export default async function Page"));
 assert.equal((page.match(/await verifiedProduct\(slug\)/g)||[]).length,1);
 assert.doesNotMatch(body,/await verifiedProduct/);
 assert.match(body,/const \{product\}=entry/);
});
