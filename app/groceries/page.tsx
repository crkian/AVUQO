import { Suspense } from 'react';
import Link from 'next/link';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { connection } from 'next/server';
import { createClient } from '../../lib/supabase/server';
import GroceryClient from './GroceryClient';
async function GroceryData() {
  await connection();
  const supabase=await createClient();
  const [storeResult,productResult,priceResult]=await Promise.all([
    supabase.from('grocery_stores').select('id,name').eq('is_active',true).order('name'),
    supabase.from('grocery_products').select('id,name,brand,pack_size,category').eq('status','published').order('name').limit(200),
    supabase.from('grocery_prices').select('product_id,store_id,price_pence,currency,status,is_available,usage_rights_confirmed,last_checked_at,expires_at').eq('status','published').eq('is_available',true).eq('usage_rights_confirmed',true).limit(2000)
  ]);
  const stores=storeResult.data??[]; const products=productResult.data??[];const prices=priceResult.data??[];
  return <GroceryClient stores={stores} products={products} prices={prices} unavailable={Boolean(storeResult.error||productResult.error||priceResult.error)} />;
}

export default function GroceriesPage() {
  return (
    <>
    <Header />
    <nav aria-label="Grocery page navigation" style={{maxWidth:1190,margin:"16px auto 0",padding:"0 20px",display:"flex",gap:16,flexWrap:"wrap",fontWeight:650}}><Link href="/">Home</Link><Link href="/lists">Shared Lists</Link><Link href="/groceries" aria-current="page">Groceries</Link></nav>
    <Suspense fallback={<main style={{maxWidth:1100,margin:'40px auto',padding:24}}><h1>AVUQO Groceries</h1><p>Loading supermarket availability and your shopping tools…</p></main>}>
      <GroceryData />
    </Suspense>
    <Footer />
    </>
  );
}
