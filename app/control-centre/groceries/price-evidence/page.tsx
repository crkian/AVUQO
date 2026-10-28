import Link from 'next/link';
import { Suspense } from 'react';
import { connection } from 'next/server';
import { requireControlCentreAccess } from '../../../../lib/auth/requireControlCentreAccess';
import { createClient } from '../../../../lib/supabase/server';
import { reviewGroceryPriceEvidence,submitGroceryPriceEvidence } from './actions';
import styles from './price-evidence.module.css';

type Product={id:string;name:string;brand:string|null;pack_size:string;status:string};
type Store={id:string;name:string};
type Evidence={id:string;product_id:string;store_id:string;price_pence:number;source_kind:string;source_reference:string;evidence_notes:string;observed_at:string;usage_rights_status:string;review_status:string;created_at:string};
async function EvidenceData(){
 await connection();await requireControlCentreAccess();
 const db=await createClient();
 const [p,s,e]=await Promise.all([
   db.from('grocery_products').select('id,name,brand,pack_size,status').order('name').limit(250),
   db.from('grocery_stores').select('id,name').order('name'),
   db.from('grocery_price_evidence').select('id,product_id,store_id,price_pence,source_kind,source_reference,evidence_notes,observed_at,usage_rights_status,review_status,created_at').order('created_at',{ascending:false}).limit(100)
 ]);
 const products=(p.data??[]) as Product[],stores=(s.data??[]) as Store[],records=(e.data??[]) as Evidence[];
 const names=new Map(products.map(x=>[x.id,`${x.name} · ${x.brand??'Unbranded'} · ${x.pack_size}`]));
 const storeNames=new Map(stores.map(x=>[x.id,x.name]));
 return <main className={styles.wrap}>
  <p className={styles.eyebrow}>PRIVATE · CONTROL CENTRE</p>
  <h1>Grocery price evidence</h1>
  <p className={styles.lede}>Record observed prices and their source evidence for internal assessment. Nothing on this page publishes a price, activates a supermarket feed or confirms usage rights.</p>
  <Link href="/control-centre/groceries">← Grocery catalogue</Link>
  {(p.error||s.error||e.error)&&<div role="alert" className={styles.notice}>Grocery data could not be loaded fully. Verify the SQL migration and your admin permissions before proceeding.</div>}
  <section className={styles.grid}><div><strong>{records.length}</strong><span>Evidence records shown (max 100)</span></div><div><strong>{records.filter(x=>x.review_status==='pending').length}</strong><span>Pending review</span></div><div><strong>{records.filter(x=>x.review_status==='reviewed').length}</strong><span>Internally reviewed, not published</span></div></section>
  <section className={styles.panel}><h2>Add private price evidence</h2><p>Enter a price only where you have real observation details. This is a private record, not a retailer-price publication.</p>
  <form action={submitGroceryPriceEvidence} className={styles.fields}>
   <label>Exact catalogue product<select name="product_id" required defaultValue=""><option value="" disabled>Choose an existing product</option>{products.map(x=><option key={x.id} value={x.id}>{x.name} · {x.pack_size} ({x.status})</option>)}</select></label>
   <label>Supermarket<select name="store_id" required defaultValue=""><option value="" disabled>Choose a supermarket</option>{stores.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
   <label>Observed package price (GBP)<input name="price" required placeholder="2.50" inputMode="decimal" pattern="(?:0|[1-9][0-9]{0,6})\.[0-9]{2}" /></label>
   <label>Source type<select name="source_kind" required defaultValue="manual_check"><option value="manual_check">Manual check</option><option value="licensed_feed">Licensed feed</option><option value="retailer_api">Authorised retailer API</option><option value="data_provider">Contracted data provider</option></select></label>
   <label>Observed on (local time)<input name="observed_at" type="datetime-local" required /></label>
   <label>Source reference (internal)<input name="source_reference" required minLength={5} maxLength={400} placeholder="Receipt ID, evidence reference or authorised source identifier"/></label>
   <label className={styles.wide}>Evidence notes<textarea name="evidence_notes" required minLength={10} maxLength={2000} rows={3} placeholder="What exactly was checked, pack size, geographic or channel limitations, any usage rights information"/></label>
   <button type="submit" className={styles.primary}>Save private evidence</button>
  </form><p className={styles.notice}>All new records begin with unverified usage rights and pending review. Recording evidence does not establish permission to display a retailer price.</p></section>
  <section className={styles.panel}><h2>Private review queue</h2>{records.length===0?<p>No evidence recorded yet.</p>:<div className={styles.records}>{records.map(x=><article key={x.id} className={styles.record}><div className={styles.row}><div><strong>{names.get(x.product_id)??x.product_id}</strong><span>{storeNames.get(x.store_id)??x.store_id} · £{(x.price_pence/100).toFixed(2)} · {x.review_status}</span></div><small>{new Date(x.observed_at).toLocaleString('en-GB')}</small></div><details><summary>Inspect evidence and review</summary><div className={styles.details}><p><strong>Source:</strong> {x.source_kind} · {x.source_reference}</p><p><strong>Evidence:</strong> {x.evidence_notes}</p><p><strong>Rights:</strong> {x.usage_rights_status} · <strong>Review:</strong> {x.review_status}</p><form action={reviewGroceryPriceEvidence} className={styles.actions}><input name="id" type="hidden" value={x.id}/><button name="status" value="reviewed">Reviewed (internal only)</button><button name="status" value="needs_attention">Needs attention</button><button name="status" value="rejected">Reject</button><button name="status" value="pending">Reset pending</button></form></div></details></article>)}</div>}</section>
 </main>;
}
export default function GroceryPriceEvidence(){return <Suspense fallback={<main className={styles.wrap}><h1>Grocery price evidence</h1><p>Loading private price evidence…</p></main>}><EvidenceData/></Suspense>}
