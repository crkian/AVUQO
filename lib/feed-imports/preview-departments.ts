/**
 * Preview-only department suggestions. No canonical category IDs or public product
 * rights are assigned by this helper. Missing/conflicting classifications stay reviewable.
 */
export type PreviewDepartment="Chocolate & gifts"|"Pet feeding"|"Pet hydration"|"Pet accessories"|"Arts & crafts"|"Home decorations"|"Toys & puzzles"|"Keyboards & computing"|"Mobile phones"|"Power tools & equipment"|"Hand tools"|"Gardening & outdoors"|"DIY & home improvement"|"Workwear & safety"|"Motoring maintenance"|"Home appliances & cleaning"|"Lighting & security"|"Needs classification";
export function suggestedDepartment(merchant:string,title:string,rawCategory:string|null):PreviewDepartment{
 const m=merchant.toLowerCase(),t=title.toLowerCase(),c=(rawCategory??"").toLowerCase();
 if(m.includes("petlibro")){
  if(/fountain|water dispenser|hydration/.test(t))return "Pet hydration";
  if(/feeder|feeding|food dispenser/.test(t))return "Pet feeding";
  if(/filter|replacement|adapter|pump|accessor|tray|bowl/.test(t))return "Pet accessories";
  return "Needs classification";
 }
 if(m.includes("cadbury")){
  if(/chocolate|hampers?|gift|birthday|valentine|christmas|calendar|occasion|food/.test(c+" "+t))return "Chocolate & gifts";
  return "Needs classification";
 }
 if(m.includes("craft buddy")){
  if(/home & garden|floral|flower|wreath|vase|decor/.test(c+" "+t))return "Home decorations";
  if(/toys|puzzle|figurine|figure/.test(c+" "+t))return "Toys & puzzles";
  if(/craft|stencil|diamond art|crystal art|scrapbook|stamp|painting|card making/.test(c+" "+t))return "Arts & crafts";
  return "Needs classification";
 }
 if(m.includes("mozillion")){
  if(/mobile phones|sim free phones|handset|smartphone/.test(c+" "+t))return "Mobile phones";
  return "Needs classification";
 }
 if(m.includes("tooled")){
  // Supplier category takes precedence over retailer identity. A tool seller
  // also stocks workwear, housewares and motoring goods.
  const combined=c+" "+t;
  if(/men.s|women.s|footwear|shoes|trousers|clothing|tops|outerwear|workwear|safety boots|hi.vis|protective/.test(c))
   return "Workwear & safety";
  if(/vehicle|auto care|motorcycle|car maintenance|automotive|motoring/.test(c))
   return "Motoring maintenance";
  if(/garden|lawn mowers|lawnmower|hedge trimmer|strimmer/.test(c))
   return "Gardening & outdoors";
  if(/vacuum cleaners|cleaning|laundry|heating & cooling|appliances/.test(c))
   return "Home appliances & cleaning";
  if(/lighting|home security|cctv|alarms/.test(c))
   return "Lighting & security";
  if(/power tools|cordless|power drill|impact driver|angle grinder|circular saw|mitre saw/.test(combined))
   return "Power tools & equipment";
  if(/hand tools|spanners|wrenches|socket set|screwdrivers|pliers/.test(combined))
   return "Hand tools";
  if(/diy|painting & decorating|general household|building|hardware|fasteners/.test(c))
   return "DIY & home improvement";
  return "Needs classification";
 }
 if(m.includes("akko"))return "Keyboards & computing";
 return "Needs classification";
}
