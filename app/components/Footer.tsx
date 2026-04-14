import Divider from "./Divider";
import styles from "../page.module.css";

function XIcon() {
  return (
    <span className={styles.xIcon} aria-hidden="true">
      <span className={styles.xLayerA}>
        <svg
          className={styles.xVector}
          viewBox="0 0 8.5 9.25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            className={styles.xPath}
            d="M0.5 0.5H2.75L8 8.75H5.75L0.5 0.5Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className={styles.xLayerB}>
        <svg
          className={styles.xVector}
          viewBox="0 0 4.08813 4.39704"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            className={styles.xPath}
            d="M3.58813 0.500004L0.500004 3.89703"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className={styles.xLayerC}>
        <svg
          className={styles.xVector}
          viewBox="0 0 4.08813 4.39704"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            className={styles.xPath}
            d="M3.58813 0.500004L0.500004 3.89703"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </span>
  );
}

export default function Footer() {
  return (
    <footer className={`${styles.footer} ${styles.footerDocked}`}>
      <Divider className={styles.footerTopDivider} />
      <div className={styles.footerInner}>
        <span className={styles.footerCopy}>
          <span>© Ankit Mandal</span>
          <span className={styles.footerMutedDot}>•</span>
          <span>{new Date().getFullYear()}</span>
        </span>
        <div className={styles.footerLinks}>
          <a
            href="https://x.com/Ankit__TwT"
            target="_blank"
            rel="noreferrer"
            className={`${styles.footerLink} ${styles.footerIconLink}`}
          >
            <XIcon />
          </a>
          <span className={styles.footerMutedDot}>•</span>
          <a
            href="https://www.linkedin.com/in/itsankitmandal/"
            target="_blank"
            rel="noreferrer"
            className={`${styles.footerLink} ${styles.footerTextLink}`}
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
