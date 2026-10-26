import { NextResponse } from "next/server";

export async function GET() {
  const publicSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
  );

  const privilegedPipelineConfigured = Boolean(
    process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const awinConfigured = Boolean(
    process.env.AWIN_PUBLISHER_ID &&
      process.env.AWIN_ADVERTISER_ID &&
      process.env.AWIN_ACCESS_TOKEN
  );

  const publicSiteConfigured = Boolean(
    process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      process.env.VERCEL_URL
  );

  const contactConfigured = Boolean(
    process.env.NEXT_PUBLIC_CONTACT_EMAIL
  );

  const publicReady =
    publicSupabaseConfigured &&
    publicSiteConfigured &&
    contactConfigured;

  return NextResponse.json(
    {
      ok: publicReady,
      service: "avuqo-web",
      checks: {
        publicSiteConfigured,
        contactConfigured,
        publicSupabaseConfigured,
        privilegedPipelineConfigured,
        awinConfigured,
      },
    },
    {
      status: publicReady ? 200 : 503,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
