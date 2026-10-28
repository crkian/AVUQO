"use server";

import { requireControlCentreAccess } from "../../../lib/auth/requireControlCentreAccess";

export type EndpointResult = {
  host: string;
  outcome: "reachable" | "unavailable" | "blocked";
  httpStatus?: number;
  checkedAt: string;
  detail: string;
};

/**
 * Operator-controlled HTTPS endpoints only. Never accept a URL from a
 * browser, a feed row, or an affiliate redirect as a fetch target.
 * The optional env var contains comma-separated approved URLs.
 */
export async function checkApprovedEndpoints(): Promise<EndpointResult[]> {
  await requireControlCentreAccess();
  const raw = process.env.AVUQO_HEALTHCHECK_URLS ?? "";
  const entries = raw.split(",").map((x) => x.trim()).filter(Boolean).slice(0, 5);
  const approvedHosts = new Set((process.env.AVUQO_HEALTHCHECK_HOSTS ?? "").split(",").map(x => x.trim().toLowerCase()).filter(Boolean));
  const out: EndpointResult[] = [];

  for (const entry of entries) {
    const checkedAt = new Date().toISOString();
    let url: URL;
    try {
      url = new URL(entry);
    } catch {
      out.push({ host: "Invalid configuration", outcome: "blocked", checkedAt, detail: "Malformed configured endpoint" });
      continue;
    }
    const host = url.hostname.toLowerCase();
    // Explicit public-domain endpoints with no credentials, custom ports or IP addresses.
    const validHost = /^(?=.{4,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(host);
    const isPrivateSuffix = /(?:^|\.)(?:localhost|local|internal|test|invalid)$/.test(host);
    if (!approvedHosts.has(host) || url.protocol !== "https:" || !validHost || isPrivateSuffix ||
        url.port || url.username || url.password || url.hash ||
        url.search || url.pathname !== "/" ||
        host.endsWith(".example.com")) {
      out.push({ host, outcome: "blocked", checkedAt, detail: "Endpoint must match the exact approved hostname and use a public HTTPS root URL" });
      continue;
    }
    try {
      const response = await fetch(url.toString(), {
        method: "HEAD",
        redirect: "manual",
        cache: "no-store",
        signal: AbortSignal.timeout(4000),
        headers: { "User-Agent": "AVUQO-Endpoint-Health/1.0" },
      });
      out.push({
        host,
        outcome: response.status >= 200 && response.status < 400 ? "reachable" : "unavailable",
        httpStatus: response.status,
        checkedAt,
        detail: response.status >= 300 && response.status < 400
          ? "Redirect returned, not followed"
          : "HTTP response received; product price and stock NOT verified",
      });
    } catch {
      out.push({ host, outcome: "unavailable", checkedAt, detail: "Connection failed or timed out; no price evidence collected" });
    }
  }
  return out;
}
