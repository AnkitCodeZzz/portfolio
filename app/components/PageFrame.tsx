import type { ReactNode } from "react";
import InteractiveRuler from "./InteractiveRuler";
import styles from "../page.module.css";

type PageFrameProps = {
  children: ReactNode;
  className?: string;
  mobileRulerStrategy?: "center";
};

export default function PageFrame({
  children,
  className,
  mobileRulerStrategy = "center",
}: PageFrameProps) {
  return (
    <main className={`${styles.page} ${styles.framePage}`}>
      <div className={styles.pageBody} data-ruler-mobile-strategy={mobileRulerStrategy}>
        <InteractiveRuler />
        <div className={`${styles.main} ${styles.frameMain} ${className ?? ""}`.trim()} data-ruler-content="main">
          {children}
        </div>
      </div>
    </main>
  );
}
