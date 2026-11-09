import {connection} from "next/server";
import Link from "next/link";
import type {Metadata} from "next";
import {requireControlCentreAccess} from "../../../lib/auth/requireControlCentreAccess";
import {createAdminClient} from "../../../lib/supabase/admin";
import {BROWSE_DEPARTMENTS,departmentHref} from "../../../lib/categories/browse-tree";
import {MARKETPLACE_JOURNEYS} from "../../../lib/marketplace/journeys";
import styles from "../source-atlas/atlas.module.css";

export const instant=false;
export const metadata:Metadata={title:"Marketplace control | AVUQO Control Centre",robots:{index:false,follow:false}};
type CategoryRecord={slug:string;name:string;is_active:boolean};
export default async function MarketplaceOperations(){
 await connection();await requireControlCentreAccess();
 const db=createAdminClient();
 const [roots,products,offers,priceRows,observations,content]=await Promise.all([
  db.from("categories").select("slug,name,is_active").is("parent_id",null).order("name"),
  db.from("products").select("id",{count:"exact",head:true}).eq("status","active"),
  db.from("published_deals").select("offer_id",{count:"exact",head:true}).eq("status","published"),
  db.from("grocery_prices").select("id",{count:"exact",head:true}).eq("status","published"),
  db.from("awin_feed_update_observations").select("id",{count:"exact",head:true}),
  db.from("site_content_published").select("version").eq("key","navigation").maybeSingle()
 ]);
 const known=new Map(((roots.data??[]) as CategoryRecord[]).map(c=>[c.slug,c]));
 const active=BROWSE_DEPARTMENTS.filter(d=>known.get(d.slug)?.is_active).length;
 return <div className={styles.page}>
  <header className={styles.header}><p className={styles.kicker}>Control Centre / Consumer marketplace</p>
   <h1>Every category. One operating view.</h1>
   <p>Review how all 25 departments, the four customer journeys and live-source restrictions fit together. Editorial pages can be open while database taxonomy, suppliers and offer publication remain restricted.</p>
   <div className={styles.links}><Link href="/marketplace">Public marketplace</Link>
    <Link href="/whos-who">Who&apos;s Who</Link>
    <Link href="/control-centre/source-atlas">All sources</Link>
    <Link href="/control-centre/content/navigation">Menu editor</Link>
    <Link href="/control-centre/release-readiness">Release readiness</Link></div>
  </header>
  {(roots.error||products.error||offers.error||observations.error)&&
   <div className={styles.notice} role="alert">Some live taxonomy or source records could not be verified. Unavailable data must not be considered approved.</div>}
  <section className={styles.grid} aria-label="Marketplace states">
   {[
    {name:"Browse departments",value:BROWSE_DEPARTMENTS.length,desc:"Editorial navigation routes, not product-feed activation"},
    {name:"Active taxonomy roots",value:roots.error?"Unknown":active,desc:"Database category switches; separate from editorial availability"},
    {name:"Inactive taxonomy roots",value:roots.error?"Unknown":BROWSE_DEPARTMENTS.length-active,desc:"Require explicit review before commercial activation"},
    {name:"Four shopping journeys",value:MARKETPLACE_JOURNEYS.length,desc:"Explore, Shop, Compare and Who's Who"},
    {name:"Active canonical product records",value:products.error?"Unknown":products.count??0,desc:"Not necessarily eligible public product pages"},
    {name:"Published deal records",value:offers.error?"Unknown":offers.count??0,desc:"Stricter source/offer checks still apply to display"},
    {name:"Published grocery price rows",value:priceRows.error?"Unknown":priceRows.count??0,desc:"Basket completeness, rights and freshness checks remain"},
    {name:"Awin feed observations",value:observations.error?"Unknown":observations.count??0,desc:"Observation alone never grants usage rights"}
   ].map(m=><article className={styles.metric} key={m.name}><small>{m.name}</small>
    <strong>{typeof m.value==="number"?m.value.toLocaleString("en-GB"):m.value}</strong><p>{m.desc}</p></article>)}
  </section>
  <section className={styles.panel}><div className={styles.panelHead}><h2>All category destinations</h2>
   <p>These are the 25 curated editorial routes. Database category switches have not been changed.</p></div>
   <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Department</th><th>Public editorial route</th><th>Taxonomy</th><th>Available topics</th></tr></thead>
    <tbody>{BROWSE_DEPARTMENTS.map(d=><tr key={d.slug}><td><strong>{d.name}</strong></td>
     <td><Link href={departmentHref(d)} target="_blank">{departmentHref(d)}</Link></td>
     <td><span className={styles.status+" "+(known.get(d.slug)?.is_active?styles.active:styles.paused)}>
      {roots.error||!known.has(d.slug)?"Not verified":known.get(d.slug)?.is_active?"Active root":"Inactive root"}</span></td>
     <td>{d.topics.length}</td>
    </tr>)}</tbody></table></div>
  </section>
  <section className={styles.panel}><div className={styles.panelHead}><h2>Unified customer journeys</h2>
   <p>Each route has a distinct meaning. No standalone microsites, duplicated catalogues or unrelated admin systems.</p></div>
   <div className={styles.checks}>{MARKETPLACE_JOURNEYS.map(item=><article className={styles.check} key={item.id}>
    <h3>{item.name}</h3><p>{item.description}</p><Link href={item.href} target="_blank">Open public journey →</Link></article>)}</div>
  </section>
  <section className={styles.panel}><div className={styles.panelHead}><h2>Admin release gates</h2>
   <p>Each existing workspace remains responsible for its own approval and audit history.</p></div>
   <div className={styles.checks}>{[
    {label:"Source permissions",desc:"Joined and observed feeds are not publication or image rights.",href:"/control-centre/source-readiness"},
    {label:"Product matching",desc:"Exact canonical identity, type-specific attributes and valid source proof.",href:"/control-centre/product-readiness"},
    {label:"Retailer publication",desc:"Qualified fresh offers, seller identity and total-cost comparability.",href:"/control-centre/awin-advertisers"},
    {label:"Groceries",desc:"Complete comparable basket totals from rights-cleared evidence.",href:"/control-centre/groceries"},
    {label:"Website editorial",desc:"Review navigation, legal, SEO and page-content changes separately.",href:"/control-centre/content"},
    {label:"Marketing independence",desc:"Organic scores and rankings independent of affiliate payout.",href:"/control-centre/trust"}
   ].map(g=><article key={g.label} className={styles.check}><h3>{g.label}</h3><p>{g.desc}</p><Link href={g.href}>Open existing control →</Link></article>)}</div>
  </section>
  <div className={styles.notice}><strong>Source of truth:</strong> Public editorial pages may exist for inactive catalogue categories. No source, taxonomy, merchant, imported product or commercial offer has been activated by this dashboard. {content.error?"Current navigation publication state unavailable.":content.data?"Published menu exists at version "+content.data.version+".":"Default vetted menu is in use."}</div>
 </div>;
}
