"use client";

import Link from "next/link";
import { ArrowRight, Bell, LogIn, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Header from "../../components/layout/Header";
import { createClient } from "../../lib/supabase/client";
import { migrateLocalWatches } from "../../lib/watches/migrateLocalWatches";

type WatchRow = {
  id: string;
  name: string;
  criteria: Record<string, unknown> | null;
  watch_key: string;
  status: string;
  created_at: string;
};

type WatchView = {
  rowId: string;
  dealId: string;
  title: string;
  category: string;
  currentPrice: number;
  typicalPrice: number;
  avuqoScore: number;
  merchant: string;
};

const money = (value: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);

function toWatchView(row: WatchRow): WatchView {
  const criteria = row.criteria ?? {};
  const readString = (key: string, fallback = "") =>
    typeof criteria[key] === "string" ? (criteria[key] as string) : fallback;
  const readNumber = (key: string) =>
    typeof criteria[key] === "number" ? (criteria[key] as number) : 0;

  return {
    rowId: row.id,
    dealId: readString("dealId", row.watch_key.replace(/^deal:/, "")),
    title: readString("title", row.name),
    category: readString("category", "Watch"),
    currentPrice: readNumber("currentPrice"),
    typicalPrice: readNumber("typicalPrice"),
    avuqoScore: readNumber("avuqoScore"),
    merchant: readString("merchant", "AVUQO source"),
  };
}

export default function WatchesPage() {
  const supabase = useMemo(() => createClient(), []);
  const [watches, setWatches] = useState<WatchView[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);

  async function loadWatches() {
    setLoading(true);
    const { data: auth } = await supabase.auth.getUser();

    if (!auth.user) {
      setSignedIn(false);
      setWatches([]);
      setLoading(false);
      return;
    }

    setSignedIn(true);
    await migrateLocalWatches(supabase, auth.user.id);

    const { data, error } = await supabase
      .from("watches")
      .select("id,name,criteria,watch_key,status,created_at")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setWatches((data as WatchRow[]).map(toWatchView));
    }

    setLoading(false);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadWatches(); }, 0);

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadWatches();
    });

    return () => { window.clearTimeout(timer); listener.subscription.unsubscribe(); };
  }, [supabase]);

  async function removeWatch(rowId: string) {
    const { error } = await supabase.from("watches").delete().eq("id", rowId);
    if (!error) {
      setWatches((current) => current.filter((watch) => watch.rowId !== rowId));
    }
  }

  return (
    <main>
      <Header />
      <section className="watches-hero">
        <div className="shell">
          <div className="watch-hero-icon"><Bell size={28} /></div>
          <p className="kicker">AVUQO Watches</p>
          <h1>Don’t keep checking.<br />AVUQO will.</h1>
          <p>
            Your Watches now live in your AVUQO account, ready to follow you across devices as the platform grows.
          </p>
        </div>
      </section>

      <section className="shell section">
        {!signedIn && !loading ? (
          <div className="watch-empty">
            <div className="watch-empty-icon"><LogIn size={28} /></div>
            <h2>Sign in to use Watches.</h2>
            <p>Your Watches are private to your AVUQO account and protected by Supabase Row Level Security.</p>
            <Link href="/login" className="merchant-button watch-empty-button">Sign in or create account</Link>
          </div>
        ) : (
          <>
            <div className="watch-page-header">
              <div>
                <p className="kicker">Your Watches</p>
                <h2>{loading ? "Loading Watches..." : watches.length === 1 ? "1 active Watch" : `${watches.length} active Watches`}</h2>
              </div>
              <Link href="/search" className="dark-button">Find something to watch <ArrowRight size={17} /></Link>
            </div>

            {!loading && watches.length === 0 ? (
              <div className="watch-empty">
                <div className="watch-empty-icon"><Bell size={28} /></div>
                <h2>Nothing being watched yet.</h2>
                <p>Open a deal and press Watch. AVUQO will save it to your account.</p>
                <Link href="/search" className="merchant-button watch-empty-button">Discover deals</Link>
              </div>
            ) : (
              <div className="watch-list">
                {watches.map((watch) => (
                  <article key={watch.rowId} className="watch-item">
                    <div className="watch-product-art"><span>Q</span></div>
                    <div className="watch-details">
                      <span className="watch-category">{watch.category}</span>
                      <h3>{watch.title}</h3>
                      <p>{watch.merchant}</p>
                    </div>
                    <div className="watch-price">
                      <strong>{watch.currentPrice ? money(watch.currentPrice) : "Tracking"}</strong>
                      <span>{watch.typicalPrice ? `Typical ${money(watch.typicalPrice)}` : "Waiting for market data"}</span>
                    </div>
                    <div className="watch-score">
                      <strong>{watch.avuqoScore || "–"}</strong>
                      <span>AVUQO</span>
                    </div>
                    <div className="watch-item-actions">
                      <Link href={`/deal/${watch.dealId}`}>View</Link>
                      <button type="button" onClick={() => removeWatch(watch.rowId)} aria-label={`Remove ${watch.title}`}>
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
