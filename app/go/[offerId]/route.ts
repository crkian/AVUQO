import {NextResponse} from "next/server";
import {verifiedOffers} from "../../../lib/products/public-catalog";
import {createClient} from "../../../lib/supabase/server";
type Context={params:Promise<{offerId:string}>};
function destination(value:string|null){try{if(!value)return null;const u=new URL(value);if(u.protocol!=="https:"||u.username||u.password||u.hostname.length<4)return null;return u}catch{return null}}
export async function GET(request:Request,{params}:Context){
 const {offerId}=await params;
 if(!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(offerId))return NextResponse.redirect(new URL("/products",request.url),302);
 const [verified]=await verifiedOffers({offerId,limit:1});
 if(!verified)return NextResponse.redirect(new URL("/products",request.url),302);
 const url=destination(verified.offer.affiliate_url||verified.offer.source_url);
 if(!url)return NextResponse.redirect(new URL("/products",request.url),302);
 const supabase=await createClient();
 const {data:auth}=await supabase.auth.getUser();
 const ref=request.headers.get("referer");
 let refererPath:string|null=null;
 if(ref){try{const u=new URL(ref);if(u.origin===new URL(request.url).origin)refererPath=u.pathname;}catch{}}
 await supabase.from("click_events").insert({user_id:auth.user?.id??null,offer_id:offerId,page_path:refererPath||`/live/${offerId}`,traffic_source:refererPath?"avuqo":"direct",campaign:"verified-product",metadata:{destination_domain:url.hostname,attribution_version:"v0.9"}});
 return NextResponse.redirect(url,302);
}
