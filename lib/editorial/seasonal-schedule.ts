/**
 * Editorial-only homepage themes, driven by the UK civil-date calendar.
 * This never changes merchant offers, sponsored approvals, rankings or prices.
 */
import {seasonalArt} from "./seasonal-art.ts";
import {editorialMomentForDate,annualSeasonalWindows} from "./seasonal-date.mjs";
import type {SeasonalMoment} from "./seasonal-date.mjs";
export {editorialMomentForDate,annualSeasonalWindows};
export type EditorialMoment=SeasonalMoment;
export type EditorialSpotlight={
 id:EditorialMoment;name:string;title:string;summary:string;href:string;
 image:string;cta:string;secondaryHref:string;secondaryLabel:string;
};
const image=(id:string)=>"https://images.unsplash.com/"+id+"?auto=format&fit=crop&w=1600&q=80";
const S:Record<EditorialMoment,EditorialSpotlight>={
 "black-friday":{id:"black-friday",name:"Black Friday",title:"Black Friday at AVUQO",summary:"Find what is worth it this Black Friday. Explore thoughtfully and check real price evidence before deciding.",href:"/black-friday",cta:"Explore Black Friday",secondaryHref:"/christmas",secondaryLabel:"Plan Christmas",image:seasonalArt["black-friday"]},
 christmas:{id:"christmas",name:"Christmas",title:"Christmas at AVUQO",summary:"Thoughtful gifts, festive home inspiration, shopping lists and practical planning for the season.",href:"/christmas",cta:"Explore Christmas",secondaryHref:"/lists",secondaryLabel:"Plan a gift list",image:seasonalArt.christmas},
 valentines:{id:"valentines",name:"Valentine’s",title:"Valentine’s at AVUQO",summary:"Find inspiration for thoughtful gifts, date-night plans and experiences, without invented discounts.",href:"/valentines",cta:"Explore Valentine’s",secondaryHref:"/lists",secondaryLabel:"Plan a gift",image:seasonalArt.valentines},
 easter:{id:"easter",name:"Easter",title:"Easter at AVUQO",summary:"Spring gifts, Easter baking, family activities and ideas that are worth sharing.",href:"/easter",cta:"Explore Easter",secondaryHref:"/groceries",secondaryLabel:"Plan Easter groceries",image:seasonalArt.easter},
 sales:{id:"sales",name:"Winter sales",title:"Shop smarter in the sales",summary:"Discover what matters, compare the total cost, and question discounts that lack real price evidence.",href:"/sales",cta:"Explore seasonal sales",secondaryHref:"/marketplace/compare",secondaryLabel:"Compare products",image:seasonalArt.sales},
 spring:{id:"spring",name:"Spring",title:"A fresh start at AVUQO",summary:"Find spring home inspiration, thoughtful gifts and useful ideas for the lighter days ahead.",href:"/home",cta:"Explore spring ideas",secondaryHref:"/categories",secondaryLabel:"Browse categories",image:image("photo-1490750967868-88aa4486c946")},
 summer:{id:"summer",name:"Summer",title:"Summer at AVUQO",summary:"Explore holidays, outdoor living, family adventures and seasonal essentials with value in mind.",href:"/travel",cta:"Explore summer travel",secondaryHref:"/home",secondaryLabel:"Outdoor living ideas",image:image("photo-1507525428034-b723cf961d3e")},
 autumn:{id:"autumn",name:"Autumn",title:"Autumn at AVUQO",summary:"Warm up your home, prepare for cooler days and discover practical things worth considering.",href:"/home",cta:"Explore home ideas",secondaryHref:"/categories",secondaryLabel:"Browse categories",image:image("photo-1473448912268-2022ce9509d8")},
 "back-to-school":{id:"back-to-school",name:"Back to school",title:"Back to school with AVUQO",summary:"Plan school and work essentials, compare specifications and keep your shopping list organised.",href:"/categories",cta:"Explore essentials",secondaryHref:"/lists",secondaryLabel:"Make a list",image:image("photo-1503676260728-1c00da094a0b")},
 halloween:{id:"halloween",name:"Halloween",title:"Halloween at AVUQO",summary:"Creative costumes, home décor, treats and activity inspiration without exaggerated deal claims.",href:"/gifts",cta:"Explore Halloween ideas",secondaryHref:"/toys",secondaryLabel:"Family activities",image:image("photo-1509557965875-b88c97052f0e")},
 "mothers-day":{id:"mothers-day",name:"Mothering Sunday",title:"Mother’s Day at AVUQO",summary:"Thoughtful gifts and experiences to celebrate the people who matter, with time to plan.",href:"/gifts",cta:"Explore thoughtful gifts",secondaryHref:"/experiences",secondaryLabel:"Explore experiences",image:image("photo-1513201099705-a9746e1e201f")},
 "fathers-day":{id:"fathers-day",name:"Father’s Day",title:"Father’s Day at AVUQO",summary:"Gifts, gadgets and shared experiences chosen for the person, not the size of a supposed saving.",href:"/gifts",cta:"Explore gift ideas",secondaryHref:"/experiences",secondaryLabel:"Explore experiences",image:image("photo-1513201099705-a9746e1e201f")}
};
export function editorialSpotlight(now:Date):EditorialSpotlight|null{
 const id=editorialMomentForDate(now);
 return id?S[id]:null;
}
export const SEASONAL_DESTINATIONS=[
 {name:"January and post-Christmas sales",href:"/sales",window:"27 Dec–20 Jan",commercial:"Only independently verified deals count as price reductions"},
 {name:"Valentine’s",href:"/valentines",window:"21 Jan–14 Feb",commercial:"Editorial gifting, not automatic retailer promotions"},
 {name:"Mothering Sunday",href:"/gifts",window:"14 days before UK Mothering Sunday",commercial:"UK date calculated from Easter"},
 {name:"Easter",href:"/easter",window:"20 days before Easter through Easter Monday",commercial:"Editorial inspiration; offers separately verified"},
 {name:"Father’s Day",href:"/gifts",window:"14 days before third Sunday in June",commercial:"Editorial gift planning"},
 {name:"Summer",href:"/travel",window:"June–August, except Father’s Day and back to school",commercial:"Travel information does not imply a live booking API"},
 {name:"Back to school",href:"/categories",window:"15 Aug–10 Sep",commercial:"Schools set their own terms; this is a shopping theme"},
 {name:"Halloween",href:"/gifts",window:"15–31 Oct",commercial:"Editorial ideas, no assumed discounts"},
 {name:"Black Friday",href:"/black-friday",window:"1–30 Nov",commercial:"Do not invent promotions or reference prices"},
 {name:"Christmas",href:"/christmas",window:"1–26 Dec",commercial:"Only verified gift offers may be labelled live"}
] as const;
