/**
 * PRIVATE visual-copy experiments for the eight rights-unverified feed pilots.
 * Product titles are supplied by existing database records. Everything here is
 * provisional owner editorial guidance, never merchant specifications or claims.
 */
export type PreviewTheme="confectionery"|"crafting"|"keyboards"|"petcare";
export type PreviewConfig={
 slug:string;
 theme:PreviewTheme;
 brandSlug:string;
 categoryTitle:string;
 categoryHref:string;
 eyebrow:string;
 shortDescription:string;
 storyHeadline:string;
 storyIntro:string;
 contextQuestion:string;
 prompts:readonly [string,string,string];
 checks:readonly [string,string,string,string];
};
export type BrandPreviewConfig={
 slug:string;
 displayName:string;
 theme:PreviewTheme;
 headline:string;
 introduction:string;
 customerAngle:string;
 focusAreas:readonly [string,string,string];
};
export const PILOT_PREVIEWS:readonly PreviewConfig[]=[
 {
  slug:"pilot-cadbury-heroes-pouch-300g",theme:"confectionery",brandSlug:"cadbury",
  categoryTitle:"Chocolate & confectionery",categoryHref:"/gifts",
  eyebrow:"Chocolate gift and sharing inspiration",
  shortDescription:"A Cadbury Heroes pouch listed in the imported feed. Confirm packaging, contents and dates before displaying an offer.",
  storyHeadline:"The little details that make a chocolate treat worth choosing.",
  storyIntro:"For a confectionery gift or sharing moment, pack weight, ingredients, delivery conditions and the recipient matter just as much as the headline price.",
  contextQuestion:"Is the 300g pack the exact version the retailer will deliver?",
  prompts:["Compare the identical pack weight","Review allergens and ingredients on the label","Check storage, delivery and dates"],
  checks:["Verify net weight and any pack variants","Check ingredient and allergen declarations from authorised packaging","Confirm best-before and storage information where applicable","Compare only current eligible merchant offers for the exact pack"]
 },
 {
  slug:"pilot-cadbury-chocolate-gift-bag",theme:"confectionery",brandSlug:"cadbury",
  categoryTitle:"Chocolate & confectionery",categoryHref:"/gifts",
  eyebrow:"Confectionery and considered gifting",
  shortDescription:"A Cadbury gift bag title from the staged import. The exact selection, pack size and presentation have not been verified.",
  storyHeadline:"Find a gift that suits the person, not just the packaging.",
  storyIntro:"A chocolate gift can be a thoughtful choice, but what's included, allergen information and delivery suitability all need checking first.",
  contextQuestion:"What does this exact gift bag contain?",
  prompts:["Inspect the items included","Check weight, allergens and storage","Understand presentation and delivery"],
  checks:["Verify the exact products and quantities included","Obtain authorised full ingredients and allergen details","Confirm gift packaging and any variation in contents","Check delivery timing and approved merchant source terms"]
 },
 {
  slug:"pilot-craft-buddy-crystal-art-storage-bag",theme:"crafting",brandSlug:"craft-buddy",
  categoryTitle:"Crafts, making & hobbies",categoryHref:"/categories/crafts",
  eyebrow:"Creative projects and useful organisation",
  shortDescription:"A Crystal Art storage bag record associated with Craft Buddy. Dimensions, materials and included accessories require confirmation.",
  storyHeadline:"Make more room for the things you love creating.",
  storyIntro:"Craft organisation is personal. Before comparing a storage bag, consider dimensions, how the sections are laid out and what materials need protecting.",
  contextQuestion:"Will this exact bag fit the equipment and supplies you have?",
  prompts:["Check dimensions and compartments","Confirm construction and included accessories","Compare the exact model or variant"],
  checks:["Confirm measurements and intended use","Verify material, pockets and included accessories","Check whether items shown in promotional photography are included","Confirm colour or version before comparing retailers"]
 },
 {
  slug:"pilot-craft-buddy-reindeer-3d-puzzle-kit",theme:"crafting",brandSlug:"craft-buddy",
  categoryTitle:"Crafts, making & hobbies",categoryHref:"/categories/crafts",
  eyebrow:"Creative kits and seasonal projects",
  shortDescription:"A Reindeer 3D Puzzle Kit title in the staged Craft Buddy feed. Kit contents and suitability are not yet verified.",
  storyHeadline:"A little project for a satisfying making moment.",
  storyIntro:"For hands-on kits, the number of pieces, skill level, age guidance and what's included are important parts of the decision.",
  contextQuestion:"Does the kit include everything needed to complete the project?",
  prompts:["Check materials and pieces","Understand age and skill guidance","Verify finished size and instructions"],
  checks:["Verify the complete kit contents and instructions","Confirm age and supervision guidance","Check assembly requirements and any required tools","Validate the exact product version, dimensions and seasonal availability"]
 },
 {
  slug:"pilot-akko-shiny-kitten-5108-v5",theme:"keyboards",brandSlug:"akko",
  categoryTitle:"Keyboards & accessories",categoryHref:"/tech",
  eyebrow:"Technology and desk setups",
  shortDescription:"An AKKO Shiny Kitten 5108 V5 title in the feed. The switch, layout, connection and edition are still to be confirmed.",
  storyHeadline:"The right keyboard starts with how you work and play.",
  storyIntro:"The look of a keyboard is only one detail. Layout, switch feel, connectivity and compatibility make the difference in everyday use.",
  contextQuestion:"Which exact switch, layout and connectivity variant is this listing?",
  prompts:["Verify keyboard layout and switch variant","Check connectivity and compatibility","Confirm warranty and included extras"],
  checks:["Confirm the SKU and exact model revision","Check keyboard layout, switch and keycap options","Verify wired or wireless features only from authorised specs","Confirm device compatibility, warranty and returns"]
 },
 {
  slug:"pilot-monsgeek-mg75w-bun-wonderland",theme:"keyboards",brandSlug:"monsgeek",
  categoryTitle:"Keyboards & accessories",categoryHref:"/tech",
  eyebrow:"Technology and desk setups",
  shortDescription:"A MonsGeek MG75W Bun Wonderland product title from the feed. No configuration or performance claims have been verified.",
  storyHeadline:"A desk setup should work as well as it looks.",
  storyIntro:"Compare model variants and practical details such as layout, connection, key feel and supported devices before making a decision.",
  contextQuestion:"Does this retailer stock the exact MG75W Bun Wonderland variant?",
  prompts:["Confirm model and configuration","Check layout, typing features and connectivity","Read warranty and retailer terms"],
  checks:["Confirm full SKU and model name against source documents","Verify switch and layout information","Check device compatibility and any required software","Compare only approved merchant evidence and total prices"]
 },
 {
  slug:"pilot-petlibro-polar-wet-food-feeder",theme:"petcare",brandSlug:"petlibro",
  categoryTitle:"Pet feeding & care",categoryHref:"/pets",
  eyebrow:"Everyday care for your companions",
  shortDescription:"A Petlibro Polar Wet Food Feeder listing. Capacity, supported foods, cleaning guidance and power requirements remain unverified.",
  storyHeadline:"Choose a feeding routine that fits your pet.",
  storyIntro:"For feeding devices, compatibility with the animal's needs, cleaning, capacity and safe food handling are more important than decorative features.",
  contextQuestion:"Is the exact feeder suitable for your pet and feeding schedule?",
  prompts:["Confirm capacity and suitable food types","Check power and cleaning requirements","Review feeding and food-safety guidance"],
  checks:["Validate the full model and food compatibility","Confirm capacity and cleaning instructions","Check power, controls and any needed accessories","Consult product guidance about safe food storage and maintenance"]
 },
 {
  slug:"pilot-petlibro-dockstream-rfid-fountain",theme:"petcare",brandSlug:"petlibro",
  categoryTitle:"Pet hydration & care",categoryHref:"/pets",
  eyebrow:"Everyday care for your companions",
  shortDescription:"A Petlibro Dockstream RFID Smart Fountain listing. Exact model, connectivity and replacement-filter details need validation.",
  storyHeadline:"Make the practical details of pet hydration clearer.",
  storyIntro:"Capacity, cleaning, compatible consumables and the specific animal's needs should guide the choice of a pet fountain.",
  contextQuestion:"Which Dockstream version and replacement filters does this offer support?",
  prompts:["Verify fountain version and capacity","Check cleaning and filter requirements","Confirm power and connectivity details"],
  checks:["Check model/version and actual capacity","Confirm filter compatibility and replacement availability","Validate power, cleaning and maintenance guidance","Review suitability with the pet's needs and available space"]
 }
];
export const BRAND_PREVIEWS:readonly BrandPreviewConfig[]=[
 {
  slug:"cadbury",displayName:"Cadbury",theme:"confectionery",
  headline:"Chocolate gifts and thoughtful sharing.",
  introduction:"A private editorial concept built around product records labelled Cadbury. This is not an official Cadbury shop, endorsed collection or paid partnership.",
  customerAngle:"Organise chocolate by occasion, pack size and individual preferences, with allergens and complete pack details verified before publication.",
  focusAreas:["Gifts and occasions","Pack size and contents","Ingredients and allergens"]
 },
 {
  slug:"craft-buddy",displayName:"Craft Buddy",theme:"crafting",
  headline:"Ideas for the things you love making.",
  introduction:"A private editorial collection concept built around imported Craft Buddy product titles. No brand assets, endorsements or commercial permission have been assumed.",
  customerAngle:"Lead with project type, materials, skill level and useful organisation. Product claims require licensed source evidence.",
  focusAreas:["Projects and kits","Storage and supplies","Skill and suitability"]
 },
 {
  slug:"akko",displayName:"AKKO",theme:"keyboards",
  headline:"Explore the details behind a keyboard setup.",
  introduction:"An AVUQO editorial brand-filter mock-up for AKKO-labelled imports, not a company-operated or sponsored storefront.",
  customerAngle:"Focus on exact models, keyboard layouts, switches and compatibility rather than unverified technical marketing.",
  focusAreas:["Keyboard models","Switch and layout details","Compatibility"]
 },
 {
  slug:"monsgeek",displayName:"MonsGeek",theme:"keyboards",
  headline:"Build a setup around the details that matter.",
  introduction:"A private AVUQO editorial brand-filter mock-up for MonsGeek-labelled imports, without any claim of authorisation or endorsement.",
  customerAngle:"Use exact configuration, SKU and practical use to guide browsing without inventing specifications.",
  focusAreas:["Model and variant","Typing experience questions","Compatibility and support"]
 },
 {
  slug:"petlibro",displayName:"Petlibro",theme:"petcare",
  headline:"Thoughtful questions for everyday pet care.",
  introduction:"A private, unaffiliated AVUQO brand-filter concept using Petlibro product records. It is not an official manufacturer destination.",
  customerAngle:"Help people compare practical feeding and hydration considerations, capacity and replacement supplies after verifying authorised product information.",
  focusAreas:["Feeding and hydration","Care and cleaning","Replacement supplies"]
 }
];
export function findPilotPreview(slug:string){return PILOT_PREVIEWS.find(p=>p.slug===slug);}
export function findBrandPreview(slug:string){return BRAND_PREVIEWS.find(b=>b.slug===slug);}
export function productsForBrand(slug:string){return PILOT_PREVIEWS.filter(p=>p.brandSlug===slug);}
export function privatePilotHref(slug:string){return "/control-centre/pilot-products/"+encodeURIComponent(slug);}
export function privateBrandHref(slug:string){return "/control-centre/brand-previews/"+encodeURIComponent(slug);}
export function independentBrandPolicy(){
 return {thirdPartyBrandNameAllowedAsIdentification:true,
  implyOfficialPartnership:false,brandLogoRightsAssumed:false,
  sponsorCanInfluenceAVUQOScore:false,sponsorCanInfluenceOrganicRank:false,
  liveAdServing:false,merchantImageUsageUnverified:true} as const;
}
