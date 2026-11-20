/** Comparison labels are evidence-derived, not marketing claims.
 * A source-approved item price is not a fully delivered or fitted market price,
 * and two offers from the SAME shop are never presented as two retailers. */
export type ComparableOffer={published:{merchant:string};offer:{price:number;total_price:number|null}};
export type ComparisonBasis="item_price_only"|"verified_total";
export function compareEligibleOffers<T extends ComparableOffer>(offers:readonly T[]):{
 ordered:T[];sellers:number;basis:ComparisonBasis;heading:string;detail:string
}{
 const valid=offers.filter(x=>Number.isFinite(Number(x.offer.price))&&Number(x.offer.price)>0&&
  typeof x.published.merchant==="string"&&x.published.merchant.trim().length>0);
 const fullyPriced=valid.length>0&&valid.every(x=>x.offer.total_price!==null&&
  Number.isFinite(Number(x.offer.total_price))&&Number(x.offer.total_price)>=Number(x.offer.price));
 const basis:ComparisonBasis=fullyPriced?"verified_total":"item_price_only";
 const ordered=[...valid].sort((a,b)=>{
  const left=basis==="verified_total"?Number(a.offer.total_price):Number(a.offer.price);
  const right=basis==="verified_total"?Number(b.offer.total_price):Number(b.offer.price);
  return left-right||a.published.merchant.localeCompare(b.published.merchant,"en-GB");
 });
 const sellers=new Set(ordered.map(x=>x.published.merchant.trim().toLowerCase())).size;
 if(!ordered.length)return {ordered,sellers:0,basis:"item_price_only",heading:"No eligible offers",detail:"Retailer evidence is unavailable."};
 if(sellers===1)return {ordered,sellers,basis,
  heading:basis==="verified_total"?"Verified total at this retailer":"Verified item price at this retailer",
  detail:basis==="verified_total"?"A full quoted total is available for this seller. Check availability and checkout terms.":
  "Only one independent seller is currently eligible here. Delivery may cost extra; this is not a cheapest-market comparison."};
 return {ordered,sellers,basis,
  heading:basis==="verified_total"?`Lowest verified total among ${sellers} retailers`:`Lowest item price among ${sellers} retailers`,
  detail:basis==="verified_total"?"All listed totals have been verified as covering the stated offer costs; confirm checkout.":
  "Same exact source-approved product, but delivery and installation charges are not established for every retailer. Cheapest delivered price is unknown."};
}
