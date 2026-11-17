import type { NormalizedOffer, RawSourceOffer } from "../../types/pipeline";

export function slugify(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function categorySlug(input?: string | null) {
  const value = (input ?? "").toLowerCase();
  if (/travel|holiday|hotel|flight|airport|cruise/.test(value)) return "travel";
  if (/beauty|skincare|makeup|cosmetic|fragrance/.test(value)) return "beauty";
  if (/tool|hardware|diy|power tool|hand tool|drill|saw|workshop|industrial|welding/.test(value)) return "tools";
  if (/gift|toy/.test(value)) return "gifts";
  if (/fashion|clothing|shoe|apparel|jacket|dress/.test(value)) return "fashion";
  if (/car|vehicle|motoring|tyre|automotive/.test(value)) return "motoring";
  if (/experience|ticket|theatre|attraction|event/.test(value)) return "experiences";
  if (/home|kitchen|garden|vacuum|furniture|appliance/.test(value)) return "home";
  return "tech";
}

function stockStatus(value?: string | null): NormalizedOffer["normalizedStockStatus"] {
  const normalized = (value ?? "").toLowerCase().replace(/[\s-]+/g, "_");
  if (["in_stock", "instock", "available"].includes(normalized)) return "in_stock";
  if (["low_stock", "limited", "limited_availability"].includes(normalized)) return "low_stock";
  if (["out_of_stock", "outofstock", "unavailable"].includes(normalized)) return "out_of_stock";
  return "unknown";
}

function identifier(type: "gtin" | "ean" | "upc" | "mpn", value?: string | null) {
  const cleaned = value?.trim();
  return cleaned ? { type, value: cleaned } : null;
}

export function normalizeOffer(raw: RawSourceOffer): NormalizedOffer {
  const identifiers = [
    identifier("gtin", raw.gtin),
    identifier("ean", raw.ean),
    identifier("upc", raw.upc),
    identifier("mpn", raw.mpn),
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  // Never collapse a merchant’s whole brand into one canonical product when
  // the model is missing. Brand-only Awin feeds contain many unrelated SKUs.
  // The Tooled Up feed contains many DIFFERENT physical variants with
  // identical marketing titles but distinct SKU/EAN/MPN and prices.
  // A title-based canonical key must never merge discs, sizes or pack counts.
  // Use exact advertiser + merchant SKU as the provisional product identity;
  // cross-merchant grouping can be added later using validated GTIN matches.
  const skuScopedTooledUp=raw.merchantExternalId==="496";
  const identityText=skuScopedTooledUp
    ?`${raw.title} Tooled Up SKU ${raw.sourceRecordId}`
    :raw.brand?.trim() && raw.model?.trim()
      ?`${raw.brand.trim()} ${raw.model.trim()}` : raw.title;
  const canonicalKey = slugify(identityText);
  const deliveryCost = raw.deliveryCost ?? 0;

  if (!canonicalKey) throw new Error("Unable to derive a canonical product key.");
  if (!raw.title.trim()) throw new Error("Offer title is required.");
  if (!Number.isFinite(raw.price) || raw.price < 0) throw new Error("Offer price is invalid.");

  return {
    ...raw,
    canonicalKey,
    categorySlug: categorySlug(raw.category),
    merchantSlug: slugify(raw.merchantName),
    totalPrice: Math.round((raw.price + deliveryCost) * 100) / 100,
    normalizedStockStatus: stockStatus(raw.stockStatus),
    identifiers,
  };
}
