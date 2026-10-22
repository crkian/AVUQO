import type { RawSourceOffer } from "../../types/pipeline";
import type { SourceConnector } from "./types";

const value = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const candidate = record[key];
    if (candidate !== undefined && candidate !== null && String(candidate).trim() !== "") {
      return candidate;
    }
  }
  return null;
};

const text = (record: Record<string, unknown>, keys: string[]) => {
  const candidate = value(record, keys);
  return candidate === null ? null : String(candidate).trim();
};

const money = (record: Record<string, unknown>, keys: string[]) => {
  const candidate = value(record, keys);
  if (candidate === null) return null;
  if (typeof candidate === "number") return Number.isFinite(candidate) ? candidate : null;
  if (typeof candidate === "object") {
    const object = candidate as Record<string, unknown>;
    const nested = object.value ?? object.amount ?? object.price;
    if (typeof nested === "number") return Number.isFinite(nested) ? nested : null;
    if (nested !== undefined && nested !== null) {
      const parsed = Number(String(nested).replace(/[^0-9.-]/g, ""));
      return Number.isFinite(parsed) ? parsed : null;
    }
  }
  const parsed = Number(String(candidate).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
};

const integer = (record: Record<string, unknown>, keys: string[]) => {
  const candidate = value(record, keys);
  if (candidate === null) return null;
  const parsed = Number.parseInt(String(candidate), 10);
  return Number.isFinite(parsed) ? parsed : null;
};

function normalizeAvailability(input: string | null) {
  const normalized = (input ?? "").toLowerCase().replace(/[\s-]+/g, "_");
  if (["in_stock", "instock", "available", "yes", "true"].includes(normalized)) return "in_stock";
  if (["low_stock", "limited", "limited_availability"].includes(normalized)) return "low_stock";
  if (["out_of_stock", "outofstock", "unavailable", "no", "false"].includes(normalized)) return "out_of_stock";
  return "unknown";
}

function toOffer(record: Record<string, unknown>, lineNumber: number): RawSourceOffer | null {
  const title = text(record, ["title", "product_name", "name"]);
  const price = money(record, ["sale_price", "price", "search_price", "store_price"]);
  const sourceRecordId = text(record, ["id", "offer_id", "aw_product_id", "merchant_product_id", "item_group_id"]);

  if (!title || price === null || price < 0 || !sourceRecordId) return null;

  const merchantName =
    text(record, ["merchant_name", "advertiser_name", "seller_name"]) ??
    process.env.AWIN_ADVERTISER_NAME ??
    `Awin advertiser ${process.env.AWIN_ADVERTISER_ID ?? "unknown"}`;

  return {
    sourceRecordId,
    merchantName,
    merchantExternalId: text(record, ["merchant_id", "advertiser_id"]) ?? process.env.AWIN_ADVERTISER_ID ?? null,
    title,
    description: text(record, ["description", "product_description", "product_short_description"]),
    category: text(record, ["product_type", "merchant_category", "category_name", "google_product_category"]),
    brand: text(record, ["brand", "brand_name"]),
    model: text(record, ["model", "product_model", "model_number"]),
    gtin: text(record, ["gtin", "product_GTIN", "product_gtin"]),
    ean: text(record, ["ean"]),
    upc: text(record, ["upc"]),
    mpn: text(record, ["mpn"]),
    price,
    currency: text(record, ["currency", "price_currency"]) ?? "GBP",
    previousPrice: money(record, ["product_price_old", "old_price", "previous_price"]),
    rrp: money(record, ["rrp_price", "rrp", "list_price"]),
    deliveryCost: money(record, ["delivery_cost", "shipping", "shipping_price"]),
    affiliateUrl: text(record, ["aw_deep_link", "affiliate_url", "tracking_url", "link"]),
    sourceUrl: text(record, ["merchant_deep_link", "source_url", "product_url", "link"]),
    imageUrl: text(record, ["image_link", "merchant_image_url", "aw_image_url", "large_image"]),
    stockStatus: normalizeAvailability(text(record, ["availability", "stock_status", "in_stock"])),
    stockQuantity: integer(record, ["stock_quantity", "number_available"]),
    validFrom: text(record, ["valid_from"]),
    validUntil: text(record, ["valid_to", "valid_until"]),
    raw: { ...record, _avuqo_line: lineNumber },
  };
}

async function readJsonLines(response: Response, limit: number) {
  if (!response.body) return [] as RawSourceOffer[];

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const results: RawSourceOffer[] = [];
  let buffer = "";
  let lineNumber = 0;

  while (results.length < limit) {
    const { value: chunk, done } = await reader.read();
    buffer += decoder.decode(chunk, { stream: !done });

    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.trim()) continue;
      lineNumber += 1;
      try {
        const record = JSON.parse(line) as Record<string, unknown>;
        const offer = toOffer(record, lineNumber);
        if (offer) results.push(offer);
      } catch {
        // Bad source records are handled by the ingestion layer as rejected rows.
      }
      if (results.length >= limit) break;
    }

    if (done) break;
  }

  if (results.length < limit && buffer.trim()) {
    lineNumber += 1;
    try {
      const record = JSON.parse(buffer) as Record<string, unknown>;
      const offer = toOffer(record, lineNumber);
      if (offer) results.push(offer);
    } catch {
      // Ignore a truncated final line.
    }
  }

  try {
    await reader.cancel();
  } catch {
    // Nothing to do.
  }

  return results.slice(0, limit);
}

export const awinConnector: SourceConnector = {
  key: "awin",
  displayName: "Awin Enhanced Feed",
  configured() {
    return Boolean(
      process.env.AWIN_PUBLISHER_ID &&
      process.env.AWIN_ADVERTISER_ID &&
      process.env.AWIN_ACCESS_TOKEN
    );
  },
  async fetchOffers({ limit }) {
    const publisherId = process.env.AWIN_PUBLISHER_ID;
    const advertiserId = process.env.AWIN_ADVERTISER_ID;
    const token = process.env.AWIN_ACCESS_TOKEN;
    const locale = process.env.AWIN_LOCALE || "en_GB";

    if (!publisherId || !advertiserId || !token) {
      throw new Error(
        "Awin is not configured. Set AWIN_PUBLISHER_ID, AWIN_ADVERTISER_ID and AWIN_ACCESS_TOKEN."
      );
    }

    const endpoint = new URL(
      `https://api.awin.com/publishers/${encodeURIComponent(publisherId)}/awinfeeds/download/${encodeURIComponent(advertiserId)}-retail-${encodeURIComponent(locale)}.jsonl`
    );

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/x-ndjson, application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(25_000),
    });

    if (!response.ok) {
      const body = (await response.text()).slice(0, 500);
      throw new Error(`Awin feed request failed (${response.status}): ${body || response.statusText}`);
    }

    return readJsonLines(response, Math.max(1, Math.min(limit, 250)));
  },
};
