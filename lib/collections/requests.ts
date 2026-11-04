import { safeProductUrl, type PlanningCollectionKind } from "./planning";

/** Parse only identifiers. Never trust client-supplied seller, price, title or capture time. */
export type AddCollectionRequest = {
  kind: PlanningCollectionKind;
  productId: string;
  productSlug: string;
  offerId: string;
};

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseCollectionRequest(input: unknown): AddCollectionRequest | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const row = input as Record<string, unknown>;
  if (row.kind !== "wishlist" && row.kind !== "basket") return null;
  if (typeof row.productId !== "string" || !uuid.test(row.productId) ||
      typeof row.offerId !== "string" || !uuid.test(row.offerId) ||
      safeProductUrl(row.productSlug) === null) return null;
  return { kind: row.kind, productId: row.productId, productSlug: row.productSlug as string, offerId: row.offerId };
}

export function parseBasketName(input: unknown): string | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const value = (input as Record<string, unknown>).name;
  if (typeof value !== "string") return null;
  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized.length >= 3 && normalized.length <= 80 && !/[\x00-\x1f\x7f]/.test(normalized) ? normalized : null;
}

export function isSameOriginWrite(request: Request): boolean {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return false;
  const origin = request.headers.get("origin");
  if (!origin) return true; // Non-browser clients still require a valid signed-in session.
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch { return false; }
}
