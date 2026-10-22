"use client";

import { ListPlus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { dealSnapshot } from "../../lib/avuqo/deal";
import type { Deal } from "../../types/deal";
import styles from "./AddToListButton.module.css";

type ListRow = { id: string; name: string };

export default function AddToListButton({ deal }: { deal: Deal }) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lists, setLists] = useState<ListRow[]>([]);
  const [selected, setSelected] = useState("");
  const [message, setMessage] = useState("");

  async function openPanel() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { router.push(`/login?next=${encodeURIComponent(pathname)}`); return; }
    const { data } = await supabase.from("shared_lists").select("id,name").order("created_at", { ascending:false });
    setLists((data ?? []) as ListRow[]);
    setSelected(data?.[0]?.id ?? "");
    setOpen(true);
  }

  async function add() {
    if (!selected) { router.push("/lists"); return; }
    const itemKey = `deal:${deal.id}`;
    const { data: existing } = await supabase
      .from("shared_list_items")
      .select("id")
      .eq("list_id", selected)
      .eq("item_key", itemKey)
      .maybeSingle();
    if (existing) { setMessage("Already on this list."); return; }
    const { error } = await supabase.from("shared_list_items").insert({
      list_id: selected,
      item_key: itemKey,
      title_override: deal.title,
      url: `/deal/${deal.id}`,
      snapshot: dealSnapshot(deal),
    });
    setMessage(error ? error.message : "Added to list.");
    if (!error) setTimeout(() => setOpen(false), 700);
  }

  return (
    <div className={styles.wrap}>
      <button className={styles.button} type="button" onClick={openPanel}><ListPlus size={17}/> Add to list</button>
      {open && (
        <div className={styles.panel}>
          <h4>Add to a shared list</h4>
          {lists.length ? <select value={selected} onChange={e=>setSelected(e.target.value)}>{lists.map(list=><option key={list.id} value={list.id}>{list.name}</option>)}</select> : <p className={styles.message}>No lists yet. Create one first.</p>}
          <button type="button" onClick={add}>{lists.length ? "Add item" : "Create a list"}</button>
          {message && <p className={styles.message}>{message}</p>}
        </div>
      )}
    </div>
  );
}
