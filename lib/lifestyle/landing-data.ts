/**
 * Original AVUQO editorial page copy with illustrative, licensed lifestyle photography.
 * Never present these images as exact affiliate products or verified merchant offers.
 */
const image = (id: string, width = 1500) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;
export type Inspiration = {title: string; copy: string; search: string; image: string};
export type Landing = {
  slug: string; eyebrow: string; headline: string; highlight: string; intro: string;
  hero: string; heroPosition?: string; accent: string;
  tiles: Inspiration[]; tips: {title:string; copy:string}[];
  featureTitle: string; featureCopy: string; featureImage: string;
};
export const lifestylePages: Record<string,Landing> = {
  shopping: {
    slug:"shopping", eyebrow:"Shopping with AVUQO",headline:"Shop smarter.",highlight:"Choose better.",accent:"#ef6718",
    intro:"Discover the categories that matter to you, from everyday essentials to considered purchases. Look beyond the sticker price and focus on what is actually worthwhile.",
    hero:image("photo-1555529669-e69e7aa0ba9a"), heroPosition:"center 50%",
    tiles:[
      {title:"Technology",copy:"Everyday gadgets and bigger upgrades.",search:"technology",image:image("photo-1498049794561-7780e7231661",700)},
      {title:"Home & living",copy:"Make more of your space.",search:"home furniture",image:image("photo-1600210492486-724fe5c67fb0",700)},
      {title:"Style & fashion",copy:"A wardrobe with lasting value.",search:"fashion",image:image("photo-1483985988355-763728e1935b",700)},
      {title:"Beauty & wellbeing",copy:"Essentials, routines and thoughtful gifts.",search:"beauty skincare",image:image("photo-1596462502278-27bfdc403348",700)},
      {title:"Toys & play",copy:"Playful ideas for different ages.",search:"toys gifts",image:image("photo-1558060370-d644479cb6f7",700)},
      {title:"Gifts",copy:"Find thoughtful ideas for every occasion.",search:"gifts",image:image("photo-1549465220-1a8b9238cd48",700)}
    ],
    tips:[{title:"Start with the total",copy:"Compare delivery, subscriptions and any continuing costs, not just the headline price."},{title:"Buy for real needs",copy:"Features are only valuable when you will actually use them."},{title:"Verify before checkout",copy:"Check the latest price, stock and terms directly with the retailer."}],
    featureTitle:"Good value feels different.",featureCopy:"A useful purchase is more than a big discount label. AVUQO puts context, cost and trust first.",featureImage:image("photo-1441986300917-64674bd600d8",900)
  },
  travel: {
    slug:"travel",eyebrow:"Discover more of the world",headline:"Go further.",highlight:"Spend wiser.",accent:"#d36837",
    intro:"From peaceful escapes to bigger adventures, plan trips with the total cost in mind. Explore destinations, transport and the details that can change the final bill.",
    hero:image("photo-1507525428034-b723cf961d3e"),heroPosition:"center 55%",
    tiles:[
      {title:"Beach escapes",copy:"Sunshine, coastlines and time to unwind.",search:"beach holiday",image:image("photo-1507525428034-b723cf961d3e",700)},
      {title:"City breaks",copy:"Culture, dining and short getaways.",search:"city break",image:image("photo-1488646953014-85cb44e25828",700)},
      {title:"Hotels & stays",copy:"Find the right base for your trip.",search:"hotel accommodation",image:image("photo-1566073771259-6a8506099945",700)},
      {title:"Flights & transport",copy:"Understand baggage and transfer costs.",search:"flights",image:image("photo-1436491865332-7a61a109cc05",700)},
      {title:"Nature adventures",copy:"Landscapes, trails and fresh air.",search:"outdoor adventure",image:image("photo-1469474968028-56623f02e42e",700)},
      {title:"Travel essentials",copy:"The useful things before you leave.",search:"travel essentials",image:image("photo-1476514525535-07fb3b4ae5f1",700)}
    ],
    tips:[{title:"Compare trip totals",copy:"Factor in bags, transfers, resort charges and local transport."},{title:"Check flexibility",copy:"Understand cancellation and change conditions before booking."},{title:"Read the small print",copy:"Check insurance coverage, booking protection and eligibility."}],
    featureTitle:"The best trip works on every level.",featureCopy:"Look beyond the first advertised price to the complete journey and the experience you actually want.",featureImage:image("photo-1476514525535-07fb3b4ae5f1",900)
  },
  home: {
    slug:"home",eyebrow:"Home & living",headline:"A home that works.",highlight:"A price that fits.",accent:"#9c6746",
    intro:"Create a more comfortable home with thoughtful furniture, practical appliances and everyday essentials. Explore ideas without losing sight of running costs and longevity.",
    hero:image("photo-1600210492486-724fe5c67fb0"),heroPosition:"center 55%",
    tiles:[
      {title:"Furniture",copy:"Spaces worth staying in.",search:"furniture",image:image("photo-1616486338812-3dadae4b4ace",700)},
      {title:"Kitchen",copy:"Make daily cooking simpler.",search:"kitchen appliances",image:image("photo-1556911220-bff31c812dba",700)},
      {title:"Lighting",copy:"Set the mood and use less energy.",search:"lighting",image:image("photo-1507473885765-e6ed057f782c",700)},
      {title:"Garden & outdoors",copy:"Refresh your outdoor living.",search:"garden outdoor",image:image("photo-1416879595882-3373a0480b5b",700)},
      {title:"Bedding & comfort",copy:"Small upgrades with everyday impact.",search:"bedding",image:image("photo-1616594039964-ae9021a400a0",700)},
      {title:"Storage & organisation",copy:"Make the most of every room.",search:"home storage",image:image("photo-1600607687939-ce8a6c25118c",700)}
    ],
    tips:[{title:"Measure twice",copy:"Check dimensions, access and assembly before ordering large items."},{title:"Consider running costs",copy:"Energy usage and consumables can matter more than small upfront savings."},{title:"Plan for longevity",copy:"Materials, serviceability and warranty can affect long-term value."}],
    featureTitle:"Make room for better decisions.",featureCopy:"Smart home shopping starts with practical needs, comfort, space and total ownership costs.",featureImage:image("photo-1600566753190-17f0baa2a6c3",900)
  },
  tech: {
    slug:"tech",eyebrow:"Technology",headline:"Useful tech.",highlight:"Without the hype.",accent:"#cf6941",
    intro:"Explore laptops, headphones, connected devices and home technology with an eye on real-world usefulness, compatibility and long-term cost.",
    hero:image("photo-1498049794561-7780e7231661"),
    tiles:[
      {title:"Laptops & computing",copy:"Choose for the way you actually work.",search:"laptops",image:image("photo-1496181133206-80ce9b88a853",700)},
      {title:"Phones & accessories",copy:"Devices, contracts and everyday extras.",search:"smartphones",image:image("photo-1511707171634-5f897ff02aa9",700)},
      {title:"Audio",copy:"Headphones, speakers and sound.",search:"headphones",image:image("photo-1505740420928-5e560c06d30e",700)},
      {title:"Home tech",copy:"Connected comfort and smarter routines.",search:"smart home",image:image("photo-1558002038-1055907df827",700)},
      {title:"TV & entertainment",copy:"Screens, streaming and setups.",search:"television",image:image("photo-1593359677879-a4bb92f829d1",700)},
      {title:"Cameras & creativity",copy:"Tools for making memories.",search:"cameras",image:image("photo-1516035069371-29a1b244cc32",700)}
    ],
    tips:[{title:"Check compatibility",copy:"Make sure it works with your existing devices and services."},{title:"Read subscription costs",copy:"Some devices have memberships, storage or service fees."},{title:"Look past specifications",copy:"Practical performance matters more than marketing numbers."}],
    featureTitle:"Technology should earn its place.",featureCopy:"Discover features worth paying for, and those you can probably do without.",featureImage:image("photo-1519389950473-47ba0277781c",900)
  },
  gifts: {
    slug:"gifts",eyebrow:"Thoughtful gifting",headline:"Give something good.",highlight:"Not just something new.",accent:"#d16a52",
    intro:"Discover gifts with meaning, whether you are planning a birthday, thanking someone or making Christmas special. Start with the recipient and keep to your budget.",
    hero:image("photo-1549465220-1a8b9238cd48"),
    tiles:[
      {title:"Gifts under £25",copy:"Small budget, thoughtful choice.",search:"gifts under £25",image:image("photo-1513201099705-a9746e1e201f",700)},
      {title:"Creative gifting",copy:"Make, paint and personalise.",search:"creative craft gifts",image:image("photo-1452860606245-08befc0ff44b",700)},
      {title:"Food & sweet treats",copy:"Share something delicious.",search:"chocolate gifts",image:image("photo-1511381939415-e44015466834",700)},
      {title:"For the home",copy:"Useful things with a personal touch.",search:"home gifts",image:image("photo-1490312278390-ab64016e0aa9",700)},
      {title:"For pet lovers",copy:"Thoughtful surprises for animal people.",search:"pet gifts",image:image("photo-1517849845537-4d257902454a",700)},
      {title:"Christmas ideas",copy:"Festive presents and planning.",search:"Christmas gifts",image:image("photo-1512389142860-9c449e58a543",700)}
    ],
    tips:[{title:"Think of the recipient",copy:"What will they enjoy, use or remember?"},{title:"Factor in delivery",copy:"Personalised gifts can take longer to prepare."},{title:"Keep an easy list",copy:"Track who you are shopping for and your planned spending."}],
    featureTitle:"It's the thought that earns its value.",featureCopy:"Personal relevance often matters more than a premium price tag.",featureImage:image("photo-1513201099705-a9746e1e201f",900)
  },
  toys: {
    slug:"toys",eyebrow:"Toys & play",headline:"Big imaginations.",highlight:"Thoughtful choices.",accent:"#e07338",
    intro:"Explore hands-on play, creative hobbies and gifts that fit the child, the space and your budget. Check age guidance and safety information with the retailer.",
    hero:image("photo-1558060370-d644479cb6f7"),
    tiles:[
      {title:"Creative play",copy:"Paint, make and invent.",search:"creative toys",image:image("photo-1513364776144-60967b0f800f",700)},
      {title:"Building & puzzles",copy:"Think, stack and solve.",search:"building toys",image:image("photo-1587654780291-39c9404d746b",700)},
      {title:"Soft toys",copy:"Cuddly companions and keepsakes.",search:"soft toys",image:image("photo-1559454403-b8fb88521f11",700)},
      {title:"Outdoor play",copy:"Movement, games and fresh air.",search:"outdoor toys",image:image("photo-1596464716127-f2a82984de30",700)},
      {title:"Games & activities",copy:"Time spent together.",search:"board games",image:image("photo-1610890716171-6b1bb98ffd09",700)},
      {title:"Birthday gifts",copy:"Discover age-appropriate gift ideas.",search:"birthday toys",image:image("photo-1513201099705-a9746e1e201f",700)}
    ],
    tips:[{title:"Check age guidance",copy:"Look at suitability, warnings and supervision requirements."},{title:"Consider storage",copy:"Bigger playsets can need more room than expected."},{title:"Choose repeat play",copy:"Open-ended toys can keep their appeal for longer."}],
    featureTitle:"More play, more possibility.",featureCopy:"A great toy invites exploration and makes room for imagination.",featureImage:image("photo-1513364776144-60967b0f800f",900)
  },
  beauty: {
    slug:"beauty",eyebrow:"Beauty & wellbeing",headline:"Feel good.",highlight:"Choose confidently.",accent:"#b36861",
    intro:"Explore skincare, beauty tools and self-care ideas with clear thinking about ingredients, suitability and realistic value.",
    hero:image("photo-1596462502278-27bfdc403348"),
    tiles:[
      {title:"Skincare",copy:"A routine that fits your needs.",search:"skincare",image:image("photo-1620916566398-39f1143ab7be",700)},
      {title:"Haircare",copy:"Care, styling and simple routines.",search:"haircare",image:image("photo-1526947425960-945c6e72858f",700)},
      {title:"Fragrance",copy:"Considered scents and gifts.",search:"fragrance",image:image("photo-1541643600914-78b084683601",700)},
      {title:"Makeup",copy:"Everyday essentials and colour.",search:"makeup",image:image("photo-1512496015851-a90fb38ba796",700)},
      {title:"Wellness gifts",copy:"Thoughtful relaxation ideas.",search:"wellness gifts",image:image("photo-1540555700478-4be289fbecef",700)},
      {title:"Beauty accessories",copy:"Tools that help your routine.",search:"beauty tools",image:image("photo-1596755389378-c31d21fd1273",700)}
    ],
    tips:[{title:"Know your needs",copy:"Ingredients and skin suitability matter more than trends."},{title:"Check product size",copy:"Compare volume or quantity before judging value."},{title:"Shop responsibly",copy:"Buy from reliable sellers and check returns and expiry details."}],
    featureTitle:"Less noise. More everyday confidence.",featureCopy:"A simple, suitable routine can outperform a crowded shelf.",featureImage:image("photo-1620916566398-39f1143ab7be",900)
  },
  fashion: {
    slug:"fashion",eyebrow:"Style & fashion",headline:"Wear what lasts.",highlight:"Love what you buy.",accent:"#b96a43",
    intro:"Find wardrobe ideas built around usefulness, fit and personal style. Think cost per wear rather than chasing the biggest markdown.",
    hero:image("photo-1483985988355-763728e1935b"),
    tiles:[
      {title:"Everyday clothing",copy:"Versatile pieces for regular wear.",search:"everyday clothing",image:image("photo-1445205170230-053b83016050",700)},
      {title:"Shoes",copy:"Style, fit and comfort.",search:"shoes",image:image("photo-1549298916-b41d501d3772",700)},
      {title:"Bags & accessories",copy:"Details with practical purpose.",search:"bags accessories",image:image("photo-1584917865442-de89df76afd3",700)},
      {title:"Outerwear",copy:"Layers that work with the weather.",search:"coats jackets",image:image("photo-1539533018447-63fcce2678e3",700)},
      {title:"Occasionwear",copy:"Dress for moments that matter.",search:"occasionwear",image:image("photo-1515886657613-9f3515b0c78f",700)},
      {title:"Gifts & personal style",copy:"Find a considered finishing touch.",search:"fashion gifts",image:image("photo-1490481651871-ab68de25d43d",700)}
    ],
    tips:[{title:"Think cost per wear",copy:"A reliable staple can offer more value than a dramatic sale."},{title:"Read the size guide",copy:"Fit and return terms affect the real buying experience."},{title:"Care makes a difference",copy:"Fabric and cleaning requirements add to long-term ownership."}],
    featureTitle:"Buy less impulsively. Wear more happily.",featureCopy:"Find pieces that fit your life, rather than just the current promotion.",featureImage:image("photo-1490481651871-ab68de25d43d",900)
  },
  motoring: {
    slug:"motoring",eyebrow:"Motoring",headline:"Enjoy the journey.",highlight:"Know the costs.",accent:"#bb6349",
    intro:"From choosing a vehicle to everyday maintenance, explore the decisions where the true total can matter far more than the advertised headline.",
    hero:image("photo-1503376780353-7e6692767b70"),
    tiles:[
      {title:"Car buying",copy:"Compare the whole ownership picture.",search:"cars",image:image("photo-1492144534655-ae79c964c9d7",700)},
      {title:"Leasing & finance",copy:"Understand terms and upfront costs.",search:"car lease",image:image("photo-1549317661-bd32c8ce0db2",700)},
      {title:"Maintenance",copy:"Care, servicing and useful essentials.",search:"car maintenance",image:image("photo-1486262715619-67b85e0b08d3",700)},
      {title:"Car accessories",copy:"Practical upgrades for the road.",search:"car accessories",image:image("photo-1507136566006-cfc505b114fc",700)},
      {title:"Trips & parking",copy:"Plan journey costs from start to finish.",search:"parking travel",image:image("photo-1473448912268-2022ce9509d8",700)},
      {title:"Car insurance",copy:"Check coverage, excess and terms.",search:"car insurance",image:image("photo-1517524008697-84bbe3c3fd98",700)}
    ],
    tips:[{title:"Add the full term",copy:"Finance, insurance and servicing add up over time."},{title:"Check mileage & limits",copy:"Leasing contracts can include expensive mileage and condition charges."},{title:"Compare suitability",copy:"Space, efficiency and reliability matter for daily life."}],
    featureTitle:"The road ahead is more than a monthly payment.",featureCopy:"A smarter comparison includes the costs you cannot see in a headline deal.",featureImage:image("photo-1449965408869-eaa3f722e40d",900)
  },
  experiences: {
    slug:"experiences",eyebrow:"Experiences & days out",headline:"Make memories.",highlight:"Make them count.",accent:"#cc7549",
    intro:"Discover inspiration for shared moments, short adventures and memorable days out. Plan with transport, timings and booking conditions in mind.",
    hero:image("photo-1469474968028-56623f02e42e"),
    tiles:[
      {title:"Days out",copy:"Time together close to home.",search:"days out",image:image("photo-1476514525535-07fb3b4ae5f1",700)},
      {title:"Food experiences",copy:"New tastes and memorable occasions.",search:"dining experiences",image:image("photo-1414235077428-338989a2e8c0",700)},
      {title:"Outdoor adventure",copy:"Get moving and explore.",search:"outdoor activities",image:image("photo-1464822759023-fed622ff2c3b",700)},
      {title:"Shows & culture",copy:"Performances, museums and exhibitions.",search:"theatre experiences",image:image("photo-1470229722913-7c0e2dbbafd3",700)},
      {title:"Family activities",copy:"Great days for all ages.",search:"family activities",image:image("photo-1500534623283-312aade485b7",700)},
      {title:"Experience gifts",copy:"Give time rather than clutter.",search:"experience gifts",image:image("photo-1533105079780-92b9be482077",700)}
    ],
    tips:[{title:"Check the full outing",copy:"Tickets, food, travel and parking all affect the total."},{title:"Know booking rules",copy:"Pay attention to expiry dates, refundability and rescheduling."},{title:"Make it suitable",copy:"Age restrictions, accessibility and weather matter."}],
    featureTitle:"Time well spent is its own kind of value.",featureCopy:"Explore inspiration, then check the real terms before you commit.",featureImage:image("photo-1469474968028-56623f02e42e",900)
  }
};
export const lifestyleOrder = ["shopping","travel","home","tech","gifts","toys","beauty","fashion","motoring","experiences"] as const;
