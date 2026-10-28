#!/usr/bin/env python3
"""AVUQO private Awin feed audit. No database writes, network calls, or publication."""
import argparse, csv, gzip, html, json
from collections import Counter
from decimal import Decimal, InvalidOperation
from pathlib import Path
from datetime import datetime, timezone

REQUIRED = {'aw_product_id','merchant_product_id','product_name','merchant_id','search_price','currency'}
MAX_ROWS=200000

def read_rows(path):
    opener = gzip.open if path.name.lower().endswith('.gz') else open
    with opener(path,'rt',encoding='utf-8-sig',newline='') as stream:
        reader=csv.DictReader(stream)
        cols=reader.fieldnames or []
        missing=REQUIRED-set(cols)
        if missing: raise ValueError('Missing required columns: '+', '.join(sorted(missing)))
        for i,row in enumerate(reader):
            if i>=MAX_ROWS: raise ValueError('Feed exceeds private preview row limit')
            yield row

def normalise(row, seen):
    merchant=(row.get('merchant_id') or '').strip()
    product_id=(row.get('merchant_product_id') or '').strip()
    aw_id=(row.get('aw_product_id') or '').strip()
    title=(row.get('product_name') or '').strip()
    currency=(row.get('currency') or '').strip().upper()
    reasons=[]
    try:
        price=Decimal((row.get('search_price') or '').strip())
        if not price.is_finite() or price<=0: reasons.append('invalid_or_zero_price')
    except InvalidOperation:
        price=None; reasons.append('invalid_or_zero_price')
    if not title or not merchant or not (product_id or aw_id):reasons.append('missing_identity')
    if currency!='GBP':reasons.append('unexpected_currency')
    key=(merchant,product_id or aw_id)
    if key in seen: reasons.append('duplicate_merchant_product_id')
    seen.add(key)
    if title.casefold()=='shipping protection' or 'shipping protection' in title.casefold():reasons.append('non_product_shipping_protection')
    if str(row.get('in_stock','')).strip().lower() in ('0','false','no') or str(row.get('stock_status','')).strip().lower() in ('out of stock','unavailable'):
        reasons.append('out_of_stock')
    # Do not assume licence or affiliate partnership from a selectable Awin feed.
    status='excluded' if reasons else 'review'
    return {
        'merchant':(row.get('merchant_name') or '').strip(),
        'merchant_id':merchant,'merchant_product_id':product_id,'awin_product_id':aw_id,
        'title':title,'price':str(price) if price is not None else None,'currency':currency,
        'category':(row.get('category_name') or '').strip(), 'brand':(row.get('brand_name') or '').strip(),
        'gtin_supplied':bool((row.get('product_GTIN') or '').strip()),
        'image_supplied':bool((row.get('merchant_image_url') or row.get('aw_image_url') or '').strip()),
        'tracking_link_supplied':bool((row.get('aw_deep_link') or '').strip()),
        'last_updated_supplied':bool((row.get('last_updated') or '').strip()),
        'status':status,'reasons':reasons,'publication_allowed':False
    }

def make_report(feed, output):
    seen=set();records=[normalise(r,seen) for r in read_rows(feed)]
    by_status=Counter(r['status'] for r in records)
    reason_counts=Counter(reason for r in records for reason in r['reasons'])
    report={
      'generated_utc':datetime.now(timezone.utc).isoformat(),
      'source_file':feed.name,'total':len(records),
      'review':by_status['review'],'excluded':by_status['excluded'],'published':0,
      'reason_counts':dict(reason_counts),'permissions':'UNVERIFIED: review advertiser membership and product-data rights before use',
      'records':records
    }
    output.mkdir(parents=True,exist_ok=True)
    (output/'private_import_report.json').write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf-8')
    # Intentionally omit images, external links and raw tracking URLs from static HTML.
    trs='\n'.join('<tr><td>'+html.escape(x['status'])+'</td><td>'+html.escape(x['title'])+'</td><td>'+html.escape(x['price'] or 'N/A')+'</td><td>'+html.escape(x['currency'])+'</td><td>'+html.escape(x['merchant_product_id'])+'</td><td>'+html.escape(', '.join(x['reasons']) or 'Pending merchant permissions')+'</td></tr>' for x in records[:250])
    reasons='; '.join(f'{k}: {v}' for k,v in reason_counts.most_common())
    page=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AVUQO private feed preview</title><style>body{{font:15px system-ui;background:#f7f6f3;color:#151227;max-width:1200px;margin:auto;padding:24px}}header{{background:#18122d;color:#fff;padding:22px;border-radius:14px}}table{{width:100%;border-collapse:collapse;background:white}}th,td{{text-align:left;padding:10px;border-bottom:1px solid #ddd;word-break:break-word}}th{{background:#eee9fa}}.alert{{padding:14px;border:1px solid #bdb4d0;border-radius:10px;margin:18px 0}}</style></head><body><header><h1>AVUQO · Private Awin Feed Audit</h1><p>Received: {len(records)} | Needs review: {by_status['review']} | Excluded: {by_status['excluded']} | Published: 0</p></header><div class="alert"><strong>Not approved for publication.</strong> Feed access does not prove merchant partnership or data usage rights. No external links are active. This document must not be hosted publicly.</div><p><strong>Flags:</strong> {html.escape(reasons or 'None')}</p><p>Displaying the first 250 records. See JSON for all results.</p><table><thead><tr><th>Status</th><th>Product</th><th>Price</th><th>Currency</th><th>Merchant SKU</th><th>Notes</th></tr></thead><tbody>{trs}</tbody></table></body></html>'''
    (output/'private_import_preview.html').write_text(page,encoding='utf-8')
    return report

if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('feed',type=Path)
    p.add_argument('--out',type=Path,default=Path('./feed-preview-output'))
    args=p.parse_args()
    result=make_report(args.feed,args.out)
    print(f"Rows: {result['total']} | Review: {result['review']} | Excluded: {result['excluded']} | Published: 0")
    print('Reasons:',result['reason_counts'])
    print('Saved to:',args.out)
