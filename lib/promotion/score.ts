import { PromotionCandidateInput, PromotionEvaluation, PromotionTier } from "../../types/promotion";

const clamp = (value: number) => Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));

function tierFor(score: number, eligible: boolean): PromotionTier {
  if (!eligible) return "blocked";
  if (score >= 88) return "priority";
  if (score >= 78) return "strong";
  if (score >= 68) return "test";
  return "hold";
}

// AVUQO Promotion Score v0.1.
// Commission is deliberately excluded. Organic AVUQO Score is never modified here.
export function evaluatePromotion(input: PromotionCandidateInput): PromotionEvaluation {
  const blockers: string[] = [];
  const reasons: string[] = [];

  if (!input.affiliateEligible) blockers.push("Not affiliate eligible.");
  if (!input.complianceClear) blockers.push("Compliance validation failed.");
  if (input.avuqoScore < 75) blockers.push("AVUQO Score below promotional floor.");
  if (input.confidence < 65) blockers.push("Confidence below promotional floor.");
  if (input.availability < 40) blockers.push("Availability is too weak.");
  if (input.merchantReliability < 60) blockers.push("Merchant reliability below promotional floor.");

  const eligible = blockers.length === 0;
  const promotionScore = Math.round(
    clamp(input.avuqoScore) * 0.35 +
    clamp(input.confidence) * 0.15 +
    clamp(input.channelFit) * 0.15 +
    clamp(input.seasonalRelevance) * 0.10 +
    clamp(input.demandSignal) * 0.10 +
    clamp(input.merchantReliability) * 0.05 +
    clamp(input.availability) * 0.05 +
    clamp(input.historicalPerformance) * 0.05
  );

  if (input.avuqoScore >= 90) reasons.push("Exceptional underlying customer value.");
  if (input.channelFit >= 80) reasons.push("Strong fit for the selected channel.");
  if (input.seasonalRelevance >= 80) reasons.push("High seasonal relevance.");
  if (input.demandSignal >= 80) reasons.push("Strong current consumer-interest signal.");
  if (input.historicalPerformance >= 75) reasons.push("Comparable promotions have performed well.");

  return { eligible, promotionScore, tier: tierFor(promotionScore, eligible), reasons, blockers };
}
