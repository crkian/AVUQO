/** UK-only owner pricing policy, 2026-11-24.
 * Accept exact known UK feed provenance, not a blanket currency conversion.
 * A retailer's region alone does not authorise an arbitrary missing currency.
 */
export function approvedUkFeedCurrency(advertiser:string,feed:string,basis:string):boolean{
 return (advertiser==="496"&&feed==="89987"&&basis==="tooled_up_uk_GBP_storefront_and_exact_staged_price_match")||
 (advertiser==="77952"&&["103580","109051","109652","119210"].includes(feed)&&basis==="petlibro_uk_programme_gbp")||
 (advertiser==="736"&&feed==="48599"&&basis==="cadbury_uk_programme_gbp");
}
