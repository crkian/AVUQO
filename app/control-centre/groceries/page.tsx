import { Suspense } from 'react';
import { connection } from 'next/server';
import { requireControlCentreAccess } from '../../../lib/auth/requireControlCentreAccess';
import { createClient } from '../../../lib/supabase/server';
import { createProduct, setProductStatus, setStoreStatus } from './actions';
async function GroceryAdminData(){
  await connection();await requireControlCentreAccess();
  const s=await createClient();const [stores,products,prices]=await Promise.all([s.from('grocery_stores').select('id,name,is_active').order('name'),s.from('grocery_products').select('id,name,brand,pack_size,status').order('created_at',{ascending:false}).limit(50),s.from('grocery_prices').select('id,status,usage_rights_confirmed').limit(1000)]);
  return <div style={{maxWidth:980}}><p style={{color:'#634db3',fontWeight:700}}>PRIVATE · CONTROL CENTRE</p><h1>Groceries</h1><p>Manage the grocery catalogue and store directory. All third-party price integrations are disabled. Product publication does not create retailer prices.</p>
    {(stores.error||products.error||prices.error)&&<p role="alert">Groceries tables unavailable. Apply the included migration first.</p>}
    <section><h2>Supported supermarkets</h2><div style={{display:'grid',gap:12}}>{(stores.data??[]).map(store=><form action={setStoreStatus} key={store.id} style={{display:'flex',justifyContent:'space-between',background:'#f4f1fa',padding:14,borderRadius:10}}><input name="id" type="hidden" value={store.id}/><span>{store.name} · {store.is_active?'Listed':'Disabled'} · No verified feed connected</span><button name="active" value={store.is_active?'false':'true'}>{store.is_active?'Disable listing':'Enable listing'}</button></form>)}</div></section>
    <section style={{marginTop:30}}><h2>Add catalogue product</h2><form action={createProduct} style={{display:'grid',gap:12,maxWidth:480}}><label>Name <input name="name" required maxLength={180}/></label><label>Brand <input name="brand" maxLength={120}/></label><label>Pack size <input name="pack_size" required maxLength={60} placeholder="e.g. 500g"/></label><label>Category <input name="category" required maxLength={100}/></label><label>GTIN (optional) <input name="gtin" maxLength={20}/></label><button type="submit">Save as draft</button></form></section>
    <section style={{marginTop:30}}><h2>Catalogue</h2><p>Draft products are not available to shoppers. Publishing a product alone does not establish live prices.</p>{(products.data??[]).map(p=><form key={p.id} action={setProductStatus} style={{display:'flex',justifyContent:'space-between',gap:12,padding:'10px 0',borderBottom:'1px solid #ddd'}}><input type="hidden" name="id" value={p.id}/><span>{p.name} · {p.brand??'Unbranded'} · {p.pack_size} · {p.status}</span><button name="status" value={p.status==='published'?'archived':'published'}>{p.status==='published'?'Archive':'Publish catalogue listing'}</button></form>)}</section><p style={{marginTop:24}}>Price management: unavailable until a rights-verified price source and evidence workflow are connected. {prices.data?.length??0} internal price records inspected.</p></div>
}

export default function GroceryAdmin(){
  return (
    <Suspense fallback={<div style={{padding:24}}><h1>Groceries · Control Centre</h1><p>Loading private grocery management…</p></div>}>
      <GroceryAdminData />
    </Suspense>
  );
}
