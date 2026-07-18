import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useGlossary } from "../lib/glossary";
import { useTranslation } from "../i18n/useTranslation";

const POPOVER_WIDTH = 288;
const VIEWPORT_MARGIN = 12;
const TRIGGER_GAP = 6;

interface TermProps {
  id: string;
  children: ReactNode;
}

export default function Term({ id, children }: TermProps) {
  const glossary = useGlossary();
  const { t } = useTranslation();
  const entry = glossary[id];
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!isOpen) return;

    // 量測 popover 實際高度後再決定要開在觸發點下方還是上方，
    // 避免頁面底部的詞彙點開後，卡片被裁在畫面外看不到。
    const updatePosition = () => {
      const trigger = triggerRef.current?.getBoundingClientRect();
      const popoverHeight = popoverRef.current?.offsetHeight ?? 0;
      if (!trigger) return;

      const left = Math.max(
        VIEWPORT_MARGIN,
        Math.min(trigger.left, window.innerWidth - POPOVER_WIDTH - VIEWPORT_MARGIN),
      );

      const spaceBelow = window.innerHeight - trigger.bottom;
      const spaceAbove = trigger.top;
      const fitsBelow = popoverHeight + TRIGGER_GAP <= spaceBelow;
      const opensUpward = !fitsBelow && spaceAbove > spaceBelow;

      const top = opensUpward
        ? Math.max(VIEWPORT_MARGIN, trigger.top - popoverHeight - TRIGGER_GAP)
        : Math.min(
            trigger.bottom + TRIGGER_GAP,
            window.innerHeight - popoverHeight - VIEWPORT_MARGIN,
          );

      setPosition({ top, left });
    };
    updatePosition();

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  if (!entry) {
    return <>{children}</>;
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="cursor-help border-0 border-b border-dotted border-[var(--color-text-muted)] bg-transparent p-0 align-baseline font-[inherit] text-[inherit] leading-[inherit]"
      >
        {children}
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            role="dialog"
            style={{ top: position.top, left: position.left, width: POPOVER_WIDTH }}
            className="fixed z-50 max-w-[calc(100vw-1.5rem)] rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-sm shadow-lg"
          >
            <p className="font-semibold text-[var(--color-text)]">{entry.term}</p>
            <p className="mt-1 text-[var(--color-text-muted)]">{entry.definition}</p>
            <p className="mt-2 border-t border-[var(--color-border)] pt-2 text-[var(--color-text-muted)]">
              <span className="font-medium text-[var(--color-text)]">
                {t.term.inThisProject}
              </span>
              {entry.application}
            </p>
          </div>,
          document.body,
        )}
    </>
  );
}
