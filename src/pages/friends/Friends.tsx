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
import VoxelPaintedCreature from "../../components/VoxelPaintedCreature";
import { fetchFriendCreations } from "../../lib/friends";
import { isSupabaseConfigured } from "../../lib/supabaseClient";
import type { FriendCreationRow } from "../../types/friends";
import styles from "./Friends.module.scss";

function FriendCreationCard({ creation }: { creation: FriendCreationRow }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  // 只有 3D 卡需要知道自己在不在可視範圍：捲進畫面才掛即時 Three.js 場景，捲出去
  // 就卸載換回佔位——同時存在的 WebGL context 數量只有「畫面上看得到的 3D 卡」
  // 那幾個（遠低於瀏覽器約 8~16 個的上限），繞開「每張 3D 卡都常駐 Canvas」的
  // 成本問題（見 ARCHITECTURE.md §6.1），預渲染縮圖就先不用做。
  // root 用預設的 viewport 就行：被水平捲出輪播容器的卡片會被 overflow 裁掉，
  // 同樣不會和 viewport 相交。
  useEffect(() => {
    if (creation.kind !== "3d") return;
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) =>
      setInView(entry.isIntersecting),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [creation.kind]);

  return (
    <div ref={cardRef}>
      <Card className="w-56 sm:w-64">
        {creation.kind === "2d" ? (
          <PixelCanvas
            data={creation.data}
            className="aspect-square w-full rounded-md bg-[var(--color-surface)]"
          />
        ) : inView ? (
          <VoxelPaintedCreature
            data={creation.data}
            autoRotate
            className="aspect-square w-full rounded-md bg-[var(--color-surface)]"
          />
        ) : (
          // 還沒捲進畫面的 3D 卡先用佔位，進入可視範圍才換成即時渲染
          <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-md bg-[var(--color-surface)]">
            <span className="text-4xl" aria-hidden="true">
              🐾
            </span>
            <span className="text-sm text-[var(--color-text-muted)]">
              3D 怪獸
            </span>
          </div>
        )}
        <p className="mt-3 font-semibold">{creation.nickname}</p>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          {new Date(creation.created_at).toLocaleDateString("zh-TW")}
        </p>
      </Card>
    </div>
  );
}

function FriendCreationCarousel({
  creations,
}: {
  creations: FriendCreationRow[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [focus, setFocus] = useState<{ scale: number; brightness: number }[]>(
    [],
  );

  // 換到別的作品（點擊或捲動）就收起檢視遮罩
  useEffect(() => {
    setShowDetail(false);
  }, [activeIndex]);

  // 遮罩開啟期間：Esc 可關閉、鎖住頁面捲動（同 ExpandableCard 的做法）
  useEffect(() => {
    if (!showDetail) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowDetail(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [showDetail]);

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
        {creations.map((creation, index) => {
          // 3D 一律可放大檢視（拖曳旋轉），2D 只有寫了敘述才有遮罩可看
          const canOpenDetail = creation.kind === "3d" || !!creation.intro;
          return (
            <div
              key={creation.id}
              data-index={index}
              role="button"
              tabIndex={0}
              aria-label={
                index === activeIndex && canOpenDetail
                  ? `${creation.nickname} 的作品，點擊放大查看`
                  : `前往 ${creation.nickname} 的作品`
              }
              // 點還沒置中的作品 → 把它捲到中間；點已置中的作品 → 開啟整頁檢視遮罩
              onClick={() => {
                if (index === activeIndex) {
                  if (canOpenDetail) setShowDetail(true);
                } else {
                  centerItem(index);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (index === activeIndex) {
                    if (canOpenDetail) setShowDetail(true);
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
          );
        })}
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

      {/* 檢視遮罩：2D 是整頁置中的一句話；3D 則放大
          顯示可拖曳旋轉的怪獸（敘述有寫才附在下面）。點任意處或 Esc 關閉。 */}
      {showDetail &&
        activeCreation &&
        (activeCreation.kind === "3d" || activeCreation.intro) &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${activeCreation.nickname} 的作品`}
            onClick={() => setShowDetail(false)}
            className={`${styles.introBackdrop} fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center bg-black/70 px-8 backdrop-blur-sm`}
          >
            {activeCreation.kind === "3d" && (
              // 拖曳旋轉放開時會在這個容器上觸發 click，得擋住冒泡，
              // 不然每轉一下視角就把遮罩關掉；要關就點怪獸外的區域或按 Esc
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex w-full max-w-xl cursor-default flex-col items-center"
              >
                <VoxelPaintedCreature
                  data={activeCreation.data}
                  interactive
                  className="h-[50vh] w-full cursor-grab active:cursor-grabbing"
                />
                <p className="mt-1 text-xs text-white/50">
                  拖曳旋轉視角，滾輪縮放
                </p>
              </div>
            )}
            {activeCreation.intro && (
              <blockquote
                className={`${styles.intro} mt-4 max-w-xl text-center text-2xl leading-relaxed text-white transition-all duration-300 hover:text-amber-300
    hover:scale-105
    hover:-skew-x-12`}
              >
                「{activeCreation.intro}」
              </blockquote>
            )}
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
        朋友們用邀請碼創作的 2D 像素畫與 3D 怪獸。
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
