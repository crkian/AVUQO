import {Suspense} from "react";
import {connection} from "next/server";
import Link from "next/link";
import type {Metadata} from "next";
import {ArrowRight, Compass, Search, ShieldCheck, Sparkles} from "lucide-react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import VerifiedProductCards from "../../components/products/VerifiedProductCards";
import {verifiedProductIndex} from "../../lib/products/public-catalog";
import {lifestylePages} from "../../lib/lifestyle/landing-data";
import styles from "./page.module.css";

export const metadata:Metadata={
  title:"Search AVUQO",
  description:"Search approved product records and explore AVUQO's thoughtful shopping departments.",
  robots:{index:false,follow:true},
};
type Props={searchParams:Promise<{q?:string|string[]}>};

const paths=[
  {label:"Technology",href:"/tech",image:lifestylePages.tech.tiles[0].image,words:["tech","laptop","phone","computer","headphones","gaming","television","camera"]},
  {label:"Home & living",href:"/home",image:lifestylePages.home.hero,words:["home","furniture","kitchen","decor","sofa","garden","lighting","bed"]},
  {label:"Beauty",href:"/beauty",image:lifestylePages.beauty.hero,words:["beauty","skin","hair","wellness","fragrance","makeup"]},
  {label:"Gifts",href:"/gifts",image:lifestylePages.gifts.hero,words:["gift","birthday","christmas","present","chocolate"]},
  {label:"Fashion",href:"/fashion",image:lifestylePages.fashion.hero,words:["fashion","coat","shoes","dress","clothing","bag"]},
  {label:"Groceries",href:"/groceries",image:"https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=700&q=80",words:["grocer","food","milk","basket","supermarket","fresh","drinks"]},
  {label:"Travel",href:"/travel",image:lifestylePages.travel.hero,words:["travel","trip","holiday","flight","hotel","weekend"]},
  {label:"Pets",href:"/pets",image:"/illustrations/avuqo-pets-care.svg",words:["pet","dog","cat","animal","feeding"]},
] as const;

function suggestedPaths(query:string) {
  if(!query)return paths.slice(0,4);
  const lower=query.toLowerCase();
  const tokens=lower.split(/[^a-z0-9]+/).filter(Boolean);
  const byRelevance=paths.map((item,index)=>({
    item,index,score:item.words.reduce((score,word)=>
      score+(tokens.some(token=>word.startsWith(token)||token.startsWith(word))?1:0),0),
  })).sort((a,b)=>b.score-a.score||a.index-b.index);
  return byRelevance.slice(0,4).map(entry=>entry.item);
}

async function Results({searchParams}:Props) {
  await connection();
  const input=(await searchParams).q;
  const query=(typeof input==="string"?input:"").trim().slice(0,120);
  const words=query.toLocaleLowerCase("en-GB").split(/\s+/).filter(Boolean);
  const all=await verifiedProductIndex(60);
  const results=words.length?all.filter(({product,offers})=>{
    const hay=[product.canonical_title,product.brand,product.model,product.description,
      ...offers.map(offer=>offer.published.category)].filter(Boolean).join(" ").toLocaleLowerCase("en-GB");
    return words.every(word=>hay.includes(word));
  }):all;

  return <>
    <section className={styles.hero}>
      <div className="shell">
        <p className={styles.kicker}><Sparkles size={15} aria-hidden="true"/> Discover through AVUQO</p>
        <h1>{query?<>Find what&apos;s worth it for <em>{query}.</em></>:"What are you looking for?"}</h1>
        <p>Explore the things that matter to you. Current product offers appear only when our source, matching and publication checks allow them.</p>
        <form className={styles.search} action="/search" method="get" role="search">
          <Search size={21} aria-hidden="true"/>
          <input name="q" type="search" defaultValue={query} maxLength={120} placeholder="Search products, ideas and categories" aria-label="Search AVUQO" required/>
          <button type="submit">Search <ArrowRight size={17} aria-hidden="true"/></button>
        </form>
        <nav className={styles.examples} aria-label="Suggested searches"><span>Explore</span>
          {["laptops","home storage","skincare","gifts"].map(term=>
            <Link key={term} href={`/search?q=${encodeURIComponent(term)}`}>{term}</Link>)}
        </nav>
      </div>
    </section>

    <section className={`shell ${styles.results}`} aria-labelledby="result-heading">
      <div className={styles.heading}>
        <div><p className={styles.kicker}><ShieldCheck size={16} aria-hidden="true"/> Source-checked product guides</p>
          <h2 id="result-heading">{results.length
            ?`${results.length} ${query?"matching ":""}verified ${results.length===1?"product":"products"}`
            :query?"No verified matches for that search yet.":"Good evidence comes first."}</h2>
          <p>{results.length
            ?"The displayed offers have passed the public eligibility checks. Compare exact variants and check final retailer terms."
            :query?"We couldn't find an eligible published product that matches every word. Try another term or explore a related department below."
            :"There are no eligible public product records ready to display right now. Our category guides are open for inspiration."}</p>
        </div>
        {results.length>0&&<Link href="/products">All verified products <ArrowRight size={17}/></Link>}
      </div>
      {results.length>0?<VerifiedProductCards items={results}/>:
       <div className={styles.empty}>
         <span><Compass size={30} aria-hidden="true"/></span>
         <div><strong>There&apos;s plenty worth discovering.</strong><p>These are editorial routes, not sponsored results or claims of stock and discounts.</p></div>
         <Link href="/categories">Browse categories <ArrowRight size={17}/></Link>
       </div>}
    </section>

    <section className={styles.explore} aria-labelledby="explore-heading">
      <div className="shell">
        <div className={styles.heading}><div><p className={styles.kicker}>A little more inspiration</p><h2 id="explore-heading">Explore by department.</h2>
          <p>{query?"These departments may be useful places to browse next. They are not verified product matches.":"Find useful ideas, guidance and ways to compare beyond the product shelf."}</p>
        </div><Link href="/categories">All departments <ArrowRight size={17}/></Link></div>
        <div className={styles.departments}>{suggestedPaths(query).map(item=>
          <Link href={item.href} key={item.href} className={styles.department}>
            <span className={styles.photo} style={{backgroundImage:`url("${item.image}")`}} aria-hidden="true"/>
            <span className={styles.departmentName}><strong>{item.label}</strong><ArrowRight size={16} aria-hidden="true"/></span>
          </Link>)}
        </div>
        <p className={styles.trust}><ShieldCheck size={17} aria-hidden="true"/> No fictional discounts or commission-led organic product results. <Link href="/editorial-policy">Read our editorial policy</Link>.</p>
      </div>
    </section>
  </>;
}
export default function Page(props:Props){
  return <main><Header/><Suspense fallback={<div className="shell section">Checking published product evidence…</div>}><Results {...props}/></Suspense><Footer/></main>;
}
