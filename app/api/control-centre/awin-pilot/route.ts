import {NextRequest,NextResponse} from "next/server";
import {createClient} from "../../../../lib/supabase/server";
import {POST as runPrivateAwinPilot} from "../../internal/awin-auto-import/route";

const send=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store"}});

/**
 * Owner-authenticated control for one existing Awin pilot. Call the same
 * fail-closed worker in-process: no self-fetch, new cron credentials, public
 * proxy route, alternate importer, or customer data is introduced.
 *
 * Only 77952:103580 is supported here. Staging is explicitly confirmed and
 * remains private. The worker itself enforces joined membership, paused source,
 * full-feed validation, idempotent chunks and the global emergency stop.
 */
export async function POST(request:NextRequest){
 try{
  const db=await createClient();
  const {data:{user},error:authError}=await db.auth.getUser();
  if(authError||!user)return send({error:"Sign in required"},401);
  const {data:role,error:roleError}=await db.from("user_roles")
   .select("role").eq("user_id",user.id).maybeSingle();
  if(roleError||role?.role!=="owner")return send({error:"Owner permission required"},403);

  const origin=request.headers.get("origin");
  if(origin){
   try{
    if(new URL(origin).origin!==new URL(request.url).origin)
     return send({error:"Cross-origin request denied"},403);
   }catch{return send({error:"Invalid origin"},403);}
  }
  if(!request.headers.get("content-type")?.toLowerCase().startsWith("application/json"))
   return send({error:"JSON request required"},415);
  if(Number(request.headers.get("content-length")||0)>512)
   return send({error:"Request too large"},413);
  const raw=await request.text();
  if(raw.length>512)return send({error:"Request too large"},413);
  const body=JSON.parse(raw) as Record<string,unknown>;
  if(!body||typeof body!=="object"||Array.isArray(body)||
     Object.keys(body).some(key=>!["mode","confirm"].includes(key)))
   return send({error:"Invalid pilot request"},400);
  const mode=body.mode;
  if(mode!=="preflight"&&mode!=="stage")
   return send({error:"Unknown pilot operation"},400);
  if(mode==="stage"&&body.confirm!=="stage-privately-77952-103580")
   return send({error:"Explicit private staging confirmation required"},400);
  if(mode==="preflight"&&body.confirm!==undefined)
   return send({error:"Unexpected preflight confirmation"},400);

  const secret=process.env.CRON_SECRET;
  if(!secret||secret.length<16)
   return send({error:"Private importer credentials not configured"},503);
  const workerUrl=new URL("/api/internal/awin-auto-import",request.url);
  workerUrl.searchParams.set("mode",mode);
  workerUrl.searchParams.set("advertiser_id","77952");
  workerUrl.searchParams.set("feed_id","103580");
  const workerRequest=new NextRequest(workerUrl,{
   method:"POST",headers:{authorization:`Bearer ${secret}`}
  });
  // This returns only the worker's safe aggregate JSON and no-store headers.
  return await runPrivateAwinPilot(workerRequest);
 }catch{
  return send({error:"Unable to run the private Petlibro pilot"},400);
 }
}
