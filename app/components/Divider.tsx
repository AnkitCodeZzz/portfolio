import { useId } from "react";
import styles from "../page.module.css";

type DividerProps = {
  className?: string;
};

export default function Divider({ className }: DividerProps) {
  const patternId = useId();
  const clipId = useId();

  return (
    <div className={`${styles.dividerWrap} ${className ?? ""}`.trim()} aria-hidden="true">
      <div className={styles.divider}>
        <svg className={styles.dividerPattern} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id={patternId}
              patternUnits="userSpaceOnUse"
              width="4"
              height="4"
              patternTransform="scale(1.5)"
            >
              <g clipPath={`url(#${clipId})`}>
                <path d="M1 -1L5 3" stroke="currentColor" strokeWidth="0.5" />
                <path d="M-1 1L3 5" stroke="currentColor" strokeWidth="0.5" />
              </g>
            </pattern>
            <clipPath id={clipId}>
              <rect width="4" height="4" fill="white" />
            </clipPath>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill={`url(#${patternId})`} />
        </svg>
      </div>
    </div>
  );
}
