import type { HTMLAttributes, KeyboardEvent, MouseEvent } from "react";
import styles from "./Chip.module.scss";

export type ChipVariant = "default" | "success" | "info" | "warn" | "danger";
export type ChipSize = "sm" | "md";
export type ChipTone = "outline" | "filled";

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: ChipVariant;
  size?: ChipSize;
  tone?: ChipTone;
  /** 標示此 chip 可點擊：外框會加上流動漸層動畫；有傳 onClick 時才會補上鍵盤操作與 a11y 屬性 */
  clickable?: boolean;
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
  clickable = false,
  className,
  onClick,
  onKeyDown,
  ...rest
}: ChipProps) {
  const classNames = [
    styles.chip,
    styles[tone],
    styles[variantClassKey[tone][variant]],
    styles[sizeClassKey[tone][size]],
    clickable && styles.clickable,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const isInteractive = clickable && Boolean(onClick);

  const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    onKeyDown?.(event);
    if (isInteractive && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      onClick!(event as unknown as MouseEvent<HTMLSpanElement>);
    }
  };

  return (
    <span
      className={classNames}
      onClick={onClick}
      onKeyDown={isInteractive ? handleKeyDown : onKeyDown}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      {...rest}
    />
  );
}
