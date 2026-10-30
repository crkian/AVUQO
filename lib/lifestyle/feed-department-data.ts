import type { Landing } from "./landing-data";

/** Editorial-only departments informed by private Awin import taxonomy.
 * They never query staged merchant records or publish offers/images.
 */
const image=(id:string,w=1500)=>`https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const feedDepartmentPages:Record<"crafts"|"chocolate-gifts"|"keyboards",Landing>={
  crafts:{
    slug:"crafts",eyebrow:"AVUQO Crafts & Hobbies",headline:"Make something wonderful.",highlight:"Choose what lasts.",accent:"#a96377",
    intro:"Explore Crystal Art, crafting kits, paper crafts, flower-making and tools. Find a project that suits your skills, space and budget. Merchant feeds are in private review, so no prices shown here are claimed live.",
    hero:image("photo-1452860606245-08befc0ff44b"),
    tiles:[
      {title:"Crystal Art & diamond painting",copy:"Think about finished size, tools and time needed.",search:"crystal art kits",image:image("photo-1513364776144-60967b0f800f",700)},
      {title:"Flower-making kits",copy:"Artificial flowers, floral crafts and arrangements.",search:"flower making craft kits",image:image("photo-1416879595882-3373a0480b5b",700)},
      {title:"Cards & papercraft",copy:"Greeting cards, stamping and paper projects.",search:"card making craft kits",image:image("photo-1452860606245-08befc0ff44b",700)},
      {title:"Craft kits & creative gifts",copy:"Hands-on projects for different experience levels.",search:"arts and crafts kits",image:image("photo-1513364776144-60967b0f800f",700)},
      {title:"Craft tools & accessories",copy:"Check what's included before buying extra supplies.",search:"craft tools stamps stencils",image:image("photo-1490312278390-ab64016e0aa9",700)},
      {title:"Creative decorations & puzzles",copy:"Make display pieces, gifts and keepsakes.",search:"creative decorations puzzles",image:image("photo-1549465220-1a8b9238cd48",700)}
    ],
    tips:[
      {title:"Check the contents",copy:"A complete kit may need glue, frames, spare beads or batteries bought separately."},
      {title:"Match the difficulty",copy:"Read intended age, dimensions, materials and completion time before choosing."},
      {title:"Watch the total",copy:"Compare kit size and included materials, and check delivery costs and returns."}
    ],
    featureTitle:"The joy is in making it.",featureCopy:"A worthwhile project balances what you make, what you learn and what you actually need to finish it.",featureImage:image("photo-1513364776144-60967b0f800f",900)
  },
  "chocolate-gifts":{
    slug:"chocolate-gifts",eyebrow:"AVUQO Chocolate & Gifting",headline:"A little something special.",highlight:"With value in mind.",accent:"#a56b49",
    intro:"Explore chocolate bars, boxed gifts, hampers and gifts for occasions. Check size, ingredients, expiry, delivery and the recipient's needs before choosing. Listings will appear only after source approval.",
    hero:image("photo-1511381939415-e44015466834"),
    tiles:[
      {title:"Chocolate bars & sharing",copy:"Compare weights, varieties and pack sizes.",search:"chocolate bars sharing",image:image("photo-1511381939415-e44015466834",700)},
      {title:"Chocolate gift boxes",copy:"Treats to give, share or savour.",search:"chocolate gift box",image:image("photo-1513201099705-a9746e1e201f",700)},
      {title:"Hampers & bundles",copy:"Look at the complete contents, not just the packaging.",search:"chocolate hampers",image:image("photo-1549465220-1a8b9238cd48",700)},
      {title:"Birthday gifts",copy:"Occasion-ready gift ideas with practical delivery checks.",search:"birthday chocolate gifts",image:image("photo-1513201099705-a9746e1e201f",700)},
      {title:"Seasonal chocolate",copy:"Shop by season while checking stock and dates.",search:"seasonal chocolate gifts",image:image("photo-1512389142860-9c449e58a543",700)},
      {title:"Personalised treats",copy:"Double-check names, customisation and delivery lead times.",search:"personalised chocolate gifts",image:image("photo-1511381939415-e44015466834",700)}
    ],
    tips:[
      {title:"Compare price per gram",copy:"Different box sizes and bundles need a comparable unit price."},
      {title:"Check allergens & dates",copy:"Read the actual retailer label, ingredients, best-before details and storage instructions."},
      {title:"Plan the arrival",copy:"Hot weather, personalisation and occasion delivery windows can change suitability."}
    ],
    featureTitle:"Thoughtful beats extravagant.",featureCopy:"The better gift fits the recipient, arrives in time and delivers clear value for its size and contents.",featureImage:image("photo-1513201099705-a9746e1e201f",900)
  },
  keyboards:{
    slug:"keyboards",eyebrow:"AVUQO Mechanical Keyboards",headline:"Find your perfect setup.",highlight:"Key by key.",accent:"#536d94",
    intro:"Explore mechanical keyboards, keycaps, switches, layouts and useful desktop accessories. Consider compatibility, condition and configuration before comparing cost. Imported products remain private until verified.",
    hero:image("photo-1498049794561-7780e7231661"),
    tiles:[
      {title:"Mechanical keyboards",copy:"Layouts, connectivity and switch options.",search:"mechanical keyboard",image:image("photo-1496181133206-80ce9b88a853",700)},
      {title:"UK & ISO layouts",copy:"Check physical layout and regional key legends.",search:"ISO UK mechanical keyboard",image:image("photo-1498049794561-7780e7231661",700)},
      {title:"Keyboard switches",copy:"Compare feel, compatibility and fitting.",search:"keyboard switches",image:image("photo-1519389950473-47ba0277781c",700)},
      {title:"Keycaps & customisation",copy:"Materials, profiles and layout support.",search:"mechanical keyboard keycaps",image:image("photo-1496181133206-80ce9b88a853",700)},
      {title:"Gaming & desk accessories",copy:"Practical additions to your setup.",search:"keyboard gaming desk accessories",image:image("photo-1519389950473-47ba0277781c",700)},
      {title:"Refurbished equipment",copy:"Condition, warranty and returns matter.",search:"refurbished mechanical keyboards",image:image("photo-1498049794561-7780e7231661",700)}
    ],
    tips:[
      {title:"Confirm the layout",copy:"ISO-UK, ISO-DE, ANSI and other variants are not interchangeable for everyone."},
      {title:"Check the whole build",copy:"Barebones boards may exclude switches and keycaps; wireless models may need accessories."},
      {title:"Consider aftercare",copy:"Warranty, firmware support and refurbished condition can outweigh a small price difference."}
    ],
    featureTitle:"The right feel, not just the right price.",featureCopy:"Choose keyboards and components for the way you type, play and work, with exact model matching before price comparison.",featureImage:image("photo-1496181133206-80ce9b88a853",900)
  }
};
