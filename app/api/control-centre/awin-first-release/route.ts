import {NextRequest,NextResponse} from "next/server";
import {createClient} from "../../../../lib/supabase/server";
import {createAdminClient} from "../../../../lib/supabase/admin";
import {evaluateSourceControls,sourceEvidenceFailures} from "../../../../lib/pipeline/source-readiness";
import {ownAffiliateLink} from "../../../../lib/awin/approved-offer-renewal";

const respond=(body:unknown,status=200)=>NextResponse.json(body,{
 status,headers:{"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}
});
const obj=(v:unknown):Record<string,unknown>=>v&&typeof v==="object"&&!Array.isArray(v)?v as Record<string,unknown>:{};
const fresh=(v:string|null,now:number)=>Boolean(v&&Number.isFinite(Date.parse(v))&&
 Date.parse(v)<=now+300000&&Date.parse(v)>=now-48*3600_000);

/** Portfolio-wide owner visibility. Feed discovery is not equivalent to
 * permission, product ingestion or a verified customer-facing offer.
 * All accepted programmes remain visible even if no numeric Awin ID/feed exists.
 */
async function readPortfolio(db:ReturnType<typeof createAdminClient>){
 const [{data:programmes,error:programmeError},{data:feeds,error:feedError}]=await Promise.all([
  db.from("affiliate_programs").select("programme_name,external_account_id,region,metadata")
   .eq("provider","awin").eq("region","GB"),
  db.from("awin_feed_update_observations")
   .select("advertiser_id,feed_id,feed_format,listed_products,needs_private_refresh").limit(300),
 ]);
 if(programmeError||feedError)return null;
 const accepted=(programmes??[]).filter(p=>
  obj(obj(p.metadata).owner_joined_accepted_attestation).membership_status==="accepted");
 const byAdvertiser=new Map<string,{feeds:number;listed:number;needsRefresh:number}>();
 for(const f of feeds??[]){
  const current=byAdvertiser.get(f.advertiser_id)??{feeds:0,listed:0,needsRefresh:0};
  current.feeds++;
  current.listed+=Number(f.listed_products)||0;
  if(f.needs_private_refresh)current.needsRefresh++;
  byAdvertiser.set(f.advertiser_id,current);
 }
 const programmesView=accepted.map(p=>{
  const id=p.external_account_id;
  const counts=id?byAdvertiser.get(id):undefined;
  const pipeline=id==="77952"||id==="31539"||id==="736"||id==="45747"
   ?"physical_pilot":id==="12715"||id==="15236"
   ?"tyre_specific":id==="496"?"large_feed_streaming"
   :!id?"advertiser_id_missing":"feed_or_category_adapter_pending";
  return {name:p.programme_name,advertiserId:id??null,
   discoveredFeeds:counts?.feeds??0,listedRows:counts?.listed??0,
   needsPrivateRefresh:counts?.needsRefresh??0,pipeline,
   publicationState:"awaiting_current_eligible_canonical_offer"};
 });
 return {acceptedProgrammes:accepted.length,
  numericIdsMapped:programmesView.filter(p=>p.advertiserId).length,
  discoveredFeeds:programmesView.reduce((n,p)=>n+p.discoveredFeeds,0),
  programmes:programmesView};
}

/**
 * Separate owner-authenticated FIRST offer release. This endpoint never
 * activates Awin, creates products, fabricates rights or refreshes timestamps.
 * All important fields are read from Supabase, never accepted from the client.
 */
export async function POST(request:NextRequest){
 try{
  const session=await createClient();
  const {data:{user},error:authError}=await session.auth.getUser();
  if(authError||!user)return respond({error:"Sign in required"},401);
  const {data:role,error:roleError}=await session.from("user_roles")
   .select("role").eq("user_id",user.id).maybeSingle();
  if(roleError||role?.role!=="owner")return respond({error:"Owner only"},403);
  const origin=request.headers.get("origin");
  if(!origin||new URL(origin).origin!==new URL(request.url).origin)return respond({error:"Same origin required"},403);
  if(!request.headers.get("content-type")?.toLowerCase().startsWith("application/json"))
   return respond({error:"JSON required"},415);
  if(new URL(request.url).search||Number(request.headers.get("content-length")??0)>300)
   return respond({error:"Invalid request"},400);
  const input=await request.text();
  if(input.length>300)return respond({error:"Invalid request"},400);
  const data=JSON.parse(input) as Record<string,unknown>;
  const offerId=data?.offer_id;
  const action=data?.action;
  if(!data||Array.isArray(data)||Object.keys(data).some(k=>!["offer_id","action","confirm"].includes(k))||
   typeof offerId!=="string"||!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(offerId)||
   !["approve","pause"].includes(String(action))||data.confirm!==`owner-${action}-${offerId}`)
   return respond({error:"Explicit exact-offer confirmation required"},400);

  const db=createAdminClient();
  const {data:offer,error:offerError}=await db.from("offers")
   .select("id,source_id,product_id,merchant_id,price,currency,stock_status,status,affiliate_url,last_seen_at,match_confidence")
   .eq("id",offerId).maybeSingle();
  if(offerError||!offer)return respond({error:"Offer unavailable"},404);
  const [{data:source,error:sourceError},{data:merchant,error:merchantError},
         {data:score,error:scoreError},{data:published,error:publishedError}]=await Promise.all([
   db.from("sources").select("id,status,sync_enabled,credential_status,connector_key,source_type,metadata").eq("id",offer.source_id).maybeSingle(),
   db.from("merchants").select("id,metadata").eq("id",offer.merchant_id).maybeSingle(),
   db.from("deal_scores").select("score,confidence,calculated_at").eq("offer_id",offer.id).maybeSingle(),
   db.from("published_deals").select("status,product_id,current_price").eq("offer_id",offer.id).maybeSingle()
  ]);
  if(sourceError||merchantError||scoreError||publishedError||!source||source.connector_key!=="awin"||!merchant)
   return respond({error:"Awin release evidence unavailable"},409);
  const advertiserId=obj(merchant.metadata).external_id;
  if(typeof advertiserId!=="string"||!/^\d{2,12}$/.test(advertiserId))
   return respond({error:"Awin merchant identity unavailable"},409);

  if(action==="pause"){
   // A pause may always withdraw an existing offer even after price/rights expiry.
   const {error}=await db.rpc("record_awin_owner_release",{
    p_offer_id:offer.id,p_source_id:source.id,p_advertiser_id:advertiserId,
    p_status:"paused",p_actor_id:user.id,p_review_note:"Owner manual withdrawal",
    p_reviewed_price:offer.price,p_reviewed_offer_at:offer.last_seen_at,
    p_reviewed_score_at:score?.calculated_at??offer.last_seen_at
   });
   return error?respond({error:"Withdrawal could not be confirmed"},409):
    respond({status:"held",offer_id:offer.id});
  }

  const now=Date.now(),meta=obj(source.metadata);
  const [{data:programme,error:programmeError},{data:controls,error:controlError},
         {data:product,error:productError}]=await Promise.all([
   db.from("affiliate_programs").select("metadata,region").eq("provider","awin")
    .eq("external_account_id",advertiserId).eq("region","GB").maybeSingle(),
   db.from("system_controls").select("control_key,enabled")
    .in("control_key",["source_ingestion","deal_publishing","global_emergency_stop"]),
   db.from("products").select("id,status").eq("id",offer.product_id).maybeSingle()
  ]);
  const accepted=!programmeError&&programme&&
   obj(obj(programme.metadata).owner_joined_accepted_attestation).membership_status==="accepted";
  const controlsOk=!controlError&&evaluateSourceControls(controls).ingestion&&
   evaluateSourceControls(controls).publishing;
  const credentials=Boolean(process.env.AWIN_PUBLISHER_ID&&process.env.AWIN_ACCESS_TOKEN);
  const rightsOk=sourceEvidenceFailures(source,{advertiserId,connectorConfigured:credentials}).length===0;
  const match=Number(offer.match_confidence);
  const matching=Number.isFinite(match)&&(match>1?match>=85:match>=0.85);
  const offerOk=offer.status==="active"&&offer.currency==="GBP"&&
   Number(offer.price)>0&&fresh(offer.last_seen_at,now)&&
   ["in_stock","low_stock"].includes(offer.stock_status)&&
   ownAffiliateLink(offer.affiliate_url,advertiserId)&&matching;
  const scoreOk=score&&Number(score.score)>=60&&Number(score.confidence)>=55&&
   fresh(score.calculated_at,now);
  const finalOk=published?.status==="held"&&published.product_id===offer.product_id&&
   Number(published.current_price)===Number(offer.price)&&
   (product?.status==="active"||product?.status==="draft");
  if(!accepted||!controlsOk||!rightsOk||
   meta.publication_permission!=="verified"||meta.price_evidence_status!=="verified"||
   !offerOk||!scoreOk||!finalOk)
   return respond({error:"First-release gate incomplete: source, current price, stock, score, tracking or owner release candidate"},409);

  // Existing atomic SQL function rechecks price, source, score and held row
  // at write time and records owner ID plus audit. No direct REST publication.
  const {error}=await db.rpc("record_awin_owner_release",{
   p_offer_id:offer.id,p_source_id:source.id,p_advertiser_id:advertiserId,
   p_status:"approved",p_actor_id:user.id,p_review_note:"Owner first live product release",
   p_reviewed_price:offer.price,p_reviewed_offer_at:offer.last_seen_at,
   p_reviewed_score_at:score.calculated_at
  });
  return error?respond({error:"First release failed atomic evidence recheck"},409):
   respond({status:"approved",offer_id:offer.id,price_gbp:Number(offer.price)});
 }catch{return respond({error:"First-release control unavailable"},503);}
}

/** Read-only, owner-scoped live launch queue. First release still uses POST and
 * the existing atomic SQL function. Only current canonical held offers appear.
 */
export async function GET(){
 try{
  const session=await createClient();
  const {data:{user},error:authError}=await session.auth.getUser();
  if(authError||!user)return respond({error:"Sign in required"},401);
  const {data:role,error:roleError}=await session.from("user_roles")
   .select("role").eq("user_id",user.id).maybeSingle();
  if(roleError||role?.role!=="owner")return respond({error:"Owner only"},403);
  const db=createAdminClient();
  const {data:source,error:sourceError}=await db.from("sources")
   .select("id,status,sync_enabled,credential_status,metadata")
   .eq("connector_key","awin").maybeSingle();
  if(sourceError||!source)return respond({error:"Source unavailable"},503);
  const meta=obj(source.metadata);
  const {count,error:countError}=await db.from("offers")
   .select("id",{head:true,count:"exact"}).eq("source_id",source.id);
  if(countError)return respond({error:"Offer count unavailable"},503);
  const portfolio=await readPortfolio(db);
  if(source.status!=="active"||source.sync_enabled!==true||
     source.credential_status!=="ready"||meta.publication_permission!=="verified"||
     meta.price_evidence_status!=="verified")
   return respond({status:"source_not_launch_ready",totalCanonicalOffers:count??0,
    candidates:[],ownerAuthorization:obj(meta.owner_publication_authorization).status==="granted",
    readiness:{sourceStatus:source.status,syncEnabled:source.sync_enabled,
      credentialRegistry:source.credential_status,
      publicationPermission:meta.publication_permission??"pending",
      priceEvidence:meta.price_evidence_status??"pending"},
    portfolio,acceptance:"Accepted Awin membership is stored separately from release readiness",
    next:"Fresh authenticated source, merchant rights and current GBP price evidence must pass before release"});
  const {data:offers,error:offerError}=await db.from("offers")
   .select("id,title,merchant_id,price,currency,last_seen_at,stock_status,affiliate_url,match_confidence")
   .eq("source_id",source.id).eq("status","active")
   .eq("currency","GBP").order("last_seen_at",{ascending:false}).limit(50);
  if(offerError)return respond({error:"Offer review list unavailable"},503);
  const ids=(offers??[]).map(o=>o.id);
  if(!ids.length)return respond({status:"no_canonical_offers",totalCanonicalOffers:count??0,candidates:[],portfolio});
  const merchants=[...new Set((offers??[]).map(o=>o.merchant_id))];
  const [{data:held,error:heldError},{data:scores,error:scoresError},{data:merchantRows,error:merchantError},
   {data:reviews,error:reviewsError}]=await Promise.all([
   db.from("published_deals").select("offer_id,status,current_price").in("offer_id",ids),
   db.from("deal_scores").select("offer_id,score,confidence,calculated_at").in("offer_id",ids),
   db.from("merchants").select("id,name,metadata").in("id",merchants),
   db.from("awin_offer_release_reviews").select("offer_id,status").in("offer_id",ids)
  ]);
  if(heldError||scoresError||merchantError||reviewsError)
   return respond({error:"Candidate evidence unavailable"},503);
  const heldMap=new Map((held??[]).map(x=>[x.offer_id,x]));
  const scoresMap=new Map((scores??[]).map(x=>[x.offer_id,x]));
  const merchantsMap=new Map((merchantRows??[]).map(x=>[x.id,x]));
  const reviewMap=new Map((reviews??[]).map(x=>[x.offer_id,x]));
  const candidates=(offers??[]).flatMap(o=>{
   const h=heldMap.get(o.id),s=scoresMap.get(o.id),m=merchantsMap.get(o.merchant_id);
   const ad=obj(m?.metadata).external_id;
   if(!h||h.status!=="held"||!s||!m||typeof ad!=="string"||
      !/^\\d{2,12}$/.test(ad))return [];
   const now=Date.now(),match=Number(o.match_confidence);
   const valid=fresh(o.last_seen_at,now)&&fresh(s.calculated_at,now)&&
    Number(o.price)>0&&Number(h.current_price)===Number(o.price)&&
    ["in_stock","low_stock"].includes(o.stock_status)&&
    Number(s.score)>=60&&Number(s.confidence)>=55&&
    Number.isFinite(match)&&(match>1?match>=85:match>=0.85)&&
    ownAffiliateLink(o.affiliate_url,ad)&&reviewMap.get(o.id)?.status!=="approved";
   if(!valid)return [];
   return [{offerId:o.id,title:o.title,merchant:m.name,advertiserId:ad,
    priceGbp:Number(o.price),lastSeenAt:o.last_seen_at,
    score:Number(s.score),confidence:Number(s.confidence)}];
  }).slice(0,10);
  return respond({status:candidates.length?"review_ready":"no_current_eligible_offers",
   totalCanonicalOffers:count??0,candidates,portfolio,
   note:"Final POST independently rechecks accepted merchant, source rights and all immutable offer evidence"});
 }catch{return respond({error:"Owner launch queue unavailable"},503);}
}
