/**
 * Planning inventory only. These entries are NOT ingestion adapters, applications,
 * programme approvals, credentials or publication permissions.
 */
export type AffiliateNetworkId =
  | "awin" | "ebay" | "webgains" | "impact" | "cj"
  | "tradedoubler" | "rakuten" | "amazon";

export type AffiliateNetworkPlan = {
  id: AffiliateNetworkId;
  name: string;
  order: number;
  applicationUrl: string;
  developerUrl: string;
  sourceAliases: readonly string[];
  dataPlan: string;
  providerChecks: string;
  currentCode: "awin_adapter_exists" | "not_built";
};

export const AFFILIATE_NETWORKS: readonly AffiliateNetworkPlan[] = [
  {
    id: "awin", name: "Awin", order: 1,
    applicationUrl: "https://www.awin.com/gb",
    developerUrl: "https://www.awin.com/gb",
    sourceAliases: ["Awin", "Awin Enhanced Feed"],
    dataPlan: "Finish eligible merchant feeds, canonical matching, freshness, rights and tracking.",
    providerChecks: "Publisher access, each advertiser relationship, feed/image rights, permitted links.",
    currentCode: "awin_adapter_exists",
  },
  {
    id: "ebay", name: "eBay Partner Network", order: 2,
    applicationUrl: "https://partnernetwork.ebay.com/",
    developerUrl: "https://developer.ebay.com/api-docs/buy/api-browse.html",
    sourceAliases: ["eBay Partner Network", "eBay"],
    dataPlan: "Implement approved Browse API; preserve seller, item ID, condition, postage and expiry.",
    providerChecks: "ePN account, eBay developer application, Browse API access, campaign ID, UK marketplace permissions.",
    currentCode: "not_built",
  },
  {
    id: "webgains", name: "Webgains", order: 3,
    applicationUrl: "https://webgains.com/",
    developerUrl: "https://knowledgehub.webgains.com/home/what-api-connections-do-webgains-offer-for-publish",
    sourceAliases: ["Webgains"],
    dataPlan: "Implement authorised joined-programme, product-feed and commission reporting adapters.",
    providerChecks: "Publisher approval, joined advertisers, product feed and display permissions, API access.",
    currentCode: "not_built",
  },
  {
    id: "impact", name: "impact.com", order: 4,
    applicationUrl: "https://impact.com/",
    developerUrl: "https://integrations.impact.com/",
    sourceAliases: ["impact.com", "Impact"],
    dataPlan: "Implement partner catalogues, tracking links and permitted conversion/report imports.",
    providerChecks: "Partner account, brand contracts, catalogue rights, API credentials and tracking terms.",
    currentCode: "not_built",
  },
  {
    id: "cj", name: "CJ Affiliate", order: 5,
    applicationUrl: "https://www.cj.com/",
    developerUrl: "https://developers.cj.com/",
    sourceAliases: ["CJ Affiliate", "Commission Junction"],
    dataPlan: "Implement publisher Product Feed GraphQL, advertiser lookup and commission reporting.",
    providerChecks: "Publisher access, joined advertisers, personal access token, permitted feed scope.",
    currentCode: "not_built",
  },
  {
    id: "tradedoubler", name: "Tradedoubler", order: 6,
    applicationUrl: "https://www.tradedoubler.com/",
    developerUrl: "https://dev.tradedoubler.com/products/publisher/",
    sourceAliases: ["Tradedoubler"],
    dataPlan: "Implement authorised Products API, advertiser identifiers, expiry and attribution.",
    providerChecks: "Publisher account, advertiser connections, Products API access and content rights.",
    currentCode: "not_built",
  },
  {
    id: "rakuten", name: "Rakuten Advertising", order: 7,
    applicationUrl: "https://rakutenadvertising.com/",
    developerUrl: "https://developers.rakutenadvertising.com/",
    sourceAliases: ["Rakuten Advertising", "Rakuten"],
    dataPlan: "Implement approved product/link feeds and transaction reconciliation.",
    providerChecks: "Publisher account, advertiser memberships, product access and API tokens.",
    currentCode: "not_built",
  },
  {
    id: "amazon", name: "Amazon Associates UK", order: 8,
    applicationUrl: "https://affiliate-program.amazon.co.uk/",
    developerUrl: "https://affiliate-program.amazon.com/creatorsapi/docs/en-us/onboarding",
    sourceAliases: ["Amazon Associates UK", "Amazon Associates", "Amazon UK"],
    dataPlan: "Special-purpose Creators API adapter with marketplace, price, image, caching and display restrictions.",
    providerChecks: "UK Associates approval, separate UK API access, compliant storefront and comparison policies.",
    currentCode: "not_built",
  },
];

/**
 * Review-only checklist. It MUST NOT be used as a replacement for server-side
 * publisher, merchant, licence and public-offer permission enforcement.
 */
export const AFFILIATE_PUBLICATION_GATES = [
  "publisher_approved", "merchant_approved", "api_access_approved",
  "product_feed_rights_confirmed", "image_rights_confirmed",
  "tracking_permitted", "freshness_validated", "product_matching_reviewed",
  "server_side_approval_logged", "compliance_review_passed",
] as const;

export type AffiliatePublicationGate = (typeof AFFILIATE_PUBLICATION_GATES)[number];

export function missingAffiliateReadinessEvidence(
  evidence: Partial<Record<AffiliatePublicationGate, boolean>> = {},
): AffiliatePublicationGate[] {
  return AFFILIATE_PUBLICATION_GATES.filter((gate) => evidence[gate] !== true);
}
