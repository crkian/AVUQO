import {NextRequest,NextResponse} from "next/server";
import {createClient} from "../../../../lib/supabase/server";
import {createAdminClient} from "../../../../lib/supabase/admin";
import {joinedInSource} from "../../../../lib/awin/joined-catalogue";

const RUN="8ea807f1-7050-4dfb-af51-e08dc7c7bbd5";
const send=(value:unknown,status=200)=>NextResponse.json(value,{status,headers:{"Cache-Control":"private, no-store"}});
/** Only enrich the original, owner-owned, completed Awin Tyres UK import. */
export async function POST(request:NextRequest){
 try{
  if(Number(request.headers.get("content-length")??0)>180000)
   return send({error:"Enrichment batch too large"},413);
  const session=await createClient();
  const {data:{user}}=await session.auth.getUser();
  if(!user)return send({error:"Sign in required"},401);
  const {data:role}=await session.from("user_roles").select("role").eq("user_id",user.id).maybeSingle();
  if(role?.role!=="owner")return send({error:"Owner access required"},403);
  const body=await request.json() as Record<string,unknown>;
  if(JSON.stringify(body).length>180000)return send({error:"Enrichment batch too large"},413);
  const action=body.action;
  const db=createAdminClient();
  const {data:source}=await db.from("sources")
    .select("metadata,status,sync_enabled").eq("connector_key","awin").maybeSingle();
  if(!source||source.status!=="paused"||source.sync_enabled!==false||
     !joinedInSource(source.metadata,"12715"))
   return send({error:"Paused Awin source and joined Tyres UK required"},409);
  const {data:run}=await db.from("feed_import_runs")
   .select("id,merchant_id,created_by,status,permission_status,total_count")
   .eq("id",RUN).maybeSingle();
  const {data:importSession}=await db.from("large_feed_import_sessions")
   .select("source_digest,committed_count,completed_at").eq("import_id",RUN).maybeSingle();
  if(!run||!importSession||run.created_by!==user.id||run.merchant_id!=="12715"||
      run.status!=="private_review"||run.permission_status!=="unverified"||
      importSession.committed_count!==run.total_count||!importSession.completed_at)
   return send({error:"Completed Tyres UK owner import unavailable"},409);
  if(action==="status"){
   const {count,error}=await db.from("feed_import_records")
    .select("id",{count:"exact",head:true})
    .eq("import_id",RUN).eq("status","review")
    .not("metadata->>load_index_candidate","is",null);
   if(error)return send({error:"Private enrichment status unavailable"},503);
   return send({status:"private_enrichment_ready",imported:run.total_count,
    enriched_review_records:count??0,source_digest:importSession.source_digest,
    private_only:true,no_publication:true});
  }
  if(action!=="chunk"||typeof body.source_digest!=="string"||
     body.source_digest!==importSession.source_digest||
     !Array.isArray(body.rows)||body.rows.length<1||body.rows.length>250||
     Object.keys(body).some(k=>!["action","source_digest","rows"].includes(k)))
   return send({error:"Invalid original-file enrichment request"},400);
  const {data,error}=await db.rpc("enrich_private_tyres_uk_specs",{
   p_import_id:RUN,p_actor_id:user.id,
   p_source_digest:importSession.source_digest,p_rows:body.rows
  });
  if(error)return send({error:"Private enrichment batch rejected; no publication"},409);
  return send(data);
 }catch{
  return send({error:"Invalid tyre enrichment request"},400);
 }
}
