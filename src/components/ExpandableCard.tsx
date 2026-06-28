import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import Card from "./Card";
import styles from "./ExpandableCard.module.scss";

interface ExpandableCardProps {
  /** 圖片（如果有），固定顯示在卡片與展開內容的最上方 */
  image?: ReactNode;
  /** 卡片本身顯示的（可能被截斷的）預覽內容 */
  children: ReactNode;
  /** 點擊卡片後，於全螢幕置中遮罩顯示的完整內容 */
  expandedContent: ReactNode;
  hoverable?: boolean;
  className?: string;
}

export default function ExpandableCard({
  image,
  children,
  expandedContent,
  hoverable = true,
  className,
}: ExpandableCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [isOpen]);

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setIsOpen(true);
    }
  };

  return (
    <>
      <Card
        hoverable={hoverable}
        className={className}
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(true)}
        onKeyDown={handleTriggerKeyDown}
      >
        {image}
        {children}
      </Card>

      {isOpen &&
        createPortal(
          <div className={styles.backdrop} onClick={() => setIsOpen(false)}>
            <div
              ref={panelRef}
              className={styles.panel}
              role="dialog"
              aria-modal="true"
              tabIndex={-1}
              onClick={(event) => event.stopPropagation()}
            >
              {image}
              {expandedContent}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
