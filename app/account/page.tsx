"use client";

import Link from "next/link";
import {useEffect,useMemo,useState} from "react";
import type {FormEvent} from "react";
import MyAVUQODashboard from "../../components/account/MyAVUQODashboard";
import Footer from "../../components/layout/Footer";
import Header from "../../components/layout/Header";
import {createClient} from "../../lib/supabase/client";
import styles from "./page.module.css";

export default function AccountPage(){
 const supabase=useMemo(()=>createClient(),[]);
 const [email,setEmail]=useState("");
 const [name,setName]=useState("");
 const [country,setCountry]=useState("GB");
 const [budget,setBudget]=useState("balanced");
 const [message,setMessage]=useState("");
 const [error,setError]=useState(false);
 const [saving,setSaving]=useState(false);
 const [signedIn,setSignedIn]=useState<boolean|null>(null);

 useEffect(()=>{
  let active=true;
  async function load(){
   const {data:{user}}=await supabase.auth.getUser();
   if(!active)return;
   if(!user){setSignedIn(false);return;}
   const {data:profile,error:profileError}=await supabase.from("profiles")
    .select("display_name,home_country,preferences").eq("id",user.id).maybeSingle();
   if(!active)return;
   setEmail(user.email??"");
   setName(profile?.display_name??"");
   setCountry(profile?.home_country??"GB");
   const preferences=profile?.preferences as Record<string,unknown>|null|undefined;
   if(typeof preferences?.shoppingStyle==="string")setBudget(preferences.shoppingStyle);
   if(profileError){setError(true);setMessage("Your profile could not be loaded. Refresh the page to try again.");}
   setSignedIn(true);
  }
  void load();
  return ()=>{active=false;};
 },[supabase]);

 async function save(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(saving)return;
  setSaving(true);
  setMessage("");
  try{
   const {data:{user}}=await supabase.auth.getUser();
   if(!user){location.href="/login?next=/account";return;}
   const {data:profile,error:readError}=await supabase.from("profiles").select("preferences").eq("id",user.id).maybeSingle();
   if(readError)throw readError;
   const preferences=profile?.preferences;
   const {error:writeError}=await supabase.from("profiles").upsert({
    id:user.id,display_name:name.trim()||null,home_country:country,
    preferences:{...(preferences&&typeof preferences==="object"&&!Array.isArray(preferences)?preferences:{}),shoppingStyle:budget}
   });
   if(writeError)throw writeError;
   setError(false);
   setMessage("Preferences saved.");
  }catch{
   setError(true);
   setMessage("Preferences could not be saved. Please try again.");
  }finally{setSaving(false);}
 }

 return <main className={styles.page}>
  <Header/>
  <MyAVUQODashboard signedIn={signedIn} name={name}/>
  {signedIn===true&&<section className={`shell ${styles.layout}`} id="account-preferences" aria-labelledby="preferences-title">
   <article className={styles.card}>
    <h2 id="preferences-title">Profile &amp; preferences</h2>
    {email&&<p className={styles.email}>{email}</p>}
    <form className={styles.form} onSubmit={save}>
     <fieldset disabled={saving}>
      <label>Display name<input autoComplete="nickname" value={name} onChange={e=>setName(e.target.value)}/></label>
      <label>Home market<select value={country} onChange={e=>setCountry(e.target.value)}><option value="GB">United Kingdom</option><option value="US">United States</option><option value="IE">Ireland</option></select></label>
      <label>Shopping style<select value={budget} onChange={e=>setBudget(e.target.value)}><option value="value-first">Value first</option><option value="balanced">Balanced</option><option value="premium">Premium when worth it</option></select></label>
      <button type="submit">{saving?"Saving…":"Save preferences"}</button>
     </fieldset>
     {message&&<p className={error?styles.error:styles.message} role={error?"alert":"status"}>{message}</p>}
    </form>
   </article>
   <aside className={styles.card}>
    <h2>Planning tools</h2>
    <nav className={styles.links} aria-label="Planning tools">
     <Link href="/wishlist">Wishlist <span aria-hidden="true">→</span></Link>
     <Link href="/basket">Comparison basket <span aria-hidden="true">→</span></Link>
     <Link href="/groceries">Grocery planning <span aria-hidden="true">→</span></Link>
     <Link href="/reality-check">Reality Check <span aria-hidden="true">→</span></Link>
    </nav>
   </aside>
  </section>}
  <Footer/>
 </main>;
}
