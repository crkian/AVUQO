/** Resolve a stored deal reference to a safe, internal AVUQO route.
 * Published offers have UUID identifiers and live at /live; historical
 * demonstration fixtures have slug identifiers and live at /deal.
 * A missing or invalid reference is not a clickable destination.
 */
const OFFER_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FIXTURE_SLUG = /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/;

export function dealDestination(id: unknown): string | null {
  if (typeof id !== "string") return null;
  if (OFFER_UUID.test(id)) return `/live/${id}`;
  if (FIXTURE_SLUG.test(id)) return `/deal/${id}`;
  return null;
}

export function savedDealDestination(itemKey: unknown): string | null {
  if (typeof itemKey !== "string" || !itemKey.startsWith("deal:")) return null;
  return dealDestination(itemKey.slice(5));
}
