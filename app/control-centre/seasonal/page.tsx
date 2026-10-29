import Link from "next/link";import {connection} from "next/server";import styles from "../control-centre.module.css";
export const instant=false;
const destinations=[
{title:"Christmas 2026",url:"/christmas",note:"Gift guide, budgets, approved offer review, craft ideas"},
{title:"Black Friday 2026",url:"/black-friday",note:"27 November 2026, editorial planning only until evidence is verified"},
{title:"Seasonal Sales",url:"/sales",note:"Year-round value guidance; no fabricated markdowns"},
{title:"Motoring",url:"/motoring",note:"Ownership and leasing guide; not a financial quote"},
{title:"Insurance explained",url:"/insurance",note:"General educational page, no insurance distribution"},
{title:"Broadband & mobile",url:"/broadband",note:"Guidance linked to user-input cost calculator"},
{title:"Travel",url:"/travel",note:"Editorial destination and total-cost principles"},
{title:"Editorial policy",url:"/editorial-policy",note:"Source and advertising transparency"},
{title:"Privacy centre",url:"/privacy-centre",note:"Data-rights directions and legal notices"}
];
export default async function SeasonalAdmin(){await connection();return <><div className={styles.pageHead}><div><p className={styles.eyebrow}>Website campaign operations</p><h1>Seasonal &amp; pages</h1><p className={styles.sub}>Review the public editorial destinations, approve data sources before sales are shown, and manage legal copy through the existing versioned publishing workflow.</p></div></div>
<section className={styles.panel}><div className={styles.panelHead}><h2>Destinations</h2><span>Routes, not evidence of merchant connectivity</span></div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:14}}>{destinations.map(x=><article key={x.url} style={{padding:20,border:"1px solid #e7e1e9",borderRadius:18,background:"#faf9f6"}}><h3 style={{margin:"0 0 9px"}}>{x.title}</h3><p style={{fontSize:13,color:"#746d79",lineHeight:1.6,minHeight:55}}>{x.note}</p><Link href={x.url}>View page ↗</Link></article>)}</div></section>
<section className={styles.panel}><div className={styles.panelHead}><h2>Before a seasonal campaign goes live</h2></div><p>Check source permissions, expiry, product variants, rights to use images, affiliate labels, total price and the accuracy of any scarcity or savings claim. Don&apos;t publish a product tile merely because its feed has been imported.</p><p><Link href="/control-centre/source-readiness">Check source readiness</Link> · <Link href="/control-centre/feed-imports">Review private feeds</Link> · <Link href="/control-centre/content/legal">Manage legal notices</Link> · <Link href="/control-centre/content/pages">Edit available page copy</Link></p><div className={styles.callout}>Seasonal dates and categories are ready for editorial content, but public merchant offers still require the existing staged review and explicit rights verification. There is no automatic campaign scheduler on this page.</div></section></>}
