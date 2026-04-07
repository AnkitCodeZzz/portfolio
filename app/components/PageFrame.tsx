import type { ReactNode } from "react";
import InteractiveRuler from "./InteractiveRuler";
import styles from "../page.module.css";

const defaultSidebarLabels = Array.from({ length: 11 }, (_, index) => `${index * 100}`);

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
        <InteractiveRuler labels={defaultSidebarLabels} />
        <div className={`${styles.main} ${className ?? ""}`.trim()} data-ruler-content="main">
          {children}
        </div>
      </div>
    </main>
  );
}
