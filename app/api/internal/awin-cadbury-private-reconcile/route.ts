import {NextRequest,NextResponse} from "next/server";
import {createAdminClient} from "../../../../lib/supabase/admin";

/** Cadbury private draft matching only; never publishes or approves offers. */
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
 const {data,error}=await db.rpc("reconcile_cadbury_private_candidates");
 if(error)return reply({error:"Private Cadbury reconciliation rejected",private_only:true},503);
 return reply({result:data,private_only:true,no_publication:true});
}
