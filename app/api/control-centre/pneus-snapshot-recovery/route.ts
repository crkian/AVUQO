import {NextRequest} from "next/server";
import {createClient} from "../../../../lib/supabase/server";

export const maxDuration=300;
import {recoverPneusSnapshot,recoveryResponse as response} from "../../../../lib/awin/pneus-snapshot-recovery";

/** One completed, fixed-feed snapshot per explicit owner request. Read-only
 * aggregate diagnostics, not a publisher, downloader proxy or migration.
 */
export async function POST(request:NextRequest){
 let stage="authorization";
 try{
  const session=await createClient();
  const {data:{user},error:authError}=await session.auth.getUser();
  if(authError||!user)return response({status:"sign_in_required"},401);
  const {data:role,error:roleError}=await session.from("user_roles").select("role").eq("user_id",user.id).maybeSingle();
  if(roleError||role?.role!=="owner")return response({status:"owner_required"},403);
  const url=new URL(request.url);
  if(request.headers.get("origin")!==url.origin)return response({status:"same_origin_required"},403);
  const slot=url.searchParams.get("slot");
  if((slot!=="latest"&&slot!=="previous")||Array.from(url.searchParams).length!==1)
   return response({status:"invalid_slot"},400);
  return await recoverPneusSnapshot(slot);
 }catch{return response({status:"recovery_unavailable",stage},503);}
}
