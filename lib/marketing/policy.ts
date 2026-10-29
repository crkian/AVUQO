export const BRAND_SLUGS = ["avuqo", "fantasy-lockr", "capshur", "cluedoku"] as const;
export type BrandSlug = typeof BRAND_SLUGS[number];
export type MarketingPlatform = "facebook" | "instagram" | "website";
export type MarketingKind = "social" | "website_article";

export function isBrandSlug(value: string): value is BrandSlug {
  return (BRAND_SLUGS as readonly string[]).includes(value);
}

export function normaliseCaption(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase("en-GB")
    .replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

/** Safe to use in UI and server actions; never grants permission to publish. */
export function reviewDraft(
  draft: {
    brand_slug: string;
    caption: string;
    source_fact_id: string | null;
    kind: string;
    platform: string;
  },
  fact: {
    id: string;
    brand_slug: string;
    claim: string;
    status: string;
    expires_at: string | null;
  } | null,
  recentCaptions: readonly string[],
  now: Date = new Date()
): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (!isBrandSlug(draft.brand_slug)) reasons.push("Unknown brand");
  if (!draft.caption.trim() || draft.caption.length > 2500) reasons.push("Caption is empty or too long");
  if (!draft.source_fact_id || !fact || fact.id !== draft.source_fact_id ||
      fact.brand_slug !== draft.brand_slug || fact.status !== "approved" || !fact.claim.trim()) {
    reasons.push("A current approved fact belonging to this brand is required");
  }
  if (fact?.expires_at && (!Number.isFinite(Date.parse(fact.expires_at)) ||
      Date.parse(fact.expires_at) <= now.getTime())) reasons.push("The supporting fact has expired");
  if (!["social", "website_article"].includes(draft.kind)) reasons.push("Unknown content type");
  if (!["facebook", "instagram", "website"].includes(draft.platform)) reasons.push("Unknown platform");
  if ((draft.kind === "website_article") !== (draft.platform === "website")) reasons.push("Content type and destination do not match");
  if (draft.brand_slug === "fantasy-lockr" &&
      /\b(gameweeks?|fixtures?|scores?|results?|kick-?offs?|deadlines?|rival)\b/i.test(draft.caption)) {
    reasons.push("Fantasy Lockr live-event and Rival claims are prohibited");
  }
  if (recentCaptions.some(value => normaliseCaption(value) === normaliseCaption(draft.caption))) {
    reasons.push("A similar caption already exists for this brand");
  }
  return { ok: reasons.length === 0, reasons };
}

export function evergreenCaption(fact: { claim: string }, brandName: string): string {
  return fact.claim.trim() + "\n\nExplore " + brandName + " to learn more.";
}
