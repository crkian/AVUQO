/**
 * Curated editorial research starters, not retailer listings or verified offers.
 *
 * Original four model identities were checked against manufacturers on 14 Nov.
 * Four further standalone model identities were verified against official UK
 * manufacturer product pages on 17 Nov 2026. Neither set is an affiliate offer.
 * No demo price, stock, image, score,
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
 } ,
 {
  slug:"sony-wh-1000xm6-noise-cancelling-headphones",
  title:"Sony WH-1000XM6 Wireless Noise Cancelling Headphones",
  brand:"Sony",department:"tech",
  teaser:"Explore Sony's WH-1000XM6 headset and check the exact colour, retailer bundle and warranty before choosing.",
  modelNote:"The official Sony UK WH-1000XM6 product page confirms this product family. Retailer variants, accessories, stock and today's pricing require separate checking.",
  checklist:[
   "Match the WH-1000XM6 model code, chosen colour and included accessories.",
   "Compare fit, controls and connectivity with your intended devices.",
   "Check warranty, returns and the complete delivered price directly with the seller."
  ],
  manufacturerInfoUrl:"https://www.sony.co.uk/headphones/products/wh-1000xm6"
 },
 {
  slug:"apple-iphone-17",
  title:"Apple iPhone 17",
  brand:"Apple",department:"tech",
  teaser:"Start with the current Apple iPhone 17 range, then match storage, colour, network and exact UK variant.",
  modelNote:"Apple's official UK iPhone 17 page identifies the model. This guide does not assert that any retailer currently stocks a particular configuration.",
  checklist:[
   "Confirm it is an iPhone 17 and check storage, colour and network-lock status.",
   "Compare SIM or eSIM compatibility, warranty and any contractual obligations.",
   "Check trade-in terms separately and compare the true upfront or contract total."
  ],
  manufacturerInfoUrl:"https://www.apple.com/uk/iphone-17/"
 },
 {
  slug:"samsung-galaxy-s26",
  title:"Samsung Galaxy S26",
  brand:"Samsung",department:"tech",
  teaser:"Understand the Samsung Galaxy S26 choice before comparing the exact storage, finish or contract.",
  modelNote:"Samsung UK's Galaxy S26 product page confirms the model family. Distinguish the standard S26 from S26+ and other variants before matching offers.",
  checklist:[
   "Identify the precise S26 model and storage rather than matching an S26+ listing.",
   "Check UK network compatibility, warranty and any included accessories.",
   "Compare the delivered price or full contract cost, not promotional trade-in headlines."
  ],
  manufacturerInfoUrl:"https://www.samsung.com/uk/smartphones/galaxy-s26/buy/"
 },
 {
  slug:"lego-botanicals-wildflower-bouquet-10313",
  title:"LEGO Botanicals Wildflower Bouquet (10313)",
  brand:"LEGO",department:"home",
  teaser:"Research the exact LEGO Botanicals 10313 Wildflower Bouquet set and check the set contents before gifting.",
  modelNote:"The official LEGO UK product page identifies set 10313. AVUQO does not infer a retailer's current stock, packaging, price or promotional savings.",
  checklist:[
   "Check set number 10313 and confirm the box and included elements.",
   "Review the intended age guidance, assembly and display needs on LEGO's site.",
   "Compare delivery, retailer returns and the current total price before buying."
  ],
  manufacturerInfoUrl:"https://www.lego.com/en-gb/product/wildflower-bouquet-10313"
 }

];

export function researchGuideBySlug(slug:string):ResearchProductGuide|undefined{
 return RESEARCH_PRODUCT_GUIDES.find(guide=>guide.slug===slug);
}
export function researchGuidesByDepartment(department:string):ResearchProductGuide[]{
 return RESEARCH_PRODUCT_GUIDES.filter(guide=>guide.department===department);
}
