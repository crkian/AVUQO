import {connection} from "next/server";
import Link from "next/link";
import type {Metadata} from "next";
import {ShieldAlert,ShieldCheck,Database,LockKeyhole,ArrowLeft,ExternalLink} from "lucide-react";
import {requireControlCentreAccess} from "../../../lib/auth/requireControlCentreAccess";
import {loadEbayPrivacyControlTower} from "../../../lib/ebay/privacy-control-tower-server";
import {EBAY_WORK_SURFACES} from "../../../lib/ebay/privacy-control-tower";
import type {CountEvidence} from "../../../lib/ebay/privacy-control-tower";
import styles from "../source-atlas/atlas.module.css";

export const instant=false;
export const metadata:Metadata={title:"eBay privacy control tower | AVUQO",robots:{index:false,follow:false}};
const show=(c:CountEvidence)=>c.error||c.value===null?"Unavailable":c.value.toLocaleString("en-GB");
const stateLabels={
 pending:"Pending",leased:"Leased",awaiting_evidence:"Awaiting evidence",blocked:"Blocked"
} as const;

export default async function EbayPrivacyControlTower(){
 await connection();
 // Authorization MUST run before any secret-backed database access.
 await requireControlCentreAccess();
 const {signals,readiness}=await loadEbayPrivacyControlTower();
 return <div className={styles.page}>
  <header className={styles.header}>
   <p className={styles.kicker}>CONTROL CENTRE / EBAY / PRIVACY &amp; OPERATIONS / OWNER ONLY</p>
   <h1>eBay privacy control tower</h1>
   <p>A live, read-only view of eBay's deletion safety status. Counts are direct
    database observations, not evidence that account erasure, legal retention or
    eBay subscription has been approved. No control on this page edits records.</p>
   <nav className={styles.links}>
    <Link href="/control-centre/retailers"><ArrowLeft size={16}/> Retailer onboarding</Link>
    <Link href="/preview/ebay">Private eBay Browse</Link>
    <a href="https://developer.ebay.com/my/alerts" target="_blank" rel="noopener noreferrer">Developer notifications <ExternalLink size={16}/></a>
   </nav>
  </header>

  <section className={styles.grid} aria-label="eBay operational safety indicators">
   <article className={styles.metric}>
    <small>Provider registration</small><strong>NOT READY</strong>
    <p>Requires signed notification proof, complete review and explicit operator approval</p>
   </article>
   <article className={styles.metric}>
    <small>Source quarantine</small>
    <strong>{readiness.sourceQuarantined?"Confirmed":"NOT VERIFIED"}</strong>
    <p>Must be paused with sync disabled. No automatic activation.</p>
   </article>
   <article className={styles.metric}>
    <small>Private deletion receipts</small><strong>{show(signals.receipts)}</strong>
    <p>Journal entries are not evidence of erasure or acknowledgement.</p>
   </article>
   <article className={styles.metric}>
    <small>Account ownership links</small><strong>{show(signals.links)}</strong>
    <p>Existing exact HMAC links, count only; no identities displayed.</p>
   </article>
  </section>

  <section className={styles.panel} aria-label="Provider activation safety blockers">
   <div className={styles.panelHead}><h2><ShieldAlert size={20}/> Provider activation blocked</h2>
    <p>The deletion POST stays HTTP 503 and the eBay portal must remain unregistered until the independent approval gates are met.</p></div>
   <div className={styles.notice}>
    <strong>DO NOT save the verification token or subscription endpoint yet.</strong>
    Even when the table counts are all zero, that does not prove account-specific data
    is absent from history, backups, objects, logs or external processors.
   </div>
   <ul>{readiness.blockers.map(blocker=><li key={blocker}>{blocker}</li>)}</ul>
   <p><LockKeyhole size={16}/> Verification token: {signals.verificationTokenConfigured?"Configured (value hidden)":"Not configured"}.
    Endpoint URL: {signals.endpointUrlMatches?"Configured to canonical URL":"Not configured to canonical URL"}.
    Credentials and token values are never shown.</p>
  </section>

  <section className={styles.panel} aria-label="eBay account deletion work queue">
   <div className={styles.panelHead}>
    <h2><Database size={20}/> Private work journal</h2>
    <p>{readiness.journalReadable?
      "Live DBA-only journal counts. Awaiting evidence and blocked are NEVER completed states.":
      "Journal unavailable or migration unapplied. This is a BLOCKER, not an empty queue."}</p>
   </div>
   <div className={styles.grid}>{(Object.keys(stateLabels) as (keyof typeof stateLabels)[]).map(key=>
    <article key={key} className={styles.metric}><small>{stateLabels[key]}</small>
     <strong>{show(signals.workByState[key])}</strong></article>)}</div>
   <div className={styles.tableWrap}><table className={styles.table}>
    <thead><tr><th>Deletion surface</th><th>Recorded work items</th><th>Meaning</th></tr></thead>
    <tbody>{EBAY_WORK_SURFACES.map(([key,label])=><tr key={key}>
     <td><strong>{label}</strong></td><td>{show(signals.workBySurface[key])}</td>
     <td>Requires an independent deletion, exclusion or retention evidence review</td>
    </tr>)}</tbody>
   </table></div>
  </section>

  <section className={styles.panel} aria-label="Existing eBay catalogue surface counts">
   <div className={styles.panelHead}><h2><ShieldCheck size={20}/> Mapped catalogue observations</h2>
    <p>Counts are scoped to the eBay source. No data is changed or displayed from private listing payloads.</p></div>
   <div className={styles.grid}>
    {([
     ["offers","Offers"],
     ["source_ingestion_items","Ingestion items"],
     ["price_history","Price history"],
     ["product_matches","Product matches"]
    ] as const).map(([key,label])=><article className={styles.metric} key={key}>
     <small>{label}</small><strong>{show(signals.catalogue[key])}</strong></article>)}
   </div>
   <div className={styles.notice}>Zero counts only describe these currently linked and source-scoped tables. They are not proof that historical events, stored images, retained backups, or processors hold no eBay-associated data.</div>
  </section>

  <section className={styles.panel}>
   <div className={styles.panelHead}><h2>Next release steps</h2>
    <p>Operational sequence for the advanced eBay comparison integration, without direct stock supply or AVUQO fulfilment.</p></div>
   <ol>
    <li>Review and test the unapplied private work-journal, account-specific audit and erasure migrations against full referential constraints.</li>
    <li>Implement lawful per-surface erasure or retention decisions for account-linked analytics, feedback, watch history, logs, assets and outside processors.</li>
    <li>Validate signed real-provider notifications and idempotent durable processing without premature success acknowledgement.</li>
    <li>Only after release approval: provision the verification token, configure the canonical endpoint, subscribe and verify a real test notification.</li>
   </ol>
   <nav className={styles.links}><Link href="/control-centre/source-readiness">Review source permissions</Link>
    <Link href="/control-centre/retailers">Back to all retailers</Link></nav>
  </section>
 </div>;
}
