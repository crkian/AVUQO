/** Safe, unprivileged client list metadata. Trust the database for ownership. */
export type PlanningCollectionKind = "wishlist" | "basket";

export const COLLECTIONS = {
  wishlist: { name: "My wishlist", route: "/wishlist", description: "Products you'd like to revisit." },
  basket: { name: "My comparison basket", route: "/basket", description: "Offers you may want to buy from different retailers." },
} as const;

export type PlanningSnapshot = {
  kind: PlanningCollectionKind;
  product_slug: string;
  merchant: string | null;
  price_gbp: number | null;
  captured_at: string;
  offer_id?: string;
};

/** Only return internal product URLs. Stored URL snapshots are never trusted. */
export function safeProductUrl(value: unknown): string | null {
  if (typeof value !== "string" || !/^[a-z0-9][a-z0-9-]{2,159}$/.test(value)) return null;
  return `/products/${value}`;
}

export function isSafeSnapshot(value: unknown): value is PlanningSnapshot {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const v = value as Record<string, unknown>;
  return (v.kind === "wishlist" || v.kind === "basket") &&
    safeProductUrl(v.product_slug) !== null &&
    (v.merchant === null || typeof v.merchant === "string") &&
    (v.price_gbp === null || (typeof v.price_gbp === "number" && Number.isFinite(v.price_gbp) && v.price_gbp >= 0)) &&
    typeof v.captured_at === "string";
}

export type CollectionMailItem = { title: string; merchant: string; price: number | null; url: string };
export function basketEmailBody(items: readonly CollectionMailItem[], origin: string): string {
  const prefix = /^https:\/\/[a-z0-9.-]+$/i.test(origin) ? origin : "https://www.avuqo.com";
  const lines = ["My AVUQO comparison basket", "", "Saved prices are historical snapshots, not live quotes. Check each retailer before buying.", ""];
  for (const [index, item] of items.slice(0, 18).entries()) {
    const path = /^\/products\/[a-z0-9-]+$/.test(item.url) ? item.url : null;
    lines.push(`${index + 1}. ${item.title.slice(0, 100)}`);
    lines.push(`Retailer: ${item.merchant.slice(0, 80)} | Captured price: ${item.price === null ? "Not available" : `£${item.price.toFixed(2)}`}`);
    if (path) lines.push(prefix + path);
    lines.push("");
  }
  if (items.length > 18) lines.push(`+ ${items.length - 18} more saved offers. Open your AVUQO basket to see the rest.\n`);
  lines.push("AVUQO does not take payment. Each retailer handles its own checkout.");
  return lines.join("\n");
}
