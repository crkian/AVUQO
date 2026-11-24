/** Conservative product-level classification. Structured source category wins;
 * title is a fallback, and ambiguous evidence is explicitly reviewable.
 * No service, tyre quote or publication permission is inferred. */
const RULES: readonly [string,string,RegExp][]=[
 ["pets","Pet feeding & care",/\b(?:pet|cat|dog|kitten|puppy)\s*(?:care|food|feeder|fountain|litter|collar|bed|filter|feeding|hydration)\b|\bpet supplies\b/i],
 ["crafts","Craft supplies & kits",/\b(?:diamond painting|crystal art|papercraft|craft kits?|craft supplies|scrapbooking|embroidery|cross stitch|sewing kits?)\b/i],
 ["toys-games","Toys & games",/\b(?:toys?|board games?|jigsaw puzzles?|playsets?|play sets?|building blocks|action figures|construction toys)\b/i],
 ["gifts","Chocolate & gifts",/\b(?:chocolate|confectionery|gift hampers?|gift boxes?)\b/i],
 ["tech","Phones & wearables",/\b(?:smartphones?|mobile phones?|sim.free phones?|iphone|smartwatch|handsets?)\b/i],
 ["tech","Computers & accessories",/\b(?:laptops?|tablets?|keyboards?|monitors?|computers?|headphones?|earbuds?)\b/i],
 ["garden-outdoors","Garden equipment",/\b(?:garden|lawn|mowers?|hedge trimmers?|watering|outdoor furniture)\b/i],
 ["motoring","Vehicle accessories",/\b(?:automotive|motoring|car accessories|car care|vehicle parts|garage equipment)\b/i],
 ["fashion","Clothing & footwear",/\b(?:clothing|footwear|workwear|jackets?|trousers?|boots?|shoes?|apparel)\b/i],
 ["diy-building","Tools & equipment",/\b(?:power tools?|hand tools?|drills?|saws?|hardware|fixings|workshop|diy|welding)\b/i],
 ["home","Home & living",/\b(?:furniture|kitchen|bedding|home decor|lighting|vacuum|laundry|household)\b/i],
 ["office-stationery","Stationery",/\b(?:stationery|notebooks?|envelopes|filing supplies|highlighters)\b/i],
 ["beauty","Beauty & grooming",/\b(?:skincare|makeup|cosmetics|perfume|haircare)\b/i],
 ["sports-fitness","Sports equipment",/\b(?:sports equipment|fitness equipment|dumbbells|badminton|cycling equipment)\b/i],
 ["baby-nursery","Baby essentials",/\b(?:baby bottles|baby feeding|baby carriers|baby cots|nursery)\b/i],
 ["books-media","Books & media",/\b(?:audiobooks?|children.s books|books and media|blu.ray)\b/i],
 ["musical-instruments","Musical instruments",/\b(?:guitars?|digital pianos?|musical instruments|drum kits)\b/i]
];
export function classifyRetailProduct(input:{category?:string|null;path?:string|null;title?:string|null}){
 for(const [basis,value] of [["source_category",[input.category,input.path].filter(Boolean).join(" ")],["title",input.title??""]] as const){
  const matches=RULES.filter(([, , pattern])=>pattern.test(value));
  const departments=[...new Set(matches.map(([department])=>department))];
  if(departments.length>1)return {department:null,subcategory:null,basis:"ambiguous",status:"needs_review"} as const;
  if(departments.length===1)return {department:departments[0],subcategory:matches[0][1],basis,status:"classified"} as const;
 }
 return {department:null,subcategory:null,basis:"unknown",status:"needs_review"} as const;
}
