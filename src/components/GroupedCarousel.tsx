import { useEffect, useRef, useState, type ReactNode } from "react";
import Reveal from "./Reveal";

const TRANSITION_MS = 320;
const AUTO_ROTATE_MS = 3000;

function chunk<T>(items: T[], size: number): T[][] {
  const groups: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    groups.push(items.slice(i, i + size));
  }
  return groups;
}

interface GroupedCarouselProps<T> {
  items: T[];
  groupSize?: number;
  itemKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  gotoAriaLabel: (group: number) => string;
  // 讓使用者可以直接點內容左右兩側切換上一組/下一組，設計上是給 groupSize=1
  // 的單一內容(例如相片)用；true 時才需要提供 edgeNavLabels。
  edgeNav?: boolean;
  edgeNavLabels?: { previous: string; next: string };
}

export default function GroupedCarousel<T>({
  items,
  groupSize = 2,
  itemKey,
  renderItem,
  gotoAriaLabel,
  edgeNav = false,
  edgeNavLabels,
}: GroupedCarouselProps<T>) {
  const groups = chunk(items, groupSize);
  const [groupIndex, setGroupIndex] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const pendingIndex = useRef<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  // 換組的過程中把外層容器高度釘住在切換前量到的高度，收合/展開動畫只在這個
  // 釘住的高度裡面跑，容器本身在頁面上佔的版面不會變，下面的圓點才不會跟著位移。
  // 兩段組的內容高度可能本來就不完全一樣(例如相片說明文字換行數不同)，所以動畫
  // 全部結束後才放開釘住的高度，讓容器改用 auto 貼合新內容。
  const [lockedHeight, setLockedHeight] = useState<number | null>(null);

  const goTo = (target: number) => {
    if (target === groupIndex || collapsed) return;
    if (contentRef.current) {
      setLockedHeight(contentRef.current.getBoundingClientRect().height);
    }
    pendingIndex.current = target;
    setCollapsed(true);
    window.setTimeout(() => {
      if (pendingIndex.current !== null) {
        setGroupIndex(pendingIndex.current);
        pendingIndex.current = null;
      }
      setCollapsed(false);
      window.setTimeout(() => setLockedHeight(null), TRANSITION_MS);
    }, TRANSITION_MS);
  };

  useEffect(() => {
    if (groups.length <= 1 || isPaused) return;
    const id = window.setInterval(() => {
      goTo((groupIndex + 1) % groups.length);
    }, AUTO_ROTATE_MS);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupIndex, groups.length, isPaused]);

  const activeGroup = groups[groupIndex] ?? [];

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="relative">
        <div
          ref={contentRef}
          style={{
            height: lockedHeight !== null ? `${lockedHeight}px` : "auto",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              height: "100%",
              gridTemplateRows: collapsed ? "0fr" : "1fr",
              transition: `grid-template-rows ${TRANSITION_MS}ms ease-in-out`,
            }}
          >
            <div
              className="overflow-hidden"
              style={{
                opacity: collapsed ? 0 : 1,
                transition: `opacity ${TRANSITION_MS}ms ease-in-out`,
              }}
            >
              <div className="grid grid-cols-1 gap-4 py-0.5 sm:grid-cols-2">
                {activeGroup.map((item, index) => (
                  <Reveal
                    key={itemKey(item)}
                    delay={index * 80}
                    className={`h-full ${
                      index === activeGroup.length - 1 &&
                      activeGroup.length % 2 === 1
                        ? "sm:col-span-2"
                        : ""
                    }`}
                  >
                    {renderItem(item)}
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>

        {edgeNav && groups.length > 1 && edgeNavLabels && (
          <>
            <button
              type="button"
              aria-label={edgeNavLabels.previous}
              onClick={() =>
                goTo((groupIndex - 1 + groups.length) % groups.length)
              }
              className="group absolute inset-y-0 left-0 flex w-1/2 items-center justify-start pl-2"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-lg text-white opacity-0 transition-opacity group-hover:opacity-100">
                ‹
              </span>
            </button>
            <button
              type="button"
              aria-label={edgeNavLabels.next}
              onClick={() => goTo((groupIndex + 1) % groups.length)}
              className="group absolute inset-y-0 right-0 flex w-1/2 items-center justify-end pr-2"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-lg text-white opacity-0 transition-opacity group-hover:opacity-100">
                ›
              </span>
            </button>
          </>
        )}
      </div>

      {groups.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {groups.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={gotoAriaLabel(index + 1)}
              aria-current={index === groupIndex}
              onClick={() => goTo(index)}
              className={[
                "rounded-full transition-all",
                index === groupIndex
                  ? "h-2.5 w-2.5 bg-[var(--color-primary)]"
                  : "h-2 w-2 bg-[var(--color-border)] hover:bg-[var(--color-text-muted)]",
              ].join(" ")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
