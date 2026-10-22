import { Suspense } from "react";

import DealCard from "../../components/deal/DealCard";
import Footer from "../../components/layout/Footer";
import Header from "../../components/layout/Header";
import LiveDealRail from "../../components/live/LiveDealRail";
import { deals } from "../../data/mock/deals";
import styles from "./page.module.css";

const hasTag = (tag: string) => deals.filter((deal) => deal.tags.includes(tag));

function DealRail({ title, kicker, items }: { title:string; kicker:string; items:typeof deals }) {
  return (
    <section className={`shell ${styles.section}`}>
      <div className={styles.heading}><div><p>{kicker}</p><h2>{title}</h2></div></div>
      <div className={styles.rail}>{items.slice(0,4).map((deal)=><DealCard key={deal.id} deal={deal}/>)}</div>
    </section>
  );
}

export default function DiscoverPage(){
  return (
    <main>
      <Header/>
      <section className={styles.hero}>
        <div className="shell">
          <p className="kicker">AVUQO Discover</p>
          <h1>The market, filtered for value.</h1>
          <p>Price drops, new lows, travel steals, ending-soon offers and things that may actually be worth waiting for. Ranked by value, never commission.</p>
        </div>
      </section>
      <section className={`shell ${styles.section}`}>
        <div className={styles.signalGrid}>
          <article className={styles.signal}><strong>95+</strong><span>Exceptional AVUQO Scores deserve immediate attention.</span><a href="/search">Explore exceptional finds</a></article>
          <article className={styles.signal}><strong>New lows</strong><span>Items hitting the bottom of their recent observed range.</span><a href="/search?q=new-low">See price lows</a></article>
          <article className={styles.signal}><strong>Worth waiting</strong><span>Good products where the current price still leaves room for patience.</span><a href="/search">See watch-worthy items</a></article>
        </div>
      </section>

      <section className={`shell ${styles.section}`}>
        <div className={styles.heading}>
          <div><p>Database-backed</p><h2>Live from the Deal Intelligence Pipeline</h2></div>
          <a href="/live">See all live deals</a>
        </div>
        <Suspense fallback={<div>Loading live AVUQO intelligence…</div>}>
          <LiveDealRail limit={4}/>
        </Suspense>
      </section>

      <DealRail kicker="Exceptional today" title="AVUQO 95+" items={deals.filter(d=>d.avuqoScore>=95)}/>
      <DealRail kicker="Market movement" title="Biggest drops & new lows" items={hasTag("new-low")}/>
      <DealRail kicker="Travel steals" title="Trips worth opening" items={deals.filter(d=>d.category==="Travel")}/>
      <DealRail kicker="Time-sensitive" title="Ending soon" items={hasTag("ending-soon")}/>
      <DealRail kicker="Popular right now" title="Strong crowd interest, verified value" items={hasTag("popular")}/>
      <Footer/>
    </main>
  );
}
