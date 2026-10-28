'use server';
import { revalidatePath } from 'next/cache';
import { requireControlCentreAccess } from '../../../../lib/auth/requireControlCentreAccess';
import { createClient } from '../../../../lib/supabase/server';

const path='/control-centre/groceries/price-evidence';
const stringField=(form:FormData,key:string,max:number)=>String(form.get(key)??'').trim().slice(0,max);
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function submitGroceryPriceEvidence(form:FormData){
  await requireControlCentreAccess();
  const s=await createClient();
  const product_id=stringField(form,'product_id',40), store_id=stringField(form,'store_id',60);
  const price=stringField(form,'price',30),source_kind=stringField(form,'source_kind',30);
  const source_reference=stringField(form,'source_reference',400),evidence_notes=stringField(form,'evidence_notes',2000);
  const observed=stringField(form,'observed_at',40);
  if(!uuid.test(product_id)||!/^[a-z0-9_-]{2,60}$/.test(store_id)) throw new Error('Choose a valid product and supermarket');
  if(!/^(?:0|[1-9]\d{0,6})\.\d{2}$/.test(price) || Number(price)<=0)throw new Error('Price must be positive GBP with exactly two decimals');
  if(!['licensed_feed','retailer_api','manual_check','data_provider'].includes(source_kind))throw new Error('Invalid source');
  if(source_reference.length<5||evidence_notes.length<10)throw new Error('Source reference and evidence notes are required');
  const observed_at=new Date(observed);
  if(!Number.isFinite(observed_at.getTime())||observed_at.getTime()>Date.now()+60000)throw new Error('Invalid observation date');
  const price_pence=Number(price.split('.')[0])*100+Number(price.split('.')[1]);
  const {error}=await s.from('grocery_price_evidence').insert({product_id,store_id,price_pence,currency:'GBP',source_kind,source_reference,evidence_notes,observed_at:observed_at.toISOString(),review_status:'pending',usage_rights_status:'unverified'});
  if(error)throw new Error('Price evidence not saved. Check admin rights and migration.');
  revalidatePath(path);
}
export async function reviewGroceryPriceEvidence(form:FormData){
  await requireControlCentreAccess();
  const s=await createClient();const id=stringField(form,'id',40),status=stringField(form,'status',30);
  if(!uuid.test(id)||!['reviewed','needs_attention','rejected','pending'].includes(status))throw new Error('Invalid review decision');
  const {data:{user},error:userError}=await s.auth.getUser();
  if(userError||!user)throw new Error('Authentication required');
  const {error}=await s.from('grocery_price_evidence').update({review_status:status,reviewed_at:status==='pending'?null:new Date().toISOString(),reviewed_by:status==='pending'?null:user.id,updated_at:new Date().toISOString()}).eq('id',id);
  if(error)throw new Error('Unable to record review');
  revalidatePath(path);
}
