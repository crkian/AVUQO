"use client";
import Link from "next/link";
import {House,Heart,List,UserRound} from "lucide-react";
import {usePathname} from "next/navigation";
import styles from "./MobileDock.module.css";
const links=[
 {href:"/",label:"Home",Icon:House},
 {href:"/saved",label:"Saved",Icon:Heart},
 {href:"/lists",label:"Lists",Icon:List},
 {href:"/account",label:"Account",Icon:UserRound}
];
export default function MobileDock({signedIn}:{signedIn:boolean}){
 const path=usePathname();
 return <nav className={styles.dock} aria-label="Mobile quick navigation">
   {links.map(({href,label,Icon})=>{
    const actual=label==="Account"&&!signedIn?"/login?next=/account":href;
    const current=path===actual.split("?")[0];
    const active=current||path===href||(href==="/lists"&&path.startsWith("/lists/"));
    return <Link key={label} href={actual}
      aria-current={current?"page":active?"location":undefined}
      className={styles.item+(active?" "+styles.active:"")}>
       <Icon size={21} aria-hidden="true"/><span>{label}</span>
    </Link>;
   })}
 </nav>;
}
