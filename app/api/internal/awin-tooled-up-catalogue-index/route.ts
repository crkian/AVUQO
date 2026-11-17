import {NextRequest,NextResponse} from "next/server";
import {createAdminClient} from "../../../../lib/supabase/admin";
import {tooledUpPrivateAutomationAllowed} from "../../../../lib/awin/tooled-up-private-automation";
import {classifyTooledUpCategory} from "../../../../lib/awin/tooled-up-taxonomy.mjs";
import {slugify} from "../../../../lib/pipeline/normalize";
import {canonicalProductSlug} from "../../../../lib/pipeline/product-slug.mjs";

export const maxDuration=300;
const reply=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store"}});
const JOB="tooled_up_496_89987",BATCH=1800,CHUNK=180;
const merchantCategory=(v:unknown)=>typeof v==="string"?v.slice(0,200):"";
const safeImage=(v:unknown)=>typeof v==="string"&&v.length<=2048&&/^https:\/\/[^/]+\//.test(v)?v:null;

/** Index the ENTIRE historical 84k feed as PRIVATE, stable SKU-specific
 * product drafts with source taxonomy and supplied primary image.
 * NO offer, price history, availability, score or publication is created here.
 * This preserves genuine variants and makes new verified offers attach to
 * exact canonical products without assuming stale inventory remains in stock.
 */
export async function GET(request:NextRequest){
 const secret=process.env.CRON_SECRET;
 if(!secret||secret.length<16||request.headers.get("authorization")!==`Bearer ${secret}`)
  return reply({error:"Unauthorized"},401);
 if(new URL(request.url).search||Number(request.headers.get("content-length")??0)>0)
  return reply({error:"No feed, SKU, cursor or batch overrides"},400);
 const db=createAdminClient();
 if(!(await tooledUpPrivateAutomationAllowed(db)))
  return reply({status:"ingestion_or_merchant_controls_blocked",private_only:true,no_publication:true},423);
 const {data:progress,error:progressError}=await db.from("awin_private_catalogue_backfill_progress")
  .select("job_key,last_record_id,scanned,attempted_drafts,completed")
  .eq("job_key",JOB).maybeSingle();
 if(progressError)return reply({status:"private_cursor_unavailable",no_publication:true},503);
 if(progress?.completed)return reply({status:"all_historical_tooled_up_products_indexed",
  total_scanned:progress.scanned,private_only:true,no_publication:true});
 let query=db.from("feed_import_records")
  .select("id,merchant_product_id,title,brand,category,image_url,metadata")
  .eq("merchant_id","496").eq("status","review")
  .order("id",{ascending:true}).limit(BATCH);
 if(progress?.last_record_id)query=query.gt("id",progress.last_record_id);
 const {data:rows,error:rowsError}=await query;
 if(rowsError)return reply({status:"historical_inventory_read_failed",no_publication:true},503);
 if(!rows?.length){
  const {error}=await db.from("awin_private_catalogue_backfill_progress")
   .upsert({job_key:JOB,last_record_id:progress?.last_record_id??null,
    scanned:progress?.scanned??0,attempted_drafts:progress?.attempted_drafts??0,
    completed:true,updated_at:new Date().toISOString()},{onConflict:"job_key"});
  if(error)return reply({status:"cursor_completion_failed",no_publication:true},503);
  return reply({status:"all_historical_tooled_up_products_indexed",
   total_scanned:progress?.scanned??0,private_only:true,no_publication:true});
 }
 const cats=new Map<string,string>();
 for(const row of rows){
  const raw=merchantCategory(row.category);
  cats.set(classifyTooledUpCategory(raw),"");
 }
 const labels:Record<string,string>={tools:"Tools & DIY",garden:"Garden",fashion:"Fashion & Workwear",
  home:"Home",motoring:"Motoring"};
 for(const slug of cats.keys()){
  const {error}=await db.from("categories").upsert(
   {slug,name:labels[slug]??slug,is_active:true},{onConflict:"slug",ignoreDuplicates:true});
  if(error)return reply({status:"catalogue_category_write_failed",no_publication:true},503);
 }
 const {data:categoryRows,error:categoryError}=await db.from("categories")
  .select("id,slug").in("slug",[...cats.keys()]);
 if(categoryError||!categoryRows||categoryRows.length!==cats.size)
  return reply({status:"catalogue_categories_unavailable",no_publication:true},503);
 const categoryId=new Map(categoryRows.map(x=>[x.slug,x.id]));
 let attempts=0;
 for(let start=0;start<rows.length;start+=CHUNK){
  const chunk=rows.slice(start,start+CHUNK);
  const drafts=chunk.flatMap(row=>{
   const sku=typeof row.merchant_product_id==="string"?row.merchant_product_id.trim():"";
   const title=typeof row.title==="string"?row.title.trim():"";
   if(!sku||sku.length>250||!title||title.length>1200)return [];
   const rawCat=merchantCategory(row.category);
   const category=classifyTooledUpCategory(rawCat),sourceRecordId="496:"+sku;
   const key=slugify(`${title} Tooled Up SKU ${sourceRecordId}`);
   if(!key)return [];
   return [{
    slug:canonicalProductSlug(key,title),canonical_key:key,
    canonical_title:title,brand:row.brand??null,
    category_id:categoryId.get(category),primary_image_url:safeImage(row.image_url),
    product_type:"product",status:"draft",
    metadata:{created_by:"toold_up_private_catalogue_backfill",
     merchant_advertiser_id:"496",feed_id:"89987",merchant_product_id:sku,
     merchant_category:rawCat,category_classification:category,
     owner_image_permission_basis:"owner_attested_all_accepted_programmes_2026_11_17",
     historical_inventory_only:true,live_price_verified:false,
     merchant_sku_scoped_identity:true}
   }];
  });
  if(!drafts.length)continue;
  // Existing active SKU products must never be replaced with private drafts.
  // The full unique slug is a deterministic identity from canonicalKey.
  const {error:writeError}=await db.from("products")
   .upsert(drafts,{onConflict:"slug",ignoreDuplicates:true});
  if(writeError)return reply({status:"draft_batch_write_failed",attempted:attempts,
   private_only:true,no_publication:true},503);
  attempts+=drafts.length;
 }
 const last=rows[rows.length-1].id;
 const newScanned=Number(progress?.scanned??0)+rows.length;
 const newAttempted=Number(progress?.attempted_drafts??0)+attempts;
 const {error:cursorError}=await db.from("awin_private_catalogue_backfill_progress")
  .upsert({job_key:JOB,last_record_id:last,scanned:newScanned,attempted_drafts:newAttempted,
   completed:rows.length<BATCH,updated_at:new Date().toISOString()},{onConflict:"job_key"});
 if(cursorError)return reply({status:"drafts_indexed_cursor_update_failed",attempted:attempts,
  private_only:true,no_publication:true},503);
 return reply({status:rows.length<BATCH?"all_historical_tooled_up_products_indexed":"private_catalogue_batch_indexed",
  scanned_now:rows.length,attempted_drafts_now:attempts,total_scanned:newScanned,
  total_attempted_drafts:newAttempted,private_only:true,no_publication:true});
}
