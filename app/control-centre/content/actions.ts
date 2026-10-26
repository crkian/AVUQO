"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireControlCentreAccess } from "../../../lib/auth/requireControlCentreAccess";
import { createClient } from "../../../lib/supabase/server";
import { DEFAULT_FOOTER, parseFooter } from "../../../lib/content/footer";

function readFooter(form: FormData) {
  const groups = DEFAULT_FOOTER.groups.map((group, i) => ({
    heading: group.heading,
    links: group.links.map((link, j) => ({ label: String(form.get(`label_${i}_${j}`) ?? link.label), href: link.href })),
  }));
  const payload = {
    motto: String(form.get("motto") ?? "").trim(),
    description: String(form.get("description") ?? "").trim(),
    disclosure: String(form.get("disclosure") ?? "").trim(),
    groups,
  };
  if (JSON.stringify(parseFooter(payload)) !== JSON.stringify(payload)) throw new Error("Invalid footer content");
  if (!payload.motto || !payload.description || !payload.disclosure) throw new Error("All footer text fields are required");
  return payload;
}

export async function saveFooterDraft(form: FormData) {
  const { user } = await requireControlCentreAccess();
  const payload = readFooter(form);
  const db = await createClient();
  const { error } = await db.from("site_content_drafts").upsert({ key: "footer", payload, updated_by: user.id, updated_at: new Date().toISOString() });
  if (error) throw new Error("Could not save draft. Check the content SQL migration and your access permissions.");
  revalidatePath("/control-centre/content");
  redirect("/control-centre/content?saved=1");
}

export async function publishFooter() {
  const { user, role } = await requireControlCentreAccess();
  if (role !== "owner") throw new Error("Only the owner may publish public website content.");
  const db = await createClient();
  const { data: draft, error: draftError } = await db.from("site_content_drafts").select("payload").eq("key", "footer").single();
  if (draftError || !draft) throw new Error("Save a draft first.");
  const payload = parseFooter(draft.payload);
  if (JSON.stringify(payload) !== JSON.stringify(draft.payload)) throw new Error("Invalid draft.");
  // Public render is always from published data, never the draft.
  const { data: current } = await db.from("site_content_published").select("version").eq("key", "footer").maybeSingle();
  const version = (current?.version ?? 0) + 1;
  const { error } = await db.from("site_content_published").upsert({ key: "footer", payload, version, published_by: user.id, published_at: new Date().toISOString() });
  if (error) throw new Error("Publishing failed. No success recorded.");
  const { error: revError } = await db.from("site_content_revisions").insert({ key: "footer", payload, version, published_by: user.id });
  if (revError) throw new Error("Published, but revision logging failed. Check the database before publishing again.");
  revalidatePath("/", "layout");
  revalidatePath("/control-centre/content");
  redirect("/control-centre/content?published=1");
}
