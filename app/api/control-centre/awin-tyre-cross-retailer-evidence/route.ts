import {NextResponse} from "next/server";
import {createClient} from "../../../../lib/supabase/server";
import {createAdminClient} from "../../../../lib/supabase/admin";
import {comparePrivateTyreIdentities} from "../../../../lib/awin/tyre-cross-retailer-evidence.mjs";

export const maxDuration=120;
const reply=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
type Admin=ReturnType<typeof createAdminClient>;
type EvidenceRow={brand:string;metadata:{ean:unknown;gtin:unknown;tyre_size_candidate:unknown;tyre_size_conflict:unknown}};
async function scan(db:Admin,importId:string,merchant:string,feed:string,total:number,started:number){
 if(!Number.isSafeInteger(total)||total<1||total>100000)throw Error("invalid count");
 let cursor="";
 const records:EvidenceRow[]=[];
 while(records.length<total){
  if(Date.now()-started>100000)throw Error("scan time limit");
  let query=db.from("feed_import_records").select("id,brand,metadata").eq("import_id",importId).eq("merchant_id",merchant).order("id",{ascending:true}).limit(500);
  if(cursor)query=query.gt("id",cursor);
  const {data,error}=await query;
  if(error||!data?.length)throw Error("incomplete page");
  for(const row of data){
   const m=row.metadata;
   if(typeof row.id!=="string"||row.id<=cursor||String(m?.feed_id)!==feed)throw Error("snapshot identity mismatch");
   cursor=row.id;
   records.push({brand:row.brand??"",metadata:{ean:m.ean,gtin:m.gtin,tyre_size_candidate:m.tyre_size_candidate,tyre_size_conflict:m.tyre_size_conflict}});
  }
 }
 const {count,error}=await db.from("feed_import_records").select("id",{count:"exact",head:true}).eq("import_id",importId);
 if(error||count!==total||records.length!==total)throw Error("snapshot count mismatch");
 return records;
}
/** Aggregate-only comparison of exact private imports; no price or identity publication. */
export async function GET(){
 try{
  const session=await createClient();
  const {data:{user},error:authError}=await session.auth.getUser();
  if(authError||!user)return reply({error:"Sign in required"},401);
  const {data:role,error:roleError}=await session.from("user_roles").select("role").eq("user_id",user.id).maybeSingle();
  if(roleError||role?.role!=="owner")return reply({error:"Owner only"},403);
  const db=createAdminClient(),started=Date.now();
  const [p,t]=await Promise.all([
   db.from("awin_bulk_import_jobs").select("private_import_id,validated_total,committed_rows,completed_at").eq("advertiser_id","15236").eq("feed_id","26513").eq("state","completed").order("completed_at",{ascending:false}).limit(1).maybeSingle(),
   db.from("feed_import_runs").select("id,total_count,created_at").eq("merchant_id","12715").eq("status","private_review").order("created_at",{ascending:false}).limit(1).maybeSingle()
  ]);
  if(p.error||t.error||!p.data?.private_import_id||!t.data?.id||Number(p.data.committed_rows)!==Number(p.data.validated_total))return reply({error:"Completed private imports unavailable"},503);
  const [pneus,tyres]=await Promise.all([
   scan(db,p.data.private_import_id,"15236","26513",Number(p.data.validated_total),started),
   scan(db,t.data.id,"12715","93988",Number(t.data.total_count),started)
  ]);
  return reply({...comparePrivateTyreIdentities(pneus,tyres),pneusInspected:pneus.length,tyresInspected:tyres.length,pneusCompletedAt:p.data.completed_at,tyresImportedAt:t.data.created_at,privateOnly:true,fitmentVerified:false,currencyVerified:false,publicationChanged:false});
 }catch{return reply({error:"Complete cross-retailer evidence scan unavailable"},503);}
}
