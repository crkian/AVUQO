import {NextResponse} from "next/server";
import {createClient} from "../../../../lib/supabase/server";
import {createAdminClient} from "../../../../lib/supabase/admin";
import {pneusTechnicalEvidence} from "../../../../lib/awin/pneus-technical-evidence.mjs";

export const maxDuration=60;
const reply=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
/** Owner-only bounded technical coverage scan of one completed immutable private import.
 * No raw records, prices, IDs, public admission changes or archive mutations. */
export async function GET(){
 try{
  const session=await createClient();
  const {data:{user},error:authError}=await session.auth.getUser();
  if(authError||!user)return reply({error:"Sign in required"},401);
  const {data:role,error:roleError}=await session.from("user_roles").select("role").eq("user_id",user.id).maybeSingle();
  if(roleError||role?.role!=="owner")return reply({error:"Owner only"},403);
  const db=createAdminClient(),started=Date.now();
  const {data:job,error}=await db.from("awin_bulk_import_jobs").select("private_import_id,validated_total,committed_rows,completed_at")
   .eq("advertiser_id","15236").eq("feed_id","26513").eq("state","completed").order("completed_at",{ascending:false}).limit(1).maybeSingle();
  if(error||!job||!job.private_import_id)return reply({error:"Completed private snapshot unavailable"},503);
  const total=Number(job.validated_total);
  if(!Number.isSafeInteger(total)||total<1||total>100000||Number(job.committed_rows)!==total)return reply({error:"Incomplete snapshot"},409);
  let cursor="",inspected=0,sizes=0,ambiguous=0,gtins=0;
  const unique=new Set<string>();
  while(inspected<total){
   if(Date.now()-started>45000)return reply({error:"Technical scan time limit"},503);
   let query=db.from("feed_import_records").select("id,title,metadata").eq("import_id",job.private_import_id).eq("merchant_id","15236").order("id",{ascending:true}).limit(500);
   if(cursor)query=query.gt("id",cursor);
   const {data:rows,error:pageError}=await query;
   if(pageError||!rows?.length)return reply({error:"Private snapshot page unavailable"},503);
   for(const row of rows){
    if(typeof row.id!=="string"||row.id<=cursor||row.metadata?.feed_id!=="26513")return reply({error:"Snapshot identity mismatch"},409);
    cursor=row.id;
    const evidence=pneusTechnicalEvidence(row.title,row.metadata?.ean||row.metadata?.gtin);
    inspected++;
    if(evidence.size){sizes++;unique.add(evidence.size.width+"/"+evidence.size.profile+" R"+evidence.size.rim);}
    if(evidence.ambiguousSize)ambiguous++;
    if(evidence.gtinChecksumValid)gtins++;
   }
  }
  const {count,error:countError}=await db.from("feed_import_records").select("id",{count:"exact",head:true}).eq("import_id",job.private_import_id);
  if(countError||count!==total||inspected!==total)return reply({error:"Snapshot count mismatch"},409);
  return reply({inspected,explicitSizeObservations:sizes,ambiguousSizeObservations:ambiguous,distinctSizeObservations:unique.size,checksumValidGtin:gtins,completedAt:job.completed_at,privateOnly:true,fitmentVerified:false,currencyVerified:false,publicationChanged:false});
 }catch{return reply({error:"Technical evidence unavailable"},503);}
}
