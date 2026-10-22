export type DealRating = "exceptional" | "excellent" | "good" | "fair" | "weak";
export type DealDecision = "Buy now" | "Worth considering" | "Watch" | "Wait";

export interface Deal {
  id: string;
  title: string;
  category: string;
  currentPrice: number;
  typicalPrice: number;
  avuqoScore: number;
  confidence: number;
  rating: DealRating;
  decision: DealDecision;
  savingAmount: number;
  reason: string;
  merchant: string;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
  priceHistory: number[];
  tags: string[];
}
