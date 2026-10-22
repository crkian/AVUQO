"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  Banknote,
  Database,
  GitBranch,
  LayoutDashboard,
  Megaphone,
  ShieldCheck,
  Workflow,
} from "lucide-react";

import styles from "../../app/control-centre/control-centre.module.css";

const items = [
  ["/control-centre", "Overview", LayoutDashboard],
  ["/control-centre/sources", "Sources", Database],
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
        <Link
          key={href}
          href={href}
          className={pathname === href ? styles.active : ""}
        >
          <Icon size={17} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
