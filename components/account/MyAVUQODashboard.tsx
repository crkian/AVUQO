"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {ArrowRight,Bookmark,Bell,ListChecks,SlidersHorizontal} from "lucide-react";
import {createClient} from "../../lib/supabase/client";
import styles from "./MyAVUQODashboard.module.css";
type Counts={saved:number|null;watches:number|null;lists:number|null};
export default function MyAVUQODashboard({signedIn,name}:{signedIn:boolean;name:string}){
 const [counts,setCounts]=useState<Counts>({saved:null,watches:null,lists:null});
 useEffect(()=>{
  let disposed=false;
  if(!signedIn)return;
  const db=createClient();
  void Promise.all([
   db.from("saved_items").select("id",{count:"exact",head:true}),
   db.from("watches").select("id",{count:"exact",head:true}).eq("status","active"),
   db.from("shared_lists").select("id",{count:"exact",head:true})
  ]).then(([saved,watches,lists])=>{
   if(disposed)return;
   setCounts({
    saved:saved.error?null:saved.count??0,
    watches:watches.error?null:watches.count??0,
    lists:lists.error?null:lists.count??0
   });
  });
  return ()=>{disposed=true;};
 },[signedIn]);
 const cards=[
  {href:"/saved",label:"Saved items",num:counts.saved,description:"The finds you wanted to keep",icon:Bookmark},
  {href:"/watches",label:"Price watches",num:counts.watches,description:"Active watches, not guaranteed alerts",icon:Bell},
  {href:"/lists",label:"Shopping lists",num:counts.lists,description:"Private and shared plans",icon:ListChecks},
  {href:"#account-preferences",label:"Preferences",num:null,description:"Your shopping style and account settings",icon:SlidersHorizontal}
 ];
 return <section className={styles.wrap} aria-label="My AVUQO dashboard"><div className="shell">
  <div className={styles.hero}><div><p>MY AVUQO / YOUR PERSONAL SPACE</p>
   <h2>{signedIn&&name.trim()?"Welcome back, "+name.trim():"My AVUQO"}</h2>
   <small>{signedIn?"Manage your favourites, watches, lists and shopping preferences in one warm, private place.":"Sign in for your real saved items, watches, lists and settings across devices."}</small>
  </div></div>
  <div className={styles.head}><h3>Your overview</h3><span>{signedIn?"Account-scoped information only":"Preview of the tools available when signed in"}</span></div>
  <div className={styles.grid}>{cards.map(({href,label,num,description,icon:Icon})=><Link className={styles.card} href={href} key={href}>
   <span className={styles.icon}><Icon size={22}/></span>
   <strong>{signedIn?(num===null?label:num.toLocaleString("en-GB")):label}</strong>
   <span>{description}</span>
  </Link>)}</div>
  <nav className={styles.actions} aria-label="More AVUQO tools"><Link href="/groceries">Grocery planning <ArrowRight size={15}/></Link>
   <Link href="/reality-check">Budgeting &amp; value guidance <ArrowRight size={15}/></Link>
   <Link href="/marketplace">Explore the marketplace <ArrowRight size={15}/></Link></nav>
  <p className={styles.note}>The counts shown, where available, come from signed-in account queries protected by current database access rules. Missing data is not shown as zero. No purchases, savings or price drops are invented.</p>
 </div></section>;
}