import { connection } from 'next/server';
import Link from 'next/link';
import { createClient } from '../../../lib/supabase/server';
import UploadForm from './UploadForm';
import ReviewDashboard from './ReviewDashboard';

export default async function FeedImportsPage() {
  await connection();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <main><h1>Sign in required</h1><Link href="/login">Sign in</Link></main>;
  const { data: role } = await supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle();
  if (!role || !['admin', 'owner'].includes(role.role)) return <main><h1>Access denied</h1></main>;

  const { data: runs, error } = await supabase.from('feed_import_runs')
    .select('id,created_at,filename,merchant_name,total_count,review_count,excluded_count,permission_status')
    .order('created_at', { ascending: false }).limit(10);
  const latest = runs?.[0];
  // Pilot limit is 2500 records; paginate at the API/db layer when this is expanded.
  const { data: records, error: recordsError } = latest ? await supabase.from('feed_import_records')
    .select('id,title,price,currency,status,reasons,merchant_product_id,brand,category,review_decision,review_notes')
    .eq('import_id', latest.id).order('created_at', { ascending: true }).range(0, 999) : { data: [], error: null };
  return <main style={{ display: 'grid', gap: 24, maxWidth: 1220, paddingBottom: 40 }}>
    <header><p style={{ color: '#6545d6', fontWeight: 750, letterSpacing: 1, fontSize: 12 }}>SOURCES / PRIVATE IMPORTS</p><h1 style={{ fontSize: 30, margin: '8px 0' }}>Product feed review</h1><p style={{ color: '#62627a' }}>Private pilot. No products are published, and affiliate links remain disabled while merchant rights are unverified.</p></header>
    <UploadForm />
    {error && <p role="alert">Import history unavailable: {error.message}</p>}
    <section><h2 style={{ marginBottom: 12 }}>Import history</h2><div style={{ overflowX: 'auto', border: '1px solid #e3e2eb', borderRadius: 12, background: 'white' }}><table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 680, fontSize: 14 }}><thead><tr>{['Date','Merchant','Received','Review','Excluded','Rights'].map(x => <th key={x} style={{ padding: 14, borderBottom: '1px solid #eee', textAlign: 'left', background: '#f7f6fb' }}>{x}</th>)}</tr></thead><tbody>{runs?.map(run => <tr key={run.id}><td style={{ padding: 12, borderBottom: '1px solid #eee' }}>{new Date(run.created_at).toLocaleString('en-GB')}</td><td style={{ padding: 12, borderBottom: '1px solid #eee' }}>{run.merchant_name}</td><td style={{ padding: 12, borderBottom: '1px solid #eee' }}>{run.total_count}</td><td style={{ padding: 12, borderBottom: '1px solid #eee' }}>{run.review_count}</td><td style={{ padding: 12, borderBottom: '1px solid #eee' }}>{run.excluded_count}</td><td style={{ padding: 12, borderBottom: '1px solid #eee' }}>{run.permission_status}</td></tr>)}</tbody></table></div></section>
    {recordsError && <p role="alert">Review table unavailable: {recordsError.message}. Apply the included SQL migration.</p>}
    {latest && !recordsError && <ReviewDashboard runName={latest.merchant_name} initialRecords={records ?? []} totalCount={latest.total_count} />}
    <Link href="/control-centre/sources">← Back to sources</Link>
  </main>;
}
