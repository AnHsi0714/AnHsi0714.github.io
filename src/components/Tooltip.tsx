import { useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./Tooltip.module.scss";

const BUBBLE_MAX_WIDTH = 240;
const VIEWPORT_MARGIN = 8;
const TRIGGER_GAP = 10;
const ARROW_EDGE_MARGIN = 10; // 箭頭離泡泡圓角至少留這個距離，避免卡到轉角

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  className?: string;
}

interface BubbleState {
  top: number;
  left: number;
  arrowLeft: number;
  placement: "top" | "bottom";
}

export default function Tooltip({ content, children, className }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [bubbleState, setBubbleState] = useState<BubbleState>({
    top: 0,
    left: 0,
    arrowLeft: 0,
    placement: "top",
  });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const tooltipId = useId();

  useLayoutEffect(() => {
    if (!isOpen) return;

    // 跟 Term 一樣量測 bubble 實際尺寸後再決定開在上方還是下方，
    // 避免頁面頂部／底部的觸發元素被裁在畫面外看不到；箭頭則獨立算在
    // wrapper 座標系裡的水平位置，讓它永遠指向觸發元素中心，
    // 而不是泡泡本身的中心（泡泡貼近視窗邊緣時兩者會不一樣）。
    const updatePosition = () => {
      const trigger = triggerRef.current?.getBoundingClientRect();
      const bubble = bubbleRef.current;
      if (!trigger || !bubble) return;

      const bubbleWidth = bubble.offsetWidth;
      const bubbleHeight = bubble.offsetHeight;
      const triggerCenter = trigger.left + trigger.width / 2;

      const left = Math.max(
        VIEWPORT_MARGIN,
        Math.min(
          triggerCenter - bubbleWidth / 2,
          window.innerWidth - bubbleWidth - VIEWPORT_MARGIN,
        ),
      );
      const arrowLeft = Math.max(
        ARROW_EDGE_MARGIN,
        Math.min(triggerCenter - left, bubbleWidth - ARROW_EDGE_MARGIN),
      );

      const opensBelow = trigger.top < bubbleHeight + TRIGGER_GAP + VIEWPORT_MARGIN;
      const top = opensBelow
        ? trigger.bottom + TRIGGER_GAP
        : trigger.top - bubbleHeight - TRIGGER_GAP;

      setBubbleState({ top, left, arrowLeft, placement: opensBelow ? "bottom" : "top" });
    };
    updatePosition();

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  return (
    <span
      ref={triggerRef}
      tabIndex={0}
      className={[styles.trigger, className].filter(Boolean).join(" ")}
      aria-describedby={isOpen ? tooltipId : undefined}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={() => setIsOpen(false)}
    >
      {children}
      {isOpen &&
        createPortal(
          <div
            style={{ top: bubbleState.top, left: bubbleState.left }}
            className={styles.wrapper}
          >
            <div
              // bubble 開在下方時，箭頭貼在泡泡頂邊朝上指向觸發元素；反之貼在底邊朝下指
              className={
                bubbleState.placement === "bottom" ? styles.arrowTop : styles.arrowBottom
              }
              style={{ left: bubbleState.arrowLeft }}
            />
            <div
              ref={bubbleRef}
              role="tooltip"
              id={tooltipId}
              style={{ maxWidth: BUBBLE_MAX_WIDTH }}
              className={styles.bubble}
            >
              {content}
            </div>
          </div>,
          document.body,
        )}
    </span>
  );
}
