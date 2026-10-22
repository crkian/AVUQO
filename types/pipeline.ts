export type PipelineConnectorKey = "demo" | "awin";

export type RawSourceOffer = {
  sourceRecordId: string;
  merchantName: string;
  merchantExternalId?: string | null;
  title: string;
  description?: string | null;
  category?: string | null;
  brand?: string | null;
  model?: string | null;
  gtin?: string | null;
  ean?: string | null;
  upc?: string | null;
  mpn?: string | null;
  price: number;
  currency: string;
  previousPrice?: number | null;
  rrp?: number | null;
  deliveryCost?: number | null;
  affiliateUrl?: string | null;
  sourceUrl?: string | null;
  imageUrl?: string | null;
  stockStatus?: string | null;
  stockQuantity?: number | null;
  validFrom?: string | null;
  validUntil?: string | null;
  raw: Record<string, unknown>;
};

export type NormalizedOffer = RawSourceOffer & {
  canonicalKey: string;
  categorySlug: string;
  merchantSlug: string;
  totalPrice: number;
  normalizedStockStatus: "in_stock" | "low_stock" | "out_of_stock" | "unknown";
  identifiers: Array<{
    type: "gtin" | "ean" | "upc" | "mpn";
    value: string;
  }>;
};

export type PipelineScoreComponent = {
  key:
    | "historical_normal_price"
    | "competitor_comparison"
    | "historical_low"
    | "genuine_saving"
    | "merchant_quality"
    | "delivery_inclusions"
    | "evidence_confidence";
  score: number;
  weight: number;
  evidence: Record<string, unknown>;
};

export type PipelineScore = {
  score: number;
  confidence: number;
  label: "Exceptional" | "Excellent" | "Good" | "Fair" | "Not really a deal";
  decision: "Buy now" | "Worth considering" | "Watch" | "Wait";
  components: PipelineScoreComponent[];
  explanation: Record<string, unknown>;
};

export type PipelineRunSummary = {
  runId: string;
  sourceKey: PipelineConnectorKey;
  seen: number;
  accepted: number;
  rejected: number;
  productsCreated: number;
  offersUpserted: number;
  pricePointsRecorded: number;
  scoresCalculated: number;
  promotionCandidates: number;
  status: "completed" | "failed";
  error?: string;
};
