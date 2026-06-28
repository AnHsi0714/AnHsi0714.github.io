import { useMemo, type CSSProperties } from "react";
import styles from "./Loading.module.scss";

type LoadingSize = "sm" | "md" | "lg";

interface LoadingProps {
  size?: LoadingSize;
  label?: string;
  progress?: number;
  complete?: boolean;
}

const HORN_HUE_OFFSET_RANGE: [number, number] = [25, 50];

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function useMonsterColors() {
  return useMemo(() => {
    const monsterHue = randomBetween(0, 360);
    const offset = randomBetween(...HORN_HUE_OFFSET_RANGE);
    const hornHue = (monsterHue + (Math.random() < 0.5 ? -offset : offset) + 360) % 360;

    return {
      "--monster-color": `hsl(${monsterHue.toFixed(0)}, ${randomBetween(35, 65).toFixed(0)}%, ${randomBetween(30, 50).toFixed(0)}%)`,
      "--horn-color": `hsl(${hornHue.toFixed(0)}, ${randomBetween(50, 75).toFixed(0)}%, ${randomBetween(45, 65).toFixed(0)}%)`,
    } as CSSProperties;
  }, []);
}

export default function Loading({
  size = "md",
  label,
  progress,
  complete,
}: LoadingProps) {
  const monsterColors = useMonsterColors();

  return (
    <div
      className={
        complete ? [styles.wrapper, styles.complete].join(" ") : styles.wrapper
      }
      role="status"
    >
      <div
        className={[styles.monster, styles[size]].join(" ")}
        style={monsterColors}
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
