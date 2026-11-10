/**
 * Editorial seasons are pure dates, not supplier/sponsored campaign approvals.
 * This calendar may change site discovery modules only, never offer publication.
 */
export type EditorialMoment="black-friday"|"christmas"|"valentines"|"easter"|"sales";
export type EditorialSpotlight={
 id:EditorialMoment;name:string;title:string;summary:string;href:string;
 image:string;cta:string;secondaryHref:string;secondaryLabel:string;
};
const S:Record<EditorialMoment,EditorialSpotlight>={
 "black-friday":{id:"black-friday",name:"Black Friday",title:"Black Friday at AVUQO",
  summary:"Plan the sales thoughtfully. Discover what matters and check the real price evidence, not just the markdown.",
  href:"/black-friday",cta:"Explore Black Friday",secondaryHref:"/christmas",secondaryLabel:"Plan Christmas",
  image:"https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1600&q=80"},
 christmas:{id:"christmas",name:"Christmas",title:"Christmas at AVUQO",
  summary:"Thoughtful gifting, festive planning, useful lists and all the little things that make a season worth sharing.",
  href:"/christmas",cta:"Explore Christmas",secondaryHref:"/lists",secondaryLabel:"Plan a gift list",
  image:"https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=1600&q=80"},
 valentines:{id:"valentines",name:"Valentine’s Day",title:"Valentine’s at AVUQO",
  summary:"Gifts, experiences and thoughtful gestures to explore without pressure or imaginary discounts.",
  href:"/valentines",cta:"Explore Valentine’s ideas",secondaryHref:"/lists",secondaryLabel:"Make a list",
  image:"https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1600&q=80"},
 easter:{id:"easter",name:"Easter",title:"Easter at AVUQO",
  summary:"Spring gifting, home inspiration, family activities and practical ways to plan your Easter shopping.",
  href:"/easter",cta:"Explore Easter",secondaryHref:"/groceries",secondaryLabel:"Plan groceries",
  image:"https://images.unsplash.com/photo-1457089328109-e5d9bd499191?auto=format&fit=crop&w=1600&q=80"},
 sales:{id:"sales",name:"Seasonal sales",title:"Shop thoughtfully in the sales",
  summary:"A good offer is only good when it is the exact thing you want at a genuinely worthwhile full price.",
  href:"/sales",cta:"Explore sale advice",secondaryHref:"/marketplace",secondaryLabel:"Explore marketplace",
  image:"https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80"}
};
function localYmd(instant:Date){
 const parts=new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/London",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(instant);
 const val=(type:string)=>Number(parts.find(p=>p.type===type)?.value??0);
 return {year:val("year"),month:val("month"),day:val("day")};
}
function gregorianEaster(year:number):Date{
 const a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4),e=b%4;
 const f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3);
 const h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4;
 const l=(32+2*e+2*i-h-k+7)%7,m=Math.floor((a+11*h+22*l)/451);
 const month=Math.floor((h+l-7*m+114)/31);
 const day=((h+l-7*m+114)%31)+1;
 return new Date(Date.UTC(year,month-1,day,12));
}
export function editorialMomentForDate(now:Date):EditorialMoment|null{
 if(!Number.isFinite(now.getTime()))return null;
 const {year,month,day}=localYmd(now);
 if(month===2&&day<=14)return "valentines";
 const today=Date.UTC(year,month-1,day,12);
 const easter=gregorianEaster(year).getTime();
 if(today>=easter-21*864e5&&today<=easter+7*864e5)return "easter";
 if(month===11)return "black-friday";
 if(month===12&&day<=28)return "christmas";
 if(month===1&&day<=20)return "sales";
 return null;
}
export function editorialSpotlight(now:Date):EditorialSpotlight|null{
 const id=editorialMomentForDate(now);
 return id?S[id]:null;
}
export const SEASONAL_DESTINATIONS=[
 {name:"Black Friday",href:"/black-friday",window:"November",commercial:"Source-verified promotions only"},
 {name:"Christmas",href:"/christmas",window:"1–28 December",commercial:"Verified gift offers only"},
 {name:"Valentine’s Day",href:"/valentines",window:"1–14 February",commercial:"Editorial guide, not guaranteed discounts"},
 {name:"Easter",href:"/easter",window:"21 days before to 7 days after Easter",commercial:"Editorial inspiration, approved products separately"},
 {name:"January sales",href:"/sales",window:"1–20 January",commercial:"No invented reference prices"}
] as const;
