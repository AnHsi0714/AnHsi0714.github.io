import type { HTMLAttributes } from "react";
import styles from "./Skeleton.module.scss";

// 通用骨架佔位：預設吃 --color-surface / --color-surface-hover，深色舞台等
// 需要不同底色的場合可用 inline style 覆寫 --skeleton-base / --skeleton-highlight。
export default function Skeleton({
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[styles.skeleton, className].filter(Boolean).join(" ")}
      aria-hidden="true"
      {...rest}
    />
  );
}
