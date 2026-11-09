import {type BrowseDepartment,BROWSE_DEPARTMENTS,departmentHref} from "../categories/browse-tree";

export type MarketplaceJourney="explore"|"shop"|"compare"|"whos-who";
export const MARKETPLACE_JOURNEYS=[
 {id:"explore",name:"Explore",href:"/marketplace",description:"Twenty-five departments and hundreds of curated topics. Find your way without needing a deal."},
 {id:"shop",name:"Shop",href:"/products",description:"Browse products only when their retailer offers are authorised and current."},
 {id:"compare",name:"Compare",href:"/marketplace/compare",description:"See what is genuinely comparable, including delivery, fitting, contract terms and missing costs."},
 {id:"whos-who",name:"Who's Who",href:"/whos-who",description:"Explore the brands, retailers and specialists behind the categories, with commercial relationships clearly distinguished."}
] as const;

export function marketplaceDepartmentBySlug(slug:string):BrowseDepartment|undefined {
 return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)?BROWSE_DEPARTMENTS.find(d=>d.slug===slug):undefined;
}
export function departmentJourneys(department:BrowseDepartment){
 const is=(...names:string[])=>names.includes(department.slug);
 const compare=is("grocery-food")?"/groceries":
  is("motoring")?"/tyres":
  is("connectivity-utilities")?"/compare":
  is("insurance-finance")?"/insurance":
  is("travel","experiences")?"/travel":"/products";
 return {
  explore:departmentHref(department),
  shop:"/search?q="+encodeURIComponent(department.name),
  compare,
  whosWho:"/whos-who"
 };
}
export function summarizeMarketCategories(){
 return {departments:BROWSE_DEPARTMENTS.length,topics:BROWSE_DEPARTMENTS.reduce((n,d)=>n+d.topics.length,0)};
}
