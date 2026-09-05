import type { HTMLAttributes, KeyboardEvent, MouseEvent } from "react";
import styles from "./Chip.module.scss";

export type ChipVariant = "default" | "success" | "info" | "warn" | "danger";
export type ChipSize = "sm" | "md";

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: ChipVariant;
  size?: ChipSize;
  /** 標示此 chip 可點擊：外框會加上流動漸層動畫；有傳 onClick 時才會補上鍵盤操作與 a11y 屬性 */
  clickable?: boolean;
  /** 篩選器等 toggle 情境的「已選中」樣式：套用主色實心底，蓋過 variant 本身的顏色 */
  selected?: boolean;
}

const variantClassKey: Record<ChipVariant, string> = {
  default: "outlineDefault",
  success: "outlineSuccess",
  info: "outlineInfo",
  warn: "outlineWarn",
  danger: "outlineDanger",
};

const sizeClassKey: Record<ChipSize, string> = {
  sm: "outlineSm",
  md: "outlineMd",
};

export default function Chip({
  variant = "default",
  size = "md",
  clickable = false,
  selected,
  className,
  onClick,
  onKeyDown,
  "aria-pressed": ariaPressedProp,
  ...rest
}: ChipProps) {
  const classNames = [
    styles.chip,
    styles.outline,
    styles[variantClassKey[variant]],
    styles[sizeClassKey[size]],
    clickable && styles.clickable,
    selected && styles.selected,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const isInteractive = clickable && Boolean(onClick);

  // 有明確傳 aria-pressed 就尊重呼叫端；沒傳但有 selected 時，interactive chip 預設帶上 toggle 語意
  const ariaPressed =
    ariaPressedProp ?? (isInteractive && selected !== undefined ? selected : undefined);

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
      aria-pressed={ariaPressed}
      {...rest}
    />
  );
}
