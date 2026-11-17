import {NextRequest,NextResponse} from "next/server";
import {createAdminClient} from "../../../../lib/supabase/admin";
import {autoReleaseEligibleAwinOffers} from "../../../../lib/awin/auto-first-publication";

export const maxDuration=120;
const reply=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store"}});

/** Recurring bounded owner-authorised FIRST-release check. Independent from
 * product staging. Never turns a paused/revoked offer public, nor overrides
 * score, confidence, currency, tracking, price freshness or source gates.
 * The atomic RPC remains final authority for every release.
 */
export async function GET(request:NextRequest){
 const secret=process.env.CRON_SECRET;
 if(!secret||secret.length<16||
    request.headers.get("authorization")!==`Bearer ${secret}`)
  return reply({error:"Unauthorized"},401);
 if(new URL(request.url).search||Number(request.headers.get("content-length")??0)>0)
  return reply({error:"No offer or merchant overrides supported"},400);
 if(process.env.AWIN_AUTO_IMPORT_ENABLED!=="true")
  return reply({status:"disabled",checked:0,approved:0,private_only:true});
 try{
  const result=await autoReleaseEligibleAwinOffers(createAdminClient(),5);
  return reply({...result,automated:true,authority:"owner_grant_with_atomic_release",
   no_first_publication:result.approved===0,private_only:true},200);
 }catch{return reply({status:"atomic_auto_release_unavailable",approved:0,private_only:true},503);}
}
