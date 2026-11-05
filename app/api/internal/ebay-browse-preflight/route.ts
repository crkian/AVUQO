import {NextRequest,NextResponse} from "next/server";
import {createAdminClient} from "../../../../lib/supabase/admin";
import {AVUQO_EPN_DEFAULT_CAMPAIGN,EBAY_BROWSE_SCOPE,EBAY_GB_MARKETPLACE,
 ebayBrowseAffiliateHeader,privateEbayBrowseItem} from "../../../../lib/ebay/epn-browse";
const reply=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store"}});
const safeQuery=/^[a-zA-Z0-9][a-zA-Z0-9 '\-]{1,78}$/;
/**
 * Explicit owner-only, bounded, read-only eBay Browse API preflight.
 * No feed import, offer writes, scheduled runs or public release.
 */
export async function POST(request:NextRequest){
 const secret=process.env.CRON_SECRET;
 if(!secret||secret.length<16||request.headers.get("authorization")!==`Bearer ${secret}`)
  return reply({error:"Unauthorized"},401);
 let q:string;
 try{
  if(Number(request.headers.get("content-length")||0)>1024)return reply({error:"Request too large"},413);
  const body=await request.json() as Record<string,unknown>;
  if(Object.keys(body).length!==1||typeof body.q!=="string"||!safeQuery.test(body.q))
   return reply({error:"Invalid keyword"},400);
  q=body.q;
 }catch{return reply({error:"Invalid request"},400);}
 const db=createAdminClient();
 const {data:source,error}=await db.from("sources").select("status,sync_enabled")
  .eq("connector_key","ebay").maybeSingle();
 if(error||!source||source.status!=="paused"||source.sync_enabled!==false)
  return reply({error:"eBay private diagnostic source is not paused"},403);
 const clientId=process.env.EBAY_CLIENT_ID??"";
 const clientSecret=process.env.EBAY_CLIENT_SECRET??"";
 if(!clientId||!clientSecret)return reply({status:"needs_ebay_developer_credentials",
   campaign_id:AVUQO_EPN_DEFAULT_CAMPAIGN,marketplace:EBAY_GB_MARKETPLACE,
   private_only:true,no_product_import:true,no_publication:true},200);
 try{
  const oauth=await fetch("https://api.ebay.com/identity/v1/oauth2/token",{
   method:"POST",cache:"no-store",redirect:"error",signal:AbortSignal.timeout(12000),
   headers:{Authorization:"Basic "+Buffer.from(clientId+":"+clientSecret).toString("base64"),
    "Content-Type":"application/x-www-form-urlencoded"},
   body:new URLSearchParams({grant_type:"client_credentials",scope:EBAY_BROWSE_SCOPE})
  });
  if(!oauth.ok)return reply({error:"eBay OAuth credentials rejected"},502);
  const token=await oauth.json() as {access_token?:string};
  if(!token.access_token)return reply({error:"eBay OAuth response missing token"},502);
  const u=new URL("https://api.ebay.com/buy/browse/v1/item_summary/search");
  u.searchParams.set("q",q);u.searchParams.set("limit","20");
  u.searchParams.set("filter","buyingOptions:{FIXED_PRICE}");
  const r=await fetch(u,{cache:"no-store",redirect:"error",signal:AbortSignal.timeout(15000),
   headers:{Authorization:"Bearer "+token.access_token,
    "X-EBAY-C-MARKETPLACE-ID":EBAY_GB_MARKETPLACE,
    "X-EBAY-C-ENDUSERCTX":ebayBrowseAffiliateHeader(AVUQO_EPN_DEFAULT_CAMPAIGN)}
  });
  if(!r.ok)return reply({error:"eBay Browse access unavailable",upstream_status:r.status},502);
  const result=await r.json() as {itemSummaries?:unknown[];total?:number};
  const rows=Array.isArray(result.itemSummaries)?result.itemSummaries.slice(0,20):[];
  const eligible=rows.map(x=>privateEbayBrowseItem(x,AVUQO_EPN_DEFAULT_CAMPAIGN))
   .filter(x=>x!==null);
  return reply({status:"private_ebay_browse_diagnostic",
   campaign_id:AVUQO_EPN_DEFAULT_CAMPAIGN,marketplace:EBAY_GB_MARKETPLACE,
   sampled_items:rows.length,valid_tracked_gbp_items:eligible.length,
   rejected_items:rows.length-eligible.length,
   private_only:true,no_product_values_returned:true,no_database_writes:true,
   no_import:true,no_publication:true});
 }catch{
  return reply({error:"eBay private diagnostic failed",private_only:true,
   no_import:true,no_publication:true},502);
 }
}
