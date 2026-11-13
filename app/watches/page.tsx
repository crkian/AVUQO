"use client";

import Link from "next/link";
import {ArrowRight, Bell, Bookmark, Clock3, LogIn, Plus, Trash2} from "lucide-react";
import {useEffect,useMemo,useState} from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import {createClient} from "../../lib/supabase/client";
import {migrateLocalWatches} from "../../lib/watches/migrateLocalWatches";
import {dealDestination,savedDealDestination} from "../../lib/avuqo/deal-links";
import styles from "./page.module.css";

type WatchRow = {
  id:string;
  name:string;
  criteria:Record<string,unknown>|null;
  watch_key:string;
  status:string;
  created_at:string;
};
type WatchView = {
  id:string;href:string|null;title:string;category:string;
  merchant:string|null;createdAt:string;
};
function toView(row:WatchRow):WatchView {
  const criteria=row.criteria ?? {};
  const text=(key:string)=>typeof criteria[key]==="string" ? String(criteria[key]) : null;
  const href=savedDealDestination(row.watch_key) ?? dealDestination(text("dealId"));
  return {id:row.id,href,
    title:text("title") || row.name,category:text("category") || "Saved watch",
    merchant:text("merchant"),createdAt:row.created_at};
}

export default function WatchesPage(){
  const db=useMemo(()=>createClient(),[]);
  const [watches,setWatches]=useState<WatchView[]>([]);
  const [loading,setLoading]=useState(true);
  const [signedIn,setSignedIn]=useState(false);
  const [message,setMessage]=useState("");

  useEffect(()=>{
    let active=true;
    const load=async()=>{
      const {data:auth}=await db.auth.getUser();
      if(!active)return;
      if(!auth.user){setSignedIn(false);setWatches([]);setLoading(false);return;}
      setSignedIn(true);
      await migrateLocalWatches(db,auth.user.id);
      const {data,error}=await db.from("watches")
        .select("id,name,criteria,watch_key,status,created_at")
        .eq("status","active").order("created_at",{ascending:false}).limit(200);
      if(!active)return;
      if(error)setMessage("Your Watches could not be loaded right now.");
      else setWatches(((data??[]) as WatchRow[]).map(toView));
      setLoading(false);
    };
    void load();
    const {data:listener}=db.auth.onAuthStateChange(()=>{void load();});
    return ()=>{active=false;listener.subscription.unsubscribe();};
  },[db]);

  async function removeWatch(id:string){
    const {error}=await db.from("watches").delete().eq("id",id);
    if(error){setMessage("Could not remove this Watch. Please try again.");return;}
    setWatches(current=>current.filter(watch=>watch.id!==id));
    setMessage("Watch removed.");
  }

  return <main className={styles.page}>
    <Header/>
    <section className="shell">
      <div className={styles.panel}>
        <div className={styles.heading}>
          <span className={styles.headingIcon}><Bell size={34}/></span>
          <div className={styles.headingCopy}><p className={styles.kicker}>Your AVUQO</p>
            <h1>My Watches</h1>
            <p>Keep the products you care about together. Recheck current retailer information whenever you return.</p>
          </div>
          <Link className={styles.addWatch} href="/search"><Plus size={18}/> Find a Watch</Link>
        </div>
        <div className={styles.summary}><span><Bookmark size={17}/> {loading?"Loading…":`${watches.length} active ${watches.length===1?"Watch":"Watches"}`}</span><span><Clock3 size={17}/> Saved records, not live price alerts</span></div>
        {message&&<p className={styles.message} role="status">{message}</p>}
        {loading ? <div className={styles.empty}>Loading Watches…</div>
          : !signedIn ? <div className={styles.empty}><LogIn size={37}/><h2>Sign in to see your Watches.</h2><p>Your Watch records belong to your account.</p><Link href="/login?next=/watches">Sign in <ArrowRight size={16}/></Link></div>
          : watches.length===0 ? <div className={styles.empty}><Bell size={37}/><h2>No Watches yet.</h2><p>Find something you would like to keep an eye on, then choose Watch on its detail page.</p><Link href="/search">Browse products <ArrowRight size={16}/></Link></div>
          : <div className={styles.list}>{watches.map((watch,index)=><article className={styles.item} key={watch.id}>
              <div className={styles.art} data-tone={index%3}><Bookmark size={35} aria-hidden="true"/></div>
              <div className={styles.details}><p className={styles.category}>{watch.category}</p><h2>{watch.title}</h2>
                <p>{watch.merchant??"Merchant not recorded"} · Added {new Date(watch.createdAt).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</p></div>
              <span className={styles.status}><Bell size={17}/> On your watchlist</span>
              <div className={styles.actions}>{watch.href?<Link href={watch.href}>View &amp; recheck <ArrowRight size={16}/></Link>:<span>Original deal unavailable</span>}
                <button type="button" onClick={()=>void removeWatch(watch.id)} aria-label={`Remove ${watch.title}`}><Trash2 size={18}/></button>
              </div>
            </article>)}</div>}
        <p className={styles.note}>Adding a Watch saves a record, but does not yet activate automated price checks, email or push alerts. Historic criteria and prices are not live offers.</p>
      </div>
    </section>
    <Footer/>
  </main>;
}
