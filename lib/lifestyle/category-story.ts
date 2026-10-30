/**
 * Distinct category destinations, editorially authored for AVUQO.
 * Intent prompts are search suggestions, NOT statements about available offers.
 * All destinations are live internal routes; unapproved taxonomy stays private.
 */
export type DiscoveryMoment={
 title:string;description:string;query:string;signal:string;
};
export type CategoryStory={
 slug:string;identity:string;strapline:string;featuredTitle:string;featuredCopy:string;
 browseLabel:string;searchPlaceholder:string;focus:string;
 energy:"warm"|"quiet"|"bright"|"fresh"|"bold"|"playful"|"coastal"|"modern";
 moments:[DiscoveryMoment,DiscoveryMoment,DiscoveryMoment];
};
export const CATEGORY_STORIES:Record<string,CategoryStory>={
 shopping:{
  slug:"shopping",identity:"The everyday edit",strapline:"Find the useful. Skip the noise.",
  featuredTitle:"Make everyday shopping feel less complicated.",
  featuredCopy:"Explore the products people use most, then check the real total and whether a purchase earns its place.",
  browseLabel:"Shopping edits",searchPlaceholder:"Try headphones, storage or everyday essentials",
  focus:"A good deal is a useful product at a fair, verifiable total price.",energy:"bright",
  moments:[
   {title:"Everyday essentials",description:"Useful purchases with fewer surprises.",query:"daily essentials",signal:"Start with what you actually need"},
   {title:"Bigger decisions",description:"Look beyond the headline price of major purchases.",query:"appliances",signal:"Check delivery and ongoing costs"},
   {title:"Thoughtful upgrades",description:"Small changes, lasting value.",query:"home improvements",signal:"Compare compatibility and lifespan"}
  ]
 },
 travel:{
  slug:"travel",identity:"The journey edit",strapline:"Make memories. Keep the full cost in view.",
  featuredTitle:"Plan the whole trip, not just the first ticket.",
  featuredCopy:"Flight extras, transfer costs, cancellation rules and location can all change the value of a break.",
  browseLabel:"Ways to get away",searchPlaceholder:"Try city breaks, family holidays or travel bags",
  focus:"Compare total trip costs, flexibility and suitability before booking.",energy:"coastal",
  moments:[
   {title:"Short escapes",description:"A few days away with room for discovery.",query:"city breaks",signal:"Check transport and location"},
   {title:"Longer adventures",description:"More planning, fewer costly surprises.",query:"family holidays",signal:"Allow for baggage and transfers"},
   {title:"Travel essentials",description:"Practical items for the journey.",query:"travel accessories",signal:"Buy only what you will use"}
  ]
 },
 home:{
  slug:"home",identity:"The living edit",strapline:"Designed for real rooms and real life.",
  featuredTitle:"A home that works beautifully, not just photographically.",
  featuredCopy:"Shape your space around dimensions, durability, energy use and comfort before comparing the asking price.",
  browseLabel:"Room-by-room inspiration",searchPlaceholder:"Try living room storage, lighting or kitchen tools",
  focus:"Measure for fit, inspect materials, and count installation and running costs.",energy:"warm",
  moments:[
   {title:"Living spaces",description:"Comfortable choices that suit your rooms.",query:"living room furniture",signal:"Measure before you buy"},
   {title:"Clever storage",description:"Give every useful thing its place.",query:"storage organisers",signal:"Check capacity and dimensions"},
   {title:"Better everyday routines",description:"Kitchen, lighting and considered upgrades.",query:"kitchen lighting",signal:"Look at care and energy use"}
  ]
 },
 tech:{
  slug:"tech",identity:"The technology edit",strapline:"Useful technology, minus the spec-sheet fog.",
  featuredTitle:"Choose a device that fits your life.",
  featuredCopy:"Performance only counts if the device is compatible, supported and useful for the tasks you actually do.",
  browseLabel:"Tech to explore",searchPlaceholder:"Try gaming keyboard, laptop or noise-cancelling headphones",
  focus:"Check compatibility, support life, repairability and subscriptions.",energy:"modern",
  moments:[
   {title:"Build your setup",description:"Computers, accessories and workspaces.",query:"mechanical keyboard",signal:"Check layout and compatibility"},
   {title:"Sound and screens",description:"Entertainment with a purpose.",query:"headphones speakers",signal:"Compare meaningful features"},
   {title:"Connected living",description:"Practical devices for the home.",query:"smart home devices",signal:"Ask about updates and running costs"}
  ]
 },
 gifts:{
  slug:"gifts",identity:"The gifting edit",strapline:"A better present starts with the person.",
  featuredTitle:"The thought is what makes it worthwhile.",
  featuredCopy:"Plan for the recipient, the occasion, realistic delivery time and what they would enjoy rather than the size of a discount.",
  browseLabel:"Gifting paths",searchPlaceholder:"Try creative gifts, chocolate hampers or gifts for pets",
  focus:"Choose by interests, budget and delivery deadlines, not urgency badges.",energy:"bright",
  moments:[
   {title:"Small but considered",description:"Meaningful gestures on a modest budget.",query:"gifts under £25",signal:"Set your limit first"},
   {title:"Made to enjoy",description:"Crafting, making and personal hobbies.",query:"craft gifts",signal:"Think about the recipient"},
   {title:"Shared treats",description:"A little something to experience together.",query:"chocolate gifts",signal:"Check allergens and delivery"}
  ]
 },
 toys:{
  slug:"toys",identity:"The play edit",strapline:"Curiosity beats clutter.",
  featuredTitle:"The best play keeps on giving.",
  featuredCopy:"Consider age suitability, safety guidance, how much room a toy needs and whether it invites repeat play.",
  browseLabel:"Ways to play",searchPlaceholder:"Try building toys, art kits or outdoor games",
  focus:"Check age guidance, safety information and the space a toy needs.",energy:"playful",
  moments:[
   {title:"Build and imagine",description:"Construction sets and open-ended play.",query:"building toys",signal:"Look for lasting play value"},
   {title:"Make something",description:"Hands-on creative projects.",query:"kids craft kits",signal:"Check supervision guidance"},
   {title:"Get moving",description:"Games for fresh air and energy.",query:"outdoor games",signal:"Match activity to the child"}
  ]
 },
 beauty:{
  slug:"beauty",identity:"The personal care edit",strapline:"A thoughtful routine, not a crowded shelf.",
  featuredTitle:"Find care that feels right for you.",
  featuredCopy:"Ingredients, product size, suitability, reliable sellers and honest expectations matter more than a viral recommendation.",
  browseLabel:"Your routine, your choice",searchPlaceholder:"Try skincare, fragrance or haircare",
  focus:"Check ingredients, suitability, size and seller terms.",energy:"quiet",
  moments:[
   {title:"Daily rituals",description:"Simple care that works for your routine.",query:"daily skincare",signal:"Start with your skin's needs"},
   {title:"Hair and style",description:"Practical products and useful tools.",query:"haircare tools",signal:"Compare quantity and use"},
   {title:"Thoughtful fragrance",description:"Discover scents without pressure.",query:"fragrance gifts",signal:"Check sizes and authenticity"}
  ]
 },
 fashion:{
  slug:"fashion",identity:"The personal style edit",strapline:"Wear more. Regret less.",
  featuredTitle:"The best outfit is the one you actually wear.",
  featuredCopy:"Prioritise fit, fabric, comfort, washing instructions and the cost per wear over a dramatic percentage sign.",
  browseLabel:"Build your wardrobe",searchPlaceholder:"Try everyday outfits, comfortable shoes or coats",
  focus:"Check fit, fabric care, returns and cost per wear.",energy:"bold",
  moments:[
   {title:"Everyday favourites",description:"Versatile pieces for repeat wear.",query:"wardrobe essentials",signal:"Think cost per wear"},
   {title:"Shoes that work",description:"Comfort and practicality matter.",query:"comfortable shoes",signal:"Read sizing and returns"},
   {title:"For the occasion",description:"Thoughtful choices beyond one event.",query:"occasionwear",signal:"Consider rewearing"}
  ]
 },
 motoring:{
  slug:"motoring",identity:"The road edit",strapline:"Know the full journey cost.",
  featuredTitle:"A vehicle decision is never just the sticker price.",
  featuredCopy:"Finance, insurance, maintenance, energy, depreciation and mileage conditions can change what a car really costs.",
  browseLabel:"Motoring questions",searchPlaceholder:"Try car maintenance, accessories or leasing",
  focus:"Include insurance, maintenance, finance and fuel or charging in total cost.",energy:"modern",
  moments:[
   {title:"Choose a vehicle",description:"Your needs, your running costs.",query:"car buying",signal:"Compare total ownership"},
   {title:"Keep it running",description:"Servicing and useful accessories.",query:"car maintenance",signal:"Read fitment details"},
   {title:"Plan the journey",description:"Practical options before setting off.",query:"travel car accessories",signal:"Check ongoing expenses"}
  ]
 },
 experiences:{
  slug:"experiences",identity:"The day-out edit",strapline:"Spend well on time together.",
  featuredTitle:"The best experiences are worth planning for.",
  featuredCopy:"Tickets, travel, weather, accessibility and rescheduling rules all shape the quality and total cost of a day.",
  browseLabel:"Make a plan",searchPlaceholder:"Try days out, experience gifts or outdoor activities",
  focus:"Check accessibility, timings, booking conditions and travel costs.",energy:"fresh",
  moments:[
   {title:"Close to home",description:"Explore days out without travelling far.",query:"local days out",signal:"Check opening and access"},
   {title:"Something new",description:"Culture, skills and outdoor adventures.",query:"outdoor activities",signal:"Plan for the weather"},
   {title:"A gift of time",description:"Memorable experiences to share.",query:"experience gifts",signal:"Check validity and refunds"}
  ]
 }
};
export const publicLifestyleSlugs=Object.keys(CATEGORY_STORIES);
export const storyFor=(slug:string):CategoryStory|undefined=>CATEGORY_STORIES[slug];
export const storySearchHref=(query:string)=>"/search?q="+encodeURIComponent(query);
