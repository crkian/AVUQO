import type {PublicProduct,PublicOffer} from "./public-catalog";
export type ProductTemplate="tech"|"home"|"beauty"|"grocery"|"motoring"|"travel"|"pets"|"general";
export type ProductPresentation={
 template:ProductTemplate;eyebrow:string;sectionHeading:string;sectionIntro:string;practicalTitle:string;
 practicalPoints:readonly string[];groupHeading:string;imageShape:"square"|"portrait"|"wide";specPriority:readonly string[];
};
const TEMPLATES:Record<ProductTemplate,ProductPresentation>={
 tech:{template:"tech",eyebrow:"A closer look at the technology",sectionHeading:"The details that make a difference.",sectionIntro:"Compare the exact model and configuration, not just a shared product name.",practicalTitle:"Before adding it to your basket",practicalPoints:["Confirm the exact model, version, size and storage option.","Check included accessories, compatibility and warranty terms.","Consider running costs, repairability and delivery."],groupHeading:"Technical specifications",imageShape:"square",specPriority:["model","screen_size","storage","memory","processor","battery","connectivity","warranty"]},
 home:{template:"home",eyebrow:"For a home that feels right",sectionHeading:"Comfort, fit and everyday use.",sectionIntro:"Picture how this product fits into your space, habits and household.",practicalTitle:"Worth considering for the home",practicalPoints:["Measure the space and check dimensions carefully.","Check materials, care instructions and delivery or installation.","Look at long-term running costs and returns."],groupHeading:"Home & product details",imageShape:"wide",specPriority:["dimensions","material","colour","capacity","power","care","warranty"]},
 beauty:{template:"beauty",eyebrow:"Everyday care, thoughtfully chosen",sectionHeading:"Look beyond the packaging.",sectionIntro:"Check the product size and ingredients information supplied by the source.",practicalTitle:"Make a considered beauty choice",practicalPoints:["Check the formulation and full ingredients list on the actual retailer packaging.","Compare volume or weight and the exact variant.","Consider suitability, directions and returns before purchasing."],groupHeading:"Formulation & product information",imageShape:"portrait",specPriority:["ingredients","volume","size","shade","skin_type","usage","expiry"]},
 grocery:{template:"grocery",eyebrow:"From the pantry to the table",sectionHeading:"Make the weekly shop clearer.",sectionIntro:"Pack sizes, multipacks and unit costs matter as much as the shelf price.",practicalTitle:"Check the basket details",practicalPoints:["Compare the same pack size and quantity at each retailer.","Check loyalty conditions and store-specific availability.","Compare price per unit only when a verified unit size is provided."],groupHeading:"Pack & product information",imageShape:"square",specPriority:["pack_size","net_weight","size","quantity","unit_price","unit","ingredients","allergens"]},
 motoring:{template:"motoring",eyebrow:"Life on the road",sectionHeading:"The whole journey matters.",sectionIntro:"Think beyond an advertised price to suitability, running costs and terms.",practicalTitle:"Motoring checklist",practicalPoints:["Verify the exact model, condition, mileage and relevant identifiers.","Account for fuel, charging, insurance, servicing and taxes.","For finance or leasing, review regulated terms with an authorised provider."],groupHeading:"Vehicle details",imageShape:"wide",specPriority:["make","model","year","mileage","fuel_type","transmission","condition","warranty"]},
 travel:{template:"travel",eyebrow:"A more considered escape",sectionHeading:"Every detail of the journey.",sectionIntro:"Travel products need dates, inclusions and restrictions, not just an enticing starting price.",practicalTitle:"Before you book",practicalPoints:["Check dates, location, traveller count and availability.","Read baggage, transfer, cancellation and extra-fee terms.","Verify booking conditions directly before making payment."],groupHeading:"Trip & booking details",imageShape:"wide",specPriority:["destination","dates","duration","guests","included","cancellation","baggage"]},
 pets:{template:"pets",eyebrow:"For our everyday companions",sectionHeading:"Care that fits them.",sectionIntro:"Think about suitability, size, materials and practical ongoing use.",practicalTitle:"Check before choosing",practicalPoints:["Confirm species, age, size and any compatibility restrictions.","Read materials, ingredients or care instructions where applicable.","Compare pack sizes and ongoing cost, not just one purchase."],groupHeading:"Pet product details",imageShape:"portrait",specPriority:["species","breed_size","age","weight","ingredients","dimensions","material"]},
 general:{template:"general",eyebrow:"A little more information",sectionHeading:"Know what you are comparing.",sectionIntro:"Use the available product details to check you're comparing the same item.",practicalTitle:"Things worth checking",practicalPoints:["Confirm the model, variant and included items.","Account for delivery and applicable charges.","Check returns, warranty and current retailer terms."],groupHeading:"Product details",imageShape:"square",specPriority:["model","size","material","warranty","specifications"]},
};
export function chooseProductTemplate(product:Pick<PublicProduct,"product_type"|"canonical_title">,offers:Pick<PublicOffer,"published">[]):ProductPresentation{
 const type=product.product_type?.toLowerCase()??"";
 const categories=offers.map(o=>o.published.category.toLowerCase()).join(" ");
 const name=product.canonical_title.toLowerCase();
 const combined=`${type} ${categories}`;
 if(/(grocery|grocer|supermarket|food|beverage|pantry)/.test(combined))return TEMPLATES.grocery;
 if(/(travel|hotel|holiday|flight|accommodation|booking|experience)/.test(combined))return TEMPLATES.travel;
 if(/(motor|vehicle|car |tyres|automotive|lease)/.test(combined))return TEMPLATES.motoring;
 if(/(beauty|skincare|cosmetic|fragrance|makeup|health & beauty)/.test(combined))return TEMPLATES.beauty;
 if(/(pets?|animal)/.test(combined))return TEMPLATES.pets;
 if(/(tech|electronics?|comput|phone|television|gaming|laptop|tablet|audio)/.test(combined))return TEMPLATES.tech;
 if(/(home|household|kitchen|appliance|furniture|decor|garden)/.test(combined))return TEMPLATES.home;
 // Product titles are only a last-resort visual hint, never evidence for a feature claim.
 if(/(macbook|laptop|smart tv|headphones|monitor|smartphone)/.test(name))return TEMPLATES.tech;
 if(/(vacuum|air fryer|sofa|lamp|kettle|bedding)/.test(name))return TEMPLATES.home;
 return TEMPLATES.general;
}
export function validatedSpecificationEntries(value:unknown,priority:readonly string[]):[string,string][]{
 if(!value||typeof value!=="object"||Array.isArray(value))return [];
 const records=Object.entries(value as Record<string,unknown>).filter(([key,val])=>/^[a-z0-9_ -]{2,60}$/i.test(key)&&["string","number","boolean"].includes(typeof val)&&String(val).trim().length>0&&String(val).length<=160)
 .map(([key,val])=>[key,String(val)] as [string,string]);
 const rank=(key:string)=>{const i=priority.indexOf(key.toLowerCase().replaceAll(" ","_"));return i<0?99:i;};
 return records.sort((a,b)=>rank(a[0])-rank(b[0])).slice(0,16);
}
