import { useCallback, useEffect, useRef, useState } from "react";
import Card from "../../components/Card";
import EmptyState from "../../components/EmptyState";
import type { FriendCreation } from "../../types/content";
import styles from "./Friends.module.scss";

// 佔位資料，之後接上邀請碼兌換 + 2D 像素編輯器（見 docs/ARCHITECTURE.md §5、§7）後移除
const placeholderCreations: FriendCreation[] = [
  {
    id: 1,
    nickname: "（範例暱稱）",
    intro: "朋友創作的示範卡片，之後會換成邀請碼兌換後畫的 2D 像素作品。",
  },
  {
    id: 2,
    nickname: "（範例暱稱）",
    intro: "每位朋友兌換邀請碼、畫完像素圖後，作品會顯示在這裡。",
  },
  {
    id: 3,
    nickname: "（範例暱稱）",
    intro: "示範用，驗證 carousel 在「圖+暱稱+介紹」這種資料形狀下的呈現效果。",
  },
];

function FriendCreationCard({ creation }: { creation: FriendCreation }) {
  return (
    <Card className="w-56 sm:w-64">
      {creation.imageUrl ? (
        <img
          src={creation.imageUrl}
          alt={creation.nickname}
          className="aspect-square w-full rounded-md object-cover"
        />
      ) : (
        <div className="flex aspect-square w-full items-center justify-center rounded-md bg-neutral-100 text-3xl font-semibold text-neutral-300">
          {creation.nickname.slice(0, 1)}
        </div>
      )}
      <p className="mt-3 font-semibold">{creation.nickname}</p>
      {creation.intro && (
        <p className="mt-2 text-sm text-neutral-600 line-clamp-3">
          {creation.intro}
        </p>
      )}
    </Card>
  );
}

function FriendCreationCarousel({
  creations,
}: {
  creations: FriendCreation[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [focus, setFocus] = useState<{ scale: number; brightness: number }[]>(
    [],
  );
  const [spacerWidth, setSpacerWidth] = useState(0);

  // 兩端留白，確保第一個／最後一個作品也能被捲到正中間（見下方 spacer 元素）
  const GAP_PX = 32;

  // 熱路徑：捲動中每一格都會跑，只算「誰最靠近中間」，不量測尺寸
  const updateCarouselState = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    const distances = itemRefs.current.map((el) => {
      if (!el) return Infinity;
      const itemCenter = el.offsetLeft + el.offsetWidth / 2;
      return Math.abs(itemCenter - containerCenter);
    });
    const closestIndex = distances.indexOf(Math.min(...distances));

    setFocus(
      itemRefs.current.map((_, index) => ({
        // 只有正中間那個作品放大一點，其他維持原尺寸；亮度則只有正中間是亮的
        scale: index === closestIndex ? 1.08 : 1,
        brightness: index === closestIndex ? 1 : 0.4,
      })),
    );
    setActiveIndex(closestIndex);
  }, []);

  // 冷路徑：只有容器尺寸／作品清單變動時才需要重新量測 spacer 寬度
  const measureSpacer = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const firstCard = itemRefs.current.find(
      (el): el is HTMLDivElement => el !== null,
    );
    const cardWidth = firstCard?.offsetWidth ?? 0;
    setSpacerWidth(
      Math.max(0, (container.clientWidth - cardWidth) / 2 - GAP_PX),
    );
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ left: 0 });
    measureSpacer();
  }, [creations, measureSpacer]);

  // 等 spacer 寬度真的套用到 DOM 之後才量「誰在中間」，避免量到舊版面
  useEffect(() => {
    updateCarouselState();
  }, [spacerWidth, updateCarouselState]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    let frame = 0;
    const handleScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateCarouselState);
    };
    const handleResize = () => {
      measureSpacer();
      updateCarouselState();
    };
    container.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frame);
    };
  }, [updateCarouselState, measureSpacer]);

  itemRefs.current = [];

  const centerItem = (index: number) => {
    itemRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  if (creations.length === 0) {
    return (
      <EmptyState
        title="尚無朋友創作"
        description="之後會陸續累積邀請碼兌換後的作品。"
      />
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="上一個作品"
        disabled={activeIndex === 0}
        onClick={() => centerItem(activeIndex - 1)}
        className="absolute left-0 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-2xl shadow-md hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-30"
      >
        ‹
      </button>

      <div
        ref={scrollRef}
        className={`${styles.scrollArea} flex snap-x snap-proximity gap-8 overflow-x-auto py-10`}
      >
        <div
          aria-hidden="true"
          className="shrink-0"
          style={{ width: spacerWidth }}
        />
        {creations.map((creation, index) => (
          <div
            key={creation.id}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            role="button"
            tabIndex={0}
            onClick={() => centerItem(index)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                centerItem(index);
              }
            }}
            className="shrink-0 cursor-pointer snap-center will-change-transform transition-transform duration-150 ease-out"
            style={{
              transform: `scale(${focus[index]?.scale ?? 1})`,
              filter: `brightness(${focus[index]?.brightness ?? 1})`,
            }}
          >
            <FriendCreationCard creation={creation} />
          </div>
        ))}
        <div
          aria-hidden="true"
          className="shrink-0"
          style={{ width: spacerWidth }}
        />
      </div>

      <button
        type="button"
        aria-label="下一個作品"
        disabled={activeIndex === creations.length - 1}
        onClick={() => centerItem(activeIndex + 1)}
        className="absolute right-0 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-2xl shadow-md hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-30"
      >
        ›
      </button>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        {creations.map((creation, index) => (
          <button
            key={creation.id}
            type="button"
            aria-label={`前往第 ${index + 1} 個作品：${creation.nickname}`}
            aria-current={index === activeIndex}
            onClick={() => centerItem(index)}
            className={[
              "rounded-full transition-all",
              index === activeIndex
                ? "h-2.5 w-2.5 bg-neutral-900"
                : "h-2 w-2 bg-neutral-300 hover:bg-neutral-400",
            ].join(" ")}
          />
        ))}
      </div>
    </div>
  );
}

export default function Friends() {
  return (
    <section>
      <h1 className="text-2xl font-bold">朋友創作</h1>
      <p className="mt-2 text-neutral-600">
        邀請碼入口 + 朋友的 2D 像素作品，目前先用佔位資料示範。
      </p>

      <div className="mt-8 ml-[calc(50%_-_50vw)] mr-[calc(50%_-_50vw)] w-screen px-6 sm:px-10">
        <FriendCreationCarousel creations={placeholderCreations} />
      </div>
    </section>
  );
}
