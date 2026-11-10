import {BROWSE_DEPARTMENTS,type BrowseDepartment} from "../categories/browse-tree.ts";
import type {PublicOffer,PublicProduct} from "./public-catalog";

/** Consumer and owner templates, never a claim that any department has live offers. */
export type ProductFamily="goods"|"service"|"regulated"|"travel"|"safety";
export type DepartmentBlueprint={
 slug:string;name:string;family:ProductFamily;focus:string;checklist:readonly string[];
 visual:string;aliases:readonly string[];
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
const ART:Record<ProductFamily,string>={
 goods:"https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1300&q=80",
 service:"https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1300&q=80",
 regulated:"https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1300&q=80",
 travel:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1300&q=80",
 safety:"https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=1300&q=80"
};
export const DEPARTMENT_BLUEPRINTS:readonly DepartmentBlueprint[]=BROWSE_DEPARTMENTS.map(d=>{
 const f=FOCUS[d.slug];if(!f)throw Error("Missing AVUQO department blueprint: "+d.slug);
 return {slug:d.slug,name:d.name,focus:f.focus,family:f.family,checklist:f.checklist,
   visual:ART[f.family],aliases:[d.slug,d.name,...f.aliases??[]]};
});
export function departmentBlueprint(slug:string):DepartmentBlueprint|undefined{
 return DEPARTMENT_BLUEPRINTS.find(d=>d.slug===slug);
}
export function normalisedDepartment(value:string):string{
 return value.normalize("NFKD").toLowerCase().replace(/&/g,"and").replace(/[^a-z0-9]+/g," ").trim();
}
/** Never infer commercial category from a product title. Only explicit offer/category labels. */
export function eligibleDepartmentProduct(
 department:Pick<DepartmentBlueprint,"aliases">,
 item:{product:Pick<PublicProduct,"product_type">;offers:Pick<PublicOffer,"published">[]}
):boolean{
 const accepted=new Set(department.aliases.map(normalisedDepartment));
 return item.offers.some(o=>accepted.has(normalisedDepartment(o.published.category)))||
  (typeof item.product.product_type==="string" &&
   accepted.has(normalisedDepartment(item.product.product_type)));
}
export function identifiedDepartment(
 item:{product:Pick<PublicProduct,"product_type">;offers:Pick<PublicOffer,"published">[]}
):DepartmentBlueprint|undefined{
 const matched=DEPARTMENT_BLUEPRINTS.filter(d=>eligibleDepartmentProduct(d,item));
 // Ambiguous category memberships must not create a false product classification.
 return matched.length===1?matched[0]:undefined;
}
export function departmentHref(d:Pick<BrowseDepartment,"slug">){return "/categories/"+d.slug+"/products";}
