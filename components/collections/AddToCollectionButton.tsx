"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart, ShoppingBasket, Check, LoaderCircle } from "lucide-react";
import { createClient } from "../../lib/supabase/client";
import { COLLECTIONS, safeProductUrl, type PlanningCollectionKind } from "../../lib/collections/planning";
import styles from "./planning.module.css";

type Props = {
  kind: PlanningCollectionKind;
  productId: string;
  productSlug: string;
  title: string;
  merchant: string | null;
  priceGbp: number | null;
  offerId?: string;
};

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function AddToCollectionButton({ kind, productId, productSlug, title, merchant, priceGbp, offerId }: Props) {
  const db = useMemo(() => createClient(), []);
  const router = useRouter();
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");
  const collection = COLLECTIONS[kind];

  async function add() {
    if (busy) return;
    if (!uuid.test(productId) || !safeProductUrl(productSlug) || (kind === "basket" && (!offerId || !uuid.test(offerId)))) {
      setMessage("This product is not eligible for saving."); return;
    }
    setBusy(true); setMessage("");
    try {
      const { data: auth, error: authError } = await db.auth.getUser();
      if (authError || !auth.user) {
        router.push(`/login?next=${encodeURIComponent(pathname || collection.route)}`);
        return;
      }
      const { data: existing, error: findError } = await db.from("shared_lists")
        .select("id").eq("owner_id", auth.user.id).eq("list_type", kind)
        .order("created_at", { ascending: true }).limit(1).maybeSingle();
      if (findError) throw findError;
      let listId = existing?.id;
      if (!listId) {
        const { data: created, error: createError } = await db.from("shared_lists")
          .insert({ owner_id: auth.user.id, list_type: kind, name: collection.name, visibility: "private" })
          .select("id").single();
        if (createError || !created) throw createError ?? new Error("Could not create your list");
        listId = created.id;
      }

      const key = kind === "wishlist" ? `product:${productId}` : `offer:${offerId}`;
      const { data: duplicate, error: checkError } = await db.from("shared_list_items")
        .select("id").eq("list_id", listId).eq("item_key", key).limit(1).maybeSingle();
      if (checkError) throw checkError;
      if (duplicate) { setSaved(true); setMessage("Already saved."); return; }
      const price = typeof priceGbp === "number" && Number.isFinite(priceGbp) && priceGbp >= 0 ? priceGbp : null;
      const { error } = await db.from("shared_list_items").insert({
        list_id: listId,
        added_by: auth.user.id,
        product_id: productId,
        item_key: key,
        title_override: title.slice(0, 180),
        url: safeProductUrl(productSlug),
        snapshot: {
          kind, product_slug: productSlug, merchant: merchant?.slice(0, 120) ?? null,
          price_gbp: price, captured_at: new Date().toISOString(),
          ...(kind === "basket" ? { offer_id: offerId } : {}),
        },
      });
      if (error) throw error;
      setSaved(true); setMessage(kind === "basket" ? "Added to your basket." : "Saved to your wishlist.");
    } catch {
      setMessage("Could not save this item. Please try again.");
    } finally { setBusy(false); }
  }

  return <span className={styles.buttonWrap}>
    <button type="button" className={styles.addButton} disabled={busy || saved} onClick={add}>
      {busy ? <LoaderCircle size={16}/> : saved ? <Check size={16}/> : kind === "basket" ? <ShoppingBasket size={16}/> : <Heart size={16}/>}
      {saved ? "Saved" : kind === "basket" ? "Add to basket" : "Save to wishlist"}
    </button>
    {message && <small role="status" className={styles.message}>{message}</small>}
  </span>;
}
