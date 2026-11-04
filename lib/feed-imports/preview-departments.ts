/**
 * Preview-only department suggestions. No canonical category IDs or public product
 * rights are assigned by this helper. Missing/conflicting classifications stay reviewable.
 */
export type PreviewDepartment="Chocolate & gifts"|"Pet feeding"|"Pet hydration"|"Pet accessories"|"Arts & crafts"|"Home decorations"|"Toys & puzzles"|"Keyboards & computing"|"Needs classification";
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
 if(m.includes("akko"))return "Keyboards & computing";
 return "Needs classification";
}
