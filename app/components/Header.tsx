"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MobileHeader from "./MobileHeader";
import styles from "../page.module.css";

export default function Header() {
  const pathname = usePathname();
  const isNoteDetail = pathname.startsWith("/notes/") && pathname !== "/notes";

  if (pathname === "/") {
    return null;
  }

  return (
    <header className={styles.header}>
      <div className={styles.desktopBrandRow}>
        <Link href="/" className={styles.brand}>
          <span>Ankit </span>
          <span className={styles.brandMuted}>Mandal</span>
        </Link>
        {!isNoteDetail ? (
          <nav className={styles.desktopNav} aria-label="Primary">
            <span className={`${styles.navItem} ${styles.navWork}`}>/work</span>
            <Link href="/notes" className={`${styles.inactiveLink} ${styles.navNotes}`}>
              /notes
            </Link>
            <span className={`${styles.navItem} ${styles.navReadme}`}>/readme</span>
          </nav>
        ) : null}
      </div>
      <MobileHeader key={isNoteDetail ? "detail" : "default"} showNav={!isNoteDetail} />
    </header>
  );
}
