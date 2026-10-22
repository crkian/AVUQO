import type { Deal, DealRating } from "../../types/deal";

export const money = (value: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);

export function ratingLabel(rating: DealRating) {
  return {
    exceptional: "Exceptional",
    excellent: "Excellent",
    good: "Good",
    fair: "Fair",
    weak: "Not really a deal",
  }[rating];
}

export function savingPercent(deal: Deal) {
  if (!deal.typicalPrice) return 0;
  return Math.round((deal.savingAmount / deal.typicalPrice) * 100);
}

export function dealSnapshot(deal: Deal) {
  return {
    dealId: deal.id,
    title: deal.title,
    category: deal.category,
    currentPrice: deal.currentPrice,
    typicalPrice: deal.typicalPrice,
    avuqoScore: deal.avuqoScore,
    confidence: deal.confidence,
    merchant: deal.merchant,
    decision: deal.decision,
  };
}
