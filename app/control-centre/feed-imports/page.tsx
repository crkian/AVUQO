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
    .select('id,created_at,filename,merchant_name,total_count,review_count,excluded_count,permission_status,status')
    .order('created_at', { ascending: false }).limit(10);
  const latest = runs?.find(run => run.status === 'private_review');
  // Pilot limit is 2500 records; paginate at the API/db layer when this is expanded.
  const { data: records, error: recordsError } = latest ? await supabase.from('feed_import_records')
    .select('id,title,price,currency,status,reasons,merchant_product_id,brand,category,review_decision,review_notes,image_url')
    .eq('import_id', latest.id).order('created_at', { ascending: true }).range(0, 999) : { data: [], error: null };
  return <main style={{ display: 'grid', gap: 24, maxWidth: 1220, paddingBottom: 40 }}>
    <header><p style={{ color: '#6545d6', fontWeight: 750, letterSpacing: 1, fontSize: 12 }}>SOURCES / PRIVATE IMPORTS</p><h1 style={{ fontSize: 30, margin: '8px 0' }}>Product feed review</h1><p style={{ color: '#62627a' }}>Private pilot. No products are published, and affiliate links remain disabled while merchant rights are unverified.</p></header>
    <div style={{padding:17,border:"1px solid #e7dff0",background:"#faf7ff",borderRadius:14,display:"grid",gap:9}}>
      <strong style={{fontSize:15}}>Check how imported products will look</strong>
      <p style={{fontSize:12,margin:0,color:"#74677f"}}>Open the private Product Preview Gallery to inspect staged product cards across merchants and mobile layouts. No prices or images are published.</p>
      <Link href="/control-centre/product-previews" style={{fontWeight:850,color:"#5838b2"}}>Open Product Preview Gallery →</Link>
    </div>
    <section style={{padding:20,background:"#f7f2ec",border:"1px solid #e9dfe5",borderRadius:17,display:"grid",gap:8}}>
     <strong style={{fontSize:20}}>All 16 accepted Awin programmes</strong>
     <p style={{fontSize:13,lineHeight:1.65,margin:0,color:"#6f6675"}}>Review every joined advertiser, including large feeds, products, services and programmes without recorded feed data. None is excluded from the source register because of size. Downloads and public offers still require independent checks.</p>
     <Link href="/control-centre/awin-programmes" style={{display:"inline-flex",alignItems:"center",minHeight:44,fontWeight:850,color:"#6043a3"}}>Open full Awin programme register →</Link>
    </section>
    <div style={{padding:18,border:'1px solid #e7dff0',background:'#faf7ff',borderRadius:14,display:'grid',gap:7}}><strong>Large Awin catalogue: Tooled-Up</strong><p style={{margin:0,fontSize:13,color:'#74677f'}}>Import the 84,284-product full-range feed in resumable batches with private brand and model information. This is separate from the 2,500-row standard importer.</p><Link href="/control-centre/large-feed-import" style={{fontWeight:800}}>Open Tooled-Up large-feed importer →</Link></div>
    <section id="next-merchant-feeds" style={{display:"grid",gap:13,padding:20,border:"1px solid #e7dfe9",borderRadius:18,background:"#faf8f3"}}>
      <div><p style={{margin:0,color:"#85666c",fontSize:11,fontWeight:850,letterSpacing:1.2}}>JOINED AWIN · NEXT PRIVATE IMPORTS</p>
       <h2 style={{fontSize:23,letterSpacing:"-.035em",margin:"8px 0"}}>More real product feeds to add</h2>
       <p style={{fontSize:13,lineHeight:1.7,margin:0,color:"#726975"}}>Verified from the 4 November 2026 active feed inventory. These are source feed listings, not approved public products. Download the relevant CSV securely from your Awin publisher account, then import with the exact advertiser selected below.</p></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,235px),1fr))",gap:12}}>
        {[
          {id:"31539",name:"Mozillion",feed:"74135",label:"SIM-free phones",count:224},
          {id:"37738",name:"1pMobile",feed:"81201",label:"Mobile plans",count:10},
          {id:"118401",name:"Compare Parking Prices UK",feed:"109353",label:"Parking comparison",count:60},
          {id:"128157",name:"Lyca Mobile UK",feed:"116573",label:"Mobile plans",count:10},
          {id:"31539",name:"Mozillion",feed:"97136",label:"SIM-only plans",count:33},
          {id:"77952",name:"Petlibro UK",feed:"119009",label:"New hero SKU feed",count:19}
        ].map(item=><article key={item.feed} style={{display:"grid",alignContent:"space-between",gap:9,background:"#fff",padding:16,border:"1px solid #eae4e8",borderRadius:14}}>
         <div style={{display:"grid",gap:6}}><strong style={{fontSize:15}}>{item.name}</strong><span style={{color:"#756b79",fontSize:12}}>{item.label}</span><span style={{fontSize:12}}>Awin advertiser {item.id} · feed {item.feed}</span><span style={{fontWeight:800,fontSize:13}}>{item.count.toLocaleString("en-GB")} listed products</span></div>
         <Link href="#standard-awin-upload" style={{display:"inline-flex",alignItems:"center",minHeight:44,fontSize:12,fontWeight:850,color:"#6043a3"}}>Stage downloaded CSV privately →</Link>
        </article>)}
      </div>
      <p style={{margin:0,fontSize:12,lineHeight:1.6,color:"#766d78"}}>Large feeds need the scalable pipeline before import: Tyres UK feed 93988 (31,354 rows), Tyres Pneus Online UK feed 26513 (20,034 rows), and Mozillion pay-monthly feed 97090 (7,729 rows). Do not upload these into the 2,500-row importer. No source credentials, signed download URLs or image rights are stored here.</p>
    </section>
    <div style={{display:"grid",gap:6,padding:17,borderRadius:13,background:"#f2ebf9",border:"1px solid #e3d8ea"}}><strong>Need to import 3,000 to 500,000 rows?</strong><p style={{margin:0,fontSize:13,color:"#716a76"}}>Use the new general large-feed importer for any verified joined advertiser. It understands Awin CSV and Awin Google-retail formats, plus CSV/TSV gzip, with private resumable batches.</p><Link href="/control-centre/general-feed-import" style={{fontWeight:850}}>Open all-advertiser large feed importer →</Link></div>
    <UploadForm />
    {error && <p role="alert">Import history unavailable: {error.message}</p>}
    <section><h2 style={{ marginBottom: 12 }}>Import history</h2><div style={{ overflowX: 'auto', border: '1px solid #e3e2eb', borderRadius: 12, background: 'white' }}><table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 680, fontSize: 14 }}><thead><tr>{['Date','Merchant','Received','Review','Excluded','Rights'].map(x => <th key={x} style={{ padding: 14, borderBottom: '1px solid #eee', textAlign: 'left', background: '#f7f6fb' }}>{x}</th>)}</tr></thead><tbody>{runs?.map(run => <tr key={run.id}><td style={{ padding: 12, borderBottom: '1px solid #eee' }}>{new Date(run.created_at).toLocaleString('en-GB')}</td><td style={{ padding: 12, borderBottom: '1px solid #eee' }}>{run.merchant_name}</td><td style={{ padding: 12, borderBottom: '1px solid #eee' }}>{run.total_count}</td><td style={{ padding: 12, borderBottom: '1px solid #eee' }}>{run.review_count}</td><td style={{ padding: 12, borderBottom: '1px solid #eee' }}>{run.excluded_count}</td><td style={{ padding: 12, borderBottom: '1px solid #eee' }}>{run.permission_status}</td></tr>)}</tbody></table></div></section>
    {recordsError && <p role="alert">Review table unavailable: {recordsError.message}. Apply the included SQL migration.</p>}
    {latest && !recordsError && <ReviewDashboard runName={latest.merchant_name} initialRecords={records ?? []} totalCount={latest.total_count} />}
    <Link href="/control-centre/sources">← Back to sources</Link>
  </main>;
}
