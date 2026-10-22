import { NextResponse } from "next/server";

import { createClient } from "../../../lib/supabase/server";

type Context = { params: Promise<{ offerId: string }> };

function safeDestination(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url;
  } catch {
    return null;
  }
}

export async function GET(request: Request, context: Context) {
  const { offerId } = await context.params;
  const supabase = await createClient();

  const [{ data: published }, { data: offer }] = await Promise.all([
    supabase.from("published_deals").select("offer_id,status").eq("offer_id", offerId).eq("status", "published").maybeSingle(),
    supabase.from("offers").select("id,affiliate_url,source_url").eq("id", offerId).maybeSingle(),
  ]);

  if (!published || !offer) return NextResponse.redirect(new URL("/live", request.url), 302);

  const destination = safeDestination(offer.affiliate_url || offer.source_url);
  if (!destination) return NextResponse.redirect(new URL(`/live/${offerId}`, request.url), 302);

  const { data: auth } = await supabase.auth.getUser();
  const referrer = request.headers.get("referer");
  let referrerPath: string | null = null;
  if (referrer) {
    try { referrerPath = new URL(referrer).pathname; } catch { referrerPath = null; }
  }

  await supabase.from("click_events").insert({
    user_id: auth.user?.id ?? null,
    offer_id: offerId,
    page_path: `/live/${offerId}`,
    traffic_source: referrer ? "avuqo" : "direct",
    campaign: "live-deal",
    metadata: {
      destination_domain: destination.hostname,
      referrer: referrerPath,
      attribution_version: "v0.6",
    },
  });

  return NextResponse.redirect(destination, 302);
}
