import { NextResponse } from "next/server";

import { runDealIntelligencePipeline } from "../../../../../lib/pipeline/run";
import { createAdminClient } from "../../../../../lib/supabase/admin";
import type { PipelineConnectorKey } from "../../../../../types/pipeline";

export const maxDuration = 60;

function authorized(request: Request) {
  const secret = process.env.AVUQO_CRON_SECRET || process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const sourceKey = body.sourceKey as PipelineConnectorKey;
  const limit = Number(body.limit ?? 100);

  if (!(["demo", "awin"] as string[]).includes(sourceKey)) {
    return NextResponse.json({ error: "Unsupported sourceKey" }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const result = await runDealIntelligencePipeline(supabase, { sourceKey, limit });
    return NextResponse.json(result, { status: result.status === "completed" ? 200 : 500 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Pipeline failure" },
      { status: 500 }
    );
  }
}
