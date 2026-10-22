"use client";

import { Bell, Check, LoaderCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { migrateLocalWatches } from "../../lib/watches/migrateLocalWatches";

type WatchDeal = {
  id: string;
  title: string;
  category: string;
  currentPrice: number;
  typicalPrice: number;
  avuqoScore: number;
  merchant: string;
};

type Props = { deal: WatchDeal };

export default function WatchButton({ deal }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const pathname = usePathname();
  const [watching, setWatching] = useState(false);
  const [watchId, setWatchId] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const watchKey = `deal:${deal.id}`;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data: auth } = await supabase.auth.getUser();
      if (cancelled) return;

      if (!auth.user) {
        setBusy(false);
        return;
      }

      await migrateLocalWatches(supabase, auth.user.id);

      const { data } = await supabase
        .from("watches")
        .select("id")
        .eq("watch_key", watchKey)
        .eq("status", "active")
        .maybeSingle();

      if (cancelled) return;
      setWatchId(data?.id ?? null);
      setWatching(Boolean(data?.id));
      setBusy(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [deal.id, supabase, watchKey]);

  async function toggleWatch() {
    setBusy(true);

    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (watchId) {
      const { error } = await supabase.from("watches").delete().eq("id", watchId);
      if (!error) {
        setWatchId(null);
        setWatching(false);
      }
      setBusy(false);
      return;
    }

    const { data, error } = await supabase
      .from("watches")
      .upsert(
        {
          user_id: auth.user.id,
          name: deal.title,
          watch_type: "deal",
          watch_key: watchKey,
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
      )
      .select("id")
      .single();

    if (!error && data) {
      setWatchId(data.id);
      setWatching(true);
    }

    setBusy(false);
  }

  return (
    <button
      type="button"
      className={watching ? "watch-page-button watching" : "watch-page-button"}
      onClick={toggleWatch}
      disabled={busy}
    >
      {busy ? (
        <>
          <LoaderCircle className="spin" size={18} /> Checking
        </>
      ) : watching ? (
        <>
          <Check size={18} /> Watching
        </>
      ) : (
        <>
          <Bell size={18} /> Watch
        </>
      )}
    </button>
  );
}
