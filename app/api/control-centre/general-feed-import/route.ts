import {createHash} from "node:crypto";
import {NextRequest,NextResponse} from "next/server";
import {createClient} from "../../../../lib/supabase/server";
import {createAdminClient} from "../../../../lib/supabase/admin";
import {joinedInSource,joinedName} from "../../../../lib/awin/joined-catalogue";
import {prepareGeneralBatch} from "../../../../lib/feed-imports/general-awin-large";
const send=(v:unknown,status=200)=>NextResponse.json(v,{status,headers:{"Cache-Control":"private,no-store"}});
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function POST(request:NextRequest){
 try{
  const db=await createClient();
  const {data:{user},error:authError}=await db.auth.getUser();
  if(authError||!user)return send({error:"Sign in required"},401);
  const {data:role,error:roleError}=await db.from("user_roles").select("role").eq("user_id",user.id).maybeSingle();
  if(roleError||!role||!["owner","admin"].includes(role.role))return send({error:"Owner/admin required"},403);
  if(Number(request.headers.get("content-length")||0)>2_500_000)return send({error:"Batch too large"},413);
  const body=await request.json() as Record<string,unknown>;
  if(JSON.stringify(body).length>2_500_000)return send({error:"Request body too large"},413);
  const action=body.action;
  const admin=createAdminClient();
  if(action==="start"){
   const merchant=String(body.advertiser_id??"");
   const merchantName=joinedName(merchant);
   const feedId=String(body.feed_id??"");
   const filename=String(body.filename??"");
   const digest=String(body.source_digest??"");
   const bytes=Number(body.file_size??0);
   if(!merchantName||!/^[A-Za-z0-9_-]{1,30}$/.test(feedId)||!/^.{1,230}\.(?:csv|tsv)(?:\.gz)?$/i.test(filename)
       ||!/^[a-f0-9]{64}$/.test(digest)||!Number.isSafeInteger(bytes)||bytes<1||bytes>250*1024*1024)
    return send({error:"Invalid advertiser, feed identifier or compressed/uncompressed CSV file"},400);
   const {data:source,error:sourceError}=await admin.from("sources").select("metadata")
    .eq("connector_key","awin").maybeSingle();
   if(sourceError||!source||!joinedInSource(source.metadata,merchant))
    return send({error:"Joined advertiser not verified in the source registry"},403);
   // Strict file name ID binding for standard Awin downloadable exports:
   // advertiser-feed-locale-description.csv.gz. Other retailer naming is allowed
   // only with explicit row-by-row advertiser IDs and manual feed ID review.
   const {data:run,error}=await admin.from("feed_import_runs").insert({
    created_by:user.id,merchant_id:merchant,merchant_name:merchantName,
    filename:("GENAWIN__"+feedId+"__"+filename).slice(0,255),status:"importing",permission_status:"unverified",
    total_count:0,review_count:0,excluded_count:0
   }).select("id").single();
   if(error||!run)return send({error:"Could not create private import"},503);
   const {error:sessionError}=await admin.from("large_feed_import_sessions")
    .insert({import_id:run.id,source_digest:digest});
   if(sessionError){await admin.from("feed_import_runs").delete().eq("id",run.id);
    return send({error:"Could not initialise resumable session"},503);}
   return send({run_id:run.id,next_sequence:0,committed:0,private_only:true,advertiser_id:merchant,feed_id:feedId});
  }
  const runId=String(body.run_id??"");
  if(!uuid.test(runId))return send({error:"Invalid run ID"},400);
  const {data:run,error:runError}=await admin.from("feed_import_runs")
   .select("id,created_by,status,merchant_id,filename,permission_status")
   .eq("id",runId).maybeSingle();
  if(runError||!run||run.created_by!==user.id||!joinedName(run.merchant_id)||run.permission_status!=="unverified"||!/^GENAWIN__[A-Za-z0-9_-]{1,30}__/.test(run.filename))
   return send({error:"Private import not found"},404);
  // Membership can be revoked after start: fail closed for resume, writes and finish.
  const {data:currentSource,error:currentSourceError}=await admin.from("sources")
   .select("metadata").eq("connector_key","awin").maybeSingle();
  if(currentSourceError||!currentSource||!joinedInSource(currentSource.metadata,run.merchant_id))
   return send({error:"Advertiser is no longer verified as joined"},403);
  if(action==="status"){
   const {data:session,error}=await admin.from("large_feed_import_sessions")
    .select("next_sequence,committed_count,review_count,excluded_count,completed_at,source_digest")
    .eq("import_id",runId).single();
   if(error||!session)return send({error:"Session unavailable"},404);
   return send({status:run.status,advertiser_id:run.merchant_id,feed_id:run.filename.split("__")[1],...session});
  }
  if(action==="chunk"){
   if(run.status!=="importing")return send({error:"Import already closed"},409);
   const headers=body.headers,rows=body.rows,sequence=Number(body.sequence);
   const feedId=String(body.feed_id??"");
   if(run.filename.split("__")[1]!==feedId)return send({error:"Feed identifier does not match session"},409);
   if(!Number.isSafeInteger(sequence)||sequence<0||!Array.isArray(headers)||!Array.isArray(rows)
      ||rows.length<1||rows.length>250||headers.some(v=>typeof v!=="string"||v.length>120)
      ||rows.some(r=>!Array.isArray(r)||r.some(v=>typeof v!=="string"||v.length>10000)))
    return send({error:"Invalid chunk contents"},400);
   const records=prepareGeneralBatch(run.merchant_id,feedId,headers as string[],rows as string[][]);
   const digest=createHash("sha256").update(JSON.stringify({headers,rows,feedId})).digest("hex");
   const {data,error}=await admin.rpc("append_general_awin_feed_chunk",{
    p_import_id:runId,p_sequence:sequence,p_digest:digest,p_rows:records
   });
   if(error)return send({error:"Batch rejected: "+error.message},400);
   return send(data);
  }
  if(action==="finish"){
   const total=Number(body.total);
   if(!Number.isSafeInteger(total)||total<1||total>500000)return send({error:"Invalid total"},400);
   const {data,error}=await admin.rpc("finish_general_awin_feed_import",{p_import_id:runId,p_total:total});
   if(error)return send({error:"Final count validation failed: "+error.message},400);
   return send({...data,private_only:true,permission_status:"unverified"});
  }
  return send({error:"Unsupported action"},400);
 }catch{
  return send({error:"Invalid import request or unsupported feed format"},400);
 }
}
