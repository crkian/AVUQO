import type { PipelineScore, PipelineScoreComponent } from "../../types/pipeline";

export type ScoreEvidence = {
  currentPrice: number;
  previousPrice?: number | null;
  rrp?: number | null;
  deliveryCost: number;
  historicalPrices: number[];
  competitorPrices: number[];
  merchantTrust: number;
  matchConfidence: number;
  sourceReliability: number;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock" | "unknown";
};

const clamp = (value: number) => Math.max(0, Math.min(100, value));
const round = (value: number) => Math.round(value * 100) / 100;

function median(values: number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

function discountScore(current: number, baseline: number | null) {
  if (!baseline || baseline <= 0 || current >= baseline) return baseline ? 35 : 52;
  const pct = (baseline - current) / baseline;
  return clamp(42 + pct * 190);
}

function historicalPositionScore(current: number, low: number | null) {
  if (!low || low <= 0) return 52;
  const ratio = current / low;
  if (ratio <= 1.01) return 100;
  if (ratio <= 1.03) return 94;
  if (ratio <= 1.06) return 84;
  if (ratio <= 1.1) return 70;
  if (ratio <= 1.2) return 52;
  return 30;
}

function competitorScore(current: number, competitors: number[]) {
  const valid = competitors.filter((price) => Number.isFinite(price) && price > 0);
  if (!valid.length) return 55;
  const best = Math.min(...valid);
  if (current <= best) return 100;
  const premium = (current - best) / best;
  return clamp(100 - premium * 360);
}

function deliveryScore(current: number, delivery: number) {
  if (delivery <= 0) return 100;
  if (current <= 0) return 50;
  const pct = delivery / current;
  return clamp(92 - pct * 500);
}

function freshnessAvailability(stockStatus: ScoreEvidence["stockStatus"]) {
  if (stockStatus === "in_stock") return 100;
  if (stockStatus === "low_stock") return 78;
  if (stockStatus === "unknown") return 55;
  return 5;
}

export function calculateAvuqoScore(evidence: ScoreEvidence): PipelineScore {
  const historical = evidence.historicalPrices.filter((price) => Number.isFinite(price) && price > 0);
  const historicalMedian = median(historical);
  const historicalLow = historical.length ? Math.min(...historical) : null;
  const referenceCandidates = [evidence.previousPrice, evidence.rrp, historicalMedian]
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value) && value > 0);
  const referencePrice = referenceCandidates.length ? Math.max(...referenceCandidates) : null;

  const historyNormal = historicalMedian
    ? discountScore(evidence.currentPrice, historicalMedian)
    : discountScore(evidence.currentPrice, referencePrice);
  const market = competitorScore(evidence.currentPrice, evidence.competitorPrices);
  const lowPosition = historicalPositionScore(evidence.currentPrice, historicalLow);
  const genuineSaving = discountScore(evidence.currentPrice, referencePrice);
  const merchant = clamp(evidence.merchantTrust);
  const delivery = deliveryScore(evidence.currentPrice, evidence.deliveryCost);
  const availability = freshnessAvailability(evidence.stockStatus);

  const historyCoverage = clamp(historical.length * 12.5);
  const marketCoverage = clamp(evidence.competitorPrices.length * 35);
  const confidence = clamp(
    evidence.matchConfidence * 0.42 +
      evidence.sourceReliability * 0.24 +
      historyCoverage * 0.14 +
      marketCoverage * 0.1 +
      availability * 0.1
  );

  const components: PipelineScoreComponent[] = [
    {
      key: "historical_normal_price",
      score: round(historyNormal),
      weight: 0.25,
      evidence: { historicalMedian, observations: historical.length },
    },
    {
      key: "competitor_comparison",
      score: round(market),
      weight: 0.2,
      evidence: {
        competitorCount: evidence.competitorPrices.length,
        competitorBest: evidence.competitorPrices.length ? Math.min(...evidence.competitorPrices) : null,
      },
    },
    {
      key: "historical_low",
      score: round(lowPosition),
      weight: 0.15,
      evidence: { historicalLow },
    },
    {
      key: "genuine_saving",
      score: round(genuineSaving),
      weight: 0.15,
      evidence: {
        referencePrice,
        previousPrice: evidence.previousPrice ?? null,
        rrp: evidence.rrp ?? null,
      },
    },
    {
      key: "merchant_quality",
      score: round(merchant),
      weight: 0.1,
      evidence: { merchantTrust: evidence.merchantTrust },
    },
    {
      key: "delivery_inclusions",
      score: round(delivery),
      weight: 0.05,
      evidence: { deliveryCost: evidence.deliveryCost },
    },
    {
      key: "evidence_confidence",
      score: round(confidence),
      weight: 0.1,
      evidence: {
        matchConfidence: evidence.matchConfidence,
        sourceReliability: evidence.sourceReliability,
        historyCoverage,
        marketCoverage,
        stockStatus: evidence.stockStatus,
      },
    },
  ];

  const score = Math.round(
    components.reduce((total, component) => total + component.score * component.weight, 0)
  );

  const label: PipelineScore["label"] =
    score >= 95
      ? "Exceptional"
      : score >= 85
        ? "Excellent"
        : score >= 75
          ? "Good"
          : score >= 60
            ? "Fair"
            : "Not really a deal";

  const decision: PipelineScore["decision"] =
    score >= 90 && confidence >= 70
      ? "Buy now"
      : score >= 75
        ? "Worth considering"
        : score >= 60
          ? "Watch"
          : "Wait";

  return {
    score,
    confidence: Math.round(confidence),
    label,
    decision,
    components,
    explanation: {
      scoreVersion: "avuqo-score-v0.6",
      currentPrice: evidence.currentPrice,
      referencePrice,
      historicalMedian,
      historicalLow,
      competitorBest: evidence.competitorPrices.length
        ? Math.min(...evidence.competitorPrices)
        : null,
      historyObservations: historical.length,
      competitorCount: evidence.competitorPrices.length,
      commissionInfluence: 0,
    },
  };
}
