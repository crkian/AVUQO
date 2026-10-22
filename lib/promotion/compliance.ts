export type PromotionComplianceInput = {
  platform: "pinterest" | "instagram" | "facebook" | "tiktok" | "x" | "email";
  affiliateProvider: string;
  destination: "avuqo" | "merchant";
  hasAffiliateDisclosure: boolean;
  priceVerified: boolean;
  availabilityVerified: boolean;
  imageUsagePermitted: boolean;
  linkUsagePermitted: boolean;
  isOriginalCreative: boolean;
  usesProviderProductContent?: boolean;
  claimsLowestPrice?: boolean;
  lowestPriceVerified?: boolean;
  claimsScarcity?: boolean;
  scarcityVerified?: boolean;
};

export function assessPromotionCompliance(input: PromotionComplianceInput) {
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (!input.hasAffiliateDisclosure) blockers.push("Affiliate/commercial disclosure is missing.");
  if (!input.priceVerified) blockers.push("Displayed price has not been verified.");
  if (!input.availabilityVerified) blockers.push("Availability has not been verified.");
  if (!input.imageUsagePermitted) blockers.push("Image usage permission has not been confirmed.");
  if (!input.linkUsagePermitted) blockers.push("Affiliate/deep-link usage is not confirmed.");
  if (input.claimsLowestPrice && !input.lowestPriceVerified) blockers.push("Lowest-price claim is not supported by verified evidence.");
  if (input.claimsScarcity && !input.scarcityVerified) blockers.push("Scarcity/urgency claim is not supported by verified evidence.");
  if (input.platform === "pinterest" && !input.isOriginalCreative) warnings.push("Pinterest affiliate content should add original value and avoid repetitive posting.");

  if (
    input.affiliateProvider.toLowerCase() === "amazon" &&
    input.usesProviderProductContent &&
    input.destination !== "merchant"
  ) {
    blockers.push("Amazon-supplied Product Advertising Content requires provider-specific destination review.");
  }

  return { clear: blockers.length === 0, blockers, warnings };
}
