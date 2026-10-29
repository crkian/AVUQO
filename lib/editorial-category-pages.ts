/**
 * Editorial category photography, Pexels free-to-use imagery.
 * Images are illustrative, never retailer offers or proof of a price.
 * Product photos must continue through AVUQO's merchant-rights review gate.
 */
export type CategorySlug = "shopping"|"travel"|"home"|"tech"|"fashion"|"beauty"|"gifts"|"toys"|"motoring"|"experiences";
export type Tile = { title:string; description:string; photo:number; query:string };
export type CategoryData = { label:string; headline:string; intro:string; heroPhoto:number; accent:string; photoAlt:string; tiles:Tile[]; detailTitle:string; detailText:string; detailPhoto:number; detailQuery:string };
export const photoUrl = (id:number, width=1000) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;
export const categoryPages: Record<CategorySlug,CategoryData> = {
  shopping: {
    label:"AVUQO Shopping", headline:"Good finds. Better decisions.",
    intro:"Explore everything from useful everyday essentials to thoughtful gifts. Start with the category, then look at the true cost before buying.",
    heroPhoto:4440836, photoAlt:"Shopping parcels and bags arranged at home", accent:"#c9683f",
    tiles:[
      {title:"Tech & electronics",description:"Devices and accessories worth comparing.",photo:34803981,query:"electronics"},
      {title:"Home & living",description:"Comfort, furniture and daily essentials.",photo:8045883,query:"home"},
      {title:"Beauty & care",description:"Practical skincare and wellbeing ideas.",photo:14438270,query:"beauty"},
      {title:"Gifts & occasions",description:"Thoughtful presents with value in mind.",photo:6334694,query:"gifts"}
    ],
    detailTitle:"A better way to browse.",detailText:"From product specifications to delivery charges, real value takes more than a price tag. AVUQO is building a consistent, evidence-led way to explore retailers.",detailPhoto:5872357,detailQuery:"shopping value"
  },
  travel: {
    label:"AVUQO Travel",headline:"Go further. Spend smarter.",
    intro:"From beach escapes to weekend adventures, explore the parts of a trip that influence its full cost, not just the tempting headline fare.",
    heroPhoto:12107055, photoAlt:"Beautiful coastline with turquoise sea and white sand", accent:"#137d80",
    tiles:[
      {title:"Beach holidays",description:"Find your perfect coast without the hidden extras.",photo:6266327,query:"beach holidays"},
      {title:"Hotels & stays",description:"Look beyond the nightly rate.",photo:16574323,query:"hotels"},
      {title:"Cruises & getaways",description:"Understand what's included before booking.",photo:27651183,query:"cruises"},
      {title:"Outdoor adventures",description:"Ideas for active escapes and days outdoors.",photo:35014163,query:"adventure travel"}
    ],
    detailTitle:"The total trip matters.",detailText:"Compare luggage, transfers, local travel, taxes, booking terms and cancellation policies alongside the advertised holiday price. Current live travel inventory is not connected yet.",detailPhoto:28408486,detailQuery:"travel comparison"
  },
  home: {
    label:"AVUQO Home",headline:"Make home feel more like you.",
    intro:"Thoughtful home upgrades, practical appliances and everyday essentials. Discover ideas that work for your space and your budget.",
    heroPhoto:8045883,photoAlt:"Warm bright living room with sofa, furniture and daylight",accent:"#537b5b",
    tiles:[
      {title:"Furniture & comfort",description:"Comfortable pieces made for everyday living.",photo:5825398,query:"furniture"},
      {title:"Home appliances",description:"Consider energy use, reliability and price.",photo:8089170,query:"home appliances"},
      {title:"Décor & finishing touches",description:"Little changes that make a room.",photo:30890918,query:"home decor"},
      {title:"Home technology",description:"Useful tech for a more connected home.",photo:34803981,query:"smart home"}
    ],
    detailTitle:"Think about lifetime cost.",detailText:"Delivery, assembly, energy consumption and aftercare can matter just as much as the amount on the product label.",detailPhoto:8045883,detailQuery:"home essentials"
  },
  tech: {
    label:"AVUQO Tech",headline:"Better tech. Not just newer tech.",
    intro:"Laptops, phones, sound and smart-home essentials. Focus on the features you'll actually use and the full price you'll pay.",
    heroPhoto:34803981,photoAlt:"Minimalist laptop, headphones and phone in a modern workspace",accent:"#5269a2",
    tiles:[
      {title:"Laptops & computers",description:"Choose the right performance for the job.",photo:5533732,query:"laptops"},
      {title:"Phones & accessories",description:"Compare handsets, devices and running costs.",photo:16564512,query:"smartphones"},
      {title:"Audio & headphones",description:"Find your sound without unnecessary extras.",photo:25285767,query:"headphones"},
      {title:"Home tech",description:"Connected devices for everyday convenience.",photo:4195325,query:"smart home tech"}
    ],
    detailTitle:"Specs are only part of value.",detailText:"Battery life, warranty, repairability and compatible accessories can change the long-term cost of any device.",detailPhoto:5533732,detailQuery:"technology products"
  },
  fashion: {
    label:"AVUQO Fashion",headline:"Great style. Fewer impulse buys.",
    intro:"Discover clothing, footwear and wardrobe ideas with an eye on quality, versatility and what you truly need.",
    heroPhoto:36730375,photoAlt:"Fashion shopper looking through stylish clothing racks",accent:"#9a687b",
    tiles:[
      {title:"Everyday clothing",description:"Wearable styles that last beyond a season.",photo:5424922,query:"clothing"},
      {title:"Wardrobe essentials",description:"Build outfits around the pieces you love.",photo:4947543,query:"wardrobe essentials"},
      {title:"Occasion dressing",description:"Dress for the moment and your budget.",photo:7679682,query:"occasion outfits"},
      {title:"Outerwear & layers",description:"Comfort, quality and all-weather value.",photo:4857762,query:"coats"}
    ],
    detailTitle:"Buy less often. Buy more carefully.",detailText:"Fit, materials, ease of care and return policies deserve as much attention as the initial price.",detailPhoto:8311879,detailQuery:"fashion"
  },
  beauty: {
    label:"AVUQO Beauty",headline:"Feel good about every choice.",
    intro:"Explore skincare, personal care and beauty ideas with clearer thinking about ingredients, value and what you actually use.",
    heroPhoto:14438270,photoAlt:"Elegant beauty bottles and skincare products on natural stone",accent:"#af7463",
    tiles:[
      {title:"Skincare",description:"Thoughtful basics and everyday routines.",photo:8100778,query:"skincare"},
      {title:"Make-up",description:"Find the essentials that suit your style.",photo:8076229,query:"makeup"},
      {title:"Body & personal care",description:"Products for everyday wellbeing.",photo:6621472,query:"personal care"},
      {title:"Beauty gifts",description:"Treats for the beauty lover in your life.",photo:7795760,query:"beauty gifts"}
    ],
    detailTitle:"It's about what works for you.",detailText:"Think about ingredients, pack sizes, skin suitability and recurring costs. Editorial imagery is not a product recommendation.",detailPhoto:4202329,detailQuery:"beauty"
  },
  gifts: {
    label:"AVUQO Gifts",headline:"Find something they'll actually love.",
    intro:"Thoughtful gifting starts with the person, the occasion and a comfortable budget. Explore creative, practical and memorable ideas.",
    heroPhoto:6334694,photoAlt:"Carefully wrapped presents arranged for gifting",accent:"#a96256",
    tiles:[
      {title:"Gifts under £25",description:"Small surprises without overspending.",photo:5872357,query:"gifts under £25"},
      {title:"Books & cosy moments",description:"A quiet evening can be a brilliant gift.",photo:33467509,query:"book gifts"},
      {title:"Gifts for the home",description:"Useful, beautiful and made for daily life.",photo:8045883,query:"home gifts"},
      {title:"Christmas gifting",description:"Find your festive starting point.",photo:6334694,query:"Christmas gifts"}
    ],
    detailTitle:"A good gift doesn't need a huge budget.",detailText:"Consider usefulness, delivery timing, personal taste and return options. Christmas has its own dedicated gift finder.",detailPhoto:5872357,detailQuery:"gift ideas"
  },
  toys: {
    label:"AVUQO Toys",headline:"A little play goes a long way.",
    intro:"From imaginative play to hands-on learning, discover ideas for toys and games that bring lasting enjoyment.",
    heroPhoto:7301166,photoAlt:"Child playing with colourful wooden toys in a bright room",accent:"#bc7144",
    tiles:[
      {title:"Creative play",description:"Make, build and imagine.",photo:3661364,query:"creative toys"},
      {title:"Wooden toys",description:"Classic play for curious minds.",photo:8504273,query:"wooden toys"},
      {title:"Games & activities",description:"Ideas for fun together.",photo:8307731,query:"family games"},
      {title:"Toys for gifting",description:"Age-appropriate gift inspiration.",photo:3661336,query:"toy gifts"}
    ],
    detailTitle:"Play value beats hype.",detailText:"Check age suitability, safety information, durability and how much use a toy is likely to get before buying.",detailPhoto:7301166,detailQuery:"toys"
  },
  motoring: {
    label:"AVUQO Motoring",headline:"Take the road to better value.",
    intro:"Explore cars, ownership costs and the practical details behind motoring decisions, from everyday driving to bigger upgrades.",
    heroPhoto:7434579,photoAlt:"Modern car parked outdoors on an urban street",accent:"#466477",
    tiles:[
      {title:"Cars & buying",description:"Consider the full financial picture.",photo:9452235,query:"cars"},
      {title:"Leasing & finance",description:"Go beyond the monthly headline figure.",photo:20855651,query:"car leasing"},
      {title:"Maintenance",description:"Plan for servicing and the essentials.",photo:16461369,query:"car maintenance"},
      {title:"Road trips",description:"Practical essentials for your journey.",photo:16035537,query:"road trip accessories"}
    ],
    detailTitle:"Think in total ownership cost.",detailText:"Insurance, energy or fuel, maintenance, finance and depreciation affect affordability. AVUQO does not yet provide live vehicle quotations.",detailPhoto:16461369,detailQuery:"motoring"
  },
  experiences: {
    label:"AVUQO Experiences",headline:"More moments worth remembering.",
    intro:"Explore concerts, days out, outdoor adventures and memorable experiences. Find enjoyment without being surprised by the final cost.",
    heroPhoto:34410696,photoAlt:"Crowd enjoying live concert with vibrant stage lights",accent:"#765e9c",
    tiles:[
      {title:"Live events",description:"Music and entertainment worth planning for.",photo:36425625,query:"concert tickets"},
      {title:"Adventure days",description:"Get outdoors and try something different.",photo:35014163,query:"adventure experiences"},
      {title:"Relaxation",description:"A calmer experience can be a perfect gift.",photo:4202329,query:"spa experience"},
      {title:"Experience gifts",description:"A memory instead of another object.",photo:6334694,query:"experience gifts"}
    ],
    detailTitle:"Know what's included.",detailText:"Check booking fees, travel costs, cancellation terms and accessibility before making plans. Current ticket availability is not verified here.",detailPhoto:34410696,detailQuery:"experiences"
  }
};
