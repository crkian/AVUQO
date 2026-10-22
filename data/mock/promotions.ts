import { PromotionOpportunity } from "../../types/promotion";

export const mockPromotionOpportunities: PromotionOpportunity[] = [
  {
    id: "promo-dyson-pinterest",
    title: "Dyson V15 Detect",
    category: "Home",
    merchant: "Demo Retailer",
    platform: "pinterest",
    avuqoScore: 96,
    confidence: 92,
    promotionScore: 91,
    tier: "priority",
    status: "review",
    destination: "avuqo",
    estimatedCommissionRate: 4,
    reason: "Strong visual fit, exceptional value and high home-interest relevance."
  },
  {
    id: "promo-tenerife-facebook",
    title: "Tenerife 7-night family holiday",
    category: "Travel",
    merchant: "Demo Travel Partner",
    platform: "facebook",
    avuqoScore: 95,
    confidence: 88,
    promotionScore: 86,
    tier: "strong",
    status: "candidate",
    destination: "avuqo",
    estimatedCommissionRate: 3,
    reason: "High-value family travel offer with strong seasonal relevance."
  },
  {
    id: "promo-beauty-pinterest",
    title: "Premium skincare gift set",
    category: "Beauty",
    merchant: "Demo Beauty Retailer",
    platform: "pinterest",
    avuqoScore: 90,
    confidence: 86,
    promotionScore: 84,
    tier: "strong",
    status: "scheduled",
    destination: "avuqo",
    estimatedCommissionRate: 6,
    reason: "Giftable visual product with strong Pinterest discovery fit."
  }
];
