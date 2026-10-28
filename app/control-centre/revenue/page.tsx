import { connection } from "next/server"; import { createClient } from "../../../lib/supabase/server"; import styles from "../control-centre.module.css";

type AffiliateConversion = {
  status: string;
  order_value: number | string | null;
  estimated_commission: number | string | null;
  confirmed_commission: number | string | null;
  refunded_at: string | null;
  created_at: string;
};

export const instant = false;

const gbp=(n:number)=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP",maximumFractionDigits:2}).format(n);
export default async function RevenuePage(){await connection();const s=await createClient();const {data:rows}=await s.from("affiliate_conversions").select("status,order_value,estimated_commission,confirmed_commission,refunded_at,created_at").order("created_at",{ascending:false}).limit(500);const all=(rows??[]) as AffiliateConversion[];const est=all.reduce((a:number,r:AffiliateConversion)=>a+Number(r.estimated_commission??0),0);const conf=all.reduce((a:number,r:AffiliateConversion)=>a+Number(r.confirmed_commission??0),0);const orders=all.reduce((a:number,r:AffiliateConversion)=>a+Number(r.order_value??0),0);const refunds=all.filter((r:AffiliateConversion)=>r.refunded_at).length;return <><div className={styles.pageHead}><div><p className={styles.eyebrow}>Commercial intelligence</p><h1>Revenue</h1><p className={styles.sub}>Estimated and confirmed affiliate income are kept separate so optimism never masquerades as cash.</p></div></div><div className={styles.metrics}><div className={styles.metric}><span>Tracked order value</span><strong>{gbp(orders)}</strong></div><div className={styles.metric}><span>Estimated commission</span><strong>{gbp(est)}</strong></div><div className={styles.metric}><span>Confirmed commission</span><strong>{gbp(conf)}</strong></div><div className={styles.metric}><span>Refunded conversions</span><strong>{refunds}</strong></div></div><section className={styles.panel}><div className={styles.panelHead}><h2>Conversion ledger</h2><span>{all.length} recent conversion records</span></div>{all.length?<table className={styles.table}><thead><tr><th>Status</th><th>Order value</th><th>Estimated</th><th>Confirmed</th><th>Date</th></tr></thead><tbody>{all.map((r:AffiliateConversion,i:number)=><tr key={i}><td><span className={styles.pill}>{r.status}</span></td><td>{gbp(Number(r.order_value??0))}</td><td>{gbp(Number(r.estimated_commission??0))}</td><td>{gbp(Number(r.confirmed_commission??0))}</td><td>{new Date(r.created_at).toLocaleDateString("en-GB")}</td></tr>)}</tbody></table>:<div className={styles.empty}>No affiliate conversions yet. This page will reconcile provider reports once the first live programme is connected.</div>}</section></>}
