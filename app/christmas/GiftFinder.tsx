"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Gift } from "lucide-react";
import styles from "./gift-finder.module.css";

type Idea = { name: string; recipients: string[]; budgets: number[]; search: string; description: string };
const ideas: Idea[] = [
  { name: "Creative craft kits", recipients: ["Kids", "Adults", "Families"], budgets: [10,25,50], search: "craft kits", description: "Hands-on projects for making and gifting." },
  { name: "Chocolate & festive treats", recipients: ["Kids", "Adults", "Families"], budgets: [10,25,50], search: "chocolate gifts", description: "Small seasonal treats and sharing ideas." },
  { name: "Personalised keepsakes", recipients: ["Adults", "Families"], budgets: [25,50,100], search: "personalised Christmas gifts", description: "Consider delivery lead times before ordering." },
  { name: "Art and painting gifts", recipients: ["Kids", "Adults"], budgets: [25,50,100], search: "paint by numbers", description: "A thoughtful option for creative people." },
  { name: "Stocking filler ideas", recipients: ["Kids", "Adults"], budgets: [10,25], search: "stocking fillers", description: "Smaller gifts without overspending." },
  { name: "Games for gathering", recipients: ["Kids", "Families"], budgets: [25,50,100], search: "family games", description: "For playing together over the holidays." },
  { name: "Christmas decorations", recipients: ["Families", "Adults"], budgets: [10,25,50], search: "Christmas decorations", description: "Festive details for the home." },
  { name: "Food and drink gifts", recipients: ["Adults", "Families"], budgets: [25,50,100], search: "food gift hampers", description: "Remember delivery costs and ingredients." },
];
const recipients = ["Anyone", "Kids", "Adults", "Families"];
const budgets = [{label:"Any budget",value:0},{label:"Under £10",value:10},{label:"Under £25",value:25},{label:"Under £50",value:50},{label:"Under £100",value:100}];

export default function GiftFinder() {
  const [recipient, setRecipient] = useState("Anyone");
  const [budget, setBudget] = useState(0);
  const results = useMemo(() => ideas.filter(idea => (recipient === "Anyone" || idea.recipients.includes(recipient)) && (!budget || idea.budgets.includes(budget))), [recipient,budget]);
  return <section className="shell section" aria-labelledby="gift-finder-heading">
    <div className={styles.head}><div><p className="kicker">Gift finder</p><h2 id="gift-finder-heading">Start with the person, not the price tag.</h2><p>Choose who you're shopping for and your spending limit. These are editorial ideas, not verified product offers or live prices.</p></div><Gift size={37} aria-hidden="true"/></div>
    <div className={styles.controls}><fieldset><legend>Shopping for</legend><div className={styles.choices}>{recipients.map(value=><button key={value} type="button" aria-pressed={recipient===value} className={recipient===value?styles.selected:""} onClick={()=>setRecipient(value)}>{value}</button>)}</div></fieldset><fieldset><legend>Spending limit</legend><div className={styles.choices}>{budgets.map(item=><button key={item.value} type="button" aria-pressed={budget===item.value} className={budget===item.value?styles.selected:""} onClick={()=>setBudget(item.value)}>{item.label}</button>)}</div></fieldset></div>
    <p className={styles.count} aria-live="polite">{results.length} gift idea categories</p>
    <div className={styles.results}>{results.map(idea=><article key={idea.name}><h3>{idea.name}</h3><p>{idea.description}</p><Link href={`/search?q=${encodeURIComponent(idea.search + (budget ? " under £" + budget : ""))}`}>Explore ideas <ArrowRight size={15}/></Link></article>)}</div>
    {results.length===0&&<p className={styles.empty}>No matching categories yet. Try a different budget or recipient.</p>}
  </section>;
}
