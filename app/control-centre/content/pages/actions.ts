"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireControlCentreAccess } from "../../../../lib/auth/requireControlCentreAccess";
import { createClient } from "../../../../lib/supabase/server";
import { DEFAULT_EDITORIAL, parseEditorial, type EditorialKey } from "../../../../lib/content/editorial";
const valid=(v:string):v is EditorialKey=>Object.prototype.hasOwnProperty.call(DEFAULT_EDITORIAL,v);
export async function saveEditorial(form:FormData){
 const {user}=await requireControlCentreAccess();const key=String(form.get("key")??"");if(!valid(key))throw Error("Invalid page");
 const payload=parseEditorial(Object.fromEntries(["eyebrow","headline","description","seoTitle","seoDescription"].map(k=>[k,String(form.get(k)??"")])));
 const db=await createClient();const {error}=await db.from("editorial_drafts").upsert({key,payload,updated_by:user.id,updated_at:new Date().toISOString()});
 if(error)throw Error("Could not save draft. Check migration and role permissions.");
 revalidatePath("/control-centre/content/pages");redirect(`/control-centre/content/pages?page=${key}&saved=1`);
}
export async function publishEditorial(form:FormData){
 const {role}=await requireControlCentreAccess();if(role!=="owner")throw Error("Only owner may publish");
 const key=String(form.get("key")??"");if(!valid(key))throw Error("Invalid page");
 const db=await createClient();const {data:draft,error:draftError}=await db.from("editorial_drafts").select("payload").eq("key",key).single();
 if(draftError||!draft)throw Error("Save a draft first");parseEditorial(draft.payload);
 const {error}=await db.rpc("publish_editorial",{p_key:key});if(error)throw Error(`Publish failed: ${error.message}`);
 revalidatePath(key==="home"?"/":`/${key}`);
 revalidatePath("/control-centre/content/pages");redirect(`/control-centre/content/pages?page=${key}&published=1`);
}
