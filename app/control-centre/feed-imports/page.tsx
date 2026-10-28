import { connection } from 'next/server';
import Link from 'next/link';
import { createClient } from '../../../lib/supabase/server';
import UploadForm from './UploadForm';

export const instant = false;
export default async function FeedImportsPage() {
  await connection();
  const supabase = await createClient();
  const { data: runs, error } = await supabase.from('feed_import_runs')
    .select('id,created_at,filename,merchant_name,total_count,review_count,excluded_count,permission_status')
    .order('created_at', { ascending: false }).limit(10);
  const runId = runs?.[0]?.id;
  const { data: records } = runId ? await supabase.from('feed_import_records')
    .select('id,title,price,currency,status,reasons,merchant_product_id')
    .eq('import_id', runId).order('created_at', { ascending: true }).limit(100) : { data: [] };
  return <main style={{ display: 'grid', gap: 22, maxWidth: 1120 }}>
    <div><p style={{ color: '#5b40e2', fontWeight: 700 }}>SOURCES / PRIVATE IMPORTS</p><h1>Awin feed imports</h1><p>Upload AKKO's authorised sample only. Every record remains private, with affiliate links disabled and merchant rights unverified.</p></div>
    <UploadForm />
    {error && <p role="alert">Database setup needed: {error.message}</p>}
    <section><h2>Recent import runs</h2><div style={{ overflowX:'auto' }}><table style={{ width:'100%', background:'white', borderCollapse:'collapse' }}><thead><tr><th>Date</th><th>Merchant</th><th>Received</th><th>Review</th><th>Excluded</th><th>Rights</th></tr></thead><tbody>{runs?.map(run => <tr key={run.id}><td>{new Date(run.created_at).toLocaleString('en-GB')}</td><td>{run.merchant_name}</td><td>{run.total_count}</td><td>{run.review_count}</td><td>{run.excluded_count}</td><td>{run.permission_status}</td></tr>)}</tbody></table></div></section>
    <section><h2>Latest run: first 100 records</h2><p>No affiliate links or publication controls are exposed in this pilot.</p><div style={{ overflowX:'auto' }}><table style={{ width:'100%', background:'white', borderCollapse:'collapse' }}><thead><tr><th>Status</th><th>Product</th><th>Price</th><th>Merchant ID</th><th>Reason</th></tr></thead><tbody>{records?.map(r => <tr key={r.id}><td>{r.status}</td><td>{r.title}</td><td>{r.price} {r.currency}</td><td>{r.merchant_product_id}</td><td>{(r.reasons || []).join(', ')}</td></tr>)}</tbody></table></div></section>
    <Link href="/control-centre/sources">Back to sources</Link>
  </main>;
}
