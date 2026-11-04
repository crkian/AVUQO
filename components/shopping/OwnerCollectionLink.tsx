"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {createClient} from "../../lib/supabase/client";
import styles from "./ShoppingDepartmentShelf.module.css";
export default function OwnerCollectionLink({href,merchant}:{href:string;merchant:string}){
 const [allowed,setAllowed]=useState(false);
 useEffect(()=>{
  let active=true;
  const db=createClient();
  async function verify(){
   const {data:{user}}=await db.auth.getUser();
   if(!user){if(active)setAllowed(false);return;}
   const {data}=await db.from("user_roles").select("role").eq("user_id",user.id).maybeSingle();
   const owner=data?.role==="owner"||data?.role==="admin";
   if(active)setAllowed(owner);
  }
  void verify();
  const {data:listener}=db.auth.onAuthStateChange(()=>{void verify();});
  return ()=>{active=false;listener.subscription.unsubscribe();};
 },[]);
 if(!allowed)return null;
 return <Link className={styles.ownerLink} href={href} aria-label={`Inspect private ${merchant} imports`}>Owner preview: inspect {merchant} products →</Link>;
}
