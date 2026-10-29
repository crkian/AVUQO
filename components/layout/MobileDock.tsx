"use client";
import Link from "next/link";
import {House,Search,Compass,Bookmark,UserRound} from "lucide-react";
import {usePathname} from "next/navigation";
import styles from "./MobileDock.module.css";
const links=[
 {href:"/",label:"Home",Icon:House},
 {href:"/search",label:"Search",Icon:Search},
 {href:"/discover",label:"Discover",Icon:Compass},
 {href:"/watches",label:"Watches",Icon:Bookmark},
 {href:"/account",label:"Account",Icon:UserRound}
];
export default function MobileDock({signedIn}:{signedIn:boolean}){
 const path=usePathname();
 return <nav className={styles.dock} aria-label="Mobile quick navigation">
   {links.map(({href,label,Icon})=>{
    const actual=label==="Account"&&!signedIn?"/login":href;
    const active=path===href||(href==="/account"&&path==="/login");
    return <Link key={label} href={actual}
      aria-current={active?"page":undefined}
      className={styles.item+(active?" "+styles.active:"")}>
       <Icon size={21} aria-hidden="true"/><span>{label}</span>
    </Link>;
   })}
 </nav>;
}
