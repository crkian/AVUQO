"use client";

import Link from "next/link";
import { ArrowLeft, ChevronRight, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { BROWSE_DEPARTMENTS, departmentBySlug, departmentHref, topicHref } from "../../lib/categories/browse-tree";
import { orderedNavigation, type NavigationContent } from "../../lib/content/navigation";
import styles from "./MobileMenu.module.css";

export default function MobileMenu({ navigation, signedIn, ownerPreview }: {
  navigation: NavigationContent;
  signedIn: boolean;
  ownerPreview: boolean;
}) {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<string | null>(null);
  const [department, setDepartment] = useState<string | null>(null);
  const groups = orderedNavigation(navigation);
  const group = groups.find(item => item.id === section);
  const selected = department ? departmentBySlug(department) : undefined;

  useEffect(() => {
    const compact = window.matchMedia("(max-width: 1000px)");
    const closeOnDesktop = () => {
      if (!compact.matches) dialog.current?.close();
    };
    compact.addEventListener("change", closeOnDesktop);
    return () => compact.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    dialog.current?.close();
  }, [pathname]);

  useLayoutEffect(() => {
    if (!open) return;
    panel.current?.scrollTo(0, 0);
    heading.current?.focus();
  }, [open, section, department]);

  function close() {
    dialog.current?.close();
  }

  function onClose() {
    setOpen(false);
    setSection(null);
    setDepartment(null);
    if (trigger.current?.getClientRects().length) trigger.current.focus();
  }

  function renderLink(href: string, label: string) {
    return <Link key={href} href={href} onNavigate={close}
      aria-current={pathname === href.split("?")[0] ? "page" : undefined}>
      {label}<ChevronRight size={17} aria-hidden="true"/>
    </Link>;
  }

  return <>
    <button ref={trigger} className="mobile-menu-toggle" type="button"
      aria-label="Open navigation" aria-haspopup="dialog" aria-expanded={open}
      aria-controls="avuqo-mobile-navigation" onClick={() => {
        dialog.current?.showModal();
        setOpen(true);
      }}>
      <Menu size={23} aria-hidden="true"/>
    </button>
    <dialog ref={dialog} id="avuqo-mobile-navigation" className={styles.dialog}
      aria-labelledby="avuqo-mobile-title" onClose={onClose}
      onClick={event => { if (event.target === event.currentTarget) close(); }}>
      <div className={styles.drawer}>
        <div className={styles.top}>
          {group && <button type="button" aria-label={selected ? "Back to categories" : "Back to main menu"}
            onClick={() => selected ? setDepartment(null) : setSection(null)}>
            <ArrowLeft size={21} aria-hidden="true"/>
          </button>}
          <h2 ref={heading} id="avuqo-mobile-title" tabIndex={-1}>
            {selected?.name ?? group?.label ?? "Explore AVUQO"}
          </h2>
          <button type="button" aria-label="Close navigation" onClick={close}><X size={23} aria-hidden="true"/></button>
        </div>
        <div ref={panel} className={styles.panel}>
          <nav aria-label="Mobile destinations" className={styles.links}>
            {selected ? <>
              {renderLink(departmentHref(selected), "Open department")}
              {selected.topics.map(topic => renderLink(topicHref(topic), topic))}
            </> : group?.id === "categories" ? <>
              {renderLink(group.href, "All categories")}
              {group.links.filter(link => link.href === "/shopping").map(link => renderLink(link.href, link.label))}
              {BROWSE_DEPARTMENTS.map(item => <button type="button" key={item.slug}
                onClick={() => setDepartment(item.slug)}>{item.name}<ChevronRight size={17} aria-hidden="true"/></button>)}
            </> : group ? <>
              {!group.links.some(link => link.href === group.href) && renderLink(group.href, `View ${group.label}`)}
              {group.links.map(link => renderLink(link.href, link.label))}
            </> : <>
              {groups.map(item => <button type="button" key={item.id}
                onClick={() => setSection(item.id)}>{item.label}<ChevronRight size={17} aria-hidden="true"/></button>)}
              <h3>My AVUQO</h3>
              {renderLink(signedIn ? "/account" : "/login?next=/account", signedIn ? "My account" : "Sign in")}
              {renderLink("/saved", "Saved items")}
              {renderLink("/watches", "Watches")}
              {renderLink("/lists", "Lists")}
              {renderLink("/wishlist", "Wishlist")}
              {renderLink("/basket", "Comparison basket")}
              {ownerPreview && renderLink("/control-centre", "Control Centre")}
              {ownerPreview && renderLink("/preview/storefront", "Owner storefront")}
            </>}
          </nav>
        </div>
      </div>
    </dialog>
  </>;
}
