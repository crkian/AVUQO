"use server";

import { revalidatePath } from "next/cache";

import { requireControlCentreAccess } from "../../lib/auth/requireControlCentreAccess";
import { createClient } from "../../lib/supabase/server";

export async function setPromotionStatus(id: string, status: string) {
  await requireControlCentreAccess();
  const supabase = await createClient();
  await supabase.from("promotion_candidates").update({ status }).eq("id", id);
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
