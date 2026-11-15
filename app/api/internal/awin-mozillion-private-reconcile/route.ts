import {NextRequest,NextResponse} from "next/server";
import {createAdminClient} from "../../../../lib/supabase/admin";

/**
 * Private, scheduled Mozillion SIM-free handset identity reconciliation only.
 * Never create offers, public product pages, source activations, image rights,
 * publication reviews, deal scores or live price observations.
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
 const {data,error}=await db.rpc("reconcile_mozillion_private_handset_candidates");
 if(error)return reply({error:"Private Mozillion reconciliation rejected",private_only:true},503);
 return reply({result:data,private_only:true,no_publication:true});
}
