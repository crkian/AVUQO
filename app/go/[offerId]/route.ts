import {NextResponse} from "next/server";
import {verifiedOffers} from "../../../lib/products/public-catalog";
import {safeMerchantDestination} from "../../../lib/analytics/outbound";

type Context={params:Promise<{offerId:string}>};

/**
 * An outbound click is not a conversion. Tracking intentionally remains OFF:
 * the former client-role insertion path did not prove click provenance or consent.
 * A future collector must pass explicit purpose/consent, rate-limit and source
 * verification review before recording any events.
 */
export async function GET(request:Request,{params}:Context){
 const {offerId}=await params;
 if(!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(offerId))
  return NextResponse.redirect(new URL("/products",request.url),302);
 const [verified]=await verifiedOffers({offerId,limit:1});
 if(!verified)return NextResponse.redirect(new URL("/products",request.url),302);
 const url=safeMerchantDestination(verified.offer.affiliate_url||verified.offer.source_url);
 if(!url)return NextResponse.redirect(new URL("/products",request.url),302);
 return NextResponse.redirect(url,302);
}
