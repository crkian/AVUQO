"use server";

import { revalidatePath } from "next/cache";

import { requireControlCentreAccess } from "../../lib/auth/requireControlCentreAccess";
import { createClient } from "../../lib/supabase/server";

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function setPromotionStatus(id: string, status: string) {
  const {role} = await requireControlCentreAccess();
  if (!ID.test(id) || !["approved", "paused"].includes(status)) {
    throw new Error("Invalid promotion update");
  }
  if (status === "approved" && role !== "owner") {
    throw new Error("Only the owner may approve affiliate promotions");
  }

  const db = await createClient();
  if (status === "approved") {
    const {data: candidate, error: readError} = await db.from("promotion_candidates")
      .select("id,offer_id,affiliate_program_id,affiliate_eligible,compliance_clear,promotion_tier,status")
      .eq("id",id).single();
    if (readError || !candidate) throw new Error("Promotion candidate not found");
    if (candidate.status !== "review" && candidate.status !== "paused") {
      throw new Error("Promotion is not awaiting review");
    }
    if (!candidate.affiliate_eligible || !candidate.compliance_clear ||
        !candidate.offer_id || !candidate.affiliate_program_id ||
        candidate.promotion_tier === "hold") {
      throw new Error("Promotion has not passed affiliate and compliance gates");
    }
    const {data: programme, error: programmeError} = await db.from("affiliate_programs")
      .select("id,status").eq("id",candidate.affiliate_program_id).maybeSingle();
    if (programmeError || !programme || programme.status !== "approved") {
      throw new Error("Affiliate programme approval is not verified");
    }
    // Public admission checks enforce current authorised source and offer evidence.
    const {verifiedOffers} = await import("../../lib/products/public-catalog");
    const [offer] = await verifiedOffers({offerId:candidate.offer_id,limit:1});
    if (!offer) throw new Error("Offer is not eligible for public promotion");
    const {data, error} = await db.from("promotion_candidates")
      .update({status:"approved",updated_at:new Date().toISOString()})
      .eq("id",id).in("status",["review","paused"])
      .eq("affiliate_eligible",true).eq("compliance_clear",true)
      .select("id");
    if (error || !data?.length) throw new Error("Promotion approval failed");
  } else {
    const {data,error} = await db.from("promotion_candidates")
      .update({status:"paused",updated_at:new Date().toISOString()})
      .eq("id",id).select("id");
    if (error || !data?.length) throw new Error("Promotion pause failed");
  }
  revalidatePath("/control-centre/promotions");
}

export async function setSourceStatus(id: string, status: string) {
  const { role } = await requireControlCentreAccess();
  if (!/^[0-9a-f-]{36}$/i.test(id) || !["active", "paused"].includes(status)) {
    throw new Error("Invalid source update");
  }
  const supabase = await createClient();
  if (status === "active") {
    if (role !== "owner") throw new Error("Only the owner may activate a connector");
    const { data: source, error: readError } = await supabase
      .from("sources").select("id,credential_status,status,metadata,connector_key").eq("id", id).single();
    if (readError || !source) throw new Error("Source not found");
    // Activation alone does not prove publication rights. Explicit source-specific approval required.
    const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata)
      ? source.metadata as Record<string, unknown> : {};
    if (!source.connector_key || source.connector_key === "demo" || source.credential_status !== "ready" || metadata.usage_rights_confirmed !== true || typeof metadata.rights_evidence_ref !== "string" || metadata.rights_evidence_ref.length < 5) {
      throw new Error("Confirm credentials and source-specific publishing rights before enabling ingestion");
    }
  }
  const { error } = await supabase.from("sources").update({
    status, sync_enabled: status === "active", updated_at: new Date().toISOString()
  }).eq("id", id);
  if (error) throw new Error("Unable to update source status");
  revalidatePath("/control-centre/sources");
  revalidatePath("/control-centre/source-readiness");
  revalidatePath("/control-centre/pipeline");
}

export async function resolveException(id: string) {
  await requireControlCentreAccess();
  const supabase = await createClient();
  await supabase
    .from("exceptions")
    .update({
      status: "resolved",
      resolved_at: new Date().toISOString(),
      resolution: { source: "owner-control-centre" },
    })
    .eq("id", id);
  revalidatePath("/control-centre/exceptions");
}

export async function retryAutomationJob(id: string) {
  await requireControlCentreAccess();
  const supabase = await createClient();
  await supabase
    .from("automation_jobs")
    .update({
      status: "queued",
      error_message: null,
      started_at: null,
      finished_at: null,
    })
    .eq("id", id);
  revalidatePath("/control-centre/automation");
}

export async function toggleSystemControl(key: string, enabled: boolean) {
  const { role } = await requireControlCentreAccess();
  if (key === "global_emergency_stop" && role !== "owner") return;

  const supabase = await createClient();
  await supabase
    .from("system_controls")
    .upsert(
      { control_key: key, enabled, updated_at: new Date().toISOString() },
      { onConflict: "control_key" }
    );
  revalidatePath("/control-centre/automation");
  revalidatePath("/control-centre/pipeline");
}
