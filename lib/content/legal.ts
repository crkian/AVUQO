import { createClient } from "../supabase/server";
export const LEGAL_SLUGS = ["privacy", "terms", "cookies", "affiliate-disclosure"] as const;
export type LegalSlug = typeof LEGAL_SLUGS[number];
export function isLegalSlug(s: string): s is LegalSlug { return (LEGAL_SLUGS as readonly string[]).includes(s); }
export type LegalDoc = { title: string; introduction: string; body: string; effectiveDate: string };
export function validateLegalDoc(raw: unknown): LegalDoc {
 if (!raw || typeof raw !== "object") throw Error("Invalid document");
 const r = raw as Record<string, unknown>;
 for (const k of ["title", "introduction", "body", "effectiveDate"]) if (typeof r[k] !== "string") throw Error(`Invalid ${k}`);
 const d = r as unknown as LegalDoc;
 if (!d.title.trim() || d.title.length > 160 || d.introduction.length > 1200 || !d.body.trim() || d.body.length > 30000 || !/^\d{4}-\d{2}-\d{2}$/.test(d.effectiveDate) || Number.isNaN(Date.parse(d.effectiveDate))) throw Error("Document exceeds limits or has invalid date");
 return d;
}
export async function getPublishedLegal(slug: LegalSlug): Promise<{ content: LegalDoc; version: number } | null> {
 try {
  const db = await createClient();
  const { data, error } = await db.from("legal_content_published").select("payload, version").eq("slug",slug).maybeSingle();
  if (error || !data) return null;
  return { content: validateLegalDoc(data.payload), version: data.version };
 } catch { return null; }
}
