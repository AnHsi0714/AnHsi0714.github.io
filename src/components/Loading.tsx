import { useMemo, type CSSProperties } from "react";
import ProgressBar from "./ProgressBar";
import { useTranslation } from "../i18n/useTranslation";
import styles from "./Loading.module.scss";

type LoadingSize = "sm" | "md" | "lg";

interface LoadingProps {
  size?: LoadingSize;
  label?: string;
  progress?: number;
  complete?: boolean;
}

export const MONSTER_COLOR_PAIRS: { monster: string; horn: string }[] = [
  { monster: "#33dbdb", horn: "#e0a435" },
  { monster: "#725fe0", horn: "#d2f53a" },
  { monster: "#4a6bad", horn: "#f4a261" },
  { monster: "#f11961", horn: "#77baf1" },
  { monster: "#61f054", horn: "#a894f2" },
];

export function useMonsterColors() {
  return useMemo(() => {
    const pair =
      MONSTER_COLOR_PAIRS[
        Math.floor(Math.random() * MONSTER_COLOR_PAIRS.length)
      ];

    return {
      "--monster-color": pair.monster,
      "--horn-color": pair.horn,
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
  const { t } = useTranslation();
  // 沒傳 label 時用共用的「載入中…」，各處不必每次自己帶文字
  const text = label ?? t.common.loading;

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
        <div className={styles.progressWrapper}>
          <ProgressBar progress={progress} variant="footprint" steps={6} />
        </div>
      )}
      {text && <span className={styles.label}>{text}</span>}
    </div>
  );
}
