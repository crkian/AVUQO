"use server";

import { requireControlCentreAccess } from "../../../lib/auth/requireControlCentreAccess";

type FoodFact = { code?: string; product_name?: string; brands?: string; quantity?: string; };
export type FoodFactsResult = {
  checkedAt: string;
  products: { barcode: string; title: string; brand: string; quantity: string }[];
  status: "ok" | "error";
  message: string;
};

/** On-demand preview only. Never persists or publishes third-party database contents. */
export async function previewOpenFoodFacts(): Promise<FoodFactsResult> {
  await requireControlCentreAccess();
  const checkedAt = new Date().toISOString();
  const endpoint = "https://world.openfoodfacts.org/api/v2/search?countries_tags_en=united-kingdom&page_size=8&sort_by=last_modified_t&fields=code,product_name,brands,quantity";
  try {
    const response = await fetch(endpoint, {
      method: "GET",
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(7000),
      headers: { "User-Agent": "AVUQO/0.8 (https://www.avuqo.com; product-data-research)" },
    });
    if (!response.ok) return { checkedAt, products: [], status: "error", message: `Source returned HTTP ${response.status}` };
    const payload = await response.json() as { products?: FoodFact[] };
    const products = (payload.products ?? []).filter(p => p.code && p.product_name).slice(0, 8).map(p => ({
      barcode: String(p.code).slice(0, 20),
      title: String(p.product_name).slice(0, 150),
      brand: String(p.brands ?? "Unknown").slice(0, 90),
      quantity: String(p.quantity ?? "Unknown").slice(0, 50),
    }));
    return { checkedAt, products, status: "ok", message: "Live product metadata received. No retailer prices, availability or publication rights verified." };
  } catch {
    return { checkedAt, products: [], status: "error", message: "The product metadata request failed or timed out." };
  }
}
