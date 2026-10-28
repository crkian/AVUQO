'use server';
import { revalidatePath } from 'next/cache';
import { requireControlCentreAccess } from '../../../lib/auth/requireControlCentreAccess';
import { createClient } from '../../../lib/supabase/server';

async function admin() { await requireControlCentreAccess(); return createClient(); }
const field = (f:FormData,k:string,max:number) => String(f.get(k)??'').trim().slice(0,max);
const cleanProduct = (f:FormData) => {
  const name=field(f,'name',180), pack_size=field(f,'pack_size',60), category=field(f,'category',100);
  if(!name||!pack_size||!category) throw new Error('Name, pack size and category are required');
  const gtin=field(f,'gtin',20);
  if(gtin && !/^\d{8,14}$/.test(gtin)) throw new Error('GTIN must contain 8 to 14 digits');
  return {name,pack_size,category,brand:field(f,'brand',120)||null,gtin:gtin||null};
};
const refresh=()=>{revalidatePath('/control-centre/groceries');revalidatePath('/groceries');};
export async function setStoreStatus(form:FormData){
  const s=await admin(); const id=field(form,'id',80), active=field(form,'active',10)==='true';
  if(!id)throw new Error('Missing store');
  const {error}=await s.from('grocery_stores').update({is_active:active}).eq('id',id);
  if(error)throw new Error('Unable to update store'); refresh();
}
export async function createProduct(form:FormData){
  const s=await admin(); const {error}=await s.from('grocery_products').insert({...cleanProduct(form),status:'draft'});
  if(error)throw new Error('Unable to save draft product'); refresh();
}
export async function updateProduct(form:FormData){
  const s=await admin(); const id=field(form,'id',50);if(!/^[0-9a-f-]{36}$/i.test(id))throw new Error('Invalid product ID');
  const {error}=await s.from('grocery_products').update({...cleanProduct(form),updated_at:new Date().toISOString()}).eq('id',id);
  if(error)throw new Error('Unable to update product'); refresh();
}
export async function setProductStatus(form:FormData){
  const s=await admin(); const id=field(form,'id',50), status=field(form,'status',20);
  if(!/^[0-9a-f-]{36}$/i.test(id)||!['published','archived','draft'].includes(status))throw new Error('Invalid product status');
  const {error}=await s.from('grocery_products').update({status,updated_at:new Date().toISOString()}).eq('id',id);
  if(error)throw new Error('Unable to update product status'); refresh();
}
