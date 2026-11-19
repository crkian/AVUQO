/** Merchant-announced promotional events. These are not live AVUQO price checks. */
export type RetailerSaleProduct = { name:string; description:string; retailerUrl:string; percent:number; windows:readonly {start:string;end:string}[] };
export type RetailerSale = {
 id:string; advertiserId:string; merchant:string; heading:string; description:string;
 categorySlugs:readonly string[]; start:string; end:string; retailerUrl:string;
 evidence:string; products:readonly RetailerSaleProduct[];
};
const date=(day:string)=>day+"T00:00:00.000Z";
const windows=(...pairs:[string,string][])=>pairs.map(([start,end])=>({start:date(start),end:date(end)}));
/**
 * The 19 November 2026 Awin Petlibro UK advertiser broadcast confirms these
 * advertised reductions. No GBP prices, stock levels or historical savings
 * are inferred. The broadcast has a typo in its last-wave dates, so only
 * unambiguous product windows are included below.
 */
export const RETAILER_SALES:readonly RetailerSale[]=[
 {id:"petlibro-black-friday-2026",advertiserId:"77952",merchant:"Petlibro UK",
  heading:"Petlibro Black Friday: up to 55% off selected pet tech",
  description:"The retailer has announced selected reductions on smart pet cameras, drinking fountains and automatic feeders. Check the exact variant, discount and delivery at the retailer before ordering.",
  categorySlugs:["pets"],start:date("2026-11-19"),end:date("2026-12-04"),
  retailerUrl:"https://uk.petlibro.com/pages/black-friday",
  evidence:"Petlibro UK Affiliate Program (77952) Awin promotional email, 19 November 2026",
  products:[
   {name:"Scout Smart Camera",description:"A camera for checking in on pets remotely.",retailerUrl:"https://uk.petlibro.com/products/scout-smart-camera",percent:55,windows:windows(["2026-11-19","2026-12-04"])},
   {name:"Dockstream 2 Smart Cordless Fountain",description:"A cordless smart drinking fountain.",retailerUrl:"https://uk.petlibro.com/products/dockstream-2-smart-fountain",percent:20,windows:windows(["2026-11-19","2026-12-04"])},
   {name:"Luma Smart Litter Box",description:"A smart litter-box option for cat owners.",retailerUrl:"https://uk.petlibro.com/products/luma-smart-litter-box",percent:30,windows:windows(["2026-11-19","2026-11-24"],["2026-11-27","2026-12-01"])},
   {name:"One RFID Smart Feeder",description:"RFID-enabled pet feeding for distinguishing pets.",retailerUrl:"https://uk.petlibro.com/products/one-rfid-pet-feeder",percent:25,windows:windows(["2026-11-19","2026-11-24"],["2026-11-27","2026-12-01"])},
   {name:"Granary Smart Camera Feeder",description:"An automatic feeder with camera monitoring.",retailerUrl:"https://uk.petlibro.com/products/petlibro-granary-automatic-pet-feeder-with-camera",percent:25,windows:windows(["2026-11-19","2026-11-24"],["2026-11-27","2026-12-01"])},
   {name:"Granary 2 Series",description:"A range of smart automatic feeders.",retailerUrl:"https://uk.petlibro.com/products/granary-2-series",percent:20,windows:windows(["2026-11-19","2026-11-24"],["2026-11-27","2026-12-01"])}
  ]}
];
export function activeRetailerSales(at:Date,category?:string):RetailerSale[]{
 const now=at.getTime();
 return RETAILER_SALES.filter(x=>now>=Date.parse(x.start)&&now<Date.parse(x.end)&&
   (!category||x.categorySlugs.includes(category)));
}
export function activeSaleProducts(sale:RetailerSale,at:Date):RetailerSaleProduct[]{
 const now=at.getTime();
 return sale.products.filter(p=>p.windows.some(w=>now>=Date.parse(w.start)&&now<Date.parse(w.end)));
}
export function cardDescription(description:string|null|undefined):string{
 const str=description?.replace(/\s+/g," ").trim();
 return str ? str.slice(0,240)+(str.length>240?"…":"") :
   "No detailed supplier description is available yet. Open this item to review its exact variant and eligible retailer information.";
}
