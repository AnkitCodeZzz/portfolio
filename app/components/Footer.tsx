"use client";

import { usePathname } from "next/navigation";
import styles from "../page.module.css";

function XIcon() {
  return (
    <span className={styles.xIcon} aria-hidden="true">
      <span className={styles.xLayerA} />
      <span className={styles.xLayerB} />
      <span className={styles.xLayerC} />
    </span>
  );
}

export default function Footer() {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  return (
    <footer className={`${styles.footer} ${styles.footerDocked}`}>
      <div className={styles.footerInner}>
        <span className={styles.footerCopy}>
          <span>© Ankit Mandal</span>
          <span className={styles.footerMutedDot}>•</span>
          <span>{new Date().getFullYear()}</span>
        </span>
        <div className={styles.footerLinks}>
          <a href="https://x.com/Ankit__TwT" target="_blank" rel="noreferrer" className={styles.footerLink}>
            <XIcon />
          </a>
          <span className={styles.footerMutedDot}>•</span>
          <a
            href="https://www.linkedin.com/in/itsankitmandal/"
            target="_blank"
            rel="noreferrer"
            className={styles.footerLink}
          >
            LinkedIn
          </a>
          <span className={styles.footerMutedDot}>•</span>
          <span>Resume</span>
        </div>
      </div>
    </footer>
  );
}
