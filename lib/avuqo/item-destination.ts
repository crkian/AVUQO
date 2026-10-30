/**
 * Routes stored deal keys without treating untrusted database values as URLs.
 * Legacy deal:<id> can reference either a demo slug or a verified UUID offer.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DEMO_ID = /^[a-z0-9][a-z0-9-]{0,159}$/i;

export function dealDestination(id: string | null | undefined): string | null {
  if (!id) return null;
  if (UUID.test(id)) return "/live/" + id;
  if (DEMO_ID.test(id)) return "/deal/" + id;
  return null;
}

export function savedDestination(itemKey: string | null | undefined): string | null {
  if (!itemKey?.startsWith("deal:")) return null;
  return dealDestination(itemKey.slice("deal:".length));
}
