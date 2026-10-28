export type BasketLine = { id: string; name: string; quantity: number; productId?: string | null };
export type GroceryPrice = { product_id: string; store_id: string; price_pence: number; currency: string; status: string; is_available: boolean; usage_rights_confirmed: boolean; last_checked_at: string; expires_at: string | null };
export type PersonalPrices = Record<string, Record<string, number>>;
export type Store = { id: string; name: string };
export type StoreResult = { store: Store; subtotalPence: number; complete: boolean; covered: number; missing: string[]; personalCount: number; lines: Array<{id:string; pricePence:number|null; source:'verified'|'your price'|'missing'}> };
export function parsePence(value: string): number | null {
  if (!/^(?:0|[1-9]\d{0,7})(?:\.\d{1,2})?$/.test(value.trim())) return null;
  const [p, c=''] = value.trim().split('.');
  const n = Number(p) * 100 + Number(c.padEnd(2,'0'));
  return Number.isSafeInteger(n) && n >= 0 ? n : null;
}
export function validPrice(p: GroceryPrice, now: number): boolean {
  const checked = Date.parse(p.last_checked_at);
  return p.currency === 'GBP' && p.status === 'published' && p.is_available === true && p.usage_rights_confirmed === true && Number.isSafeInteger(p.price_pence) && p.price_pence >= 0 && Number.isFinite(checked) && checked <= now && now - checked <= 7 * 86400000 && (!p.expires_at || (Number.isFinite(Date.parse(p.expires_at)) && Date.parse(p.expires_at) > now));
}
export function calculateBasket(basket: BasketLine[], stores: Store[], prices: GroceryPrice[], personal: PersonalPrices, now: number = Date.now()) {
  const unique = new Map<string, GroceryPrice>();
  for (const p of prices) if (validPrice(p,now)) unique.set(`${p.product_id}:${p.store_id}`,p);
  const results: StoreResult[] = stores.map(store => {
    let subtotalPence=0, covered=0, personalCount=0;
    const missing:string[]=[];
    const lines = basket.map(item => {
      const qty = Number.isInteger(item.quantity) && item.quantity >=1 && item.quantity <=99 ? item.quantity : 0;
      const override = personal[item.id]?.[store.id];
      const isPersonal = Number.isSafeInteger(override) && override >=0;
      const published = item.productId ? unique.get(`${item.productId}:${store.id}`) : undefined;
      const amount = isPersonal ? override : published?.price_pence;
      if (qty === 0 || amount === undefined) {missing.push(item.id); return {id:item.id,pricePence:null,source:'missing' as const};}
      subtotalPence += amount * qty; covered++;
      if (isPersonal) personalCount++;
      return {id:item.id, pricePence: amount,source:isPersonal?'your price' as const:'verified' as const};
    });
    return {store,subtotalPence,covered,complete:basket.length>0 && missing.length===0,missing,personalCount,lines};
  });
  results.sort((a,b)=>Number(b.complete)-Number(a.complete)||a.subtotalPence-b.subtotalPence||a.store.name.localeCompare(b.store.name));
  const complete=results.filter(x=>x.complete);
  const min=complete[0]?.subtotalPence;
  const winners=min === undefined?[]:complete.filter(x=>x.subtotalPence===min).map(x=>x.store.id);
  const next=complete.find(x=>x.subtotalPence>(min??Infinity));
  return {results,winners,savingsPence:next && min!==undefined?next.subtotalPence-min:null};
}
