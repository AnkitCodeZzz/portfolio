"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MobileHeader from "./MobileHeader";
import styles from "../page.module.css";

export default function Header() {
  const pathname = usePathname();
  const isContentDetail =
    (pathname.startsWith("/notes/") && pathname !== "/notes") ||
    (pathname.startsWith("/work/") && pathname !== "/work");
  const isWorkActive = pathname === "/work" || pathname.startsWith("/work/");
  const isNotesActive = pathname === "/notes" || pathname.startsWith("/notes/");
  const isReadmeActive = pathname === "/readme" || pathname.startsWith("/readme/");

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
        {!isContentDetail ? (
          <nav className={styles.desktopNav} aria-label="Primary">
            <Link
              href="/work"
              className={`${styles.inactiveLink} ${styles.navWork} ${isWorkActive ? styles.navActive : ""}`.trim()}
              aria-current={isWorkActive ? "page" : undefined}
            >
              /work
            </Link>
            <Link
              href="/notes"
              className={`${styles.inactiveLink} ${styles.navNotes} ${isNotesActive ? styles.navActive : ""}`.trim()}
              aria-current={isNotesActive ? "page" : undefined}
            >
              /notes
            </Link>
            <Link
              href="/readme"
              className={`${styles.inactiveLink} ${styles.navReadme} ${isReadmeActive ? styles.navActive : ""}`.trim()}
              aria-current={isReadmeActive ? "page" : undefined}
            >
              /readme
            </Link>
          </nav>
        ) : null}
      </div>
      <MobileHeader key={isContentDetail ? "detail" : "default"} showNav={!isContentDetail} />
    </header>
  );
}
