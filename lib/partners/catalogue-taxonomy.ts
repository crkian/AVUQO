import {PARTNERS,type Partner} from "./advertiser-directory.ts";
import {BROWSE_DEPARTMENTS,departmentBySlug,type BrowseDepartment} from "../categories/browse-tree.ts";

/** Single crosswalk from the existing AVUQO 25-department taxonomy to accepted
 * advertiser discovery. A crosswalk is NOT a stock, feed-rights or price claim.
 * Never replace or rename a department simply because a merchant joins. */
export const PARTNER_DEPARTMENTS:Readonly<Record<string,readonly string[]>>={
 "tooled-up":["diy-building","garden-outdoors","home","business-industrial"],
 "petlibro":["pets"],
 "playpress-toys":["toys-games","gifts"],
 "cadbury-gifts-direct":["gifts","grocery-food"],
 "mozillion":["tech","connectivity-utilities"],
 "craft-buddy":["crafts","gifts"],
 "tyres-uk":["motoring"],
 "tyres-pneus-online":["motoring"],
 "holiday-extras":["travel","experiences"],
 "compare-parking-prices":["travel","motoring"],
 "simply-mot":["motoring"],
 "broadband-genie":["connectivity-utilities"],
 "broadband-mobile-coop":["connectivity-utilities","tech"],
 "your-coop-energy":["connectivity-utilities"],
 "onestream":["connectivity-utilities"],
 "lyca-mobile":["connectivity-utilities","tech"],
 "one-p-mobile":["connectivity-utilities","tech"],
 "chattr-sim-only":["connectivity-utilities","tech"],
 "autoaid-breakdown":["motoring","insurance-finance"],
 "epc-gas-electrical":["home-services"],
 "christmas-letters-from-santa":["gifts"]
};

/** Manufacturer or store affiliation doesn't make a listing price-eligible. */
export function departmentsForPartner(slug:string):BrowseDepartment[]{
 return (PARTNER_DEPARTMENTS[slug]??[]).flatMap(key=>{
  const department=departmentBySlug(key);
  return department?[department]:[];
 });
}
export function partnersForDepartment(departmentSlug:string):Partner[]{
 if(!BROWSE_DEPARTMENTS.some(d=>d.slug===departmentSlug))return [];
 return PARTNERS.filter(p=>(PARTNER_DEPARTMENTS[p.slug]??[]).includes(departmentSlug))
  .sort((a,b)=>a.name.localeCompare(b.name,"en-GB"));
}
export const partnerCatalogueKinds=[
 {id:"all",name:"All partners"},
 {id:"retail",name:"Shops & products"},
 {id:"mobile",name:"Phones & SIM"},
 {id:"broadband",name:"Broadband"},
 {id:"travel",name:"Travel"},
 {id:"motoring",name:"Motoring"},
 {id:"energy",name:"Energy"},
 {id:"services",name:"Home services"}
] as const;
