"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {Store} from "lucide-react";
import {createClient} from "../../lib/supabase/client";
import styles from "../../app/homepage-warm.module.css";
/** Never present staged merchant products or images on the public homepage. */
export default function OwnerStorefrontShortcut(){
 const [allowed,setAllowed]=useState(false);
 useEffect(()=>{
  let mounted=true;
  const db=createClient();
  async function verify(){
   const {data:{user}}=await db.auth.getUser();
   if(!user){if(mounted)setAllowed(false);return;}
   const {data}=await db.from("user_roles").select("role").eq("user_id",user.id).maybeSingle();
   if(mounted)setAllowed(data?.role==="owner"||data?.role==="admin");
  }
  void verify();
  const {data:listener}=db.auth.onAuthStateChange(()=>{void verify();});
  return ()=>{mounted=false;listener.subscription.unsubscribe();};
 },[]);
 if(!allowed)return null;
 return <aside className={styles.ownerPreview} aria-label="Owner-only storefront preview">
  <span><Store size={20} aria-hidden="true"/><strong>Private storefront rehearsal</strong><small>Preview real staged products, departments and individual pages across devices. No public listings.</small></span>
  <Link href="/preview/storefront">Open private shop →</Link>
 </aside>;
}
