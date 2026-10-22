import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const candidate = new URL(String(body.url ?? ""));
    if (!["http:", "https:"].includes(candidate.protocol)) throw new Error("Unsupported protocol");
    const hostname = candidate.hostname.toLowerCase().replace(/^www\./, "");
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    const { data: merchants } = await supabase.from("merchants").select("id,name,website_url").eq("status","active");
    const merchant = (merchants ?? []).find((row) => {
      try { return new URL(row.website_url ?? "").hostname.toLowerCase().replace(/^www\./, "") === hostname; } catch { return false; }
    });
    if (auth.user) {
      await supabase.from("reality_checks").insert({ user_id:auth.user.id, submitted_url:candidate.toString(), detected_domain:hostname, merchant_id:merchant?.id ?? null, status:merchant?"identified":"queued", result:{ safe_fetch:false, knownMerchant:Boolean(merchant) } });
    }
    return NextResponse.json(merchant ? {status:"identified",headline:"Merchant recognised. Verification can continue.",message:"AVUQO knows this merchant. Live source connectors can now compare the offer against trusted price and product data without trusting the retailer's sale label.",merchant:merchant.name} : {status:"queued",headline:"Link accepted for a safe Reality Check.",message:"This domain is not yet mapped to an approved AVUQO source. It has not been remotely fetched. In production, an allow-listed connector or verification worker will inspect it safely."});
  } catch {
    return NextResponse.json({status:"error",headline:"That does not look like a valid web link.",message:"Paste a complete http:// or https:// product, booking or deal URL."},{status:400});
  }
}
