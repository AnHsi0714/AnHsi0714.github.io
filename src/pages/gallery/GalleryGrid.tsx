import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Link, useLocation } from "react-router-dom";
import artworksDataZh from "../../../content/artworks.json";
import artworksDataEn from "../../../content/artworks.en.json";
import type { Artwork } from "../../types/content";
import sketches, { type SketchInteraction } from "./sketches";
import { useWallAutoScroll } from "./useWallAutoScroll";
import Button from "../../components/Button";
import Chip from "../../components/Chip";
import Input from "../../components/Input";
import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";
import Skeleton from "../../components/Skeleton";
import styles from "./GalleryGrid.module.scss";
import { useLocalized } from "../../lib/localized";
import { useTranslation } from "../../i18n/useTranslation";

// 展牆列數固定，不隨裝置寬度減少：手機上靠 CSS 把列高（連帶每格寬度）縮小
// 來適應版面，而不是少排幾列，維持「同樣塞滿畫面」的密度感。
const ROW_COUNT = 3;

// 畫框裁切區的寬高比：吃 sketches 宣告的 aspect（跟 GalleryDetail 的聚光燈
// 畫布同一個資料來源），沒有互動版本的作品沒有這個資訊，退回正方形猜測。
const getAspect = (artwork: Artwork) => sketches[artwork.slug]?.aspect ?? 1;

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
  // 剛剛看的那件作品 slug，讓展牆回到原本的位置，而不是每次都從頭開始。
  const location = useLocation();
  const focusSlug = (location.state as { focusSlug?: string } | null)
    ?.focusSlug;

  // 縮圖直接連到互動作品（見下方 tile 的 <Link>）；作品名稱另外開說明卡片，
  // 只有寫了介紹的作品名稱才可以點。
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

  const { wallRef, setRowRef, rows, scrollToSlug, wallHandlers, wasDragged } =
    useWallAutoScroll(visibleArtworks, ROW_COUNT);

  // 掛載時如果帶了 focusSlug，直接跳（不做動畫）到那件作品置中：這是「回到
  // 剛剛看的位置」，不是使用者主動捲動，不需要看到移動過程。用 ref 擋著只
  // 執行一次，避免之後篩選/排序造成的重新渲染又把畫面拉走。
  const didFocusRef = useRef(false);
  useEffect(() => {
    if (didFocusRef.current) return;
    didFocusRef.current = true;
    if (focusSlug) scrollToSlug(focusSlug);
  }, [focusSlug, scrollToSlug]);

  // 切換排序時把展牆拉回新順序的第一件作品：如果留在原本的位置，牆面在
  // 腳下重新洗牌、看到的卻常常還是同一件（最舊↔最新切換時尤其明顯），看
  // 起來像按了沒反應。用 ref 記住上一次的排序值、只在「真的切換」時捲動，
  // 首次進場才不會蓋掉 focusSlug「回到剛剛看的那件」的定位。
  const prevSortOrder = useRef(sortOrder);
  useEffect(() => {
    if (prevSortOrder.current === sortOrder) return;
    prevSortOrder.current = sortOrder;
    const firstSlug = rows[0]?.[0]?.artwork.slug;
    if (firstSlug) scrollToSlug(firstSlug);
  }, [sortOrder, rows, scrollToSlug]);

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
                {allTags.map((tag) => (
                  <Chip
                    key={tag}
                    clickable
                    selected={selectedTags.includes(tag)}
                    onClick={() => toggleTag(tag)}
                  >
                    {TAG_LABELS[tag]}
                  </Chip>
                ))}
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
        <div ref={wallRef} className={styles.wall} {...wallHandlers}>
          {rows.map((rowSlots, rowIndex) => (
            <div
              key={rowIndex}
              ref={setRowRef(rowIndex)}
              className={styles.wallRow}
              data-row={rowIndex}
            >
              {rowSlots.map((slot) => (
                <div
                  key={slot.artwork.slug}
                  data-slug={slot.artwork.slug}
                  className={styles.tileGroup}
                >
                  <Link
                    to={`/gallery/${slot.artwork.slug}`}
                    className={styles.tile}
                    onClick={(event) => {
                      // 拖曳結束時放開的那一下也會觸發 click，這裡擋掉，
                      // 避免拖著展牆卻誤跳轉。
                      if (wasDragged()) event.preventDefault();
                    }}
                  >
                    <PosterImage
                      src={slot.imageSrc}
                      alt={slot.artwork.title}
                      aspect={getAspect(slot.artwork)}
                    />
                  </Link>
                  {slot.artwork.description ? (
                    <button
                      type="button"
                      className={`${styles.tileName} ${styles.tileNameClickable}`}
                      onClick={() => setIntroSlug(slot.artwork.slug)}
                    >
                      {slot.artwork.title}
                    </button>
                  ) : (
                    <span className={styles.tileName}>{slot.artwork.title}</span>
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
