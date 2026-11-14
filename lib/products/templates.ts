import type {PublicProduct,PublicOffer} from "./public-catalog";
import {classifiedDepartmentSlugs,departmentBlueprint,departmentForLabel,normalisedDepartment} from "./department-showrooms.ts";
export type ProductTemplate="tech"|"home"|"beauty"|"grocery"|"tyres"|"motoring"|"travel"|"pets"|"fashion"|"gifts"|"general";
export type ProductPresentation={
 template:ProductTemplate;eyebrow:string;sectionHeading:string;sectionIntro:string;practicalTitle:string;
 practicalPoints:readonly string[];groupHeading:string;imageShape:"square"|"portrait"|"wide";specPriority:readonly string[];department?:ReturnType<typeof departmentBlueprint>;
};
const TEMPLATES:Record<ProductTemplate,ProductPresentation>={
 tech:{template:"tech",eyebrow:"A closer look at the technology",sectionHeading:"The details that make a difference.",sectionIntro:"Compare the exact model and configuration, not just a shared product name.",practicalTitle:"Before adding it to your basket",practicalPoints:["Confirm the exact model, version, size and storage option.","Check included accessories, compatibility and warranty terms.","Consider running costs, repairability and delivery."],groupHeading:"Technical specifications",imageShape:"square",specPriority:["model","screen_size","storage","memory","processor","battery","connectivity","warranty"]},
 home:{template:"home",eyebrow:"For a home that feels right",sectionHeading:"Comfort, fit and everyday use.",sectionIntro:"Picture how this product fits into your space, habits and household.",practicalTitle:"Worth considering for the home",practicalPoints:["Measure the space and check dimensions carefully.","Check materials, care instructions and delivery or installation.","Look at long-term running costs and returns."],groupHeading:"Home & product details",imageShape:"wide",specPriority:["dimensions","material","colour","capacity","power","care","warranty"]},
 beauty:{template:"beauty",eyebrow:"Everyday care, thoughtfully chosen",sectionHeading:"Look beyond the packaging.",sectionIntro:"Check the product size and ingredients information supplied by the source.",practicalTitle:"Make a considered beauty choice",practicalPoints:["Check the formulation and full ingredients list on the actual retailer packaging.","Compare volume or weight and the exact variant.","Consider suitability, directions and returns before purchasing."],groupHeading:"Formulation & product information",imageShape:"portrait",specPriority:["ingredients","volume","size","shade","skin_type","usage","expiry"]},
 grocery:{template:"grocery",eyebrow:"From the pantry to the table",sectionHeading:"Make the weekly shop clearer.",sectionIntro:"Pack sizes, multipacks and unit costs matter as much as the shelf price.",practicalTitle:"Check the basket details",practicalPoints:["Compare the same pack size and quantity at each retailer.","Check loyalty conditions and store-specific availability.","Compare price per unit only when a verified unit size is provided."],groupHeading:"Pack & product information",imageShape:"square",specPriority:["pack_size","net_weight","size","quantity","unit_price","unit","ingredients","allergens"]},
 tyres:{template:"tyres",eyebrow:"Tyres that fit your needs",sectionHeading:"The right specification comes first.",sectionIntro:"Tyre dimensions, load and speed ratings must match the vehicle. Compare a current, properly specified tyre rather than a model name alone.",practicalTitle:"Before you choose tyres",practicalPoints:["Confirm approved tyre dimensions and load/speed ratings with the vehicle guidance.","Check the exact season, run-flat and reinforced specification against manufacturer evidence.","Compare genuine current delivered or fitted prices including applicable extras."],groupHeading:"Verified tyre specifications",imageShape:"square",specPriority:["tyre_width_mm","tyre_profile","tyre_rim_inches","load_index","speed_rating","season","run_flat","xl","wet_grip","noise_db"]},
 motoring:{template:"motoring",eyebrow:"Life on the road",sectionHeading:"The whole journey matters.",sectionIntro:"Think beyond an advertised price to suitability, running costs and terms.",practicalTitle:"Motoring checklist",practicalPoints:["Verify the exact model, condition, mileage and relevant identifiers.","Account for fuel, charging, insurance, servicing and taxes.","For finance or leasing, review regulated terms with an authorised provider."],groupHeading:"Vehicle details",imageShape:"wide",specPriority:["make","model","year","mileage","fuel_type","transmission","condition","warranty"]},
 travel:{template:"travel",eyebrow:"A more considered escape",sectionHeading:"Every detail of the journey.",sectionIntro:"Travel products need dates, inclusions and restrictions, not just an enticing starting price.",practicalTitle:"Before you book",practicalPoints:["Check dates, location, traveller count and availability.","Read baggage, transfer, cancellation and extra-fee terms.","Verify booking conditions directly before making payment."],groupHeading:"Trip & booking details",imageShape:"wide",specPriority:["destination","dates","duration","guests","included","cancellation","baggage"]},
 pets:{template:"pets",eyebrow:"For our everyday companions",sectionHeading:"Care that fits them.",sectionIntro:"Think about suitability, size, materials and practical ongoing use.",practicalTitle:"Check before choosing",practicalPoints:["Confirm species, age, size and any compatibility restrictions.","Read materials, ingredients or care instructions where applicable.","Compare pack sizes and ongoing cost, not just one purchase."],groupHeading:"Pet product details",imageShape:"portrait",specPriority:["species","breed_size","age","weight","ingredients","dimensions","material"]},
 fashion:{template:"fashion",eyebrow:"Style that feels like you",sectionHeading:"Find the fit, not just the trend.",sectionIntro:"Size, fabric, care and everyday wear can matter much more than a discount tag.",practicalTitle:"The wardrobe checklist",practicalPoints:["Check the retailer's size guide and exact fit.","Read fabric composition and care instructions.","Consider delivery and returns, especially for multiple sizes."],groupHeading:"Fit & material details",imageShape:"portrait",specPriority:["size","fit","material","fabric","colour","care","length"]},
 gifts:{template:"gifts",eyebrow:"The art of thoughtful giving",sectionHeading:"A little thought goes a long way.",sectionIntro:"Make the present fit the person and the occasion rather than the sale.",practicalTitle:"Before wrapping it up",practicalPoints:["Check the recipient's interests and age suitability.","Confirm what is included, delivery dates and gift options.","Check returns and any personalisation conditions."],groupHeading:"Gift & product details",imageShape:"portrait",specPriority:["recipient","age","occasion","material","size","included","personalisation"]},
 general:{template:"general",eyebrow:"A little more information",sectionHeading:"Know what you are comparing.",sectionIntro:"Use the available product details to check you're comparing the same item.",practicalTitle:"Things worth checking",practicalPoints:["Confirm the model, variant and included items.","Account for delivery and applicable charges.","Check returns, warranty and current retailer terms."],groupHeading:"Product details",imageShape:"square",specPriority:["model","size","material","warranty","specifications"]},
};
const DEPARTMENT_TEMPLATES:Readonly<Record<string,ProductTemplate>>={
 tech:"tech",home:"home",beauty:"beauty","grocery-food":"grocery",motoring:"motoring",
 travel:"travel",pets:"pets",fashion:"fashion",gifts:"gifts",
};
type ProductDetail=Pick<ProductPresentation,"sectionHeading"|"groupHeading"|"specPriority">;
const PRODUCT_DETAILS:Readonly<Record<string,ProductDetail>>={
 headphones:{sectionHeading:"Comfort, listening time and connection",groupHeading:"Headphone specifications",specPriority:["noise_cancellation","battery","connectivity","weight","codec"]},
 laptop:{sectionHeading:"Performance for the work you do",groupHeading:"Laptop configuration",specPriority:["processor","memory","storage","screen_size","battery","weight"]},
 smartwatch:{sectionHeading:"The right fit for your wrist and phone",groupHeading:"Watch compatibility and features",specPriority:["case_size","connectivity","compatibility","battery","water_resistance"]},
 "washing machine":{sectionHeading:"Fit, loads and running costs",groupHeading:"Installation and laundry specifications",specPriority:["installation_type","dimensions","capacity","energy_rating","spin_speed","noise_db"]},
 "air fryer":{sectionHeading:"Capacity, controls and worktop space",groupHeading:"Air fryer specifications",specPriority:["capacity","dimensions","power","programmes","care"]},
 "pet food":{sectionHeading:"Food suited to your pet and their life stage",groupHeading:"Feeding and pack details",specPriority:["species","age","ingredients","net_weight","feeding_guide"]},
 "dog food":{sectionHeading:"Food suited to your dog and their life stage",groupHeading:"Feeding and pack details",specPriority:["species","age","ingredients","net_weight","feeding_guide"]},
 "cat food":{sectionHeading:"Food suited to your cat and their life stage",groupHeading:"Feeding and pack details",specPriority:["species","age","ingredients","net_weight","feeding_guide"]},
};
const DEPARTMENT_FIELDS:Readonly<Record<string,readonly string[]>>={
 "baby-nursery":["age","weight_limit","dimensions","safety_standard","care"],
 "books-media":["isbn","edition","format","language","condition"],
 "business-industrial":["model","capacity","voltage","dimensions","standards"],
 "connectivity-utilities":["coverage","contract_length","speed","setup_fee","cancellation"],
 crafts:["material","contents","dimensions","required_tools","age"],
 "diy-building":["model","dimensions","material","compatibility","power"],
 experiences:["venue","duration","age","accessibility","included","cancellation"],
 "garden-outdoors":["dimensions","material","weather_resistance","assembly","care"],
 "health-wellbeing":["size","strength","ingredients","usage","warnings"],
 "home-services":["service_area","scope","duration","included","cancellation"],
 "insurance-finance":["provider","cover","excess","eligibility","exclusions"],
 "learning-education":["level","duration","accreditation","access_period","requirements"],
 "musical-instruments":["model","instrument_type","size","tuning","connectivity"],
 "office-stationery":["format","size","compatibility","quantity","refill"],
 "sports-fitness":["size","weight_limit","material","assembly","activity"],
 "toys-games":["age","players","edition","piece_count","batteries","warnings"],
};
const TYRE_LABEL=/^(?:tyres?|tires?|car tyres?|vehicle tyres?)$/;
type OfferCategory={published:Pick<PublicOffer["published"],"category">};
export function chooseProductTemplate(
 product:Pick<PublicProduct,"product_type"|"canonical_title">,offers:OfferCategory[],
):ProductPresentation{
 const type=normalisedDepartment(product.product_type??"");
 const matches=classifiedDepartmentSlugs({product,offers});
 if(matches.size!==1)return TEMPLATES.general;
 const department=departmentBlueprint([...matches][0]);
 if(!department)return TEMPLATES.general;

 const isTyre=department.slug==="motoring"&&(TYRE_LABEL.test(type)||offers.some(({published})=>
  TYRE_LABEL.test(normalisedDepartment(published.category.split(/[>›/]/).at(-1)??""))));
 if(isTyre)return {...TEMPLATES.tyres,department};

 const categoryTypes=offers.map(({published})=>normalisedDepartment(published.category.split(/[>›/]/).at(-1)??""));
 const explicitDetail=Object.hasOwn(PRODUCT_DETAILS,type)?PRODUCT_DETAILS[type]:undefined;
 const subtypes=[...new Set(categoryTypes.filter(label=>Object.hasOwn(PRODUCT_DETAILS,label)&&departmentForLabel(label)?.slug===department.slug))];
 const detail=explicitDetail??(subtypes.length===1?PRODUCT_DETAILS[subtypes[0]]:undefined);
 const template=DEPARTMENT_TEMPLATES[department.slug];
 if(template)return {...TEMPLATES[template],...(detail&&{...detail,sectionIntro:"Check which specifications apply to this exact variant."}),department};

 return {
  ...TEMPLATES.general,
  eyebrow:department.name,
  sectionHeading:department.focus,
  sectionIntro:department.intro,
  practicalPoints:department.checklist,
  groupHeading:`${department.name} details`,
  imageShape:department.family==="service"||department.family==="travel"?"wide":"square",
  specPriority:DEPARTMENT_FIELDS[department.slug]??TEMPLATES.general.specPriority,
  department,
 };
}
export function validatedSpecificationEntries(value:unknown,priority:readonly string[]):[string,string][]{
 if(!value||typeof value!=="object"||Array.isArray(value))return [];
 const records=Object.entries(value as Record<string,unknown>).filter(([key,val])=>/^[a-z0-9_ -]{2,60}$/i.test(key)&&["string","number","boolean"].includes(typeof val)&&String(val).trim().length>0&&String(val).length<=160)
 .map(([key,val])=>[key,String(val)] as [string,string]);
 const rank=(key:string)=>{const i=priority.indexOf(key.toLowerCase().replaceAll(" ","_"));return i<0?99:i;};
 return records.sort((a,b)=>rank(a[0])-rank(b[0])).slice(0,16);
}
