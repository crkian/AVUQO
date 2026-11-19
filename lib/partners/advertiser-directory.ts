/** AVUQO public advertiser discovery. The owner-confirmed accepted Awin roster
 * is distinct from live product/price evidence. External destinations below
 * originate in specific advertiser emails or publicly inspected official sites.
 * Undocumented affiliate deep-links and unsupported GBP prices are never made up.
 */
export type PartnerKind="retail"|"mobile"|"broadband"|"travel"|"motoring"|"energy"|"services";
export type PartnerLink={label:string;href:string;kind:"approved_awin"|"official";detail?:string};
export type Partner={
 slug:string;name:string;advertiserId:string|null;kind:PartnerKind;
 accent:string;deep:string;glow:string;symbol:string;
 tagline:string;description:string;whatToCheck:string;
 categoryHref:string;categoryLabel:string;
 links:readonly PartnerLink[];topics:readonly string[];
};
export const HOLIDAY_EXTRAS_AWIN="https://www.awin1.com/cread.php?awinmid=3496&awinaffid=3135746";
export const TOOLED_EINHELL_AWIN="https://www.awin1.com/cread.php?awinmid=496&awinaffid=3135746&ued=https%3A%2F%2Fwww.tooled-up.com%2Fsave-15-percent-on-einhell-products%2Flanding%2F320%2F";
export const TOOLED_BLACK_FRIDAY_AWIN="https://www.awin1.com/cread.php?awinmid=496&awinaffid=3135746&ued=https%3A%2F%2Fwww.tooled-up.com%2Fblack-friday-offers-while-stocks-last%2Flanding%2F336%2F";
const P=(slug:string,name:string,advertiserId:string|null,kind:PartnerKind,accent:string,deep:string,glow:string,symbol:string,tagline:string,description:string,whatToCheck:string,categoryHref:string,categoryLabel:string,topics:string[],links:PartnerLink[]=[]):Partner=>({
 slug,name,advertiserId,kind,accent,deep,glow,symbol,tagline,description,whatToCheck,categoryHref,categoryLabel,topics,links
});
const official=(label:string,href:string,detail?:string):PartnerLink=>({label,href,kind:"official",detail});
const awin=(label:string,href:string,detail?:string):PartnerLink=>({label,href,kind:"approved_awin",detail});

/** All 21 owner-attested programmes, including missing Awin advertiser IDs.
 * Per-programme detail pages do not imply each has a consumer price feed. */
export const PARTNERS:readonly Partner[]=[
 P("tooled-up","Tooled Up","496","retail","#D77728","#3C2516","#FFE2B9","🧰","Make room for the next project.","Tools, DIY equipment and practical products from a specialist retailer. The AVUQO shelf draws only from eligible, currently released Awin offers.","Confirm exact model, specification, stock, accessories and any delivery charges.","/tools","Tools & DIY",["Power tools","Hand tools","DIY essentials","Einhell"],[
  awin("Browse the Tooled Up Black Friday campaign",TOOLED_BLACK_FRIDAY_AWIN,"Awin campaign email, 9 November 2026"),
  awin("Shop the Einhell voucher campaign",TOOLED_EINHELL_AWIN,"Awin campaign email, 16 November 2026"),
  official("Visit Tooled Up","https://www.tooled-up.com/")
 ]),
 P("petlibro","Petlibro UK","77952","retail","#5E9D9C","#153B46","#DCF5ED","🐈","Cleverer ways to care.","Smart feeding, hydration and pet monitoring. Only independently eligible price observations appear as AVUQO product offers.","Compare models, features, power requirements, return terms and the retailer's final checkout price.","/pets","Pets",["Smart feeders","Water fountains","Pet cameras"],[
  official("See Petlibro's Black Friday campaign","https://uk.petlibro.com/pages/black-friday","Advertiser announcement, 19 November 2026")
 ]),
 P("playpress-toys","PlayPress Toys UK","101445","retail","#EF9650","#673331","#FDE4B8","🦕","Build a world of stories.","Creative, press-out toy kits and small gifts. Eligible AVUQO offers use the exact source-approved model and product identity.","Check age suitability, included parts, character rights and the latest delivery information.","/toys","Toys",["Creative play","Gifts","Building kits"],[official("Visit PlayPress Toys","https://www.playpresstoys.com/")]),
 P("cadbury-gifts-direct","Cadbury Gifts Direct","736","retail","#8757AB","#392057","#F6DEFF","🍫","Gifting, with something sweet.","Chocolate gifts, letterbox treats and celebration ideas. AVUQO shows individual prices only when the verified source record qualifies.","Check gift size, personalisation, allergens, seasonal availability and delivery date.","/gifts","Gifts",["Chocolate hampers","Personalised gifts","Seasonal gifting"],[official("Visit Cadbury Gifts Direct","https://www.cadburygiftsdirect.co.uk/")]),
 P("mozillion","Mozillion","31539","mobile","#25A5AD","#133B58","#D5FBFB","📱","Find a phone that fits.","Shop new and pre-owned handsets, with separate journeys for mobile-plan information. Handset prices shown by AVUQO are restricted to approved physical-product offers.","Check exact handset model, storage, grade, warranty, network lock and delivery. Do not compare a contract with a handset-only price.","/mobile","Mobile & phones",["SIM-free phones","Refurbished phones","Mobile plans"],[official("Explore Mozillion phones","https://www.mozillion.com/buy-new-phones")]),
 P("craft-buddy","Craft Buddy Shop","45747","retail","#BF6BA0","#452B67","#FDE1F0","🎨","Make something worth keeping.","Craft kits and creative projects. This advertiser's feed is being checked privately; products appear only after rights, price and exact variant approval.","Verify kit contents, licensed artwork, image permissions, availability and delivery. Private feed items are not live offers.","/gifts","Gifts & crafts",["Crystal Art","Creative kits","Crafts"],[official("Visit Craft Buddy","https://www.craftbuddyshop.com/")]),
 P("tyres-uk","Tyres UK","12715","motoring","#5C7C9C","#1A344C","#E3ECF8","🛞","The right tyres, not just a low number.","A specialist tyre comparison partner with a large private Awin feed. AVUQO does not treat incomplete size or fitting information as a verified price comparison.","Match exact width, profile, rim, load, speed, quantity, delivery, fitting and disposal costs.","/tyres/shop","Tyres",["Tyre dimensions","Fitting costs","Load and speed ratings"]),
 P("tyres-pneus-online","Tyres Pneus Online UK","15236","motoring","#637B9B","#223448","#D7E1F3","🚗","Compare the whole journey.","A second tyre-source programme. Its product snapshot remains private while source currency and fitment evidence are reconciled.","Do not infer GBP from UK membership; check exact size, load, speed, stock, delivery and fitting.","/tyres/shop","Tyres",["Tyres","Fitting","Dimensions"]),
 P("holiday-extras","Holiday Extras","3496","travel","#DC9852","#25475B","#FBE7C9","✈️","A smoother journey begins here.","Explore airport parking, hotels, lounges, transfers and car hire through the advertiser's own booking service. AVUQO has an explicitly supplied publisher-specific Awin link.","Booking dates, airport, availability, product exclusions, cancellation rights and total checkout price change the real cost.","/travel","Travel",["Airport parking","Airport hotels","Airport lounges","Transfers","Car hire"],[
  awin("Search Holiday Extras with the AVUQO link",HOLIDAY_EXTRAS_AWIN,"Account manager's direct tracking link, 3 November 2026"),
  official("Airport parking","https://www.holidayextras.com/airport-parking.html"),
  official("Airport hotels","https://www.holidayextras.com/airport-hotels.html"),
  official("Airport lounges","https://www.holidayextras.com/airport-lounges.html"),
  official("Airport transfers","https://www.holidayextras.com/airport-transfers.html"),
  official("Car hire","https://www.holidayextras.com/car-hire.html")
 ]),
 P("compare-parking-prices","Compare Parking Prices UK","118401","travel","#6AA493","#183F47","#E1F5E8","🅿️","Park smarter before you fly.","Use a specialist airport-parking booking service to search by airport, dates and parking style. A feed observation is not a verified AVUQO booking quote.","Check car park location, transfers, drop-off times, fees and refund conditions.","/travel","Travel",["Airport parking","Meet & greet","Park & ride"],[official("Open Compare Parking Prices","https://www.compareparkingprices.co.uk/")]),
 P("simply-mot","Simply MOT (UK)",null,"motoring","#5F9E7E","#204235","#DDF0DE","🔧","Get your MOT sorted.","An online MOT booking partner serving a growing network of garages. AVUQO has the programme welcome email but no live garage-price data integration.","Check your registration, nearby garages, appointment slot, MOT class and total charge.","/motoring","Motoring",["MOT booking","Garages","Vehicle checks"],[official("Search MOT availability at Simply MOT","https://simplymot.co.uk","Advertiser-supplied site; direct HTTP inspection was inconclusive")]),
 P("broadband-genie","Broadband Genie",null,"broadband","#9368BA","#2E2855","#EDE1FA","🌐","Find internet that feels right.","An Awin welcome offered AVUQO a bespoke white-label comparison page. Until configured, broadband prices must be checked with the comparison provider.","Check availability by postcode, total contract cost, annual rises, setup fees, speed and cashback.","/broadband","Broadband",["Broadband deals","Fibre","Contract comparison"],[official("Explore broadband comparisons","https://www.broadband.co.uk/")]),
 P("broadband-mobile-coop","BroadbandCoop & MobileCoop",null,"broadband","#4D9478","#21483A","#DEF2D9","🌿","Connection with a co-operative focus.","Member-owned mobile and broadband services, with current contract details on the provider site. AVUQO has an affiliate welcome but no live tariff-price feed.","Compare minimum-term fees, coverage, data allowances, annual increases and eligibility.","/mobile","Mobile & broadband",["MobileCoop","BroadbandCoop","Switching"],[
 official("Explore MobileCoop","https://broadband.yourcoop.coop/mobile/"),
 official("Explore BroadbandCoop","https://broadband.yourcoop.coop/broadband/")
 ]),
 P("your-coop-energy","Your Co-op Energy",null,"energy","#8EAE65","#224336","#ECF4D6","⚡","Choose energy with clarity.","Awin advertiser welcome and approved campaign assets exist. Tariff quotes still depend on address, consumption, meter and eligibility.","Compare standing charge, unit rates, tariff length, exit fees and the actual annual estimate.","/services","Services",["Energy","Tariffs","Switching"],[official("Explore EnergyCoop","https://energy.yourcoop.coop/")]),
 P("onestream","Onestream","23296","broadband","#569BBF","#173F5A","#DCF0FF","🛜","Broadband, minus the guesswork.","Awin programme welcome confirms a partnership. Service pricing requires postcode eligibility and contract-term evidence.","Check speed estimates, contract duration, setup, router, in-term rises and customer support.","/broadband","Broadband",["Fibre broadband","Availability","Contracts"],[official("Visit Onestream","https://onestream.co.uk/")]),
 P("lyca-mobile","Lyca Mobile UK","128157","mobile","#5189CA","#16385D","#E1EDFF","📲","Find a plan for how you use your phone.","SIM and mobile deals from a participating Awin advertiser. Its observed feed is a contract/service feed, not a confirmed handset catalogue.","Compare UK data, roaming, monthly cost, introductory period, renewal and network coverage.","/mobile","Mobile",["SIM only","Roaming","Mobile data"],[official("Explore Lyca Mobile UK","https://www.lycamobile.co.uk/en/")]),
 P("one-p-mobile","1pMobile","37738","mobile","#6B99B2","#153747","#DDF3F7","📶","Pay for the mobile life you lead.","Pay-as-you-go and SIM offers. Awin feed discovery confirms entries but no AVUQO live tariffs are published.","Check call/data allowance, credit expiry, top-up requirements, roaming and coverage.","/mobile","Mobile",["PAYG","SIM only","Data"],[official("Explore 1pMobile","https://www.1pmobile.com/")]),
 P("chattr-sim-only","Chattr Sim Only","115559","mobile","#6969B1","#25274E","#E8E5FA","💬","Plans should be easy to understand.","A participating mobile-service programme without an observed current product feed. AVUQO is not yet quoting live Chattr prices.","Check monthly price, minimum term, data allowance, network and increases.","/mobile","Mobile",["SIM only","Contracts"]),
 P("autoaid-breakdown","AutoAid Breakdown","36276","motoring","#D47660","#432C36","#F7E1D8","🆘","Know what your cover actually covers.","A breakdown-cover programme. Live eligibility and policy inclusions require the insurer's own quotation and terms.","Check personal or vehicle cover, home start, recovery, excess, exclusions and renewal.","/motoring","Motoring",["Breakdown cover","Recovery","Policy terms"]),
 P("epc-gas-electrical","EPCs, Gas Safety Certificates and Electrical Check","25022","services","#BC8A56","#473C35","#F8EBD8","🏠","The right checks for your property.","A specialist property-certificate and inspection service with one discovered Awin entry, not a fixed product-price feed.","Confirm postcode, property type, service qualification, turnaround, access and total quote.","/services","Property services",["EPC","Gas safety","Electrical checks"]),
 P("christmas-letters-from-santa","Christmas Letters from Santa","35299","retail","#B76B7C","#482D43","#FFE7E6","✉️","A little festive anticipation.","A seasonal personalised-letter advertiser. No current live product feed or approved AVUQO offer is recorded.","Check personalisation, order deadline, postage, age suitability and availability.","/christmas","Christmas",["Letters","Festive gifts","Personalisation"])
];
export const PARTNER_BY_SLUG=new Map(PARTNERS.map(p=>[p.slug,p]));
export const partnerFor=(slug:string)=>PARTNER_BY_SLUG.get(slug);
export const partnerHref=(partner:Partner)=>"/partners/"+partner.slug;
export type PartnerPromotion={id:string;slug:string;title:string;detail:string;cta:string;href:string;code?:string;startsAt?:string;endsAt?:string;source:string;featured?:boolean};
/** These are merchant announcements, not independently observed AVUQO price drops. */
export const PARTNER_PROMOTIONS:readonly PartnerPromotion[]=[
 {id:"holiday-extras-2026-offer",slug:"holiday-extras",title:"Holiday Extras: eligible booking discounts",detail:"The advertiser's welcome pack advertises up to 25% off a named Gatwick car park, with 10% offers on some other products. Airports, availability and exclusions apply. The embedded affiliate-link discount appears when you search with Holiday Extras; no AVUQO booking prices are quoted.",cta:"Search Holiday Extras",href:HOLIDAY_EXTRAS_AWIN,source:"Holiday Extras welcome pack and discount document, November 2026",featured:true},
 {id:"tooled-up-einhell-2026",slug:"tooled-up",title:"Tooled Up: 15% off qualifying Einhell orders",detail:"Spend £50 or more on Einhell products in one transaction, then enter EIN15PCDD at checkout. One code per order; subject to availability and retailer terms.",cta:"See Einhell offer",href:TOOLED_EINHELL_AWIN,code:"EIN15PCDD",startsAt:"2026-11-16T09:30:00Z",endsAt:"2026-12-31T00:00:00Z",source:"Tooled Up Awin promotional email, 16 November 2026",featured:true},
 {id:"tooled-up-black-friday-2026",slug:"tooled-up",title:"Tooled Up: Black Friday weekly drops",detail:"Retailer campaign runs to 6 December with weekly stock-limited offers. CLAIMFIFTY gives £50 off orders £500+, or CLAIMSEVFY gives £75 off £750+. One voucher per order, not both.",cta:"Explore the retailer campaign",href:TOOLED_BLACK_FRIDAY_AWIN,startsAt:"2026-11-09T09:30:00Z",endsAt:"2026-12-07T00:00:00Z",source:"Tooled Up Awin promotional email, 9 November 2026"},
 {id:"playpress-christmas-2026",slug:"playpress-toys",title:"PlayPress: 10% off orders over £30",detail:"Use PLAY10 at checkout until 31 December 2026. Not valid with another discount code. The outbound store homepage is a direct retailer link; eligible product offer links are separately tracked.",cta:"Explore PlayPress",href:"https://www.playpresstoys.com/",code:"PLAY10",endsAt:"2027-01-01T00:00:00Z",source:"PlayPress Awin promotion, 12 November 2026",featured:true}
];
export function activePartnerPromotions(at:Date,slug?:string):PartnerPromotion[]{
 const now=at.valueOf();
 return PARTNER_PROMOTIONS.filter(p=>(!slug||p.slug===slug)&&
  (!p.startsAt||now>=Date.parse(p.startsAt))&&(!p.endsAt||now<Date.parse(p.endsAt)));
}
/** Only supplied own-publisher Awin links, never automatically create a tracking URL for a programme. */
export function isApprovedPartnerLink(link:PartnerLink):boolean{
 if(link.kind==="official")return /^https:\/\//.test(link.href);
 try{
  const u=new URL(link.href);
  return u.protocol==="https:"&&u.hostname==="www.awin1.com"&&u.pathname==="/cread.php"&&
   u.searchParams.get("awinaffid")==="3135746"&&
   ["3496","496"].includes(u.searchParams.get("awinmid")??"");
 }catch{return false;}
}
