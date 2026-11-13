"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {ArrowRight,Heart,Bell,ListChecks,UserRound} from "lucide-react";
import {createClient} from "../../lib/supabase/client";
import styles from "./MyAVUQODashboard.module.css";
type Counts={saved:number|null;watches:number|null;lists:number|null};
export default function MyAVUQODashboard({signedIn,name}:{signedIn:boolean|null;name:string}){
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
  {href:"/saved",label:"Saved items",num:counts.saved,description:"Keep products you want to revisit",icon:Heart},
  {href:"/watches",label:"Price watches",num:counts.watches,description:"Track the offers you’re watching",icon:Bell},
  {href:"/lists",label:"Shopping lists",num:counts.lists,description:"Organise private and shared plans",icon:ListChecks}
 ];
 return <section className={styles.wrap} aria-labelledby="my-avuqo-title"><div className="shell">
  <div className={styles.hero}>
   <div className={styles.identity}><span className={styles.avatar}><UserRound size={28} aria-hidden="true"/></span>
    <div><h1 id="my-avuqo-title">My AVUQO</h1>
     {signedIn!==null&&<p>{signedIn&&name.trim()?"Welcome back, "+name.trim():signedIn?"Your saved finds and shopping plans.":"Sign in to keep your finds and shopping plans together."}</p>}
    </div>
   </div>
   {signedIn!==null&&<Link className={styles.heroAction} href={signedIn?"#account-preferences":"/login?next=/account"}>
    {signedIn?"Edit preferences":"Sign in"} <ArrowRight size={16} aria-hidden="true"/>
   </Link>}
  </div>
  <h2 className={styles.heading}>{signedIn?"Your overview":"Your shopping tools"}</h2>
  <div className={styles.grid}>{cards.map(({href,label,num,description,icon:Icon})=><Link className={styles.card} href={href} key={href}>
   <span className={styles.icon}><Icon size={23} aria-hidden="true"/></span>
   <span className={styles.cardCopy}><strong>{label}</strong><span>{description}</span></span>
   {signedIn&&num!==null?<span className={styles.count}>{num.toLocaleString("en-GB")}</span>:<ArrowRight className={styles.arrow} size={17} aria-hidden="true"/>}
  </Link>)}</div>
 </div></section>;
}
