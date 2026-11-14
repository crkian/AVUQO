import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const proxy=readFileSync(new URL("../proxy.ts",import.meta.url),"utf8");
const page=readFileSync(new URL("../app/products/[slug]/page.tsx",import.meta.url),"utf8");
const publicCatalog=readFileSync(new URL("../lib/products/public-catalog.ts",import.meta.url),"utf8");
const research=readFileSync(new URL("../lib/products/research-guides.ts",import.meta.url),"utf8");

test("direct public product documents get HTTP 404 before streamed layout when no approved evidence exists",()=>{
 assert.match(proxy,/const PRODUCT_SLUG=\/\^\\\/products\\\/\(\[\^\/\]\+\)\\\/\?\$\//);
 assert.match(proxy,/const VALID_SLUG=/);
 assert.match(proxy,/status:404/);
 assert.match(proxy,/"Cache-Control":"private, no-store, max-age=0"/);
 assert.match(proxy,/"X-Robots-Tag":"noindex, nofollow"/);
 assert.match(proxy,/method==="HEAD"\?null:html/);
 assert.match(proxy,/!researchGuideBySlug\(slug\) && !\(await verifiedProduct\(slug\)\)/);
 assert.match(proxy,/return unavailableProductResponse\(method\)/);
 const eligibility=proxy.indexOf("await verifiedProduct(slug)");
 const session=proxy.indexOf("return updateSession(request)");
 assert.ok(eligibility>=0&&session>eligibility,"eligibility must be resolved before forwarding document");
});
test("only direct GET and HEAD documents are blocked, RSC navigation keeps its native protocol",()=>{
 assert.match(proxy,/method==="GET"\|\|method==="HEAD"/);
 assert.match(proxy,/request\.headers\.get\("rsc"\)!=="1"/);
 assert.match(proxy,/request\.headers\.get\("next-router-prefetch"\)!=="1"/);
 assert.match(proxy,/return updateSession\(request\)/);
 assert.match(proxy,/const match=request\.nextUrl\.pathname\.match\(PRODUCT_SLUG\)/);
 assert.match(proxy,/\/\(\(\?!_next\/static/);
 assert.doesNotMatch(proxy,/NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY/);
 assert.doesNotMatch(proxy,/SUPABASE_SECRET_KEY\s*=/);
});
test("the pre-stream gate reuses full verified-offer admission and preserves all four real guides",()=>{
 assert.match(proxy,/import \{ verifiedProduct \} from "\.\/lib\/products\/public-catalog"/);
 assert.match(proxy,/import \{ researchGuideBySlug \} from "\.\/lib\/products\/research-guides"/);
 assert.match(publicCatalog,/if\(!offers\.length\)return null/);
 assert.match(publicCatalog,/approval\.status!=="approved"/);
 assert.match(publicCatalog,/rights\.publication_permission!=="verified"/);
 assert.match(publicCatalog,/rights\.price_evidence_status!=="verified"/);
 assert.match(publicCatalog,/source\.status!=="active"/);
 assert.match(publicCatalog,/source\.sync_enabled!==true/);
 assert.match(research,/RESEARCH_PRODUCT_GUIDES/);
 for(const slug of ["apple-macbook-air-m4-13-256gb-apple-macbook-ai","ninja-af300uk-ninja-af300uk","dyson-v15-detect-absolute-dyson-v15-detect","lg-oled65c4-lg-oled65c4"]){
  assert.ok(research.includes(slug));
 }
 assert.match(page,/if\(!entry&&!guide\)notFound\(\)/);
 assert.match(page,/robots:\{index:false,follow:false\}/);
});
test("static unavailable page cannot disclose product titles, unlicensed photos or arbitrary URL values",()=>{
 assert.match(proxy,/<meta name="robots" content="noindex,nofollow">/);
 assert.match(proxy,/aria-label="Other places to go"/);
 assert.match(proxy,/href="\/products"/);
 assert.match(proxy,/href="\/"/);
 assert.doesNotMatch(proxy,/html\s*=\s*\`[^\`]*\$\{slug\}/s);
 assert.doesNotMatch(proxy,/\.insert\(|\.update\(|\.upsert\(|\.delete\(|\.rpc\(/);
});
