import {NextResponse} from "next/server";
import {createClient} from "../../../../lib/supabase/server";
import {createAdminClient} from "../../../../lib/supabase/admin";
import {fetchAwinLiveFeedInventory} from "../../../../lib/awin/live-feed-inventory";

/** Owner-only live feed discovery, never a data import or rights approval. */
export async function POST(){
 const db=await createClient();
 const {data:{user},error}=await db.auth.getUser();
 if(error||!user)return NextResponse.json({error:"Sign in required"},{status:401,headers:{"Cache-Control":"private, no-store"}});
 const {data:role,error:roleError}=await db.from("user_roles")
  .select("role").eq("user_id",user.id).maybeSingle();
 if(roleError||role?.role!=="owner")
  return NextResponse.json({error:"Owner access required"},{status:403,headers:{"Cache-Control":"private, no-store"}});
 const admin=createAdminClient();
 const {data:source,error:sourceError}=await admin.from("sources")
  .select("metadata").eq("connector_key","awin").maybeSingle();
 if(sourceError||!source)
  return NextResponse.json({error:"Awin registry unavailable"},{status:503,headers:{"Cache-Control":"private, no-store"}});
 const entries=source.metadata&&typeof source.metadata==="object"&&!Array.isArray(source.metadata)?
  (source.metadata as {awin_advertisers?:unknown}).awin_advertisers:undefined;
 const joinedIds=new Set<string>();
 if(Array.isArray(entries))for(const entry of entries){
  if(entry&&typeof entry==="object"&&!Array.isArray(entry)){
   const e=entry as Record<string,unknown>;
   if(typeof e.advertiser_id==="string"&&/^\d{2,12}$/.test(e.advertiser_id)&&
      e.joined_programme_observed===true)joinedIds.add(e.advertiser_id);
  }
 }
 if(!joinedIds.size)return NextResponse.json({error:"No verified joined advertiser registry"},
  {status:503,headers:{"Cache-Control":"private, no-store"}});
 try{
  const result=await fetchAwinLiveFeedInventory(joinedIds);
  return NextResponse.json(result,{headers:{"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
 }catch{
  // Credential-bearing URL must never appear in errors or logs.
  return NextResponse.json({error:"Awin feed-list discovery could not be verified. Check datafeed key and publisher configuration."},
    {status:503,headers:{"Cache-Control":"private, no-store"}});
 }
}
