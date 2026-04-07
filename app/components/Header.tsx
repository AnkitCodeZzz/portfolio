"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MobileHeader from "./MobileHeader";
import styles from "../page.module.css";

export default function Header() {
  const pathname = usePathname();

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
        <nav className={styles.desktopNav} aria-label="Primary">
          <span className={styles.navItem}>/work</span>
          <Link href="/notes" className={styles.inactiveLink}>
            /notes
          </Link>
          <span className={styles.navItem}>/readme</span>
        </nav>
      </div>
      <MobileHeader />
    </header>
  );
}
