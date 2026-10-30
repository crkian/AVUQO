import Link from "next/link";
import {ArrowRight,ArrowUpRight,Compass,Search,ShieldCheck} from "lucide-react";
import {type CategoryStory,storySearchHref} from "../../lib/lifestyle/category-story";
import styles from "./CategoryMoments.module.css";
export default function CategoryMoments({story}:{story:CategoryStory}){
 return <section className={styles.wrap+" "+styles[story.energy]} aria-labelledby="category-story-title">
  <div className="shell">
   <div className={styles.heading}>
    <p className={styles.eyebrow}><Compass size={16}/> {story.identity}</p>
    <h2 id="category-story-title">{story.featuredTitle}</h2>
    <p>{story.featuredCopy}</p>
   </div>
   <div className={styles.grid}>
    {story.moments.map((item,i)=><Link key={item.title} className={styles.card} href={storySearchHref(item.query)}>
      <div className={styles.visual} aria-hidden="true"><span>{["01","02","03"][i]}</span><b>{["✦","◇","◈"][i]}</b></div>
      <div className={styles.copy}><small>{item.signal}</small><h3>{item.title}</h3><p>{item.description}</p>
       <span className={styles.action}>Explore ideas <ArrowUpRight size={16}/></span>
      </div>
    </Link>)}
   </div>
   <div className={styles.searchRow}>
    <div><ShieldCheck size={21}/><span><strong>A useful thing to remember</strong><small>{story.focus}</small></span></div>
    <Link href={"/search?q="+encodeURIComponent(story.moments[0].query)}>
      <Search size={16}/> Start your search <ArrowRight size={16}/>
    </Link>
   </div>
   <p className={styles.note}>These are inspiration and search journeys, not claims that a specific merchant has stock, a verified offer or a published price.</p>
  </div>
 </section>;
}
