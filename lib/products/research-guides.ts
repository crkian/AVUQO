/**
 * Curated editorial research starters, not retailer listings or verified offers.
 *
 * These four product/model identities were observed in AVUQO's active demo-only
 * catalogue on 14 November 2026 and independently cross-checked against the
 * manufacturers' public information. No demo price, stock, image, score,
 * affiliate URL, specification blob, or merchant claim is copied to this list.
 *
 * A guide becomes a verified comparison only through public-catalog's existing
 * independent source, offer, score and rights admission checks.
 */
export type ResearchProductGuide={
 readonly slug:string;
 readonly title:string;
 readonly brand:string;
 readonly department:"tech"|"home";
 readonly teaser:string;
 readonly modelNote:string;
 readonly checklist:readonly string[];
 readonly manufacturerInfoUrl:string;
};
export const RESEARCH_PRODUCT_GUIDES:readonly ResearchProductGuide[]=[
 {
  slug:"apple-macbook-air-m4-13-256gb-apple-macbook-ai",
  title:"Apple MacBook Air 13-inch (M4, 16GB, 256GB)",
  brand:"Apple",department:"tech",
  teaser:"Compare the exact laptop configuration rather than a similar-looking memory or storage variant.",
  modelNote:"Research guide for the 13-inch M4 family. Confirm the exact memory, storage and keyboard configuration before buying.",
  checklist:[
   "Check the M4 chip, memory and 256GB storage match the item offered.",
   "Confirm keyboard layout, warranty, accessories and delivery terms.",
   "Compare the exact configuration and complete checkout cost."
  ],
  manufacturerInfoUrl:"https://support.apple.com/en-gb/122209"
 },
 {
  slug:"ninja-af300uk-ninja-af300uk",
  title:"Ninja Foodi Dual Zone Air Fryer AF300UK",
  brand:"Ninja",department:"home",
  teaser:"Research the exact AF300UK model, its cooking setup and the space it needs.",
  modelNote:"AF300UK is a specific model. Check the retailer's model code rather than relying on a generic Dual Zone headline.",
  checklist:[
   "Confirm the model code is AF300UK and check its drawer capacity.",
   "Measure the available countertop space and check cleaning instructions.",
   "Confirm the exact accessories, warranty and delivery costs."
  ],
  manufacturerInfoUrl:"https://www.sharkninja.co.uk/ninja-foodi-dual-zone-air-fryer-af300uk/AF300UK.html"
 },
 {
  slug:"dyson-v15-detect-absolute-dyson-v15-detect",
  title:"Dyson V15 Detect Absolute cordless vacuum",
  brand:"Dyson",department:"home",
  teaser:"Look past the headline and check which cleaner heads, tools and warranty are included.",
  modelNote:"The Absolute package can vary by edition or retailer. Confirm the full variant and accessories against the actual item.",
  checklist:[
   "Confirm the model and included floor heads and attachments.",
   "Check weight, charging arrangements and suitability for your floors.",
   "Compare warranty, replacement parts, delivery and returns."
  ],
  manufacturerInfoUrl:"https://www.dyson.co.uk/vacuum-cleaners/cordless/v15/detect-yellow-nickel"
 },
 {
  slug:"lg-oled65c4-lg-oled65c4",
  title:"LG OLED evo C4 65-inch 4K TV",
  brand:"LG",department:"tech",
  teaser:"Compare the exact UK model suffix, screen setup and installation requirements.",
  modelNote:"OLED65C4 identifies a model family. The complete UK suffix (such as OLED65C43LA) must be checked before matching retailer offers.",
  checklist:[
   "Verify the complete UK model suffix on the retailer listing.",
   "Check the screen dimensions, stand or wall-mount requirements and connections.",
   "Review delivery, installation, warranty and any bundled extras."
  ],
  manufacturerInfoUrl:"https://www.lg.com/uk/tvs-soundbars/oled-evo/oled65c43la/"
 }
];

export function researchGuideBySlug(slug:string):ResearchProductGuide|undefined{
 return RESEARCH_PRODUCT_GUIDES.find(guide=>guide.slug===slug);
}
export function researchGuidesByDepartment(department:string):ResearchProductGuide[]{
 return RESEARCH_PRODUCT_GUIDES.filter(guide=>guide.department===department);
}
