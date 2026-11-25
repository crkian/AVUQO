import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PARTNERS,studioForVerifiedMerchant,partnerHref} from "../lib/partners/advertiser-directory.ts";
import {PARTNER_STUDIOS,partnerStudio,matchStudioChapters} from "../lib/partners/studio-editorial.ts";
import {BROWSE_DEPARTMENTS} from "../lib/categories/browse-tree.ts";
const read=path=>readFileSync(path,"utf8");
test("all 21 accepted partners have substantial genuinely distinct source-safe studio editorials",()=>{
 assert.equal(PARTNERS.length,21);
 assert.equal(Object.keys(PARTNER_STUDIOS).length,21);
 assert.deepEqual(Object.keys(PARTNER_STUDIOS).sort(),PARTNERS.map(p=>p.slug).sort());
 assert.equal(new Set(Object.values(PARTNER_STUDIOS).map(s=>s.scene)).size,21);
 assert.equal(new Set(Object.values(PARTNER_STUDIOS).map(s=>s.edition)).size,21);
 assert.equal(new Set(Object.values(PARTNER_STUDIOS).map(s=>s.heroWord)).size,21);
 assert.equal(new Set(Object.values(PARTNER_STUDIOS).map(s=>s.storyTitle)).size,21);
 assert.ok(PARTNERS.every(p=>partnerStudio(p.slug)?.chapters.length===3));
 assert.ok(Object.values(PARTNER_STUDIOS).every(s=>s.story.length>90&&s.lead.length>30));
 assert.ok(Object.values(PARTNER_STUDIOS).every(s=>s.chapters.every(ch=>ch.detail.length>55)));
 assert.ok(PARTNERS.every(p=>/^\/[a-z0-9/-]+$/.test(p.categoryHref)));
 assert.equal(BROWSE_DEPARTMENTS.length,25);
});
test("studio collections match source product title data but never imply phantom stock",()=>{
 const p=partnerStudio("petlibro");
 assert.ok(p);
 assert.ok(matchStudioChapters("PETLIBRO smart water fountain",p.chapters).includes(1));
 assert.deepEqual(matchStudioChapters("An unrelated mystery SKU",p.chapters),[]);
 assert.equal(matchStudioChapters("x",partnerStudio("broadband-genie").chapters).length,0);
});
test("product-to-supplier links rely on exact observed canonical merchant labels",()=>{
 assert.equal(partnerHref(studioForVerifiedMerchant("Tooled Up")),"/partners/tooled-up");
 assert.equal(partnerHref(studioForVerifiedMerchant("Petlibro UK Affiliate Program")),"/partners/petlibro");
 assert.equal(partnerHref(studioForVerifiedMerchant("PlayPress Toys UK")),"/partners/playpress-toys");
 assert.equal(studioForVerifiedMerchant("Petlibro vaguely"),null);
 assert.equal(studioForVerifiedMerchant("Fake Demo"),null);
 assert.equal(studioForVerifiedMerchant(""),null);
});
test("merchant pages use real approved offer admission, never private feed rows or guessed prices",()=>{
 const page=read("app/partners/[slug]/page.tsx");
 const experience=read("components/partners/PartnerStudioExperience.tsx");
 const publicCatalog=read("lib/products/public-catalog.ts");
 for(const required of ["verifiedOffersForAdvertiser","await connection()","PartnerStudioHero",
  "PartnerStudioNotebook","PartnerStudioProducts","PartnerStudioInvitation",
  "departmentsForPartner","partnersForDepartment","source-rights, exact-identity and owner-release"])
  assert.ok(page.includes(required),"missing merchant page control: "+required);
 assert.ok(page.includes("products=data"));
 assert.ok(page.includes("if(ids.length)"));
 assert.ok(page.includes("publicPageMetadata"),"supplier studio must use central indexable canonical metadata");
 assert.ok(page.includes("path:`/partners/${partner.slug}`"),"supplier canonical must be individual");
 assert.match(read("lib/site/seo.ts"),/index=true/);
 assert.ok(page.includes("generateStaticParams"));
 assert.ok(experience.includes("products.filter(p=>p.imageUrl)"));
 assert.ok(experience.includes("imageUrl"));
 assert.ok(experience.includes("Item price, delivery may be extra"));
 assert.ok(experience.includes("No matching offer currently passes AVUQO"));
 assert.ok(experience.includes("independent organic comparisons"));
 assert.ok(experience.includes("referrerPolicy=\"no-referrer\""));
 assert.ok(experience.includes("/contact"));
 assert.ok(experience.includes("/advertise"));
 assert.ok(publicCatalog.includes("approval.status!==\"approved\""));
 assert.ok(publicCatalog.includes("ownAffiliateLink"));
 assert.doesNotMatch(page+experience,/feed_import_records|raw_data|private_image|suppressedOffer|\bcommission_rate\b/);
});
test("all 21 bespoke visual motifs exist without replacing original AVUQO theme",()=>{
 const css=read("app/partners/studios.module.css");
 const directoryCss=read("app/partners/partners.module.css");
 const directory=read("components/partners/RetailerCatalogueBrowser.tsx");
 for(const studio of Object.values(PARTNER_STUDIOS))
  assert.ok(css.includes('.hero[data-scene="'+studio.scene+'"]'),studio.scene+" missing visual treatment");
 assert.match(css,/--accent/);
 assert.match(css,/Georgia/);
 assert.match(css,/#fbf7f1/);
 assert.match(css,/@media\(max-width:560px\)/);
 assert.match(css,/prefers-reduced-motion/);
 assert.match(directory,/partnerStudio\(p.slug\)/);
 assert.match(directory,/directoryWatermark/);
 assert.match(directoryCss,/cardEdition/);
 assert.match(read("app/partners/page.tsx"),/RetailerCatalogueBrowser/);
});
test("verified canonical comparison still shows different sellers while adding studio return links",()=>{
 const product=read("app/products/[slug]/page.tsx");
 assert.match(product,/studioForVerifiedMerchant\(x.published.merchant\)/);
 assert.match(product,/partnerHref\(studio\)/);
 assert.match(product,/comparison\.ordered/);
 assert.match(product,/\/go\/\$\{x.offer.id\}/);
 assert.match(product,/compareEligibleOffers/);
 assert.match(read("app/products/[slug]/page.module.css"),/studioLink/);
});

test("ordinary retail offers enrich studios without bypassing admission",()=>{const page=read("app/partners/[slug]/page.tsx");const experience=read("components/partners/PartnerStudioExperience.tsx");assert.match(page,/ordinaryShoppingPage\(\{merchant:partner.slug\}\)/);assert.match(page,/seenProducts.has\(item.productId\)/);assert.match(page,/detailHref:"\/shop\/offer\/"/);assert.match(experience,/p.detailHref\?\?/);assert.match(read("app/categories/[department]/products/page.tsx"),/partnersForDepartment\(department\)/);});
