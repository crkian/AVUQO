export type PromotionPlatform = "pinterest" | "instagram" | "facebook" | "tiktok" | "x" | "email";
export type PromotionTier = "priority" | "strong" | "test" | "hold" | "blocked";

export interface PromotionCandidateInput {
  avuqoScore: number;
  confidence: number;
  channelFit: number;
  seasonalRelevance: number;
  demandSignal: number;
  merchantReliability: number;
  availability: number;
  historicalPerformance: number;
  affiliateEligible: boolean;
  complianceClear: boolean;
}

export interface PromotionEvaluation {
  eligible: boolean;
  promotionScore: number;
  tier: PromotionTier;
  reasons: string[];
  blockers: string[];
}

export interface PromotionOpportunity {
  id: string;
  title: string;
  category: string;
  merchant: string;
  platform: PromotionPlatform;
  avuqoScore: number;
  confidence: number;
  promotionScore: number;
  tier: PromotionTier;
  status: "candidate" | "review" | "approved" | "scheduled" | "published" | "paused";
  destination: "avuqo" | "merchant";
  estimatedCommissionRate?: number;
  reason: string;
}
