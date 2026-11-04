"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart, ShoppingBasket, Check, LoaderCircle } from "lucide-react";
import { COLLECTIONS, safeProductUrl, type PlanningCollectionKind } from "../../lib/collections/planning";
import styles from "./planning.module.css";

type Props = {
  kind: PlanningCollectionKind;
  productId: string;
  productSlug: string;
  offerId: string;
};

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function AddToCollectionButton({ kind, productId, productSlug, offerId }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");
  const collection = COLLECTIONS[kind];

  async function add() {
    if (busy || saved) return;
    if (!uuid.test(productId) || !uuid.test(offerId) || !safeProductUrl(productSlug)) {
      setMessage("This product is not eligible for saving."); return;
    }
    setBusy(true); setMessage("");
    try {
      // Never pass merchant names, captured prices or timestamps from browser state.
      const response = await fetch("/api/collections/items", {
        method: "POST", credentials: "same-origin",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({kind,productId,productSlug,offerId}),
      });
      if (response.status === 401) {
        router.push(`/login?next=${encodeURIComponent(pathname || collection.route)}`);
        return;
      }
      const result = await response.json().catch(()=>({})) as {error?:string;alreadySaved?:boolean;ok?:boolean};
      if (!response.ok || !result.ok) {
        setMessage(result.error ?? "This offer cannot be saved right now. Recheck it and try again.");
        return;
      }
      setSaved(true);
      setMessage(result.alreadySaved ? "Already saved." : kind === "basket" ? "Added to your basket." : "Saved to your wishlist.");
    } catch {
      setMessage("Could not save this item. Please try again.");
    } finally { setBusy(false); }
  }

  return <span className={styles.buttonWrap}>
    <button type="button" className={styles.addButton} disabled={busy || saved} aria-busy={busy} onClick={add}>
      {busy ? <LoaderCircle size={16}/> : saved ? <Check size={16}/> : kind === "basket" ? <ShoppingBasket size={16}/> : <Heart size={16}/>}
      {saved ? "Saved" : kind === "basket" ? "Add to basket" : "Save to wishlist"}
    </button>
    {message && <small role="status" className={styles.message}>{message}</small>}
  </span>;
}
