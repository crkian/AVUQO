/** Merchant redirect safety: verified offers alone may supply destinations. */
export function safeMerchantDestination(raw: unknown): URL | null {
  if (typeof raw !== "string") return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || url.username || url.password || url.hostname.length < 4) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}
