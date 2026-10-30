"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle, Banknote, Database, ClipboardCheck, CalendarDays, PackageCheck,
  FilePenLine, GitBranch, LayoutDashboard, Activity, Layers3, Megaphone,
  ShieldCheck, Workflow
} from "lucide-react";
import styles from "../../app/control-centre/control-centre.module.css";

const items = [
  ["/control-centre", "Overview", LayoutDashboard],
  ["/control-centre/marketing", "Brand Social Marketing", Megaphone],
  ["/control-centre/live-data", "Live Data", Activity],
  ["/control-centre/coverage", "Coverage", Layers3],
  ["/control-centre/sources", "Sources", Database],
  ["/control-centre/source-readiness", "Source Readiness", ClipboardCheck],
  ["/control-centre/product-readiness", "Product Readiness", PackageCheck],
  ["/control-centre/taxonomy", "Category Taxonomy", Layers3],
  ["/control-centre/seasonal", "Seasonal & Pages", CalendarDays],
  ["/control-centre/content", "Website & Content", FilePenLine],
  ["/control-centre/content/navigation", "Site Navigation", Layers3],
  ["/control-centre/pipeline", "Pipeline", GitBranch],
  ["/control-centre/promotions", "Promotion", Megaphone],
  ["/control-centre/exceptions", "Exceptions", AlertTriangle],
  ["/control-centre/automation", "Autopilot", Workflow],
  ["/control-centre/revenue", "Revenue", Banknote],
  ["/control-centre/trust", "Trust", ShieldCheck],
] as const;

export default function ControlCentreNav() {
  const pathname = usePathname();
  return (
    <nav className={styles.sideNav} aria-label="Control Centre">
      {items.map(([href, label, Icon]) => (
        <Link key={href} href={href} className={pathname === href ? styles.active : ""}>
          <Icon size={17} /><span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
