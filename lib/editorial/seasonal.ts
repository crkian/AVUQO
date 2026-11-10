export type Season="sales"|"black-friday"|"easter"|"valentines";
export const seasonal={
sales:{eyebrow:"AVUQO Sales & savings",title:"Good things.",highlight:"Better decisions.",intro:"Sales are useful when the product and the price are genuinely right. Browse thoughtful starting points and learn what to check before spending.",color:"#a36549",wash:"#f9eee4",photo:"https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1500&q=80",status:"Seasonal guide · No unverified sale prices",date:"Shop with a clear head, all year round.",cards:[["Black Friday 2026","Plan for the November sales without buying into the hype.","/black-friday"],["Christmas","Thoughtful gifts and practical festive budgets.","/christmas"],["Home & living","Find things that genuinely improve everyday life.","/home"],["Technology","Choose useful upgrades, not just the biggest advertised reduction.","/tech"],["Groceries","Work from one shopping list and distinguish missing prices from savings.","/groceries"],["The reality check","Learn to question discount claims and compare value fairly.","/reality-check"]],tips:[["Check the reference price","A discount percentage alone does not tell you what shoppers usually paid."],["Compare the whole cost","Delivery, taxes, subscriptions and required extras can change the result."],["Buy for a reason","Make a list, set a budget, and take time to decide."]],notice:"This is a discovery and guidance page. It does not represent a live, comprehensive sales feed. AVUQO only treats prices and reductions as verified when authorised, current evidence supports them."},
"black-friday":{eyebrow:"Black Friday 2026",title:"Big sale season.",highlight:"Clear thinking.",intro:"Friday 27 November 2026 is Black Friday. Start with what you actually need and make room for a more considered choice when the offers arrive.",color:"#734d74",wash:"#f3edf2",photo:"https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1500&q=80",status:"2026 planning guide · Not a live Black Friday deal feed",date:"Friday 27 November 2026 · Cyber Monday 30 November 2026",cards:[["Tech upgrades","Check the exact model, storage, warranty and price history.","/tech"],["Home comforts","Furniture and appliances should fit your space and budget.","/home"],["Christmas gifts","Use a gift list so sales don't decide the shopping for you.","/christmas"],["Beauty & care","Compare size, ingredients and the retailer's terms.","/beauty"],["Travel","Look at booking inclusions, fees and cancellation terms.","/travel"],["All seasonal sales","Keep looking beyond one shopping weekend.","/sales"]],tips:[["Make a shortlist","A saved list before the sale helps keep impulse spending in check."],["Don't trust crossed-out prices alone","Verify the same product variant and compare prices against reliable evidence."],["Remember your rights","Check who sells the item, the returns policy and delivery details."]],notice:"This page is editorial planning content for Black Friday 2026. It does not claim any particular merchant has discounted a product or guarantee savings, availability, stock, or event participation."},

"easter": {
  eyebrow:"AVUQO Easter & spring",
  title:"A little spring.",
  highlight:"A lot to look forward to.",
  intro:"Thoughtful Easter ideas, useful spring refreshes and family activities. Browse inspiration and plan your purchases without assuming a seasonal promotion is a bargain.",
  color:"#805c95",wash:"#f6eef9",
  photo:"https://images.unsplash.com/photo-1457089328109-e5d9bd499191?auto=format&fit=crop&w=1500&q=80",
  status:"Seasonal inspiration · No unverified Easter offers",
  date:"Ideas for Easter and the spring season.",
  cards:[
    ["Gifts and thoughtful treats","Find a present with the recipient in mind, not just its wrapping.","/gifts"],
    ["Home for spring","Fresh ideas for your space, storage and everyday living.","/home"],
    ["Toys and games","Find something worth playing, making or sharing.","/toys"],
    ["Crafts and hobbies","Creative projects for the weekend and school holidays.","/categories"],
    ["Groceries and planning","Start with one shopping list and check actual retailer coverage.","/groceries"],
    ["Travel and experiences","Explore days out and journeys with the full cost in mind.","/experiences"]
  ],
  tips:[
    ["Make a plan","List the people, occasions and essentials before you browse."],
    ["Compare equivalent items","Check quantity, ingredients, size and delivery terms before choosing."],
    ["Don't assume a discount","Only confirmed, eligible retailer evidence can establish a real saving."]
  ],
  notice:"This is an Easter inspiration page, not a live seasonal offer feed. Any prices, reductions or retailer availability require separate current authorised evidence."
},
"valentines": {
  eyebrow:"AVUQO Valentine's inspiration",
  title:"For the people.",
  highlight:"Who matter most.",
  intro:"Gifts, little gestures and shared experiences, chosen with thought. Find ideas without the pressure of a countdown, an invented offer or a price tag that decides for you.",
  color:"#9e496d",wash:"#faedf1",
  photo:"https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1500&q=80",
  status:"Gifting guide · No unverified Valentine's prices",
  date:"Thoughtful ideas for Valentine's Day and beyond.",
  cards:[
    ["Gifts with meaning","Choose something personal, useful or simply delightful.","/gifts"],
    ["Beauty and care","Look at suitability, size and ingredients before gifting.","/beauty"],
    ["Experiences together","Explore days out and memories worth making.","/experiences"],
    ["Home comforts","Make a cosy occasion at home, on your terms.","/home"],
    ["Fashion and accessories","Pick enduring favourites over impulse purchases.","/fashion"],
    ["Your gift list","Keep ideas together, with room for everyone's preferences.","/lists"]
  ],
  tips:[
    ["Start with the person","A thoughtful fit matters more than an advertised discount."],
    ["Think about the whole cost","Include delivery dates, extras and cancellation terms."],
    ["Keep it pressure-free","An occasion doesn't need an expensive purchase to matter."]
  ],
  notice:"This is editorial gifting guidance, not confirmation of merchant participation, a time-limited promotion, availability or a verified discount."
}
} as const;
