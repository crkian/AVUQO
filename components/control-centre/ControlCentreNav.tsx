"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {ChevronDown,ChevronRight,Home,ExternalLink} from "lucide-react";
import {CONTROL_CENTRE_SECTIONS,adminSectionForPath} from "../../lib/control-centre/workspaces";
import styles from "../../app/control-centre/control-centre.module.css";

export default function ControlCentreNav(){
 const pathname=usePathname();
 const activeSection=adminSectionForPath(pathname);
 return <nav className={styles.sideNav} aria-label="Control Centre navigation">
  <div className={styles.sideNavTitle}><strong>Workspaces</strong><small>One AVUQO backend</small></div>
  {CONTROL_CENTRE_SECTIONS.map(group=><details key={group.id} className={styles.navGroup}
    open={activeSection===group.id?true:undefined}>
    <summary><span>{group.label}<small>{group.description}</small></span><ChevronDown size={16} aria-hidden="true"/></summary>
    <div className={styles.navGroupLinks}>
      {group.links.map(item=><Link key={item.href} href={item.href}
        aria-current={pathname===item.href?"page":undefined}
        className={(pathname===item.href?styles.active:"")}>
        <ChevronRight size={14} aria-hidden="true"/>
        <span><b>{item.label}</b><small>{item.description}</small></span>
      </Link>)}
    </div>
  </details>)}
  <div className={styles.navFooter}>
    <Link href="/"><Home size={15}/> View AVUQO <ExternalLink size={12}/></Link>
    <small>Site advertising, social marketing and affiliate promotion have separate approvals.</small>
  </div>
 </nav>;
}
