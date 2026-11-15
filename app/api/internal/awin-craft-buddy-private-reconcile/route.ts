import {NextRequest,NextResponse} from "next/server";
import {createAdminClient} from "../../../../lib/supabase/admin";

/** Exact-feed, private-only SKU reconciliation. No product offer publishing. */
export const maxDuration=60;
const reply=(body:unknown,status=200)=>NextResponse.json(body,{
 status,headers:{"Cache-Control":"private, no-store"}
});
export async function GET(request:NextRequest){
 const secret=process.env.CRON_SECRET;
 if(!secret||secret.length<16||
    request.headers.get("authorization")!==`Bearer ${secret}`)
  return reply({error:"Unauthorized"},401);
 if(process.env.AWIN_AUTO_IMPORT_ENABLED!=="true")
  return reply({status:"disabled",private_only:true});
 const db=createAdminClient();
 const {data,error}=await db.rpc("reconcile_craft_buddy_private_candidates");
 if(error)return reply({error:"Craft Buddy private candidates rejected",private_only:true},503);
 return reply({result:data,private_only:true,no_publication:true});
}
