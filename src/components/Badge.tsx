import type { HTMLAttributes } from "react";
import styles from "./Badge.module.scss";

type BadgeVariant =
  | "neutral"
  | "todo"
  | "doing"
  | "done"
  | "success"
  | "danger";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export default function Badge({
  variant = "neutral",
  className,
  ...rest
}: BadgeProps) {
  const classNames = [styles.badge, styles[variant], className]
    .filter(Boolean)
    .join(" ");

  return <span className={classNames} {...rest} />;
}
