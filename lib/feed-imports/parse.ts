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

/** Craft Buddy's Awin Google-format product feed. Private ingestion only. */
export function parseCraftBuddyGoogleFeed(bytes: Buffer, compressed: boolean) {
  if (bytes.length > 8 * 1024 * 1024) throw new Error('Upload exceeds 8 MB limit');
  const plain = compressed ? gunzipSync(bytes, { maxOutputLength: 30 * 1024 * 1024 }) : bytes;
  if (plain.length > 30 * 1024 * 1024) throw new Error('Uncompressed CSV too large');
  const rows = csvRows(plain.toString('utf8').replace(/^\uFEFF/, ''));
  const [header, ...body] = rows;
  const required = ['advertiser_id','id','title','price','availability','aw_deep_link'];
  if (!header || required.some(field => !header.includes(field))) throw new Error('Not a supported Craft Buddy Google-format feed');
  if (body.length > 2500) throw new Error('Pilot importer allows up to 2,500 products');
  const seen = new Set<string>();
  const records: FeedRecord[] = body.map(fields => {
    if (fields.length !== header.length) throw new Error('Malformed CSV row');
    const row = Object.fromEntries(header.map((name, i) => [name, fields[i] ?? ''])) as Record<string,string>;
    const get = (name: string) => (row[name] ?? '').trim();
    const merchant_id = get('advertiser_id');
    if (merchant_id !== '45747') throw new Error('Craft Buddy feed contains a different advertiser');
    const merchant_product_id = get('id');
    const priceMatch = get('price').match(/^([0-9]+(?:\.[0-9]+)?)\s+([A-Za-z]{3})$/);
    const value = priceMatch ? Number(priceMatch[1]) : NaN;
    const currency = priceMatch?.[2].toUpperCase() ?? '';
    const reasons: string[] = [];
    if (!Number.isFinite(value) || value <= 0) reasons.push('invalid_or_zero_price');
    if (currency !== 'GBP') reasons.push('unexpected_currency');
    if (!merchant_product_id || !get('title')) reasons.push('missing_identity');
    if (seen.has(merchant_product_id)) reasons.push('duplicate_merchant_product_id');
    seen.add(merchant_product_id);
    if (get('availability') !== 'in_stock') reasons.push('out_of_stock');
    if (get('title').toLowerCase().includes('shipping protection')) reasons.push('non_product_shipping_protection');
    let image_url: string | null = null;
    try {
      const u = new URL(get('image_link'));
      if (u.protocol === 'https:' && u.toString().length <= 2048) image_url = u.toString();
    } catch { /* invalid image */ }
    let tracking_url: string | null = null;
    try {
      const u = new URL(get('aw_deep_link'));
      if (u.protocol === 'https:' && u.hostname === 'www.awin1.com' && u.searchParams.get('awinmid') === '45747' && u.searchParams.get('awinaffid') === '3135746') tracking_url = u.toString();
    } catch { /* invalid tracking link */ }
    if (!tracking_url) reasons.push('tracking_link_unverified');
    return {
      merchant_id, merchant_product_id, awin_product_id: '', title: get('title').slice(0,500),
      price: Number.isFinite(value) && value > 0 ? value.toFixed(2) : null, currency,
      brand: get('brand'), category: get('product_type') || get('google_product_category'),
      status: reasons.length ? 'excluded' as const : 'review' as const, reasons, image_url,
      metadata: {
        gtin_present: Boolean(get('gtin')), image_present: Boolean(image_url),
        tracking_link_present: Boolean(tracking_url), source_update_present: false,
        tracking_url, product_url: get('link'), availability: get('availability'),
        source_format: 'google-retail', permission_status: 'unverified'
      }
    };
  });
  return {records, total: records.length, review: records.filter(r=>r.status==='review').length, excluded: records.filter(r=>r.status==='excluded').length};
}
