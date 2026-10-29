"use server";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {requireControlCentreAccess} from "../../../../lib/auth/requireControlCentreAccess";
import {createClient} from "../../../../lib/supabase/server";
import {DEFAULT_NAVIGATION,isValidNavigation,type NavigationContent} from "../../../../lib/content/navigation";
const PATH="/control-centre/content/navigation";
const formText=(form:FormData,key:string,max:number)=>String(form.get(key)??"").trim().slice(0,max);
function formOrder(form:FormData,key:string,limit:number):number {
 const raw=formText(form,key,4),n=Number(raw);
 if(!/^\d{1,2}$/.test(raw)||!Number.isInteger(n)||n<0||n>limit)throw Error("Order must be a whole number from 0 to "+limit);
 return n;
}
function readNavigationForm(form:FormData):NavigationContent {
 const groups=DEFAULT_NAVIGATION.groups.map(g=>{
  const locked=["discover","deals","compare","groceries","categories"].includes(g.id);
  return {
   ...g,label:formText(form,"g_"+g.id+"_label",36),
   intro:formText(form,"g_"+g.id+"_intro",110),
   order:formOrder(form,"g_"+g.id+"_order",50),
   enabled:locked||form.get("g_"+g.id+"_enabled")==="yes",
   links:g.links.map((link,j)=>({
    ...link,label:formText(form,"l_"+g.id+"_"+j+"_label",45),
    description:formText(form,"l_"+g.id+"_"+j+"_description",130),
    order:formOrder(form,"l_"+g.id+"_"+j+"_order",70),
    enabled:form.get("l_"+g.id+"_"+j+"_enabled")==="yes"
   }))
  };
 });
 const result:NavigationContent={schemaVersion:2,groups};
 if(!isValidNavigation(result))throw Error("Invalid navigation: check labels, visibility and ordering");
 return result;
}
export async function saveNavigationDraft(form:FormData) {
 const {user}=await requireControlCentreAccess();
 const payload=readNavigationForm(form);
 const db=await createClient();
 const {error}=await db.from("site_content_drafts").upsert({
  key:"navigation",payload,updated_by:user.id,updated_at:new Date().toISOString()
 });
 if(error)throw Error("Could not save menu draft. Check content migration and permissions.");
 revalidatePath(PATH);
 redirect(PATH+"?saved=1");
}
async function publishPayload(payload:unknown,userId:string) {
 if(!isValidNavigation(payload))throw Error("Menu data did not pass route whitelist validation");
 const db=await createClient();
 const {data:published,error:readError}=await db.from("site_content_published")
   .select("version").eq("key","navigation").maybeSingle();
 if(readError)throw Error("Could not read published menu version");
 const version=(published?.version??0)+1;
 const {error}=await db.from("site_content_published").upsert({
   key:"navigation",payload,version,published_by:userId,published_at:new Date().toISOString()
 });
 if(error)throw Error("Could not publish menu.");
 const {error:historyError}=await db.from("site_content_revisions").insert({
   key:"navigation",payload,version,published_by:userId
 });
 if(historyError)throw Error("Menu published but history recording failed. Inspect database before trying again.");
 revalidatePath("/", "layout");
 revalidatePath(PATH);
 return version;
}
export async function publishNavigation() {
 const {user,role}=await requireControlCentreAccess();
 if(role!=="owner")throw Error("Only the owner may publish navigation");
 const db=await createClient();
 const {data,error}=await db.from("site_content_drafts").select("payload")
  .eq("key","navigation").maybeSingle();
 if(error||!data)throw Error("Save a menu draft first");
 await publishPayload(data.payload,user.id);
 redirect(PATH+"?published=1");
}
export async function restoreNavigation(form:FormData){
 const {user,role}=await requireControlCentreAccess();
 if(role!=="owner")throw Error("Only the owner may restore a menu");
 const requested=Number(String(form.get("version")??""));
 if(!Number.isInteger(requested)||requested<1)throw Error("Invalid revision");
 const db=await createClient();
 const {data,error}=await db.from("site_content_revisions").select("payload")
  .eq("key","navigation").eq("version",requested).maybeSingle();
 if(error||!data)throw Error("Selected revision not found");
 await publishPayload(data.payload,user.id);
 redirect(PATH+"?restored=1");
}
