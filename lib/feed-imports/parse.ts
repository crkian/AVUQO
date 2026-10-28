import { gunzipSync } from 'node:zlib';

export type FeedRecord = { merchant_id: string; merchant_product_id: string; awin_product_id: string; title: string; price: string | null; currency: string; brand: string; category: string; status: 'review' | 'excluded'; reasons: string[]; image_url: string | null; metadata: Record<string, unknown> };
const REQUIRED = ['aw_product_id', 'merchant_product_id', 'product_name', 'merchant_id', 'search_price', 'currency'];

function csvRows(source: string): string[][] {
  const rows: string[][] = []; let fields: string[] = []; let field = ''; let quoted = false;
  for (let i = 0; i < source.length; i++) {
    const c = source[i];
    if (quoted) { if (c === '"' && source[i + 1] === '"') { field += '"'; i++; } else if (c === '"') quoted = false; else field += c; }
    else if (c === '"') quoted = true;
    else if (c === ',') { fields.push(field); field = ''; }
    else if (c === '\n') { fields.push(field.replace(/\r$/, '')); field = ''; if (fields.some(x => x.length)) rows.push(fields); fields = []; }
    else field += c;
  }
  if (quoted) throw new Error('Unterminated quoted CSV field');
  if (field || fields.length) { fields.push(field); rows.push(fields); }
  return rows;
}

export function parseAwinFeed(bytes: Buffer, compressed: boolean) {
  if (bytes.length > 8 * 1024 * 1024) throw new Error('Upload exceeds 8 MB limit');
  const plain = compressed ? gunzipSync(bytes, { maxOutputLength: 30 * 1024 * 1024 }) : bytes;
  if (plain.length > 30 * 1024 * 1024) throw new Error('Uncompressed CSV too large');
  const rows = csvRows(plain.toString('utf8').replace(/^\uFEFF/, ''));
  const [header, ...body] = rows;
  if (!header?.length) throw new Error('Empty feed');
  const missing = REQUIRED.filter(k => !header.includes(k));
  if (missing.length) throw new Error('Required columns missing: ' + missing.join(', '));
  if (body.length > 2500) throw new Error('Pilot importer allows up to 2,500 products per upload');
  const seen = new Set<string>(); const records: FeedRecord[] = [];
  for (const fields of body) {
    if (fields.length !== header.length) throw new Error('Malformed CSV: inconsistent field count');
    const row = Object.fromEntries(header.map((h, i) => [h, fields[i] ?? ''])) as Record<string, string>;
    const get = (k: string) => (row[k] ?? '').trim();
    const merchant_id = get('merchant_id'), merchant_product_id = get('merchant_product_id'), awin_product_id = get('aw_product_id');
    const title = get('product_name'), currency = get('currency').toUpperCase(); const price = Number(get('search_price'));
    const reasons: string[] = [];
    const rawImage = get('merchant_image_url') || get('aw_image_url');
    let image_url: string | null = null;
    try { const url = new URL(rawImage); if (url.protocol === 'https:' && rawImage.length <= 2048) image_url = url.toString(); } catch { /* optional image unavailable */ }
    if (!Number.isFinite(price) || price <= 0) reasons.push('invalid_or_zero_price');
    if (!title || !merchant_id || !(merchant_product_id || awin_product_id)) reasons.push('missing_identity');
    if (currency !== 'GBP') reasons.push('unexpected_currency');
    const key = `${merchant_id}:${merchant_product_id || awin_product_id}`;
    if (seen.has(key)) reasons.push('duplicate_merchant_product_id');
    seen.add(key);
    if (title.toLowerCase().includes('shipping protection')) reasons.push('non_product_shipping_protection');
    if (['0','false','no'].includes(get('in_stock').toLowerCase()) || ['out of stock','unavailable'].includes(get('stock_status').toLowerCase())) reasons.push('out_of_stock');
    records.push({ merchant_id, merchant_product_id, awin_product_id, title: title.slice(0, 500), price: Number.isFinite(price) && price > 0 ? price.toFixed(2) : null, currency,
      brand: get('brand_name'), category: get('category_name'), status: reasons.length ? 'excluded' : 'review', reasons, image_url,
      metadata: { gtin_present: Boolean(get('product_GTIN')), image_present: Boolean(get('merchant_image_url') || get('aw_image_url')), tracking_link_present: Boolean(get('aw_deep_link')), source_update_present: Boolean(get('last_updated')) } });
  }
  return { records, total: records.length, review: records.filter(x => x.status === 'review').length, excluded: records.filter(x => x.status === 'excluded').length };
}
