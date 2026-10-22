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
  await requireControlCentreAccess();
  const supabase = await createClient();
  await supabase
    .from("sources")
    .update({
      status,
      sync_enabled: status === "active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  revalidatePath("/control-centre/sources");
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
