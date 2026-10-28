import { Suspense } from 'react';
import { connection } from 'next/server';
import { requireControlCentreAccess } from '../../../lib/auth/requireControlCentreAccess';
import { createClient } from '../../../lib/supabase/server';
import { createProduct, setProductStatus, setStoreStatus, updateProduct } from './actions';
import styles from './catalogue.module.css';

type Product={id:string;name:string;brand:string|null;pack_size:string;category:string;gtin:string|null;status:string};
function Inputs({product:p}:{product?:Product}){
  return <div className={styles.fields}>
    <label>Name<input name="name" defaultValue={p?.name??''} maxLength={180} required/></label>
    <label>Brand<input name="brand" defaultValue={p?.brand??''} maxLength={120}/></label>
    <label>Pack size<input name="pack_size" defaultValue={p?.pack_size??''} placeholder="e.g. 500g" maxLength={60} required/></label>
    <label>Category<input name="category" defaultValue={p?.category??''} maxLength={100} required/></label>
    <label>GTIN (8–14 digits, optional)<input name="gtin" defaultValue={p?.gtin??''} inputMode="numeric" pattern="[0-9]{8,14}" maxLength={14}/></label>
  </div>
}
async function GroceryAdminData(){
  await connection();await requireControlCentreAccess();
  const s=await createClient();
  const [stores,products,prices]=await Promise.all([
    s.from('grocery_stores').select('id,name,is_active').order('name'),
    s.from('grocery_products').select('id,name,brand,pack_size,category,gtin,status').order('created_at',{ascending:false}).limit(200),
    s.from('grocery_prices').select('id,status,usage_rights_confirmed,last_checked_at').limit(1000)
  ]);
  const all=(products.data??[]) as Product[], count=(v:string)=>all.filter(p=>p.status===v).length;
  return <main className={styles.wrap}>
    <p className={styles.eyebrow}>PRIVATE · CONTROL CENTRE</p><h1>Grocery catalogue</h1>
    <p className={styles.lede}>Manage exact product identities and supermarket listings. No authorised supermarket pricing feed is connected. Catalogue publication does not create or verify prices.</p>
    {(stores.error||products.error||prices.error)&&<p role="alert" className={styles.error}>Some grocery data could not be loaded. Check the Supabase migration and permissions before editing.</p>}
    <section className={styles.stats} aria-label="Catalogue overview"><div><strong>{all.length}</strong><span>Products loaded (max 200)</span></div><div><strong>{count('draft')}</strong><span>Drafts</span></div><div><strong>{count('published')}</strong><span>Published identities</span></div><div><strong>{count('archived')}</strong><span>Archived</span></div></section>
    <section className={styles.panel}><h2>Supermarket directory</h2><p>Listed means selectable, not connected to live prices.</p><div className={styles.stores}>{(stores.data??[]).map(store=><form action={setStoreStatus} key={store.id} className={styles.store}><input type="hidden" name="id" value={store.id}/><span><strong>{store.name}</strong><small>{store.is_active?'Listed':'Disabled'} · No verified feed connected</small></span><button name="active" value={store.is_active?'false':'true'}>{store.is_active?'Disable listing':'Enable listing'}</button></form>)}</div></section>
    <section className={styles.panel}><h2>Add catalogue product</h2><p>New products start as private drafts. Use the exact brand and package size when known.</p><form action={createProduct} className={styles.create}><Inputs/><button className={styles.primary} type="submit">Save as draft</button></form></section>
    <section className={styles.panel}><div className={styles.sectionHead}><div><h2>Catalogue</h2><p>Select a product to edit it directly beneath its row. Changes remain separate from supermarket price publication.</p></div><span className={styles.count}>{all.length} shown</span></div>
      {all.length===0?<p>No products yet. Add a draft above.</p>:<div className={styles.list}>{all.map(p=><article key={p.id} className={styles.product}>
        <div className={styles.productLine}><span><strong>{p.name}</strong><small>{p.brand||'Unbranded'} · {p.pack_size} · {p.category}</small></span><span className={`${styles.status} ${p.status==='published'?styles.published:p.status==='archived'?styles.archived:styles.draft}`}>{p.status}</span></div>
        <details className={styles.details}><summary>Inspect and edit</summary><div className={styles.editPanel}><p><strong>Product ID:</strong> <code>{p.id}</code></p><form action={updateProduct}><input type="hidden" name="id" value={p.id}/><Inputs product={p}/><button type="submit" className={styles.primary}>Save changes</button></form>
          <div className={styles.actions}><form action={setProductStatus}><input type="hidden" name="id" value={p.id}/><button name="status" value="draft">Make draft</button></form><form action={setProductStatus}><input type="hidden" name="id" value={p.id}/><button name="status" value="published">Publish identity only</button></form><form action={setProductStatus}><input type="hidden" name="id" value={p.id}/><button name="status" value="archived">Archive</button></form></div><small>Publishing a catalogue identity never publishes a supermarket price.</small>
        </div></details>
      </article>)}</div>}
    </section>
    <section className={styles.panel}><h2>Price verification</h2><p><strong>Not ready for publication.</strong> Source evidence, retailer usage rights and verified-price approval are required before price editing or publication can be enabled.</p><p>{prices.data?.length??0} internal price records inspected (limit 1,000). No price editing or publishing action is exposed.</p></section>
  </main>;
}
export default function GroceryAdmin(){return <Suspense fallback={<div className={styles.wrap}><h1>Grocery catalogue</h1><p>Loading private catalogue…</p></div>}><GroceryAdminData/></Suspense>}
