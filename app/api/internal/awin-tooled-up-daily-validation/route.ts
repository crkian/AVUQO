import {NextRequest,NextResponse} from "next/server";
import {createAdminClient} from "../../../../lib/supabase/admin";
import {AWIN_PRIVATE_SNAPSHOT_BUCKET} from "../../../../lib/awin/private-snapshot";
import {tooledUpPrivateAutomationAllowed} from "../../../../lib/awin/tooled-up-private-automation";
import {recordPrivateCronAttempt} from "../../../../lib/awin/private-cron-recorder";
import {newestRecentTooledUpSnapshot} from "../../../../lib/awin/tooled-up-recent-snapshot";
import {POST as validateSnapshot} from "../awin-snapshot-validate/route";

/**
 * Daily validation of one newly captured Tooled Up master snapshot.
 * The only input to the existing validator is a SHA-256 derived from a
 * recent, private Storage object under the fixed 496/89987 prefix.
 * No raw URL, API key, object path, price or product data reaches the client.
 */
export const maxDuration=300;
const reply=(body:unknown,status=200)=>NextResponse.json(body,{
 status,headers:{"Cache-Control":"private, no-store"}
});
export async function GET(request:NextRequest){
 const secret=process.env.CRON_SECRET;
 if(!secret||secret.length<16||
    request.headers.get("authorization")!==`Bearer ${secret}`)
  return reply({error:"Unauthorized"},401);
 if(new URL(request.url).search||Number(request.headers.get("content-length")??0)>0)
  return reply({error:"No feed, object or digest override is supported"},400);
 return recordPrivateCronAttempt("tooled_up_validation",async()=>{
 if(process.env.AWIN_AUTO_IMPORT_ENABLED!=="true")
  return reply({status:"disabled",private_only:true,no_publication:true});
 const db=createAdminClient();
 if(!(await tooledUpPrivateAutomationAllowed(db)))
  return reply({error:"Private snapshot controls prohibit validation"},423);
 const {data,error}=await db.storage.from(AWIN_PRIVATE_SNAPSHOT_BUCKET)
  .list("awin/496/89987",{limit:100,offset:0,
   sortBy:{column:"created_at",order:"desc"}});
 if(error)return reply({error:"Private snapshot inventory unavailable"},503);
 const recent=newestRecentTooledUpSnapshot(data);
 if(!recent)return reply({
  status:"no_recent_private_snapshot",private_only:true,
  no_product_import:true,no_publication:true
 });
 const url=new URL("/api/internal/awin-snapshot-validate",request.url);
 return validateSnapshot(new NextRequest(url,{
  method:"POST",
  headers:{"authorization":`Bearer ${secret}`,
   "content-type":"application/json"},
  body:JSON.stringify({snapshot_sha256:recent.snapshot_sha256})
 }));
 });
}
