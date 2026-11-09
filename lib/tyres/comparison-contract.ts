/** Future tyre comparison admission. Pure functions: no database writes or public release. */
export type TyreSeason="summer"|"winter"|"all-season";
export type TyreVariant={
 brand:string|null;model:string|null;widthMm:number|null;aspectRatio:number|null;
 rimInches:number|null;loadIndex:string|null;speedRating:string|null;
 season:TyreSeason|null;xl:boolean|null;runFlat:boolean|null;oeMarking:string|null;
 gtin?:string|null;manufacturerPartNumber?:string|null;
};
export type VariantMatch="exact"|"conflict"|"insufficient_evidence";
const normalized=(v:string)=>v.trim().replace(/\s+/g," ").toUpperCase();
const meaningful=(v:string|null)=>typeof v==="string"&&v.trim().length>0;
const validLoad=(v:string)=>/^\d{2,3}(?:\/\d{2,3})?$/.test(v);
const validSpeed=(v:string)=>/^[A-Z]$/.test(v);

/** Empty OE marking ("") means explicitly none. Null means not known. */
export function compareTyreVariants(a:TyreVariant,b:TyreVariant):VariantMatch{
 const fields=(["brand","model","widthMm","aspectRatio","rimInches",
  "loadIndex","speedRating","season","xl","runFlat","oeMarking"] as const);
 let incomplete=false;
 for(const field of fields){
  const left=a[field],right=b[field];
  if(left===null||right===null){incomplete=true;continue;}
  if(typeof left==="string"&&typeof right==="string"){
   if(normalized(left)!==normalized(right))return "conflict";
  }else if(left!==right)return "conflict";
 }
 if(!meaningful(a.brand)||!meaningful(b.brand)||!meaningful(a.model)||!meaningful(b.model)||
  !meaningful(a.loadIndex)||!meaningful(b.loadIndex)||
  !meaningful(a.speedRating)||!meaningful(b.speedRating))return "insufficient_evidence";
 if(!validLoad(a.loadIndex!)||!validLoad(b.loadIndex!)||
  !validSpeed(a.speedRating!)||!validSpeed(b.speedRating!))return "insufficient_evidence";
 if(!Number.isInteger(Number(a.widthMm))||!Number.isInteger(Number(a.aspectRatio))||!Number.isInteger(Number(a.rimInches))||
    !Number.isInteger(Number(b.widthMm))||!Number.isInteger(Number(b.aspectRatio))||!Number.isInteger(Number(b.rimInches))||
    Number(a.widthMm)<125||Number(a.widthMm)>385||
    Number(a.aspectRatio)<20||Number(a.aspectRatio)>95||
    Number(a.rimInches)<10||Number(a.rimInches)>26)return "insufficient_evidence";
 if(incomplete)return "insufficient_evidence";
 // Unique codes can reinforce matching but must never override conflicting specs.
 if(a.gtin&&b.gtin&&normalized(a.gtin)!==normalized(b.gtin))return "conflict";
 if(a.manufacturerPartNumber&&b.manufacturerPartNumber&&
  normalized(a.manufacturerPartNumber)!==normalized(b.manufacturerPartNumber))return "conflict";
 return "exact";
}

export type Fulfilment="delivered"|"centre_fitted"|"mobile_fitted";
export type FeeKey="delivery"|"fitting_per_tyre"|"balancing_per_tyre"|
 "valve_per_tyre"|"disposal_per_tyre"|"mobile_visit"|"other";
export type TyrePriceQuote={
 offerId:string;canonicalVariantId:string;sourcePlatform:string;
 underlyingSellerId:string|null;sourceKind:"direct"|"marketplace";
 quantity:number;fulfilment:Fulfilment;locationKey:string|null;
 currency:"GBP";unitPricePence:number;vatIncluded:boolean|null;
 fees:Record<FeeKey,number|null>;includedInUnitPrice:FeeKey[];
 eligibleDiscountPence:number|null;sourceVerified:boolean;
};
export type ComparableQuote={status:"complete";totalPence:number;scope:string}|
 {status:"incomplete";reason:string};

const validMoney=(v:number)=>Number.isSafeInteger(v)&&v>=0;
const feesForMode:Record<Fulfilment,FeeKey[]>={
 delivered:["delivery","other"],
 centre_fitted:["delivery","fitting_per_tyre","balancing_per_tyre","valve_per_tyre","disposal_per_tyre","other"],
 mobile_fitted:["delivery","fitting_per_tyre","balancing_per_tyre","valve_per_tyre","disposal_per_tyre","mobile_visit","other"]
};
const perTyre=new Set<FeeKey>(["fitting_per_tyre","balancing_per_tyre","valve_per_tyre","disposal_per_tyre"]);

/** Unknown mandatory fees never become zero. An explicit 0 or documented
 * includedInUnitPrice flag is required for every relevant charge. */
export function comparableTotal(quote:TyrePriceQuote):ComparableQuote{
 if(!quote.sourceVerified)return {status:"incomplete",reason:"source_not_verified"};
 if(!Number.isInteger(quote.quantity)||quote.quantity<1||quote.quantity>12)
  return {status:"incomplete",reason:"invalid_quantity"};
 if(!validMoney(quote.unitPricePence)||quote.vatIncluded!==true)
  return {status:"incomplete",reason:"price_or_vat_unconfirmed"};
 if(quote.fulfilment!=="delivered"&&
    (!quote.locationKey||quote.locationKey.trim().length<2))
  return {status:"incomplete",reason:"fitting_location_unknown"};
 const included=new Set<FeeKey>(quote.includedInUnitPrice);
 const required=feesForMode[quote.fulfilment];
 let total=quote.unitPricePence*quote.quantity;
 for(const key of required){
  const charge=quote.fees[key];
  if(included.has(key)){
   if(charge!==null&&charge!==0)return {status:"incomplete",reason:"fee_inclusion_conflict"};
   continue;
  }
  if(charge===null||!validMoney(charge))
   return {status:"incomplete",reason:"mandatory_fee_unknown:"+key};
  total+=charge*(perTyre.has(key)?quote.quantity:1);
 }
 if(quote.eligibleDiscountPence===null||!validMoney(quote.eligibleDiscountPence)||
  quote.eligibleDiscountPence>total)
  return {status:"incomplete",reason:"discount_not_confirmed"};
 total-=quote.eligibleDiscountPence;
 if(!Number.isSafeInteger(total))return {status:"incomplete",reason:"total_out_of_range"};
 return {status:"complete",totalPence:total,
  scope:[quote.canonicalVariantId,quote.quantity,quote.fulfilment,
   quote.fulfilment==="delivered"?"no_location":quote.locationKey].join("|")};
}

/** These quotes may be sorted against each other only if their full scope matches. */
export function rankComparableQuotes(quotes:readonly TyrePriceQuote[]){
 const priced=quotes.filter(q=>Boolean(q.underlyingSellerId?.trim()))
  .map(q=>({offer:q,result:comparableTotal(q)}))
  .filter((e):e is {offer:TyrePriceQuote;result:Extract<ComparableQuote,{status:"complete"}>}=>e.result.status==="complete");
 if(priced.length===0)return [];
 const scope=priced[0].result.scope;
 // Mixed scopes cannot share a "cheapest" ranking.
 if(priced.some(e=>e.result.scope!==scope))return [];
 const sellers=new Map<string,(typeof priced)[number]>();
 for(const entry of priced){
  const id=normalized(entry.offer.underlyingSellerId!);
  const previous=sellers.get(id);
  if(!previous||entry.offer.sourceKind==="direct"&&previous.offer.sourceKind==="marketplace"||
   entry.offer.sourceKind===previous.offer.sourceKind&&
    entry.result.totalPence<previous.result.totalPence)sellers.set(id,entry);
 }
 return [...sellers.values()].sort((a,b)=>a.result.totalPence-b.result.totalPence);
}

/** Unattributed marketplace platforms are not independent known sellers. */
export function independentSellerCount(quotes:readonly Pick<TyrePriceQuote,"sourceKind"|"underlyingSellerId">[]){
 return new Set(quotes.flatMap(q=>
  q.underlyingSellerId&&q.underlyingSellerId.trim()?[normalized(q.underlyingSellerId)]:[]
 )).size;
}
