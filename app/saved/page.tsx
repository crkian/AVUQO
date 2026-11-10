"use client";

import Link from "next/link";
import {ArrowRight, Bookmark, Heart, Search, ShoppingBag, Trash2} from "lucide-react";
import {useEffect, useMemo, useState} from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import {createClient} from "../../lib/supabase/client";
import styles from "./page.module.css";

type Row = {
  id: string;
  item_key: string | null;
  title_snapshot: string | null;
  category_snapshot: string | null;
  merchant_snapshot: string | null;
  price_when_saved: number | null;
  created_at: string;
};
type SortOrder = "recent" | "name";
const money = (value:number) => new Intl.NumberFormat("en-GB", {style:"currency",currency:"GBP"}).format(value);

function savedDealHref(key:string|null):string|null {
  const match = key?.match(/^deal:([a-z0-9-]{1,100})$/i);
  return match ? `/deal/${match[1]}` : null;
}

export default function SavedPage() {
  const db = useMemo(() => createClient(), []);
  const [rows,setRows] = useState<Row[]>([]);
  const [loading,setLoading] = useState(true);
  const [signedIn,setSignedIn] = useState(false);
  const [sort,setSort] = useState<SortOrder>("recent");
  const [message,setMessage] = useState("");

  useEffect(() => {
    let active = true;
    void (async () => {
      const {data:auth} = await db.auth.getUser();
      if (!active) return;
      if (!auth.user) {setLoading(false);return;}
      setSignedIn(true);
      const {data,error} = await db.from("saved_items")
        .select("id,item_key,title_snapshot,category_snapshot,merchant_snapshot,price_when_saved,created_at")
        .order("created_at",{ascending:false}).limit(200);
      if (!active) return;
      if (error) setMessage("Some saved items could not be loaded.");
      else setRows((data ?? []) as Row[]);
      setLoading(false);
    })();
    return () => {active = false;};
  },[db]);

  const shown = useMemo(() => sort === "name"
    ? [...rows].sort((a,b)=>(a.title_snapshot ?? "").localeCompare(b.title_snapshot ?? ""))
    : rows, [rows,sort]);

  async function remove(id:string) {
    const {error} = await db.from("saved_items").delete().eq("id",id);
    if (error) {setMessage("Could not remove that item. Try again.");return;}
    setRows(current => current.filter(item => item.id !== id));
    setMessage("Item removed from Saved.");
  }

  return <main className={styles.page}>
    <Header/>
    <section className="shell">
      <div className={styles.pageCard}>
        <div className={styles.heading}>
          <span className={styles.headingIcon}><Heart size={33} aria-hidden="true"/></span>
          <div className={styles.headingCopy}><p className={styles.kicker}>Your AVUQO</p><h1>My Saved Items</h1><p>Your favourite finds, all in one place. Revisit and recheck before buying.</p></div>
          <label className={styles.sort}>Sort
            <select value={sort} onChange={event=>setSort(event.target.value as SortOrder)} aria-label="Sort saved items">
              <option value="recent">Recently saved</option>
              <option value="name">Name A–Z</option>
            </select>
          </label>
        </div>
        {message&&<p className={styles.message} role="status">{message}</p>}
        {loading
          ? <div className={styles.empty}><p>Loading your saved finds…</p></div>
          : !signedIn
          ? <div className={styles.empty}><Bookmark size={37}/><h2>Keep your favourites together.</h2><p>Sign in to view your private Saved collection.</p><Link href="/login?next=/saved">Sign in <ArrowRight size={16}/></Link></div>
          : rows.length===0
          ? <div className={styles.empty}><Heart size={37}/><h2>Nothing saved just yet.</h2><p>Save something worth a second look, then find it here.</p><Link href="/discover">Explore AVUQO <Search size={16}/></Link></div>
          : <div className={styles.grid}>{shown.map((item,index)=>{
              const href=savedDealHref(item.item_key);
              return <article className={styles.card} key={item.id}>
                <span className={styles.heart} aria-label="Saved item"><Heart size={21} fill="currentColor"/></span>
                <div className={styles.art} data-tone={index%4}><ShoppingBag size={57} aria-hidden="true"/><small>Saved find</small></div>
                <div className={styles.cardBody}>
                  <p className={styles.category}>{item.category_snapshot ?? "Your shortlist"}</p>
                  <h2>{item.title_snapshot || "Saved item"}</h2>
                  {item.merchant_snapshot&&<p className={styles.merchant}>{item.merchant_snapshot}</p>}
                  <div className={styles.price}>{item.price_when_saved == null ? <strong>Price unavailable</strong> : <><strong>{money(Number(item.price_when_saved))}</strong><small>Price when saved, not a live quote</small></>}</div>
                  <div className={styles.cardActions}>{href?<Link href={href}>View &amp; recheck <ArrowRight size={17}/></Link>:<span>No current product link</span>}
                    <button type="button" onClick={()=>void remove(item.id)} aria-label={`Remove ${item.title_snapshot || "saved item"}`} title="Remove saved item"><Trash2 size={18}/></button>
                  </div>
                </div>
              </article>;
            })}</div>}
        <p className={styles.disclaimer}>Saved titles, merchants and prices are historical snapshots. They do not verify today&apos;s price, stock, product image or AVUQO Score.</p>
      </div>
    </section>
    <Footer/>
  </main>;
}
