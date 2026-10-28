'use client';
import { Fragment, useMemo, useState } from 'react';

type Decision = 'pending' | 'checked' | 'needs_attention';
type RecordRow = { id: string; title: string; price: number | string | null; currency: string; status: 'review' | 'excluded'; reasons: string[] | null; merchant_product_id: string; brand: string; category: string; review_decision: Decision; review_notes: string | null; image_url: string | null };
const cell: React.CSSProperties = { padding: '12px 10px', borderBottom: '1px solid #edecf2', textAlign: 'left', verticalAlign: 'top' };
const input: React.CSSProperties = { padding: '10px 12px', border: '1px solid #dedce9', borderRadius: 9, background: '#fff', color: '#25223a', minWidth: 0 };
export default function ReviewDashboard({ runName, initialRecords, totalCount }: { runName: string; initialRecords: RecordRow[]; totalCount: number }) {
  const [records, setRecords] = useState(initialRecords);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [decision, setDecision] = useState('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const filtered = useMemo(() => records.filter(r => {
    const text = `${r.title} ${r.merchant_product_id} ${r.brand} ${r.category}`.toLowerCase();
    return text.includes(query.toLowerCase().trim()) && (status === 'all' || r.status === status) && (decision === 'all' || (r.review_decision ?? 'pending') === decision);
  }), [records, query, status, decision]);
  const perPage = 20, pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const visible = filtered.slice((Math.min(page, pages)-1)*perPage, Math.min(page, pages)*perPage);
  const current = records.find(r => r.id === selected);
  const stats = { checked: records.filter(r => r.review_decision === 'checked').length, attention: records.filter(r => r.review_decision === 'needs_attention').length };
  async function save(nextDecision: Decision) {
    if (!current || busy) return;
    setBusy(true); setMessage('');
    try {
      const res = await fetch('/api/control-centre/feed-imports/review', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: current.id, decision: nextDecision, notes: note.slice(0, 1000) }) });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Could not save review');
      setRecords(rows => rows.map(r => r.id === current.id ? { ...r, review_decision: nextDecision, review_notes: note } : r));
      setMessage('Saved privately. This does not publish or approve affiliate rights.');
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Could not save'); }
    finally { setBusy(false); }
  }
  return <section style={{ display: 'grid', gap: 14 }}>
    <div><h2 style={{ marginBottom: 5 }}>Latest import: {runName}</h2><p style={{ margin: 0, color: '#6c6880' }}>Product review queue. Decisions are internal annotations, not merchant permission or publication approval.</p></div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
      {[['Imported', totalCount], ['Loaded for review', records.length], ['Checked', stats.checked], ['Needs attention', stats.attention]].map(([label, value]) => <div key={label} style={{ padding: 16, border: '1px solid #e8e5ef', background: 'white', borderRadius: 12 }}><div style={{ color: '#716b83', fontSize: 13 }}>{label}</div><div style={{ fontSize: 27, fontWeight: 750 }}>{value}</div></div>)}
    </div>
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      <input aria-label="Search products" value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} placeholder="Search name, ID, brand…" style={{ ...input, flex: '1 1 220px' }}/>
      <select aria-label="Validation status" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} style={input}><option value="all">All validation statuses</option><option value="review">For review</option><option value="excluded">Excluded</option></select>
      <select aria-label="Review decision" value={decision} onChange={e => { setDecision(e.target.value); setPage(1); }} style={input}><option value="all">All review decisions</option><option value="pending">Pending</option><option value="checked">Checked</option><option value="needs_attention">Needs attention</option></select>
    </div>
    <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 12, border: '1px solid #e6e4ed' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 740, fontSize: 13 }}>
        <thead><tr style={{ background: '#f7f6fa' }}>{['Product', 'Price', 'Validation', 'Review', 'Source ID', ''].map(h => <th key={h} style={cell}>{h}</th>)}</tr></thead>
        <tbody>{visible.map(r => <Fragment key={r.id}>
          <tr style={{ background: selected === r.id ? '#f7f4ff' : '#fff' }}>
            <td style={{ ...cell, maxWidth: 340 }}><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {r.image_url ? <img src={r.image_url} alt={r.title} loading="lazy" referrerPolicy="no-referrer" style={{ width: 62, height: 62, objectFit: 'contain', background: '#f7f7f9', borderRadius: 9, flexShrink: 0 }} /> : <span style={{ width: 62, height: 62, flexShrink: 0, display: 'grid', placeItems: 'center', background: '#f5f4f7', borderRadius: 9, fontSize: 11, color: '#797487' }}>No image</span>}
              <span><strong>{r.title}</strong>{r.brand && <div style={{ color: '#756f83' }}>{r.brand}</div>}</span>
            </div></td>
            <td style={{ ...cell, whiteSpace: 'nowrap' }}>{r.price == null ? 'Invalid' : `${Number(r.price).toFixed(2)} ${r.currency}`}</td>
            <td style={cell}><span style={{ color: r.status === 'excluded' ? '#a13f3f' : '#7551a5', fontWeight: 700 }}>{r.status}</span></td>
            <td style={cell}>{r.review_decision || 'pending'}</td>
            <td style={{ ...cell, overflowWrap: 'anywhere' }}>{r.merchant_product_id}</td>
            <td style={cell}><button type="button" aria-expanded={selected === r.id} style={{ ...input, cursor: 'pointer', fontWeight: 700 }} onClick={() => { setSelected(selected === r.id ? null : r.id); setNote(r.review_notes ?? ''); setMessage(''); }}>{selected === r.id ? 'Close' : 'Inspect'}</button></td>
          </tr>
          {selected === r.id && <tr><td colSpan={6} style={{ padding: 16, borderBottom: '2px solid #b6a6dd', background: '#faf8ff' }}>
            <div aria-label={`Inspect ${r.title}`} style={{ display: 'grid', gap: 14, maxWidth: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}><h3 style={{ margin: 0 }}>Inspect: {r.title}</h3><button type="button" onClick={() => setSelected(null)} style={input}>Close</button></div>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 18 }}>
                {r.image_url ? <img src={r.image_url} alt={r.title} referrerPolicy="no-referrer" style={{ width: 180, maxWidth: '100%', height: 180, objectFit: 'contain', background: '#fff', border: '1px solid #e9e4f0', borderRadius: 12 }} /> : <div style={{ width: 180, height: 180, display: 'grid', placeItems: 'center', color: '#767083', background: '#fff', border: '1px solid #e9e4f0', borderRadius: 12 }}>No image available</div>}
                <div style={{ flex: '1 1 270px', display: 'grid', gap: 8 }}><div><strong>Price:</strong> {r.price ?? 'Invalid'} {r.currency}</div><div><strong>Validation:</strong> {r.status} | <strong>Review:</strong> {r.review_decision ?? 'pending'}</div><div><strong>Brand:</strong> {r.brand || 'Not supplied'} | <strong>Category:</strong> {r.category || 'Not supplied'}</div><div><strong>Merchant ID:</strong> {r.merchant_product_id}</div><div><strong>Flags:</strong> {r.reasons?.join(', ') || 'None'}</div></div>
              </div>
              <label style={{ display: 'grid', gap: 6 }}><strong>Private review notes</strong><textarea value={note} maxLength={1000} onChange={e => setNote(e.target.value)} rows={3} style={{ ...input, width: '100%', boxSizing: 'border-box' }}/></label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}><button disabled={busy} onClick={() => save('checked')} style={input}>Mark checked</button><button disabled={busy} onClick={() => save('needs_attention')} style={input}>Needs attention</button><button disabled={busy} onClick={() => save('pending')} style={input}>Reset to pending</button></div>
              {message && <p role="status" style={{ margin: 0 }}>{message}</p>}
              <small>Review decisions are private only. Excluded products stay excluded. No publishing or affiliate links.</small>
            </div>
          </td></tr>}
        </Fragment>)}</tbody>
      </table>
      {visible.length === 0 && <p style={{ padding: 20 }}>No matching records.</p>}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}><span style={{ color: '#696679' }}>{filtered.length} matching records{records.length < totalCount ? ` (showing first ${records.length} of ${totalCount} imported)` : ''}</span><div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><button disabled={page <= 1} onClick={() => { setSelected(null); setPage(p => Math.max(1,p-1)); }} style={input}>Previous</button><span>Page {Math.min(page, pages)} of {pages}</span><button disabled={page >= pages} onClick={() => { setSelected(null); setPage(p => Math.min(pages,p+1)); }} style={input}>Next</button></div></div>
  </section>;
}
