"use client";
import {useCallback,useEffect,useState} from "react";
import Link from "next/link";
import styles from "./CookieConsent.module.css";

// Change this version and the public notice before connecting any new optional vendor.
const VERSION=1;
const NAME="avuqo_cookie_preferences_v1";
type Choices={version:number;essential:true;analytics:boolean;marketing:boolean;at:string};
function read():Choices|null{
 try{const raw=document.cookie.split("; ").find(x=>x.startsWith(NAME+"="))?.slice(NAME.length+1);
 if(!raw)return null;const value:unknown=JSON.parse(decodeURIComponent(raw));
 if(!value||typeof value!=="object")return null;
 const c=value as Partial<Choices>;
 if(c.version!==VERSION||typeof c.analytics!=="boolean"||typeof c.marketing!=="boolean")return null;
 return {version:VERSION,essential:true,analytics:c.analytics,marketing:c.marketing,at:typeof c.at==="string"?c.at:""};
 }catch{return null}
}
function persist(analytics:boolean,marketing:boolean):Choices{
 const choice:Choices={version:VERSION,essential:true,analytics,marketing,at:new Date().toISOString()};
 document.cookie=`${NAME}=${encodeURIComponent(JSON.stringify(choice))}; Max-Age=15552000; Path=/; SameSite=Lax${location.protocol==="https:"?"; Secure":""}`;
 window.dispatchEvent(new CustomEvent("avuqo:cookie-preferences-changed",{detail:choice}));
 return choice;
}
export function CookieSettingsButton({className}:{className?:string}){
 return <button type="button" className={className??styles.textButton} onClick={()=>window.dispatchEvent(new Event("avuqo:open-cookie-settings"))}>Cookie preferences</button>;
}
export default function CookieConsent(){
 const[ready,setReady]=useState(false);
 const[show,setShow]=useState(false);
 const[details,setDetails]=useState(false);
 const[analytics,setAnalytics]=useState(false);
 const[marketing,setMarketing]=useState(false);
 useEffect(()=>{
  let cancelled=false;
  // Initialize after the mount effect to avoid synchronous state cascades.
  queueMicrotask(()=>{
    if(cancelled)return;
    const saved=read();setReady(true);
    if(!saved)setShow(true);
    else{setAnalytics(saved.analytics);setMarketing(saved.marketing);}
  });
  const open=()=>{const latest=read();setAnalytics(latest?.analytics??false);setMarketing(latest?.marketing??false);setDetails(true);setShow(true)};
  window.addEventListener("avuqo:open-cookie-settings",open);
  return ()=>{cancelled=true;window.removeEventListener("avuqo:open-cookie-settings",open)};
 },[]);
 const save=useCallback((a:boolean,m:boolean)=>{
  const c=persist(a,m);
  setAnalytics(c.analytics);setMarketing(c.marketing);setShow(false);setDetails(false);
 },[]);
 useEffect(()=>{if(!details)return;const key=(e:KeyboardEvent)=>{if(e.key==="Escape")setDetails(false)};
 window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key)},[details]);
 if(!ready||!show)return null;
 return <aside className={styles.overlay} aria-label="Cookie choices"><div className={styles.banner} role="region" aria-label="AVUQO cookie preferences">
  <div className={styles.intro}><span className={styles.kicker}>Your privacy matters</span><h2>Cookies, your choice.</h2><p>AVUQO uses essential storage for things such as sign-in and security. Optional analytics and marketing categories are not currently connected. We will ask again if our optional technologies or purposes change.</p><Link href="/cookie-preferences">How cookies work on AVUQO</Link></div>
  {details&&<fieldset className={styles.options}><legend>Choose optional purposes</legend>
    <label><span><strong>Essential</strong><small>Sign-in, security and remembering your consent choice. Always on.</small></span><input type="checkbox" checked disabled aria-label="Essential cookies required"/></label>
    <label><span><strong>Analytics</strong><small>Preference for future, disclosed measurement. No optional analytics technology currently enabled.</small></span><input type="checkbox" checked={analytics} onChange={e=>setAnalytics(e.target.checked)} /></label>
    <label><span><strong>Marketing</strong><small>Preference for future, disclosed advertising measurement. No optional marketing cookies currently enabled.</small></span><input type="checkbox" checked={marketing} onChange={e=>setMarketing(e.target.checked)} /></label>
   </fieldset>}
  <div className={styles.actions}>
   <button type="button" className={styles.choice} onClick={()=>save(false,false)}>Reject optional</button>
   <button type="button" className={styles.choice} onClick={()=>save(true,true)}>Accept optional</button>
   {details?<button type="button" className={styles.choice} onClick={()=>save(analytics,marketing)}>Save my choices</button>:<button type="button" className={styles.custom} onClick={()=>setDetails(true)}>Customise</button>}
  </div>
  <p className={styles.footnote}>A saved preference does not authorise undisclosed future trackers. New technologies require a fresh notice and consent review.</p>
 </div></aside>;
}
