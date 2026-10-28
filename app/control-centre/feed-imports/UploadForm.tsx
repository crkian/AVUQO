'use client';
import { useState } from 'react';

export default function UploadForm() {
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
  async function upload(form: FormData) {
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/control-centre/feed-imports', { method: 'POST', body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Upload failed');
      setMessage(`Imported ${result.total} records: ${result.review} for review, ${result.excluded} excluded. Nothing published.`);
      window.location.reload();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Upload error'); }
    finally { setBusy(false); }
  }
  return <form action={upload} style={{ display: 'grid', gap: 12, padding: 20, background: 'white', borderRadius: 16 }}>
    <label htmlFor="awin-upload"><strong>AKKO UK feed (.csv or .csv.gz)</strong></label>
    <input id="awin-upload" type="file" name="file" accept=".csv,.gz,.csv.gz" required disabled={busy}/>
    <button type="submit" disabled={busy} style={{ background: '#5841e8', color: 'white', borderRadius: 8, padding: 12, cursor: 'pointer' }}>{busy ? 'Validating and saving…' : 'Import for private review'}</button>
    {message && <p role="status">{message}</p>}
  </form>;
}
