import {NextRequest,NextResponse} from "next/server";
import {createAdminClient} from "../../../../lib/supabase/admin";
export const maxDuration=60;
export async function GET(request:NextRequest){
 const secret=process.env.CRON_SECRET;
 const reply=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store"}});
 if(!secret||secret.length<16||request.headers.get("authorization")!=="Bearer "+secret)return reply({error:"Unauthorized"},401);
 if(process.env.AWIN_PUBLISHER_ID!=="3135746"||!process.env.AWIN_ACCESS_TOKEN)return reply({status:"credential_gate"});
 const db=createAdminClient();
 const {data:control,error:controlError}=await db.from("system_controls").select("enabled").eq("control_key","shopping_publishing").maybeSingle();
 if(controlError||!control?.enabled)return reply({status:"shopping_disabled"});
 const {data,error}=await db.rpc("auto_review_active_shopping",{p_limit:30});
 return error?reply({status:"approval_worker_unavailable"},503):reply(data);
}
