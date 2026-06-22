import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";
import EmptyState from "../../components/EmptyState";
import type { Book } from "../../types/content";
import styles from "./Books.module.scss";

// 排版用範例資料，之後改為讀取 content/books/*.md（frontmatter + 心得正文，見 docs/ARCHITECTURE.md §3）
const books: Book[] = [
  {
    slug: "atomic-habits",
    title: "原子習慣",
    author: "James Clear",
    rating: 5,
    finishedOn: "2026-03-12",
    categories: ["自我成長", "心理學"],
    excerpt:
      "範例心得，之後替換成你的真實讀後感。微小習慣的複利效應，重新理解「身份認同」對行為改變的影響。",
  },
  {
    slug: "sapiens",
    title: "人類大歷史",
    author: "Yuval Noah Harari",
    rating: 4,
    finishedOn: "2026-02-05",
    categories: ["歷史", "社會科學"],
    excerpt:
      "範例心得，之後替換成你的真實讀後感。從認知革命到科學革命，重新看待「故事」如何凝聚大規模合作。",
  },
  {
    slug: "thinking-fast-and-slow",
    title: "思考，快與慢",
    author: "Daniel Kahneman",
    rating: 4,
    finishedOn: "2026-01-18",
    categories: ["心理學", "科普"],
    excerpt:
      "範例心得，之後替換成你的真實讀後感。系統一與系統二的交互，理解直覺判斷常見的偏誤來源。",
  },
  {
    slug: "project-hail-mary",
    title: "挑戰火星任務",
    author: "Andy Weir",
    rating: 5,
    finishedOn: "2025-11-22",
    categories: ["科幻小說"],
    excerpt:
      "範例心得，之後替換成你的真實讀後感。獨自一人的太空求生，節奏緊湊又不失幽默感。",
  },
  {
    slug: "the-design-of-everyday-things",
    title: "設計的心理學",
    author: "Don Norman",
    rating: 3,
    finishedOn: "2025-09-08",
    categories: ["設計", "心理學"],
    excerpt:
      "範例心得，之後替換成你的真實讀後感。從門把到介面，理解好設計如何讓使用方式不言自明。",
  },
  {
    slug: "educated",
    title: "Educated：不受教育的人生",
    author: "Tara Westover",
    rating: 4,
    finishedOn: "2025-06-30",
    categories: ["自傳", "社會科學"],
    excerpt:
      "範例心得，之後替換成你的真實讀後感。一段從封閉成長環境走向知識自由的真實故事。",
  },
];

const allCategories = Array.from(
  new Set(books.flatMap((book) => book.categories)),
);

type SortOrder = "newest" | "oldest";

function Stars({ rating }: { rating: number }) {
  return (
    <span aria-label={`評分 ${rating} / 5`} className="text-amber-500">
      {"★".repeat(rating)}
      <span className="text-neutral-300">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

function BookCard({ book }: { book: Book }) {
  return (
    <Card className="w-48 sm:w-56">
      {book.coverUrl ? (
        <img
          src={book.coverUrl}
          alt={book.title}
          className="aspect-[3/4] w-full rounded-md object-cover"
        />
      ) : (
        <div className="flex aspect-[3/4] w-full items-center justify-center rounded-md bg-neutral-100 text-3xl font-semibold text-neutral-300">
          {book.title.slice(0, 1)}
        </div>
      )}
      <p className="mt-3 font-semibold">{book.title}</p>
      <p className="text-sm text-neutral-500">{book.author}</p>
      <div className="mt-1 flex items-center justify-between">
        <Stars rating={book.rating} />
        <span className="text-xs text-neutral-400">{book.finishedOn}</span>
      </div>
      <p className="mt-2 text-sm text-neutral-600 line-clamp-3">
        {book.excerpt}
      </p>
      <div className="mt-2 flex flex-wrap gap-1">
        {book.categories.map((category) => (
          <span
            key={category}
            className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500"
          >
            {category}
          </span>
        ))}
      </div>
    </Card>
  );
}

function BookCarousel({ books: items }: { books: Book[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [focus, setFocus] = useState<{ scale: number; brightness: number }[]>(
    [],
  );
  const [scrollBar, setScrollBar] = useState({ widthPct: 100, leftPct: 0 });
  const [spacerWidth, setSpacerWidth] = useState(0);

  // 兩端留白，確保第一本／最後一本也能被捲到正中間（見下方 spacer 元素）
  const GAP_PX = 32;

  // 熱路徑：捲動中每一格都會跑，只算「誰最靠近中間」+ 捲軸把手位置，不量測尺寸
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
        // 只有正中間那本放大一點，其他維持原尺寸；亮度則只有正中間是亮的
        scale: index === closestIndex ? 1.08 : 1,
        brightness: index === closestIndex ? 1 : 0.4,
      })),
    );
    setActiveIndex(closestIndex);

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const widthPct = Math.min((clientWidth / scrollWidth) * 100, 100);
    const maxScroll = scrollWidth - clientWidth;
    const leftPct =
      maxScroll > 0 ? (scrollLeft / maxScroll) * (100 - widthPct) : 0;
    setScrollBar({ widthPct, leftPct });
  }, []);

  // 冷路徑：只有容器尺寸／書單變動時才需要重新量測 spacer 寬度
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
  }, [items, measureSpacer]);

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

  if (items.length === 0) {
    return (
      <EmptyState title="沒有符合條件的書" description="試試調整篩選條件。" />
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="上一本"
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
        {items.map((book, index) => (
          <div
            key={book.slug}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            role="button"
            tabIndex={0}
            onClick={() => centerItem(index)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                centerItem(index);
              }
            }}
            className="shrink-0 cursor-pointer snap-center will-change-transform transition-transform duration-150 ease-out"
            style={{
              transform: `scale(${focus[index]?.scale ?? 1})`,
              filter: `brightness(${focus[index]?.brightness ?? 1})`,
            }}
          >
            <BookCard book={book} />
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
        aria-label="下一本"
        disabled={activeIndex === items.length - 1}
        onClick={() => centerItem(activeIndex + 1)}
        className="absolute right-0 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-2xl shadow-md hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-30"
      >
        ›
      </button>

      <div className="relative mt-2 h-1.5 rounded-full bg-neutral-200">
        <div
          className="absolute top-0 h-full rounded-full bg-neutral-900"
          style={{
            width: `${scrollBar.widthPct}%`,
            left: `${scrollBar.leftPct}%`,
          }}
        />
      </div>
    </div>
  );
}

export default function Books() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [titleQuery, setTitleQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

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

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category],
    );
  };

  const activeFilterCount =
    (titleQuery ? 1 : 0) +
    (selectedCategories.length > 0 ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0);

  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        if (
          titleQuery &&
          !book.title.toLowerCase().includes(titleQuery.trim().toLowerCase())
        ) {
          return false;
        }
        if (
          selectedCategories.length > 0 &&
          !book.categories.some((category) =>
            selectedCategories.includes(category),
          )
        ) {
          return false;
        }
        if (minRating > 0 && book.rating < minRating) return false;
        if (dateFrom && book.finishedOn < dateFrom) return false;
        if (dateTo && book.finishedOn > dateTo) return false;
        return true;
      })
      .sort((a, b) =>
        sortOrder === "newest"
          ? b.finishedOn.localeCompare(a.finishedOn)
          : a.finishedOn.localeCompare(b.finishedOn),
      );
  }, [titleQuery, selectedCategories, minRating, dateFrom, dateTo, sortOrder]);

  return (
    <section>
      <h1 className="text-2xl font-bold">讀書</h1>
      <p className="mt-2 text-neutral-600">讀過的書與簡短心得。</p>

      <div className="relative mt-6 inline-block" ref={filterRef}>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setIsFilterOpen((prev) => !prev)}
        >
          篩選 / 排序{activeFilterCount > 0 ? `（${activeFilterCount}）` : ""}
        </Button>

        {isFilterOpen && (
          <div className="absolute left-0 top-full z-20 mt-2 w-[min(36rem,90vw)] rounded-lg border border-neutral-200 bg-white p-4 shadow-lg">
            <div className="flex flex-wrap items-end gap-4">
              <Input
                label="搜尋書名"
                placeholder="輸入書名關鍵字"
                value={titleQuery}
                onChange={(event) => setTitleQuery(event.target.value)}
                className="w-40"
              />

              <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
                最低評分
                <select
                  value={minRating}
                  onChange={(event) => setMinRating(Number(event.target.value))}
                  className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-normal text-neutral-900"
                >
                  <option value={0}>不限</option>
                  <option value={5}>5★</option>
                  <option value={4}>4★ 以上</option>
                  <option value={3}>3★ 以上</option>
                  <option value={2}>2★ 以上</option>
                  <option value={1}>1★ 以上</option>
                </select>
              </label>

              <Input
                label="起始日期"
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
              />
              <Input
                label="結束日期"
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {allCategories.map((category) => {
                const isSelected = selectedCategories.includes(category);
                return (
                  <button
                    key={category}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => toggleCategory(category)}
                    className={[
                      "rounded-full border px-3 py-1 text-sm transition-colors",
                      isSelected
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-300 text-neutral-600 hover:border-neutral-400",
                    ].join(" ")}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm font-medium text-neutral-700">排序</span>
              <Button
                type="button"
                size="sm"
                variant={sortOrder === "newest" ? "primary" : "secondary"}
                onClick={() => setSortOrder("newest")}
              >
                最新
              </Button>
              <Button
                type="button"
                size="sm"
                variant={sortOrder === "oldest" ? "primary" : "secondary"}
                onClick={() => setSortOrder("oldest")}
              >
                最久
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 ml-[calc(50%_-_50vw)] mr-[calc(50%_-_50vw)] w-screen px-6 sm:px-10">
        <BookCarousel books={filteredBooks} />
      </div>
    </section>
  );
}
