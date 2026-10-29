"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireControlCentreAccess } from "../../../lib/auth/requireControlCentreAccess";
import { createClient } from "../../../lib/supabase/server";
import { evergreenCaption, isBrandSlug, reviewDraft } from "../../../lib/marketing/policy";

const HOME = "/control-centre/marketing";
const value = (form: FormData, field: string, max = 2500) =>
  String(form.get(field) ?? "").trim().slice(0, max);
const fail = (message: string): never => { throw new Error("Marketing: " + message); };
const done = (tab: string, brand: string, notice: string): never =>
  redirect(HOME + "?tab=" + encodeURIComponent(tab) + "&brand=" + encodeURIComponent(brand) + "&notice=" + notice);

function brandFrom(form: FormData): string {
  const brand = value(form, "brand", 60);
  if (!isBrandSlug(brand)) fail("Unknown brand.");
  return brand;
}

export async function updateMarketingBrand(form: FormData) {
  const { role } = await requireControlCentreAccess();
  if (role !== "owner") fail("Only the owner can change brand settings.");
  const brand = brandFrom(form);
  const tone = value(form, "tone", 350);
  const audience = value(form, "audience", 350);
  const website = value(form, "website_url", 350);
  if (website && (!website.startsWith("https://") || !URL.canParse(website))) fail("Enter an HTTPS website URL.");
  const db = await createClient();
  const { error } = await db.from("marketing_brands").update({
    tone, audience, website_url: website || null, updated_at: new Date().toISOString()
  }).eq("slug", brand);
  if (error) fail(error.message);
  revalidatePath(HOME);
  done("brands", brand, "brand-saved");
}

export async function addMarketingFact(form: FormData) {
  const { user } = await requireControlCentreAccess();
  const brand = brandFrom(form);
  const claim = value(form, "claim", 500);
  const source_note = value(form, "source_note", 300);
  if (claim.length < 12 || source_note.length < 5) fail("Add a meaningful fact and explain how it was verified.");
  const db = await createClient();
  const { error } = await db.from("marketing_facts").insert({
    brand_slug: brand, claim, source_note, status: "draft", created_by: user.id
  });
  if (error) fail(error.message);
  revalidatePath(HOME);
  done("facts", brand, "fact-added");
}

export async function approveMarketingFact(form: FormData) {
  const { role, user } = await requireControlCentreAccess();
  if (role !== "owner") fail("Only the owner can approve a fact.");
  const brand = brandFrom(form);
  const id = value(form, "id", 100);
  const db = await createClient();
  const { data, error } = await db.from("marketing_facts")
    .update({ status: "approved", approved_by: user.id, approved_at: new Date().toISOString() })
    .eq("id", id).eq("brand_slug", brand).eq("status", "draft").select("id");
  if (error || !data?.length) fail(error?.message ?? "The fact is missing or already reviewed.");
  revalidatePath(HOME);
  done("facts", brand, "fact-approved");
}

export async function addMarketingDraft(form: FormData) {
  const { user } = await requireControlCentreAccess();
  const brand = brandFrom(form);
  const kind = value(form, "kind", 30);
  const platform = value(form, "platform", 30);
  const caption = value(form, "caption", 2500);
  const date = value(form, "planned_date", 10);
  const fact_id = value(form, "fact_id", 60) || null;
  if (!["social", "website_article"].includes(kind)) fail("Choose a valid content type.");
  if (!["facebook", "instagram", "website"].includes(platform)) fail("Choose a valid destination.");
  if ((kind === "website_article") !== (platform === "website")) fail("Destination does not match content type.");
  if (caption.length < 12) fail("Write at least 12 characters.");
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) fail("Invalid planned date.");
  const db = await createClient();
  if (fact_id) {
    const { data: fact, error: factError } = await db.from("marketing_facts")
      .select("id").eq("id", fact_id).eq("brand_slug", brand).eq("status", "approved").maybeSingle();
    if (factError || !fact) fail("Choose an approved fact belonging to this brand.");
  }
  const { error } = await db.from("marketing_posts").insert({
    brand_slug: brand, kind, platform, caption, source_fact_id: fact_id,
    planned_date: date || null, status: "draft", created_by: user.id
  });
  if (error) fail(error.message);
  revalidatePath(HOME);
  done(kind === "website_article" ? "website" : "studio", brand, "draft-saved");
}

export async function draftFromApprovedFact(form: FormData) {
  const { user } = await requireControlCentreAccess();
  const brand = brandFrom(form);
  const id = value(form, "id", 100);
  const platform = value(form, "platform", 20);
  if (!["facebook", "instagram"].includes(platform)) fail("Choose a social channel.");
  const db = await createClient();
  const [{ data: fact }, { data: profile }] = await Promise.all([
    db.from("marketing_facts").select("id,claim,expires_at").eq("id", id)
      .eq("brand_slug", brand).eq("status", "approved").maybeSingle(),
    db.from("marketing_brands").select("name").eq("slug", brand).single()
  ]);
  if (!fact || !profile || (fact.expires_at && Date.parse(fact.expires_at) <= Date.now())) {
    fail("The supporting fact is unavailable or expired.");
  }
  const caption = evergreenCaption(fact, profile.name);
  const { error } = await db.from("marketing_posts").insert({
    brand_slug: brand, kind: "social", platform, caption,
    source_fact_id: fact.id, status: "draft", created_by: user.id
  });
  if (error) fail(error.message);
  revalidatePath(HOME);
  done("studio", brand, "draft-saved");
}

export async function editMarketingDraft(form: FormData) {
  await requireControlCentreAccess();
  const brand = brandFrom(form);
  const id = value(form, "id", 100);
  const caption = value(form, "caption", 2500);
  const date = value(form, "planned_date", 10);
  if (caption.length < 12) fail("Write at least 12 characters.");
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) fail("Invalid planned date.");
  const db = await createClient();
  const { data, error } = await db.from("marketing_posts").update({
    caption, planned_date: date || null, updated_at: new Date().toISOString()
  }).eq("id", id).eq("brand_slug", brand).eq("status", "draft").select("id");
  if (error || !data?.length) fail(error?.message ?? "Only drafts can be edited.");
  revalidatePath(HOME);
  done("studio", brand, "draft-saved");
}

export async function approveMarketingPost(form: FormData) {
  const { role, user } = await requireControlCentreAccess();
  if (role !== "owner") fail("Only the owner can approve a post.");
  const brand = brandFrom(form);
  const id = value(form, "id", 100);
  const db = await createClient();
  const { data: post } = await db.from("marketing_posts")
    .select("id,brand_slug,kind,platform,caption,source_fact_id,created_at")
    .eq("id", id).eq("brand_slug", brand).eq("status", "draft").maybeSingle();
  if (!post) fail("Draft not found.");
  const [factResult, recentResult] = await Promise.all([
    post.source_fact_id
      ? db.from("marketing_facts").select("id,brand_slug,claim,status,expires_at")
          .eq("id", post.source_fact_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    db.from("marketing_posts").select("caption").eq("brand_slug", brand)
      .neq("id", id).gte("created_at", new Date(Date.now() - 28 * 86400000).toISOString())
      .limit(300)
  ]);
  if (factResult.error || recentResult.error) fail("Unable to verify supporting evidence.");
  const decision = reviewDraft(post, factResult.data,
    (recentResult.data ?? []).map(item => item.caption));
  if (!decision.ok) fail(decision.reasons.join("; "));
  const { data, error } = await db.from("marketing_posts")
    .update({ status: "approved", approved_by: user.id, approved_at: new Date().toISOString() })
    .eq("id", id).eq("brand_slug", brand).eq("status", "draft").select("id");
  if (error || !data?.length) fail(error?.message ?? "Approval was not recorded.");
  revalidatePath(HOME);
  done(post.kind === "website_article" ? "website" : "studio", brand, "post-approved");
}

export async function addMarketingChannel(form: FormData) {
  await requireControlCentreAccess();
  const brand = brandFrom(form);
  const platform = value(form, "platform", 20);
  const handle = value(form, "handle", 120);
  if (!["facebook", "instagram"].includes(platform) || handle.length < 2) fail("Enter a channel and its account label.");
  const db = await createClient();
  const { error } = await db.from("marketing_channels").insert({
    brand_slug: brand, platform, handle, connection_state: "unconnected"
  });
  if (error) fail(error.message);
  revalidatePath(HOME);
  done("channels", brand, "channel-added");
}
