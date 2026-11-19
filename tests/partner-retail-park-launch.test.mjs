import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 PARTNERS,PARTNER_BY_SLUG,PARTNER_PROMOTIONS,activePartnerPromotions,
 isApprovedPartnerLink,HOLIDAY_EXTRAS_AWIN,TOOLED_EINHELL_AWIN
} from "../lib/partners/advertiser-directory.ts";
import {DEFAULT_NAVIGATION,parseNavigation,isValidNavigation} from "../lib/content/navigation.ts";
const read=path=>readFileSync(path,"utf8");
test("all 21 owner-attested Awin advertisers have distinct public destinations and unique visual themes",()=>{
 assert.equal(PARTNERS.length,21);
 assert.equal(new Set(PARTNERS.map(p=>p.slug)).size,21);
 assert.equal(PARTNER_BY_SLUG.size,21);
 assert.equal(new Set(PARTNERS.map(p=>p.name)).size,21);
 assert.equal(new Set(PARTNERS.map(p=>p.accent+p.deep+p.glow)).size,21);
 assert.ok(PARTNERS.every(p=>p.description.length>40&&p.whatToCheck.length>40&&p.topics.length>0));
 assert.ok(PARTNERS.every(p=>/^\/[a-z0-9/-]+$/.test(p.categoryHref)));
 assert.ok(PARTNERS.every(p=>p.links.every(isApprovedPartnerLink)));
});
test("supplied own-publisher tracking links cannot be replaced with another publisher ID",()=>{
 assert.equal(isApprovedPartnerLink({label:"Holiday Extras",kind:"approved_awin",href:HOLIDAY_EXTRAS_AWIN}),true);
 assert.equal(isApprovedPartnerLink({label:"Tooled",kind:"approved_awin",href:TOOLED_EINHELL_AWIN}),true);
 assert.equal(isApprovedPartnerLink({label:"spoof",kind:"approved_awin",href:HOLIDAY_EXTRAS_AWIN.replace("3135746","9999999")}),false);
 assert.equal(isApprovedPartnerLink({label:"spoof",kind:"approved_awin",href:HOLIDAY_EXTRAS_AWIN.replace("awinmid=3496","awinmid=3497")}),false);
 assert.equal(PARTNER_BY_SLUG.get("holiday-extras")?.advertiserId,"3496");
 assert.equal(PARTNER_BY_SLUG.get("lyca-mobile")?.advertiserId,"128157");
});
test("date-bound PlayPress and Tooled Up promotions expire, undated Holiday Extras terms are not a live price",()=>{
 assert.equal(activePartnerPromotions(new Date("2026-11-19T22:00:00Z")).length,4);
 assert.ok(activePartnerPromotions(new Date("2027-01-02T00:00:00Z")).every(x=>x.slug==="holiday-extras"));
 assert.ok(PARTNER_PROMOTIONS.every(x=>!x.detail.match(/£\d+\.\d+\s*(today|current)/i)));
 assert.ok(PARTNER_PROMOTIONS.some(x=>x.code==="PLAY10"));
 assert.ok(PARTNER_PROMOTIONS.some(x=>x.code==="EIN15PCDD"));
 assert.ok(PARTNER_PROMOTIONS.some(x=>x.code===undefined&&x.slug==="holiday-extras"));
});
test("legacy owner-customised navigation safely gains new partner and mobile links",()=>{
 const old=structuredClone(DEFAULT_NAVIGATION);
 const newHrefs=["/partners","/mobile","/partners/holiday-extras","/partners#travel"];
 for(const group of old.groups)group.links=group.links.filter(x=>!newHrefs.includes(x.href));
 old.groups[0].label="Explore independently";
 old.groups[0].links[0].enabled=false;
 const newNav=parseNavigation(old);
 assert.equal(isValidNavigation(newNav),true);
 assert.equal(newNav.groups[0].label,"Explore independently");
 assert.equal(newNav.groups[0].links[0].enabled,false);
 assert.ok(newNav.groups.some(g=>g.links.some(l=>l.href==="/mobile")));
 assert.ok(newNav.groups.some(g=>g.links.some(l=>l.href==="/partners/holiday-extras")));
 assert.equal(parseNavigation({schemaVersion:2,groups:[]}),DEFAULT_NAVIGATION);
});
test("public partner pages reuse already verified offers and never read raw private feeds",()=>{
 const detail=read("app/partners/[slug]/page.tsx");
 const catalog=read("lib/products/public-catalog.ts");
 assert.match(detail,/verifiedOffersForAdvertiser/);
 assert.match(detail,/connection\(\)/);
 assert.match(detail,/source-rights, exact-identity and owner-release/);
 assert.match(catalog,/export async function verifiedOffersForAdvertiser/);
 assert.match(catalog,/return verifiedOffers\(\{offerIds:/);
 assert.match(catalog,/approval\.status!=="approved"/);
 assert.match(catalog,/ownAffiliateLink/);
 assert.doesNotMatch(detail,/feed_import_records|private_rows|\.from\("offers"\)/);
});
test("home, shopping, travel, motoring, broadband, sales and menu expose verified routes",()=>{
 const expected=[
 ["app/page.tsx","PartnerPromoShelf"],
 ["app/shopping/page.tsx","PartnerLinkShelf"],
 ["app/travel/page.tsx","PartnerPromoShelf"],
 ["app/motoring/page.tsx","PartnerLinkShelf"],
 ["app/broadband/page.tsx","PartnerLinkShelf"],
 ["components/editorial/SeasonalLanding.tsx","PartnerPromoShelf"],
 ["lib/content/navigation.ts","/partners"],
 ["app/mobile/page.tsx","/compare"],
 ["app/sitemap.ts","PARTNERS"]
 ];
 for(const [file,pattern] of expected)assert.ok(read(file).includes(pattern),file);
 assert.match(read("app/partners/page.tsx"),/PARTNERS/);
 assert.match(read("app/partners/[slug]/page.tsx"),/generateStaticParams/);
});
