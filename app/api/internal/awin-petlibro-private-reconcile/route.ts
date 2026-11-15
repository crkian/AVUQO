import {NextRequest,NextResponse} from "next/server";
import {createAdminClient} from "../../../../lib/supabase/admin";

/**
 * Post-import daily candidate reconciliation. This operation NEVER writes
 * offers, scores, prices, reviews, images, rights or published_deals.
 * The service-role-only database function owns the transactional identity
 * checks, duplicate prevention, stop gate and idempotence.
 */
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
 const {data,error}=await db.rpc("reconcile_petlibro_private_candidates");
 if(error)return reply({error:"Private Petlibro reconciliation rejected",private_only:true},503);
 return reply({result:data,private_only:true,no_publication:true});
}
