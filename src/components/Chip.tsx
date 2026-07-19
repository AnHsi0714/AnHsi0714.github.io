import type { HTMLAttributes } from "react";
import styles from "./Chip.module.scss";

export type ChipVariant = "default" | "success" | "info" | "warn" | "danger";
export type ChipSize = "sm" | "md";
export type ChipTone = "outline" | "filled";

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: ChipVariant;
  size?: ChipSize;
  tone?: ChipTone;
}

const variantClassKey: Record<ChipTone, Record<ChipVariant, string>> = {
  outline: {
    default: "outlineDefault",
    success: "outlineSuccess",
    info: "outlineInfo",
    warn: "outlineWarn",
    danger: "outlineDanger",
  },
  filled: {
    default: "filledDefault",
    success: "filledSuccess",
    info: "filledInfo",
    warn: "filledWarn",
    danger: "filledDanger",
  },
};

const sizeClassKey: Record<ChipTone, Record<ChipSize, string>> = {
  outline: { sm: "outlineSm", md: "outlineMd" },
  filled: { sm: "filledSm", md: "filledMd" },
};

export default function Chip({
  variant = "default",
  size = "md",
  tone = "outline",
  className,
  ...rest
}: ChipProps) {
  const classNames = [
    styles.chip,
    styles[tone],
    styles[variantClassKey[tone][variant]],
    styles[sizeClassKey[tone][size]],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <span className={classNames} {...rest} />;
}
