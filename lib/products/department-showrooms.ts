import {BROWSE_DEPARTMENTS,type BrowseDepartment} from "../categories/browse-tree.ts";
import {lifestylePages} from "../lifestyle/landing-data.ts";
import type {PublicOffer,PublicProduct} from "./public-catalog";

/** Consumer and owner templates, never a claim that any department has live offers. */
export type ProductFamily="goods"|"service"|"regulated"|"travel"|"safety";
export type DepartmentBlueprint={
 slug:string;name:string;family:ProductFamily;focus:string;checklist:readonly string[];
 visual:string;theme:BrowseDepartment["theme"];intro:string;aliases:readonly string[];
};
const FOCUS:Record<string,{family:ProductFamily;focus:string;checklist:readonly string[];aliases?:readonly string[]}>={
 "baby-nursery":{family:"safety",focus:"Safety, age and the right fit for your family",checklist:["Check age and weight limits and applicable safety standards.","Confirm the exact model, included pieces and care guidance.","Review delivery, returns and any assembly requirements."],aliases:["baby","nursery"]},
 beauty:{family:"goods",focus:"Ingredients, shade, size and your routine",checklist:["Verify ingredients, volume and shade for the exact variant.","Check directions, suitability and sensitivities.","Compare pack size, returns and the complete cost."],aliases:["beauty","health and beauty"]},
 "books-media":{family:"goods",focus:"The right edition, format and language",checklist:["Check edition, ISBN or media format where supplied.","Verify region, device and language compatibility.","Compare condition and delivery terms."]},
 "business-industrial":{family:"safety",focus:"Commercial suitability and verified specifications",checklist:["Check load, electrical and technical specifications.","Confirm applicable standards and installation requirements.","Check business pricing, warranty and delivery exclusions."]},
 "connectivity-utilities":{family:"service",focus:"Whole-contract costs and service eligibility",checklist:["Check address coverage and exact contract duration.","Include setup, annual rises and termination fees.","Compare provider terms, not unverified headline savings."]},
 crafts:{family:"goods",focus:"Materials, kit contents and the finished project",checklist:["Check contents, tools required and material sizes.","Read age guidance and handling or safety advice.","Compare pack quantity, shipping and restocking costs."]},
 "diy-building":{family:"safety",focus:"Dimensions, materials and safe use",checklist:["Verify part numbers, sizes, capacity and compatibility.","Follow product safety instructions and professional requirements.","Check accessories, delivery weight and returns."]},
 experiences:{family:"travel",focus:"Dates, access and what's included",checklist:["Check venue, date, duration and age or access restrictions.","Confirm what's included and cancellation conditions.","Verify booking availability and any extra fees."]},
 fashion:{family:"goods",focus:"Fit, fabric and lasting usefulness",checklist:["Confirm sizing against the retailer's actual size chart.","Check fabric composition, colour and care.","Review delivery charges, exchanges and returns."]},
 "garden-outdoors":{family:"goods",focus:"Weather resistance, space and maintenance",checklist:["Measure the space and check dimensions.","Compare materials, weather and safety ratings.","Check assembly, delivery and ongoing maintenance."]},
 gifts:{family:"goods",focus:"Something thoughtful for the person and occasion",checklist:["Check age, interest and personalisation options.","Confirm exactly what is included.","Review dispatch dates and gift returns."]},
 "grocery-food":{family:"goods",focus:"Pack quantity, price per unit and availability",checklist:["Match the exact pack size and store condition.","Check ingredient, allergen and dietary information.","Use complete basket totals, never incomplete comparison claims."],aliases:["grocery","groceries","supermarket","food and drink"]},
 "health-wellbeing":{family:"safety",focus:"Suitability, product information and safe use",checklist:["Check instructions, contraindications and product classification.","Compare the exact pack and strength where relevant.","Seek qualified advice for medical questions; never assume treatment effectiveness."]},
 home:{family:"goods",focus:"Dimensions, materials and your daily space",checklist:["Measure for fit and access.","Check energy use, assembly and care requirements.","Compare delivery and installation fees."],aliases:["home and garden","home and living"]},
 "home-services":{family:"service",focus:"Provider qualifications and written scope",checklist:["Verify trade credentials, insurance and location coverage.","Request a written scope, materials and total quote.","Check complaint procedures and cancellation terms."]},
 "insurance-finance":{family:"regulated",focus:"Eligibility, exclusions and regulated terms",checklist:["Confirm the provider's authorisation where relevant.","Review excess, exclusions and total ongoing costs.","Read regulated disclosures and never treat editorial guidance as an offer."]},
 "learning-education":{family:"service",focus:"Accreditation, access and course outcomes",checklist:["Confirm provider credentials and course requirements.","Check materials, software and device compatibility.","Compare access period, refund terms and whole course cost."]},
 motoring:{family:"safety",focus:"Exact vehicle compatibility and whole-life cost",checklist:["Check fitment and manufacturer specifications.","Account for installation, running costs and insurance.","Treat finance or lease amounts as quotes only when authorised."]},
 "musical-instruments":{family:"goods",focus:"Skill level, size and compatibility",checklist:["Check the exact model, tuning and included accessories.","Consider fit, amplification and maintenance.","Review condition, warranty and shipping."]},
 "office-stationery":{family:"goods",focus:"Format, size and replenishment",checklist:["Check paper and cartridge compatibility.","Compare units, dimensions and refill availability.","Include delivery, minimum order and VAT when applicable."]},
 pets:{family:"safety",focus:"Species, size and safe care",checklist:["Verify suitability for the specific animal, age and size.","Check ingredients, materials and care instructions.","Compare replaceable filters, feeding portions and ongoing costs."]},
 "sports-fitness":{family:"safety",focus:"Activity fit, safety and comfort",checklist:["Check size, load and intended activity.","Read assembly, protection and maintenance guidance.","Compare repair and replacement-part availability."]},
 tech:{family:"goods",focus:"Exact model, connectivity and useful life",checklist:["Verify model, configuration and compatibility.","Check battery, software support and warranty.","Include subscriptions and accessories in the real cost."],aliases:["electronics","technology","electronics and tech","technology and electronics"]},
 "toys-games":{family:"safety",focus:"Age suitability, safe play and durability",checklist:["Check age recommendations and choking or battery warnings.","Confirm the exact edition, pieces and compatibility.","Review care, materials and returns."]},
 travel:{family:"travel",focus:"Dates, travellers and complete booking costs",checklist:["Check dates, route, traveller mix and availability.","Include baggage, transfers and local charges.","Read cancellations, accessibility and provider conditions."]}
};
// Editorial illustrations only. Merchant photos are sourced independently from approved offers.
const editorialPhoto=(id:string)=>`https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1100&h=740&q=80`;
const DEPARTMENT_ART:Record<string,string>={
 "baby-nursery":editorialPhoto("1522771930-78848d9293e8"),
 "books-media":editorialPhoto("1507842217343-583bb7270b66"),
 "business-industrial":editorialPhoto("1581092921461-eab62e97a780"),
 "connectivity-utilities":editorialPhoto("1544197150-b99a580bb7a8"),
 "crafts":editorialPhoto("1513364776144-60967b0f800f"),
 "diy-building":editorialPhoto("1504148455328-c376907d081c"),
 "garden-outdoors":editorialPhoto("1416879595882-3373a0480b5b"),
 "grocery-food":editorialPhoto("1542838132-92c53300491e"),
 "health-wellbeing":editorialPhoto("1571019613454-1cb2f99b2d8b"),
 "home-services":editorialPhoto("1621905251189-08b45d6a269e"),
 "insurance-finance":editorialPhoto("1450101499163-c8848c66ca85"),
 "learning-education":editorialPhoto("1503676260728-1c00da094a0b"),
 "musical-instruments":editorialPhoto("1510915361894-db8b60106cb1"),
 "office-stationery":editorialPhoto("1456735190827-d1262f71b8a3"),
 "pets":editorialPhoto("1548199973-03cce0bbc87b"),
 "sports-fitness":editorialPhoto("1517836357463-d25dfeac3438"),
 "beauty":lifestylePages.beauty.hero,
 "experiences":lifestylePages.experiences.hero,
 "fashion":lifestylePages.fashion.hero,
 "gifts":lifestylePages.gifts.hero,
 "home":lifestylePages.home.hero,
 "motoring":lifestylePages.motoring.hero,
 "tech":lifestylePages.tech.hero,
 "toys-games":lifestylePages.toys.hero,
 "travel":lifestylePages.travel.hero,
};
export const DEPARTMENT_BLUEPRINTS:readonly DepartmentBlueprint[]=BROWSE_DEPARTMENTS.map(d=>{
 const f=FOCUS[d.slug];const visual=DEPARTMENT_ART[d.slug];if(!f||!visual)throw Error("Missing AVUQO department blueprint: "+d.slug);
 return {slug:d.slug,name:d.name,focus:f.focus,family:f.family,checklist:f.checklist,
   visual,theme:d.theme,intro:d.intro,aliases:[d.slug,d.name,...(f.aliases??[])]};
});
export function departmentBlueprint(slug:string):DepartmentBlueprint|undefined{
 return DEPARTMENT_BLUEPRINTS.find(d=>d.slug===slug);
}
export function normalisedDepartment(value:string):string{
 return value.normalize("NFKD").toLowerCase().replace(/&/g,"and").replace(/[^a-z0-9]+/g," ").trim();
}
type CategoryLabels={
 product:Pick<PublicProduct,"product_type">;
 offers:{published:Pick<PublicOffer["published"],"category">}[];
};
const TYPE_DEPARTMENTS:Readonly<Record<string,string>>={
 headphones:"tech", smartphone:"tech", smartwatch:"tech", laptop:"tech", television:"tech",
 "phone accessories":"tech", "air fryer":"home", furniture:"home", "washing machine":"home",
 "pet food":"pets", "dog food":"pets", "cat food":"pets", "pet feeder":"pets",
 book:"books-media", books:"books-media", toy:"toys-games", "board game":"toys-games",
 drill:"diy-building", "power tool":"diy-building", guitar:"musical-instruments",
 perfume:"beauty", skincare:"beauty", footwear:"fashion", apparel:"fashion", automotive:"motoring",
 tyre:"motoring", tyres:"motoring", tire:"motoring", tires:"motoring", "car tyre":"motoring", "car tyres":"motoring", "vehicle tyre":"motoring", "vehicle tyres":"motoring",
};
export function departmentForLabel(label:string){
 const value=normalisedDepartment(label);
 return departmentBlueprint(TYPE_DEPARTMENTS[value]??"")??
  DEPARTMENT_BLUEPRINTS.find(d=>d.aliases.some(alias=>normalisedDepartment(alias)===value));
}

export function classifiedDepartmentSlugs(item:CategoryLabels):Set<string>{
 const labels=[item.product.product_type??"",...item.offers.flatMap(o=>{
  // A breadcrumb is rooted in its parent department. Its final segment may supply a subtype.
  const segments=o.published.category.split(/\s*(?:>|›|\/)\s*/);
  return departmentForLabel(segments[0])?[segments[0]]:segments.slice(-1);
 })];
 return new Set(labels.map(departmentForLabel).flatMap(d=>d?[d.slug]:[]));
}

/** Only structured product types and published categories may establish membership. */
export function identifiedDepartment(item:CategoryLabels):DepartmentBlueprint|undefined{
 const matches=classifiedDepartmentSlugs(item);
 return matches.size===1?departmentBlueprint([...matches][0]):undefined;
}
export function eligibleDepartmentProduct(department:Pick<DepartmentBlueprint,"slug">,item:CategoryLabels):boolean{
 return identifiedDepartment(item)?.slug===department.slug;
}
export function departmentHref(d:Pick<BrowseDepartment,"slug">){return "/categories/"+d.slug+"/products";}
