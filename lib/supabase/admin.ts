import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !secret) {
    throw new Error(
      "Server automation needs NEXT_PUBLIC_SUPABASE_URL plus SUPABASE_SECRET_KEY (or legacy SUPABASE_SERVICE_ROLE_KEY)."
    );
  }

  return createSupabaseClient(url, secret, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
