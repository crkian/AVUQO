import type { SupabaseClient } from "@supabase/supabase-js";

const STORAGE_KEY = "avuqo-watches";

type LocalWatch = {
  id: string;
  title: string;
  category: string;
  currentPrice: number;
  typicalPrice: number;
  avuqoScore: number;
  merchant: string;
};

export async function migrateLocalWatches(
  supabase: SupabaseClient,
  userId: string
) {
  if (typeof window === "undefined") return;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  let watches: LocalWatch[] = [];
  try {
    watches = JSON.parse(raw);
  } catch {
    return;
  }

  if (!Array.isArray(watches) || watches.length === 0) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  for (const deal of watches) {
    await supabase.from("watches").upsert(
      {
        user_id: userId,
        name: deal.title,
        watch_type: "deal",
        watch_key: `deal:${deal.id}`,
        criteria: {
          dealId: deal.id,
          title: deal.title,
          category: deal.category,
          currentPrice: deal.currentPrice,
          typicalPrice: deal.typicalPrice,
          avuqoScore: deal.avuqoScore,
          merchant: deal.merchant,
        },
        status: "active",
      },
      { onConflict: "user_id,watch_key" }
    );
  }

  window.localStorage.removeItem(STORAGE_KEY);
}
