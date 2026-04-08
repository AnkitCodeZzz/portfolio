import styles from "../page.module.css";

type PinIconProps = {
  className?: string;
};

export default function PinIcon({ className }: PinIconProps) {
  return (
    <span
      className={`${styles.pin} ${className ?? ""}`.trim()}
      aria-hidden="true"
    >
      <span className={styles.pinPartA} />
      <span className={styles.pinPartB} />
    </span>
  );
}
