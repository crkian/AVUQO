import { type NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/proxy";
import { researchGuideBySlug } from "./lib/products/research-guides";
import { verifiedProduct } from "./lib/products/public-catalog";

// Next 16 Cache Components can commit HTTP 200 before a streamed notFound().
// Direct document requests must be denied at the request boundary instead.
// This is a read-only gate: never infer publication from a product row alone.
const PRODUCT_SLUG=/^\/products\/([^/]+)\/?$/;
const VALID_SLUG=/^[a-z0-9][a-z0-9-]{2,159}$/;

function unavailableProductResponse(method:string):Response {
  // Fixed, non-user-influenced HTML, so neither draft product identity nor
  // provider metadata is leaked through an interpolated 404 response.
  const html=`<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Product unavailable | AVUQO</title><style>
  :root{color-scheme:light}*{box-sizing:border-box}body{margin:0;background:#f7f5ef;color:#17142b;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}main{min-height:100vh;display:grid;place-items:center;padding:32px}section{max-width:620px;text-align:center}.mark{display:grid;place-items:center;width:58px;height:58px;margin:0 auto 22px;border-radius:18px;background:linear-gradient(140deg,#5b35f5,#3478f6);color:#fff;font-size:22px;font-weight:900}.eyebrow{color:#5b35f5;font-weight:850;letter-spacing:.12em;font-size:12px}h1{font-size:clamp(2rem,6vw,3.2rem);letter-spacing:-.05em;line-height:1.15}p{color:#716d80;line-height:1.7}nav{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:26px}a{display:inline-flex;justify-content:center;align-items:center;min-height:44px;padding:12px 18px;border-radius:13px;font-weight:750;text-decoration:none;color:#fff;background:#5b35f5}a.secondary{color:#17142b;background:transparent;border:1px solid #bcb5ce}a:focus-visible{outline:3px solid #3478f6;outline-offset:3px}
  </style></head><body><main><section><div class="mark" aria-hidden="true">Q</div><p class="eyebrow">404 · Product unavailable</p><h1>Nothing worth finding here.</h1><p>This product is unavailable or has no approved retailer offer yet. Browse the research guides while we verify actual prices, availability and merchant rights.</p><nav aria-label="Other places to go"><a href="/products">Explore products</a><a class="secondary" href="/">Back to AVUQO</a></nav></section></main></body></html>`;
  return new Response(method==="HEAD"?null:html,{
    status:404,
    headers:{
      "Content-Type":"text/html; charset=utf-8",
      "Cache-Control":"private, no-store, max-age=0",
      "X-Robots-Tag":"noindex, nofollow",
      "X-Content-Type-Options":"nosniff"
    }
  });
}

export async function proxy(request: NextRequest) {
  const match=request.nextUrl.pathname.match(PRODUCT_SLUG);
  const method=request.method.toUpperCase();
  // Keep client-side Next RSC navigation on its native protocol. The initial
  // HTTP document must return a real 404, before any layout starts streaming.
  if(match && (method==="GET"||method==="HEAD") &&
     request.headers.get("rsc")!=="1" &&
     request.headers.get("next-router-prefetch")!=="1"){
    const slug=match[1];
    if(!VALID_SLUG.test(slug))return unavailableProductResponse(method);
    if(!researchGuideBySlug(slug) && !(await verifiedProduct(slug))){
      return unavailableProductResponse(method);
    }
  }
  // Preserve existing Supabase cookie refresh/session proxy for all admitted
  // documents and all other routes.
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ]
};
