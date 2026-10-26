import "server-only";
import { createClient } from "../supabase/server";
import { DEFAULT_FOOTER, parseFooter, type FooterContent } from "./footer";

export async function getPublishedFooter(): Promise<FooterContent> {
  try {
    const db = await createClient();
    const { data, error } = await db.from("site_content_published")
      .select("payload").eq("key", "footer").maybeSingle();
    if (error || !data) return DEFAULT_FOOTER;
    return parseFooter(data.payload);
  } catch {
    return DEFAULT_FOOTER;
  }
}
