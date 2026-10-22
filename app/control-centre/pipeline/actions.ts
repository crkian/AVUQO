"use server";

import { revalidatePath } from "next/cache";

import { requireControlCentreAccess } from "../../../lib/auth/requireControlCentreAccess";
import { runDealIntelligencePipeline } from "../../../lib/pipeline/run";
import { createAdminClient } from "../../../lib/supabase/admin";
import type { PipelineConnectorKey } from "../../../types/pipeline";

async function run(sourceKey: PipelineConnectorKey, limit: number) {
  await requireControlCentreAccess();

  try {
    const supabase = createAdminClient();
    await runDealIntelligencePipeline(supabase, { sourceKey, limit });
  } catch (error) {
    // Keep the admin UI usable even when server automation credentials are not ready.
    // The Control Centre page surfaces configuration readiness separately.
    console.error("AVUQO pipeline action failed", error);
  }

  revalidatePath("/control-centre/pipeline");
  revalidatePath("/control-centre");
  revalidatePath("/control-centre/sources");
  revalidatePath("/control-centre/promotions");
  revalidatePath("/live");
  revalidatePath("/discover");
}

export async function runDemoPipeline() {
  await run("demo", 20);
}

export async function runAwinPipeline() {
  await run("awin", 50);
}
