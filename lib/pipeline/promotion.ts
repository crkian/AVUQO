import type { PipelineScore } from "../../types/pipeline";

const clamp = (value: number) => Math.max(0, Math.min(100, value));

const visualCategories = new Set(["home", "beauty", "fashion", "gifts", "travel"]);

export function promotionPotential(input: {
  score: PipelineScore;
  categorySlug: string;
  merchantTrust: number;
  stockStatus: string;
}) {
  const channelFit = visualCategories.has(input.categorySlug) ? 86 : 72;
  const seasonalRelevance = 55;
  const demandSignal = 55;
  const availability =
    input.stockStatus === "in_stock" ? 100 : input.stockStatus === "low_stock" ? 78 : 45;

  const promotionScore = Math.round(
    clamp(input.score.score) * 0.4 +
      clamp(input.score.confidence) * 0.2 +
      channelFit * 0.15 +
      seasonalRelevance * 0.08 +
      demandSignal * 0.07 +
      clamp(input.merchantTrust) * 0.05 +
      availability * 0.05
  );

  const tier =
    promotionScore >= 88 ? "priority" : promotionScore >= 78 ? "strong" : promotionScore >= 68 ? "test" : "hold";

  const targetChannel = visualCategories.has(input.categorySlug) ? "pinterest" : "facebook";

  return {
    promotionScore,
    tier,
    targetChannel,
    channelFit,
    seasonalRelevance,
    demandSignal,
    availability,
  };
}
