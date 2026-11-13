"use client";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import { createClient } from "../../../lib/supabase/client";
import { isSafeSnapshot, safeProductUrl } from "../../../lib/collections/planning";
import {savedDealDestination} from "../../../lib/avuqo/deal-links";
import styles from "../../../components/collections/planning.module.css";

type ListRow={id:string;name:string;description:string|null;owner_id:string};
type Item={id:string;item_key:string|null;title_override:string|null;snapshot:unknown;created_at:string};
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function SavedListDetailClient() {
 const {id}=useParams<{id:string}>();
 const db=useMemo(()=>createClient(),[]);
 const [list,setList]=useState<ListRow|null>(null);
 const [items,setItems]=useState<Item[]>([]);
 const [loading,setLoading]=useState(true);
 const [message,setMessage]=useState("");
 useEffect(()=>{
  let active=true;
  async function load(){
    if(!UUID.test(id)){if(active){setMessage("Invalid list.");setLoading(false)}return}
    const {data:auth}=await db.auth.getUser();
    if(!auth.user){if(active){setMessage("Sign in to view your private list.");setLoading(false)}return}
    const {data:parent,error}=await db.from("shared_lists").select("id,name,description,owner_id").eq("id",id).maybeSingle();
    if(error||!parent){if(active){setMessage("This list is unavailable to your account.");setLoading(false)}return}
    const {data:rows,error:itemError}=await db.from("shared_list_items").select("id,item_key,title_override,snapshot,created_at").eq("list_id",id).order("created_at",{ascending:true}).limit(200);
    if(active){setList(parent as ListRow);setItems((rows??[]) as Item[]);if(itemError)setMessage("Some list items are unavailable.");setLoading(false)}
  }
  void load();return ()=>{active=false};
 },[db,id]);
 return <main><Header/><section className={styles.hero}><div className="shell"><p className="kicker">Your saved collection</p><h1>{list?.name??"Named list"}</h1><p>{list?.description??"A collection of AVUQO products and offers. Saved prices are historical snapshots."}</p><nav className={styles.links}><Link href="/lists">All named lists</Link><Link href="/basket">Comparison basket</Link><Link href="/wishlist">Wishlist</Link></nav></div></section>
 <section className={`shell ${styles.collection}`}>{loading?<p>Loading private items…</p>:list?<><div className={styles.heading}><h2>{items.length} saved items</h2><span>Prices may have changed</span></div><div className={styles.items}>{items.map(item=>{const shot=isSafeSnapshot(item.snapshot)?item.snapshot:null;const url=(shot?safeProductUrl(shot.product_slug):null)??savedDealDestination(item.item_key);return <article key={item.id} className={styles.item}><div className={styles.itemInfo}><h3>{item.title_override??"Saved item"}</h3><p>{shot?.merchant??"Seller not recorded"}</p></div><div className={styles.itemPrice}><strong>{shot?.price_gbp==null?"Price unavailable":`£${shot.price_gbp.toFixed(2)}`}</strong><small>Saved snapshot</small></div><div className={styles.itemActions}>{url?<Link href={url}>Recheck offer</Link>:<span>No current offer link</span>}</div></article>})}</div></>:<div className={styles.empty}><h2>Cannot open this list</h2><p>{message||"This list does not exist or cannot be accessed."}</p><Link href="/lists">Back to lists</Link></div>}{message&&list&&<p role="status">{message}</p>}</section><Footer/></main>
}

export default function SavedListDetail() { return <Suspense fallback={<main><p>Loading your private list…</p></main>}><SavedListDetailClient/></Suspense>; }
