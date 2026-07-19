import { useEffect, useMemo, useRef, useState } from "react";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { Link, useLocation } from "react-router-dom";
import artworksDataZh from "../../../content/artworks.json";
import artworksDataEn from "../../../content/artworks.en.json";
import type { Artwork } from "../../types/content";
import sketches, { type SketchInteraction } from "./sketches";
import Button from "../../components/Button";
import Input from "../../components/Input";
import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";
import styles from "./GalleryGrid.module.scss";
import { useLocalized } from "../../lib/localized";
import { useTranslation } from "../../i18n/useTranslation";

// 篩選用的作品標籤：有互動 sketch 的吃它在 sketches/index.ts 宣告的互動類型，
// 還沒移植的作品歸為「靜態展示」。
type ArtworkTag = SketchInteraction | "static";

const artworkTags = (artwork: Artwork): ArtworkTag[] =>
  sketches[artwork.slug]?.interactions ?? ["static"];

// artworks.json 的日期是 YYMMDD 六碼，轉成 ISO 才能跟 <input type="date"> 的值比較。
const toISODate = (d: string) =>
  `20${d.slice(0, 2)}-${d.slice(2, 4)}-${d.slice(4, 6)}`;

type SortOrder = "newest" | "oldest";

export default function GalleryGrid() {
  const { t } = useTranslation();
  const artworks = useLocalized(artworksDataZh, artworksDataEn) as Artwork[];

  const TAG_LABELS = t.gallery.tags;
  // 只列出實際有作品的標籤，順序照 TAG_LABELS 的宣告順序。
  const allTags = (Object.keys(TAG_LABELS) as ArtworkTag[]).filter((tag) =>
    artworks.some((artwork) => artworkTags(artwork).includes(tag)),
  );

  // 從作品詳細頁按「回畫廊」回來時，GalleryDetail.tsx 會透過 Link state 帶上
  // 剛剛看的那件作品 slug，讓展場捲回原本的位置，而不是每次都回到第一件。
  const location = useLocation();
  const focusSlug = (location.state as { focusSlug?: string } | null)
    ?.focusSlug;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeSlug, setActiveSlug] = useState<string | undefined>(
    focusSlug ?? artworks[0]?.slug,
  );
  // 手機版展牆改直向捲動（見 GalleryGrid.module.scss 的手機 media query），
  // 這裡的閾值要跟 SCSS 那邊的 640px 對齊，捲動軸向的 JS 邏輯才會一致。
  const isMobile = useMediaQuery("(max-width: 640px)");

  // 展牆名牌點開的「美術館說明牌」：記住目前打開哪件作品的介紹
  const [introSlug, setIntroSlug] = useState<string | null>(null);
  const introArtwork = artworks.find((a) => a.slug === introSlug);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [titleQuery, setTitleQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<ArtworkTag[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  // 預設「最久」：維持展牆原本從最早走到最新的動線。
  const [sortOrder, setSortOrder] = useState<SortOrder>("oldest");

  useEffect(() => {
    if (!isFilterOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFilterOpen]);

  const toggleTag = (tag: ArtworkTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    );
  };

  const activeFilterCount =
    (titleQuery ? 1 : 0) +
    (selectedTags.length > 0 ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0);

  const visibleArtworks = useMemo(() => {
    return artworks
      .filter((artwork) => {
        if (
          titleQuery &&
          !artwork.title.toLowerCase().includes(titleQuery.trim().toLowerCase())
        ) {
          return false;
        }
        if (
          selectedTags.length > 0 &&
          !artworkTags(artwork).some((tag) => selectedTags.includes(tag))
        ) {
          return false;
        }
        const isoDate = toISODate(artwork.date);
        if (dateFrom && isoDate < dateFrom) return false;
        if (dateTo && isoDate > dateTo) return false;
        return true;
      })
      .sort((a, b) =>
        sortOrder === "newest"
          ? b.date.localeCompare(a.date)
          : a.date.localeCompare(b.date),
      );
  }, [artworks, titleQuery, selectedTags, dateFrom, dateTo, sortOrder]);

  // 每次進場隨機挑一張截圖，呼應生成式作品「每次執行都長得不一樣」
  const posters = useMemo(
    () =>
      Object.fromEntries(
        artworks.map((a) => [
          a.slug,
          a.images[Math.floor(Math.random() * a.images.length)],
        ]),
      ),
    [artworks],
  );

  // 掛載時如果帶了 focusSlug，直接跳（不要動畫捲動）到那件作品置中，
  // immediately 而非 smooth：這是「回到剛剛看的位置」，不是使用者主動捲動，
  // 不需要看到捲動過程。
  useEffect(() => {
    if (!focusSlug) return;
    const el = scrollerRef.current;
    if (!el) return;
    const item = el.querySelector<HTMLElement>(`[data-slug="${focusSlug}"]`);
    item?.scrollIntoView(
      isMobile
        ? { behavior: "instant", block: "center", inline: "nearest" }
        : { behavior: "instant", inline: "center", block: "nearest" },
    );
  }, [focusSlug, isMobile]);

  // 切換排序時把展牆直接拉回新順序的第一件作品：如果留在原本的捲動位置，
  // 牆面在腳下重新洗牌、置中的卻常常還是同一件（最舊↔最新切換時尤其明顯，
  // 停在中段的作品換個方向排還是在中段），看起來像按了沒反應。用 ref 記住
  // 上一次的排序值、只在「真的切換」時捲動，首次進場才不會蓋掉 focusSlug
  // 「回到剛剛看的那件」的定位。
  const prevSortOrder = useRef(sortOrder);
  useEffect(() => {
    if (prevSortOrder.current === sortOrder) return;
    prevSortOrder.current = sortOrder;
    const el = scrollerRef.current;
    if (!el) return;
    const first = el.querySelector<HTMLElement>("[data-slug]");
    first?.scrollIntoView(
      isMobile
        ? { behavior: "instant", block: "center", inline: "nearest" }
        : { behavior: "instant", inline: "center", block: "nearest" },
    );
  }, [sortOrder, isMobile]);

  // 滾輪垂直捲動轉成展牆的橫向移動（React 的 onWheel 是 passive，擋不了預設捲動，
  // 所以自己掛非 passive listener）。邊界不用手動判斷，scrollLeft 賦值超出範圍時
  // 瀏覽器會自動夾在 [0, scrollWidth - clientWidth] 之間。手機版展牆改直向捲動，
  // 滾輪本來就該正常捲動，不用轉軸。
  // 依賴 visibleArtworks：篩到空集合時 scroller 會整個卸載、再出現時是新的
  // DOM 節點，listener 要重新掛。
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || isMobile) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
      el.scrollLeft += e.deltaY;
      e.preventDefault();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [visibleArtworks, isMobile]);

  // 偵測誰在展牆中央：每次捲動都算出「哪一件作品的中心點離展牆中心最近」，
  // 直接點亮那件——用重疊區間判斷（IntersectionObserver + threshold）在捲動
  // 途中一有重疊就會提早點亮下一件，還沒真正置中（甚至還會被 scroll-snap
  // 拉回去）就先亮了，感覺判斷太快；改成距離最近者才是正解，且只反映當下
  // 最接近中心的那件，不會提早跳。
  // 依賴 visibleArtworks：篩選、排序後展位增減，得重新抓一次 [data-slug] 清單。
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>("[data-slug]"));
    let raf = 0;
    const updateActive = () => {
      const rootRect = el.getBoundingClientRect();
      const rootCenter = isMobile
        ? rootRect.top + rootRect.height / 2
        : rootRect.left + rootRect.width / 2;
      let closest: HTMLElement | undefined;
      let minDist = Infinity;
      for (const item of items) {
        const rect = item.getBoundingClientRect();
        const itemCenter = isMobile
          ? rect.top + rect.height / 2
          : rect.left + rect.width / 2;
        const dist = Math.abs(itemCenter - rootCenter);
        if (dist < minDist) {
          minDist = dist;
          closest = item;
        }
      }
      if (closest) setActiveSlug(closest.dataset.slug);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateActive);
    };
    updateActive();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [visibleArtworks, isMobile]);

  return (
    <section className={styles.room}>
      <div className={styles.header}>
        <h1>{t.gallery.title}</h1>
        <p>{t.gallery.subtitle}</p>

        <div className="relative mt-4 inline-block" ref={filterRef}>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setIsFilterOpen((prev) => !prev)}
          >
            {t.common.filterSort}{activeFilterCount > 0 ? `（${activeFilterCount}）` : ""}
          </Button>

          {isFilterOpen && (
            <div className="absolute left-0 top-full z-20 mt-2 w-[min(32rem,90vw)] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4 shadow-lg">
              <div className="flex flex-wrap items-end gap-4">
                <Input
                  label={t.common.searchTitle}
                  placeholder={t.common.titleKeywordPlaceholder}
                  value={titleQuery}
                  onChange={(event) => setTitleQuery(event.target.value)}
                  className="w-40"
                />
                <Input
                  label={t.common.startDate}
                  type="date"
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                />
                <Input
                  label={t.common.endDate}
                  type="date"
                  value={dateTo}
                  onChange={(event) => setDateTo(event.target.value)}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {allTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => toggleTag(tag)}
                      className={[
                        "rounded-full border px-3 py-1 text-sm transition-colors",
                        isSelected
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-text)]"
                          : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)]",
                      ].join(" ")}
                    >
                      {TAG_LABELS[tag]}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm font-medium text-[var(--color-text)]">
                  {t.common.sort}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant={sortOrder === "oldest" ? "primary" : "secondary"}
                  onClick={() => setSortOrder("oldest")}
                >
                  {t.common.oldest}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={sortOrder === "newest" ? "primary" : "secondary"}
                  onClick={() => setSortOrder("newest")}
                >
                  {t.common.newest}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {visibleArtworks.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-8">
          <EmptyState
            title={t.gallery.noMatch}
            description={t.gallery.tryAdjustFilter}
          />
        </div>
      ) : (
        <div ref={scrollerRef} className={styles.scroller}>
          {visibleArtworks.map((artwork) => (
            <div
              key={artwork.slug}
              data-slug={artwork.slug}
              className={`${styles.exhibit} ${activeSlug === artwork.slug ? styles.active : ""}`}
            >
              <div className={styles.lamp}>
                <div className={styles.cord} />
                <div className={styles.shade} />
                <div className={styles.bulb} />
              </div>
              <div className={styles.beam} />
              <Link to={`/gallery/${artwork.slug}`} className={styles.frame}>
                <img
                  src={posters[artwork.slug]}
                  alt={artwork.title}
                  loading="lazy"
                />
              </Link>
              {artwork.description ? (
                // 有寫介紹的作品，名牌本身變成按鈕，點開「美術館說明牌」彈窗
                <button
                  type="button"
                  onClick={() => setIntroSlug(artwork.slug)}
                  className={`${styles.placard} ${styles.placardClickable}`}
                >
                  <span className={styles.placardTitle}>{artwork.title}</span>
                  <span className={styles.placardMeta}>{artwork.date}</span>
                </button>
              ) : (
                <div className={styles.placard}>
                  <span className={styles.placardTitle}>{artwork.title}</span>
                  <span className={styles.placardMeta}>{artwork.date}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {introArtwork && (
        <Modal
          open
          placard
          onClose={() => setIntroSlug(null)}
          ariaLabel={introArtwork.title}
          backdropClassName="p-6"
          panelClassName="w-full max-w-md max-h-full overflow-y-auto"
        >
          <div className="px-6 pb-6 pt-5">
            <p className="text-lg font-semibold">{introArtwork.title}</p>
            <p className="mt-0.5 text-xs tracking-widest text-[var(--color-text-muted)]">
              {introArtwork.date} · p5.js
            </p>
            <hr className="my-3 border-[var(--color-border)]" />
            <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
              {introArtwork.description}
            </p>
          </div>
        </Modal>
      )}
    </section>
  );
}
