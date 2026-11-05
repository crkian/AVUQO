import {NextRequest,NextResponse} from "next/server";
import {createAdminClient} from "../../../../lib/supabase/admin";
import {joinedInSource} from "../../../../lib/awin/joined-catalogue";
import {planPrivateAwinChunks} from "../../../../lib/awin/bulk-import-plan";

const send=(value:unknown,status=200)=>NextResponse.json(value,{
 status,headers:{"Cache-Control":"private, no-store"}
});

/** Authenticated metadata-only sizing. Never fetches signed feed URLs or products. */
export async function GET(request:NextRequest){
 const secret=process.env.CRON_SECRET;
 if(!secret||secret.length<16||request.headers.get("authorization")!==`Bearer ${secret}`)
  return send({error:"Unauthorized"},401);
 const params=new URL(request.url).searchParams;
 const advertiser=params.get("advertiser_id")??"";
 const feed=params.get("feed_id")??"";
 if(!/^\d{1,9}$/.test(advertiser)||!/^\d{1,30}$/.test(feed))
  return send({error:"Invalid advertiser or feed ID"},400);
 const db=createAdminClient();
 const {data:source,error:sourceError}=await db.from("sources")
  .select("metadata,status,sync_enabled").eq("connector_key","awin").maybeSingle();
 if(sourceError||!source||!joinedInSource(source.metadata,advertiser))
  return send({error:"Advertiser is not verified as joined"},403);
 const {data:matches,error}=await db.from("awin_feed_update_observations")
  .select("advertiser_id,feed_id,advertiser_name,feed_name,listed_products,observed_at")
  .eq("advertiser_id",advertiser).eq("feed_id",feed).limit(2);
 if(error)return send({error:"Feed observation unavailable"},503);
 if(!matches||matches.length!==1)return send({error:"Feed not uniquely observed"},404);
 const observation=matches[0];
 let plan:ReturnType<typeof planPrivateAwinChunks>;
 try{plan=planPrivateAwinChunks(Number(observation.listed_products));}
 catch{return send({error:"Listed row count cannot be planned safely"},422);}
 return send({
  status:"planning_only",
  advertiser_id:advertiser,feed_id:feed,
  advertiser_name:observation.advertiser_name,
  feed_name:observation.feed_name,
  observed_at:observation.observed_at,
  source_paused:source.status==="paused"&&source.sync_enabled===false,
  ...plan
 });
}
