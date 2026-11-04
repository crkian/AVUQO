import {NextRequest,NextResponse} from "next/server";
import {createClient} from "../../../../lib/supabase/server";
import {createAdminClient} from "../../../../lib/supabase/admin";
import {inspectAwinFeedList} from "../../../../lib/awin/feed-list-audit";
export async function POST(request:NextRequest){
 const db=await createClient();
 const {data:{user},error}=await db.auth.getUser();
 if(error||!user)return NextResponse.json({error:"Sign in required"},{status:401});
 const {data:role,error:roleError}=await db.from("user_roles").select("role").eq("user_id",user.id).maybeSingle();
 if(roleError||!role||!["owner","admin"].includes(role.role))return NextResponse.json({error:"Owner/admin access required"},{status:403});
 const body=await request.formData();
 const file=body.get("file");
 if(!(file instanceof File)||!/\.csv$/i.test(file.name))return NextResponse.json({error:"Select an Awin datafeeds.csv inventory file"},{status:400});
 if(file.size>2_500_000)return NextResponse.json({error:"Feed inventory file exceeds 2.5 MB"},{status:413});
 const admin=createAdminClient();
 const {data:source,error:sourceError}=await admin.from("sources").select("metadata").eq("connector_key","awin").maybeSingle();
 if(sourceError||!source)return NextResponse.json({error:"Awin source registry unavailable"},{status:503});
 const meta=source.metadata&&typeof source.metadata==="object"&&!Array.isArray(source.metadata)?source.metadata as {awin_advertisers?:unknown}:{};
 const known=Array.isArray(meta.awin_advertisers)?meta.awin_advertisers:[];
 const joinedIds=new Set<string>();
 for(const entry of known){
  if(!entry||typeof entry!=="object"||Array.isArray(entry))continue;
  const e=entry as {advertiser_id?:unknown;joined_programme_observed?:unknown};
  if(typeof e.advertiser_id==="string"&&/^\d+$/.test(e.advertiser_id)&&e.joined_programme_observed===true)joinedIds.add(e.advertiser_id);
 }
 try{
  const result=inspectAwinFeedList(await file.text(),joinedIds);
  // No raw CSV or signed download URL is logged, stored or returned.
  return NextResponse.json(result,{headers:{"Cache-Control":"private, no-store"}});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Invalid feed inventory"},{status:400});}
}
