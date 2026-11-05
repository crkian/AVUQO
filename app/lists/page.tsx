"use client";

import Link from "next/link";
import {useRouter} from "next/navigation";
import {ArrowRight, Gift, House, ListChecks, Plane, Plus, Users} from "lucide-react";
import {useEffect,useMemo,useState} from "react";
import type {FormEvent} from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import {createClient} from "../../lib/supabase/client";
import styles from "./page.module.css";

type ListRow = {
  id:string;name:string;description:string|null;list_type:string;
  visibility:string;budget:number|null;created_at:string;
};
const types=[
  {value:"standard",label:"General list"},
  {value:"household",label:"Household"},
  {value:"gift",label:"Gifts"},
  {value:"trip",label:"Travel"},
] as const;
function iconFor(type:string){
  if(type==="household")return House;
  if(type==="gift")return Gift;
  if(type==="trip")return Plane;
  return ListChecks;
}
const formatMoney=(value:number)=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(value);

export default function ListsPage(){
  const db=useMemo(()=>createClient(),[]);
  const router=useRouter();
  const [rows,setRows]=useState<ListRow[]>([]);
  const [name,setName]=useState("");
  const [type,setType]=useState("standard");
  const [signedIn,setSignedIn]=useState(false);
  const [loading,setLoading]=useState(true);
  const [creating,setCreating]=useState(false);
  const [showForm,setShowForm]=useState(false);
  const [message,setMessage]=useState("");

  useEffect(()=>{
    let active=true;
    void (async()=>{
      const {data:auth}=await db.auth.getUser();
      if(!active)return;
      if(!auth.user){setLoading(false);return;}
      setSignedIn(true);
      const {data,error}=await db.from("shared_lists")
        .select("id,name,description,list_type,visibility,budget,created_at")
        .order("created_at",{ascending:false}).limit(150);
      if(!active)return;
      if(error)setMessage("Some lists could not be loaded.");
      else setRows((data??[]) as ListRow[]);
      setLoading(false);
    })();
    return ()=>{active=false};
  },[db]);

  async function create(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!name.trim()||creating)return;
    const {data:auth}=await db.auth.getUser();
    if(!auth.user){router.push("/login?next=/lists");return;}
    setCreating(true);
    const {error}=await db.from("shared_lists").insert({
      owner_id:auth.user.id,name:name.trim(),list_type:type,visibility:"private",
    });
    if(error){setMessage("Could not create your list. Please try again.");setCreating(false);return;}
    const {data, error:readError}=await db.from("shared_lists")
      .select("id,name,description,list_type,visibility,budget,created_at")
      .order("created_at",{ascending:false}).limit(150);
    if(!readError&&data)setRows(data as ListRow[]);
    setName("");setType("standard");setShowForm(false);setMessage("List created.");
    setCreating(false);
  }

  return <main className={styles.page}>
    <Header/>
    <section className="shell">
      <div className={styles.panel}>
        <div className={styles.heading}>
          <div className={styles.headingIcon}><ListChecks size={32}/></div>
          <div className={styles.headingCopy}>
            <p className={styles.kicker}>Your AVUQO</p><h1>My Lists</h1>
            <p>Plan, save and keep things organised. Create private lists for the moments and purchases that matter.</p>
          </div>
          <button type="button" className={styles.createButton} onClick={()=>signedIn?setShowForm(visible=>!visible):router.push("/login?next=/lists")} aria-expanded={showForm} aria-controls="new-list-form">
            <Plus size={18}/>{showForm?"Close form":"Create List"}
          </button>
        </div>
        {showForm&&signedIn&&<form className={styles.createForm} id="new-list-form" onSubmit={event=>void create(event)}>
          <label>List name<input value={name} onChange={event=>setName(event.target.value)} maxLength={100} placeholder="e.g. Christmas gifts" required autoFocus/></label>
          <label>List type<select value={type} onChange={event=>setType(event.target.value)}>{types.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <button type="submit" disabled={creating||!name.trim()}>{creating?"Creating…":"Save new list"}</button>
        </form>}
        {message&&<p className={styles.message} role="status">{message}</p>}
        <div className={styles.count}><span>{loading?"Loading your lists…":`${rows.length} ${rows.length===1?"list":"lists"}`}</span><small>Private by default. Sharing depends on account permissions.</small></div>
        {loading?<div className={styles.empty}>Loading lists…</div>
          : !signedIn?<div className={styles.empty}><Users size={37}/><h2>Sign in to organise your lists.</h2><p>Your lists are kept within your AVUQO account.</p><Link href="/login?next=/lists">Sign in <ArrowRight size={16}/></Link></div>
          : rows.length===0?<div className={styles.empty}><ListChecks size={37}/><h2>Create your first list.</h2><p>Perhaps Christmas gifts, a household plan or ideas for your next trip.</p><button type="button" onClick={()=>setShowForm(true)}>Create a list <Plus size={16}/></button></div>
          : <div className={styles.list}>{rows.map((row)=>{
              const Icon=iconFor(row.list_type);
              return <article className={styles.listRow} key={row.id}>
                <div className={styles.art} data-tone={row.list_type}><Icon size={36} aria-hidden="true"/></div>
                <div className={styles.listInfo}>
                  <p className={styles.listType}>{row.list_type==="standard"?"Your collection":row.list_type}</p>
                  <h2><Link href={`/lists/${row.id}`}>{row.name}</Link></h2>
                  <p>{row.description||"Open this list to view its saved items and details."}</p>
                  <div className={styles.meta}><span>{row.visibility}</span>{row.budget!=null&&<span>Budget {formatMoney(Number(row.budget))}</span>}</div>
                </div>
                <Link className={styles.listOpen} href={`/lists/${row.id}`}>Open list <ArrowRight size={17}/></Link>
              </article>;
            })}</div>}
        <p className={styles.note}>List budgets and saved prices, where present, are user-held planning information. They are not verified live retailer prices or confirmed shared-member counts.</p>
      </div>
    </section>
    <Footer/>
  </main>;
}
