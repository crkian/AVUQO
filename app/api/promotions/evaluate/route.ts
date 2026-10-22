import { NextResponse } from "next/server";
import { evaluatePromotion } from "../../../../lib/promotion/score";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = evaluatePromotion({
      avuqoScore: Number(body.avuqoScore ?? 0),
      confidence: Number(body.confidence ?? 0),
      channelFit: Number(body.channelFit ?? 0),
      seasonalRelevance: Number(body.seasonalRelevance ?? 0),
      demandSignal: Number(body.demandSignal ?? 0),
      merchantReliability: Number(body.merchantReliability ?? 0),
      availability: Number(body.availability ?? 0),
      historicalPerformance: Number(body.historicalPerformance ?? 0),
      affiliateEligible: Boolean(body.affiliateEligible),
      complianceClear: Boolean(body.complianceClear)
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Invalid promotion evaluation payload." }, { status: 400 });
  }
}
