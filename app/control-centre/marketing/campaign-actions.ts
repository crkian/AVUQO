"use server";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {createClient} from "../../../lib/supabase/server";
import {requireControlCentreAccess} from "../../../lib/auth/requireControlCentreAccess";
import {isBrandSlug} from "../../../lib/marketing/policy";

const HOME="/control-centre/marketing";
function fail(s:string):never {throw new Error("Marketing campaigns: "+s)}
async function owner() {
 const a=await requireControlCentreAccess();
 if(a.role!=="owner")fail("Owner permission required");
 return a.user;
}
const field=(form:FormData,k:string,max=300)=>String(form.get(k)??"").trim().slice(0,max);
const dest=(tab:string,brand:string,notice:string):never=>redirect(
 HOME+"?tab="+encodeURIComponent(tab)+"&brand="+encodeURIComponent(brand)+"&notice="+notice);
export async function createHomePlacement(form:FormData) {
 const user=await owner();
 const brand="avuqo";
 const title=field(form,"title",100),summary=field(form,"summary",260);
 const cta_label=field(form,"cta_label",40),href=field(form,"href",120);
 const fact_id=field(form,"fact_id",100);
 const priority=Number(field(form,"priority",3));
 const starts=field(form,"starts_at",24),ends=field(form,"ends_at",24);
 if(title.length<8||summary.length<15||cta_label.length<4)fail("Add a useful title, summary and button");
 if(!/^\/[a-z0-9][a-z0-9/-]*$/.test(href))fail("The destination must be an internal AVUQO path");
 if(!Number.isInteger(priority)||priority<0||priority>100)fail("Invalid priority");
 if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(starts)||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(ends))fail("Enter UTC start and end dates");
 const startDate=new Date(starts+"Z"),endDate=new Date(ends+"Z");
 if(!Number.isFinite(startDate.getTime())||!Number.isFinite(endDate.getTime())||
  endDate<=startDate)fail("Campaign end must be after the start");
 const db=await createClient();
 const {data:fact,error:factError}=await db.from("marketing_facts").select("id")
  .eq("id",fact_id).eq("brand_slug",brand).eq("status","approved").maybeSingle();
 if(factError||!fact)fail("Choose an approved AVUQO brand fact");
 const {error}=await db.from("marketing_home_placements").insert({
  brand_slug:brand,title,summary,cta_label,href,fact_id,
  starts_at:startDate.toISOString(),ends_at:endDate.toISOString(),
  priority,sponsored:false,status:"draft",created_by:user.id
 });
 if(error)fail(error.message);
 revalidatePath("/");revalidatePath(HOME);
 dest("homepage",brand,"placement-draft");
}
export async function reviewHomePlacement(form:FormData) {
 const user=await owner();const id=field(form,"placement_id",100);
 const action=field(form,"decision",10);
 if(!["approve","pause","resume"].includes(action))fail("Invalid action");
 const db=await createClient();
 const {data:place,error:fetchError}=await db.from("marketing_home_placements")
  .select("id,status,fact_id,ends_at,brand_slug").eq("id",id).eq("brand_slug","avuqo").maybeSingle();
 if(fetchError||!place)fail("Unknown placement");
 let update:Record<string,unknown>={updated_at:new Date().toISOString()};
 if(action==="approve"&&place.status==="draft") {
  const {data:fact}=await db.from("marketing_facts").select("id,status,expires_at,brand_slug")
   .eq("id",place.fact_id).eq("brand_slug","avuqo").eq("status","approved").maybeSingle();
  if(!fact||(fact.expires_at&&Date.parse(fact.expires_at)<=Date.now())||
   Date.parse(place.ends_at)<=Date.now())fail("The placement or supporting fact has expired");
  update={...update,status:"approved",approved_by:user.id,approved_at:new Date().toISOString()};
 } else if(action==="pause"&&place.status==="approved"){
  update.status="paused";
 } else if(action==="resume"&&place.status==="paused"&&Date.parse(place.ends_at)>Date.now()){
  update.status="approved";
 } else fail("Placement is not eligible for this action");
 const {data,error}=await db.from("marketing_home_placements").update(update)
  .eq("id",id).eq("status",place.status).eq("brand_slug","avuqo").select("id");
 if(error||!data?.length)fail(error?.message??"Could not update placement");
 revalidatePath("/");revalidatePath(HOME);
 dest("homepage","avuqo","placement-updated");
}
export async function saveEditorialRule(form:FormData) {
 const user=await owner();
 const brand=field(form,"brand",60),platform=field(form,"platform",20);
 const cadence_days=Number(field(form,"cadence_days",2));
 const enabled=field(form,"enabled",5)==="yes";
 if(!isBrandSlug(brand)||!["facebook","instagram"].includes(platform))fail("Invalid brand or channel");
 if(!Number.isInteger(cadence_days)||cadence_days<2||cadence_days>14)fail("Cadence must be 2 to 14 days");
 const db=await createClient();
 const {error}=await db.from("marketing_automation_rules").upsert({
   brand_slug:brand,platform,cadence_days,enabled,created_by:user.id,
   next_run_at:new Date(Date.now()+86400000).toISOString(),
   updated_at:new Date().toISOString()
 },{onConflict:"brand_slug,platform"});
 if(error)fail(error.message);
 revalidatePath(HOME);dest("automation",brand,"rule-saved");
}
