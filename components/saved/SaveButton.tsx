"use client";

import { Bookmark, Check, LoaderCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import type { Deal } from "../../types/deal";
import { dealSnapshot } from "../../lib/avuqo/deal";
import styles from "./SaveButton.module.css";

export default function SaveButton({ deal }: { deal: Deal }) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const pathname = usePathname();
  const [savedId, setSavedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const itemKey = `deal:${deal.id}`;

  useEffect(() => {
    let live = true;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) { if (live) setBusy(false); return; }
      const { data } = await supabase.from("saved_items").select("id").eq("item_key", itemKey).maybeSingle();
      if (live) { setSavedId(data?.id ?? null); setBusy(false); }
    })();
    return () => { live = false; };
  }, [itemKey, supabase]);

  async function toggle() {
    setBusy(true);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { router.push(`/login?next=${encodeURIComponent(pathname)}`); return; }
    if (savedId) {
      const { error } = await supabase.from("saved_items").delete().eq("id", savedId);
      if (!error) setSavedId(null);
    } else {
      const { data, error } = await supabase.from("saved_items").insert({
        user_id: auth.user.id,
        item_key: itemKey,
        title_snapshot: deal.title,
        category_snapshot: deal.category,
        merchant_snapshot: deal.merchant,
        price_when_saved: deal.currentPrice,
        score_when_saved: deal.avuqoScore,
        snapshot: dealSnapshot(deal),
      }).select("id").single();
      if (!error) setSavedId(data?.id ?? null);
    }
    setBusy(false);
  }

  return (
    <button className={`${styles.button} ${savedId ? styles.active : ""}`} type="button" onClick={toggle} disabled={busy}>
      {busy ? <><LoaderCircle size={17}/> Checking</> : savedId ? <><Check size={17}/> Saved</> : <><Bookmark size={17}/> Save</>}
    </button>
  );
}
