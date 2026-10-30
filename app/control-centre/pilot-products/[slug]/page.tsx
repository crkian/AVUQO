import type {Metadata} from "next";
import Link from "next/link";
import {connection} from "next/server";
import {notFound} from "next/navigation";
import {ArrowLeft,ArrowRight,CheckCircle2,ExternalLink,FileSearch,ShieldCheck,Tag} from "lucide-react";
import {requireControlCentreAccess} from "../../../../lib/auth/requireControlCentreAccess";
import {createAdminClient} from "../../../../lib/supabase/admin";
import {PILOT_PREVIEWS,findPilotPreview,privateBrandHref,privatePilotHref} from "../../../../lib/products/private-preview";
import styles from "../detail.module.css";

type Props={params:Promise<{slug:string}>;searchParams:Promise<{layout?:string}>};
type Pilot={
 id:string;slug:string;canonical_title:string;brand:string|null;status:string;
 category_id:string|null;product_type:string|null;specifications:unknown;metadata:unknown
};
const metadataValue=(value:unknown):Record<string,unknown>=>value&&typeof value==="object"&&!Array.isArray(value)?value as Record<string,unknown>:{};
const safeValue=(value:unknown)=>typeof value==="string"||typeof value==="number"?String(value):"Not recorded";
export const metadata:Metadata={title:"Private product layout preview | AVUQO",robots:{index:false,follow:false}};
export default async function PrivateProductPreview({params,searchParams}:Props){
 await connection();
 await requireControlCentreAccess();
 const [{slug},{layout}]=await Promise.all([params,searchParams]);
 const config=findPilotPreview(slug);
 if(!config)notFound();
 const db=createAdminClient();
 const record=await db.from("products")
  .select("id,slug,canonical_title,brand,status,category_id,product_type,specifications,metadata")
  .eq("slug",slug).eq("status","draft").maybeSingle();
 if(record.error)return <section className={styles.fatal} role="alert">
  <h1>Could not load this private draft</h1>
  <p>The owner-only database query failed. No unverified product was published.</p>
  <Link href="/control-centre/pilot-products">Back to the eight drafts</Link>
 </section>;
 const product=record.data as Pilot|null;
 if(!product)notFound();
 const position=PILOT_PREVIEWS.findIndex(x=>x.slug===slug);
 const prev=PILOT_PREVIEWS[(position+PILOT_PREVIEWS.length-1)%PILOT_PREVIEWS.length];
 const next=PILOT_PREVIEWS[(position+1)%PILOT_PREVIEWS.length];
 const story=layout==="story";
 const spec=metadataValue(product.specifications);
 const meta=metadataValue(product.metadata);
 return <div className={styles.page} data-theme={config.theme}>
  <header className={styles.pageHeader}>
   <p className={styles.eyebrow}>Sources &amp; Value / Product design review</p>
   <div className={styles.headingRow}>
    <div><h1>Individual product preview</h1><p>Test the wording, hierarchy and product-specific presentation before any offer is published.</p></div>
    <Link href="/control-centre/pilot-products" className={styles.back}><ArrowLeft size={16}/> All eight drafts</Link>
   </div>
   <div className={styles.privateNotice}><ShieldCheck size={19}/>
    <div><strong>Private, unaffiliated design preview</strong><span>Not publicly listed · No authorised images · No verified offers or prices · No shopping actions</span></div>
   </div>
  </header>
  <nav className={styles.tabBar} aria-label="Product layout alternatives">
   <Link aria-current={!story?"page":undefined} href={privatePilotHref(slug)}>Standard product layout</Link>
   <Link aria-current={story?"page":undefined} href={privatePilotHref(slug)+"?layout=story"}>Category editorial layout</Link>
   <Link href={privateBrandHref(config.brandSlug)}>Brand-area concept <ExternalLink size={15}/></Link>
  </nav>
  <div className={styles.browserMock} aria-label="Page mockup">
   <div className={styles.browserChrome}><span className={styles.browserDots}>● ● ●</span><span>AVUQO · Internal preview / product</span><span>NOT LIVE</span></div>
   {story&&<section className={styles.storyHero}>
    <p>{config.eyebrow}</p>
    <h2>{config.storyHeadline}</h2>
    <span>{config.storyIntro}</span>
    <Link href={config.categoryHref} className={styles.storyLink}>Explore {config.categoryTitle}<ArrowRight size={17}/></Link>
   </section>}
   <div className={styles.mockBody}>
    <nav className={styles.breadcrumb} aria-label="Preview breadcrumbs">
     <span>AVUQO</span><span>/</span><span>{config.categoryTitle}</span><span>/</span><strong>{product.brand??"Brand pending"}</strong>
    </nav>
    <section className={styles.productHero}>
     <div className={styles.productArt} aria-label="Design placeholder only. No merchant or manufacturer image is displayed">
      <span className={styles.photoTag}>DESIGN PLACEHOLDER</span>
      <div className={styles.artShape} aria-hidden="true"><span>Q</span></div>
      <span className={styles.photoCaption}>Product photograph awaiting usage rights</span>
      <div className={styles.thumbnails}><span>Image 1</span><span>Detail</span><span>Pack</span><span>Size</span></div>
     </div>
     <div className={styles.productCopy}>
      <p className={styles.productEyebrow}>{config.eyebrow}</p>
      <h2>{config.suggestedTitle}</h2>
      <p className={styles.proposedTitle}>Proposed page title · exact product identification pending</p>
      <div className={styles.metaPills}><span><Tag size={14}/> {product.brand??"Brand not recorded"}</span><span>{config.categoryTitle}</span><span>Draft identity</span></div>
      <p className={styles.lede}>{config.shortDescription}</p>
      <div className={styles.customerPrompt}><strong>Before you compare</strong><p>{config.contextQuestion}</p></div>
      <div className={styles.unavailable}>
       <div><small>Eligible retailer price</small><strong>Not yet available</strong><span>Exact model, merchant terms and source rights require review.</span></div>
       <div className={styles.inactive}>Compare verified offers <ArrowRight size={17}/></div>
      </div>
      <p className={styles.micro}><ShieldCheck size={16}/> No seller or brand receives a ranking advantage for advertising.</p>
     </div>
    </section>
    <section className={styles.editorial}>
     <div className={styles.editorialTitle}><p>Made for this kind of decision</p><h2>{config.storyHeadline}</h2><span>{config.storyIntro}</span></div>
     <div className={styles.promptGrid}>{config.prompts.map((point,index)=><article key={point}>
      <div aria-hidden="true">{String(index+1).padStart(2,"0")}</div>
      <h3>{point}</h3><p>Evidence and exact product details will appear here when authorised and checked.</p>
     </article>)}</div>
    </section>
    <section className={styles.evidence}>
     <div><p className={styles.productEyebrow}>Product verification</p><h2>What needs checking?</h2>
      <p>Questions are editorial guidance, not evidence that this item has the described features.</p></div>
     <ul>{config.checks.map(item=><li key={item}><CheckCircle2 size={18}/>{item}</li>)}</ul>
    </section>
    <section className={styles.fieldSheet}>
     <div><p className={styles.productEyebrow}>Behind the design</p><h2>Imported data versus customer copy</h2><p>Make the wording decision here before approval. The product name below remains exactly as stored in the staging database.</p></div>
     <dl>
      <div><dt>Suggested customer-facing title</dt><dd>{config.suggestedTitle}</dd></div>
      <div><dt>Original imported product title</dt><dd>{product.canonical_title}</dd></div>
      <div><dt>Recorded brand</dt><dd>{product.brand??"Not recorded"}</dd></div>
      <div><dt>Merchant SKU</dt><dd>{safeValue(spec.merchant_sku)}</dd></div>
      <div><dt>Source record ID</dt><dd>{safeValue(meta.source_record_id)}</dd></div>
      <div><dt>Review status</dt><dd>Identity and rights not approved</dd></div>
      <div><dt>Current merchant offer</dt><dd>Not verified, not displayed</dd></div>
     </dl>
    </section>
    <section className={styles.brandedOpportunity}>
     <div><p>Optional company area</p><h2>Could this have a branded destination?</h2>
      <span>Yes, after a company agrees to the correct content, trademark and advertising permissions. AVUQO keeps independent results and comparison rules.</span></div>
     <Link href={privateBrandHref(config.brandSlug)}>Preview {product.brand??"this brand"} area <ArrowRight size={16}/></Link>
    </section>
    <div className={styles.disclosure}><ShieldCheck size={17}/>
      <span>Internal design preview. Product descriptions are proposed editorial wording, not verified retailer specifications, advertising claims or endorsed manufacturer content.</span></div>
   </div>
  </div>
  <nav className={styles.sequence} aria-label="Next private product previews">
   <Link href={privatePilotHref(prev.slug)}><ArrowLeft size={16}/> Previous product</Link>
   <Link href={privatePilotHref(next.slug)}>Next product <ArrowRight size={16}/></Link>
  </nav>
  <section className={styles.reviewPanel}>
   <div><FileSearch size={23}/><h2>Review before this becomes a real product page</h2></div>
   <p>Check title accuracy, exact variant, category wording, photographic rights, source legitimacy, image alt text, accessibility and mobile layout. We are not publishing unverified merchant data.</p>
   <div className={styles.reviewLinks}><Link href="/control-centre/feed-imports">Source import review</Link>
    <Link href="/control-centre/product-readiness">Publication readiness</Link>
    <Link href="/control-centre/site-advertising">Third-party advertising controls</Link></div>
  </section>
 </div>;
}
