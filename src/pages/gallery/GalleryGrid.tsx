import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Link, useLocation } from "react-router-dom";
import artworksDataZh from "../../../content/artworks.json";
import artworksDataEn from "../../../content/artworks.en.json";
import type { Artwork } from "../../types/content";
import sketches, { type SketchInteraction } from "./sketches";
import Button from "../../components/Button";
import Input from "../../components/Input";
import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";
import Skeleton from "../../components/Skeleton";
import styles from "./GalleryGrid.module.scss";
import { useLocalized } from "../../lib/localized";
import { useTranslation } from "../../i18n/useTranslation";
import { useMediaQuery } from "../../hooks/useMediaQuery";

// 畫框裁切區的寬高比：吃 sketches 宣告的 aspect（跟 GalleryDetail 的聚光燈
// 畫布同一個資料來源），沒有互動版本的作品沒有這個資訊，退回正方形猜測。
const getAspect = (artwork: Artwork) => sketches[artwork.slug]?.aspect ?? 1;

// 每件作品要排進哪一欄：貪心地塞進目前「估計高度」最短的那一欄，用同一個
// aspect 換算「欄寬固定時這張圖大概多高」——寬幅作品估出來矮、方形/直式
// 估出來高，藉此讓各欄高度盡量平均，天然長出交錯感。
function distributeColumns(items: Artwork[], columnCount: number): Artwork[][] {
  const columns: Artwork[][] = Array.from({ length: columnCount }, () => []);
  const heights = new Array(columnCount).fill(0);

  for (const artwork of items) {
    let shortest = 0;
    for (let i = 1; i < columnCount; i++) {
      if (heights[i] < heights[shortest]) shortest = i;
    }
    columns[shortest].push(artwork);
    heights[shortest] += 1 / getAspect(artwork);
  }

  return columns;
}

// 篩選用的作品標籤：有互動 sketch 的吃它在 sketches/index.ts 宣告的互動類型，
// 還沒移植的作品歸為「靜態展示」。drag-draw（拖曳作畫）跟 drag-physics（物理
// 拖曳）在篩選這裡合併成同一個 drag 標籤——篩選只需要「有沒有拖曳互動」這麼
// 粗的分類；GalleryDetail.tsx 的操作提示繼續讀 sketches 原始的 interactions
// 陣列，不經過這層合併，兩種拖曳的說明文字不受影響。
type ArtworkTag = Exclude<SketchInteraction, "drag-draw" | "drag-physics"> | "drag" | "static";

const toFilterTag = (interaction: SketchInteraction): ArtworkTag =>
  interaction === "drag-draw" || interaction === "drag-physics" ? "drag" : interaction;

const artworkTags = (artwork: Artwork): ArtworkTag[] => {
  const interactions = sketches[artwork.slug]?.interactions;
  if (!interactions) return ["static"];
  return Array.from(new Set(interactions.map(toFilterTag)));
};

// artworks.json 的日期是 YYMMDD 六碼，轉成 ISO 才能跟 <input type="date"> 的值比較。
const toISODate = (d: string) =>
  `20${d.slice(0, 2)}-${d.slice(2, 4)}-${d.slice(4, 6)}`;

type SortOrder = "newest" | "oldest";

// 抽成獨立元件才能讓每張縮圖各自有一份 loaded state：GalleryGrid 本體是把
// visibleArtworks 直接 map 成 JSX、不是逐一掛載的元件實例，state 沒地方掛。
function PosterImage({
  src,
  alt,
  aspect,
}: {
  src: string;
  alt: string;
  // 骨架佔位用的猜測值（sketch 宣告的畫布比例）。有些作品（例如稜鏡）同時
  // 混了寬螢幕跟正方形兩種截圖，單一猜測值不可能兩種都準，圖片真正載完後
  // 會用 naturalWidth/naturalHeight 算出來的實際比例覆蓋掉這個猜測。
  aspect: number;
}) {
  const [loaded, setLoaded] = useState(false);
  const [naturalAspect, setNaturalAspect] = useState<number | null>(null);

  return (
    <span
      className={styles.imageClip}
      style={{ "--clip-aspect": naturalAspect ?? aspect } as CSSProperties}
    >
      {!loaded && <Skeleton className={styles.skeleton} />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={!loaded ? styles.loading : undefined}
        onLoad={(event) => {
          const img = event.currentTarget;
          setNaturalAspect(img.naturalWidth / img.naturalHeight);
          setLoaded(true);
        }}
      />
    </span>
  );
}

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
  const wallRef = useRef<HTMLDivElement>(null);

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

  // 每次進場隨機挑一張截圖，呼應生成式作品「每次執行都長得不一樣」。用
  // useState 的 lazy initializer 只算一次，不能用 useMemo(deps: [artworks])——
  // useLocalized 切語言時回傳的是 zh/en 兩個不同陣列參照，即使 images 內容
  // 相同，參照一變 useMemo 就會重算、重新抽一張圖，等於「切語言＝換圖」。
  // 直接吃 artworksDataZh 當來源（images 欄位本來就不分語言），跟 language
  // 完全脫鉤。
  const [posters] = useState(() =>
    Object.fromEntries(
      (artworksDataZh as Artwork[]).map((a) => [
        a.slug,
        a.images[Math.floor(Math.random() * a.images.length)],
      ]),
    ),
  );

  // 欄數跟著版面寬度切換，門檻要跟 GalleryGrid.module.scss 的 .wall 斷點對齊。
  const isMedium = useMediaQuery("(max-width: 900px)");
  const isNarrow = useMediaQuery("(max-width: 560px)");
  const columnCount = isNarrow ? 1 : isMedium ? 2 : 3;

  const columns = useMemo(
    () => distributeColumns(visibleArtworks, columnCount),
    [visibleArtworks, columnCount],
  );

  // 掛載時如果帶了 focusSlug，直接跳（不要動畫捲動）到那件作品置中，
  // immediately 而非 smooth：這是「回到剛剛看的位置」，不是使用者主動捲動，
  // 不需要看到捲動過程。
  useEffect(() => {
    if (!focusSlug) return;
    const el = wallRef.current;
    if (!el) return;
    const item = el.querySelector<HTMLElement>(`[data-slug="${focusSlug}"]`);
    item?.scrollIntoView({ behavior: "instant", block: "center" });
  }, [focusSlug]);

  // 切換排序時把展牆直接拉回新順序的第一件作品：如果留在原本的捲動位置，
  // 牆面在腳下重新洗牌、看到的卻常常還是同一件（最舊↔最新切換時尤其明顯），
  // 看起來像按了沒反應。用 ref 記住上一次的排序值、只在「真的切換」時捲動，
  // 首次進場才不會蓋掉 focusSlug「回到剛剛看的那件」的定位。
  const prevSortOrder = useRef(sortOrder);
  useEffect(() => {
    if (prevSortOrder.current === sortOrder) return;
    prevSortOrder.current = sortOrder;
    const el = wallRef.current;
    if (!el) return;
    const first = el.querySelector<HTMLElement>("[data-slug]");
    first?.scrollIntoView({ behavior: "instant", block: "start" });
  }, [sortOrder]);

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
        <div ref={wallRef} className={styles.wall}>
          {columns.map((column, columnIndex) => (
            <div className={styles.column} key={columnIndex}>
              {column.map((artwork) => (
                <div
                  key={artwork.slug}
                  data-slug={artwork.slug}
                  className={styles.exhibit}
                >
                  <Link to={`/gallery/${artwork.slug}`} className={styles.frame}>
                    <PosterImage
                      src={posters[artwork.slug]}
                      alt={artwork.title}
                      aspect={getAspect(artwork)}
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
