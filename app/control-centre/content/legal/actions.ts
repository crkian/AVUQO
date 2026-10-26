"use server";
import { revalidatePath } from "next/cache";
import { requireControlCentreAccess } from "../../../../lib/auth/requireControlCentreAccess";
import { createClient } from "../../../../lib/supabase/server";
import { isLegalSlug, validateLegalDoc } from "../../../../lib/content/legal";
function readForm(form: FormData) {
 const slug = String(form.get("slug") || "");
 if (!isLegalSlug(slug)) throw Error("Unrecognised legal page");
 const payload = validateLegalDoc(Object.fromEntries(["title", "introduction", "body", "effectiveDate"].map(k=>[k,String(form.get(k) ?? "").trim()])));
 return { slug, payload };
}
export async function saveLegalDraft(form: FormData) {
 const {user} = await requireControlCentreAccess();
 const {slug,payload} = readForm(form);
 const db = await createClient();
 const {error} = await db.from("legal_content_drafts").upsert({slug, payload, updated_by:user.id, updated_at:new Date().toISOString()});
 if (error) throw Error("Unable to save private draft");
 revalidatePath("/control-centre/content/legal");
}
export async function publishLegal(form: FormData) {
 const {role} = await requireControlCentreAccess();
 if (role !== "owner") throw Error("Only the owner can publish legal documents");
 const slug = String(form.get("slug") || "");
 if (!isLegalSlug(slug)) throw Error("Unknown page");
 if (form.get("reviewed") !== "on") throw Error("Explicit legal review confirmation required");
 const db = await createClient();
 const {data:draft,error} = await db.from("legal_content_drafts").select("payload").eq("slug",slug).maybeSingle();
 if(error || !draft) throw Error("Save a draft before publishing");
 validateLegalDoc(draft.payload);
 const {error: publishError} = await db.rpc("publish_avuqo_legal",{p_slug:slug});
 if(publishError) throw Error("Publication failed: check Supabase migration, access permissions and revisions");
 revalidatePath(`/${slug}`);
 revalidatePath("/control-centre/content/legal");
}
