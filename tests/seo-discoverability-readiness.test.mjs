import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(path,"utf8");
test("canonical SEO metadata is individual to supplier, department and verified product",()=>{
 const helper=read("lib/site/seo.ts");
 assert.match(helper,/alternates:\{canonical:path\}/);
 assert.match(helper,/openGraph:/);
 assert.match(helper,/googleBot:/);
 for(const file of ["app/categories/[department]/page.tsx","app/partners/[slug]/page.tsx","app/products/[slug]/page.tsx"])
  assert.match(read(file),/publicPageMetadata/);
 assert.match(read("app/products/[slug]/page.tsx"),/robots:\{index:false,follow:true\}/);
});
test("JSON-LD is source-safe and editorial, without invented ratings or merchant ownership",()=>{
 const helper=read("lib/site/seo.ts");
 assert.match(helper,/BreadcrumbList/);
 assert.match(helper,/CollectionPage/);
 assert.match(helper,/replace\(/);
 assert.doesNotMatch(helper,/AggregateRating|priceValidUntil|reviewCount/);
 const partner=read("app/partners/[slug]/page.tsx");
 assert.match(partner,/collectionSchema/);
 assert.match(partner,/breadcrumbSchema/);
 assert.doesNotMatch(partner,/"@type":"Store"/);
});
test("sitemap does not promote internal search, private previews, filtered pages or demo deals",()=>{
 const sitemap=read("app/sitemap.ts");
 assert.match(sitemap,/BROWSE_DEPARTMENTS\.filter\(d=>!d\.landing\)/);
 assert.match(sitemap,/indexable|partnerRoutes/);
 assert.doesNotMatch(sitemap,/"\/search"/);
 assert.doesNotMatch(sitemap,/"\/control-centre"/);
 assert.doesNotMatch(sitemap,/"\/deal\/"/);
 const robots=read("app/robots.ts");
 assert.match(robots,/VERCEL_ENV==="preview"/);
 assert.match(robots,/disallow:"\/"/);
 assert.match(robots,/\/control-centre\//);
});
test("analytics remains privacy gated and owner-only while search visibility is improved",()=>{
 const contracts=read("lib/analytics/contracts.ts");
 const seo=read("app/control-centre/seo/page.tsx");
 assert.match(contracts,/clientCollectionEnabled:false/);
 assert.match(contracts,/advertisingMeasurementEnabled:false/);
 assert.match(seo,/requireControlCentreAccess\(\)/);
 assert.match(seo,/Google Search Console/);
 assert.match(seo,/not a claim of Google indexing/);
});
