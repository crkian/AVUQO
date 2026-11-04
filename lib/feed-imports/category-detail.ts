import {suggestedDepartment} from "./preview-departments";

export type CategoryDetail = {department:string;heading:string;guidance:string;facts:{label:string;value:string}[];missing:string[]};

/** Private design-preview metadata only. Title-derived observations are never verified specifications. */
export function categoryDetail(merchant:string,title:string,category:string|null,brand:string|null):CategoryDetail{
 const department=suggestedDepartment(merchant,title,category);
 const facts:{label:string;value:string}[]=[];
 const missing:string[]=[];
 const add=(label:string,value:string|undefined)=>{if(value)facts.push({label,value});else missing.push(label);};
 const fromTitle=(pattern:RegExp)=>title.match(pattern)?.[0];
 if(department==="Chocolate & gifts"){
  add("Pack weight (title only)",fromTitle(/\b\d+(?:\.\d+)?\s?(?:kg|g)\b/i));
  add("Item count (title only)",fromTitle(/\b\d+\s?(?:pack|pieces|pcs|bars|count)\b/i));
  return {department,heading:"Gift and chocolate details",guidance:"Confirm allergens, ingredients, pack size, gift messaging and delivery dates with the retailer before publication.",facts,missing:[...missing,"Allergens and ingredients","Delivery dates and costs"]};
 }
 if(department==="Pet feeding"||department==="Pet hydration"||department==="Pet accessories"){
  add("Capacity (title only)",fromTitle(/\b\d+(?:\.\d+)?\s?(?:l|ml|litres?|cups?)\b/i));
  add("Pet type (title only)",fromTitle(/\b(?:cat|dog|cats|dogs)\b/i));
  return {department,heading:"Pet product details",guidance:"Confirm capacity, dimensions, power supply, compatibility, replacement parts and safety guidance against fresh manufacturer data.",facts,missing:[...missing,"Compatibility","Power and dimensions","Warranty and support"]};
 }
 if(department==="Arts & crafts"||department==="Home decorations"||department==="Toys & puzzles"){
  add("Pieces (title only)",fromTitle(/\b\d+\s?(?:pieces|pcs|piece)\b/i));
  add("Dimensions (title only)",fromTitle(/\b\d+(?:\.\d+)?\s?(?:cm|mm|inches?)\b/i));
  return {department,heading:"Creative product details",guidance:"Confirm contents, materials, dimensions, age guidance and availability; title hints are not a substitute for specifications.",facts,missing:[...missing,"Kit contents and materials","Age guidance"]};
 }
 if(department==="Keyboards & computing"){
  add("Switch type (title only)",fromTitle(/\b(?:linear|tactile|clicky|red switch|blue switch|brown switch)\b/i));
  add("Layout (title only)",fromTitle(/\b(?:ISO|ANSI|60%|65%|75%|80%|TKL|full size)\b/i));
  return {department,heading:"Technical specifications",guidance:"Confirm keyboard layout, switch type, connectivity, compatibility and warranty for the exact variant.",facts,missing:[...missing,"Connectivity","Compatibility","Warranty"]};
 }
 if(/tyres?|pneus/i.test(merchant+" "+title+" "+(category??""))){
  add("Tyre size (title only)",fromTitle(/\b\d{3}\/\d{2}\s?R\s?\d{2}\b/i));
  add("Load/speed code (title only)",fromTitle(/\b\d{2,3}[A-Z]\b/));
  return {department:"Tyres",heading:"Tyre fitment",guidance:"Verify exact vehicle fitment, load and speed ratings, seasonality, EU tyre label, fitting and full payable cost before listing.",facts,missing:[...missing,"Vehicle fitment","EU tyre label","Fitting and delivery"]};
 }
 return {department,heading:"Product details awaiting classification",guidance:"This item needs a verified category and structured source specifications before public listing.",facts:brand?[{label:"Source brand",value:brand}]:[],missing:["Verified category","Product specifications","Delivery and availability"]};
}
