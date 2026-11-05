import {NextRequest,NextResponse} from "next/server";
import {createAdminClient} from "../../../../lib/supabase/admin";
import {joinedInSource} from "../../../../lib/awin/joined-catalogue";
import {inspectTooledUpProgrammeCurrency} from "../../../../lib/awin/tooled-up-programme-currency";
const send=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store"}});
/** Read-only authenticated Awin programme-currency check. Never approves staging. */
export async function POST(request:NextRequest){
 const secret=process.env.CRON_SECRET;
 if(!secret||secret.length<16||request.headers.get("authorization")!==`Bearer ${secret}`)
  return send({error:"Unauthorized"},401);
 const publisher=process.env.AWIN_PUBLISHER_ID??"";
 const token=process.env.AWIN_ACCESS_TOKEN??"";
 const db=createAdminClient();
 const {data:source,error}=await db.from("sources").select("metadata,status,sync_enabled")
  .eq("connector_key","awin").maybeSingle();
 if(error||!source||source.status!=="paused"||source.sync_enabled!==false||
    !joinedInSource(source.metadata,"496"))
  return send({error:"Joined and paused Tooled Up source required"},403);
 try{
  return send({status:"programme_currency_inspected",
   ...(await inspectTooledUpProgrammeCurrency(publisher,token))});
 }catch{
  return send({error:"Awin joined programme currency could not be verified",
   currency_verified:false,ready_to_stage:false,private_only:true,
   no_database_writes:true,no_publication:true},422);
 }
}
