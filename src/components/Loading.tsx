import styles from "./Loading.module.scss";

type LoadingSize = "sm" | "md" | "lg";

interface LoadingProps {
  size?: LoadingSize;
  label?: string;
  progress?: number;
  complete?: boolean;
}

export default function Loading({
  size = "md",
  label,
  progress,
  complete,
}: LoadingProps) {
  return (
    <div
      className={
        complete ? [styles.wrapper, styles.complete].join(" ") : styles.wrapper
      }
      role="status"
    >
      <div
        className={[styles.monster, styles[size]].join(" ")}
        aria-hidden="true"
      >
        <div className={styles.eye}>
          <div className={styles.eyeball}></div>
        </div>
        <div className={styles.mouth}></div>
      </div>
      {typeof progress === "number" && (
        <div className={styles.progress}>
          <div className={styles.progressBar} style={{ width: `${progress}%` }} />
        </div>
      )}
      {label && <span className={styles.label}>{label}</span>}
    </div>
  );
}
