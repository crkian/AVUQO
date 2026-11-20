/** AVUQO-authored retailer-specific editorial modules, NOT merchant-supplied
 * brand guidelines or an implied endorsement. Keep published product evidence,
 * imagery and permissions entirely separate from this static page identity.
 */
export type StudioChapter={title:string;detail:string;terms:readonly string[]};
export type StudioEditorial={
 edition:string;stamp:string;heroWord:string;lead:string;storyTitle:string;story:string;
 scene:"workbench"|"companion"|"storybook"|"confectionery"|"handsets"|"atelier"|
 "garage"|"roadbook"|"departures"|"parking"|"mot"|"connection"|"cooperative"|
 "energy"|"fibre"|"mobile"|"everyday"|"conversation"|"rescue"|"property"|"festive";
 chapterHeading:string;chapters:readonly [StudioChapter,StudioChapter,StudioChapter];
};
const C=(title:string,detail:string,terms:string[]=[]):StudioChapter=>({title,detail,terms});
const E=(edition:string,stamp:string,heroWord:string,lead:string,storyTitle:string,story:string,
 scene:StudioEditorial["scene"],chapterHeading:string,chapters:StudioEditorial["chapters"]):StudioEditorial=>
 ({edition,stamp,heroWord,lead,storyTitle,story,scene,chapterHeading,chapters});

/** One distinctive AVUQO editorial window per accepted advertiser.
 * Claims and questions stay deliberately qualitative, with no invented
 * product prices, live stock, certifications or official brand assets.
 */
export const PARTNER_STUDIOS:Readonly<Record<string,StudioEditorial>>={
 "tooled-up":E("The project desk","EDITION 01 / TOOLS","MAKE","A working space for the jobs waiting on your list.",
  "The right tool starts with the job.",
  "Sort by the work you need to do, then check the exact model and what comes in the box. AVUQO keeps retailer item prices separate from delivery and any extras.",
  "workbench","Find your next project companion",[
   C("Power & precision","Consider battery platform, cutting capacity and supplied accessories before comparing models.",["drill","saw","driver","grinder","makita","dewalt","bosch"]),
   C("Hand tools & the essentials","Compare size, material and task fit. The smallest specification detail can decide a useful purchase.",["pliers","spanner","socket","screwdriver","hammer","hand tool"]),
   C("Workshop & outdoors","Look at power source, storage, working range and delivery for larger equipment.",["mower","garden","workshop","pressure","compressor","einhell"])
  ]),
 "petlibro":E("The companion edit","EDITION 02 / PET CARE","CARE","Little routines. Better-considered pet essentials.",
  "Find the everyday fit for your pet.",
  "A smart pet product needs to suit the animal and the household, not just the feature list. Check cleaning, capacity and how a device behaves when power or connectivity drops.",
  "companion","Explore thoughtful pet-care choices",[
   C("Feed-time routines","Capacity, portion controls and dependable operation are more useful than an unverified feature claim.",["feeder","feeding","food","granary"]),
   C("Fresh water","Consider filter replacements, cleaning and the space a fountain occupies.",["fountain","water","filter","dockstream"]),
   C("Keeping in touch","Check app requirements, camera capability and the availability of a suitable power connection.",["camera","monitor","wifi","smart"])
  ]),
 "playpress-toys":E("The story workshop","EDITION 03 / PLAY","IMAGINE","A shelf for making, building and telling stories.",
  "Play starts before the first piece clicks.",
  "Look for what the kit includes, the recommended age and the space needed to create. AVUQO shows source-verified products only where individual offers qualify.",
  "storybook","Choose the kind of play",[
   C("Build a little world","Check kit contents and whether the set is a standalone adventure or part of a larger story.",["play","build","dinosaur","castle","set"]),
   C("Characters & adventures","Compare themes and piece counts from the actual product information, not assumed accessories.",["character","space","animal","pirate","adventure"]),
   C("Gifts for makers","Think about age guidance, complexity, storage and delivery timing.",["gift","kit","craft","model"])
  ]),
 "cadbury-gifts-direct":E("The gifting counter","EDITION 04 / GIFTS","GIVE","A little thought makes a gift feel bigger.",
  "More than the wrapping.",
  "Explore chocolate gift formats, then check allergens, portion size, packaging, personalisation and the delivery date. A promotional message is not proof of a price saving.",
  "confectionery","Find the occasion, then the gift",[
   C("A sweet thank-you","Look at gift format, weight and whether a message or personalisation is included.",["gift","box","thank","letterbox"]),
   C("Something to share","Check the actual contents, pack size and allergens rather than judging by the photograph.",["hamper","selection","bundle","sharing"]),
   C("Make the occasion","Delivery windows and seasonal availability matter when the date matters.",["birthday","celebration","christmas","easter"])
  ]),
 "mozillion":E("The handset gallery","EDITION 05 / TECH","CONNECT","Explore phones without losing sight of the details.",
  "A handset is a set of choices.",
  "Model, storage, condition, battery and warranty can alter value. Keep the price of a SIM-free handset separate from any monthly network contract.",
  "handsets","Look beyond the screen",[
   C("Flagship considerations","Check model identity, memory, storage and the exact listing condition.",["iphone","samsung","pixel","pro","ultra"]),
   C("Everyday smartphones","Think about battery, camera needs and the support you want after purchase.",["phone","smartphone","mobile","galaxy"]),
   C("Pre-owned & graded","Read condition definitions, accessories included, warranty and returns before ordering.",["refurbished","renewed","used","grade","pre-owned"])
  ]),
 "craft-buddy":E("The maker's table","EDITION 06 / CRAFT","CREATE","Small pieces, big possibilities.",
  "Choose a project you'll enjoy finishing.",
  "Creative kits need clear contents, materials and artwork permissions. The product shelf stays quiet until independent source, image and offer approval is complete.",
  "atelier","Browse creative directions",[
   C("Crystal Art projects","Check artwork size, included tools and whether extra supplies are required.",["crystal","diamond","art"]),
   C("Make & display","Think about where a finished project will sit and the time you want to spend making it.",["craft","kit","design","canvas"]),
   C("Projects to gift","Consider age suitability, contents and delivery rather than assumed completion times.",["gift","card","set","accessory"])
  ]),
 "tyres-uk":E("The fitment garage","EDITION 07 / MOTORING","GRIP","The right fit matters more than a headline number.",
  "Start with the sidewall, not the price.",
  "Tyre width, profile, rim, load and speed must agree with the vehicle requirement. Fitting, balancing and disposal can change the actual cost.",
  "garage","Make the specification your first stop",[
   C("Size & variant","Read the full tyre marking. A shared brand or barcode alone is not a fitment guarantee.",["205/55","225/45","tyre"]),
   C("Season & conditions","Check whether the exact specification suits the intended driving conditions.",["winter","summer","all season"]),
   C("The fitted total","Confirm fitting location, quantity, fees and any mandatory extras before comparing totals.",["fitting","installation","delivery"])
  ]),
 "tyres-pneus-online":E("The tyre roadbook","EDITION 08 / MOTORING","MATCH","An independent second view on exact tyre identity.",
  "Compare only what genuinely matches.",
  "This programme has privately staged tyre data, but public two-shop pricing needs explicit GBP, exact fitment and full cost evidence from both suppliers.",
  "roadbook","Read the roadbook before a price",[
   C("Exact dimensions","Verify width, profile, rim diameter and the full tyre variant.",["width","profile","rim"]),
   C("Load & speed","The load index and speed rating are part of the product, not optional extras.",["load","speed","rating"]),
   C("Availability & fitting","Ask for current stock, delivery and installation costs before judging value.",["stock","fitting","tyre"])
  ]),
 "holiday-extras":E("The departure lounge","EDITION 09 / TRAVEL","GO","Make the moments before a trip feel simpler.",
  "Plan around the actual journey.",
  "Travel extras depend on airport, dates, vehicle and booking details. Retailer promotions can be explored here, but live booking totals must come from the provider.",
  "departures","What to check before departure",[
   C("Airport parking","Compare entry and exit times, transfers and the conditions of the specific car park."),
   C("Hotel & parking combinations","Check check-in dates, transfer arrangements and cancellation conditions."),
   C("Booking flexibility","Look at the final total, refunds and changes before confirming a reservation.")
  ]),
 "compare-parking-prices":E("The parking planner","EDITION 10 / TRAVEL","PARK","Choose parking that fits your actual trip.",
  "The cheapest sign is not the whole journey.",
  "The airport, terminal, time and transfer arrangement all matter. Compare booking-specific quotes, not a static price that ignores travel details.",
  "parking","Plan the final mile",[
   C("Where you leave the car","Check terminal access, meet-and-greet arrangements or shuttle transfers."),
   C("When you arrive","Use the real entry and exit dates, including any late return charges."),
   C("What it really costs","Confirm fees, cancellation, security conditions and the booking provider.")
  ]),
 "simply-mot":E("The MOT desk","EDITION 11 / MOTORING","CHECK","Make an essential vehicle check easier to navigate.",
  "Book the right check, at the right garage.",
  "An MOT service depends on location, vehicle and appointment availability. Provider booking evidence is required before AVUQO can quote a current slot price.",
  "mot","Before choosing a garage",[
   C("The vehicle","Confirm the right test class, registration details and due date."),
   C("The appointment","Compare location, timing and any retest conditions."),
   C("The final charge","Check the actual booking total and which services are optional.")
  ]),
 "broadband-genie":E("The connection notebook","EDITION 12 / CONNECTIVITY","SPEED","Better broadband decisions start with better questions.",
  "Speed is only part of the package.",
  "Availability depends on postcode and network. Compare the complete contract, annual increases, setup fees and support, using the provider's current quote.",
  "connection","Make sense of a broadband quote",[
   C("Real availability","Test the address, not a national headline speed."),
   C("The full term","Check setup, minimum term, in-contract rises and router charges."),
   C("The switching journey","Find out what happens to your existing service and any downtime.")
  ]),
 "broadband-mobile-coop":E("The co-operative connection","EDITION 13 / CONNECTIVITY","TOGETHER","Discover another way to stay connected.",
  "Choose the service that fits your home.",
  "Mobile and broadband are separate contracts with different coverage and billing. Compare each on its actual terms rather than combining unverified rates.",
  "cooperative","Your connection checklist",[
   C("Mobile essentials","Check data, roaming, coverage, term and monthly charges."),
   C("Home connection","Use postcode-specific availability and estimated speed."),
   C("Cost over time","Review increases, setup fees and any eligibility requirements.")
  ]),
 "your-coop-energy":E("The home energy notebook","EDITION 14 / ENERGY","POWER","A clearer way to think about your energy contract.",
  "The annual estimate needs your numbers.",
  "Energy quotes depend on consumption, meter, tariff and area. An AVUQO supplier page cannot turn an estimated rate into a guaranteed bill.",
  "energy","Understand the parts of a quote",[
   C("The tariff","Check unit rates, standing charges and whether terms are fixed."),
   C("Your usage","Use a realistic annual consumption estimate for your own household."),
   C("Changing provider","Review exit fees, tariff dates and the switching process.")
  ]),
 "onestream":E("The fibre field guide","EDITION 15 / BROADBAND","STREAM","Find a broadband plan without the small-print fog.",
  "Look for the contract behind the headline.",
  "Postcode serviceability, router arrangements and pricing changes influence the full cost. No current contract quotation is fabricated here.",
  "fibre","What a plan needs to tell you",[
   C("Connection at your address","Check actual network availability and realistic speed estimates."),
   C("Equipment & setup","Look for installation, router and activation terms."),
   C("Over the contract","Compare the full term, price rises and cancellation provisions.")
  ]),
 "lyca-mobile":E("The SIM selection","EDITION 16 / MOBILE","ROAM","A mobile plan should keep up with how you live.",
  "Begin with the way you use data.",
  "SIM plans can differ in allowance, renewal, roaming and contract terms. Published service-feed rows are not handset inventory or live AVUQO plan prices.",
  "mobile","Work through your plan choices",[
   C("Your data habits","Estimate regular use rather than relying on an introductory allowance."),
   C("Home and abroad","Check network coverage and eligible roaming destinations."),
   C("Renewal & extras","Read the renewal price, fair-use policy and activation conditions.")
  ]),
 "one-p-mobile":E("The everyday mobile edit","EDITION 17 / MOBILE","SIMPLE","Only pay attention to what you really use.",
  "Small print still matters on simple plans.",
  "Pay-as-you-go and SIM options have different top-up, expiry and renewal rules. Compare live terms at the provider rather than inventing a monthly rate.",
  "everyday","Make each allowance count",[
   C("Data & calls","Check data allowances, minutes and message terms."),
   C("Top-up rules","Review minimum top-up, expiry and credit treatment."),
   C("Coverage & roaming","Confirm the network and travel terms for your usual places.")
  ]),
 "chattr-sim-only":E("The clear-talk guide","EDITION 18 / MOBILE","TALK","The plan is only good if its terms make sense.",
  "Keep the conversation simple.",
  "AVUQO records this accepted programme without a current product-price feed. Use the provider's actual offer for data, contract and network details.",
  "conversation","The questions worth asking",[
   C("How much data?","Find the allowance that suits your regular use."),
   C("For how long?","Read any minimum term, renewal or promotional period."),
   C("Which network?","Check coverage, roaming and what happens if you switch.")
  ]),
 "autoaid-breakdown":E("The roadside essentials","EDITION 19 / MOTORING","READY","Confidence starts before a breakdown happens.",
  "Coverage is a contract, not a headline.",
  "Breakdown policies can vary in who is covered, where help begins and what recovery includes. Read the policy document and obtain a current quotation.",
  "rescue","Know what the cover actually means",[
   C("Personal or vehicle","Check who is insured and which vehicles are included."),
   C("Recovery situations","Read home start, roadside, onward travel and exclusions."),
   C("The ongoing cost","Check excesses, renewal terms, waiting periods and full price.")
  ]),
 "epc-gas-electrical":E("The property checklist","EDITION 20 / PROPERTY","HOME","Useful checks for safer, better-informed property decisions.",
  "Match the certificate to the property.",
  "Inspection services depend on address, property type and the exact work required. This is a provider discovery page, not a fixed quote catalogue.",
  "property","Choose the right inspection",[
   C("Energy performance","Confirm EPC requirements and the property's details."),
   C("Gas safety","Ask what appliances, qualifications and access are covered."),
   C("Electrical checks","Check report type, appointment needs and any follow-up work.")
  ]),
 "christmas-letters-from-santa":E("The festive writing desk","EDITION 21 / SEASONAL","WONDER","A little anticipation, delivered by post.",
  "The details make personalisation special.",
  "Seasonal gifts need careful spelling, ordering and postage dates. No current price or delivery promise is displayed without a verified product offer.",
  "festive","Plan a little festive surprise",[
   C("The letter","Review personalisation options and the wording before checkout."),
   C("The recipient","Check suitability, names and any requested details."),
   C("Delivery dates","Leave time for production, postage and holiday cut-off windows.")
  ])
};
export const partnerStudio=(slug:string):StudioEditorial|undefined=>PARTNER_STUDIOS[slug];
/** Match only verified product titles; no inference that a retailer carries a collection. */
export function matchStudioChapters(title:string,chapters:readonly StudioChapter[]):number[]{
 const normalized=title.toLocaleLowerCase("en-GB");
 return chapters.flatMap((chapter,i)=>chapter.terms.some(term=>normalized.includes(term.toLocaleLowerCase("en-GB")))?[i]:[]);
}
