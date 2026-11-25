/** Quote preparation only; no customer data collection or invented live rates. */
export type QuoteJourney={title:string;fields:readonly string[];costs:readonly string[];route:string};
const travel={title:"Prepare your booking",fields:["Airport or destination","Arrival and departure dates and times","Passengers or vehicle details"],costs:["Booking total","Transfers and mandatory fees","Cancellation and amendment terms"],route:"/travel"};
const mobile={title:"Prepare your SIM comparison",fields:["Monthly data requirement","Coverage and roaming needs","Contract length"],costs:["Introductory and renewal charges","Activation and out-of-bundle fees","Minimum term and exit charges"],route:"/mobile"};
const broadband={title:"Prepare your broadband comparison",fields:["Installation postcode","Required download speed","Minimum contract length"],costs:["Setup and equipment charges","Monthly charges and scheduled rises","Exit and switching costs"],route:"/broadband"};
const tyre={title:"Prepare your exact tyre search",fields:["Width, profile and rim","Load index and speed rating","Quantity and fitting requirements"],costs:["Unit price and delivery","Fitting, balancing and valves","Disposal and mandatory extras"],route:"/tyres/shop"};
const journeys:Record<string,QuoteJourney>={
 "holiday-extras":travel,"compare-parking-prices":travel,
 "lyca-mobile":mobile,"one-p-mobile":mobile,"chattr-sim-only":mobile,"mozillion":mobile,
 "onestream":broadband,"broadband-genie":broadband,"broadband-mobile-coop":broadband,
 "tyres-uk":tyre,"tyres-pneus-online":tyre,
 "simply-mot":{title:"Prepare your MOT booking",fields:["Vehicle registration and test class","Location and appointment date"],costs:["Test and retest price","Optional repairs or services"],route:"/motoring"},
 "autoaid-breakdown":{title:"Prepare your breakdown cover quote",fields:["Vehicle or personal cover","Home start and recovery requirements"],costs:["Policy total","Excess, exclusions and renewal"],route:"/motoring"},
 "your-coop-energy":{title:"Prepare your energy quote",fields:["Meter type and annual usage","Current tariff and address"],costs:["Unit rate and standing charge","Exit fees and annual estimate"],route:"/services"},
 "epc-gas-electrical":{title:"Prepare your property inspection quote",fields:["Property type and location","Required certificate and access"],costs:["Inspection and certificate charge","Revisit and mandatory fees"],route:"/services"}
};
export function quoteJourney(slug:string):QuoteJourney|null{return Object.hasOwn(journeys,slug)?journeys[slug]:null;}
