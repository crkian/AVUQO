/** AVUQO Navigation v2. Conservative links to existing pages, never external URLs. */
export type NavigationLink={label:string;href:string;description:string;enabled:boolean;order:number};
export type NavigationGroup={id:string;label:string;href:string;intro:string;enabled:boolean;order:number;links:NavigationLink[]};
export type NavigationContent={schemaVersion:2;groups:NavigationGroup[]};
const group=(id:string,label:string,href:string,intro:string,order:number,items:[string,string,string][]):NavigationGroup=>({
 id,label,href,intro,enabled:true,order,links:items.map(([label,href,description],order)=>({label,href,description,enabled:true,order}))
});
export const DEFAULT_NAVIGATION:NavigationContent={schemaVersion:2,groups:[
 group("discover","Discover","/discover","Start with the discoveries that matter.",0,[
  ["Explore AVUQO","/discover","Browse departments and useful guides"],
  ["The Marketplace","/marketplace","Explore, shop, compare or meet the specialists"],
  ["The Retail Park","/partners","Meet participating advertisers and find eligible offers"],
  ["AVUQO Catalogue","/catalogue","Products, retailers, services and all 25 departments"],
  ["Who\u0027s Who","/whos-who","Meet makers and eligible retailers across categories"],
  ["How good is the deal?","/reality-check","Check what the evidence really tells us"],
  ["Your Watches","/watches","Keep track of items that matter"],
  ["Saved items","/saved","Pick up where you left off"]]),
 group("deals","Deals & Sales","/sales","Offers deserve evidence, not hype.",1,[
  ["Browse sales","/sales","Explore offers and seasonal collections"],
  ["Black Friday","/black-friday","Look beyond headline discounts"],
  ["Christmas","/christmas","Plan gifts and seasonal spending"],
  ["Product guides","/products","Examine eligible, verified product listings"],
  ["Advertiser offers","/partners","Find official partner shops, coupons and referrals"],
  ["Verified Tools & DIY","/tools","Shop source-verified retailer tools and equipment"]]),
 group("compare","Compare","/compare","Understand the full price before you decide.",2,[
  ["Choose your comparison","/marketplace/compare","Products, grocery baskets, tyres, contracts and travel"],
  ["Compare contracts","/compare","Compare total costs and terms"],
  ["Mobile & SIM plans","/mobile","Find phones and mobile providers without guessing tariff prices"],
  ["Product guides","/products","Compare available eligible offers"],
  ["Broadband","/broadband","Understand the contract, not just the monthly fee"],
  ["Insurance explained","/insurance","Understand cover and exclusions"],
  ["Motoring","/motoring","Explore running costs and buying decisions"],
  ["Shop tyres by size","/tyres/shop","Check current retailer tyre listings with exact dimensions"]]),
 group("groceries","Groceries","/groceries","One list. Clearer supermarket decisions.",3,[
  ["Your grocery basket","/groceries","Build a list and review available prices"],
  ["Shared lists","/lists","Organise shopping with others"],
  ["Saved items","/saved","Return to things you want to compare"]]),
 group("categories","Categories","/categories","Explore buying guides by interest.",4,[
  ["All categories","/categories","See every shopping department"],
  ["Products & retailers","/catalogue","Browse the complete shopping and service index"],
  ["Shopping","/shopping","Explore everyday products"],
  ["Partner shops","/partners","Browse participating retailers and service partners"],
  ["Technology","/tech","Phones, computers and electronics"],
  ["Home & living","/home","Home essentials and furnishings"],
  ["Beauty","/beauty","Skincare, fragrance and care"],
  ["Fashion","/fashion","Clothing and accessories"],
  ["Gifts","/gifts","Ideas for different occasions"],
  ["Toys","/toys","Activities, games and play"],
  ["Pets","/pets","Products for your companions"]]),
 group("travel","Travel","/travel","Explore travel and experiences thoughtfully.",5,[
  ["Travel","/travel","Trips, stays and useful travel guidance"],
  ["Holiday Extras","/partners/holiday-extras","Explore approved airport booking partner links and terms"],
  ["Experiences","/experiences","Days out and memorable plans"],
  ["Motoring","/motoring","The journey and the running costs"],
  ["Services","/services","Practical services for everyday life"],
  ["Travel partners","/partners","Explore airport parking, lounges and hotels"]]),
 group("more","More","/about","Learn how AVUQO works.",6,[
  ["About AVUQO","/about","What AVUQO is here to do"],
  ["How scoring works","/score","How value is assessed"],
  ["Trust & independence","/trust","Why evidence comes before commission"],
  ["Editorial standards","/editorial-policy","How information is reviewed"],
  ["Accessibility","/accessibility","Using AVUQO comfortably"],
  ["Contact","/contact","Talk to AVUQO"],
  ["Affiliate disclosure","/affiliate-disclosure","How AVUQO may earn commission"]])
]};
const safeText=(value:unknown,max:number)=>typeof value==="string"&&value.trim().length>0&&value.length<=max&&!/[\u0000-\u001F]/.test(value);
export const orderedNavigation=(navigation:NavigationContent):NavigationGroup[]=>
 [...navigation.groups].filter(g=>g.enabled).sort((a,b)=>a.order-b.order).map(g=>({
 ...g,links:[...g.links].filter(l=>l.enabled).sort((a,b)=>a.order-b.order)
}));
/** Prevents arbitrary links, open redirects and phantom site destinations. */
export function isValidNavigation(value:unknown):value is NavigationContent {
 if(!value||typeof value!=="object")return false;
 const nav=value as Partial<NavigationContent>;
 if(nav.schemaVersion!==2||!Array.isArray(nav.groups)||nav.groups.length!==DEFAULT_NAVIGATION.groups.length)return false;
 const known=new Map(DEFAULT_NAVIGATION.groups.map(g=>[g.id,g]));
 const seen=new Set<string>();
 let visible=0;
 for(const g of nav.groups){
  if(!g||typeof g!=="object"||typeof g.id!=="string"||seen.has(g.id))return false;
  seen.add(g.id);
  const expected=known.get(g.id);
  if(!expected||expected.href!==g.href||!safeText(g.label,36)||!safeText(g.intro,110)||
    typeof g.enabled!=="boolean"||!Number.isInteger(g.order)||g.order<0||g.order>50||
    !Array.isArray(g.links)||g.links.length!==expected.links.length)return false;
  if(g.enabled)visible++;
  const links=new Map(expected.links.map(l=>[l.href,l]));
  const linkSeen=new Set<string>();
  for(const link of g.links){
   if(!link||typeof link!=="object"||typeof link.href!=="string"||linkSeen.has(link.href)||
      !links.has(link.href)||!safeText(link.label,45)||!safeText(link.description,130)||
      typeof link.enabled!=="boolean"||!Number.isInteger(link.order)||link.order<0||link.order>70)return false;
   linkSeen.add(link.href);
  }
  if(g.enabled&&!g.links.some(l=>l.enabled))return false;
 }
 if(visible<5)return false;
 // Essential customer journeys cannot disappear from primary navigation.
 for(const id of ["discover","deals","compare","groceries","categories"]){
  if(!nav.groups.some(g=>g.id===id&&g.enabled))return false;
 }
 return true;
}
export function parseNavigation(value:unknown):NavigationContent {
 if(isValidNavigation(value))return value;
 // Previously published owner navigation may legitimately predate a newly
 // shipped menu destination. Reconcile only exact known groups + known hrefs,
 // preserving editor-controlled labels/order/toggles; no arbitrary URLs enter.
 if(value&&typeof value==="object"){
  const prior=value as Partial<NavigationContent>;
  if(prior.schemaVersion===2&&Array.isArray(prior.groups)&&
     prior.groups.length===DEFAULT_NAVIGATION.groups.length){
   const byGroup=new Map(prior.groups.map(g=>[g.id,g]));
   if(byGroup.size===DEFAULT_NAVIGATION.groups.length){
    const merged:NavigationContent={schemaVersion:2,groups:DEFAULT_NAVIGATION.groups.map(def=>{
     const saved=byGroup.get(def.id);
     const originals=Array.isArray(saved?.links)?saved.links:[];
     const knownHrefs=new Set(def.links.map(l=>l.href));
     if(!saved||originals.some(l=>!knownHrefs.has(l.href)))return def;
     const byHref=new Map(originals.map(l=>[l.href,l]));
     return {...saved,links:def.links.map(link=>byHref.get(link.href)??link)} as NavigationGroup;
    })};
    if(isValidNavigation(merged))return merged;
   }
  }
 }
 return DEFAULT_NAVIGATION;
}
