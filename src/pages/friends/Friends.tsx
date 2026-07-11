import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Alert from "../../components/Alert";
import Button from "../../components/Button";
import Card from "../../components/Card";
import EmptyState from "../../components/EmptyState";
import Loading from "../../components/Loading";
import PixelCanvas from "../../components/PixelCanvas";
import { fetchFriendCreations } from "../../lib/friends";
import { isSupabaseConfigured } from "../../lib/supabaseClient";
import type { FriendCreationRow } from "../../types/friends";
import styles from "./Friends.module.scss";

function FriendCreationCard({ creation }: { creation: FriendCreationRow }) {
  return (
    <Card className="w-56 sm:w-64">
      <PixelCanvas
        data={creation.data}
        className="aspect-square w-full rounded-md bg-[var(--color-surface)]"
      />
      <p className="mt-3 font-semibold">{creation.nickname}</p>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        {new Date(creation.created_at).toLocaleDateString("zh-TW")}
      </p>
    </Card>
  );
}

function FriendCreationCarousel({
  creations,
}: {
  creations: FriendCreationRow[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showIntro, setShowIntro] = useState(false);
  const [focus, setFocus] = useState<{ scale: number; brightness: number }[]>(
    [],
  );

  // 換到別的作品（點擊或捲動）就收起敘述遮罩
  useEffect(() => {
    setShowIntro(false);
  }, [activeIndex]);

  // 遮罩開啟期間：Esc 可關閉、鎖住頁面捲動（同 ExpandableCard 的做法）
  useEffect(() => {
    if (!showIntro) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowIntro(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [showIntro]);

  const activeCreation = creations[activeIndex] as
    | FriendCreationRow
    | undefined;
  const [spacerWidth, setSpacerWidth] = useState(0);

  // 兩端留白，確保第一個／最後一個作品也能被捲到正中間（見下方 spacer 元素）
  const GAP_PX = 32;

  // 卡片一律用 [data-index] 現查 DOM，不維護 ref 陣列：ref callback 只在 React 認定
  // 「ref prop 變了」時才會重新觸發，itemRefs.current 若在 render phase 被清空後、
  // commit 沒能及時把 ref 掛回去（例如背景重繪打斷），就會一直是空陣列，點下一個
  // 作品直接判定「沒有這個元素」而整個 no-op——查證過確實會發生。GalleryGrid.tsx
  // 的展牆捲動用同一招（querySelectorAll("[data-slug]")）已驗證可靠，這裡跟進。
  const getItems = () =>
    Array.from(
      scrollRef.current?.querySelectorAll<HTMLElement>("[data-index]") ?? [],
    );

  // 熱路徑：捲動中每一格都會跑，只算「誰最靠近中間」，不量測尺寸
  const updateCarouselState = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const items = getItems();

    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    const distances = items.map((el) => {
      const itemCenter = el.offsetLeft + el.offsetWidth / 2;
      return Math.abs(itemCenter - containerCenter);
    });
    const closestIndex = distances.indexOf(Math.min(...distances));

    setFocus(
      items.map((_, index) => ({
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
    const cardWidth = getItems()[0]?.offsetWidth ?? 0;
    setSpacerWidth(
      Math.max(0, (container.clientWidth - cardWidth) / 2 - GAP_PX),
    );
  }, []);

  // 只在掛載當下捲回最左邊＋量一次 spacer：這個元件只在資料真的從無到有時才會掛載
  // （見下方 Friends() 的 isPending 分支），之後 React Query 背景重新請求資料
  // 導致 creations 參照改變時，不該再把使用者手動捲到的位置強制拉回第一件，
  // 不然點下一個作品會被這個 effect 隨機蓋掉，看起來像「時好時壞」。
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    scrollRef.current?.scrollTo({ left: 0 });
    measureSpacer();
  }, []);

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

  // behavior 用 "instant" 而非 "smooth"：容器有 scroll-snap-type 時，smooth 捲動（不管是
  // el.scrollIntoView 還是 container.scrollTo）在部分瀏覽器（尤其 Chromium／Windows）會被
  // snap 邏輯中途拉回原位，導致點下一個/上一個時好時壞。GalleryGrid.tsx 的展牆捲動也遇過
  // 同一個問題，同樣改用 instant 解決（見該檔案 line 133、152 的註解）。
  const centerItem = (index: number) => {
    const container = scrollRef.current;
    const item = getItems()[index];
    if (!container || !item) return;
    const itemCenter = item.offsetLeft + item.offsetWidth / 2;
    container.scrollTo({
      left: itemCenter - container.clientWidth / 2,
      behavior: "instant",
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
        className="absolute left-0 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] text-2xl shadow-md hover:bg-[var(--color-surface)] disabled:cursor-not-allowed disabled:opacity-30"
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
            data-index={index}
            role="button"
            tabIndex={0}
            aria-label={
              index === activeIndex && creation.intro
                ? `${creation.nickname} 的作品，點擊查看敘述`
                : `前往 ${creation.nickname} 的作品`
            }
            // 點還沒置中的作品 → 把它捲到中間；點已置中且有敘述的作品 → 開啟整頁敘述遮罩
            onClick={() => {
              if (index === activeIndex) {
                if (creation.intro) setShowIntro(true);
              } else {
                centerItem(index);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (index === activeIndex) {
                  if (creation.intro) setShowIntro(true);
                } else {
                  centerItem(index);
                }
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
        className="absolute right-0 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] text-2xl shadow-md hover:bg-[var(--color-surface)] disabled:cursor-not-allowed disabled:opacity-30"
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
                ? "h-2.5 w-2.5 bg-[var(--color-primary)]"
                : "h-2 w-2 bg-[var(--color-border)] hover:bg-[var(--color-text-muted)]",
            ].join(" ")}
          />
        ))}
      </div>

      {/* 敘述遮罩：整頁置中的一句話，像作者本人站出來講了句玩笑話；點任意處或 Esc 關閉 */}
      {showIntro &&
        activeCreation?.intro &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${activeCreation.nickname} 的作品敘述`}
            onClick={() => setShowIntro(false)}
            className={`${styles.introBackdrop} fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center bg-black/70 px-8 backdrop-blur-sm`}
          >
            <blockquote
              className={`${styles.intro} max-w-xl text-center text-2xl leading-relaxed text-white transition-all duration-300 hover:text-amber-300
    hover:scale-105
    hover:-skew-x-12`}
            >
              「{activeCreation.intro}」
            </blockquote>
            <p className="mt-6 text-sm text-white/60">
              —— {activeCreation.nickname}
            </p>
          </div>,
          document.body,
        )}
    </div>
  );
}

export default function Friends() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["friend-creations"],
    queryFn: fetchFriendCreations,
    enabled: isSupabaseConfigured,
  });

  return (
    <section>
      <h1 className="text-2xl font-bold">朋友創作</h1>
      <p className="mt-2 text-[var(--color-text-muted)]">
        朋友們用邀請碼畫下的 2D 像素作品。
      </p>

      <div className="mt-4">
        <Link to="/friends/create">
          <Button variant="secondary">我有邀請碼，我要作畫</Button>
        </Link>
      </div>

      {!isSupabaseConfigured ? (
        <Alert variant="info" className="mt-8">
          後端尚未設定（缺 Supabase 環境變數），暫時無法載入朋友作品。
        </Alert>
      ) : isPending ? (
        <div className="mt-8 flex justify-center">
          <Loading label="載入朋友作品中…" />
        </div>
      ) : isError ? (
        <Alert variant="error" className="mt-8">
          載入失敗：{error.message}
        </Alert>
      ) : (
        <div className="mt-8 ml-[calc(50%_-_50vw)] mr-[calc(50%_-_50vw)] w-screen px-6 sm:px-10">
          <FriendCreationCarousel creations={data} />
        </div>
      )}
    </section>
  );
}
