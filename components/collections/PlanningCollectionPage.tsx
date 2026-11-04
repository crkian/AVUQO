"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { Heart, ShoppingBasket, Trash2, Mail, Copy, FolderPlus } from "lucide-react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import { createClient } from "../../lib/supabase/client";
import { COLLECTIONS, basketEmailBody, isSafeSnapshot, safeProductUrl, type PlanningCollectionKind } from "../../lib/collections/planning";
import styles from "./planning.module.css";

type Item = { id: string; title_override: string | null; item_key: string | null; url: string | null; snapshot: unknown; created_at: string };
type ListRow = { id: string; name: string };
type DisplayItem = { id: string; title: string; merchant: string; price: number | null; url: string | null; capturedAt: string | null };

function itemDisplay(row: Item): DisplayItem {
  const snapshot = isSafeSnapshot(row.snapshot) ? row.snapshot : null;
  return {
    id: row.id,
    title: (row.title_override ?? "Saved product").slice(0, 180),
    merchant: snapshot?.merchant ?? "Merchant not recorded",
    price: snapshot?.price_gbp ?? null,
    url: snapshot ? safeProductUrl(snapshot.product_slug) : null,
    capturedAt: snapshot?.captured_at ?? null,
  };
}

export default function PlanningCollectionPage({ kind }: { kind: PlanningCollectionKind }) {
  const db = useMemo(() => createClient(), []);
  const [list, setList] = useState<ListRow | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const collection = COLLECTIONS[kind];
  const displays = items.map(itemDisplay);

  const load = useCallback(async () => {
    setLoading(true); setMessage("");
    const { data: auth } = await db.auth.getUser();
    if (!auth.user) { setSignedIn(false); setList(null); setItems([]); setLoading(false); return; }
    setSignedIn(true);
    const { data: current, error } = await db.from("shared_lists")
      .select("id,name").eq("owner_id", auth.user.id).eq("list_type", kind)
      .order("created_at", {ascending:true}).limit(1).maybeSingle();
    if (error) { setMessage("Unable to load your private collection."); setLoading(false); return; }
    setList(current);
    if (current?.id) {
      const { data: rows, error: itemError } = await db.from("shared_list_items")
        .select("id,title_override,item_key,url,snapshot,created_at")
        .eq("list_id", current.id).order("created_at", {ascending:true}).limit(200);
      if (itemError) setMessage("Unable to load the saved items.");
      else setItems((rows ?? []) as Item[]);
    } else setItems([]);
    setLoading(false);
  }, [db, kind]);

  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);

  async function remove(id: string) {
    if (!list || pending) return;
    setPending(true);
    const { error } = await db.from("shared_list_items").delete().eq("list_id", list.id).eq("id", id);
    if (error) setMessage("Unable to remove that item.");
    else setItems(old => old.filter(item => item.id !== id));
    setPending(false);
  }

  async function saveBundle(event: FormEvent) {
    event.preventDefault();
    if (kind !== "basket" || !list || pending || name.trim().length < 3 || name.trim().length > 80 || !items.length) return;
    setPending(true); setMessage("");
    try {
      // The server reads the authenticated account's basket. Browser-edited item
      // lists, merchant names and price snapshots are never accepted as inputs.
      const response=await fetch("/api/collections/save-basket",{
        method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({name:name.trim()})
      });
      const result=await response.json().catch(()=>({})) as {ok?:boolean;listId?:string;error?:string};
      if (!response.ok || !result.ok || !result.listId) {
        setMessage(result.error??"Could not save the whole basket.");
        return;
      }
      setName("");
      setMessage("Saved a private named copy. Open it from your Lists page.");
    } catch { setMessage("Could not save the whole basket. Please try again."); }
    finally { setPending(false); }
  }

  const emailBody = basketEmailBody(displays.map(item => ({title:item.title,merchant:item.merchant,price:item.price,url:item.url ?? ""})), "https://www.avuqo.com");
  const mailto = `mailto:?subject=${encodeURIComponent("My AVUQO comparison basket")}&body=${encodeURIComponent(emailBody)}`;

  return <main>
    <Header/>
    <section className={styles.hero}><div className="shell">
      <p className="kicker">Your AVUQO account</p>
      <h1>{kind === "basket" ? "Comparison basket" : "My wishlist"}</h1>
      <p>{collection.description} {kind === "basket" ? "This is not a checkout. Each retailer handles its own order." : "Prices and availability can change after saving."}</p>
      <nav className={styles.links} aria-label="Your collections">
        <Link href="/wishlist">Wishlist</Link><Link href="/basket">Basket</Link><Link href="/lists">Named lists</Link><Link href="/products">Explore products</Link>
      </nav>
    </div></section>
    <section className={`shell ${styles.collection}`}>
      {loading ? <p>Loading your private collection…</p> : !signedIn ?
        <div className={styles.empty}><Heart/><h2>Sign in to save your selections</h2><p>Your wishlist and basket stay private to your account.</p><Link className={styles.addButton} href={`/login?next=${encodeURIComponent(collection.route)}`}>Sign in</Link></div> :
        <>
          <div className={styles.heading}><h2>{displays.length} saved {displays.length === 1 ? "item" : "items"}</h2><span>Saved as one private {kind === "basket" ? "basket" : "wishlist"}</span></div>
          {displays.length === 0 ? <div className={styles.empty}><ShoppingBasket/><h2>No items yet</h2><p>Add eligible offers from a verified AVUQO product page.</p><Link className={styles.addButton} href="/products">Browse verified products</Link></div> :
          <div className={styles.items}>{displays.map(row => <article key={row.id} className={styles.item}>
            <div className={styles.itemInfo}><h3>{row.title}</h3><p>{row.merchant}</p><small>{row.capturedAt ? `Price captured ${new Date(row.capturedAt).toLocaleDateString("en-GB")}` : "Original price date unavailable"}</small></div>
            <div className={styles.itemPrice}><strong>{row.price === null ? "Price unavailable" : `£${row.price.toFixed(2)}`}</strong><small>Saved snapshot</small></div>
            <div className={styles.itemActions}>{row.url ? <Link href={row.url}>Recheck offer</Link> : <span>Offer link unavailable</span>}<button aria-label={`Remove ${row.title}`} type="button" disabled={pending} onClick={() => void remove(row.id)}><Trash2 size={17}/></button></div>
          </article>)}</div>}
          {kind === "basket" && displays.length > 0 && <div className={styles.tools}>
            <h2>Keep or share this basket</h2><p>Prices are the values saved when you added each offer. Recheck product availability, seller and delivery before any purchase.</p>
            <div className={styles.toolActions}>
              <a className={styles.addButton} href={mailto}><Mail size={17}/> Open email draft</a>
              <button className={styles.addButton} type="button" onClick={() => {void navigator.clipboard.writeText(emailBody).then(() => setMessage("Basket summary copied.")).catch(() => setMessage("Copy unavailable in this browser."));}}><Copy size={17}/> Copy summary</button>
            </div>
            <p className={styles.note}>Email opens your device’s email app. AVUQO does not send an email automatically. Email drafts include up to 18 offers; copy or save the full basket if it is longer.</p>
            <form className={styles.saveForm} onSubmit={saveBundle}><label htmlFor="bundle-name">Save this basket as one named list</label><div><input id="bundle-name" required minLength={3} maxLength={80} value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Home office upgrade"/><button disabled={pending} type="submit"><FolderPlus size={17}/> Save group</button></div></form>
          </div>}
        </>}
      {message && <p className={styles.notice} role="status">{message}</p>}
    </section><Footer/>
  </main>;
}
