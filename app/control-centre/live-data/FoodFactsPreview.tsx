"use client";

import { useState } from "react";
import { previewOpenFoodFacts, type FoodFactsResult } from "./open-food-facts";

export default function FoodFactsPreview() {
  const [result, setResult] = useState<FoodFactsResult | null>(null);
  const [loading, setLoading] = useState(false);
  async function run() {
    setLoading(true);
    try { setResult(await previewOpenFoodFacts()); }
    catch { setResult({ status: "error", checkedAt: "", products: [], message: "Unable to fetch source metadata." }); }
    finally { setLoading(false); }
  }
  return <div>
    <p>Fetch eight current UK-tagged grocery product records for private research. This is product metadata, not retailer pricing. Results are not saved to AVUQO or published.</p>
    <button type="button" onClick={run} disabled={loading}>{loading ? "Loading live products…" : "Fetch live product sample"}</button>
    {result && <div aria-live="polite"><p>{result.message}</p>{result.products.length > 0 && <ul>{result.products.map(p =>
      <li key={p.barcode}><b>{p.title}</b> · {p.brand} · {p.quantity} · Barcode {p.barcode}</li>
    )}</ul>}<small>Source: Open Food Facts contributors, ODbL database. Attribution and share-alike terms apply. Product images and prices are not copied.</small></div>}
  </div>;
}
