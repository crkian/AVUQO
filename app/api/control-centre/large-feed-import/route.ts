import {createHash} from "node:crypto";
import {NextRequest,NextResponse} from "next/server";
import {createClient} from "../../../../lib/supabase/server";
import {createAdminClient} from "../../../../lib/supabase/admin";
import {joinedInSource} from "../../../../lib/awin/joined-catalogue";
import {MAX_CHUNK_ROWS,prepareTooledUpBatch} from "../../../../lib/feed-imports/tooled-up-large";

export const runtime="nodejs";
export const maxDuration=60;
const send=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store"}});
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function POST(req:NextRequest){
 try{
  const supabase=await createClient();
  const {data:{user},error:authError}=await supabase.auth.getUser();
  if(authError||!user)return send({error:"Sign in required"},401);
  const {data:role,error:roleError}=await supabase.from("user_roles")
   .select("role").eq("user_id",user.id).maybeSingle();
  if(roleError||!role||!["admin","owner"].includes(role.role))return send({error:"Owner/admin permission required"},403);
  if(Number(req.headers.get("content-length")||0)>2_500_000)return send({error:"Chunk request exceeds 2.5MB"},413);
  const body=await req.json() as Record<string,unknown>;
  const action=body.action;
  const admin=createAdminClient();
  if(action==="start"){
   const filename=String(body.filename??"");
   const bytes=Number(body.file_size??0);
   const sourceDigest=String(body.source_digest??'');
   if(!/^[a-f0-9]{64}$/.test(sourceDigest))return send({error:'Compressed-file SHA256 is required'},400);
   if(!/^496-89987-en_GB-All_Products(?: \(\d+\))?\.csv\.gz$/i.test(filename))
    return send({error:"Select the Tooled-Up Awin All Products CSV.GZ (feed 89987)"},400);
   if(!Number.isSafeInteger(bytes)||bytes<1||bytes>150*1024*1024)
    return send({error:"Compressed input must be 1 byte to 150 MB"},400);
   const {data:source,error:sourceError}=await admin.from("sources").select("metadata").eq("connector_key","awin").maybeSingle();
   if(sourceError||!source||!joinedInSource(source.metadata,"496"))
    return send({error:"Tooled-Up joined status cannot be verified"},403);
   const {data:run,error:runError}=await admin.from("feed_import_runs").insert({
    created_by:user.id,merchant_id:"496",merchant_name:"Tooled Up",
    filename:filename.slice(0,255),total_count:0,review_count:0,excluded_count:0,
    status:"importing",permission_status:"unverified"
   }).select("id").single();
   if(runError||!run)throw Error("Could not start private import: "+(runError?.message??"missing run"));
   const {error:sessionError}=await admin.from("large_feed_import_sessions").insert({import_id:run.id,source_digest:sourceDigest});
   if(sessionError){
    await admin.from("feed_import_runs").delete().eq("id",run.id);
    throw Error("Import session not ready: "+sessionError.message);
   }
   return send({run_id:run.id,next_sequence:0,committed:0,private_only:true});
  }
  const runId=String(body.run_id??"");
  if(!uuid.test(runId))return send({error:"Invalid import ID"},400);
  const {data:run,error:runError}=await admin.from("feed_import_runs")
   .select("id,created_by,status,merchant_id,total_count").eq("id",runId).maybeSingle();
  if(runError||!run||run.created_by!==user.id||run.merchant_id!=="496")
   return send({error:"Tooled-Up import not found for this owner"},404);
  if(action==="status"){
   const {data:session,error}=await admin.from("large_feed_import_sessions")
    .select("next_sequence,committed_count,review_count,excluded_count,completed_at,source_digest")
    .eq("import_id",runId).single();
   if(error||!session)return send({error:"Import session unavailable"},404);
   return send({status:run.status,...session});
  }
  if(action==="chunk"){
   if(run.status!=="importing")return send({error:"Import is no longer writable"},409);
   const sequence=Number(body.sequence);
   const headers=body.headers;
   const rows=body.rows;
   if(!Number.isSafeInteger(sequence)||sequence<0||!Array.isArray(headers)||!Array.isArray(rows)
     ||rows.length<1||rows.length>MAX_CHUNK_ROWS
     ||headers.some(x=>typeof x!=="string"||x.length>100)
     ||rows.some(r=>!Array.isArray(r)||r.some(c=>typeof c!=="string"||c.length>10000)))
    return send({error:"Invalid chunk payload"},400);
   const records=prepareTooledUpBatch(headers as string[],rows as string[][]);
   // Hash the original validated rows, so an exact replay is safe even if
   // the initial request succeeded but the client's network response was lost.
   const digest=createHash("sha256").update(JSON.stringify({headers,rows})).digest("hex");
   const {data,error}=await admin.rpc("append_tooled_up_large_feed_chunk",{
    p_import_id:runId,p_sequence:sequence,p_digest:digest,p_rows:records
   });
   if(error)throw Error("Chunk rejected: "+error.message);
   return send(data);
  }
  if(action==="finish"){
   const total=Number(body.total);
   if(!Number.isSafeInteger(total)||total<1||total>250000)
    return send({error:"Invalid import total"},400);
   const {data,error}=await admin.rpc("finish_tooled_up_large_feed_import",{
    p_import_id:runId,p_total:total
   });
   if(error)throw Error("Final validation failed: "+error.message);
   return send({...data,private_only:true,permission_status:"unverified"});
  }
  return send({error:"Unsupported action"},400);
 }catch(error){
  return send({error:error instanceof Error?error.message:"Import failed"},400);
 }
}
